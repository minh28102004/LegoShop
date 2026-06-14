'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/cn'
import type { Size, Variant } from '@/types'
import { Spinner } from './Spinner'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-surface-hover',
        ghost: 'bg-transparent text-text-primary hover:bg-surface',
        outline:
          'border border-border bg-background text-text-primary hover:bg-surface',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:opacity-90',
      },
      size: {
        sm: 'h-9 px-3 text-body-sm',
        md: 'h-11 px-4 text-body-md',
        lg: 'h-12 px-6 text-body-md',
        xl: 'h-14 px-8 text-body-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export type ButtonVariant = Exclude<Variant, 'link'>
export type ButtonSize = Extract<Size, 'sm' | 'md' | 'lg' | 'xl'>

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<'button'>,
    Omit<VariantProps<typeof buttonVariants>, 'variant' | 'size'> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild = false,
      className,
      children,
      disabled,
      isLoading = false,
      leftIcon,
      rightIcon,
      size,
      type = 'button',
      variant,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'
    const isDisabled = disabled || isLoading

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={asChild ? undefined : isDisabled}
        aria-disabled={asChild && isDisabled ? true : undefined}
        type={asChild ? undefined : type}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" />
            <span>Đang xử lý...</span>
          </>
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </Comp>
    )
  },
)

Button.displayName = 'Button'
