'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, type HTMLMotionProps } from 'framer-motion'

import { cn } from '../cn'

type DrawerPosition = 'left' | 'right' | 'bottom'
type DrawerSize = 'sm' | 'md' | 'lg' | 'xl'

export interface DrawerProps
  extends Omit<HTMLMotionProps<'div'>, 'children' | 'title'> {
  isOpen?: boolean
  open?: boolean
  onClose: () => void
  title?: string
  position?: DrawerPosition
  size?: DrawerSize
  children: React.ReactNode
}

function getInitialPosition(position: DrawerPosition) {
  if (position === 'left') return { x: '-100%' }
  if (position === 'bottom') return { y: '100%' }
  return { x: '100%' }
}

function getDrawerSizeClass(position: DrawerPosition, size: DrawerSize) {
  if (position === 'bottom') {
    return {
      sm: 'h-80',
      md: 'h-96',
      lg: 'h-[520px]',
      xl: 'h-[680px]',
    }[size]
  }

  return {
    sm: 'w-80 max-w-[90vw]',
    md: 'w-96 max-w-[90vw]',
    lg: 'w-[480px] max-w-[90vw]',
    xl: 'w-[640px] max-w-[90vw]',
  }[size]
}

export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      children,
      className,
      isOpen,
      onClose,
      open,
      position = 'right',
      size = 'md',
      title,
      ...props
    },
    ref,
  ) => {
    const [mounted, setMounted] = React.useState(false)
    const titleId = React.useId()
    const resolvedOpen = open ?? isOpen ?? false

    React.useEffect(() => {
      setMounted(true)
    }, [])

    React.useEffect(() => {
      if (!resolvedOpen || typeof document === 'undefined') return

      const previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') onClose()
      }

      document.addEventListener('keydown', handleKeyDown)

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = previousOverflow
      }
    }, [resolvedOpen, onClose])

    if (!mounted || typeof document === 'undefined') return null

    const initialPosition = getInitialPosition(position)

    return createPortal(
      <AnimatePresence>
        {resolvedOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Đóng drawer"
              className="fixed inset-0 z-[1200] bg-slate-950/35"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? titleId : undefined}
              initial={initialPosition}
              animate={{ x: 0, y: 0 }}
              exit={initialPosition}
              transition={{ type: 'spring', stiffness: 360, damping: 36 }}
              className={cn(
                'fixed z-[1300] overflow-hidden bg-white text-slate-900 shadow-[0_24px_54px_-38px_rgba(15,23,42,0.32)]',
                position === 'left' && 'inset-y-0 left-0 h-dvh',
                position === 'right' && 'inset-y-0 right-0 h-dvh',
                position === 'bottom' && 'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-[18px]',
                getDrawerSizeClass(position, size),
                className,
              )}
              {...props}
            >
              {title ? (
                <div className="border-b border-slate-200 px-6 py-4">
                  <h2 id={titleId} className="text-lg font-semibold text-slate-900">
                    {title}
                  </h2>
                </div>
              ) : null}
              <div className="h-full overflow-y-auto p-6">{children}</div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>,
      document.body,
    )
  },
)

Drawer.displayName = 'Drawer'
