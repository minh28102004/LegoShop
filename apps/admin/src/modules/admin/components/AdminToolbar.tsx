'use client';

import { type MouseEvent, type PropsWithChildren, type ReactNode, useRef, useState } from 'react';
import { ConfigProvider, DatePicker } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { cn } from '@/common/utils/cn';

const { RangePicker } = DatePicker;

export type AdminToolbarIconName =
  | 'calendar'
  | 'category'
  | 'filter'
  | 'price'
  | 'reset'
  | 'search'
  | 'sort'
  | 'status';

type AdminToolbarProps = PropsWithChildren<{
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  className?: string;
}>;

type AdminToolbarFieldProps = PropsWithChildren<{
  icon?: ReactNode;
  hideLabel?: boolean;
  label: ReactNode;
  className?: string;
  wide?: boolean;
}>;

type AdminToolbarDateRangeFieldProps = {
  className?: string;
  compactCalendar?: boolean;
  fromLabel: string;
  hideLabel?: boolean;
  fromValue: string;
  label: ReactNode;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  toLabel: string;
  toValue: string;
};

export const adminToolbarInputClass =
  '!h-auto !min-h-0 !rounded-none !border-0 !bg-transparent !p-0 !pl-9 !text-[14px] !font-semibold !leading-5 !text-slate-950 !shadow-none placeholder:!font-semibold placeholder:!text-slate-500 focus:!shadow-none focus-visible:!shadow-none';

export const adminToolbarButtonClass =
  'min-h-10 max-w-full shrink-0 self-end whitespace-nowrap rounded-xl px-3.5 text-[14px] shadow-sm';

export function AdminToolbarIcon({
  className = 'h-4 w-4',
  name,
}: {
  className?: string;
  name: AdminToolbarIconName;
}) {
  switch (name) {
    case 'calendar':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={className} aria-hidden='true'>
          <path d='M7 3.5V6.5M17 3.5V6.5' stroke='currentColor' strokeWidth='1.9' strokeLinecap='round' />
          <rect x='4' y='5.5' width='16' height='15' rx='3' stroke='currentColor' strokeWidth='1.9' />
          <path d='M4 10H20' stroke='currentColor' strokeWidth='1.9' strokeLinecap='round' />
        </svg>
      );
    case 'category':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={className} aria-hidden='true'>
          <path d='M4 6.5H10.5V13H4V6.5Z' stroke='currentColor' strokeWidth='1.9' strokeLinejoin='round' />
          <path d='M13.5 6.5H20V13H13.5V6.5Z' stroke='currentColor' strokeWidth='1.9' strokeLinejoin='round' />
          <path d='M4 16H20' stroke='currentColor' strokeWidth='1.9' strokeLinecap='round' />
        </svg>
      );
    case 'filter':
    case 'status':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={className} aria-hidden='true'>
          <path d='M4 6H20L14 12.5V18L10 20V12.5L4 6Z' stroke='currentColor' strokeWidth='1.9' strokeLinejoin='round' />
        </svg>
      );
    case 'price':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={className} aria-hidden='true'>
          <path d='M12 3V21' stroke='currentColor' strokeWidth='1.9' strokeLinecap='round' />
          <path
            d='M16.5 7.5C15.7 6.6 14.3 6 12.7 6H10.8C8.9 6 7.5 7.1 7.5 8.6C7.5 10.2 8.6 11 10.7 11.4L13.4 11.9C15.5 12.3 16.6 13.2 16.6 14.8C16.6 16.5 15.1 18 12.8 18H10.9C9.1 18 7.7 17.3 6.8 16.2'
            stroke='currentColor'
            strokeWidth='1.9'
            strokeLinecap='round'
          />
        </svg>
      );
    case 'reset':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={className} aria-hidden='true'>
          <path d='M5 8V4H9' stroke='currentColor' strokeWidth='1.9' strokeLinecap='round' strokeLinejoin='round' />
          <path
            d='M5.6 8.3C6.9 5.7 9.5 4 12.5 4C16.6 4 20 7.4 20 11.5C20 15.6 16.6 19 12.5 19C9.7 19 7.3 17.5 6 15.2'
            stroke='currentColor'
            strokeWidth='1.9'
            strokeLinecap='round'
          />
        </svg>
      );
    case 'search':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={className} aria-hidden='true'>
          <circle cx='10.8' cy='10.8' r='6.3' stroke='currentColor' strokeWidth='1.9' />
          <path d='M16 16L20 20' stroke='currentColor' strokeWidth='1.9' strokeLinecap='round' />
        </svg>
      );
    case 'sort':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={className} aria-hidden='true'>
          <path d='M7 5V19M7 19L4.5 16.5M7 19L9.5 16.5' stroke='currentColor' strokeWidth='1.9' strokeLinecap='round' strokeLinejoin='round' />
          <path d='M17 19V5M17 5L14.5 7.5M17 5L19.5 7.5' stroke='currentColor' strokeWidth='1.9' strokeLinecap='round' strokeLinejoin='round' />
        </svg>
      );
    default:
      return null;
  }
}

export function AdminToolbarField({
  children,
  className,
  hideLabel = false,
  icon,
  label,
  wide = false,
}: AdminToolbarFieldProps) {
  const controlRef = useRef<HTMLDivElement | null>(null);

  function activateControl(event: MouseEvent<HTMLSpanElement>) {
    event.preventDefault();
    const control = controlRef.current?.querySelector<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
    );

    control?.focus();
    control?.click();
  }

  return (
    <div
      className={cn(
        'flex w-full max-w-full flex-col gap-1.5 sm:w-[176px] sm:flex-none',
        hideLabel && 'gap-0',
        wide && 'sm:w-[300px]',
        className,
      )}
    >
      {hideLabel ? null : (
        <div className='flex min-w-0 items-center'>
          <span className='truncate text-[13px] font-bold text-slate-700'>
            {label}
          </span>
        </div>
      )}
      <div
        ref={controlRef}
        className='relative flex min-h-10 w-full items-center rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-left shadow-sm transition-colors duration-200 ease-out focus-within:border-[var(--admin-primary)] focus-within:bg-white focus-within:shadow-[var(--admin-focus-ring)]'
      >
        {icon ? (
          <span
            className='absolute left-3 top-1/2 z-10 grid h-5 w-5 -translate-y-1/2 cursor-text place-items-center text-[var(--admin-primary-strong)]'
            onMouseDown={activateControl}
          >
            {icon}
          </span>
        ) : null}
        <div className='absolute inset-0 flex min-w-0 items-center'>{children}</div>
      </div>
    </div>
  );
}

export function AdminToolbarDateRangeField({
  className,
  compactCalendar = false,
  fromLabel,
  hideLabel = false,
  fromValue,
  label,
  onFromChange,
  onToChange,
  toLabel,
  toValue,
}: AdminToolbarDateRangeFieldProps) {
  const controlRef = useRef<HTMLDivElement | null>(null);
  const rangeValue: [Dayjs | null, Dayjs | null] | null =
    fromValue || toValue ? [fromValue ? dayjs(fromValue) : null, toValue ? dayjs(toValue) : null] : null;
  const [openField, setOpenField] = useState<'from' | 'to' | null>(null);
  const fromDate = fromValue ? dayjs(fromValue) : null;
  const toDate = toValue ? dayjs(toValue) : null;
  const isToFieldEnabled = Boolean(fromValue);

  function activateControl(event: MouseEvent<HTMLSpanElement>) {
    event.preventDefault();
    const control = controlRef.current?.querySelector<HTMLElement>('input:not([disabled])');

    control?.focus();
    control?.click();
  }

  function renderCompactDateInput(field: 'from' | 'to') {
    const label = field === 'from' ? fromLabel : toLabel;
    const value = field === 'from' ? fromDate : toDate;

    return (
      <div key={field} className='min-w-0 flex-1'>
        <DatePicker
          allowClear
          className={cn(
            'admin-ant-range-picker !h-auto !min-h-0 !w-full !rounded-none !border-0 !bg-transparent !p-0 !shadow-none',
            '[&_.ant-picker-input>input]:!cursor-pointer [&_.ant-picker-input>input]:!text-[14px] [&_.ant-picker-input>input]:!font-semibold [&_.ant-picker-input>input]:!text-slate-950',
            '[&_.ant-picker-input>input::placeholder]:!font-semibold [&_.ant-picker-input>input::placeholder]:!text-slate-500',
            field === 'from'
              ? '[&_.ant-picker-input>input]:!pl-8'
              : '[&_.ant-picker-input>input]:!pl-1',
            '[&_.ant-picker-input>input]:!pr-6 [&_.ant-picker-suffix]:!hidden',
            field === 'to' && !isToFieldEnabled && '[&_.ant-picker-input>input]:!cursor-not-allowed [&_.ant-picker-input>input]:!text-slate-400 [&_.ant-picker-input>input::placeholder]:!text-slate-400',
          )}
          classNames={{
            popup: {
              root: cn(
                '[&_.ant-picker-panel-container]:!rounded-2xl',
                '[&_.ant-picker-panel-container]:!border',
                '[&_.ant-picker-panel-container]:!border-slate-200',
                '[&_.ant-picker-panel-container]:!shadow-2xl',
                '[&_.ant-picker-header]:!px-3',
                '[&_.ant-picker-body]:!p-3',
              ),
            },
          }}
          disabled={field === 'to' && !isToFieldEnabled}
          disabledDate={(current) =>
            field === 'to' && fromDate ? current.isBefore(fromDate, 'day') : false
          }
          format='DD/MM/YYYY'
          open={openField === field}
          onChange={(nextValue) => {
            const formatted = nextValue?.format('YYYY-MM-DD') ?? '';

            if (field === 'from') {
              onFromChange(formatted);

              if (!formatted) {
                onToChange('');
                setOpenField(null);
                return;
              }

              if (toDate?.isBefore(nextValue, 'day')) {
                onToChange('');
              }

              setOpenField('to');
              return;
            }

            onToChange(formatted);
            setOpenField(null);
          }}
          onOpenChange={(nextOpen) => {
            if (nextOpen) {
              setOpenField(field);
              return;
            }

            setOpenField((prev) => (prev === field ? null : prev));
          }}
          placeholder={label}
          suffixIcon={null}
          value={value}
        />
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 12,
          colorPrimary: '#63afe3',
          fontFamily:
            "'Segoe UI', Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif",
        },
        components: {
          DatePicker: {
            activeBorderColor: '#63afe3',
            activeShadow: 'inset 0 0 0 1px rgba(99, 175, 227, 0.82)',
            hoverBorderColor: '#8cc9ee',
          },
        },
      }}
    >
      <div
        className={cn(
          'flex w-full max-w-full flex-col gap-1.5 sm:w-[320px] sm:flex-none',
          hideLabel && 'gap-0',
          className,
        )}
      >
        {hideLabel ? null : (
          <div className='flex min-w-0 items-center'>
            <span className='truncate text-[13px] font-bold text-slate-700'>
              {label}
            </span>
          </div>
        )}
        {compactCalendar ? (
          <div className='relative flex min-h-10 w-full items-center rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-left shadow-sm transition-colors duration-200 ease-out focus-within:border-[var(--admin-primary)] focus-within:bg-white focus-within:shadow-[var(--admin-focus-ring)]'>
            <span className='absolute left-3 top-1/2 z-10 grid h-5 w-5 -translate-y-1/2 place-items-center text-[var(--admin-primary-strong)]'>
              <AdminToolbarIcon name='calendar' />
            </span>
            <div className='flex min-w-0 flex-1 items-center'>
              {renderCompactDateInput('from')}
              <span className='shrink-0 px-1 text-sm font-bold text-slate-300'>&rarr;</span>
              {renderCompactDateInput('to')}
            </div>
          </div>
        ) : (
          <div
            ref={controlRef}
            className='relative flex min-h-10 w-full items-center rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-left shadow-sm transition-colors duration-200 ease-out focus-within:border-[var(--admin-primary)] focus-within:bg-white focus-within:shadow-[var(--admin-focus-ring)]'
          >
            <span
              className='absolute left-3 top-1/2 z-10 grid h-5 w-5 -translate-y-1/2 cursor-text place-items-center text-[var(--admin-primary-strong)]'
              onMouseDown={activateControl}
            >
              <AdminToolbarIcon name='calendar' />
            </span>
            <RangePicker
              allowClear
              className={cn(
                'admin-ant-range-picker !h-auto !min-h-0 !w-full !rounded-none !border-0 !bg-transparent !p-0 !shadow-none',
                '[&_.ant-picker-input>input]:!text-[14px] [&_.ant-picker-input>input]:!font-semibold [&_.ant-picker-input>input]:!text-slate-950',
                '[&_.ant-picker-input>input::placeholder]:!font-semibold [&_.ant-picker-input>input::placeholder]:!text-slate-500',
                '[&_.ant-picker-input:first-child>input]:!pl-8',
                '[&_.ant-picker-separator]:!px-1 [&_.ant-picker-suffix]:!hidden',
              )}
              classNames={{
                popup: {
                  root: cn(
                    '[&_.ant-picker-panel-container]:!rounded-2xl',
                    '[&_.ant-picker-panel-container]:!border',
                    '[&_.ant-picker-panel-container]:!border-slate-200',
                    '[&_.ant-picker-panel-container]:!shadow-2xl',
                    '[&_.ant-picker-header]:!px-3',
                    '[&_.ant-picker-body]:!p-3',
                  ),
                },
              }}
              format='DD/MM/YYYY'
              onChange={(nextValue: [Dayjs | null, Dayjs | null] | null) => {
                onFromChange(nextValue?.[0]?.format('YYYY-MM-DD') ?? '');
                onToChange(nextValue?.[1]?.format('YYYY-MM-DD') ?? '');
              }}
              placeholder={[fromLabel, toLabel]}
              separator={<span className='text-sm font-bold text-slate-300'>&rarr;</span>}
              suffixIcon={null}
              value={rangeValue}
            />
          </div>
        )}
      </div>
    </ConfigProvider>
  );
}

export default function AdminToolbar({
  badge,
  children,
  className,
  description,
  icon,
  title,
}: AdminToolbarProps) {
  return (
    <section
      className={cn(
        'admin-surface rounded-[22px] border-slate-200 bg-white p-4 shadow-sm sm:p-5',
        className,
      )}
    >
      <div className='flex flex-col gap-4 xl:grid xl:grid-cols-[minmax(280px,420px)_minmax(0,1fr)] xl:items-start xl:gap-x-6 xl:gap-y-4 2xl:items-center'>
        <div className='min-w-0 xl:max-w-[420px]'>
          <div className='flex items-center gap-3'>
            <div className='grid h-11 w-11 shrink-0 place-items-center rounded-[15px] border border-[var(--admin-accent)] bg-[#ffe16a] text-[#18385a] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)]'>
              {icon}
            </div>
            <div className='min-w-0'>
              <div className='flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2'>
                <h2 className='min-w-0 text-lg font-bold tracking-[-0.01em] text-slate-950 [text-wrap:balance]'>
                  {title}
                </h2>
                {badge ? <div className='max-w-full shrink-0'>{badge}</div> : null}
              </div>
            </div>
          </div>
        </div>

        <div className='flex min-w-0 flex-wrap items-end gap-2 gap-y-3 xl:justify-end'>
          {children}
        </div>
      </div>
    </section>
  );
}
