import { type PropsWithChildren } from 'react';
import { cn } from '@/common/utils/cn';

type CardProps = PropsWithChildren<{
  className?: string;
  hover?: boolean;
}>;

type CardSectionProps = PropsWithChildren<{
  className?: string;
}>;

export default function Card({ children, className, hover = false }: CardProps) {
  return (
    <section
      className={cn(
        'admin-surface transition-all duration-200 ease-out',
        hover && 'hover:shadow-[var(--admin-shadow-hover)]',
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({ className, children }: CardSectionProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 px-5 py-[18px] shadow-[0_1px_0_rgba(226,232,240,0.72)] sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-5',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardBody({ className, children }: CardSectionProps) {
  return <div className={cn('px-5 py-5 sm:px-6 sm:py-6', className)}>{children}</div>;
}

export function CardFooter({ className, children }: CardSectionProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-end gap-3 bg-slate-50 px-5 py-4 shadow-[0_-1px_0_rgba(226,232,240,0.72)] sm:px-6 sm:py-5',
        className,
      )}
    >
      {children}
    </div>
  );
}
