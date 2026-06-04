'use client';

import { useId } from 'react';
import Button from '@/common/components/ui/Button';
import Badge from '@/common/components/ui/Badge';
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@/common/components/ui/Modal';

type ConfirmTone = 'primary' | 'danger';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmText: string;
  cancelText: string;
  tone?: ConfirmTone;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function ConfirmIcon({ tone }: { tone: ConfirmTone }) {
  if (tone === 'danger') {
    return (
      <svg viewBox='0 0 24 24' fill='none' className='h-5 w-5' aria-hidden='true'>
        <path
          d='M12 8V12M12 16H12.01M10.29 3.86L1.82 18A2 2 0 0 0 3.56 21H20.44A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z'
          stroke='currentColor'
          strokeWidth='1.8'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    );
  }

  return (
    <svg viewBox='0 0 24 24' fill='none' className='h-5 w-5' aria-hidden='true'>
      <path
        d='M20 6L9 17L4 12'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  cancelText,
  tone = 'primary',
  loading = false,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const titleId = useId();

  return (
    <Modal
      open={open}
      onClose={loading ? () => undefined : onClose}
      ariaLabelledby={titleId}
      panelClassName='max-w-lg'
    >
      <ModalHeader>
        <div className='flex items-start gap-3'>
          <Badge tone={tone === 'danger' ? 'danger' : 'info'} className='rounded-2xl p-2'>
            <ConfirmIcon tone={tone} />
          </Badge>

          <div>
            <h3 id={titleId} className='text-lg font-semibold text-slate-900'>{title}</h3>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className='py-5'>
        {description ? <p className='text-sm leading-6 text-slate-600'>{description}</p> : null}
      </ModalBody>

      <ModalFooter>
        <Button variant='secondary' onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
