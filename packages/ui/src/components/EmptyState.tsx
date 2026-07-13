import * as React from 'react'
import { FileText } from 'lucide-react'

import type { EmptyStateConfig } from '../types'
import { Button } from './Button'
import { Card, CardBody } from './Card'

export interface EmptyStateProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'title'>,
    EmptyStateConfig {}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ action, className, description, icon: Icon, title, ...props }, ref) => {
    const iconNode = Icon ? (
      <Icon className="size-8" />
    ) : (
      <FileText className="size-8" aria-hidden="true" />
    )

    return (
      <div ref={ref} className={className} {...props}>
        <Card className="text-center">
          <CardBody className="py-10">
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border border-slate-200 bg-slate-50 text-slate-400">
              {iconNode}
            </span>
            <p className="text-lg font-semibold text-slate-900">{title}</p>
            {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
            {action ? (
              <div className="mt-4 flex justify-center">
                {action.href ? (
                  <Button asChild>
                    <a href={action.href}>{action.label}</a>
                  </Button>
                ) : (
                  <Button onClick={action.onClick}>{action.label}</Button>
                )}
              </div>
            ) : null}
          </CardBody>
        </Card>
      </div>
    )
  },
)

EmptyState.displayName = 'EmptyState'
