'use client'

import * as React from 'react'

import { cn, type Size } from '@lego-shop/ui'

export interface SkeletonProps extends React.ComponentPropsWithoutRef<'div'> {
  width?: number | string
  height?: number | string
  rounded?: boolean
  lines?: number
  size?: Extract<Size, 'sm' | 'md' | 'lg'>
}

function toCssLength(value: number | string | undefined): string | undefined {
  if (typeof value === 'number') {
    return `${value}px`
  }

  return value
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      height,
      lines,
      rounded = true,
      style,
      width,
      size = 'md',
      ...props
    },
    ref,
  ) => {
    const skeletonStyle: React.CSSProperties = {
      ...style,
    }
    const cssWidth = toCssLength(width)
    const cssHeight = toCssLength(height)

    if (cssWidth !== undefined) {
      skeletonStyle.width = cssWidth
    }

    if (cssHeight !== undefined) {
      skeletonStyle.height = cssHeight
    }

    if (lines !== undefined && lines > 1) {
      return (
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
          {Array.from({ length: lines }, (_, index) => (
            <div
              key={index}
              className={cn(
                'skeleton h-4 w-full',
                rounded && 'rounded-md',
                size === 'sm' && 'h-3',
                size === 'lg' && 'h-5',
                index === lines - 1 && 'w-3/4',
              )}
            />
          ))}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        style={skeletonStyle}
        className={cn(
          'skeleton min-h-4 w-full',
          rounded && 'rounded-md',
          size === 'sm' && 'min-h-3',
          size === 'lg' && 'min-h-5',
          className,
        )}
        {...props}
      />
    )
  },
)

Skeleton.displayName = 'Skeleton'
