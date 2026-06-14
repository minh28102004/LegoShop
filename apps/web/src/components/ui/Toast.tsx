'use client'

import * as React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/cn'
import type { ToastAction, ToastType } from '@/types'

const toastVariants = cva(
  'relative overflow-hidden rounded-md border bg-background p-4 text-text-primary shadow-lg',
  {
    variants: {
      type: {
        success: 'border-success',
        error: 'border-error',
        warning: 'border-warning',
        info: 'border-primary',
      },
    },
    defaultVariants: {
      type: 'info',
    },
  },
)

export interface ToastProps
  extends HTMLMotionProps<'div'>,
    Omit<VariantProps<typeof toastVariants>, 'type'> {
  id: string
  type: ToastType
  title: string
  message?: string | undefined
  action?: ToastAction | undefined
  duration?: number | undefined
  onDismiss?: ((toastId: string) => void) | undefined
}

function getProgressColor(type: ToastType): string {
  if (type === 'success') {
    return 'bg-success'
  }

  if (type === 'error') {
    return 'bg-error'
  }

  if (type === 'warning') {
    return 'bg-warning'
  }

  return 'bg-primary'
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      action,
      className,
      duration = 5000,
      id,
      message,
      onDismiss,
      title,
      type,
      ...props
    },
    ref,
  ) => {
    React.useEffect(() => {
      if (typeof window === 'undefined' || duration <= 0) {
        return undefined
      }

      const timeoutId = window.setTimeout(() => {
        onDismiss?.(id)
      }, duration)

      return () => {
        window.clearTimeout(timeoutId)
      }
    }, [duration, id, onDismiss])

    return (
      <motion.div
        ref={ref}
        layout
        role="status"
        initial={{ opacity: 0, x: 64 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 64 }}
        transition={{ duration: 0.25 }}
        className={cn(toastVariants({ type }), className)}
        {...props}
      >
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-body-sm font-semibold text-text-primary">
              {title}
            </p>
            {message ? (
              <p className="mt-1 text-body-sm text-text-secondary">
                {message}
              </p>
            ) : null}
            {action ? (
              <button
                type="button"
                className="mt-3 text-body-sm font-semibold text-primary transition-base hover:text-primary-hover"
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Đóng thông báo"
            className="rounded-sm px-1 text-text-muted transition-base hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            onClick={() => onDismiss?.(id)}
          >
            x
          </button>
        </div>
        {duration > 0 ? (
          <motion.span
            className={cn('absolute bottom-0 left-0 h-1', getProgressColor(type))}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
          />
        ) : null}
      </motion.div>
    )
  },
)

Toast.displayName = 'Toast'
