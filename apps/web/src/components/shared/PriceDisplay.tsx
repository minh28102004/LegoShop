'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  calcDiscountPercent,
  formatCurrency as formatPrice,
} from '@lego-shop/shared'

import { Badge } from '@/components/ui'
import { cn, type Size } from '@lego-shop/ui'

const priceDisplayVariants = cva('inline-flex items-baseline gap-2', {
  variants: {
    size: {
      sm: 'text-body-sm',
      md: 'text-body-md',
      lg: 'text-body-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export interface PriceDisplayProps
  extends React.ComponentPropsWithoutRef<'div'>,
    Omit<VariantProps<typeof priceDisplayVariants>, 'size'> {
  price: number
  salePrice?: number
  compareAtPrice?: number
  size?: Extract<Size, 'sm' | 'md' | 'lg'>
}

export const PriceDisplay = React.forwardRef<HTMLDivElement, PriceDisplayProps>(
  ({ className, compareAtPrice, price, salePrice, size, ...props }, ref) => {
    const displayPrice = salePrice ?? price
    const originalPrice = salePrice !== undefined ? price : compareAtPrice
    const discountPercent =
      originalPrice !== undefined
        ? calcDiscountPercent(originalPrice, displayPrice)
        : 0

    return (
      <div
        ref={ref}
        className={cn(priceDisplayVariants({ size }), className)}
        {...props}
      >
        <span className="font-semibold text-text-primary">
          {formatPrice(displayPrice)}
        </span>
        {originalPrice !== undefined && originalPrice > displayPrice ? (
          <span className="text-body-sm text-text-muted line-through">
            {formatPrice(originalPrice)}
          </span>
        ) : null}
        {discountPercent > 0 ? (
          <Badge variant="error" size="sm">
            -{discountPercent}%
          </Badge>
        ) : null}
      </div>
    )
  },
)

PriceDisplay.displayName = 'PriceDisplay'
