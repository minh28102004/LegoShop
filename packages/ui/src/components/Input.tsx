import * as React from 'react'

import { cn } from '../cn'
import type { FieldState } from '../types'

type InputSize = 'md' | 'lg'

export interface InputProps
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'size'> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fieldState?: FieldState
  invalid?: boolean
  size?: InputSize
}

const SIZE_CLASS: Record<InputSize, string> = {
  md: 'min-h-[42px] rounded-[12px] px-3 py-[11px] text-sm',
  lg: 'min-h-11 rounded-[14px] px-4 py-3 text-sm',
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      error,
      fieldState,
      hint,
      id,
      invalid = false,
      label,
      leftIcon,
      name,
      required,
      rightIcon,
      size = 'md',
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId()
    const inputId = id ?? name ?? generatedId
    const hintId = `${inputId}-hint`
    const errorId = `${inputId}-error`
    const describedBy = error ? errorId : hint ? hintId : undefined
    const hasError = invalid || Boolean(error) || fieldState === 'error'

    return (
      <div className="w-full space-y-2">
        {label ? (
          <label htmlFor={inputId} className="block text-sm font-semibold text-slate-900">
            {label}
            {required ? <span className="text-red-500"> *</span> : null}
          </label>
        ) : null}
        <div className="relative">
          {leftIcon ? (
            <span className="pointer-events-none absolute left-3 top-1/2 z-10 flex -translate-y-1/2 text-[#2f91d0]">
              {leftIcon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            name={name}
            required={required}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            className={cn(
              'w-full border border-[#cbd5e1] bg-white text-slate-900 outline-none transition-[border-color,background-color,box-shadow] duration-90 ease-out placeholder:text-slate-400 focus:border-[#63afe3] focus:shadow-[inset_0_0_0_1px_rgba(99,175,227,0.82)] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400',
              SIZE_CLASS[size],
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              hasError &&
                'border-red-300 focus:border-red-300 focus:shadow-[inset_0_0_0_1px_#fca5a5]',
              className,
            )}
            {...props}
          />
          {rightIcon ? (
            <span className="pointer-events-none absolute right-3 top-1/2 z-10 flex -translate-y-1/2 text-slate-400">
              {rightIcon}
            </span>
          ) : null}
        </div>
        {error ? (
          <p id={errorId} className="text-sm text-red-600">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-sm text-slate-500">
            {hint}
          </p>
        ) : null}
      </div>
    )
  },
)

Input.displayName = 'Input'
