import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type PropsWithChildren,
  type ReactNode,
  type TableHTMLAttributes,
} from 'react';
import Button from '@/common/components/ui/Button';
import { cn } from '@/common/utils/cn';

type TableWrapperProps = PropsWithChildren<{
  className?: string;
  containerClassName?: string;
}>;

type TableSectionProps = TableHTMLAttributes<HTMLTableSectionElement>;
type TableRowProps = HTMLAttributes<HTMLTableRowElement> & {
  hoverable?: boolean;
};
type TableCellProps = HTMLAttributes<HTMLTableCellElement>;
type TableHeadProps = HTMLAttributes<HTMLTableCellElement>;
type TableEmptyStateProps = {
  colSpan: number;
  children: ReactNode;
  className?: string;
};
type TableActionsProps = PropsWithChildren<{
  className?: string;
}>;
type TableActionTone = 'view' | 'edit' | 'delete' | 'neutral';
type TableActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: TableActionTone;
};
type TablePaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  pageLabel: string;
  totalLabel: string;
  previousLabel: string;
  nextLabel: string;
  onPrevious: () => void;
  onNext: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  className?: string;
};

const TABLE_ACTION_TONE_CLASS: Record<TableActionTone, string> = {
  view: 'border-blue-100 bg-blue-50 text-blue-600 hover:border-blue-200 hover:bg-blue-100',
  edit: 'border-blue-100 bg-blue-50 text-blue-600 hover:border-blue-200 hover:bg-blue-100',
  delete: 'border-red-100 bg-red-50 text-red-600 hover:border-red-200 hover:bg-red-100',
  neutral: 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
};

export default function Table({
  className,
  containerClassName,
  children,
}: TableWrapperProps) {
  return (
    <div
      className={cn(
        'admin-surface admin-scrollbar overflow-x-auto rounded-[20px] bg-white',
        containerClassName,
      )}
    >
      <table className={cn('w-full min-w-[720px] table-auto text-sm text-slate-700', className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...props }: TableSectionProps) {
  return (
    <thead
      className={cn(
        'border-b border-slate-700 bg-slate-800 text-left text-slate-50',
        className,
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }: TableSectionProps) {
  return (
    <tbody className={cn('divide-y divide-slate-100 bg-white', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({
  className,
  hoverable = false,
  children,
  ...props
}: TableRowProps) {
  return (
    <tr
      className={cn(
        hoverable && 'transition-colors duration-150 hover:bg-slate-50',
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ className, children, ...props }: TableHeadProps) {
  return (
    <th className={cn('admin-table-head-cell', className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ className, children, ...props }: TableCellProps) {
  return (
    <td className={cn('admin-table-cell text-slate-700', className)} {...props}>
      {children}
    </td>
  );
}

export function TableEmptyState({
  colSpan,
  className,
  children,
}: TableEmptyStateProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className='px-5 py-12 text-center'
      >
        <div className='mx-auto flex max-w-sm flex-col items-center gap-3'>
          <span className='grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-400'>
            -
          </span>
          <p className={cn('text-sm font-medium text-slate-500', className)}>{children}</p>
        </div>
      </td>
    </tr>
  );
}

export function TableActions({ className, children }: TableActionsProps) {
  return <div className={cn('flex items-center justify-end gap-2', className)}>{children}</div>;
}

export function tableActionButtonClass(tone: TableActionTone = 'view', className?: string) {
  return cn(
    'inline-flex h-9 w-9 items-center justify-center rounded-[11px] border text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100',
    TABLE_ACTION_TONE_CLASS[tone],
    className,
  );
}

export function TableActionButton({
  tone = 'view',
  className,
  children,
  type = 'button',
  ...props
}: TableActionButtonProps) {
  return (
    <button type={type} className={tableActionButtonClass(tone, className)} {...props}>
      {children}
    </button>
  );
}

export function TablePagination({
  page,
  totalPages,
  total,
  pageLabel,
  totalLabel,
  previousLabel,
  nextLabel,
  onPrevious,
  onNext,
  previousDisabled,
  nextDisabled,
  className,
}: TablePaginationProps) {
  return (
    <div
      className={cn(
        'admin-surface flex flex-col gap-3 rounded-[18px] bg-white px-4 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p className='font-semibold text-slate-700'>
        {pageLabel} {page} / {Math.max(totalPages, 1)}
        <span className='mx-2 text-slate-300'>|</span>
        {totalLabel}: {total}
      </p>
      <div className='flex items-center gap-2'>
        <Button
          variant='secondary'
          size='sm'
          disabled={previousDisabled}
          onClick={onPrevious}
          className='min-w-[88px]'
        >
          {previousLabel}
        </Button>
        <Button
          variant='secondary'
          size='sm'
          disabled={nextDisabled}
          onClick={onNext}
          className='min-w-[88px]'
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}
