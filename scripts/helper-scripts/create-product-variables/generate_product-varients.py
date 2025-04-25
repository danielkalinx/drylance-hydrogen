#!/usr/bin/env python3
import json
import itertools
from typing import Dict, List, Any

# Load configuration data
with open('configuration_value.json', 'r') as f:
    config_values = json.load(f)

with open('configuration_option.json', 'r') as f:
    config_options = json.load(f)

with open('sample_54499304210777.json', 'r') as f:
    sample_variant = json.load(f)

# Extract product ID from config options
product_id = config_options["data"]["metaobjectDefinition"]["metaobjects"]["nodes"][0]["fields"][1]["jsonValue"]

# Create a mapping of option IDs to their types
option_id_map = {}
for node in config_options["data"]["metaobjectDefinition"]["metaobjects"]["edges"]:
    option_id = node["node"]["id"]
    option_type = node["node"]["displayName"]
    option_id_map[option_id] = option_type

# Group configuration values by their option types
config_values_by_type = {}
for node in config_values["data"]["metaobjectDefinition"]["metaobjects"]["nodes"]:
    option_id = None
    for field in node["fields"]:
        if field["key"] == "option_id":
            option_id = field["jsonValue"]
    
    if option_id and option_id in option_id_map:
        option_type = option_id_map[option_id]
        if option_type not in config_values_by_type:
            config_values_by_type[option_type] = []
        
        config_value = {}
        for field in node["fields"]:
            config_value[field["key"]] = field["jsonValue"]
        
        # Also find the metaobject ID for this configuration value
        for edge in config_values["data"]["metaobjectDefinition"]["metaobjects"]["edges"]:
            if edge["node"]["displayName"] == config_value.get("name"):
                config_value["metaobject_id"] = edge["node"]["id"]
                break
                
        config_values_by_type[option_type].append(config_value)

# Add "None" option for Hangloop Position
if "Hangloop Position" in config_values_by_type:
    none_option = {
        "name": "No Hangloop",
        "price": {"amount": "0.0", "currency_code": "EUR"},
        "hangloop_position": None,
        "metaobject_id": None  # No metaobject ID for this option
    }
    config_values_by_type["Hangloop Position"].append(none_option)

# Add Packaging options if not present
if "Packaging" not in config_values_by_type or not config_values_by_type["Packaging"]:
    config_values_by_type["Packaging"] = [
        {
            "name": "No Packaging",
            "price": {"amount": "0.0", "currency_code": "EUR"},
            "packaging": None,
            "metaobject_id": None
        },
        {
            "name": "Mesh Bag",
            "price": {"amount": "0.2", "currency_code": "EUR"},
            "packaging": "mesh_bag",
            "metaobject_id": None
        }
    ]

# Function to calculate total price
def calculate_price(combination: List[Dict[str, Any]]) -> float:
    total_price = 0.0
    for config in combination:
        if "price" in config and config["price"]:
            price_data = config["price"]
            if isinstance(price_data, dict) and "amount" in price_data:
                total_price += float(price_data["amount"])
    return round(total_price, 2)

# Function to calculate total weight
def calculate_weight(combination: List[Dict[str, Any]]) -> Dict[str, Any]:
    # Get weight from the size option
    for config in combination:
        if "weight" in config and config["weight"]:
            return config["weight"]
    return {"value": 0, "unit": "GRAMS"}

# Function to generate variant title
def generate_title(combination: List[Dict[str, Any]]) -> str:
    # Create parts based on the configuration values
    parts = []
    for config in combination:
        if "name" in config and config["name"]:
            parts.append(config["name"])
    
    return " | ".join(parts)

# Function to collect all metaobject IDs for a combination
def collect_metaobject_ids(combination: List[Dict[str, Any]]) -> List[str]:
    ids = []
    for config in combination:
        if "metaobject_id" in config and config["metaobject_id"]:
            ids.append(config["metaobject_id"])
    return ids

# Generate all possible combinations
def generate_combinations():
    # Identify all categories to combine
    categories = list(config_values_by_type.keys())
    
    # Prepare list of options for each category
    category_options = []
    for category in categories:
        category_options.append(config_values_by_type[category])
    
    # Generate all combinations
    all_combinations = list(itertools.product(*category_options))
    return all_combinations

# Generate the variants data
combinations = generate_combinations()
variants = []

print(f"Configuration options found:")
for category, options in config_values_by_type.items():
    print(f"  {category}: {len(options)} options")
    for opt in options:
        price_info = ""
        if "price" in opt and opt["price"] and isinstance(opt["price"], dict) and "amount" in opt["price"]:
            price_info = f" (€{opt['price']['amount']})"
        print(f"    - {opt.get('name', 'Unknown')}{price_info}")

print(f"\nGenerating {len(combinations)} possible combinations...")

for combo in combinations:
    price = calculate_price(combo)
    weight = calculate_weight(combo)
    title = generate_title(combo)
    metaobject_ids = collect_metaobject_ids(combo)
    
    variant = {
        "price": price,
        "title": title,
        "metafields": [
            {
                "key": "metadata_weight",
                "type": "weight",
                "value": json.dumps(weight)
            },
            {
                "key": "configuration_value_ids",
                "type": "list.metaobject_reference",
                "value": json.dumps(metaobject_ids)
            }
        ]
    }
    variants.append(variant)

# Prepare the mutation variables
mutation_variables = {
    "productId": product_id,
    "variants": variants
}

# Generate the GraphQL mutation
graphql_mutation = """
mutation ProductVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
  productVariantsBulkCreate(productId: $productId, variants: $variants) {
    productVariants {
      id
      title
      price
      metafields {
        edges {
          node {
            key
            type
            value
          }
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
"""

# Output the result
print(f"\nGenerated {len(variants)} variants")
print("\nGraphQL Mutation:")
print(graphql_mutation)
print("\nJSON Variables (first 3 examples):")
print(json.dumps({"productId": product_id, "variants": variants[:3]}, indent=2))

# Save to files
with open('product_variants_mutation.graphql', 'w') as f:
    f.write(graphql_mutation)

with open('product_variants_variables.json', 'w') as f:
    json.dump(mutation_variables, f, indent=2)

print(f"\nMutation and variables have been saved to product_variants_mutation.graphql and product_variants_variables.json")
print(f"Total number of variants: {len(variants)}")

# Analyze variants
price_range = (min(v["price"] for v in variants), max(v["price"] for v in variants))
print(f"\nPrice range: €{price_range[0]} - €{price_range[1]}")

# Warning for variant limit
if len(variants) > 1990:
    print(f"\nWARNING: The number of variants ({len(variants)}) is close to or exceeds Shopify's ~2000 variant limit!")
    print("Consider reducing the number of combinations or using a different approach.")
