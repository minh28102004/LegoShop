import Card from '@/common/components/ui/Card';
import { CardBody } from '@/common/components/ui/Card';
import LoadingSpinner from '@/common/components/ui/LoadingSpinner';
import { cn } from '@/common/utils/cn';

type LoadingStateVariant = 'card' | 'inline' | 'page';

export type LoadingStateProps = {
  text: string;
  variant?: LoadingStateVariant;
  className?: string;
};

export default function LoadingState({
  text,
  variant = 'card',
  className,
}: LoadingStateProps) {
  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 text-center text-slate-600',
        variant === 'inline' ? 'py-3' : 'py-10',
        className,
      )}
    >
      <LoadingSpinner label={text} />
      <span className='text-sm font-semibold text-slate-600'>{text}</span>
    </div>
  );

  if (variant === 'inline') {
    return content;
  }

  if (variant === 'page') {
    return (
      <div className='grid min-h-[calc(100vh-96px)] place-items-center px-4'>
        {content}
      </div>
    );
  }

  return (
    <Card>
      <CardBody>{content}</CardBody>
    </Card>
  );
}
