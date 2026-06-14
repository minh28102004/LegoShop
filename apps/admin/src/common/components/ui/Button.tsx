import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import LoadingSpinner from '@/common/components/ui/LoadingSpinner';
import { cn } from '@/common/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft' | 'cancel' | 'remove';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'border border-[var(--admin-primary)] bg-[var(--admin-primary)] !text-white shadow-[0_10px_20px_-18px_rgba(15,23,42,0.2)] transition-all duration-200 ease-out hover:border-[var(--admin-primary-strong)] hover:bg-[var(--admin-primary-strong)] hover:!text-white hover:shadow-[var(--admin-shadow-hover)] focus-visible:ring-[var(--admin-primary-ring)]',
  secondary:
    'border border-[var(--admin-border)] bg-white !text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 ease-out hover:border-[var(--admin-primary-tint)] hover:bg-[var(--admin-primary-soft)] hover:!text-[var(--admin-primary-strong)] focus-visible:ring-[var(--admin-primary-ring)]',
  ghost:
    'border border-transparent bg-transparent !text-slate-600 transition-colors duration-200 ease-out hover:bg-[var(--admin-primary-soft)] hover:!text-[var(--admin-primary-strong)] focus-visible:ring-[var(--admin-primary-ring)]',
  danger:
    'border border-red-200 bg-white !text-red-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 ease-out hover:border-red-300 hover:bg-red-50 hover:!text-red-700 focus-visible:ring-red-100',
  soft:
    'border border-[var(--admin-primary-tint)] bg-[var(--admin-primary-soft)] !text-[var(--admin-primary-strong)] shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-200 ease-out hover:border-[var(--admin-primary)] hover:bg-[var(--admin-primary-tint)] hover:!text-[var(--admin-primary-strong)] focus-visible:ring-[var(--admin-primary-ring)]',
  cancel:
    'border border-[var(--admin-border)] bg-white !text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 ease-out hover:border-red-200 hover:bg-red-50 hover:!text-red-700 focus-visible:ring-red-100',
  remove:
    'border border-[var(--admin-border)] bg-white !text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 ease-out hover:border-red-200 hover:bg-red-50 hover:!text-red-700 focus-visible:ring-red-100',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'min-h-10 rounded-[10px] px-3 py-2 text-[13px]',
  md: 'min-h-[42px] rounded-[12px] px-4 py-2.5 text-sm',
  lg: 'min-h-11 rounded-[14px] px-[18px] py-2.5 text-sm',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  className,
  type = 'button',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold leading-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 active:scale-[0.985] disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 disabled:opacity-55',
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size='sm' label='Loading button action' className='border-current/30 border-t-current' />
      ) : leftIcon ? (
        <span className='shrink-0'>{leftIcon}</span>
      ) : null}
      {children}
      {!loading && rightIcon ? <span className='shrink-0'>{rightIcon}</span> : null}
    </button>
  );
}
