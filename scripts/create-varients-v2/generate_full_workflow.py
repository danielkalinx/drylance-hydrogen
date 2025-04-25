#!/usr/bin/env python3
import sys, json, itertools

# ——— CONFIG ———
PRODUCT_ID       = "gid://shopify/Product/15391530385753"
OPTION_ID        = "gid://shopify/ProductOption/17750055289177"
# Metafield for pointing at a configuration metaobject:
METAFIELD_NS        = "custom"
METAFLD_CFG_KEY     = "variations"
METAFLD_CFG_TYPE    = "metaobject_reference"
# Metafield for storing the towel weight:
METAFIELD_WT_KEY    = "metadata_weight"
METAFIELD_WT_TYPE   = "weight"
# ——————————

def extract_ids(edge_list):
    return [n["node"]["id"] for n in edge_list]

def extract_field(node, key):
    for f in node["fields"]:
        if f["key"] == key:
            return f["value"]
    raise KeyError(f"{key} missing in {node['id']}")

def parse_money(s):
    return float(json.loads(s)["amount"])

def parse_weight(s):
    j = json.loads(s)
    return j["value"], j["unit"]

def make_config_mutation(data):
    sizes  = extract_ids(data["sizeOptions"]["edges"])
    sides  = extract_ids(data["printedSides"]["edges"])
    hangs  = extract_ids(data["hangloopOptions"]["edges"])
    packs  = extract_ids(data["packagingOptions"]["edges"])

    # collapse hangs to two
    # (price 0.0 vs >0.0)
    def price_of(id_):
        node = next(n for n in data["hangloopOptions"]["edges"] if n["node"]["id"]==id_)["node"]
        return parse_money(extract_field(node,"price"))
    zero = [h for h in hangs if price_of(h)==0.0]
    one  = [h for h in hangs if price_of(h)>0.0]
    hangs = zero + one

    aliases=[]
    for i, combo in enumerate(itertools.product(sizes, sides, hangs, packs), start=1):
        alias = f"conf_{i:03}"
        refs  = json.dumps(list(combo))
        aliases.append(f'''
  {alias}: metaobjectCreate(metaobject: {{
    type: "mft_configuration",
    fields: [
      {{ key: "configurations", value: "{refs}" }}
    ]
  }}) {{
    metaobject {{ id }}
    userErrors {{ field message }}
  }}''')

    print("mutation BulkCreateConfigurations {")
    print("\n".join(aliases))
    print("}")

def make_variant_mutation(data, configs_resp):
    # 1) reconstruct the same combo order:
    sizes  = [n["node"] for n in data["sizeOptions"]["edges"]]
    sides  = [n["node"] for n in data["printedSides"]["edges"]]
    hangsA = [n["node"] for n in data["hangloopOptions"]["edges"]]
    packs  = [n["node"] for n in data["packagingOptions"]["edges"]]

    # collapse hangs:
    no_hang = next(n for n in hangsA if parse_money(extract_field(n,"price"))==0.0)
    yes_hang= next(n for n in hangsA if parse_money(extract_field(n,"price"))>0.0)
    hangs    = [no_hang, yes_hang]

    # 2) pull the created config IDs by alias:
    created = configs_resp["data"]
    config_ids = [ created[f"conf_{i:03}"]["metaobject"]["id"]
                   for i in range(1, len(sizes)*len(sides)*len(hangs)*len(packs) + 1) ]

    # 3) build all variants in same order:
    variants=[]
    idx=0
    for size, side, hang, pack in itertools.product(sizes, sides, hangs, packs):
        base_price = parse_money(extract_field(size,"price"))
        side_price = parse_money(extract_field(side,"price"))
        hang_price = parse_money(extract_field(hang,"price"))
        pack_price = parse_money(extract_field(pack,"price"))
        total = round(base_price+side_price+hang_price+pack_price,2)

        wt_val, wt_unit = parse_weight(extract_field(size,"weight"))
        hang_lbl = "Hangloop" if hang_price>0 else "No Hangloop"
        title = " | ".join([
          extract_field(size,"name"),
          extract_field(side,"side"),
          hang_lbl,
          extract_field(pack,"packaging")
        ])

        variants.append({
          "price": total,
          "optionValues": [{
             "optionId": OPTION_ID,
             "name": title
          }],
          "metafields":[
            {
              "namespace": METAFIELD_NS,
              "key": METAFL_CFG_KEY,
              "type": METAFL_CFG_TYPE,
              "value": config_ids[idx]
            },
            {
              "namespace": METAFIELD_NS,
              "key": METAFIELD_WT_KEY,
              "type": METAFIELD_WT_TYPE,
              "value": json.dumps({ "value": wt_val, "unit": wt_unit })
            }
          ]
        })
        idx += 1

    # 4) print the bulk-create mutation + variables
    print("""
mutation ProductVariantsCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
  productVariantsBulkCreate(productId: $productId, variants: $variants) {
    productVariants { id title selectedOptions { name value } metafields(first:5){ edges{ node{namespace key value}}}}
    userErrors { field message }
  }
}
""".strip())
    print()
    print(json.dumps({
      "productId": PRODUCT_ID,
      "variants": variants
    }, indent=2))


def main():
    if not (2 <= len(sys.argv) <= 3):
        print("Usage:\n"
              "  # Step 1: make configs\n"
              "  python generate_full_workflow.py metaobjects.json\n\n"
              "  # Step 2: make variants\n"
              "  python generate_full_workflow.py metaobjects.json configs.json",
              file=sys.stderr)
        sys.exit(1)

    meta = json.load(open(sys.argv[1]))["data"]

    if len(sys.argv) == 2:
        # only metaobjects.json → print config mutation
        make_config_mutation(meta)
    else:
        # metaobjects + configs response → print variant mutation
        configs = json.load(open(sys.argv[2]))
        make_variant_mutation(meta, configs)

if __name__=="__main__":
    main()