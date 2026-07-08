import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '@lego-shop/ui'

export function PageContainer({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn('mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8', className)}
      {...props}
    />
  )
}
