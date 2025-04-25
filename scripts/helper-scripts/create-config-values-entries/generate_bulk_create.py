#!/usr/bin/env python3
import json
import re

# === Configuration ===
# The metaobject definition type handle:
METAOBJECT_TYPE = "configuration_value"

# The four configuration_option metaobject IDs you provided:
OPTION_IDS = {
    "Towel Size":           "gid://shopify/Metaobject/344660902233",
    "Printed Sides":        "gid://shopify/Metaobject/344660803929",
    "Hangloop Position":    "gid://shopify/Metaobject/344660935001",
    "Packaging":            "gid://shopify/Metaobject/344660967769",
}

# Your six towel sizes (name, price €, weight g, width cm, height cm)
SIZES = [
    ("40 × 80 cm",  "5.80", 120, 40,  80),
    ("40 × 100 cm", "6.20", 160, 40, 100),
    ("50 × 100 cm", "6.60", 200, 50, 100),
    ("75 × 135 cm", "10.20",300, 75, 135),
    ("80 × 160 cm", "13.20",470, 80, 160),
    ("80 × 180 cm", "13.60",470, 80, 180),
]

# Printed sides options (name, markup € , internal value)
PRINTED_SIDES = [
    ("Front",       "0.00", "Front"),
    ("Both sides",  "0.40", "Both sides"),
]

# Hangloop positions (name, markup € , internal value)
HANGLOOP_POSITIONS = [
    ("Top Left",      "0.20", "top-left"),
    ("Top Center",    "0.20", "top-center"),
    ("Top Right",     "0.20", "top-right"),
    ("Left Side",     "0.20", "left-side"),
    ("Right Side",    "0.20", "right-side"),
    ("Bottom Left",   "0.20", "bottom-left"),
    ("Bottom Center", "0.20", "bottom-center"),
    ("Bottom Right",  "0.20", "bottom-right"),
    ("No Hangloop",   "0.00", "none"),
]

# Packaging options (name, markup € , internal value)
PACKAGING = [
    ("Mesh Bag",    "0.80", "mesh-bag"),
    ("Textile Bag", "1.20", "textile-bag"),
    ("No Bag",      "0.00", "none"),
]

# === Helper to sanitize a name into a valid GraphQL variable name ===
def sanitize_var(name: str) -> str:
    # lower-case, replace non-alphanumeric with underscore, collapse multiple underscores
    s = re.sub(r"[^\w]", "_", name.strip().lower())
    return re.sub(r"_+", "_", s).strip("_")

# === Build up all entries ===
entries = []  # list of (var_name, fields_list)

# 1) Towel sizes
for name, price, weight, width, height in SIZES:
    var = "size_" + sanitize_var(name)
    fields = [
        {"key": "Name",       "value": name},
        {"key": "Price",      "value": json.dumps({"amount": price, "currencyCode": "EUR"})},
        {"key": "Weight",     "value": json.dumps({"value": weight, "unit": "GRAMS"})},
        {"key": "Width",      "value": json.dumps({"value": width,  "unit": "CENTIMETERS"})},
        {"key": "Height",     "value": json.dumps({"value": height, "unit": "CENTIMETERS"})},
        {"key": "Option ID",  "value": OPTION_IDS["Towel Size"]},
    ]
    entries.append((var, fields))

# 2) Printed sides
for name, price, internal in PRINTED_SIDES:
    var = "printed_" + sanitize_var(name)
    fields = [
        {"key": "Name",      "value": name},
        {"key": "Price",     "value": json.dumps({"amount": price, "currencyCode": "EUR"})},
        {"key": "Weight",    "value": json.dumps({"value": 0, "unit": "GRAMS"})},
        {"key": "Option ID", "value": OPTION_IDS["Printed Sides"]},
        {"key": "Print Sides", "value": internal},
    ]
    entries.append((var, fields))

# 3) Hangloop positions
for name, price, internal in HANGLOOP_POSITIONS:
    var = "hangloop_" + sanitize_var(name)
    fields = [
        {"key": "Name",      "value": name},
        {"key": "Price",     "value": json.dumps({"amount": price, "currencyCode": "EUR"})},
        {"key": "Weight",    "value": json.dumps({"value": 0, "unit": "GRAMS"})},
        {"key": "Option ID", "value": OPTION_IDS["Hangloop Position"]},
        {"key": "Hangloop Position", "value": internal},
    ]
    entries.append((var, fields))

# 4) Packaging
for name, price, internal in PACKAGING:
    var = "packaging_" + sanitize_var(name)
    fields = [
        {"key": "Name",       "value": name},
        {"key": "Price",      "value": json.dumps({"amount": price, "currencyCode": "EUR"})},
        {"key": "Weight",     "value": json.dumps({"value": 0, "unit": "GRAMS"})},
        {"key": "Option ID",  "value": OPTION_IDS["Packaging"]},
        {"key": "Packaging",  "value": internal},
    ]
    entries.append((var, fields))

# === Build GraphQL mutation text ===
var_defs     = []
mutation_ops = []
variables    = {}

for var_name, fields in entries:
    var_defs.append(f"${var_name}: MetaobjectCreateInput!")
    mutation_ops.append(
        f"  {var_name}: metaobjectCreate(metaobject: ${var_name}) {{\n"
        f"    metaobject {{ id }}\n"
        f"    userErrors {{ field message }}\n"
        f"  }}"
    )
    # prepare the variables JSON
    variables[var_name] = {
        "type":   METAOBJECT_TYPE,
        "fields": fields
    }

graphql_query = (
    "mutation BulkCreateConfigurationValues(\n"
    + ",\n".join(var_defs)
    + "\n) {\n"
    + "\n".join(mutation_ops)
    + "\n}\n"
)

# === Write out files ===
with open("bulk_create_configuration_values.graphql", "w") as f:
    f.write(graphql_query)

with open("bulk_create_configuration_values.json", "w") as f:
    json.dump(variables, f, indent=2)

print("✅ Wrote:")
print("   • bulk_create_configuration_values.graphql")
print("   • bulk_create_configuration_values.json")