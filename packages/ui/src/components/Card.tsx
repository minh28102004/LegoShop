import * as React from 'react'

import { cn } from '../cn'

export interface CardProps extends React.ComponentPropsWithoutRef<'section'> {
  hover?: boolean
  hoverable?: boolean
  variant?: 'surface' | 'flat' | 'outlined' | 'elevated'
}

export interface CardSectionProps extends React.ComponentPropsWithoutRef<'div'> {
  children?: React.ReactNode
}

export interface CardImageProps
  extends React.ComponentPropsWithoutRef<'img'> {}

export const Card = React.forwardRef<HTMLElement, CardProps>(
  (
    {
      className,
      hover = false,
      hoverable = false,
      variant = 'surface',
      ...props
    },
    ref,
  ) => (
    <section
      ref={ref}
      className={cn(
        'overflow-hidden rounded-[20px] transition-all duration-200 ease-out',
        variant === 'surface' &&
          'border-0 bg-white shadow-[0_0_0_1px_rgba(226,232,240,0.72),0_16px_34px_-28px_rgba(15,23,42,0.32),0_3px_10px_-8px_rgba(15,23,42,0.18)]',
        variant === 'elevated' &&
          'border border-[#dce8f3] bg-white shadow-[0_12px_30px_rgba(16,32,51,0.08)]',
        variant === 'outlined' && 'border border-[#dce8f3] bg-white shadow-none',
        variant === 'flat' && 'bg-white shadow-none',
        (hover || hoverable) &&
          'hover:shadow-[0_0_0_1px_rgba(99,175,227,0.42),0_18px_36px_-28px_rgba(15,23,42,0.26)]',
        className,
      )}
      {...props}
    />
  ),
)

Card.displayName = 'Card'

export const CardHeader = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col gap-3 px-5 py-[18px] shadow-[0_1px_0_rgba(226,232,240,0.72)] sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-5',
        className,
      )}
      {...props}
    />
  ),
)

CardHeader.displayName = 'CardHeader'

export const CardBody = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-5 py-5 sm:px-6 sm:py-6', className)} {...props} />
  ),
)

CardBody.displayName = 'CardBody'

export const CardFooter = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-wrap items-center justify-end gap-3 bg-slate-50 px-5 py-4 shadow-[0_-1px_0_rgba(226,232,240,0.72)] sm:px-6 sm:py-5',
        className,
      )}
      {...props}
    />
  ),
)

CardFooter.displayName = 'CardFooter'

export const CardImage = React.forwardRef<HTMLImageElement, CardImageProps>(
  ({ alt = '', className, ...props }, ref) => (
    <img
      ref={ref}
      alt={alt}
      className={cn('aspect-video w-full object-cover', className)}
      {...props}
    />
  ),
)

CardImage.displayName = 'CardImage'
