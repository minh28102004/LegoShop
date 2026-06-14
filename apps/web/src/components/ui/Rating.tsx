'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/cn'
import type { Size } from '@/types'

const ratingVariants = cva('inline-flex items-center', {
  variants: {
    size: {
      sm: 'gap-0.5 text-body-sm',
      md: 'gap-1 text-body-md',
      lg: 'gap-1.5 text-body-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export interface RatingProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'>,
    Omit<VariantProps<typeof ratingVariants>, 'size'> {
  value: number
  max?: number
  readonly?: boolean
  onChange?: (value: number) => void
  size?: Extract<Size, 'sm' | 'md' | 'lg'>
}

function getStarFill(value: number, index: number): 'full' | 'half' | 'empty' {
  const starValue = index + 1

  if (value >= starValue) {
    return 'full'
  }

  if (value >= starValue - 0.5) {
    return 'half'
  }

  return 'empty'
}

export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      className,
      max = 5,
      onChange,
      readonly = true,
      size,
      value,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        role={readonly ? 'img' : 'radiogroup'}
        aria-label={`${value} trên ${max} sao`}
        className={cn(ratingVariants({ size }), className)}
        {...props}
      >
        {Array.from({ length: max }, (_, index) => {
          const fill = getStarFill(value, index)
          const starValue = index + 1
          const star = (
            <span className="relative inline-block text-border">
              ★
              {fill !== 'empty' ? (
                <span
                  className={cn(
                    'absolute inset-0 overflow-hidden text-accent',
                    fill === 'half' && 'w-1/2',
                  )}
                >
                  ★
                </span>
              ) : null}
            </span>
          )

          if (readonly) {
            return <span key={starValue}>{star}</span>
          }

          return (
            <button
              key={starValue}
              type="button"
              role="radio"
              aria-checked={Math.round(value) === starValue}
              aria-label={`${starValue} sao`}
              className="rounded-sm transition-base focus:outline-none focus:ring-2 focus:ring-ring/20"
              onClick={() => onChange?.(starValue)}
            >
              {star}
            </button>
          )
        })}
      </div>
    )
  },
)

Rating.displayName = 'Rating'
