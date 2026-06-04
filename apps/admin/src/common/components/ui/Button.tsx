import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/common/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';
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
    'border border-blue-600 bg-blue-600 text-white shadow-[0_10px_20px_-18px_rgba(15,23,42,0.2)] transition-all duration-200 ease-out hover:border-blue-700 hover:bg-blue-700 hover:shadow-[var(--admin-shadow-hover)]',
  secondary:
    'border border-[var(--admin-border)] bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 ease-out hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700',
  ghost:
    'border border-transparent bg-transparent text-slate-600 transition-colors duration-200 ease-out hover:bg-slate-100 hover:text-slate-900',
  danger:
    'border border-red-200 bg-white text-red-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 ease-out hover:border-red-300 hover:bg-red-50',
  soft:
    'border border-blue-100 bg-blue-50 text-blue-700 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-200 ease-out hover:border-blue-200 hover:bg-blue-100',
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
        'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold leading-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 active:scale-[0.985] disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 disabled:opacity-55',
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className='inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current' />
      ) : leftIcon ? (
        <span className='shrink-0'>{leftIcon}</span>
      ) : null}
      {children}
      {!loading && rightIcon ? <span className='shrink-0'>{rightIcon}</span> : null}
    </button>
  );
}
