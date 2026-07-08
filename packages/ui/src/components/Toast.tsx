'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from 'lucide-react'
import { createPortal } from 'react-dom'

import { cn } from '../cn'
import type { ToastAction, ToastItem, ToastType } from '../types'

export interface ToastProps {
  id: string
  type: ToastType
  title: string
  message?: string
  action?: ToastAction
  duration?: number
  onDismiss?: (toastId: string) => void
  className?: string
}

export interface ToastContainerProps extends React.ComponentPropsWithoutRef<'div'> {
  ariaLabel?: string
  toasts: ToastItem[]
  onDismiss?: (toastId: string) => void
}

export const HOT_TOAST_OPTIONS = {
  duration: 3200,
  className:
    '!rounded-[16px] !border !border-slate-200 !bg-white !px-4 !py-3 !text-sm !font-semibold !text-slate-800 !shadow-[0_18px_38px_-28px_rgba(15,23,42,0.35)]',
  success: {
    iconTheme: {
      primary: '#16a34a',
      secondary: '#ffffff',
    },
  },
  error: {
    iconTheme: {
      primary: '#dc2626',
      secondary: '#ffffff',
    },
  },
  loading: {
    duration: Number.POSITIVE_INFINITY,
  },
} as const

function getToastIcon(type: ToastType): React.ReactNode {
  if (type === 'success') {
    return <CheckCircle2 className="h-5 w-5 text-green-600" strokeWidth={2.2} />
  }
  if (type === 'error') {
    return <CircleAlert className="h-5 w-5 text-red-600" strokeWidth={2.2} />
  }
  if (type === 'warning') {
    return <TriangleAlert className="h-5 w-5 text-amber-600" strokeWidth={2.2} />
  }
  return <Info className="h-5 w-5 text-blue-600" strokeWidth={2.2} />
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ action, className, duration = 3200, id, message, onDismiss, title, type }, ref) => {
    React.useEffect(() => {
      if (typeof window === 'undefined' || duration <= 0) return undefined

      const timeoutId = window.setTimeout(() => {
        onDismiss?.(id)
      }, duration)

      return () => window.clearTimeout(timeoutId)
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
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0">{getToastIcon(type)}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800">{title}</p>
            {message ? <p className="mt-1 text-sm font-medium text-slate-500">{message}</p> : null}
            {action ? (
              <button
                type="button"
                className="mt-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-800"
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Đóng thông báo"
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            onClick={() => onDismiss?.(id)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    )
  },
)

Toast.displayName = 'Toast'

export const ToastContainer = React.forwardRef<HTMLDivElement, ToastContainerProps>(
  ({ ariaLabel = 'Thông báo', className, onDismiss, toasts, ...props }, ref) => {
    const container = (
      <div
        ref={ref}
        aria-label={ariaLabel}
        aria-live="polite"
        className={cn(
          'fixed right-4 top-4 z-[1500] flex w-[min(420px,calc(100vw-32px))] flex-col gap-2',
          className,
        )}
        {...props}
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              action={toast.action}
              duration={toast.duration}
              onDismiss={onDismiss}
            />
          ))}
        </AnimatePresence>
      </div>
    )

    return typeof document === 'undefined' ? container : createPortal(container, document.body)
  },
)

ToastContainer.displayName = 'ToastContainer'
