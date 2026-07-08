'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn, type ImageProps } from '@lego-shop/ui'

const cardVariants = cva('overflow-hidden rounded-card bg-card text-card-foreground', {
  variants: {
    variant: {
      flat: 'shadow-none',
      elevated: 'border border-border bg-surface shadow-soft',
      outlined: 'border border-border bg-surface shadow-none',
    },
    hoverable: {
      true: 'transition-base hover:-translate-y-1 hover:shadow-lg',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'flat',
    hoverable: false,
  },
})

export interface CardProps
  extends React.ComponentPropsWithoutRef<'div'>,
    VariantProps<typeof cardVariants> {
  hoverable?: boolean
}

export interface CardSectionProps extends React.ComponentPropsWithoutRef<'div'> {
  children?: React.ReactNode
}

export interface CardImageProps
  extends Omit<
      React.ComponentPropsWithoutRef<'img'>,
      'alt' | 'height' | 'src' | 'width'
    > {
  src: ImageProps['src']
  alt: ImageProps['alt']
  width?: ImageProps['width']
  height?: ImageProps['height']
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, hoverable }), className)}
      {...props}
    />
  ),
)

Card.displayName = 'Card'

export const CardHeader = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pb-4', className)} {...props} />
  ),
)

CardHeader.displayName = 'CardHeader'

export const CardBody = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  ),
)

CardBody.displayName = 'CardBody'

export const CardFooter = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center gap-3 border-t border-border p-6', className)}
      {...props}
    />
  ),
)

CardFooter.displayName = 'CardFooter'

export const CardImage = React.forwardRef<HTMLImageElement, CardImageProps>(
  ({ alt = '', className, ...props }, ref) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      alt={alt}
      className={cn('aspect-video w-full object-cover', className)}
      {...props}
    />
  ),
)

CardImage.displayName = 'CardImage'
