#!/usr/bin/env python3
import json
import os
import re

# Universal GraphQL mutation filename
gql_filename = "create_metaobject.graphql"
# Directory for per-entry variables JSON
var_dir = "variables"
# Metaobject type for configuration_value
TYPE_NAME = "configuration_value"
# Existing configuration_option metaobject IDs
OPTION_IDS = {
    "towel_size":        "gid://shopify/Metaobject/344660902233",
    "printed_sides":     "gid://shopify/Metaobject/344660803929",
    "hangloop_position": "gid://shopify/Metaobject/344660935001",
    "packaging":         "gid://shopify/Metaobject/344660967769",
}

# Helper to slugify strings for handles
def slugify(s):
    slug = s.lower().replace(' ', '-').replace('×', 'x')
    return re.sub(r'[^a-z0-9\-]', '', slug)

# Build all entries with only non-null fields
def build_entries():
    entries = []

    # Common filter to drop null-valued fields
    def filter_fields(fields):
        return [f for f in fields if f.get('value') is not None]

    # Towel sizes
    for name, price, weight, width, height in [
        ("40 × 80 cm",  "5.80", 120, 40, 80),
        ("40 × 100 cm", "6.20", 160, 40, 100),
        ("50 × 100 cm", "6.60", 200, 50, 100),
        ("75 × 135 cm", "10.20", 300, 75, 135),
        ("80 × 160 cm", "13.20", 470, 80, 160),
        ("80 × 180 cm", "13.60", 470, 80, 180),
    ]:
        handle = slugify(name)
        fields = [
            {"key": "name",      "value": name},
            {"key": "price",     "value": json.dumps({"amount": price, "currency_code": "EUR"})},
            {"key": "weight",    "value": json.dumps({"value": weight,  "unit": "GRAMS"})},
            {"key": "width",     "value": json.dumps({"value": width,   "unit": "MILLIMETERS"})},
            {"key": "height",    "value": json.dumps({"value": height,  "unit": "MILLIMETERS"})},
            {"key": "option_id", "value": OPTION_IDS["towel_size"]},
            {"key": "print_sides",       "value": None},
            {"key": "hangloop_position", "value": None},
            {"key": "packaging",         "value": None},
        ]
        entries.append({
            "handle": handle,
            "input": {
                "type": TYPE_NAME,
                "handle": handle,
                "fields": filter_fields(fields)
            }
        })

    # Printed sides
    for name, price, val in [("Front", "0.00", "Front"),
                              ("Both sides", "0.40", "Both sides")]:
        handle = slugify(name)
        fields = [
            {"key": "name",      "value": name},
            {"key": "price",     "value": json.dumps({"amount": price, "currency_code": "EUR"})},
            {"key": "weight",    "value": None},
            {"key": "width",     "value": None},
            {"key": "height",    "value": None},
            {"key": "option_id", "value": OPTION_IDS["printed_sides"]},
            {"key": "print_sides","value": val},
            {"key": "hangloop_position", "value": None},
            {"key": "packaging",         "value": None},
        ]
        entries.append({
            "handle": handle,
            "input": {
                "type": TYPE_NAME,
                "handle": handle,
                "fields": filter_fields(fields)
            }
        })

    # Hangloop positions
    for pos in ["top-left","top-center","top-right",
                "left-side","right-side",
                "bottom-left","bottom-center","bottom-right",
                "none"]:
        handle = slugify(pos)
        name = pos.replace('-', ' ').title()
        price = "0.20" if pos != "none" else "0.00"
        fields = [
            {"key": "name",               "value": name},
            {"key": "price",              "value": json.dumps({"amount": price, "currency_code": "EUR"})},
            {"key": "weight",             "value": None},
            {"key": "width",              "value": None},
            {"key": "height",             "value": None},
            {"key": "option_id",          "value": OPTION_IDS["hangloop_position"]},
            {"key": "print_sides",        "value": None},
            {"key": "hangloop_position",  "value": pos},
            {"key": "packaging",          "value": None},
        ]
        entries.append({
            "handle": handle,
            "input": {
                "type": TYPE_NAME,
                "handle": handle,
                "fields": filter_fields(fields)
            }
        })

    # Packaging options
    for name, price, val in [("Mesh Bag", "0.80", "mesh-bag"),
                              ("Textile Bag","1.20","textile-bag"),
                              ("No Bag",     "0.00","none")]:
        handle = slugify(val)
        fields = [
            {"key": "name",      "value": name},
            {"key": "price",     "value": json.dumps({"amount": price, "currency_code": "EUR"})},
            {"key": "weight",    "value": None},
            {"key": "width",     "value": None},
            {"key": "height",    "value": None},
            {"key": "option_id", "value": OPTION_IDS["packaging"]},
            {"key": "print_sides",       "value": None},
            {"key": "hangloop_position", "value": None},
            {"key": "packaging",         "value": val},
        ]
        entries.append({
            "handle": handle,
            "input": {
                "type": TYPE_NAME,
                "handle": handle,
                "fields": filter_fields(fields)
            }
        })

    return entries

# Ensure output directory exists
os.makedirs(var_dir, exist_ok=True)

# Write universal GraphQL mutation
graphql = '''
mutation CreateMetaobject($input: MetaobjectCreateInput!) {
  metaobjectCreate(metaobject: $input) {
    metaobject { id displayName }
    userErrors { field message }
  }
}
'''.strip()
with open(gql_filename, 'w') as f:
    f.write(graphql + "\n")
print(f"Wrote universal mutation ➞ {gql_filename}")

# Generate per-entry variable JSON files
entries = build_entries()
for e in entries:
    path = os.path.join(var_dir, f"{e['handle']}.json")
    with open(path, 'w') as f:
        json.dump({"input": e['input']}, f, indent=2)
    print(f"Written variables ➞ {path}")
print(f"Done: {len(entries)} files in '{var_dir}/'")