'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listOrders } from '@/lib/admin-api';
import type { OrderStatus, PaginatedOrders, PaymentStatus, ShippingStatus } from '@/types/admin';

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

export default function OrdersManager() {
  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState<OrderStatus | ''>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>('');
  const [shippingStatus, setShippingStatus] = useState<ShippingStatus | ''>('');
  const [page, setPage] = useState(1);
  const [payload, setPayload] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [search, orderStatus, paymentStatus, shippingStatus, page]);

  return (
    <div className='space-y-4'>
      <section className='rounded-2xl border border-stone-300/70 bg-white/90 p-4 shadow-sm'>
        <div className='grid gap-3 md:grid-cols-4'>
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder='Search code, customer, phone, email'
            className='rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-500 md:col-span-2'
          />

          <select
            value={orderStatus}
            onChange={(e) => {
              setPage(1);
              setOrderStatus(e.target.value as OrderStatus | '');
            }}
            className='rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500'
          >
            {ORDER_STATUSES.map((item) => (
              <option key={item || 'all'} value={item}>
                {item || 'All order statuses'}
              </option>
            ))}
          </select>

          <select
            value={paymentStatus}
            onChange={(e) => {
              setPage(1);
              setPaymentStatus(e.target.value as PaymentStatus | '');
            }}
            className='rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500'
          >
            {PAYMENT_STATUSES.map((item) => (
              <option key={item || 'all'} value={item}>
                {item || 'All payment statuses'}
              </option>
            ))}
          </select>

          <select
            value={shippingStatus}
            onChange={(e) => {
              setPage(1);
              setShippingStatus(e.target.value as ShippingStatus | '');
            }}
            className='rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500'
          >
            {SHIPPING_STATUSES.map((item) => (
              <option key={item || 'all'} value={item}>
                {item || 'All shipping statuses'}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className='overflow-hidden rounded-2xl border border-stone-300/70 bg-white/90 shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[980px] text-sm'>
            <thead className='bg-stone-100 text-left text-stone-600'>
              <tr>
                <th className='px-3 py-2'>Code</th>
                <th className='px-3 py-2'>Customer</th>
                <th className='px-3 py-2'>Phone</th>
                <th className='px-3 py-2'>Amount</th>
                <th className='px-3 py-2'>Order Status</th>
                <th className='px-3 py-2'>Payment Status</th>
                <th className='px-3 py-2'>Shipping Status</th>
                <th className='px-3 py-2'>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className='px-3 py-8 text-center text-stone-500'>
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className='px-3 py-8 text-center text-red-700'>
                    {error}
                  </td>
                </tr>
              ) : payload && payload.data.length > 0 ? (
                payload.data.map((order) => (
                  <tr key={order.id} className='border-t border-stone-200'>
                    <td className='px-3 py-2'>{order.orderCode}</td>
                    <td className='px-3 py-2'>{order.customerName}</td>
                    <td className='px-3 py-2'>{order.phone}</td>
                    <td className='px-3 py-2'>{CURRENCY.format(order.totalAmount)}</td>
                    <td className='px-3 py-2'>{order.orderStatus}</td>
                    <td className='px-3 py-2'>{order.paymentStatus}</td>
                    <td className='px-3 py-2'>{order.shippingStatus}</td>
                    <td className='px-3 py-2'>
                      <Link
                        href={`/orders/${order.id}`}
                        className='rounded-md border border-stone-300 bg-white px-2 py-1 text-xs font-medium hover:bg-stone-100'
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className='px-3 py-8 text-center text-stone-500'>
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className='flex items-center justify-between rounded-2xl border border-stone-300/70 bg-white/90 p-4 text-sm shadow-sm'>
        <p>
          Page {payload?.meta.page ?? page} / {payload?.meta.totalPages ?? 1}
          {' • '}
          Total: {payload?.meta.total ?? 0}
        </p>
        <div className='flex gap-2'>
          <button
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className='rounded-lg border border-stone-300 bg-white px-3 py-1.5 disabled:opacity-50'
          >
            Previous
          </button>
          <button
            disabled={page >= (payload?.meta.totalPages ?? 1)}
            onClick={() => setPage((prev) => prev + 1)}
            className='rounded-lg border border-stone-300 bg-white px-3 py-1.5 disabled:opacity-50'
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}
