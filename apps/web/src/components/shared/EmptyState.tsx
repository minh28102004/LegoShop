'use client'

import * as React from 'react'
import Link from 'next/link'
import { PackageOpen } from 'lucide-react'

import { Button } from '@/components/ui'
import { cn, type EmptyStateConfig } from '@lego-shop/ui'

export interface EmptyStateProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'title'>,
    EmptyStateConfig {}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ action, className, description, icon: Icon, title, ...props }, ref) => {
    const iconNode = Icon ? (
      <Icon className="size-8" />
    ) : (
      <PackageOpen className="size-8" aria-hidden="true" />
    )

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center rounded-md border border-border bg-surface px-6 py-16 text-center',
          className,
        )}
        {...props}
      >
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-background text-text-muted shadow-sm">
          {iconNode}
        </div>
        <h3 className="text-display-sm text-text-primary">{title}</h3>
        {description ? (
          <p className="mt-2 max-w-content text-body-md text-text-secondary">
            {description}
          </p>
        ) : null}
        {action ? (
          <div className="mt-6">
            {action.href ? (
              <Button asChild>
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ) : (
              <Button onClick={action.onClick}>{action.label}</Button>
            )}
          </div>
        ) : null}
      </div>
    )
  },
)

EmptyState.displayName = 'EmptyState'
