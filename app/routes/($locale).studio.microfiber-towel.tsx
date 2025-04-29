import {useState, useMemo, useEffect} from 'react';
import {Button} from '~/components/ui/button';
import {Badge} from '~/components/ui/badge';
import {RadioGroup, RadioGroupItem} from '~/components/ui/radio-group';
import {IconlyExpand} from '~/components/icons/IconlyExpand';
import {IconlyLeftLine} from '~/components/icons/IconlyLeftLine';
import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, useSearchParams} from '@remix-run/react';
import {Tabs, TabsList, TabsTrigger, TabsContent} from '~/components/ui/tabs';

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;

  const {metaobjects} = await storefront.query(CONFIGURATION_VALUES_QUERY);

  return {
    configurationValues: metaobjects.edges.map((edge: any) => edge.node),
  };
}

const CONFIGURATION_VALUES_QUERY = `#graphql
  query getConfigurationOptions {
    metaobjects(first: 100, type: "configuration_value") {
      edges {
        node {
          handle
          fields {
            key
            value
          }
          field(key: "option_id") {
            reference {
              ... on Metaobject {
                handle
              }
            }
          }
        }
      }
    }
  }
` as const;

export default function Studio() {
  const {configurationValues} = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Group configuration values by option handle
  const optionGroups = useMemo(() => {
    const groups: Record<string, any[]> = {};

    configurationValues.forEach((value: any) => {
      // Get the option reference handle
      const optionReference = value.field?.reference?.handle;

      if (!optionReference) return;

      if (!groups[optionReference]) {
        groups[optionReference] = [];
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

      groups[optionReference].push(parsedValue);
    });

    return groups;
  }, [configurationValues]);

  // State for selected options
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    // Initialize state from URL params
    const initialOptions: Record<string, string> = {};

    // Collect all option values from URL
    optionGroups &&
      Object.keys(optionGroups).forEach((optionHandle) => {
        const paramValue = searchParams.get(optionHandle);
        if (paramValue) {
          initialOptions[optionHandle] = paramValue;
        }
      });

    return initialOptions;
  });

  // Update URL when selections change
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);

    // Update params with current selections
    Object.entries(selectedOptions).forEach(([optionHandle, value]) => {
      newParams.set(optionHandle, value);
    });

    // Remove params that are no longer selected
    Object.keys(optionGroups).forEach((optionHandle) => {
      if (!selectedOptions[optionHandle]) {
        newParams.delete(optionHandle);
      }
    });

    setSearchParams(newParams, {replace: true});
  }, [selectedOptions, setSearchParams, optionGroups, searchParams]);

  // Define option groups based on option keys found in data
  const optionKeys = useMemo(() => Object.keys(optionGroups), [optionGroups]);

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

  // Get name for option group display
  const getOptionGroupName = (optionHandle: string) => {
    // Map to human-readable names
    const names: Record<string, string> = {
      'towel-size': 'Size',
      'printed-sides': 'Print Sides',
      'hangloop-position': 'Hangloop',
      packaging: 'Packaging',
    };

    return names[optionHandle] || optionHandle.replace(/-/g, ' ');
  };

  // Default tab - use first selected option or first available option
  const [activeTab, setActiveTab] = useState(() => {
    // Try to find a tab with a selection
    for (const key of optionKeys) {
      if (selectedOptions[key]) {
        return key;
      }
    }
    // Default to first tab if no selection
    return optionKeys[0] || '';
  });

  // Check if an option is for hangloop
  const isHangloopOption = (optionHandle: string) => {
    return optionHandle === 'hangloop-position';
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

        <div className="max-w-md space-y-8">
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

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="w-full">
              {optionKeys.map((optionHandle) => (
                <TabsTrigger key={optionHandle} value={optionHandle}>
                  {getOptionGroupName(optionHandle)}
                </TabsTrigger>
              ))}
            </TabsList>

            {optionKeys.map((optionHandle) => (
              <TabsContent
                key={optionHandle}
                value={optionHandle}
                className="space-y-4"
              >
                <h2 className="text-lg font-medium">
                  {getOptionGroupName(optionHandle)}
                </h2>

                {isHangloopOption(optionHandle) ? (
                  <RadioGroup
                    value={selectedOptions[optionHandle] || ''}
                    onValueChange={(value) => {
                      setSelectedOptions((prev) => ({
                        ...prev,
                        [optionHandle]: value,
                      }));
                    }}
                    className="grid grid-cols-3 gap-3"
                  >
                    {optionGroups[optionHandle].map((option) => (
                      <label
                        key={option.handle}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border cursor-pointer ${
                          selectedOptions[optionHandle] === option.handle
                            ? 'bg-accent border-primary'
                            : 'hover:bg-accent/50'
                        }`}
                      >
                        <div className="w-16 h-16 bg-background rounded flex items-center justify-center">
                          <RadioGroupItem
                            value={option.handle}
                            id={option.handle}
                          />
                        </div>
                        <span
                          className={`text-center text-sm font-medium ${
                            selectedOptions[optionHandle] === option.handle
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {option.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            selectedOptions[optionHandle] === option.handle
                              ? 'border-primary text-primary'
                              : 'text-muted-foreground'
                          }
                        >
                          {formatPrice(option.price)}
                        </Badge>
                      </label>
                    ))}
                  </RadioGroup>
                ) : (
                  <RadioGroup
                    value={selectedOptions[optionHandle] || ''}
                    onValueChange={(value) => {
                      setSelectedOptions((prev) => ({
                        ...prev,
                        [optionHandle]: value,
                      }));
                    }}
                    className="space-y-3"
                  >
                    {optionGroups[optionHandle].map((option) => (
                      <label
                        key={option.handle}
                        className={`flex items-center gap-3 p-4 rounded-3xl border cursor-pointer ${
                          selectedOptions[optionHandle] === option.handle
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
                            selectedOptions[optionHandle] === option.handle
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {option.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            selectedOptions[optionHandle] === option.handle
                              ? 'border-primary text-primary'
                              : 'text-muted-foreground'
                          }
                        >
                          {formatPrice(option.price)}
                        </Badge>
                      </label>
                    ))}
                  </RadioGroup>
                )}
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
