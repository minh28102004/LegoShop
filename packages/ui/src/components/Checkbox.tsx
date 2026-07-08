import * as React from 'react'

import { cn } from '../cn'

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'type'> {
  label?: React.ReactNode
  description?: React.ReactNode
  containerClassName?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, containerClassName, description, label, ...props }, ref) => (
    <label
      className={cn(
        'flex items-start gap-3 rounded-[22px] border border-[#cbd5e1] bg-white px-4 py-3.5',
        containerClassName,
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          'mt-0.5 h-5 w-5 rounded-md border-slate-300 text-[#63afe3] shadow-sm focus:ring-4 focus:ring-[rgba(99,175,227,0.24)] focus:ring-offset-0',
          className,
        )}
        {...props}
      />
      {label || description ? (
        <span className="space-y-1">
          {label ? <span className="block text-[13px] font-semibold text-slate-800">{label}</span> : null}
          {description ? (
            <span className="block text-[13px] leading-6 text-slate-500">{description}</span>
          ) : null}
        </span>
      ) : null}
    </label>
  ),
)

Checkbox.displayName = 'Checkbox'
