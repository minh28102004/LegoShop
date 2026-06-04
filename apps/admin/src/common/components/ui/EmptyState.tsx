import { type ReactNode } from 'react';
import Card from '@/common/components/ui/Card';
import { CardBody } from '@/common/components/ui/Card';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className='text-center'>
      <CardBody className='py-10'>
        <p className='text-lg font-semibold text-slate-900'>{title}</p>
        {description ? <p className='mt-2 text-sm text-slate-600'>{description}</p> : null}
        {action ? <div className='mt-4 flex justify-center'>{action}</div> : null}
      </CardBody>
    </Card>
  );
}
