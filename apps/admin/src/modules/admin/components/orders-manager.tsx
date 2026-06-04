'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Badge, { getStatusBadgeLabel, StatusBadge } from '@/common/components/ui/Badge';
import Card from '@/common/components/ui/Card';
import Input from '@/common/components/ui/Input';
import PageShell from '@/common/components/ui/PageShell';
import Select from '@/common/components/ui/Select';
import SectionHeader from '@/common/components/ui/SectionHeader';
import Tooltip from '@/common/components/ui/Tooltip';
import Table, {
  TableActions,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TablePagination,
  TableRow,
  tableActionButtonClass,
} from '@/common/components/ui/Table';
import { listOrders } from '@/modules/admin/services/adminApi';
import { useI18n } from '@/lib/i18n/useI18n';
import type { OrderStatus, PaginatedOrders, PaymentStatus, ShippingStatus } from '@/modules/admin/types/admin.types';

const ORDER_STATUSES: Array<OrderStatus | ''> = [
  '',
  'pending',
  'confirmed',
  'processing',
  'shipping',
  'completed',
  'cancelled',
];

const PAYMENT_STATUSES: Array<PaymentStatus | ''> = [
  '',
  'unpaid',
  'pending',
  'deposit_pending',
  'deposit_paid',
  'paid',
  'failed',
  'cancelled',
  'refunded',
];

const SHIPPING_STATUSES: Array<ShippingStatus | ''> = [
  '',
  'pending',
  'preparing',
  'shipping',
  'delivered',
  'cancelled',
];

const CURRENCY = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

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

export default function OrdersManager() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState<OrderStatus | ''>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>('');
  const [shippingStatus, setShippingStatus] = useState<ShippingStatus | ''>('');
  const [page, setPage] = useState(1);
  const [payload, setPayload] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function statusLabel(value: string) {
    return getStatusBadgeLabel(value, t);
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await listOrders({
          search,
          orderStatus,
          paymentStatus,
          shippingStatus,
          page,
          limit: 20,
        });
        setPayload(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('orders.loadFailed'));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [search, orderStatus, paymentStatus, shippingStatus, page, t]);

  return (
    <PageShell>
      <Card className='p-5 sm:p-6'>
        <SectionHeader
          eyebrow={t('common.filter')}
          title={t('sidebar.orders')}
          description={t('sidebarDesc.orders')}
          badge={
            <Badge tone='info' className='rounded-full px-4 py-2 text-sm font-medium'>
              {payload?.meta.total ?? 0} {t('common.total')}
            </Badge>
          }
        />

        <div className='mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(280px,1.55fr)_repeat(3,minmax(180px,1fr))]'>
          <Input
            value={search}
            aria-label={t('orders.searchPlaceholder')}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder={t('orders.searchPlaceholder')}
            className='sm:col-span-2 xl:col-span-1'
          />

          <Select
            value={orderStatus}
            aria-label={t('orders.allOrderStatuses')}
            onChange={(e) => {
              setPage(1);
              setOrderStatus(e.target.value as OrderStatus | '');
            }}
          >
            {ORDER_STATUSES.map((item) => (
              <option key={item || 'all'} value={item}>
                {item ? statusLabel(item) : t('orders.allOrderStatuses')}
              </option>
            ))}
          </Select>

          <Select
            value={paymentStatus}
            aria-label={t('orders.allPaymentStatuses')}
            onChange={(e) => {
              setPage(1);
              setPaymentStatus(e.target.value as PaymentStatus | '');
            }}
          >
            {PAYMENT_STATUSES.map((item) => (
              <option key={item || 'all'} value={item}>
                {item ? statusLabel(item) : t('orders.allPaymentStatuses')}
              </option>
            ))}
          </Select>

          <Select
            value={shippingStatus}
            aria-label={t('orders.allShippingStatuses')}
            onChange={(e) => {
              setPage(1);
              setShippingStatus(e.target.value as ShippingStatus | '');
            }}
          >
            {SHIPPING_STATUSES.map((item) => (
              <option key={item || 'all'} value={item}>
                {item ? statusLabel(item) : t('orders.allShippingStatuses')}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Table className='min-w-[980px]'>
        <TableHeader>
          <tr>
            <TableHead>{t('orders.code')}</TableHead>
            <TableHead>{t('orders.customer')}</TableHead>
            <TableHead>{t('orders.phone')}</TableHead>
            <TableHead className='text-right'>{t('orders.amount')}</TableHead>
            <TableHead className='text-center'>{t('orders.orderStatus')}</TableHead>
            <TableHead className='text-center'>{t('orders.paymentStatus')}</TableHead>
            <TableHead className='text-center'>{t('orders.shippingStatus')}</TableHead>
            <TableHead className='text-right'>{t('orders.action')}</TableHead>
          </tr>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableEmptyState colSpan={8}>{t('common.loading')}</TableEmptyState>
          ) : error ? (
            <TableEmptyState colSpan={8} className='text-red-700'>
              {error}
            </TableEmptyState>
          ) : payload && payload.data.length > 0 ? (
            payload.data.map((order) => (
              <TableRow key={order.id} hoverable>
                <TableCell className='font-mono text-[13px] font-semibold text-slate-800'>
                  {order.orderCode}
                </TableCell>
                <TableCell>
                  <span className='block max-w-[180px] truncate font-semibold text-slate-900'>
                    {order.customerName}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    title={order.email ? `${order.phone} | ${order.email}` : order.phone}
                    className='block max-w-[220px] truncate font-medium tabular-nums text-slate-700'
                  >
                    {order.phone}
                  </span>
                  {order.email ? (
                    <span title={order.email} className='mt-1 block max-w-[220px] truncate text-[13px] font-medium text-slate-500'>
                      {order.email}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className='text-right font-medium text-slate-800'>
                  {CURRENCY.format(order.totalAmount)}
                </TableCell>
                <TableCell className='text-center'>
                  <StatusBadge value={order.orderStatus} t={t} />
                </TableCell>
                <TableCell className='text-center'>
                  <StatusBadge value={order.paymentStatus} t={t} />
                </TableCell>
                <TableCell className='text-center'>
                  <StatusBadge value={order.shippingStatus} t={t} />
                </TableCell>
                <TableCell className='text-right'>
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
            <TableEmptyState colSpan={8}>{t('orders.noOrdersFound')}</TableEmptyState>
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={payload?.meta.page ?? page}
        totalPages={payload?.meta.totalPages ?? 1}
        total={payload?.meta.total ?? 0}
        pageLabel={t('orders.page')}
        totalLabel={t('common.total')}
        previousLabel={t('common.previous')}
        nextLabel={t('common.next')}
        previousDisabled={page <= 1}
        nextDisabled={page >= (payload?.meta.totalPages ?? 1)}
        onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
        onNext={() => setPage((prev) => prev + 1)}
      />
    </PageShell>
  );
}

