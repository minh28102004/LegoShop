'use client';

import { useEffect, useState } from 'react';
import {
  getOrderById,
  updateOrderPaymentStatus,
  updateOrderShippingStatus,
  updateOrderStatus,
} from '@/lib/admin-api';
import type { Order, OrderStatus, PaymentStatus, ShippingStatus } from '@/types/admin';

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
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [orderId]);

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
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className='rounded-2xl border border-stone-300/70 bg-white/90 p-5'>Loading order...</div>;
  }

  if (error || !order) {
    return (
      <div className='rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700'>
        {error ?? 'Order not found'}
      </div>
    );
  }

  return (
    <div className='space-y-5'>
      <section className='rounded-2xl border border-stone-300/70 bg-white/90 p-5 shadow-sm'>
        <h2 className='text-lg font-semibold'>Order {order.orderCode}</h2>
        <div className='mt-4 grid gap-3 text-sm md:grid-cols-2'>
          <p>
            <span className='text-stone-600'>Customer:</span> {order.customerName}
          </p>
          <p>
            <span className='text-stone-600'>Phone:</span> {order.phone}
          </p>
          <p>
            <span className='text-stone-600'>Email:</span> {order.email || '-'}
          </p>
          <p>
            <span className='text-stone-600'>Address:</span> {order.address}
          </p>
          <p>
            <span className='text-stone-600'>Payment Method:</span> {order.paymentMethod}
          </p>
          <p>
            <span className='text-stone-600'>Total:</span> {CURRENCY.format(order.totalAmount)}
          </p>
          <p>
            <span className='text-stone-600'>Deposit:</span> {CURRENCY.format(order.depositAmount)}
          </p>
          <p>
            <span className='text-stone-600'>Remaining:</span> {CURRENCY.format(order.remainingAmount)}
          </p>
        </div>
      </section>

      <section className='rounded-2xl border border-stone-300/70 bg-white/90 p-5 shadow-sm'>
        <h3 className='text-base font-semibold'>Status Controls</h3>
        <div className='mt-4 grid gap-3 md:grid-cols-3'>
          <label className='block text-sm'>
            <span className='mb-1 block text-stone-700'>Order Status</span>
            <select
              value={order.orderStatus}
              disabled={saving}
              onChange={(e) => updateStatus('order', e.target.value as OrderStatus)}
              className='w-full rounded-xl border border-stone-300 bg-white px-3 py-2'
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className='block text-sm'>
            <span className='mb-1 block text-stone-700'>Payment Status</span>
            <select
              value={order.paymentStatus}
              disabled={saving}
              onChange={(e) => updateStatus('payment', e.target.value as PaymentStatus)}
              className='w-full rounded-xl border border-stone-300 bg-white px-3 py-2'
            >
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className='block text-sm'>
            <span className='mb-1 block text-stone-700'>Shipping Status</span>
            <select
              value={order.shippingStatus}
              disabled={saving}
              onChange={(e) => updateStatus('shipping', e.target.value as ShippingStatus)}
              className='w-full rounded-xl border border-stone-300 bg-white px-3 py-2'
            >
              {SHIPPING_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className='rounded-2xl border border-stone-300/70 bg-white/90 p-5 shadow-sm'>
        <h3 className='text-base font-semibold'>Items</h3>
        <div className='mt-3 overflow-x-auto'>
          <table className='w-full min-w-[700px] text-sm'>
            <thead className='bg-stone-100 text-left text-stone-600'>
              <tr>
                <th className='px-3 py-2'>Product</th>
                <th className='px-3 py-2'>Qty</th>
                <th className='px-3 py-2'>Price</th>
                <th className='px-3 py-2'>Preview</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className='border-t border-stone-200'>
                  <td className='px-3 py-2'>{item.productName}</td>
                  <td className='px-3 py-2'>{item.quantity}</td>
                  <td className='px-3 py-2'>{CURRENCY.format(item.price)}</td>
                  <td className='px-3 py-2'>
                    {item.previewUrl ? (
                      <a href={item.previewUrl} target='_blank' className='text-blue-700 underline' rel='noreferrer'>
                        Open
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {order.payments && order.payments.length > 0 ? (
        <section className='rounded-2xl border border-stone-300/70 bg-white/90 p-5 shadow-sm'>
          <h3 className='text-base font-semibold'>Payment Logs</h3>
          <div className='mt-3 overflow-x-auto'>
            <table className='w-full min-w-[700px] text-sm'>
              <thead className='bg-stone-100 text-left text-stone-600'>
                <tr>
                  <th className='px-3 py-2'>Provider</th>
                  <th className='px-3 py-2'>Type</th>
                  <th className='px-3 py-2'>Amount</th>
                  <th className='px-3 py-2'>Status</th>
                </tr>
              </thead>
              <tbody>
                {order.payments.map((payment) => (
                  <tr key={payment.id} className='border-t border-stone-200'>
                    <td className='px-3 py-2'>{payment.provider}</td>
                    <td className='px-3 py-2'>{payment.type}</td>
                    <td className='px-3 py-2'>{CURRENCY.format(payment.amount)}</td>
                    <td className='px-3 py-2'>{payment.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {error ? (
        <div className='rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700'>{error}</div>
      ) : null}
    </div>
  );
}
