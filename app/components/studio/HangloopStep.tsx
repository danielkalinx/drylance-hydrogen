import {RadioGroup, RadioGroupItem} from '~/components/ui/radio-group';
import {Badge} from '~/components/ui/badge';
import {type OptionValue, formatPrice} from './types';

export function HangloopStep({
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
      className="grid grid-cols-3 gap-3"
    >
      {options.map((option) => (
        <label
          key={option.handle}
          className={`flex flex-col items-center gap-2 p-3 rounded-xl border cursor-pointer ${
            selectedValue === option.handle
              ? 'bg-accent border-primary'
              : 'hover:bg-accent/50'
          }`}
        >
          <div className="w-16 h-16 bg-background rounded flex items-center justify-center">
            <RadioGroupItem value={option.handle} id={option.handle} />
          </div>
          <span
            className={`text-center text-sm font-medium ${
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
                ? 'border-primary text-primary'
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
