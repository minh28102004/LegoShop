import { type TextareaHTMLAttributes } from 'react';
import { cn } from '@/common/utils/cn';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export default function Textarea({
  className,
  invalid = false,
  ...props
}: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(
        'admin-control admin-control-lg min-h-[120px] resize-y py-2.5 leading-6',
        invalid && 'is-invalid',
        className,
      )}
      {...props}
    />
  );
}
