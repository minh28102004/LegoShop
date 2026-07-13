'use client'

import * as React from 'react'

import { cn } from '../cn'

type ModalSize = 'sm' | 'md' | 'lg' | 'full'

export interface ModalProps extends React.PropsWithChildren {
  isOpen?: boolean
  open?: boolean
  onClose: () => void
  ariaLabelledby?: string
  size?: ModalSize
  panelClassName?: string
  containerClassName?: string
}

export interface ModalSectionProps extends React.PropsWithChildren {
  className?: string
}

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-4xl',
  full: 'h-[calc(100dvh-32px)] max-w-[calc(100vw-32px)]',
}

export function Modal({
  open,
  isOpen,
  onClose,
  ariaLabelledby,
  children,
  containerClassName,
  panelClassName,
  size = 'lg',
}: ModalProps) {
  const resolvedOpen = open ?? isOpen ?? false

  React.useEffect(() => {
    if (!resolvedOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.classList.add('modal-open')

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, resolvedOpen])

  if (!resolvedOpen) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35 px-3 py-4 sm:p-6',
        containerClassName,
      )}
    >
      <button
        type="button"
        aria-label="Close modal overlay"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledby}
        className={cn(
          'relative z-10 flex max-h-[min(92vh,940px)] w-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_54px_-38px_rgba(15,23,42,0.32)]',
          SIZE_CLASS[size],
          panelClassName,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export function ModalHeader({ className, children }: ModalSectionProps) {
  return (
    <div
      className={cn(
        'sticky top-0 z-10 flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6 sm:py-5',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function ModalBody({ className, children }: ModalSectionProps) {
  return (
    <div className={cn('min-h-0 flex-1 overflow-y-auto bg-white px-5 py-5 sm:px-6 sm:py-6', className)}>
      {children}
    </div>
  )
}

export function ModalFooter({ className, children }: ModalSectionProps) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-10 flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6',
        className,
      )}
    >
      {children}
    </div>
  )
}
