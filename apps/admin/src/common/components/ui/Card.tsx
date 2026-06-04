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
        'flex flex-col gap-3 border-b border-[var(--admin-border)] px-5 py-[18px] sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-5',
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
        'flex flex-wrap items-center justify-end gap-3 border-t border-[var(--admin-border)] bg-slate-50 px-5 py-4 sm:px-6 sm:py-5',
        className,
      )}
    >
      {children}
    </div>
  );
}
