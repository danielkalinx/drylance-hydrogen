import {useState, useMemo, useEffect, useCallback} from 'react';
import {Button} from '~/components/ui/button';
import {Badge} from '~/components/ui/badge';
import {RadioGroup, RadioGroupItem} from '~/components/ui/radio-group';
import {IconlyExpand} from '~/components/icons/IconlyExpand';
import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, useSearchParams, useNavigate} from '@remix-run/react';
import {Tabs, TabsContent} from '~/components/ui/tabs';
import {IconlyLink} from '~/components/ui/IconlyLink';
import {IconlyArrowleftLG} from '~/components/ui/IconlyArrowleftLG';
import {Checkbox} from '~/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import {Slider} from '~/components/ui/slider';
import {Card, CardHeader} from '~/components/ui/card';
import {Alert, AlertDescription, AlertTitle} from '~/components/ui/alert';
import {InfoIcon} from 'lucide-react';

// Import components
import {OptionStep} from '~/components/studio/OptionStep';
import {HangloopStep} from '~/components/studio/HangloopStep';
import {QuantityStep} from '~/components/studio/QuantityStep';
import {type OptionValue, formatPrice} from '~/components/studio/types';

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
                field(key: "name") {
                  value
                }
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
  const [quantity, setQuantity] = useState([2500]);
  const [sampleOrder, setSampleOrder] = useState(false);

  // Group configuration values by option handle and collect option names
  const {optionGroups, optionGroupNames} = useMemo(() => {
    const groups: Record<string, OptionValue[]> = {};
    const groupNames: Record<string, string> = {};

    configurationValues.forEach((value: any) => {
      // Get the option reference handle
      const optionReference = value.field?.reference?.handle;
      const optionName = value.field?.reference?.field?.value;

      if (!optionReference) return;

      if (!groups[optionReference]) {
        groups[optionReference] = [];
      }

      // Store the option group name
      if (optionName && !groupNames[optionReference]) {
        groupNames[optionReference] = optionName;
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

    return {optionGroups: groups, optionGroupNames: groupNames};
  }, [configurationValues]);

  // Define option groups based on option keys found in data
  const optionKeys = useMemo(() => {
    // Add 'quantity' as the final step
    return [...Object.keys(optionGroups), 'quantity'];
  }, [optionGroups]);

  // Initialize selected options from URL parameters
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    const initialOptions: Record<string, string> = {};

    // Parse options from URL parameters
    optionKeys.forEach((key) => {
      if (key === 'quantity') return; // Skip quantity as it has separate state

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

    // Add quantity to URL
    if (quantity[0]) {
      newParams.set('quantity', quantity[0].toString());
    }

    // Add sample order to URL
    if (sampleOrder) {
      newParams.set('sample', 'true');
    }

    // Update URL without navigating or reload
    window.history.replaceState(null, '', `?${newParams.toString()}`);
  }, [selectedOptions, quantity, sampleOrder]);

  // Debounced URL update
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUrl();
    }, 500); // Wait 500ms after changes stop before updating URL
    return () => clearTimeout(timer);
  }, [selectedOptions, quantity, sampleOrder, updateUrl]);

  // Copy the current URL to clipboard
  const copyLinkToClipboard = () => {
    // First update URL with current selections
    updateUrl();
    // Then copy to clipboard
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Get name for option group display - use dynamic names from API
  const getOptionGroupName = (optionHandle: string) => {
    if (optionHandle === 'quantity') return 'Quantity';
    return optionGroupNames[optionHandle] || optionHandle.replace(/-/g, ' ');
  };

  // Default tab - use first selected option or first available option
  const [activeTab, setActiveTab] = useState(() => {
    // Try to find a tab with a selection
    for (const key of optionKeys) {
      if (key === 'quantity') {
        // Skip quantity for initial tab selection
        continue;
      }
      if (selectedOptions[key]) {
        return key;
      }
    }
    // Default to first tab if no selection
    return optionKeys[0] || '';
  });

  // Navigate to previous option
  const handlePrevious = () => {
    const currentIndex = optionKeys.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(optionKeys[currentIndex - 1]);
    }
  };

  // Navigate to next option
  const handleNext = () => {
    const currentIndex = optionKeys.indexOf(activeTab);
    if (currentIndex < optionKeys.length - 1) {
      setActiveTab(optionKeys[currentIndex + 1]);
    } else {
      // Last step (quantity) - Add to cart logic would go here
      console.log('Add to cart', {
        selectedOptions,
        quantity: quantity[0],
        sampleOrder,
      });
    }
  };

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

  const isFirstTab = optionKeys.indexOf(activeTab) === 0;
  const isLastTab = optionKeys.indexOf(activeTab) === optionKeys.length - 1;

  // Calculate price based on quantity
  const getVolumeDiscount = (qty: number) => {
    if (qty >= 4000) return 0.15; // 15%
    if (qty >= 2000) return 0.1; // 10%
    if (qty >= 1500) return 0.05; // 5%
    return 0; // No discount
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return `€ ${amount.toFixed(2)}`;
  };

  // Render the appropriate step component based on option type
  const renderStepContent = (optionHandle: string) => {
    if (optionHandle === 'quantity') {
      return (
        <QuantityStep
          quantity={quantity}
          setQuantity={setQuantity}
          sampleOrder={sampleOrder}
          setSampleOrder={setSampleOrder}
        />
      );
    }

    if (isHangloopOption(optionHandle)) {
      return (
        <HangloopStep
          options={optionGroups[optionHandle]}
          selectedValue={selectedOptions[optionHandle] || ''}
          onChange={(value) => handleOptionChange(optionHandle, value)}
        />
      );
    }

    return (
      <OptionStep
        options={optionGroups[optionHandle]}
        selectedValue={selectedOptions[optionHandle] || ''}
        onChange={(value) => handleOptionChange(optionHandle, value)}
      />
    );
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
              <h1 className="text-3xl leading-10 font-normal text-card-foreground md:text-4xl">
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

          <div className="space-y-6">
            <h2 className="text-lg font-medium">
              {getOptionGroupName(activeTab)}
            </h2>

            <Tabs value={activeTab} className="space-y-6">
              {optionKeys.map((optionHandle) => (
                <TabsContent
                  key={optionHandle}
                  value={optionHandle}
                  className="space-y-4"
                >
                  {renderStepContent(optionHandle)}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg md:static md:bg-transparent md:backdrop-blur-none p-8">
            <div className="flex gap-4 max-w-md mx-auto">
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full"
                onClick={handlePrevious}
                disabled={isFirstTab}
              >
                <IconlyArrowleftLG />
              </Button>
              <Button
                className="flex-1 rounded-full"
                size="lg"
                onClick={handleNext}
              >
                {isLastTab ? 'Add to Cart' : 'Next Step'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
