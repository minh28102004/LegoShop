'use client';

import { useEffect, useState } from 'react';
import { getDashboardStats, listOrders } from '@/lib/admin-api';
import type { DashboardStats, PaginatedOrders } from '@/types/admin';

const CURRENCY = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function fallbackStats(orders: PaginatedOrders): DashboardStats {
  const totalRevenue = orders.data.reduce((sum, order) => sum + order.totalAmount, 0);
  const customers = new Set(orders.data.map((order) => order.phone)).size;
  const pendingOrders = orders.data.filter((order) => order.orderStatus === 'pending').length;
  const paidOrders = orders.data.filter((order) => order.paymentStatus === 'paid').length;
  const processingOrders = orders.data.filter((order) =>
    ['confirmed', 'processing', 'shipping'].includes(order.orderStatus),
  ).length;

  return {
    totalOrders: orders.meta.total,
    totalRevenue,
    totalCustomers: customers,
    pendingOrders,
    paidOrders,
    processingOrders,
    recentOrders: orders.data.slice(0, 5).map((order) => ({
      id: order.id,
      orderCode: order.orderCode,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
    })),
    topProducts: [],
  };
}

export default function DashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch {
        try {
          const orders = await listOrders({ page: 1, limit: 20 });
          setStats(fallbackStats(orders));
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <div className='rounded-2xl border border-stone-300/70 bg-white/90 p-6'>Loading dashboard...</div>;
  }

  if (error || !stats) {
    return (
      <div className='rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700'>
        {error ?? 'Unable to load dashboard'}
      </div>
    );
  }

  const cards = [
    { label: 'Total Orders', value: stats.totalOrders },
    { label: 'Total Revenue', value: CURRENCY.format(stats.totalRevenue) },
    { label: 'Total Customers', value: stats.totalCustomers },
    { label: 'Pending Orders', value: stats.pendingOrders },
    { label: 'Paid Orders', value: stats.paidOrders },
    { label: 'Need Processing', value: stats.processingOrders },
  ];

  return (
    <div className='space-y-5'>
      <section className='grid gap-4 md:grid-cols-3'>
        {cards.map((card) => (
          <article key={card.label} className='rounded-2xl border border-stone-300/70 bg-white/90 p-4 shadow-sm'>
            <p className='text-sm text-stone-600'>{card.label}</p>
            <p className='mt-2 text-2xl font-semibold text-stone-900'>{card.value}</p>
          </article>
        ))}
      </section>

      <section className='rounded-2xl border border-stone-300/70 bg-white/90 p-5 shadow-sm'>
        <h2 className='text-lg font-semibold'>Recent Orders</h2>
        <div className='mt-4 overflow-x-auto'>
          <table className='w-full min-w-[700px] text-sm'>
            <thead className='bg-stone-100 text-left text-stone-600'>
              <tr>
                <th className='px-3 py-2'>Order Code</th>
                <th className='px-3 py-2'>Customer</th>
                <th className='px-3 py-2'>Amount</th>
                <th className='px-3 py-2'>Order Status</th>
                <th className='px-3 py-2'>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className='px-3 py-6 text-center text-stone-500'>
                    No recent orders
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className='border-t border-stone-200'>
                    <td className='px-3 py-2'>{order.orderCode}</td>
                    <td className='px-3 py-2'>{order.customerName}</td>
                    <td className='px-3 py-2'>{CURRENCY.format(order.totalAmount)}</td>
                    <td className='px-3 py-2'>{order.orderStatus}</td>
                    <td className='px-3 py-2'>{order.paymentStatus}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
