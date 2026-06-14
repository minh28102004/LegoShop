'use client'

import * as React from 'react'

import { cn } from '@/lib/cn'
import type { FieldState } from '@/types'

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'type'> {
  label: string
  description?: string
  error?: string
  fieldState?: FieldState
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      description,
      error,
      fieldState,
      id,
      label,
      name,
      required,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId()
    const checkboxId = id ?? name ?? generatedId
    const descriptionId = `${checkboxId}-description`
    const errorId = `${checkboxId}-error`
    const describedBy = error ? errorId : description ? descriptionId : undefined
    const hasError = Boolean(error) || fieldState === 'error'

    return (
      <div className="space-y-2">
        <label
          htmlFor={checkboxId}
          className="grid cursor-pointer grid-cols-[auto_1fr] gap-3"
        >
          <input
            ref={ref}
            id={checkboxId}
            name={name}
            type="checkbox"
            required={required}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            className={cn(
              'mt-0.5 size-5 appearance-none rounded-sm border border-input bg-background transition-base checked:border-primary checked:bg-primary focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60',
              'checked:bg-[linear-gradient(135deg,transparent_0_40%,hsl(var(--color-primary-foreground))_40%_60%,transparent_60%)]',
              hasError && 'border-error focus:ring-error/20',
              className,
            )}
            {...props}
          />
          <span className="space-y-1">
            <span className="block text-body-sm font-semibold text-text-primary">
              {label}
              {required ? <span className="text-error"> *</span> : null}
            </span>
            {description ? (
              <span
                id={descriptionId}
                className="block text-body-sm text-text-muted"
              >
                {description}
              </span>
            ) : null}
          </span>
        </label>
        {error ? (
          <p id={errorId} className="text-body-sm text-error">
            {error}
          </p>
        ) : null}
      </div>
    )
  },
)

Checkbox.displayName = 'Checkbox'
