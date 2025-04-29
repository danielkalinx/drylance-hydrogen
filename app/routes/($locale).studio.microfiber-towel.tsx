import {useState, useMemo, useEffect, useCallback} from 'react';
import {Button} from '~/components/ui/button';
import {Badge} from '~/components/ui/badge';
import {RadioGroup, RadioGroupItem} from '~/components/ui/radio-group';
import {IconlyExpand} from '~/components/icons/IconlyExpand';
import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, useSearchParams, useNavigate} from '@remix-run/react';
import {Tabs, TabsList, TabsTrigger, TabsContent} from '~/components/ui/tabs';
import {IconlyLink} from '~/components/ui/IconlyLink';
import {IconlyArrowleftLG} from '~/components/ui/IconlyArrowleftLG';

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
  const navigate = useNavigate();
  const [linkCopied, setLinkCopied] = useState(false);

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

  // Define option groups based on option keys found in data
  const optionKeys = useMemo(() => Object.keys(optionGroups), [optionGroups]);

  // Initialize selected options from URL parameters
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    const initialOptions: Record<string, string> = {};

    // Parse options from URL parameters
    optionKeys.forEach((key) => {
      const value = searchParams.get(key);
      if (value) {
        // Verify this is a valid option
        const optionGroup = optionGroups[key] || [];
        const isValidOption = optionGroup.some(
          (option) => option.handle === value,
        );
        if (isValidOption) {
          initialOptions[key] = value;
        }
      }
    });

    return initialOptions;
  });

  // Update URL silently without page reload
  const updateUrl = useCallback(() => {
    const newParams = new URLSearchParams();

    // Add selected options to URL
    Object.entries(selectedOptions).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      }
    });

    // Update URL without navigating or reload
    window.history.replaceState(null, '', `?${newParams.toString()}`);
  }, [selectedOptions]);

  // Debounced URL update
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUrl();
    }, 500); // Wait 500ms after changes stop before updating URL
    return () => clearTimeout(timer);
  }, [selectedOptions, updateUrl]);

  // Copy the current URL to clipboard
  const copyLinkToClipboard = () => {
    // First update URL with current selections
    updateUrl();
    // Then copy to clipboard
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

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

  // Update selected options locally
  const handleOptionChange = (optionHandle: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionHandle]: value,
    }));
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
            <div className="flex items-center justify-between">
              <h1 className="text-[36px] leading-10 font-normal tracking-[-1.7px] text-card-foreground md:text-4xl">
                Design Your Microfiber Towel
              </h1>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={copyLinkToClipboard}
              >
                <IconlyLink size={16} />
                {linkCopied ? 'Copied!' : 'Share'}
              </Button>
            </div>
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
                    onValueChange={(value) =>
                      handleOptionChange(optionHandle, value)
                    }
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
                    onValueChange={(value) =>
                      handleOptionChange(optionHandle, value)
                    }
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
                <IconlyArrowleftLG />
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
