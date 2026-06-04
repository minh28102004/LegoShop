import Card from '@/common/components/ui/Card';
import { CardBody } from '@/common/components/ui/Card';

type LoadingStateProps = {
  text: string;
};

export default function LoadingState({ text }: LoadingStateProps) {
  return (
    <Card>
      <CardBody className='flex items-center justify-center gap-3 py-10 text-slate-600'>
        <span className='inline-flex h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600' />
        <span className='text-sm font-medium'>{text}</span>
      </CardBody>
    </Card>
  );
}
