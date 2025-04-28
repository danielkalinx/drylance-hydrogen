import {useState} from 'react';
import {Button} from '~/components/ui/button';
import {Badge} from '~/components/ui/badge';
import {RadioGroup, RadioGroupItem} from '~/components/ui/radio-group';
import {IconlyExpand} from '~/components/icons/IconlyExpand';
import {IconlyLeftLine} from '~/components/icons/IconlyLeftLine';

const sizes = [
  {id: '40x80', label: '40 × 80 cm', diff: '- € 0.10'},
  {id: '40x100', label: '40 × 100 cm', price: '€ 6.20'},
  {id: '50x100', label: '50 × 100 cm', diff: '+ € 0.05'},
  {id: '75x135', label: '75 × 135 cm', diff: '+ € 0.10'},
  {id: '80x160', label: '80 × 160 cm', diff: '+ € 0.15'},
];

export default function Studio() {
  const [selectedSize, setSelectedSize] = useState(sizes[1].id); // Default to 40x100

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
              Towel Size
            </h1>
            <p className="text-sm text-muted-foreground">
              Let's get started. Fill in the details below to create your
              account.
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

          <RadioGroup
            value={selectedSize}
            onValueChange={setSelectedSize}
            className="space-y-3"
          >
            {sizes.map((size) => (
              <label
                key={size.id}
                className={`flex items-center gap-3 p-4 rounded-3xl border cursor-pointer ${
                  selectedSize === size.id
                    ? 'bg-accent border-primary'
                    : 'hover:bg-accent/50'
                }`}
              >
                <RadioGroupItem value={size.id} id={size.id} />
                <div className="w-16 h-16 bg-background rounded" />
                <span
                  className={`flex-1 text-sm font-medium ${
                    selectedSize === size.id
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {size.label}
                </span>
                <Badge
                  variant="outline"
                  className={
                    selectedSize === size.id
                      ? 'border-primary text-primary'
                      : 'text-muted-foreground'
                  }
                >
                  {size.diff || size.price}
                </Badge>
              </label>
            ))}
          </RadioGroup>

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
