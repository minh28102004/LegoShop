'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn, type Size } from '@lego-shop/ui'

const badgeVariants = cva(
  'inline-flex w-fit items-center rounded-full border font-semibold',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-surface-soft text-muted',
        primary: 'border-transparent bg-primary text-primary-foreground',
        success: 'border-transparent bg-success-soft text-success',
        warning: 'border-transparent bg-warning-soft text-warning',
        error: 'border-transparent bg-error text-text-inverse',
        outline: 'border-border bg-background text-navy',
      },
      size: {
        sm: 'px-2 py-0.5 text-body-xs',
        md: 'px-3 py-1 text-body-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'outline'
export type BadgeSize = Extract<Size, 'sm' | 'md'>

export interface BadgeProps
  extends React.ComponentPropsWithoutRef<'span'>,
    Omit<VariantProps<typeof badgeVariants>, 'variant' | 'size'> {
  variant?: BadgeVariant
  size?: BadgeSize
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, size, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  ),
)

Badge.displayName = 'Badge'
