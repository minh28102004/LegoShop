import { type ReactNode } from 'react';
import Card from '@/common/components/ui/Card';
import { CardBody } from '@/common/components/ui/Card';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
};

function DefaultEmptyIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' className='h-6 w-6' aria-hidden='true'>
      <path
        d='M5 7.5C5 6.12 6.12 5 7.5 5H16.5C17.88 5 19 6.12 19 7.5V16.5C19 17.88 17.88 19 16.5 19H7.5C6.12 19 5 17.88 5 16.5V7.5Z'
        stroke='currentColor'
        strokeWidth='1.7'
      />
      <path
        d='M8.5 10H15.5M8.5 13H14M8.5 16H12'
        stroke='currentColor'
        strokeWidth='1.7'
        strokeLinecap='round'
      />
    </svg>
  );
}

export default function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <Card className='text-center'>
      <CardBody className='py-10'>
        <span className='mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border border-slate-200 bg-slate-50 text-slate-400'>
          {icon ?? <DefaultEmptyIcon />}
        </span>
        <p className='text-lg font-semibold text-slate-900'>{title}</p>
        {description ? <p className='mt-2 text-sm text-slate-600'>{description}</p> : null}
        {action ? <div className='mt-4 flex justify-center'>{action}</div> : null}
      </CardBody>
    </Card>
  );
}
