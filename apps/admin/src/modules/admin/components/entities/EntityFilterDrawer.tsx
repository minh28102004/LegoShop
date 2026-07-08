'use client';

import { Drawer } from 'antd';
import type { ReactNode } from 'react';
import Button from '@/common/components/ui/Button';
import Input from '@/common/components/ui/Input';
import { AdminToolbarDateRangeField } from '@/modules/admin/components/AdminToolbar';
import MultiSelectFilter from '@/modules/admin/components/filters/MultiSelectFilter';
import {
  EMPTY_ENTITY_FILTER_DRAFT,
  type EntityFilterDraft,
  type EntityFilterOption,
} from '@/modules/admin/components/entities/entity-filter.types';

type EntityFilterDrawerLabels = {
  allCategories: string;
  allStatuses: string;
  apply: string;
  category: string;
  dateFrom: string;
  dateRange: string;
  dateTo: string;
  filterTitle: string;
  priceMax: string;
  priceMin: string;
  priceRange: string;
  reset: string;
  selectedCount: (count: number) => string;
  status: string;
};

type EntityFilterDrawerProps = {
  categoryOptions: EntityFilterOption[];
  draftFilters: EntityFilterDraft;
  hasDateFilter: boolean;
  hasPriceFilter: boolean;
  labels: EntityFilterDrawerLabels;
  onApply: (filters: EntityFilterDraft) => void;
  onClose: () => void;
  onDraftChange: (filters: EntityFilterDraft) => void;
  open: boolean;
  statusOptions: EntityFilterOption[];
};

function FilterSection({
  children,
  icon,
  title,
}: {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}) {
  return (
    <section className='space-y-3 rounded-[18px] bg-slate-50/75 p-3.5'>
      <div className='flex items-center gap-2'>
        <span className='grid h-5 w-5 shrink-0 place-items-center text-[var(--admin-primary-strong)]'>{icon}</span>
        <h3 className='text-[13px] font-bold text-slate-700'>
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

function SectionIcon({ name }: { name: 'category' | 'date' | 'price' | 'status' }) {
  if (name === 'date') {
    return (
      <svg viewBox='0 0 24 24' fill='none' className='h-4 w-4' aria-hidden='true'>
        <path d='M7 3.5V6.5M17 3.5V6.5' stroke='currentColor' strokeWidth='1.9' strokeLinecap='round' />
        <rect x='4' y='5.5' width='16' height='15' rx='3' stroke='currentColor' strokeWidth='1.9' />
        <path d='M4 10H20' stroke='currentColor' strokeWidth='1.9' strokeLinecap='round' />
      </svg>
    );
  }

  if (name === 'price') {
    return (
      <svg viewBox='0 0 24 24' fill='none' className='h-4 w-4' aria-hidden='true'>
        <path d='M12 3V21' stroke='currentColor' strokeLinecap='round' strokeWidth='1.9' />
        <path
          d='M16.4 7.5C15.6 6.6 14.2 6 12.7 6H11C9 6 7.6 7 7.6 8.6C7.6 10.1 8.7 11 10.7 11.4L13.3 11.9C15.4 12.3 16.5 13.2 16.5 14.8C16.5 16.5 15 18 12.8 18H10.9C9.2 18 7.8 17.3 6.9 16.2'
          stroke='currentColor'
          strokeLinecap='round'
          strokeWidth='1.9'
        />
      </svg>
    );
  }

  if (name === 'category') {
    return (
      <svg viewBox='0 0 24 24' fill='none' className='h-4 w-4' aria-hidden='true'>
        <path d='M4 6.5H10.5V13H4V6.5Z' stroke='currentColor' strokeLinejoin='round' strokeWidth='1.9' />
        <path d='M13.5 6.5H20V13H13.5V6.5Z' stroke='currentColor' strokeLinejoin='round' strokeWidth='1.9' />
        <path d='M4 16H20' stroke='currentColor' strokeLinecap='round' strokeWidth='1.9' />
      </svg>
    );
  }

  return (
    <svg viewBox='0 0 24 24' fill='none' className='h-4 w-4' aria-hidden='true'>
      <path d='M4 6H20L14 12.5V18L10 20V12.5L4 6Z' stroke='currentColor' strokeLinejoin='round' strokeWidth='1.9' />
    </svg>
  );
}

function ApplyIcon() {
  return (
    <svg viewBox='0 0 20 20' fill='none' className='h-4 w-4' aria-hidden='true'>
      <path d='M4.5 10.5L8 14L15.5 6.5' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg viewBox='0 0 20 20' fill='none' className='h-4 w-4' aria-hidden='true'>
      <path d='M5 7V4H8' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.8' />
      <path d='M5.5 7.4C6.5 5.7 8.3 4.7 10.4 4.7C13.6 4.7 16.2 7.3 16.2 10.5C16.2 13.7 13.6 16.3 10.4 16.3C8.4 16.3 6.7 15.3 5.7 13.8' stroke='currentColor' strokeLinecap='round' strokeWidth='1.8' />
    </svg>
  );
}

export default function EntityFilterDrawer({
  categoryOptions,
  draftFilters,
  hasDateFilter,
  hasPriceFilter,
  labels,
  onApply,
  onClose,
  onDraftChange,
  open,
  statusOptions,
}: EntityFilterDrawerProps) {
  const hasStatusFilter = statusOptions.length > 0;
  const hasCategoryFilter = categoryOptions.length > 0;

  function updateDraft(key: 'dateFrom' | 'dateTo' | 'priceMax' | 'priceMin', value: string) {
    onDraftChange({
      ...draftFilters,
      [key]: value,
    });
  }

  function updateList(key: 'category' | 'status', values: string[]) {
    onDraftChange({
      ...draftFilters,
      [key]: values,
    });
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement='right'
      size='default'
      title={<span className='text-base font-bold text-slate-950'>{labels.filterTitle}</span>}
      styles={{
        body: { padding: 0 },
        header: { borderBottom: '1px solid rgba(226, 232, 240, 0.82)' },
      }}
    >
      <div className='flex h-full flex-col'>
        <div className='admin-scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-4'>
          {hasStatusFilter ? (
            <FilterSection title={labels.status} icon={<SectionIcon name='status' />}>
              <MultiSelectFilter
                values={draftFilters.status}
                ariaLabel={labels.status}
                allLabel={labels.allStatuses}
                placeholder={`Chọn ${labels.status.toLowerCase()}`}
                options={statusOptions}
                selectedLabel={labels.selectedCount}
                onChange={(values) => updateList('status', values)}
              />
            </FilterSection>
          ) : null}

          {hasCategoryFilter ? (
            <FilterSection title={labels.category} icon={<SectionIcon name='category' />}>
              <MultiSelectFilter
                values={draftFilters.category}
                ariaLabel={labels.category}
                allLabel={labels.allCategories}
                placeholder={`Chọn ${labels.category.toLowerCase()}`}
                options={categoryOptions}
                selectedLabel={labels.selectedCount}
                onChange={(values) => updateList('category', values)}
              />
            </FilterSection>
          ) : null}

          {hasPriceFilter ? (
            <FilterSection title={labels.priceRange} icon={<SectionIcon name='price' />}>
              <div className='grid grid-cols-2 gap-2'>
                <Input
                  type='number'
                  min={0}
                  value={draftFilters.priceMin}
                  aria-label={labels.priceMin}
                  placeholder={labels.priceMin}
                  onChange={(event) => updateDraft('priceMin', event.target.value)}
                />
                <Input
                  type='number'
                  min={0}
                  value={draftFilters.priceMax}
                  aria-label={labels.priceMax}
                  placeholder={labels.priceMax}
                  onChange={(event) => updateDraft('priceMax', event.target.value)}
                />
              </div>
            </FilterSection>
          ) : null}

          {hasDateFilter ? (
            <FilterSection title={labels.dateRange} icon={<SectionIcon name='date' />}>
              <AdminToolbarDateRangeField
                compactCalendar
                hideLabel
                className='sm:w-full'
                fromLabel={labels.dateFrom}
                fromValue={draftFilters.dateFrom}
                label={labels.dateRange}
                onFromChange={(value) => updateDraft('dateFrom', value)}
                onToChange={(value) => updateDraft('dateTo', value)}
                toLabel={labels.dateTo}
                toValue={draftFilters.dateTo}
              />
            </FilterSection>
          ) : null}

        </div>

        <div className='flex items-center gap-2 bg-white px-4 py-3 shadow-[0_-1px_0_rgba(226,232,240,0.8)]'>
          <Button
            type='button'
            variant='secondary'
            className='h-10 flex-1 rounded-[12px]'
            leftIcon={<ResetIcon />}
            onClick={() => onDraftChange(EMPTY_ENTITY_FILTER_DRAFT)}
          >
            {labels.reset}
          </Button>
          <Button
            type='button'
            className='h-10 flex-1 rounded-[12px]'
            leftIcon={<ApplyIcon />}
            onClick={() => onApply(draftFilters)}
          >
            {labels.apply}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
