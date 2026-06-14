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
      containerClassName='items-start pt-[17vh] sm:pt-[15vh]'
      panelClassName='max-w-[430px] rounded-[24px] border-white shadow-[0_24px_70px_-34px_rgba(15,23,42,0.45)]'
    >
      <ModalHeader className='!border-b-0 !bg-white px-5 pb-0 pt-4 sm:px-5 sm:pb-0 sm:pt-4'>
        <div className='flex items-start gap-3'>
          <Badge
            tone={tone === 'danger' ? 'danger' : 'info'}
            className='h-10 w-10 shrink-0 justify-center rounded-[15px] border-red-100 bg-red-50 p-0 text-red-600 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)]'
          >
            <ConfirmIcon tone={tone} />
          </Badge>

          <div className='min-w-0 pt-0.5'>
            <h3 id={titleId} className='text-lg font-bold tracking-[-0.01em] text-slate-950'>
              {title}
            </h3>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className='!flex-none px-5 pb-3.5 pt-4 sm:px-5 sm:pb-3.5 sm:pt-4'>
        {description ? (
          <div className='rounded-[16px] border border-red-100 bg-red-50/70 px-3.5 py-2.5 text-sm font-medium leading-6 text-red-800'>
            {description}
          </div>
        ) : null}
      </ModalBody>

      <ModalFooter className='!border-t-0 !bg-white px-5 pb-4 pt-1 sm:px-5 sm:pb-4 sm:pt-1'>
        <Button
          variant='cancel'
          onClick={onClose}
          disabled={loading}
          className='h-9 w-full rounded-[12px] sm:w-auto'
        >
          {cancelText}
        </Button>
        <Button
          variant={tone === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={loading}
          className={
            tone === 'danger'
              ? 'h-9 w-full rounded-[12px] !border-red-600 !bg-red-600 !text-white hover:!border-red-700 hover:!bg-red-700 hover:!text-white sm:w-auto'
              : 'h-9 w-full rounded-[12px] sm:w-auto'
          }
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
