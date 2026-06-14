'use client'

import * as React from 'react'

import { Rating } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { Size } from '@/types'

export interface StarRatingProps extends React.ComponentPropsWithoutRef<'div'> {
  rating: number
  count?: number | undefined
  showCount?: boolean
  size?: Extract<Size, 'sm' | 'md' | 'lg'>
}

export const StarRating = React.forwardRef<HTMLDivElement, StarRatingProps>(
  ({ className, count, rating, showCount = true, size = 'sm', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('inline-flex items-center gap-2', className)}
      {...props}
    >
      <Rating value={rating} size={size} readonly />
      <span className="text-body-sm text-text-muted">
        {rating.toFixed(1)}
        {showCount && count !== undefined ? ` (${count} đánh giá)` : null}
      </span>
    </div>
  ),
)

StarRating.displayName = 'StarRating'
