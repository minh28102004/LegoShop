'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@lego-shop/ui'

const sectionVariants = cva('py-14 md:py-20 xl:py-24', {
  variants: {
    background: {
      white: 'bg-background text-text-primary',
      surface: 'bg-surface text-text-primary',
      dark: 'bg-dark text-text-inverse',
    },
  },
  defaultVariants: {
    background: 'white',
  },
})

export interface SectionProps
  extends React.ComponentPropsWithoutRef<'section'>,
    VariantProps<typeof sectionVariants> {}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ background, className, ...props }, ref) => (
    <section
      ref={ref}
      className={cn(sectionVariants({ background }), className)}
      {...props}
    />
  ),
)

Section.displayName = 'Section'
