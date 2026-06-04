'use client';

import {
  type PropsWithChildren,
  useEffect,
} from 'react';
import { cn } from '@/common/utils/cn';

type ModalProps = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  ariaLabelledby?: string;
  panelClassName?: string;
}>;

type ModalSectionProps = PropsWithChildren<{
  className?: string;
}>;

export default function Modal({
  open,
  onClose,
  ariaLabelledby,
  panelClassName,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35 px-3 py-4 sm:p-6'>
      <button
        type='button'
        aria-label='Close modal overlay'
        className='absolute inset-0'
        onClick={onClose}
      />

      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby={ariaLabelledby}
        className={cn(
          'relative z-10 flex max-h-[min(92vh,940px)] w-full max-w-4xl flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_54px_-38px_rgba(15,23,42,0.32)] animate-zoom-in',
          panelClassName,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
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
  );
}

export function ModalBody({ className, children }: ModalSectionProps) {
  return (
    <div
      className={cn(
        'admin-scrollbar min-h-0 flex-1 overflow-y-auto bg-white px-5 py-5 sm:px-6 sm:py-6',
        className,
      )}
    >
      {children}
    </div>
  );
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
  );
}
