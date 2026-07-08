'use client'

import * as React from 'react'

import { cn, type Size } from '@lego-shop/ui'
import { Container } from './Container'

export interface PageWrapperProps extends React.ComponentPropsWithoutRef<'main'> {
  maxWidth?: Extract<Size, 'sm' | 'md' | 'lg' | 'xl'> | 'full'
}

export const PageWrapper = React.forwardRef<HTMLElement, PageWrapperProps>(
  ({ children, className, maxWidth = 'xl', ...props }, ref) => (
    <main ref={ref} className={cn('min-h-dvh py-10', className)} {...props}>
      <Container size={maxWidth}>{children}</Container>
    </main>
  ),
)

PageWrapper.displayName = 'PageWrapper'
