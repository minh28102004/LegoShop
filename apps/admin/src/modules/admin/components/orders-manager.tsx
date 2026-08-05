'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getStatusBadgeLabel, StatusBadge } from '@/common/components/ui/Badge';
import PageShell from '@/common/components/ui/PageShell';
import Tooltip from '@/common/components/ui/Tooltip';
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
  serializeTableSorts,
  tableActionButtonClass,
} from '@/common/components/ui/Table';
import OrdersFilterDrawer from '@/modules/admin/components/orders/OrdersFilterDrawer';
import OrdersToolbar from '@/modules/admin/components/orders/OrdersToolbar';
import {
  DEFAULT_ORDER_FILTERS,
  countAdvancedOrderFilters,
  hasAnyOrderFilter,
  type OrderFilters,
} from '@/modules/admin/components/orders/order-filter.types';
import { listOrders } from '@/modules/admin/services/adminApi';
import { useI18n } from '@/lib/i18n/useI18n';
import { getLocalizedApiError } from '@/lib/i18n/errors';
import { formatVnd } from '@/lib/i18n/format';
import type { Locale } from '@/lib/i18n/config';
import type { PaginatedOrders } from '@/modules/admin/types/admin.types';

const ORDER_PAGE_SIZE = 20;

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

function toDateRange(from: string, to: string): [string, string] | undefined {
  return from || to ? [from, to] : undefined;
}

function getOrderItemLabel(locale: Locale) {
  return locale === 'vi' ? 'đơn hàng' : 'orders';
}

export default function OrdersManager() {
  const { t, locale } = useI18n();
  const [searchInput, setSearchInput] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<OrderFilters>(DEFAULT_ORDER_FILTERS);
  const [draftFilters, setDraftFilters] = useState<OrderFilters>(DEFAULT_ORDER_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(ORDER_PAGE_SIZE);
  const [payload, setPayload] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestSeq = useRef(0);

  const activeAdvancedFilterCount = countAdvancedOrderFilters(appliedFilters);
  const showReset = hasAnyOrderFilter(appliedFilters);
  const dateFrom = appliedFilters.dateRange?.[0] ?? '';
  const dateTo = appliedFilters.dateRange?.[1] ?? '';
  const serializedSorts = useMemo(
    () => serializeTableSorts(appliedFilters.sorts),
    [appliedFilters.sorts],
  );

  function statusLabel(value: string) {
    return getStatusBadgeLabel(value, t);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const keyword = searchInput.trim();
      setAppliedFilters((current) => {
        if (current.keyword === keyword) return current;
        setPage(1);
        return { ...current, keyword };
      });
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchInput]);

  useEffect(() => {
    async function load() {
      const requestId = requestSeq.current + 1;
      requestSeq.current = requestId;
      setLoading(true);
      setError(null);
      try {
        const data = await listOrders({
          search: appliedFilters.keyword,
          orderStatus: appliedFilters.orderStatus,
          paymentStatus: appliedFilters.paymentStatus,
          shippingStatus: appliedFilters.shippingStatus,
          amount_min: appliedFilters.minPrice,
          amount_max: appliedFilters.maxPrice,
          date_from: appliedFilters.dateRange?.[0] || undefined,
          date_to: appliedFilters.dateRange?.[1] || undefined,
          sort_by: serializedSorts.sortBy,
          sort_dir: serializedSorts.sortDir,
          page,
          limit: pageSize,
        });
        if (requestSeq.current !== requestId) return;
        setPayload(data);
      } catch (err) {
        if (requestSeq.current !== requestId) return;
        setError(getLocalizedApiError(err, t, 'orders.loadFailed'));
      } finally {
        if (requestSeq.current === requestId) {
          setLoading(false);
        }
      }
    }

    load();
  }, [appliedFilters, page, pageSize, serializedSorts.sortBy, serializedSorts.sortDir, t]);

  function resetFilters() {
    setSearchInput('');
    setAppliedFilters(DEFAULT_ORDER_FILTERS);
    setDraftFilters(DEFAULT_ORDER_FILTERS);
    setPage(1);
  }

  function applyDraftFilters(nextFilters: OrderFilters) {
    setDraftFilters(nextFilters);
    setAppliedFilters((current) => ({
      ...current,
      orderStatus: nextFilters.orderStatus,
      paymentStatus: nextFilters.paymentStatus,
      shippingStatus: nextFilters.shippingStatus,
      minPrice: nextFilters.minPrice,
      maxPrice: nextFilters.maxPrice,
    }));
    setPage(1);
    setDrawerOpen(false);
  }

  function updateAppliedAndDraft(updater: (filters: OrderFilters) => OrderFilters) {
    setAppliedFilters((current) => updater(current));
    setDraftFilters((current) => updater(current));
    setPage(1);
  }

  function handleTableSort(sorts: OrderFilters['sorts']) {
    updateAppliedAndDraft((current) => ({
      ...current,
      sorts,
    }));
  }

  return (
    <PageShell scrollable={false}>
      <OrdersToolbar
        activeFilterCount={activeAdvancedFilterCount}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={(from) => {
          updateAppliedAndDraft((current) => ({
            ...current,
            dateRange: toDateRange(from, current.dateRange?.[1] ?? ''),
          }));
        }}
        onDateToChange={(to) => {
          updateAppliedAndDraft((current) => ({
            ...current,
            dateRange: toDateRange(current.dateRange?.[0] ?? '', to),
          }));
        }}
        onOpenFilters={() => setDrawerOpen(true)}
        onReset={resetFilters}
        onSearchChange={setSearchInput}
        searchValue={searchInput}
        showReset={showReset}
        title={t('sidebar.orders')}
        total={payload?.meta.total ?? 0}
      />

      <Table containerClassName='min-h-0' minWidth='1040px'>
        <TableHeader>
          <tr>
            <SortableTableHead
              sortKey='orderCode'
              defaultSorts={DEFAULT_TABLE_SORTS}
              sorts={appliedFilters.sorts}
              defaultDirection='asc'
              onSortChange={handleTableSort}
              className='w-[170px] min-w-[170px] max-w-[170px] text-left'
            >
              {t('orders.code')}
            </SortableTableHead>
            <SortableTableHead
              sortKey='customerName'
              defaultSorts={DEFAULT_TABLE_SORTS}
              sorts={appliedFilters.sorts}
              defaultDirection='asc'
              onSortChange={handleTableSort}
              className='min-w-[240px] text-left'
            >
              {t('orders.customer')}
            </SortableTableHead>
            <SortableTableHead
              sortKey='totalAmount'
              defaultSorts={DEFAULT_TABLE_SORTS}
              sorts={appliedFilters.sorts}
              defaultDirection='desc'
              onSortChange={handleTableSort}
              className='w-[130px] min-w-[130px] max-w-[130px] text-right'
            >
              {t('orders.amount')}
            </SortableTableHead>
            <SortableTableHead
              sortKey='orderStatus'
              defaultSorts={DEFAULT_TABLE_SORTS}
              sorts={appliedFilters.sorts}
              defaultDirection='asc'
              onSortChange={handleTableSort}
              className='w-[135px] min-w-[135px] max-w-[135px] text-center'
            >
              {t('orders.orderStatus')}
            </SortableTableHead>
            <SortableTableHead
              sortKey='paymentStatus'
              defaultSorts={DEFAULT_TABLE_SORTS}
              sorts={appliedFilters.sorts}
              defaultDirection='asc'
              onSortChange={handleTableSort}
              className='w-[145px] min-w-[145px] max-w-[145px] text-center'
            >
              {t('orders.paymentStatus')}
            </SortableTableHead>
            <SortableTableHead
              sortKey='shippingStatus'
              defaultSorts={DEFAULT_TABLE_SORTS}
              sorts={appliedFilters.sorts}
              defaultDirection='asc'
              onSortChange={handleTableSort}
              className='w-[145px] min-w-[145px] max-w-[145px] text-center'
            >
              {t('orders.shippingStatus')}
            </SortableTableHead>
            <TableHead className='w-[110px] min-w-[110px] max-w-[110px] px-2 text-center'>{t('orders.action')}</TableHead>
          </tr>
        </TableHeader>

        <TableBody>
          {loading && !payload ? (
            <TableEmptyState colSpan={7} variant='loading'>{t('common.loading')}</TableEmptyState>
          ) : error ? (
            <TableEmptyState colSpan={7} variant='error'>
              {error}
            </TableEmptyState>
          ) : payload && payload.data.length > 0 ? (
            payload.data.map((order) => (
              <TableRow key={order.id} hoverable>
                <TableCell className='w-[170px] min-w-[170px] max-w-[170px] whitespace-nowrap font-mono text-[13px] font-semibold text-slate-800'>
                  {order.orderCode}
                </TableCell>
                <TableCell className='min-w-[240px]'>
                  <span title={order.customerName} className='block truncate font-semibold text-slate-900'>
                    {order.customerName}
                  </span>
                  <span
                    title={order.email ? `${order.phone} | ${order.email}` : order.phone}
                    className='mt-1 block truncate font-medium tabular-nums text-slate-600'
                  >
                    {order.phone}
                  </span>
                  {order.email ? (
                    <span title={order.email} className='mt-0.5 block truncate text-[12px] font-medium text-slate-500'>
                      {order.email}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className='w-[130px] min-w-[130px] max-w-[130px] whitespace-nowrap text-right font-medium text-slate-800'>
                  {formatVnd(order.totalAmount, locale)}
                </TableCell>
                <TableCell className='w-[135px] min-w-[135px] max-w-[135px] text-center'>
                  <StatusBadge value={order.orderStatus} t={t} />
                </TableCell>
                <TableCell className='w-[145px] min-w-[145px] max-w-[145px] text-center'>
                  <StatusBadge value={order.paymentStatus} t={t} />
                </TableCell>
                <TableCell className='w-[145px] min-w-[145px] max-w-[145px] text-center'>
                  <StatusBadge value={order.shippingStatus} t={t} />
                </TableCell>
                <TableCell className='w-[110px] min-w-[110px] max-w-[110px] px-2 text-center'>
                  <TableActions>
                    <Tooltip content={t('orders.detail')}>
                      <Link
                        href={`/orders/${order.id}`}
                        aria-label={t('orders.detail')}
                        className={tableActionButtonClass('view')}
                      >
                        <EyeIcon />
                      </Link>
                    </Tooltip>
                  </TableActions>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableEmptyState colSpan={7}>{t('orders.noOrdersFound')}</TableEmptyState>
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={payload?.meta.page ?? page}
        totalPages={payload?.meta.totalPages ?? payload?.meta.total_pages ?? 1}
        total={payload?.meta.total ?? 0}
        itemLabel={getOrderItemLabel(locale)}
        pageLabel={t('orders.page')}
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

      <OrdersFilterDrawer
        draftFilters={draftFilters}
        getStatusLabel={statusLabel}
        onApply={applyDraftFilters}
        onClose={() => setDrawerOpen(false)}
        onDraftChange={setDraftFilters}
        open={drawerOpen}
      />
    </PageShell>
  );
}
