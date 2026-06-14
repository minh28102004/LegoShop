'use client';

import { useCallback, useEffect, useState } from 'react';
import Card from '@/common/components/ui/Card';
import LoadingState from '@/common/components/ui/LoadingState';
import PageShell from '@/common/components/ui/PageShell';
import SectionHeader from '@/common/components/ui/SectionHeader';
import Select from '@/common/components/ui/Select';
import Table, {
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableRow,
} from '@/common/components/ui/Table';
import { getStatusBadgeLabel, StatusBadge } from '@/common/components/ui/Badge';
import {
  getOrderById,
  updateOrderPaymentStatus,
  updateOrderShippingStatus,
  updateOrderStatus,
} from '@/modules/admin/services/adminApi';
import { useI18n } from '@/lib/i18n/useI18n';
import AdminNavIcon from '@/modules/admin/components/AdminNavIcon';
import type { Order, OrderStatus, PaymentStatus, ShippingStatus } from '@/modules/admin/types/admin.types';
import DesignPreviewModal from './design-preview-modal';

type Props = {
  orderId: string;
};

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipping',
  'completed',
  'cancelled',
];
const PAYMENT_STATUSES: PaymentStatus[] = [
  'unpaid',
  'pending',
  'deposit_pending',
  'deposit_paid',
  'paid',
  'failed',
  'cancelled',
  'refunded',
];
const SHIPPING_STATUSES: ShippingStatus[] = [
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

export default function OrderDetail({ orderId }: Props) {
  const { t, locale } = useI18n();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewItem, setPreviewItem] = useState<{designData: any, productName: string} | null>(null);

  function statusLabel(value: string) {
    return getStatusBadgeLabel(value, t);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('orderDetail.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [orderId, t]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [load]);

  async function updateStatus(
    kind: 'order' | 'payment' | 'shipping',
    value: OrderStatus | PaymentStatus | ShippingStatus,
  ) {
    if (!order) return;
    setSaving(true);
    setError(null);

    try {
      if (kind === 'order') {
        await updateOrderStatus(order.id, value as OrderStatus);
      }
      if (kind === 'payment') {
        await updateOrderPaymentStatus(order.id, value as PaymentStatus);
      }
      if (kind === 'shipping') {
        await updateOrderShippingStatus(order.id, value as ShippingStatus);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('orderDetail.updateFailed'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingState text={t('orderDetail.loading')} />;
  }

  if (error || !order) {
    return (
      <Card className='border-red-200 bg-red-50 p-5 text-red-700'>
        {error ?? t('orderDetail.notFound')}
      </Card>
    );
  }

  return (
    <PageShell>
      <Card className='p-5 sm:p-6'>
        <SectionHeader
          icon={<AdminNavIcon name='orders' className='h-6 w-6' />}
          title={order.orderCode}
          description={order.customerName}
          actions={
            <>
              <StatusBadge value={order.orderStatus} t={t} />
              <StatusBadge value={order.paymentStatus} t={t} />
              <StatusBadge value={order.shippingStatus} t={t} />
            </>
          }
        />

        <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              {t('orderDetail.customer')}
            </p>
            <p className='mt-2 text-sm font-medium text-slate-900'>{order.customerName}</p>
          </div>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              {t('orderDetail.phone')}
            </p>
            <p className='mt-2 text-sm font-medium tabular-nums text-slate-900'>{order.phone}</p>
          </div>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              {t('orderDetail.email')}
            </p>
            <p className='mt-2 truncate text-sm font-medium text-slate-900'>{order.email || '-'}</p>
          </div>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              {t('orderDetail.paymentMethod')}
            </p>
            <p className='mt-2 text-sm font-medium text-slate-900'>{order.paymentMethod}</p>
          </div>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4 md:col-span-2'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              {t('orderDetail.address')}
            </p>
            <p className='mt-2 text-sm font-medium leading-6 text-slate-900'>{order.address}</p>
          </div>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              {t('orderDetail.total')}
            </p>
            <p className='mt-2 text-base font-bold tabular-nums text-slate-900'>
              {CURRENCY.format(order.totalAmount)}
            </p>
          </div>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              {t('orderDetail.remaining')}
            </p>
            <p className='mt-2 text-base font-bold tabular-nums text-slate-900'>
              {CURRENCY.format(order.remainingAmount)}
            </p>
            <p className='mt-1 text-xs text-slate-500'>
              {t('orderDetail.deposit')}: {CURRENCY.format(order.depositAmount)}
            </p>
          </div>
        </div>
      </Card>

      <Card className='p-5 sm:p-6'>
        <SectionHeader
          title={t('orderDetail.statusControls')}
          description={saving ? t('entity.saving') : undefined}
        />

        <div className='mt-5 grid gap-4 lg:grid-cols-3'>
          <label className='space-y-2'>
            <span className='admin-label'>{t('orderDetail.orderStatus')}</span>
            <Select
              value={order.orderStatus}
              disabled={saving}
              aria-label={t('orderDetail.orderStatus')}
              onChange={(e) => updateStatus('order', e.target.value as OrderStatus)}
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </Select>
          </label>

          <label className='space-y-2'>
            <span className='admin-label'>{t('orderDetail.paymentStatus')}</span>
            <Select
              value={order.paymentStatus}
              disabled={saving}
              aria-label={t('orderDetail.paymentStatus')}
              onChange={(e) => updateStatus('payment', e.target.value as PaymentStatus)}
            >
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </Select>
          </label>

          <label className='space-y-2'>
            <span className='admin-label'>{t('orderDetail.shippingStatus')}</span>
            <Select
              value={order.shippingStatus}
              disabled={saving}
              aria-label={t('orderDetail.shippingStatus')}
              onChange={(e) => updateStatus('shipping', e.target.value as ShippingStatus)}
            >
              {SHIPPING_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </Select>
          </label>
        </div>
      </Card>

      <Card className='p-5 sm:p-6'>
        <SectionHeader title={t('orderDetail.items')} />
        <div className='mt-4'>
          <Table className='min-w-[760px]'>
            <TableHeader>
              <tr>
                <TableHead>{t('orderDetail.product')}</TableHead>
                <TableHead className='text-center'>{t('orderDetail.qty')}</TableHead>
                <TableHead className='text-right'>{t('orderDetail.price')}</TableHead>
                <TableHead className='text-center'>{t('orderDetail.preview')}</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {order.items.length === 0 ? (
                <TableEmptyState colSpan={4}>
                  {locale === 'vi' ? 'Không có sản phẩm nào.' : 'No products found.'}
                </TableEmptyState>
              ) : (
                order.items.map((item) => (
                  <TableRow key={item.id} hoverable>
                    <TableCell className='font-medium text-slate-800'>
                      <span className='block max-w-[320px] truncate'>{item.productName}</span>
                    </TableCell>
                    <TableCell className='text-center'>{item.quantity}</TableCell>
                    <TableCell className='text-right font-medium text-slate-800'>
                      {CURRENCY.format(item.price)}
                    </TableCell>
                    <TableCell className='text-center'>
                      {item.previewUrl ? (
                        <a
                          href={item.previewUrl}
                          target='_blank'
                          className='text-sm font-medium text-[var(--admin-primary-strong)] underline underline-offset-4'
                          rel='noreferrer'
                        >
                          {t('orderDetail.open')}
                        </a>
                      ) : item.designData ? (
                        <button
                          onClick={() => setPreviewItem({ designData: item.designData, productName: item.productName })}
                          className='text-sm font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-4 cursor-pointer'
                        >
                          Xem thiết kế
                        </button>
                      ) : (
                        <span className='text-slate-400'>-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {order.payments && order.payments.length > 0 ? (
        <Card className='p-5 sm:p-6'>
          <SectionHeader title={t('orderDetail.paymentLogs')} />
          <div className='mt-4'>
            <Table className='min-w-[760px]'>
              <TableHeader>
                <tr>
                  <TableHead>{t('orderDetail.provider')}</TableHead>
                  <TableHead>{t('orderDetail.type')}</TableHead>
                  <TableHead className='text-right'>{t('orders.amount')}</TableHead>
                  <TableHead className='text-center'>{t('common.status')}</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {order.payments.map((payment) => (
                  <TableRow key={payment.id} hoverable>
                    <TableCell className='font-medium text-slate-800'>{payment.provider}</TableCell>
                    <TableCell>{payment.type}</TableCell>
                    <TableCell className='text-right font-medium text-slate-800'>
                      {CURRENCY.format(payment.amount)}
                    </TableCell>
                    <TableCell className='text-center'>
                      <StatusBadge value={payment.status} t={t} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : null}

      {error ? <Card className='border-red-200 bg-red-50 p-4 text-red-700'>{error}</Card> : null}

      <DesignPreviewModal 
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        designData={previewItem?.designData}
        productName={previewItem?.productName || ''}
      />
    </PageShell>
  );
}

