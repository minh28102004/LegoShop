'use client'

import * as React from 'react'
import { AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/cn'
import { selectToasts, useUIStore } from '@/stores/uiStore'
import { Toast } from './Toast'

export interface ToastContainerProps
  extends React.ComponentPropsWithoutRef<'div'> {
  ariaLabel?: string
}

export const ToastContainer = React.forwardRef<
  HTMLDivElement,
  ToastContainerProps
>(({ ariaLabel = 'Thông báo', className, ...props }, ref) => {
  const toasts = useUIStore(selectToasts)
  const dismissToast = useUIStore((state) => state.dismissToast)

  return (
    <div
      ref={ref}
      aria-label={ariaLabel}
      aria-live="polite"
      className={cn(
        'fixed right-4 top-4 z-z-toast flex w-[min(420px,calc(100vw-32px))] flex-col gap-3',
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
            onDismiss={dismissToast}
          />
        ))}
      </AnimatePresence>
    </div>
  )
})

ToastContainer.displayName = 'ToastContainer'
