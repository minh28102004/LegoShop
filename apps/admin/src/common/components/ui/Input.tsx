import { type InputHTMLAttributes } from 'react';
import { cn } from '@/common/utils/cn';

type InputSize = 'md' | 'lg';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  invalid?: boolean;
  size?: InputSize;
};

const SIZE_CLASS: Record<InputSize, string> = {
  md: 'admin-control-md',
  lg: 'admin-control-lg',
};

export default function Input({
  className,
  invalid = false,
  size = 'md',
  ...props
}: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        'admin-control',
        SIZE_CLASS[size],
        invalid && 'is-invalid',
        className,
      )}
      {...props}
    />
  );
}
