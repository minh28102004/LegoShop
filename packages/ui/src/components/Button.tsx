'use client'

import * as React from 'react'
import { Slot, Slottable } from '@radix-ui/react-slot'

import { cn } from '../cn'
import { Spinner } from './Spinner'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'soft'
  | 'cancel'
  | 'remove'
  | 'accent'
  | 'outline'
  | 'destructive'

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<'button'> {
  asChild?: boolean
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'border border-[#63afe3] bg-[#63afe3] text-white shadow-[0_10px_20px_-18px_rgba(15,23,42,0.2)] hover:border-[#2f91d0] hover:bg-[#2f91d0] hover:text-white hover:shadow-[0_0_0_1px_rgba(99,175,227,0.42),0_18px_36px_-28px_rgba(15,23,42,0.26)] focus-visible:ring-[rgba(99,175,227,0.24)]',
  secondary:
    'border border-[#cbd5e1] bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-[#d7efff] hover:bg-[#edf8ff] hover:text-[#2f91d0] focus-visible:ring-[rgba(99,175,227,0.24)]',
  ghost:
    'border border-transparent bg-transparent text-slate-600 hover:bg-[#edf8ff] hover:text-[#2f91d0] focus-visible:ring-[rgba(99,175,227,0.24)]',
  danger:
    'border border-red-200 bg-white text-red-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:ring-red-100',
  destructive:
    'border border-red-200 bg-white text-red-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:ring-red-100',
  soft:
    'border border-[#d7efff] bg-[#edf8ff] text-[#2f91d0] shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:border-[#63afe3] hover:bg-[#d7efff] hover:text-[#2f91d0] focus-visible:ring-[rgba(99,175,227,0.24)]',
  cancel:
    'border border-[#cbd5e1] bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:ring-red-100',
  remove:
    'border border-[#cbd5e1] bg-white text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:ring-red-100',
  accent:
    'border border-[#f4cc45] bg-[#f4cc45] text-slate-900 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.16)] hover:border-[#d9ad21] hover:bg-[#d9ad21] hover:text-slate-900 focus-visible:ring-[rgba(244,204,69,0.3)]',
  outline:
    'border border-[#cbd5e1] bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-[#d7efff] hover:bg-[#edf8ff] hover:text-[#2f91d0] focus-visible:ring-[rgba(99,175,227,0.24)]',
}

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'min-h-10 rounded-[10px] px-3 py-2 text-[13px]',
  md: 'min-h-[42px] rounded-[12px] px-4 py-2.5 text-sm',
  lg: 'min-h-11 rounded-[14px] px-[18px] py-2.5 text-sm',
  xl: 'min-h-12 rounded-[16px] px-5 py-3 text-[15px]',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild = false,
      children,
      className,
      disabled,
      isLoading = false,
      loading = false,
      leftIcon,
      rightIcon,
      size = 'md',
      type = 'button',
      variant = 'primary',
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'
    const isBusy = isLoading || loading

    return (
      <Comp
        ref={ref}
        className={cn(
          'group inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold leading-none transition-[background-color,border-color,color,box-shadow,transform] duration-75 ease-out focus-visible:outline-none focus-visible:ring-4 active:scale-[0.985] active:duration-0 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 disabled:opacity-55',
          VARIANT_CLASS[variant],
          SIZE_CLASS[size],
          className,
        )}
        disabled={asChild ? undefined : disabled || isBusy}
        aria-disabled={asChild && (disabled || isBusy) ? true : undefined}
        type={asChild ? undefined : type}
        {...props}
      >
        {isBusy ? (
          <Spinner
            size="sm"
            label="Loading button action"
            className="border-current/30 border-t-current"
          />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        <Slottable>{children}</Slottable>
        {!isBusy && rightIcon ? (
          <span className="shrink-0 transition-transform duration-150 ease-out group-hover:translate-x-0.5">
            {rightIcon}
          </span>
        ) : null}
      </Comp>
    )
  },
)

Button.displayName = 'Button'
