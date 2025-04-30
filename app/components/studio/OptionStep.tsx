import {RadioGroup, RadioGroupItem} from '~/components/ui/radio-group';
import {Badge} from '~/components/ui/badge';
import {type OptionValue, formatPrice} from './types';

export function OptionStep({
  options,
  selectedValue,
  onChange,
}: {
  options: OptionValue[];
  selectedValue: string;
  onChange: (value: string) => void;
}) {
  return (
    <RadioGroup
      value={selectedValue || ''}
      onValueChange={onChange}
      className="space-y-3"
    >
      {options.map((option) => (
        <label
          key={option.handle}
          className={`flex items-center gap-3 p-4 rounded-3xl  cursor-pointer ${
            selectedValue === option.handle ? 'bg-accent' : 'hover:bg-accent/50'
          }`}
        >
          <RadioGroupItem value={option.handle} id={option.handle} />
          <div className="w-16 h-16 bg-background rounded" />
          <span
            className={`flex-1 text-sm font-medium ${
              selectedValue === option.handle
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            {option.name}
          </span>
          <Badge
            variant="outline"
            className={
              selectedValue === option.handle
                ? 'text-primary'
                : 'text-muted-foreground'
            }
          >
            {formatPrice(option.price)}
          </Badge>
        </label>
      ))}
    </RadioGroup>
  );
}
