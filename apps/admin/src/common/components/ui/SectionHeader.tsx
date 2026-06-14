import { type ReactNode } from 'react';
import { cn } from '@/common/utils/cn';

type SectionHeaderProps = {
  eyebrow?: ReactNode;
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
  iconClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

export default function SectionHeader({
  eyebrow,
  icon,
  title,
  description,
  actions,
  badge,
  className,
  iconClassName,
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
        <div className={cn('flex items-start gap-4', eyebrow ? 'mt-2' : undefined)}>
          {icon ? (
            <span
              className={cn(
                'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-[var(--admin-primary-tint)] bg-[var(--admin-primary-soft)] text-[var(--admin-primary-strong)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.72)]',
                iconClassName,
              )}
            >
              {icon}
            </span>
          ) : null}
          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center gap-3'>
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
        </div>
      </div>

      {actions ? (
        <div className='flex shrink-0 flex-wrap items-center gap-2.5 lg:justify-end'>{actions}</div>
      ) : null}
    </div>
  );
}
