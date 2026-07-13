'use client'

import * as React from 'react'

import { cn, type FieldState } from '@lego-shop/ui'

export interface InputProps
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'size'> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fieldState?: FieldState
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      error,
      hint,
      id,
      label,
      leftIcon,
      name,
      required,
      rightIcon,
      fieldState,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId()
    const inputId = id ?? name ?? generatedId
    const hintId = `${inputId}-hint`
    const errorId = `${inputId}-error`
    const describedBy = error ? errorId : hint ? hintId : undefined
    const hasError = Boolean(error) || fieldState === 'error'

    return (
      <div className="w-full space-y-2">
        {label ? (
          <label
            htmlFor={inputId}
            className="block text-body-sm font-semibold text-text-primary"
          >
            {label}
            {required ? <span className="text-error"> *</span> : null}
          </label>
        ) : null}
        <div className="relative">
          {leftIcon ? (
            <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-text-muted">
              {leftIcon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            name={name}
            required={required}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            className={cn(
              'h-11 w-full rounded-md border border-input bg-background px-3 text-body-md text-text-primary shadow-xs transition-base placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              hasError && 'border-error focus:border-error focus:ring-error/20',
              className,
            )}
            {...props}
          />
          {rightIcon ? (
            <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 text-text-muted">
              {rightIcon}
            </span>
          ) : null}
        </div>
        {error ? (
          <p id={errorId} className="text-body-sm text-error">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-body-sm text-text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    )
  },
)

Input.displayName = 'Input'
