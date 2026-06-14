import type { PropsWithChildren, ReactNode } from 'react';
import { cn } from '@/common/utils/cn';

type FilterSectionProps = PropsWithChildren<{
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}>;

export default function FilterSection({
  children,
  className,
  description,
  title,
}: FilterSectionProps) {
  return (
    <section className={cn('space-y-3 rounded-[18px] bg-slate-50/70 p-3.5', className)}>
      <div className='space-y-0.5'>
        <h3 className='text-[13px] font-bold text-slate-700'>
          {title}
        </h3>
        {description ? (
          <p className='text-[13px] leading-5 text-slate-500'>{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
