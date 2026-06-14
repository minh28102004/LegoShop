'use client';

import { useState, type ReactNode } from 'react';
import Dropdown from '@/common/components/ui/Dropdown';
import { cn } from '@/common/utils/cn';

export type MultiSelectFilterOption = {
  label: string;
  value: string;
};

type MultiSelectFilterProps = {
  allLabel: string;
  ariaLabel: string;
  className?: string;
  icon?: ReactNode;
  onChange: (values: string[]) => void;
  options: MultiSelectFilterOption[];
  placeholder?: string;
  selectedLabel?: (count: number) => string;
  values: string[];
};

function ChevronDownIcon() {
  return (
    <svg viewBox='0 0 20 20' fill='none' className='h-[18px] w-[18px]' aria-hidden='true'>
      <path
        d='M5 7.5L10 12.5L15 7.5'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.8'
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox='0 0 20 20' fill='none' className='h-3.5 w-3.5' aria-hidden='true'>
      <path
        d='M4.5 10.25L8.1 13.75L15.5 6.25'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2.2'
      />
    </svg>
  );
}

function CheckboxMark({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        'grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border transition-colors duration-150',
        checked
          ? 'border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white'
          : 'border-slate-300 bg-white text-transparent group-hover:border-[var(--admin-primary)]',
      )}
      aria-hidden='true'
    >
      <CheckIcon />
    </span>
  );
}

export default function MultiSelectFilter({
  allLabel,
  ariaLabel,
  className,
  icon,
  onChange,
  options,
  placeholder,
  selectedLabel,
  values,
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const valueSet = new Set(values);
  const selectedOptions = options.filter((option) => valueSet.has(option.value));
  const display =
    selectedOptions.length === 0
      ? (placeholder ?? '')
      : selectedOptions.length === 1
        ? selectedOptions[0]?.label
        : (selectedLabel?.(selectedOptions.length) ?? `${selectedOptions.length} mục`);

  function toggleValue(value: string) {
    if (valueSet.has(value)) {
      onChange(values.filter((item) => item !== value));
      return;
    }
    onChange([...values, value]);
  }

  return (
    <Dropdown
      className={cn('w-full', className)}
      align='left'
      onOpenChange={setOpen}
      portal
      panelRole='menu'
      matchTriggerWidth
      offset={5}
      trigger={
        <button
          type='button'
          role='combobox'
          aria-expanded={open}
          aria-label={ariaLabel}
          className={cn(
            'admin-control admin-control-md relative flex min-h-[42px] items-center gap-2 pr-11 text-left text-sm',
            open && 'border-[var(--admin-primary)] shadow-[var(--admin-focus-ring)]',
          )}
          title={selectedOptions.length === 0 ? allLabel : display}
        >
          {icon ? <span className='grid h-4 w-4 shrink-0 place-items-center text-[var(--admin-primary-strong)]'>{icon}</span> : null}
          <span
            className={cn(
              'block min-h-5 min-w-0 flex-1 truncate font-semibold leading-5',
              selectedOptions.length === 0 ? 'text-slate-500' : 'text-[var(--admin-primary-strong)]',
            )}
          >
            {display}
          </span>
          <span
            className={cn(
              'pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-slate-400 transition duration-150',
              open && 'rotate-180 text-[var(--admin-primary-strong)]',
            )}
          >
            <ChevronDownIcon />
          </span>
        </button>
      }
      panelClassName='admin-scrollbar max-w-[min(380px,calc(100vw-24px))] overflow-y-auto p-1.5'
    >
      {() => (
        <div className='space-y-1'>
          {options.map((option) => {
            const active = valueSet.has(option.value);
            return (
              <button
                key={option.value}
                type='button'
                role='menuitemcheckbox'
                aria-checked={active}
                onClick={() => toggleValue(option.value)}
                className={cn(
                  'group flex min-h-10 w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-sm transition-colors duration-150',
                  active
                    ? 'bg-[var(--admin-primary-soft)] font-semibold text-[var(--admin-primary-strong)]'
                    : 'font-medium text-slate-700 hover:bg-[var(--admin-primary-soft)] hover:text-slate-900',
                )}
              >
                <CheckboxMark checked={active} />
                <span className='whitespace-nowrap'>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </Dropdown>
  );
}
