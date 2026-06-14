'use client'

import * as React from 'react'
import { Minus, Plus } from 'lucide-react'

import { cn } from '@/lib/cn'
import type { Size } from '@/types'

export interface QuantitySelectorProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  disabled?: boolean
  size?: Extract<Size, 'sm' | 'md'>
}

const DEBOUNCE_DELAY_MS = 300

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(Math.trunc(value), min), max)
}

export const QuantitySelector = React.forwardRef<
  HTMLDivElement,
  QuantitySelectorProps
>(
  (
    {
      className,
      disabled = false,
      max = 99,
      min = 1,
      onChange,
      size = 'md',
      value,
      ...props
    },
    ref,
  ) => {
    const [localValue, setLocalValue] = React.useState<number>(() =>
      clamp(value, min, max),
    )
    const didMountRef = React.useRef<boolean>(false)

    React.useEffect(() => {
      setLocalValue(clamp(value, min, max))
    }, [max, min, value])

    React.useEffect(() => {
      if (!didMountRef.current) {
        didMountRef.current = true
        return undefined
      }

      if (typeof window === 'undefined') {
        return undefined
      }

      const timeoutId = window.setTimeout(() => {
        onChange(localValue)
      }, DEBOUNCE_DELAY_MS)

      return () => {
        window.clearTimeout(timeoutId)
      }
    }, [localValue, onChange])

    const updateValue = React.useCallback(
      (nextValue: number): void => {
        setLocalValue(clamp(nextValue, min, max))
      },
      [max, min],
    )

    return (
      <div
        ref={ref}
        className={cn(
          'inline-grid grid-cols-[auto_3rem_auto] items-center overflow-hidden rounded-md border border-border bg-background',
          size === 'sm' && 'grid-cols-[auto_2.5rem_auto]',
          disabled && 'opacity-60',
          className,
        )}
        {...props}
      >
        <button
          type="button"
          aria-label="Giảm số lượng"
          disabled={disabled || localValue <= min}
          className="flex size-10 items-center justify-center text-text-secondary transition-base hover:bg-surface disabled:pointer-events-none disabled:opacity-40"
          onClick={() => updateValue(localValue - 1)}
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <input
          aria-label="Số lượng"
          type="number"
          min={min}
          max={max}
          disabled={disabled}
          value={localValue}
          className="h-10 border-x border-border bg-background text-center text-body-sm font-semibold text-text-primary outline-none"
          onChange={(event) => updateValue(Number(event.target.value))}
        />
        <button
          type="button"
          aria-label="Tăng số lượng"
          disabled={disabled || localValue >= max}
          className="flex size-10 items-center justify-center text-text-secondary transition-base hover:bg-surface disabled:pointer-events-none disabled:opacity-40"
          onClick={() => updateValue(localValue + 1)}
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
    )
  },
)

QuantitySelector.displayName = 'QuantitySelector'
