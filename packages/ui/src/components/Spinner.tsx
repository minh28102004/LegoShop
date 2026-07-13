import type { HTMLAttributes } from 'react'

import { cn } from '../cn'

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize
  label?: string
}

const SIZE_CLASS: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-[3px]',
  lg: 'h-8 w-8 border-4',
  xl: 'h-10 w-10 border-4',
}

export function Spinner({
  size = 'md',
  label = 'Loading',
  className,
  ...props
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-flex shrink-0 animate-spin rounded-full border-slate-200 border-t-[#63afe3]',
        SIZE_CLASS[size],
        className,
      )}
      {...props}
    />
  )
}
