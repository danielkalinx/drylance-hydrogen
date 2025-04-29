import {useState, useMemo} from 'react';
import {Button} from '~/components/ui/button';
import {Badge} from '~/components/ui/badge';
import {RadioGroup, RadioGroupItem} from '~/components/ui/radio-group';
import {Tabs, TabsList, TabsTrigger, TabsContent} from '~/components/ui/tabs';
import {IconlyExpand} from '~/components/icons/IconlyExpand';
import {IconlyLeftLine} from '~/components/icons/IconlyLeftLine';
import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;

  const {metaobjects} = await storefront.query(CONFIGURATION_VALUES_QUERY);

  return {
    configurationValues: metaobjects.edges.map((edge: any) => edge.node),
  };
}

const CONFIGURATION_VALUES_QUERY = `#graphql
  query GetConfigValues {
    metaobjects(
      first: 100,
      type: "configuration_value"
    ) {
      edges {
        node {
          handle
          fields {
            key
            value
          }
        }
      }
    }
  }
` as const;

export default function Studio() {
  const {configurationValues} = useLoaderData<typeof loader>();

  // Group configuration values by option_id
  const optionGroups = useMemo(() => {
    const groups: Record<string, any[]> = {};

    configurationValues.forEach((value: any) => {
      // Find option_id field
      const optionIdField = value.fields.find(
        (field: any) => field.key === 'option_id',
      );
      if (!optionIdField) return;

      const optionId = optionIdField.value;

      if (!groups[optionId]) {
        groups[optionId] = [];
      }

      // Parse fields into a more usable format
      const parsedValue = {
        handle: value.handle,
        name: value.fields.find((f: any) => f.key === 'name')?.value || '',
        price: value.fields.find((f: any) => f.key === 'price')?.value || '',
        ...Object.fromEntries(
          value.fields
            .filter((f: any) => !['name', 'price', 'option_id'].includes(f.key))
            .map((f: any) => [f.key, f.value]),
        ),
      };

      groups[optionId].push(parsedValue);
    });

    return groups;
  }, [configurationValues]);

  // State for selected options
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  // Define tab keys based on option keys found in data
  const tabKeys = useMemo(() => Object.keys(optionGroups), [optionGroups]);

  // Helper function to parse price JSON
  const formatPrice = (priceJson: string) => {
    try {
      const price = JSON.parse(priceJson) as {
        amount: string;
        currency_code: string;
      };
      return `€ ${price.amount}`;
    } catch (e) {
      return priceJson;
    }
  };

  // Get name for tab display
  const getTabName = (optionId: string) => {
    // Extract last segment from gid
    const segments = optionId.split('/');
    const id = segments[segments.length - 1];

    // Map to human-readable names
    const names: Record<string, string> = {
      '344660902233': 'Size',
      '344660803929': 'Print Sides',
      '344660935001': 'Hangloop',
      '344660967769': 'Packaging',
    };

    return names[id] || 'Option';
  };

  return (
    <section className="py-24 space-y-6">
      <div className="container flex items-start justify-center gap-16 px-6">
        <div className="relative bg-muted rounded-lg w-[720px] h-[880px] md:block hidden">
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-5 right-5 rounded-full"
          >
            <IconlyExpand />
          </Button>
        </div>

        <div className="max-w-md space-y-6">
          <div className="space-y-4">
            <h1 className="text-[36px] leading-10 font-normal tracking-[-1.7px] text-card-foreground md:text-4xl">
              Design Your Microfiber Towel
            </h1>
            <p className="text-sm text-muted-foreground">
              Customize your towel with the options below.
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-primary">€ 6.20</span>
                <span className="text-xs text-muted-foreground">
                  (per piece, excl. VAT)
                </span>
              </div>
              <Badge variant="outline">Sample Order</Badge>
            </div>
          </div>

          <Tabs defaultValue={tabKeys[0]} className="w-full">
            <TabsList className="w-full">
              {tabKeys.map((optionId) => (
                <TabsTrigger key={optionId} value={optionId}>
                  {getTabName(optionId)}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabKeys.map((optionId) => (
              <TabsContent key={optionId} value={optionId} className="mt-4">
                <RadioGroup
                  value={selectedOptions[optionId] || ''}
                  onValueChange={(value) => {
                    setSelectedOptions((prev) => ({
                      ...prev,
                      [optionId]: value,
                    }));
                  }}
                  className="space-y-3"
                >
                  {optionGroups[optionId].map((option) => (
                    <label
                      key={option.handle}
                      className={`flex items-center gap-3 p-4 rounded-3xl border cursor-pointer ${
                        selectedOptions[optionId] === option.handle
                          ? 'bg-accent border-primary'
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <RadioGroupItem
                        value={option.handle}
                        id={option.handle}
                      />
                      <div className="w-16 h-16 bg-background rounded" />
                      <span
                        className={`flex-1 text-sm font-medium ${
                          selectedOptions[optionId] === option.handle
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {option.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          selectedOptions[optionId] === option.handle
                            ? 'border-primary text-primary'
                            : 'text-muted-foreground'
                        }
                      >
                        {formatPrice(option.price)}
                      </Badge>
                    </label>
                  ))}
                </RadioGroup>
              </TabsContent>
            ))}
          </Tabs>

          <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg md:static md:bg-transparent md:backdrop-blur-none p-8">
            <div className="flex gap-4 max-w-md mx-auto">
              <Button variant="secondary" size="lg" className="rounded-full">
                <IconlyLeftLine />
              </Button>
              <Button className="flex-1 rounded-full" size="lg">
                Next Step
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
