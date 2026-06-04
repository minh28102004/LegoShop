import { type PropsWithChildren } from 'react';
import { cn } from '@/common/utils/cn';

type PageShellProps = PropsWithChildren<{
  className?: string;
}>;

export default function PageShell({ className, children }: PageShellProps) {
  return <div className={cn('space-y-6', className)}>{children}</div>;
}
