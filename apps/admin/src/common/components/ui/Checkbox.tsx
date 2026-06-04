import { type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/common/utils/cn';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: ReactNode;
  description?: ReactNode;
  containerClassName?: string;
};

export default function Checkbox({
  className,
  label,
  description,
  containerClassName,
  ...props
}: CheckboxProps) {
  return (
    <label
      className={cn(
        'flex items-start gap-3 rounded-[22px] border border-[var(--admin-border)] bg-white px-4 py-3.5',
        containerClassName,
      )}
    >
      <input
        type='checkbox'
        className={cn(
          'mt-0.5 h-5 w-5 rounded-md border-slate-300 text-blue-600 shadow-sm focus:ring-4 focus:ring-blue-100/80 focus:ring-offset-0',
          className,
        )}
        {...props}
      />

      {label || description ? (
        <span className='space-y-1'>
          {label ? <span className='block text-[13px] font-semibold text-slate-800'>{label}</span> : null}
          {description ? <span className='block text-[13px] leading-6 text-slate-500'>{description}</span> : null}
        </span>
      ) : null}
    </label>
  );
}
