'use client'

import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/cn'
import type { FieldState } from '@/types'

const selectTriggerVariants = cva(
  'flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-left text-body-md text-text-primary shadow-xs transition-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60 data-[placeholder]:text-text-muted',
  {
    variants: {
      state: {
        default: '',
        error: 'border-error focus:border-error focus:ring-error/20',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  },
)

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
      'defaultValue' | 'dir' | 'onValueChange' | 'value'
    >,
    VariantProps<typeof selectTriggerVariants> {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  hint?: string
  name?: string
  required?: boolean
  fieldState?: FieldState
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      defaultValue,
      error,
      fieldState,
      hint,
      id,
      label,
      name,
      onValueChange,
      options,
      placeholder = 'Chọn một tùy chọn',
      required,
      state,
      value,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId()
    const selectId = id ?? name ?? generatedId
    const hintId = `${selectId}-hint`
    const errorId = `${selectId}-error`
    const describedBy = error ? errorId : hint ? hintId : undefined
    const visualState = error || fieldState === 'error' ? 'error' : state
    const rootProps: React.ComponentPropsWithoutRef<
      typeof SelectPrimitive.Root
    > = {}

    if (value !== undefined) {
      rootProps.value = value
    }

    if (defaultValue !== undefined) {
      rootProps.defaultValue = defaultValue
    }

    if (onValueChange !== undefined) {
      rootProps.onValueChange = onValueChange
    }

    if (name !== undefined) {
      rootProps.name = name
    }

    if (required !== undefined) {
      rootProps.required = required
    }

    return (
      <div className="w-full space-y-2">
        {label ? (
          <label
            htmlFor={selectId}
            className="block text-body-sm font-semibold text-text-primary"
          >
            {label}
            {required ? <span className="text-error"> *</span> : null}
          </label>
        ) : null}
        <SelectPrimitive.Root {...rootProps}>
          <SelectPrimitive.Trigger
            ref={ref}
            id={selectId}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              selectTriggerVariants({ state: visualState }),
              className,
            )}
            {...props}
          >
            <SelectPrimitive.Value placeholder={placeholder} />
            <SelectPrimitive.Icon className="ml-2 text-text-muted">
              v
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              position="popper"
              sideOffset={6}
              className="z-z-popover max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg"
            >
              <SelectPrimitive.Viewport className="p-1">
                {options.map((option) => {
                  const itemProps: React.ComponentPropsWithoutRef<
                    typeof SelectPrimitive.Item
                  > = {
                    value: option.value,
                    className:
                      'relative flex min-h-10 cursor-pointer select-none items-center rounded-sm px-3 py-2 pr-8 text-body-sm outline-none transition-base data-[disabled]:pointer-events-none data-[highlighted]:bg-surface-hover data-[disabled]:opacity-50',
                  }

                  if (option.disabled !== undefined) {
                    itemProps.disabled = option.disabled
                  }

                  return (
                    <SelectPrimitive.Item key={option.value} {...itemProps}>
                      <SelectPrimitive.ItemText>
                        {option.label}
                      </SelectPrimitive.ItemText>
                      <SelectPrimitive.ItemIndicator className="absolute right-3 text-primary">
                        ✓
                      </SelectPrimitive.ItemIndicator>
                    </SelectPrimitive.Item>
                  )
                })}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
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

Select.displayName = 'Select'
