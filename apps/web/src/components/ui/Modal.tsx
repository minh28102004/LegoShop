'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, type HTMLMotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn, type Size } from '@lego-shop/ui'

const modalVariants = cva(
  'relative max-h-[calc(100dvh-32px)] w-full overflow-hidden rounded-md bg-background text-text-primary shadow-2xl',
  {
    variants: {
      size: {
        sm: 'max-w-screen-sm',
        md: 'max-w-screen-md',
        lg: 'max-w-screen-lg',
        full: 'h-[calc(100dvh-32px)] max-w-[calc(100vw-32px)]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export interface ModalProps
  extends Omit<HTMLMotionProps<'div'>, 'children' | 'title'>,
    Omit<VariantProps<typeof modalVariants>, 'size'> {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: Extract<Size, 'sm' | 'md' | 'lg'> | 'full'
  children: React.ReactNode
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  )
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      children,
      className,
      isOpen,
      onClose,
      size,
      title,
      ...props
    },
    ref,
  ) => {
    const [mounted, setMounted] = React.useState<boolean>(false)
    const dialogRef = React.useRef<HTMLDivElement | null>(null)
    const titleId = React.useId()

    React.useEffect(() => {
      setMounted(true)
    }, [])

    React.useEffect(() => {
      if (!isOpen || typeof document === 'undefined') {
        return undefined
      }

      const previousActiveElement = document.activeElement
      const previousOverflow = document.body.style.overflow

      document.body.style.overflow = 'hidden'
      dialogRef.current?.focus()

      const handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
          onClose()
          return
        }

        if (event.key !== 'Tab' || dialogRef.current === null) {
          return
        }

        const focusableElements = getFocusableElements(dialogRef.current)

        if (focusableElements.length === 0) {
          event.preventDefault()
          return
        }

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (firstElement === undefined || lastElement === undefined) {
          return
        }

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
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = previousOverflow

        if (previousActiveElement instanceof HTMLElement) {
          previousActiveElement.focus()
        }
      }
    }, [isOpen, onClose])

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null): void => {
        dialogRef.current = node

        if (typeof ref === 'function') {
          ref(node)
        } else if (ref !== null) {
          ref.current = node
        }
      },
      [ref],
    )

    if (!mounted || typeof document === 'undefined') {
      return null
    }

    return createPortal(
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="fixed inset-0 z-z-modal flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Đóng modal"
              className="absolute inset-0 bg-dark/60"
              onClick={onClose}
            />
            <motion.div
              ref={setRefs}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? titleId : undefined}
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: 'spring', stiffness: 360, damping: 32 }}
              className={cn(modalVariants({ size }), className)}
              {...props}
            >
              {title ? (
                <div className="border-b border-border px-6 py-4">
                  <h2 id={titleId} className="text-display-sm">
                    {title}
                  </h2>
                </div>
              ) : null}
              <div className="overflow-y-auto p-6">{children}</div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>,
      document.body,
    )
  },
)

Modal.displayName = 'Modal'
