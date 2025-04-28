import * as React from 'react';
import {Slot} from '@radix-ui/react-slot';
import {cva, type VariantProps} from 'class-variance-authority';

import {cn} from '~/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[14px] font-light transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive font-poppins tracking-[-0.018em] leading-[1.43] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 border border-transparent',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-transparent',
        outline:
          'border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent',
        ghost:
          'bg-transparent text-primary hover:bg-accent hover:text-accent-foreground border border-transparent',
        link: 'text-primary underline-offset-4 hover:underline bg-transparent border border-transparent',
      },
      size: {
        default: 'h-14 px-6 py-0',
        sm: 'h-10 px-3 py-0',
        lg: 'h-16 px-9 py-0',
        icon: 'size-14 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({variant, size, className}))}
      {...props}
    />
  );
}

export {Button, buttonVariants};
