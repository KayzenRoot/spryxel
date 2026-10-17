import { Slot } from '@radix-ui/react-slot';
import type { ButtonHTMLAttributes, ComponentProps } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: 'primary' | 'secondary';
};

export function Button({
  asChild = false,
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const sharedProps = {
    ...props,
    className: `spryxel-button ${className}`.trim(),
    'data-variant': variant,
  };

  if (asChild) {
    return <Slot {...(sharedProps as ComponentProps<typeof Slot>)}>{children}</Slot>;
  }

  return <button {...sharedProps}>{children}</button>;
}
