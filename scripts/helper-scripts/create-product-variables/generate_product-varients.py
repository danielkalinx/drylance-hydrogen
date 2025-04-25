import json
import itertools
from decimal import Decimal

# Load configuration data from JSON files
with open('configuration_value.json') as f:
    config_values = json.load(f)
    
with open('configuration_option.json') as f:
    config_options = json.load(f)

# Constants
PRODUCT_ID = "gid://shopify/Product/15391530385753"
PRODUCT_OPTION_ID = "gid://shopify/ProductOption/17751741202777"

# Create a mapping of option_id to option_type
option_id_to_type = {}
for edge in config_options['data']['metaobjectDefinition']['metaobjects']['edges']:
    option_id_to_type[edge['node']['id']] = edge['node']['displayName']

print("Option ID to Type Mapping:")
for option_id, option_type in option_id_to_type.items():
    print(f"- {option_id}: {option_type}")

# Create a case-insensitive mapping of display names to metaobject IDs
metaobject_map = {}
display_name_to_id = {}

for edge in config_values['data']['metaobjectDefinition']['metaobjects']['edges']:
    node = edge['node']
    display_name = node['displayName']
    metaobject_id = node['id']
    
    # Store both the original and a normalized version
    metaobject_map[display_name] = metaobject_id
    display_name_to_id[display_name.lower()] = metaobject_id

print("\nMetaobject Display Names to IDs:")
for name, id in metaobject_map.items():
    print(f"- {name}: {id}")

# Group configuration values by option type
values_by_option = {
    'Towel Size': [],
    'Printed Sides': [],
    'Hangloop Position': [],
    'Packaging': []
}

# Process each configuration value node
for node in config_values['data']['metaobjectDefinition']['metaobjects']['nodes']:
    value_data = {}
    option_id = None
    option_type = None
    
    # First pass to collect basic information
    for field in node['fields']:
        if field['key'] == 'name':
            value_data['name'] = field['value']
            
            # Try to find the metaobject ID from our mapping (case insensitive)
            name_lower = value_data['name'].lower()
            if name_lower in display_name_to_id:
                value_data['metaobject_id'] = display_name_to_id[name_lower]
            else:
                # Try direct match
                for key, id in metaobject_map.items():
                    if key.lower() == name_lower:
                        value_data['metaobject_id'] = id
                        break
                
            # Special handling for known variations in names
            if 'name' in value_data and 'metaobject_id' not in value_data:
                # Handle known name variations 
                name_map = {
                    '40 × 80 cm': '40 X 80 Cm',
                    '40 × 100 cm': '40 X 100 Cm',
                    '50 × 100 cm': '50 X 100 Cm',
                    '75 × 135 cm': '75 X 135 Cm',
                    '80 × 160 cm': '80 X 160 Cm',
                    '80 × 180 cm': '80 X 180 Cm',
                    'Mesh Bag': 'mesh-bag',
                    'No Bag': 'none',
                    'Textile Bag': 'textile-bag',
                    'No Hangloop': 'Hangloop None'
                }
                
                if value_data['name'] in name_map:
                    mapped_name = name_map[value_data['name']]
                    if mapped_name in metaobject_map:
                        value_data['metaobject_id'] = metaobject_map[mapped_name]
                        print(f"Matched '{value_data['name']}' to '{mapped_name}'")
        
        elif field['key'] == 'option_id':
            option_id = field['value']
            value_data['option_id'] = option_id
            
            # Get option type from option ID
            if option_id in option_id_to_type:
                option_type = option_id_to_type[option_id]
    
    # Second pass to determine the option type and gather additional data
    for field in node['fields']:
        if field['key'] == 'price':
            if field['value']:
                price_data = json.loads(field['value'])
                value_data['price'] = Decimal(price_data['amount'])
            else:
                value_data['price'] = Decimal('0.0')
                
        elif field['key'] == 'weight':
            if field['value']:
                weight_data = json.loads(field['value'])
                value_data['weight'] = Decimal(str(weight_data['value']))
            else:
                value_data['weight'] = Decimal('0.0')
                
        # Additional metadata to help determine the option type
        elif field['key'] == 'print_sides' and field['value']:
            value_data['print_sides'] = field['value']
            if not option_type:
                option_type = 'Printed Sides'
                
        elif field['key'] == 'hangloop_position' and field['value']:
            value_data['hangloop_position'] = field['value']
            if not option_type:
                option_type = 'Hangloop Position'
                
        elif field['key'] == 'packaging' and field['value']:
            value_data['packaging'] = field['value']
            if not option_type:
                option_type = 'Packaging'
    
    # Additional inferences based on data patterns
    if not option_type:
        # For towel sizes
        size_indicators = ['× ', 'x ', 'cm']
        if 'name' in value_data and any(indicator in value_data['name'] for indicator in size_indicators):
            option_type = 'Towel Size'
        # For packaging
        elif 'name' in value_data and any(bag_name in value_data['name'].lower() for bag_name in ['bag', 'textile', 'mesh', 'no bag']):
            option_type = 'Packaging'
        # For hangloop positions
        elif 'name' in value_data and any(pos in value_data['name'].lower() for pos in ['top', 'bottom', 'left', 'right', 'center', 'side']):
            option_type = 'Hangloop Position'
        # For printed sides
        elif 'name' in value_data and any(side in value_data['name'].lower() for side in ['front', 'both sides', 'side']):
            option_type = 'Printed Sides'
    
    # Check for "No Hangloop" option specifically
    if 'name' in value_data and ('no hangloop' in value_data['name'].lower() or 'hangloop none' in value_data['name'].lower()):
        option_type = 'Hangloop Position'
    
    # Add value to appropriate category if we have all required data
    if option_type and 'name' in value_data and 'metaobject_id' in value_data:
        if option_type in values_by_option:
            # Ensure we've got a price
            if 'price' not in value_data:
                value_data['price'] = Decimal('0.0')
                
            # For towel sizes, ensure we have a weight
            if option_type == 'Towel Size' and 'weight' not in value_data:
                value_data['weight'] = Decimal('120.0')  # Default weight
                
            values_by_option[option_type].append(value_data)
            print(f"Added value '{value_data['name']}' to option type '{option_type}'")
    else:
        # Debug info for items we couldn't categorize
        if 'name' in value_data:
            if 'metaobject_id' not in value_data:
                print(f"WARNING: Could not find metaobject ID for '{value_data['name']}'")
            if not option_type:
                print(f"WARNING: Could not determine option type for '{value_data['name']}'")

# Check values for each option type
print("\nValues collected for each option type:")
for option_type, values in values_by_option.items():
    print(f"{option_type}: {len(values)} values")
    for val in values:
        print(f"  - {val['name']}")

# Handle missing categories with default values if needed
for option_type, values in values_by_option.items():
    if not values:
        print(f"WARNING: No values found for {option_type}. Adding placeholder.")
        # Add placeholder based on the option type
        placeholder_id = "gid://shopify/Metaobject/placeholder"
        placeholder_name = f"Default {option_type}"
        placeholder_weight = Decimal('120.0') if option_type == 'Towel Size' else Decimal('0.0')
        
        values_by_option[option_type].append({
            'name': placeholder_name,
            'price': Decimal('0.0'),
            'weight': placeholder_weight,
            'metaobject_id': placeholder_id
        })

# Group hangloop positions into two categories: with hangloop and without hangloop
hangloop_categories = {'with_hangloop': [], 'without_hangloop': []}

for hangloop in values_by_option['Hangloop Position']:
    # Check if this is a "No Hangloop" option
    if 'no hangloop' in hangloop['name'].lower() or 'hangloop none' in hangloop['name'].lower() or (
        'hangloop_position' in hangloop and hangloop['hangloop_position'] == 'none'):
        hangloop_categories['without_hangloop'].append(hangloop)
    else:
        hangloop_categories['with_hangloop'].append(hangloop)

# Create new representation for hangloops
hangloop_options = []

# Handle case where we have hangloop positions
if hangloop_categories['with_hangloop']:
    # Calculate average price for hangloop options
    total_price = sum(h['price'] for h in hangloop_categories['with_hangloop'])
    avg_price = total_price / len(hangloop_categories['with_hangloop']) if hangloop_categories['with_hangloop'] else Decimal('0.2')
    
    # Collect all metaobject IDs for hangloops
    all_hangloop_ids = [h['metaobject_id'] for h in hangloop_categories['with_hangloop']]
    
    hangloop_options.append({
        'name': 'Hangloop',
        'price': avg_price,
        'metaobject_ids': all_hangloop_ids,
        'is_combined': True
    })

# Add no hangloop option if it exists
if hangloop_categories['without_hangloop']:
    no_hangloop = hangloop_categories['without_hangloop'][0]  # Use the first one as reference
    hangloop_options.append({
        'name': 'No Hangloop',
        'price': no_hangloop['price'],
        'metaobject_ids': [no_hangloop['metaobject_id']],
        'is_combined': False
    })
# If no explicit "No Hangloop" found, create default
elif not hangloop_categories['without_hangloop']:
    # Look for "Hangloop None" in the metaobject map
    no_hangloop_id = None
    for name, id in metaobject_map.items():
        if 'hangloop none' in name.lower():
            no_hangloop_id = id
            break
    
    # If not found, use a placeholder
    if not no_hangloop_id:
        no_hangloop_id = "gid://shopify/Metaobject/placeholder"
    
    hangloop_options.append({
        'name': 'No Hangloop',
        'price': Decimal('0.0'),
        'metaobject_ids': [no_hangloop_id],
        'is_combined': False
    })

# Generate all possible combinations
towel_sizes = values_by_option['Towel Size']
printed_sides = values_by_option['Printed Sides']
packaging_options = values_by_option['Packaging']

print(f"\nNumber of variations in each category:")
print(f"Towel Sizes: {len(towel_sizes)}")
print(f"Printed Sides: {len(printed_sides)}")
print(f"Hangloop Options: {len(hangloop_options)}")
print(f"Packaging Options: {len(packaging_options)}")

# Generate all combinations
combinations = list(itertools.product(
    towel_sizes,
    printed_sides,
    hangloop_options, 
    packaging_options
))

# Create variants for each combination
variants = []
for combo in combinations:
    towel_size, printed_side, hangloop, packaging = combo
    
    # Calculate total price (sum of all option prices)
    total_price = towel_size['price'] + printed_side['price'] + hangloop['price'] + packaging['price']
    
    # Get weight from towel size (other options don't affect weight)
    weight = towel_size.get('weight', Decimal('0.0'))
    
    # Generate a descriptive title for debugging (not used in the API call)
    variant_title = f"{towel_size['name']} | {printed_side['name']} | {hangloop['name']} | {packaging['name']}"
    print(f"Creating variant: {variant_title}")
    
    # Collect all metaobject IDs
    metaobject_ids = [
        towel_size['metaobject_id'],
        printed_side['metaobject_id']
    ]
    
    # Add hangloop IDs - either multiple IDs for "Hangloop" or single ID for "No Hangloop"
    if hangloop['is_combined']:
        metaobject_ids.extend(hangloop['metaobject_ids'])
    else:
        metaobject_ids.extend(hangloop['metaobject_ids'])
        
    # Add packaging ID
    metaobject_ids.append(packaging['metaobject_id'])
    
    # Create variant according to Shopify API format
    variant = {
        "price": str(total_price),
        "optionValues": [
            {
                "optionId": PRODUCT_OPTION_ID,
                "name": variant_title
            }
        ],
        "metafields": [
            {
                "key": "metadata_weight",
                "namespace": "custom",
                "type": "weight",
                "value": json.dumps({"value": float(weight), "unit": "GRAMS"})
            },
            {
                "key": "configuration_value_ids",
                "namespace": "custom",
                "type": "list.metaobject_reference",
                "value": json.dumps(metaobject_ids)
            }
        ]
    }
    
    variants.append(variant)

print(f"\nGenerated {len(variants)} product variants.")

# Create the GraphQL mutation
mutation = """
mutation productVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
  productVariantsBulkCreate(productId: $productId, variants: $variants) {
    productVariants {
      id
      selectedOptions {
        name
        value
      }
      price
      metafields(first: 250) {
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

# Create the variables
variables = {
    "productId": PRODUCT_ID,
    "variants": variants
}

# Save to files
with open('product_variants_mutation.graphql', 'w') as f:
    f.write(mutation)

with open('product_variants_variables.json', 'w', encoding='utf-8') as f:
    json.dump(variables, f, indent=2, ensure_ascii=False)

print("Mutation saved to product_variants_mutation.graphql")
print("Variables saved to product_variants_variables.json")
