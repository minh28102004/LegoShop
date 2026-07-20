'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, type HTMLMotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn, type Size } from '@lego-shop/ui'

const drawerVariants = cva(
  'fixed z-z-modal overflow-hidden bg-background text-text-primary shadow-2xl',
  {
    variants: {
      position: {
        left: 'inset-y-0 left-0 h-dvh',
        right: 'inset-y-0 right-0 h-dvh',
        bottom: 'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-md',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
        xl: '',
      },
    },
    compoundVariants: [
      { position: 'left', size: 'sm', className: 'w-80 max-w-[90vw]' },
      { position: 'left', size: 'md', className: 'w-96 max-w-[90vw]' },
      { position: 'left', size: 'lg', className: 'w-[480px] max-w-[90vw]' },
      { position: 'left', size: 'xl', className: 'w-[640px] max-w-[90vw]' },
      { position: 'right', size: 'sm', className: 'w-80 max-w-[90vw]' },
      { position: 'right', size: 'md', className: 'w-96 max-w-[90vw]' },
      { position: 'right', size: 'lg', className: 'w-[480px] max-w-[90vw]' },
      { position: 'right', size: 'xl', className: 'w-[640px] max-w-[90vw]' },
      { position: 'bottom', size: 'sm', className: 'h-80' },
      { position: 'bottom', size: 'md', className: 'h-96' },
      { position: 'bottom', size: 'lg', className: 'h-[520px]' },
      { position: 'bottom', size: 'xl', className: 'h-[680px]' },
    ],
    defaultVariants: {
      position: 'right',
      size: 'md',
    },
  },
)

export interface DrawerProps
  extends Omit<HTMLMotionProps<'div'>, 'children' | 'title'>,
    Omit<VariantProps<typeof drawerVariants>, 'size'> {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: Extract<Size, 'sm' | 'md' | 'lg' | 'xl'>
  contentClassName?: string
  overlayClassName?: string
  children: React.ReactNode
}

function getInitialPosition(position: DrawerProps['position']): {
  x?: string
  y?: string
} {
  if (position === 'left') {
    return { x: '-100%' }
  }

  if (position === 'bottom') {
    return { y: '100%' }
  }

  return { x: '100%' }
}

export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      children,
      className,
      contentClassName,
      isOpen,
      onClose,
      overlayClassName,
      position = 'right',
      size,
      title,
      ...props
    },
    ref,
  ) => {
    const [mounted, setMounted] = React.useState<boolean>(false)
    const titleId = React.useId()
    const drawerRef = React.useRef<HTMLDivElement | null>(null)
    const setDrawerRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        drawerRef.current = node

        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref],
    )

    React.useEffect(() => {
      setMounted(true)
    }, [])

    React.useEffect(() => {
      if (!isOpen || typeof document === 'undefined') {
        return undefined
      }

      const previousOverflow = document.body.style.overflow
      const previouslyFocused =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null
      const focusableSelector =
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

      document.body.style.overflow = 'hidden'

      const focusTimer = window.setTimeout(() => {
        const firstFocusable =
          drawerRef.current?.querySelector<HTMLElement>(focusableSelector)
        ;(firstFocusable ?? drawerRef.current)?.focus()
      }, 0)

      const handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
          onClose()
          return
        }

        if (event.key !== 'Tab' || !drawerRef.current) {
          return
        }

        const focusableElements = Array.from(
          drawerRef.current.querySelectorAll<HTMLElement>(focusableSelector),
        )

        if (focusableElements.length === 0) {
          event.preventDefault()
          drawerRef.current.focus()
          return
        }

        const firstElement = focusableElements[0]!
        const lastElement = focusableElements[focusableElements.length - 1]!

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }

      document.addEventListener('keydown', handleKeyDown)

      return () => {
        window.clearTimeout(focusTimer)
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = previousOverflow
        previouslyFocused?.focus()
      }
    }, [isOpen, onClose])

    if (!mounted || typeof document === 'undefined') {
      return null
    }

    const initialPosition = getInitialPosition(position)

    return createPortal(
      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Đóng drawer"
              className={cn(
                'fixed inset-0 z-z-overlay bg-[rgb(7_29_58/0.6)]',
                overlayClassName,
              )}
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              ref={setDrawerRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? titleId : undefined}
              initial={initialPosition}
              animate={{ x: 0, y: 0 }}
              exit={initialPosition}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={cn(drawerVariants({ position, size }), className)}
              {...props}
            >
              {title ? (
                <div className="border-b border-border px-6 py-4">
                  <h2 id={titleId} className="text-display-sm">
                    {title}
                  </h2>
                </div>
              ) : null}
              <div className={cn('h-full overflow-y-auto p-6', contentClassName)}>
                {children}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>,
      document.body,
    )
  },
)

Drawer.displayName = 'Drawer'
