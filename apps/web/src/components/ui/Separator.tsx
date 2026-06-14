'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/cn'
import type { Size } from '@/types'

const separatorVariants = cva('shrink-0 bg-border', {
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'h-full w-px',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
})

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<'div'>,
    VariantProps<typeof separatorVariants> {
  size?: Extract<Size, 'sm' | 'md'>
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    { children, className, orientation = 'horizontal', role = 'separator', ...props },
    ref,
  ) => {
    if (children && orientation === 'horizontal') {
      return (
        <div
          ref={ref}
          role={role}
          aria-orientation={orientation}
          className={cn('flex w-full items-center gap-3', className)}
          {...props}
        >
          <span className="h-px flex-1 bg-border" />
          <span className="text-body-sm text-text-muted">{children}</span>
          <span className="h-px flex-1 bg-border" />
        </div>
      )
    }

    return (
      <div
        ref={ref}
        role={role}
        aria-orientation={orientation ?? 'horizontal'}
        className={cn(separatorVariants({ orientation }), className)}
        {...props}
      />
    )
  },
)

Separator.displayName = 'Separator'
