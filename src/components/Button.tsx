'use client';

import { Button as BaseButton } from '@base-ui-components/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const buttonVariants = cva('text-base justify-center flex items-center gap-2 w-fit capitalize active:scale-[98%] transition duration-200 ease-out', {
  variants: {
    variant: {
      primary: 'bg-neutral-800 hover:bg-neutral-800/90 active:bg-neutral-700 border border-neutral-800 text-neutral-100',
      secondary: 'bg-neutral-300 hover:bg-neutral-300/90 active:bg-neutral-500 border border-neutral-400 text-neutral-800',
    },
    size: {
      md: 'px-5 py-2.5 rounded-xs',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <BaseButton className={buttonVariants({ variant, size, className })} {...props} />;
}
