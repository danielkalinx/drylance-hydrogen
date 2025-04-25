#!/usr/bin/env python3
import json, itertools, sys

# ——— CONFIG ———
JSON_IN           = "metaobjects.json"     # your input file
DEFINITION_HANDLE = "mft_configuration"    # your MetaobjectDefinition.type
# ————————

def extract_ids(edges):
    return [n["node"]["id"] for n in edges]

def main(path):
    d = json.load(open(path))["data"]
    sizes  = extract_ids(d["sizeOptions"]["edges"])
    sides  = extract_ids(d["printedSides"]["edges"])
    hangs  = extract_ids(d["hangloopOptions"]["edges"])
    packs  = extract_ids(d["packagingOptions"]["edges"])

    entries = []
    for i, combo in enumerate(itertools.product(sizes, sides, hangs, packs), start=1):
        alias     = f"conf_{i:03}"
        refs_json = json.dumps(list(combo))
        entries.append(f'''
  {alias}: metaobjectCreate(metaobject: {{
    type: "{DEFINITION_HANDLE}",
    fields: [
      {{ key: "configurations", value: "{refs_json}" }}
    ]
  }}) {{
    metaobject {{ id }}
    userErrors {{ field message }}
  }}''')

    mutation = "mutation BulkCreateConfigurations {" + "\n".join(entries) + "\n}"
    with open("create_configs.graphql", "w") as out:
        out.write(mutation)
    print("Wrote create_configs.graphql")

if __name__=="__main__":
    main(JSON_IN)