'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Badge, { getStatusBadgeLabel, StatusBadge } from '@/common/components/ui/Badge';
import Button from '@/common/components/ui/Button';
import Input from '@/common/components/ui/Input';
import PageShell from '@/common/components/ui/PageShell';
import Select from '@/common/components/ui/Select';
import Table, {
  DEFAULT_TABLE_SORTS,
  SortableTableHead,
  TableActions,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TablePagination,
  TableRow,
  areTableSortsEqual,
  serializeTableSorts,
  tableActionButtonClass,
  type TableSort,
} from '@/common/components/ui/Table';
import Tooltip from '@/common/components/ui/Tooltip';
import { listBusinessInquiries, updateBusinessInquiryStatus } from '@/modules/admin/services/adminApi';
import { useI18n } from '@/lib/i18n/useI18n';
import AdminToolbar, {
  AdminToolbarField,
  AdminToolbarIcon,
  adminToolbarButtonClass,
  adminToolbarInputClass,
} from '@/modules/admin/components/AdminToolbar';
import AdminNavIcon from '@/modules/admin/components/AdminNavIcon';
import EntityFilterDrawer from '@/modules/admin/components/entities/EntityFilterDrawer';
import {
  EMPTY_ENTITY_FILTER_DRAFT,
  type EntityFilterDraft,
} from '@/modules/admin/components/entities/entity-filter.types';
import type { BusinessInquiry, InquiryStatus, PaginatedResourceResponse } from '@/modules/admin/types/admin.types';

const INQUIRY_STATUSES: Array<InquiryStatus | ''> = [
  '',
  'new',
  'contacted',
  'processing',
  'done',
  'cancelled',
];

const INQUIRY_PAGE_SIZE = 20;
const NUMBER_FORMAT = new Intl.NumberFormat('vi-VN');

type InquiryPayload = PaginatedResourceResponse<BusinessInquiry>;

function getInquiryUiText(locale: string, key: string) {
  const vi: Record<string, string> = {
    searchPlaceholder: 'Tìm công ty, email, SĐT...',
    allStatuses: 'Tất cả trạng thái',
    reset: 'Đặt lại',
    inquiries: 'liên hệ',
    page: 'Trang',
  };
  const en: Record<string, string> = {
    searchPlaceholder: 'Search company, email, phone...',
    allStatuses: 'All statuses',
    reset: 'Reset',
    inquiries: 'inquiries',
    page: 'Page',
  };

  return locale === 'vi' ? vi[key] : en[key];
}

function getInquiryPaginationRangeLabel(
  locale: string,
  from: number,
  to: number,
  total: number,
  itemLabel: string,
) {
  const formattedRange = `${NUMBER_FORMAT.format(from)}–${NUMBER_FORMAT.format(to)}`;
  const formattedTotal = `${NUMBER_FORMAT.format(total)}${itemLabel ? ` ${itemLabel}` : ''}`;

  return locale === 'vi'
    ? `Hiển thị ${formattedRange} trên ${formattedTotal}`
    : `Showing ${formattedRange} of ${formattedTotal}`;
}

function FilterIconWithBadge({ count }: { count: number }) {
  return (
    <span className='relative inline-flex'>
      <AdminToolbarIcon name='filter' />
      {count > 0 ? (
        <span className='absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--admin-primary-strong)] px-1 text-[10px] font-bold leading-none text-white'>
          {count}
        </span>
      ) : null}
    </span>
  );
}

export default function InquiriesManager() {
  const { t, locale } = useI18n();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InquiryStatus[]>([]);
  const [sorts, setSorts] = useState<TableSort[]>([...DEFAULT_TABLE_SORTS]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<EntityFilterDraft>(EMPTY_ENTITY_FILTER_DRAFT);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(INQUIRY_PAGE_SIZE);
  const [payload, setPayload] = useState<InquiryPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inquiries = payload?.data ?? [];

  function statusLabel(value: string) {
    return getStatusBadgeLabel(value, t);
  }

  function EyeIcon() {
    return (
      <svg viewBox='0 0 24 24' fill='none' className='h-4 w-4' aria-hidden='true'>
        <path
          d='M2.5 12C4.5 7 8 4.5 12 4.5C16 4.5 19.5 7 21.5 12C19.5 17 16 19.5 12 19.5C8 19.5 4.5 17 2.5 12Z'
          stroke='currentColor'
          strokeWidth='1.8'
          strokeLinejoin='round'
        />
        <circle cx='12' cy='12' r='2.75' stroke='currentColor' strokeWidth='1.8' />
      </svg>
    );
  }

  const inquiryStatusOptions = useMemo(
    () =>
      INQUIRY_STATUSES.filter((status): status is InquiryStatus => Boolean(status)).map(
        (status) => ({
          value: status,
          label: statusLabel(status),
        }),
      ),
    [t],
  );
  const activeFilterCount = statusFilter.length;
  const showResetFilters =
    Boolean(search.trim()) ||
    activeFilterCount > 0 ||
    !areTableSortsEqual(sorts, DEFAULT_TABLE_SORTS);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const serializedSorts = serializeTableSorts(sorts);
      const data = await listBusinessInquiries({
        page,
        limit: pageSize,
        search: debouncedSearch,
        status: statusFilter.length > 0 ? statusFilter : undefined,
        sort_by: serializedSorts.sortBy,
        sort_dir: serializedSorts.sortDir,
      });
      setPayload(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('inquiries.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, pageSize, sorts, statusFilter, t]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [load]);

  async function updateStatus(id: string, status: InquiryStatus) {
    try {
      await updateBusinessInquiryStatus(id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('inquiries.updateFailed'));
    }
  }

  function applyInquiryFilters(nextFilters: EntityFilterDraft) {
    setStatusFilter(nextFilters.status as InquiryStatus[]);
    setPage(1);
    setFilterDrawerOpen(false);
  }

  function resetFilters() {
    setSearch('');
    setDebouncedSearch('');
    setStatusFilter([]);
    setSorts([...DEFAULT_TABLE_SORTS]);
    setDraftFilters(EMPTY_ENTITY_FILTER_DRAFT);
    setPage(1);
  }

  function handleTableSort(nextSorts: TableSort[]) {
    setSorts(nextSorts);
    setPage(1);
  }

  return (
    <PageShell scrollable={false}>
      <AdminToolbar
          icon={<AdminNavIcon name='businessInquiries' className='h-6 w-6' />}
          title={t('sidebar.businessInquiries')}
          description={t('sidebarDesc.businessInquiries')}
          badge={
            <Badge tone='info' className='rounded-full px-4 py-2 text-sm font-bold !text-slate-950'>
              {payload?.meta.total ?? 0} {getInquiryUiText(locale, 'inquiries')}
            </Badge>
          }
        >
        <AdminToolbarField
          wide
          icon={<AdminToolbarIcon name='search' />}
          label={t('common.search')}
          className='sm:w-[300px]'
        >
          <Input
            value={search}
            aria-label={getInquiryUiText(locale, 'searchPlaceholder')}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={getInquiryUiText(locale, 'searchPlaceholder')}
            className={adminToolbarInputClass}
          />
        </AdminToolbarField>

        <Button
          type='button'
          variant='secondary'
          leftIcon={<FilterIconWithBadge count={activeFilterCount} />}
          onClick={() => setFilterDrawerOpen(true)}
          className={adminToolbarButtonClass}
        >
          {locale === 'vi' ? 'Bộ lọc' : 'Filters'}
        </Button>

        {showResetFilters ? (
          <Button
            type='button'
            variant='secondary'
            onClick={resetFilters}
            leftIcon={<AdminToolbarIcon name='reset' />}
            className={adminToolbarButtonClass}
          >
            {getInquiryUiText(locale, 'reset')}
          </Button>
        ) : null}
      </AdminToolbar>

      <EntityFilterDrawer
        open={filterDrawerOpen}
        draftFilters={draftFilters}
        statusOptions={inquiryStatusOptions}
        categoryOptions={[]}
        hasPriceFilter={false}
        onClose={() => setFilterDrawerOpen(false)}
        onDraftChange={setDraftFilters}
        onApply={applyInquiryFilters}
        labels={{
          allCategories: '',
          allStatuses: getInquiryUiText(locale, 'allStatuses'),
          apply: locale === 'vi' ? 'Áp dụng' : 'Apply filters',
          category: '',
          filterTitle: locale === 'vi' ? 'Bộ lọc' : 'Filters',
          priceMax: '',
          priceMin: '',
          priceRange: '',
          reset: getInquiryUiText(locale, 'reset'),
          selectedCount: (count) => `${count} ${locale === 'vi' ? 'mục đã chọn' : 'selected'}`,
          status: t('common.status'),
        }}
      />

      <Table containerClassName='min-h-0'>
        <TableHeader>
          <tr>
            <SortableTableHead
              sortKey='companyName'
              defaultSorts={DEFAULT_TABLE_SORTS}
              sorts={sorts}
              defaultDirection='asc'
              onSortChange={handleTableSort}
            >
              {t('inquiries.company')}
            </SortableTableHead>
            <SortableTableHead
              sortKey='contactName'
              defaultSorts={DEFAULT_TABLE_SORTS}
              sorts={sorts}
              defaultDirection='asc'
              onSortChange={handleTableSort}
            >
              {t('inquiries.contact')}
            </SortableTableHead>
            <SortableTableHead
              sortKey='email'
              defaultSorts={DEFAULT_TABLE_SORTS}
              sorts={sorts}
              defaultDirection='asc'
              onSortChange={handleTableSort}
            >
              {t('inquiries.email')}
            </SortableTableHead>
            <SortableTableHead
              sortKey='phone'
              defaultSorts={DEFAULT_TABLE_SORTS}
              sorts={sorts}
              defaultDirection='asc'
              onSortChange={handleTableSort}
            >
              {t('inquiries.phone')}
            </SortableTableHead>
            <SortableTableHead
              sortKey='status'
              defaultSorts={DEFAULT_TABLE_SORTS}
              sorts={sorts}
              defaultDirection='asc'
              onSortChange={handleTableSort}
            >
              {t('common.status')}
            </SortableTableHead>
            <TableHead className='text-center'>{t('inquiries.action')}</TableHead>
          </tr>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableEmptyState colSpan={6} variant='loading'>{t('inquiries.loading')}</TableEmptyState>
          ) : error ? (
            <TableEmptyState colSpan={6} variant='error'>
              {error}
            </TableEmptyState>
          ) : inquiries.length === 0 ? (
            <TableEmptyState colSpan={6}>{t('inquiries.noData')}</TableEmptyState>
          ) : (
            inquiries.map((item) => (
              <TableRow key={item.id} hoverable>
                <TableCell className='font-medium text-slate-800'>
                  <span className='block max-w-[220px] truncate font-semibold text-slate-900'>
                    {item.companyName}
                  </span>
                </TableCell>
                <TableCell>
                  <span className='block max-w-[180px] truncate font-medium text-slate-700'>
                    {item.contactName}
                  </span>
                </TableCell>
                <TableCell>
                  <span className='block max-w-[220px] truncate text-[13px] font-medium text-slate-500'>
                    {item.email}
                  </span>
                </TableCell>
                <TableCell className='font-medium tabular-nums text-slate-600'>{item.phone}</TableCell>
                <TableCell>
                  <div className='min-w-[190px] space-y-2'>
                    <StatusBadge value={item.status} t={t} />
                    <Select
                      value={item.status}
                      aria-label={t('common.status')}
                      onChange={(e) => updateStatus(item.id, e.target.value as InquiryStatus)}
                    >
                      {INQUIRY_STATUSES.filter(Boolean).map((status) => (
                        <option key={status} value={status}>
                          {statusLabel(status)}
                        </option>
                      ))}
                    </Select>
                  </div>
                </TableCell>
                <TableCell className='text-center'>
                  <TableActions>
                    <Tooltip content={t('inquiries.detail')}>
                      <Link
                        href={`/business-inquiries/${item.id}`}
                        aria-label={t('inquiries.detail')}
                        className={tableActionButtonClass('view')}
                      >
                        <EyeIcon />
                      </Link>
                    </Tooltip>
                  </TableActions>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={payload?.meta.page ?? page}
        totalPages={payload?.meta.totalPages ?? payload?.meta.total_pages ?? 1}
        total={payload?.meta.total ?? 0}
        itemLabel={getInquiryUiText(locale, 'inquiries')}
        pageLabel={getInquiryUiText(locale, 'page')}
        pageSize={payload?.meta.limit ?? pageSize}
        pageSizeLabel={locale === 'vi' ? 'Số dòng' : 'Rows'}
        totalLabel={t('common.total')}
        previousLabel={t('common.previous')}
        nextLabel={t('common.next')}
        previousDisabled={page <= 1}
        nextDisabled={page >= (payload?.meta.totalPages ?? payload?.meta.total_pages ?? 1)}
        rangeLabel={(from, to, total, itemLabel) =>
          getInquiryPaginationRangeLabel(locale, from, to, total, itemLabel)
        }
        onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
        onNext={() => setPage((prev) => prev + 1)}
        onPageChange={setPage}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPage(1);
        }}
      />
    </PageShell>
  );
}

