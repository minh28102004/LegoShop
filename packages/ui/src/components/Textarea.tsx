import * as React from 'react'

import { cn } from '../cn'

export interface TextareaProps
  extends React.ComponentPropsWithoutRef<'textarea'> {
  invalid?: boolean
  label?: string
  error?: string
  hint?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, error, hint, id, invalid = false, label, name, required, ...props },
    ref,
  ) => {
    const generatedId = React.useId()
    const textareaId = id ?? name ?? generatedId
    const hintId = `${textareaId}-hint`
    const errorId = `${textareaId}-error`
    const hasError = invalid || Boolean(error)
    const describedBy = error ? errorId : hint ? hintId : undefined

    return (
      <div className="w-full space-y-2">
        {label ? (
          <label htmlFor={textareaId} className="block text-sm font-semibold text-slate-900">
            {label}
            {required ? <span className="text-red-500"> *</span> : null}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          name={name}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={cn(
            'min-h-[120px] w-full resize-y rounded-[14px] border border-[#cbd5e1] bg-white px-4 py-2.5 text-sm leading-6 text-slate-900 outline-none transition-[border-color,background-color,box-shadow] duration-90 ease-out placeholder:text-slate-400 focus:border-[#63afe3] focus:shadow-[inset_0_0_0_1px_rgba(99,175,227,0.82)] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400',
            hasError &&
              'border-red-300 focus:border-red-300 focus:shadow-[inset_0_0_0_1px_#fca5a5]',
            className,
          )}
          {...props}
        />
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

Textarea.displayName = 'Textarea'
