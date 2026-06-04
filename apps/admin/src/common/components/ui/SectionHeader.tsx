import { type ReactNode } from 'react';
import { cn } from '@/common/utils/cn';

type SectionHeaderProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  badge,
  className,
  titleClassName,
  descriptionClassName,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between', className)}>
      <div className='min-w-0 flex-1'>
        {eyebrow ? (
          <p className='admin-eyebrow'>
            {eyebrow}
          </p>
        ) : null}
        <div className='mt-2 flex flex-wrap items-center gap-3'>
          <h2
            className={cn(
              'admin-section-title',
              titleClassName,
            )}
          >
            {title}
          </h2>
          {badge ? <div className='shrink-0'>{badge}</div> : null}
        </div>
        {description ? (
          <p className={cn('admin-section-description mt-1.5 max-w-3xl', descriptionClassName)}>
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className='flex shrink-0 flex-wrap items-center gap-2.5 lg:justify-end'>{actions}</div>
      ) : null}
    </div>
  );
}
