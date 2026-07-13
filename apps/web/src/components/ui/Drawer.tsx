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
      isOpen,
      onClose,
      position = 'right',
      size,
      title,
      ...props
    },
    ref,
  ) => {
    const [mounted, setMounted] = React.useState<boolean>(false)
    const titleId = React.useId()

    React.useEffect(() => {
      setMounted(true)
    }, [])

    React.useEffect(() => {
      if (!isOpen || typeof document === 'undefined') {
        return undefined
      }

      const previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      const handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
          onClose()
        }
      }

      document.addEventListener('keydown', handleKeyDown)

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = previousOverflow
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
              className="fixed inset-0 z-z-overlay bg-[rgb(7_29_58/0.6)]"
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
