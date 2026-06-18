import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type PropsWithChildren,
  type ReactNode,
  type TableHTMLAttributes,
} from 'react';
import LoadingSpinner from '@/common/components/ui/LoadingSpinner';
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
export type SortDirection = 'asc' | 'desc';
export type TableSort = {
  key: string;
  direction: SortDirection;
};
type SortableTableHeadProps = TableHeadProps & {
  defaultDirection?: SortDirection;
  defaultSorts?: readonly TableSort[];
  onSortChange: (sorts: TableSort[]) => void;
  sorts: readonly TableSort[];
  sortKey: string;
};
type TableEmptyStateProps = {
  colSpan: number;
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  icon?: ReactNode;
  variant?: 'empty' | 'loading' | 'error';
};
type TableActionsProps = PropsWithChildren<{
  className?: string;
}>;
type TableActionTone = 'view' | 'edit' | 'delete' | 'neutral';
type TableActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: TableActionTone;
};
const TABLE_ACTION_TONE_CLASS: Record<TableActionTone, string> = {
  view: 'border-slate-200 bg-slate-50 !text-slate-500 hover:border-[var(--admin-primary)] hover:bg-[var(--admin-primary-tint)] hover:!text-[var(--admin-primary-strong)]',
  edit: 'border-slate-200 bg-slate-50 !text-slate-500 hover:border-[var(--admin-primary)] hover:bg-[var(--admin-primary-tint)] hover:!text-[var(--admin-primary-strong)]',
  delete: 'border-slate-200 bg-slate-50 !text-slate-500 hover:border-red-200 hover:bg-red-100 hover:!text-red-700',
  neutral: 'border-slate-200 bg-white !text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:!text-slate-700',
};

export const DEFAULT_TABLE_SORTS: readonly TableSort[] = [
  { key: 'createdAt', direction: 'desc' },
];

export function areTableSortsEqual(
  current: readonly TableSort[],
  fallback: readonly TableSort[] = DEFAULT_TABLE_SORTS,
) {
  if (current.length !== fallback.length) return false;

  return current.every(
    (sort, index) =>
      sort.key === fallback[index]?.key &&
      sort.direction === fallback[index]?.direction,
  );
}

export function serializeTableSorts(sorts: readonly TableSort[]) {
  return {
    sortBy: sorts.map((sort) => sort.key).join(','),
    sortDir: sorts.map((sort) => sort.direction).join(','),
  };
}

function getNextTableSorts(
  sorts: readonly TableSort[],
  sortKey: string,
  defaultDirection: SortDirection,
  defaultSorts: readonly TableSort[],
) {
  const activeIndex = sorts.findIndex((sort) => sort.key === sortKey);
  const oppositeDirection: SortDirection = defaultDirection === 'asc' ? 'desc' : 'asc';

  if (activeIndex === -1) {
    const baseSorts = areTableSortsEqual(sorts, defaultSorts) ? [] : sorts;
    return [...baseSorts, { key: sortKey, direction: defaultDirection }];
  }

  const activeSort = sorts[activeIndex];
  if (!activeSort) return [...sorts];

  if (activeSort.direction === defaultDirection) {
    return sorts.map((sort, index) =>
      index === activeIndex ? { ...sort, direction: oppositeDirection } : sort,
    );
  }

  const nextSorts = sorts.filter((sort) => sort.key !== sortKey);
  return nextSorts.length > 0 ? nextSorts : [...defaultSorts];
}

function EmptyTableIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' className='h-5 w-5' aria-hidden='true'>
      <path
        d='M4.5 7.5C4.5 6.12 5.62 5 7 5H17C18.38 5 19.5 6.12 19.5 7.5V16.5C19.5 17.88 18.38 19 17 19H7C5.62 19 4.5 17.88 4.5 16.5V7.5Z'
        stroke='currentColor'
        strokeWidth='1.7'
      />
      <path
        d='M8 9H16M8 12H13.5M8 15H11.5'
        stroke='currentColor'
        strokeWidth='1.7'
        strokeLinecap='round'
      />
    </svg>
  );
}

function ErrorTableIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' className='h-5 w-5' aria-hidden='true'>
      <path
        d='M12 8V12.5'
        stroke='currentColor'
        strokeWidth='1.9'
        strokeLinecap='round'
      />
      <path
        d='M12 16H12.01'
        stroke='currentColor'
        strokeWidth='2.4'
        strokeLinecap='round'
      />
      <path
        d='M10.2 4.95L3.42 17.05C2.86 18.05 3.58 19.28 4.73 19.28H19.27C20.42 19.28 21.14 18.05 20.58 17.05L13.8 4.95C13.23 3.93 10.77 3.93 10.2 4.95Z'
        stroke='currentColor'
        strokeWidth='1.7'
        strokeLinejoin='round'
      />
    </svg>
  );
}

export default function Table({
  className,
  containerClassName,
  children,
}: TableWrapperProps) {
  return (
    <div
      className={cn(
        'admin-surface admin-table-shell min-h-0 bg-white',
        containerClassName,
      )}
    >
      <table className={cn('w-full table-fixed text-sm text-slate-700', className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...props }: TableSectionProps) {
  return (
    <thead
      className={cn(
        'bg-slate-800 text-center text-slate-50 shadow-[0_1px_0_rgba(15,23,42,0.26)]',
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
    <tbody
      className={cn('admin-scrollbar divide-y divide-slate-100 bg-white', className)}
      {...props}
    >
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
    <th className={cn('admin-table-head-cell text-center', className)} {...props}>
      {children}
    </th>
  );
}

function SortIndicator({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-4 w-3 shrink-0 flex-col items-center justify-center gap-0.5 transition-colors',
        active ? 'text-yellow-300' : 'text-slate-400/80 group-hover:text-slate-200',
      )}
      aria-hidden='true'
    >
      <svg
        viewBox='0 0 8 5'
        className={cn(
          'h-1.5 w-2 fill-current transition-opacity',
          active && direction === 'asc' ? 'opacity-100' : 'opacity-45',
        )}
      >
        <path d='M4 0L8 5H0L4 0Z' />
      </svg>
      <svg
        viewBox='0 0 8 5'
        className={cn(
          'h-1.5 w-2 fill-current transition-opacity',
          active && direction === 'desc' ? 'opacity-100' : 'opacity-45',
        )}
      >
        <path d='M4 5L0 0H8L4 5Z' />
      </svg>
    </span>
  );
}

export function SortableTableHead({
  children,
  className,
  defaultDirection = 'desc',
  defaultSorts = DEFAULT_TABLE_SORTS,
  onSortChange,
  sorts,
  sortKey,
  ...props
}: SortableTableHeadProps) {
  const activeSort = sorts.find((sort) => sort.key === sortKey);
  const active = activeSort !== undefined;
  const direction = activeSort?.direction ?? defaultDirection;
  const ariaSort = active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none';
  const alignmentClass =
    typeof className === 'string' && className.includes('text-left')
      ? 'mr-auto justify-start text-left'
      : typeof className === 'string' && className.includes('text-right')
        ? 'ml-auto justify-end text-right'
        : 'mx-auto justify-center text-center';

  function handleSort() {
    onSortChange(getNextTableSorts(sorts, sortKey, defaultDirection, defaultSorts));
  }

  return (
    <th
      className={cn('admin-table-head-cell text-center', className)}
      aria-sort={ariaSort}
      {...props}
    >
      <button
        type='button'
        onClick={handleSort}
        className={cn(
          'group inline-flex max-w-full items-center gap-1.5 rounded-md transition-colors duration-150',
          alignmentClass,
          active ? 'text-yellow-200' : 'text-inherit hover:text-white',
        )}
      >
        <span className='truncate'>{children}</span>
        <SortIndicator active={active} direction={direction} />
      </button>
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
  description,
  icon,
  variant = 'empty',
}: TableEmptyStateProps) {
  const isLoading = variant === 'loading';
  const isError = variant === 'error';
  const fallbackIcon = isError ? <ErrorTableIcon /> : <EmptyTableIcon />;

  return (
    <tr>
      <td
        colSpan={colSpan}
        className='px-5 py-12 text-center'
      >
        <div className='mx-auto flex max-w-sm flex-col items-center gap-3'>
          {isLoading ? (
            <LoadingSpinner label={String(children)} />
          ) : (
            <span
              className={cn(
                'grid h-12 w-12 place-items-center rounded-full border bg-slate-50',
                isError
                  ? 'border-red-200 bg-red-50 text-red-500'
                  : 'border-slate-200 text-slate-400',
              )}
            >
              {icon ?? fallbackIcon}
            </span>
          )}
          <div className='space-y-1'>
            <p
              className={cn(
                'text-sm font-semibold',
                isError ? 'text-red-700' : 'text-slate-600',
                className,
              )}
            >
              {children}
            </p>
            {description ? (
              <p className='text-[13px] leading-6 text-slate-500'>{description}</p>
            ) : null}
          </div>
        </div>
      </td>
    </tr>
  );
}

export function TableActions({ className, children }: TableActionsProps) {
  return <div className={cn('flex items-center justify-center gap-2', className)}>{children}</div>;
}

export function tableActionButtonClass(tone: TableActionTone = 'view', className?: string) {
  return cn(
    'inline-flex h-9 w-9 items-center justify-center rounded-[11px] border text-sm leading-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--admin-primary-ring)]',
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

export { TablePagination } from '@/common/components/ui/TablePagination';
export type { TablePaginationProps } from '@/common/components/ui/TablePagination';
