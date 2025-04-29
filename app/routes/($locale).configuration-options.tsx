import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from '@remix-run/react';

export const meta: MetaFunction<typeof loader> = () => {
  return [
    {title: 'Drylance | Configuration Options'},
    {
      rel: 'canonical',
      href: '/configuration-options',
    },
  ];
};

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;

  const {metaobjects} = await storefront.query(CONFIGURATION_OPTIONS_QUERY);

  return {
    configurationOptions: metaobjects.edges.map((edge: any) => edge.node),
  };
}

export default function ConfigurationOptions() {
  const {configurationOptions} = useLoaderData<typeof loader>();

  return (
    <div>
      {configurationOptions.map((option: any) => (
        <div key={option.id}>
          <p>ID: {option.id}</p>
          <p>Handle: {option.handle}</p>
          <div>
            <p>Fields:</p>
            {option.fields.map((field: any) => (
              <div key={field.key}>
                <p>Key: {field.key}</p>
                <p>Type: {field.type}</p>
                <p>Value: {field.value}</p>
                {field.reference && (
                  <div>
                    <p>Reference Type: {field.reference.__typename}</p>
                    {field.reference.__typename === 'Product' && (
                      <>
                        <p>Product ID: {field.reference.id}</p>
                        <p>Product Handle: {field.reference.handle}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const CONFIGURATION_OPTIONS_QUERY = `#graphql
  query getConfigurationOptions {
    metaobjects(
      first: 50,
      type: "configuration_option"
    ) {
      edges {
        node {
          id
          handle
          fields {
            key
            type
            value
            reference {
              __typename
              ... on Product { id handle }
            }
          }
        }
      }
    }
  }
` as const;
