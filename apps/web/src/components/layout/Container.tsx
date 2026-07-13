'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn, type Size } from '@lego-shop/ui'

const containerVariants = cva('mx-auto w-full px-4 sm:px-6 lg:px-8', {
  variants: {
    size: {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-2xl',
      full: 'max-w-none',
    },
  },
  defaultVariants: {
    size: 'xl',
  },
})

export interface ContainerProps
  extends React.ComponentPropsWithoutRef<'div'>,
    Omit<VariantProps<typeof containerVariants>, 'size'> {
  size?: Extract<Size, 'sm' | 'md' | 'lg' | 'xl'> | 'full'
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('container-custom', containerVariants({ size }), className)}
      {...props}
    />
  ),
)

Container.displayName = 'Container'
