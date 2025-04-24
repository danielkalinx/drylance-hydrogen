import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the query response data
const queryResponsePath = path.join(__dirname, 'query-response.json');
const queryResponse = JSON.parse(fs.readFileSync(queryResponsePath, 'utf8'));

// Extract options and their values from the metafields data
const metafields =
  queryResponse.data.product.metafields.nodes[0].reference.fields;

// Extract the different option categories
const towelSizes = metafields[0].references.nodes.map((node) => ({
  name: node.fields[0].jsonValue,
  price: parseFloat(node.fields[1].jsonValue.amount),
}));

const printedSides = metafields[1].references.nodes.map((node) => ({
  name: node.fields[0].jsonValue,
  price: parseFloat(node.fields[1].jsonValue.amount),
}));

const hangloopPositions = metafields[2].references.nodes.map((node) => ({
  name: node.fields[0].jsonValue,
  price: parseFloat(node.fields[1].jsonValue.amount),
}));

// Generate all possible combinations
const generateCombinations = () => {
  const combinations = [];

  for (const size of towelSizes) {
    for (const side of printedSides) {
      for (const hangloop of hangloopPositions) {
        const totalPrice = (size.price + side.price + hangloop.price).toFixed(
          2,
        );
        const title = `${size.name} / ${side.name} / ${hangloop.name}`;

        combinations.push({
          price: totalPrice,
          optionValues: [
            {
              name: title,
              optionId: 'gid://shopify/ProductOption/17750015312217',
            },
          ],
        });
      }
    }
  }

  return combinations;
};

// Create variables for the mutation
const createVariables = () => {
  const variants = generateCombinations();

  return {
    productId: 'gid://shopify/Product/15182509474137',
    variants,
  };
};

// Write the mutation to a file (it already exists, but we'll make sure it's as expected)
const writeMutation = () => {
  const mutation = `mutation ProductVariantsCreate(
  $productId: ID!
  $variants: [ProductVariantsBulkInput!]!
) {
  productVariantsBulkCreate(productId: $productId, variants: $variants) {
    productVariants {
      id
      title
      selectedOptions {
        name
        value
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;

  fs.writeFileSync(path.join(__dirname, 'mutation.gql'), mutation);
};

// Write the variables to a file
const writeVariables = () => {
  const variables = createVariables();
  fs.writeFileSync(
    path.join(__dirname, 'variables.json'),
    JSON.stringify(variables, null, 2),
  );
};

// Run the script
const run = () => {
  writeMutation();
  writeVariables();
  console.log(
    `Generated ${createVariables().variants.length} variants successfully!`,
  );
};

run();
