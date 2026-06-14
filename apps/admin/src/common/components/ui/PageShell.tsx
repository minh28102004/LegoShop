import { type PropsWithChildren } from 'react';
import { cn } from '@/common/utils/cn';

type PageShellProps = PropsWithChildren<{
  className?: string;
  scrollable?: boolean;
}>;

export default function PageShell({
  className,
  children,
  scrollable = true,
}: PageShellProps) {
  return (
    <div
      className={cn(
        'h-full min-h-0',
        scrollable
          ? 'admin-scrollbar space-y-5 overflow-y-auto pb-4 pr-1'
          : 'flex flex-col gap-4 overflow-hidden',
        className,
      )}
    >
      {children}
    </div>
  );
}
