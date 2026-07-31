'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Badge, { getStatusBadgeLabel, StatusBadge } from '@/common/components/ui/Badge';
import Button from '@/common/components/ui/Button';
import Input from '@/common/components/ui/Input';
import PageShell from '@/common/components/ui/PageShell';
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
import { listBusinessInquiries } from '@/modules/admin/services/adminApi';
import { useI18n } from '@/lib/i18n/useI18n';
import { getLocalizedApiError } from '@/lib/i18n/errors';
import { formatNumber } from '@/lib/i18n/format';
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

type InquiryPayload = PaginatedResourceResponse<BusinessInquiry>;

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
  const requestSeq = useRef(0);
  const inquiries = payload?.data ?? [];

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
          label: getStatusBadgeLabel(status, t),
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
    const requestId = requestSeq.current + 1;
    requestSeq.current = requestId;
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
      if (requestSeq.current !== requestId) return;
      setPayload(data);
    } catch (err) {
      if (requestSeq.current !== requestId) return;
      setError(getLocalizedApiError(err, t, 'inquiries.loadFailed'));
    } finally {
      if (requestSeq.current === requestId) {
        setLoading(false);
      }
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
    const frame = window.requestAnimationFrame(() => {
      void load();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [load]);

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
              {formatNumber(payload?.meta.total ?? 0, locale)} {t('inquiries.countLabel')}
            </Badge>
          }
        >
        <AdminToolbarField
          hideLabel
          wide
          icon={<AdminToolbarIcon name='search' />}
          label={t('common.search')}
          className='sm:w-[300px]'
        >
          <Input
            value={search}
            aria-label={t('inquiries.searchPlaceholder')}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('inquiries.searchPlaceholder')}
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
            {t('inquiries.reset')}
          </Button>
        ) : null}
      </AdminToolbar>

      <EntityFilterDrawer
        open={filterDrawerOpen}
        draftFilters={draftFilters}
        statusOptions={inquiryStatusOptions}
        categoryOptions={[]}
        hasDateFilter={false}
        hasPriceFilter={false}
        onClose={() => setFilterDrawerOpen(false)}
        onDraftChange={setDraftFilters}
        onApply={applyInquiryFilters}
        labels={{
          allCategories: '',
          allStatuses: t('inquiries.allStatuses'),
          apply: locale === 'vi' ? 'Áp dụng' : 'Apply filters',
          category: '',
          dateFrom: locale === 'vi' ? 'Tá»« ngÃ y' : 'From date',
          dateRange: locale === 'vi' ? 'Khoáº£ng ngÃ y' : 'Date range',
          dateTo: locale === 'vi' ? 'Äáº¿n ngÃ y' : 'To date',
          filterTitle: locale === 'vi' ? 'Bộ lọc' : 'Filters',
          priceMax: '',
          priceMin: '',
          priceRange: '',
          reset: t('inquiries.reset'),
          selectedCount: (count) => `${count} ${locale === 'vi' ? 'mục đã chọn' : 'selected'}`,
          status: t('common.status'),
        }}
      />

      <Table containerClassName='min-h-0' minWidth='1040px'>
        <TableHeader>
          <tr>
            <SortableTableHead
              sortKey='companyName'
              defaultSorts={DEFAULT_TABLE_SORTS}
              sorts={sorts}
              defaultDirection='asc'
              onSortChange={handleTableSort}
              className='min-w-[240px] text-left'
            >
              {t('inquiries.company')}
            </SortableTableHead>
            <SortableTableHead
              sortKey='contactName'
              defaultSorts={DEFAULT_TABLE_SORTS}
              sorts={sorts}
              defaultDirection='asc'
              onSortChange={handleTableSort}
              className='w-[180px] min-w-[180px] max-w-[180px] text-left'
            >
              {t('inquiries.contact')}
            </SortableTableHead>
            <SortableTableHead
              sortKey='email'
              defaultSorts={DEFAULT_TABLE_SORTS}
              sorts={sorts}
              defaultDirection='asc'
              onSortChange={handleTableSort}
              className='w-[220px] min-w-[220px] max-w-[220px] text-left'
            >
              {t('inquiries.email')}
            </SortableTableHead>
            <SortableTableHead
              sortKey='phone'
              defaultSorts={DEFAULT_TABLE_SORTS}
              sorts={sorts}
              defaultDirection='asc'
              onSortChange={handleTableSort}
              className='w-[150px] min-w-[150px] max-w-[150px] text-left'
            >
              {t('inquiries.phone')}
            </SortableTableHead>
            <SortableTableHead
              sortKey='status'
              defaultSorts={DEFAULT_TABLE_SORTS}
              sorts={sorts}
              defaultDirection='asc'
              onSortChange={handleTableSort}
              className='w-[140px] min-w-[140px] max-w-[140px] text-center'
            >
              {t('common.status')}
            </SortableTableHead>
            <TableHead className='w-[110px] min-w-[110px] max-w-[110px] px-2 text-center'>{t('inquiries.action')}</TableHead>
          </tr>
        </TableHeader>

        <TableBody>
          {loading && !payload ? (
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
                <TableCell className='min-w-[240px] font-medium text-slate-800'>
                  <span title={item.companyName} className='block truncate font-semibold text-slate-900'>
                    {item.companyName}
                  </span>
                </TableCell>
                <TableCell className='w-[180px] min-w-[180px] max-w-[180px]'>
                  <span title={item.contactName} className='block truncate font-medium text-slate-700'>
                    {item.contactName}
                  </span>
                </TableCell>
                <TableCell className='w-[220px] min-w-[220px] max-w-[220px]'>
                  <span title={item.email} className='block truncate text-[13px] font-medium text-slate-500'>
                    {item.email}
                  </span>
                </TableCell>
                <TableCell className='w-[150px] min-w-[150px] max-w-[150px] whitespace-nowrap font-medium tabular-nums text-slate-600'>{item.phone}</TableCell>
                <TableCell className='w-[140px] min-w-[140px] max-w-[140px] text-center'>
                  <StatusBadge value={item.status} t={t} />
                </TableCell>
                <TableCell className='w-[110px] min-w-[110px] max-w-[110px] px-2 text-center'>
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
        itemLabel={t('inquiries.countLabel')}
        pageLabel={t('inquiries.page')}
        pageSize={payload?.meta.limit ?? pageSize}
        pageSizeLabel={t('common.perPage')}
        totalLabel={t('common.total')}
        previousLabel={t('common.previous')}
        nextLabel={t('common.next')}
        previousDisabled={page <= 1}
        nextDisabled={page >= (payload?.meta.totalPages ?? payload?.meta.total_pages ?? 1)}
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

