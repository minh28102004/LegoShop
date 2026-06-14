import { type HTMLAttributes } from 'react';
import { cn } from '@/common/utils/cn';

type LoadingSpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

export type LoadingSpinnerProps = HTMLAttributes<HTMLSpanElement> & {
  size?: LoadingSpinnerSize;
  label?: string;
};

const SIZE_CLASS: Record<LoadingSpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-[3px]',
  lg: 'h-8 w-8 border-4',
  xl: 'h-10 w-10 border-4',
};

export default function LoadingSpinner({
  size = 'xl',
  label = 'Loading',
  className,
  ...props
}: LoadingSpinnerProps) {
  return (
    <span
      role='status'
      aria-label={label}
      className={cn(
        'admin-loading-spinner inline-flex shrink-0 animate-spin rounded-full border-slate-200 border-t-[var(--admin-primary)]',
        SIZE_CLASS[size],
        className,
      )}
      {...props}
    />
  );
}
