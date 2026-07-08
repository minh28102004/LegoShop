'use client'

import * as React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { CheckCircle2, CircleAlert, Info, TriangleAlert } from 'lucide-react'

import { cn, type ToastAction, type ToastType } from '@lego-shop/ui'

export interface ToastProps
  extends HTMLMotionProps<'div'> {
  id: string
  type: ToastType
  title: string
  message?: string | undefined
  action?: ToastAction | undefined
  duration?: number | undefined
  onDismiss?: ((toastId: string) => void) | undefined
}

function getToastIcon(type: ToastType): React.ReactNode {
  if (type === 'success') {
    return <CheckCircle2 className="h-5 w-5 text-[#16a34a]" strokeWidth={2.2} />
  }

  if (type === 'error') {
    return <CircleAlert className="h-5 w-5 text-[#dc2626]" strokeWidth={2.2} />
  }

  if (type === 'warning') {
    return <TriangleAlert className="h-5 w-5 text-[#d97706]" strokeWidth={2.2} />
  }

  return <Info className="h-5 w-5 text-[#2f91d0]" strokeWidth={2.2} />
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
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-[0_18px_38px_-28px_rgba(15,23,42,0.35)]',
          className,
        )}
        {...props}
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0">{getToastIcon(type)}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800">{title}</p>
            {message ? (
              <p className="mt-1 text-sm font-medium text-slate-500">{message}</p>
            ) : null}
            {action ? (
              <button
                type="button"
                className="mt-2 text-sm font-semibold text-[#2f91d0] transition-colors hover:text-[#1f6fb0]"
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ) : null}
          </div>
        </div>
      </motion.div>
    )
  },
)

Toast.displayName = 'Toast'
