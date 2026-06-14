'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/cn'
import type { Size } from '@/types'

const tooltipVariants = cva(
  'pointer-events-none absolute z-z-tooltip max-w-xs rounded-md bg-dark px-3 py-2 text-body-sm text-text-inverse shadow-lg',
  {
    variants: {
      position: {
        top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
        bottom: 'left-1/2 top-full mt-2 -translate-x-1/2',
        left: 'right-full top-1/2 mr-2 -translate-y-1/2',
        right: 'left-full top-1/2 ml-2 -translate-y-1/2',
      },
    },
    defaultVariants: {
      position: 'top',
    },
  },
)

export interface TooltipProps
  extends Omit<React.ComponentPropsWithoutRef<'span'>, 'content'>,
    VariantProps<typeof tooltipVariants> {
  content: React.ReactNode
  delay?: number
  size?: Extract<Size, 'sm' | 'md'>
}

export const Tooltip = React.forwardRef<HTMLSpanElement, TooltipProps>(
  (
    {
      children,
      className,
      content,
      delay = 200,
      position,
      size,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = React.useState<boolean>(false)
    const timeoutRef = React.useRef<number | null>(null)
    const tooltipId = React.useId()

    const openTooltip = React.useCallback((): void => {
      if (typeof window === 'undefined') {
        return
      }

      timeoutRef.current = window.setTimeout(() => {
        setIsOpen(true)
      }, delay)
    }, [delay])

    const closeTooltip = React.useCallback((): void => {
      if (typeof window !== 'undefined' && timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }

      setIsOpen(false)
    }, [])

    React.useEffect(() => {
      return () => {
        if (typeof window !== 'undefined' && timeoutRef.current !== null) {
          window.clearTimeout(timeoutRef.current)
        }
      }
    }, [])

    return (
      <span
        ref={ref}
        className={cn('relative inline-flex', className)}
        aria-describedby={isOpen ? tooltipId : undefined}
        onBlur={closeTooltip}
        onFocus={openTooltip}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        {...props}
      >
        {children}
        <AnimatePresence>
          {isOpen ? (
            <motion.span
              id={tooltipId}
              role="tooltip"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className={cn(
                tooltipVariants({ position }),
                size === 'sm' && 'px-2 py-1 text-body-xs',
              )}
            >
              {content}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
    )
  },
)

Tooltip.displayName = 'Tooltip'
