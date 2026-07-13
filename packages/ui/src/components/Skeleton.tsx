import * as React from 'react'

import { cn } from '../cn'

export interface SkeletonProps extends React.ComponentPropsWithoutRef<'div'> {}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'animate-pulse rounded-[12px] bg-[linear-gradient(90deg,#ffffff_25%,#f8fafc_50%,#ffffff_75%)] bg-[length:200%_100%]',
        className,
      )}
      {...props}
    />
  ),
)

Skeleton.displayName = 'Skeleton'
