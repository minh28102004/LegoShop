import type { ReactNode } from 'react';
import { cn } from '@/common/utils/cn';

type PaginationItem = number | 'ellipsis-start' | 'ellipsis-end';

export type TablePaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  pageLabel: string;
  totalLabel: string;
  previousLabel: string;
  nextLabel: string;
  onPrevious: () => void;
  onNext: () => void;
  onPageChange: (page: number) => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  className?: string;
  itemLabel?: string;
  pageSize?: number;
  pageSizeLabel?: string;
  pageSizeOptions?: readonly number[];
  rangeLabel?: (from: number, to: number, total: number, itemLabel: string) => string;
  onPageSizeChange?: (pageSize: number) => void;
};

const NUMBER_FORMAT = new Intl.NumberFormat('vi-VN');
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

function clampPage(page: number, totalPages: number) {
  return Math.min(Math.max(page, 1), Math.max(totalPages, 1));
}

function formatNumber(value: number) {
  return NUMBER_FORMAT.format(value);
}

function getPaginationItems(page: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis-end', totalPages];
  }

  if (page >= totalPages - 3) {
    return [
      1,
      'ellipsis-start',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [1, 'ellipsis-start', page - 1, page, page + 1, 'ellipsis-end', totalPages];
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox='0 0 20 20' fill='none' className='h-4 w-4' aria-hidden='true'>
      <path
        d={direction === 'left' ? 'M12.5 5L7.5 10L12.5 15' : 'M7.5 5L12.5 10L7.5 15'}
        stroke='currentColor'
        strokeWidth='1.9'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function PaginationButton({
  active = false,
  ariaLabel,
  children,
  className,
  disabled = false,
  onClick,
}: {
  active?: boolean;
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      aria-current={active ? 'page' : undefined}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-9 min-w-9 items-center justify-center rounded-[11px] px-2.5 text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--admin-primary-ring)]',
        active
          ? 'bg-[var(--admin-primary)] text-white shadow-[0_10px_20px_-14px_rgba(47,145,208,0.58)]'
          : 'bg-white text-slate-600 shadow-[inset_0_0_0_1px_rgba(203,213,225,0.86)] hover:bg-slate-50 hover:text-slate-950 hover:shadow-[inset_0_0_0_1px_rgba(148,163,184,0.7)]',
        disabled &&
          'cursor-not-allowed bg-slate-50 text-slate-400 opacity-70 hover:bg-slate-50 hover:text-slate-400',
        className,
      )}
    >
      {children}
    </button>
  );
}

function PageSizeSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number;
  options: readonly number[];
  onChange: (pageSize: number) => void;
}) {
  return (
    <label className='inline-flex h-9 items-center gap-2 rounded-[11px] bg-slate-50 px-3 text-[13px] font-semibold text-slate-500 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)]'>
      <span>{label}</span>
      <select
        value={value}
        aria-label={label}
        onChange={(event) => onChange(Number(event.target.value))}
        className='h-7 cursor-pointer rounded-md bg-white px-2 text-sm font-bold text-slate-800 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[var(--admin-primary-ring)]'
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TablePagination({
  page,
  totalPages,
  total,
  pageLabel,
  previousLabel,
  nextLabel,
  onPrevious,
  onNext,
  onPageChange,
  previousDisabled,
  nextDisabled,
  className,
  itemLabel = '',
  pageSize,
  pageSizeLabel = 'Số dòng',
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  rangeLabel,
  onPageSizeChange,
}: TablePaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const safePage = clampPage(page, safeTotalPages);
  const hasMultiplePages = safeTotalPages > 1;
  const safePageSize = pageSize && pageSize > 0 ? pageSize : total;
  const pageSizeValue = pageSize ?? pageSizeOptions[0] ?? 10;
  const from = total <= 0 ? 0 : (safePage - 1) * safePageSize + 1;
  const to = total <= 0 ? 0 : Math.min(total, safePage * safePageSize);
  const itemText = itemLabel.trim();
  const totalText = `${formatNumber(total)}${itemText ? ` ${itemText}` : ''}`;
  const summary =
    rangeLabel?.(from, to, total, itemText) ??
    `Hiển thị ${formatNumber(from)}-${formatNumber(to)} trên ${totalText}`;
  const paginationItems = getPaginationItems(safePage, safeTotalPages);
  const canChangePageSize = Boolean(pageSize && onPageSizeChange);

  if (!hasMultiplePages) {
    return null;
  }

  return (
    <nav
      aria-label='Table pagination'
      className={cn(
        'admin-surface -mt-2 flex min-h-[60px] flex-col gap-3 rounded-[18px] bg-white px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className='flex flex-wrap items-center gap-3'>
        <p className='font-semibold text-slate-700'>{summary}</p>
        {canChangePageSize && onPageSizeChange ? (
          <PageSizeSelect
            label={pageSizeLabel}
            value={pageSizeValue}
            options={pageSizeOptions}
            onChange={onPageSizeChange}
          />
        ) : null}
      </div>

      <div className='flex items-center gap-2 sm:hidden'>
        <PaginationButton
          ariaLabel={previousLabel}
          disabled={previousDisabled}
          onClick={onPrevious}
        >
          <ChevronIcon direction='left' />
        </PaginationButton>
        <span className='min-w-24 text-center text-sm font-bold text-slate-700'>
          {pageLabel} {safePage}/{safeTotalPages}
        </span>
        <PaginationButton
          ariaLabel={nextLabel}
          disabled={nextDisabled}
          onClick={onNext}
        >
          <ChevronIcon direction='right' />
        </PaginationButton>
      </div>

      <div className='hidden items-center gap-1.5 sm:flex'>
        <PaginationButton
          ariaLabel={previousLabel}
          disabled={previousDisabled}
          onClick={onPrevious}
          className='px-3'
        >
          <ChevronIcon direction='left' />
        </PaginationButton>

        {paginationItems.map((item) =>
          typeof item === 'number' ? (
            <PaginationButton
              key={item}
              active={item === safePage}
              ariaLabel={`${pageLabel} ${item}`}
              onClick={() => onPageChange(item)}
            >
              {item}
            </PaginationButton>
          ) : (
            <span
              key={item}
              aria-hidden='true'
              className='inline-flex h-9 min-w-9 items-center justify-center rounded-[11px] text-sm font-bold text-slate-400'
            >
              ...
            </span>
          ),
        )}

        <PaginationButton
          ariaLabel={nextLabel}
          disabled={nextDisabled}
          onClick={onNext}
          className='px-3'
        >
          <ChevronIcon direction='right' />
        </PaginationButton>
      </div>
    </nav>
  );
}
