'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { getStatusBadgeLabel, StatusBadge } from '@/common/components/ui/Badge';
import Card from '@/common/components/ui/Card';
import LoadingState from '@/common/components/ui/LoadingState';
import SectionHeader from '@/common/components/ui/SectionHeader';
import Table, {
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableRow,
} from '@/common/components/ui/Table';
import AdminNavIcon from '@/modules/admin/components/AdminNavIcon';
import AdminPageHeader from '@/modules/admin/components/AdminPageHeader';
import StatCard from '@/modules/admin/components/StatCard';
import { getDashboardStats, listOrders } from '@/modules/admin/services/adminApi';
import type {
  DashboardStats as DashboardStatsPayload,
  PaginatedOrders,
} from '@/modules/admin/types/admin.types';
import { useI18n } from '@/lib/i18n/useI18n';

const CURRENCY = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

type RecentOrder = DashboardStatsPayload['recentOrders'][number];
type RevenuePoint = {
  key: string;
  label: string;
  value: number;
};
type StatusPoint = {
  key: string;
  label: string;
  count: number;
  palette: StatusPalette;
};
type StatusPalette = {
  bar: string;
  dot: string;
  track: string;
  text: string;
};

const STATUS_PALETTE: Record<string, StatusPalette> = {
  pending: {
    bar: 'bg-amber-500',
    dot: 'bg-amber-500',
    track: 'bg-amber-50',
    text: 'text-amber-700',
  },
  confirmed: {
    bar: 'bg-[var(--admin-primary)]',
    dot: 'bg-[var(--admin-primary)]',
    track: 'bg-[var(--admin-primary-soft)]',
    text: 'text-[var(--admin-primary-strong)]',
  },
  processing: {
    bar: 'bg-[var(--admin-primary)]',
    dot: 'bg-[var(--admin-primary)]',
    track: 'bg-[var(--admin-primary-soft)]',
    text: 'text-[var(--admin-primary-strong)]',
  },
  shipping: {
    bar: 'bg-[var(--admin-primary)]',
    dot: 'bg-[var(--admin-primary)]',
    track: 'bg-[var(--admin-primary-soft)]',
    text: 'text-[var(--admin-primary-strong)]',
  },
  completed: {
    bar: 'bg-green-600',
    dot: 'bg-green-600',
    track: 'bg-green-50',
    text: 'text-green-700',
  },
  cancelled: {
    bar: 'bg-red-600',
    dot: 'bg-red-600',
    track: 'bg-red-50',
    text: 'text-red-700',
  },
  failed: {
    bar: 'bg-red-600',
    dot: 'bg-red-600',
    track: 'bg-red-50',
    text: 'text-red-700',
  },
  default: {
    bar: 'bg-slate-500',
    dot: 'bg-slate-500',
    track: 'bg-slate-100',
    text: 'text-slate-700',
  },
};

function formatCurrencyVND(value: number) {
  return CURRENCY.format(Number.isFinite(value) ? value : 0);
}

function formatCompactCurrency(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '0';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} tr`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return `${value}`;
}

function toRecentOrders(orders?: RecentOrder[] | null) {
  return Array.isArray(orders) ? orders : [];
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateLabel(dateKey: string) {
  const [, month, day] = dateKey.split('-');
  return `${day}/${month}`;
}

function groupRevenueByDate(orders?: RecentOrder[] | null): RevenuePoint[] {
  const revenueByDate = new Map<string, number>();

  toRecentOrders(orders).forEach((order) => {
    if (order.paymentStatus !== 'paid') return;

    const date = parseDate(order.createdAt);
    if (!date) return;

    const key = getDateKey(date);
    revenueByDate.set(key, (revenueByDate.get(key) ?? 0) + (order.totalAmount || 0));
  });

  return Array.from(revenueByDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({
      key,
      label: formatDateLabel(key),
      value,
    }));
}

function getStatusPalette(status: string) {
  return STATUS_PALETTE[status] ?? STATUS_PALETTE.default;
}

function countByStatus(
  orders: RecentOrder[] | null | undefined,
  key: 'orderStatus' | 'paymentStatus',
  t: (key: string) => string,
): StatusPoint[] {
  const counts = new Map<string, number>();

  toRecentOrders(orders).forEach((order) => {
    const status = order[key];
    if (!status) return;
    counts.set(status, (counts.get(status) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([status, count]) => ({
      key: status,
      label: getStatusBadgeLabel(status, t),
      count,
      palette: getStatusPalette(status),
    }));
}

function calculatePaymentRate(stats: DashboardStatsPayload) {
  if (!stats.totalOrders) return 0;
  return Math.min(100, Math.round((stats.paidOrders / stats.totalOrders) * 100));
}

function fallbackStats(orders: PaginatedOrders): DashboardStatsPayload {
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

function ChartEmptyState({ text }: { text: string }) {
  return (
    <div className='grid min-h-[260px] place-items-center rounded-[18px] border border-dashed border-slate-200 bg-slate-50 px-5 text-center'>
      <div className='mx-auto max-w-xs space-y-3'>
        <span className='mx-auto grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-400'>
          <svg viewBox='0 0 24 24' fill='none' className='h-5 w-5' aria-hidden='true'>
            <path
              d='M4.5 18.5H19.5'
              stroke='currentColor'
              strokeWidth='1.7'
              strokeLinecap='round'
            />
            <path
              d='M7.5 15V11'
              stroke='currentColor'
              strokeWidth='1.7'
              strokeLinecap='round'
            />
            <path
              d='M12 15V7'
              stroke='currentColor'
              strokeWidth='1.7'
              strokeLinecap='round'
            />
            <path
              d='M16.5 15V9.5'
              stroke='currentColor'
              strokeWidth='1.7'
              strokeLinecap='round'
            />
          </svg>
        </span>
        <p className='text-sm font-medium leading-6 text-slate-500'>{text}</p>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className='h-full p-0'>
      <div className='border-b border-slate-200 px-5 py-4 sm:px-6'>
        <SectionHeader
          title={title}
          description={description}
          titleClassName='text-[18px]'
          descriptionClassName='mt-1 text-[13px]'
        />
      </div>
      <div className='px-5 py-5 sm:px-6'>{children}</div>
    </Card>
  );
}

function RevenueTrendChart({
  data,
  emptyText,
}: {
  data: RevenuePoint[];
  emptyText: string;
}) {
  if (!data.length) return <ChartEmptyState text={emptyText} />;

  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const chart = {
    width: 640,
    height: 260,
    left: 58,
    right: 18,
    top: 24,
    bottom: 42,
  };
  const innerWidth = chart.width - chart.left - chart.right;
  const innerHeight = chart.height - chart.top - chart.bottom;
  const step = innerWidth / data.length;
  const barWidth = Math.min(42, step * 0.5);

  return (
    <div className='min-h-[260px] rounded-[18px] border border-slate-200 bg-white px-2 py-3'>
      <svg
        viewBox={`0 0 ${chart.width} ${chart.height}`}
        role='img'
        aria-label='Biểu đồ doanh thu theo thời gian'
        className='h-[260px] w-full'
      >
        {[0, 0.5, 1].map((ratio) => {
          const y = chart.top + innerHeight - innerHeight * ratio;
          return (
            <g key={ratio}>
              <line
                x1={chart.left}
                x2={chart.width - chart.right}
                y1={y}
                y2={y}
                stroke='#e2e8f0'
                strokeWidth='1'
              />
              <text
                x={chart.left - 10}
                y={y + 4}
                textAnchor='end'
                className='fill-slate-400 text-[11px] font-medium'
              >
                {formatCompactCurrency(maxValue * ratio)}
              </text>
            </g>
          );
        })}

        {data.map((item, index) => {
          const height = Math.max(4, (item.value / maxValue) * innerHeight);
          const x = chart.left + index * step + (step - barWidth) / 2;
          const y = chart.top + innerHeight - height;

          return (
            <g key={item.key}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={height}
                rx='8'
                fill='var(--admin-primary)'
              >
                <title>{`${item.label}: ${formatCurrencyVND(item.value)}`}</title>
              </rect>
              <text
                x={x + barWidth / 2}
                y={chart.height - 14}
                textAnchor='middle'
                className='fill-slate-500 text-[11px] font-semibold'
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function StatusDistributionChart({
  data,
  emptyText,
}: {
  data: StatusPoint[];
  emptyText: string;
}) {
  if (!data.length) return <ChartEmptyState text={emptyText} />;

  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <div className='space-y-4'>
      {data.map((item) => {
        const width = Math.max(8, Math.round((item.count / maxCount) * 100));

        return (
          <div key={item.key} className='space-y-2'>
            <div className='flex items-center justify-between gap-3 text-sm'>
              <div className='flex min-w-0 items-center gap-2'>
                <span className={['h-2.5 w-2.5 rounded-full', item.palette.dot].join(' ')} />
                <span className='truncate font-semibold text-slate-700'>{item.label}</span>
              </div>
              <span className={['shrink-0 text-sm font-bold', item.palette.text].join(' ')}>
                {item.count}
              </span>
            </div>
            <div className={['h-2.5 overflow-hidden rounded-full', item.palette.track].join(' ')}>
              <div
                className={['h-full rounded-full', item.palette.bar].join(' ')}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PaymentRateCard({
  rate,
  paid,
  total,
  title,
  description,
  countLabel,
}: {
  rate: number;
  paid: number;
  total: number;
  title: string;
  description: string;
  countLabel: string;
}) {
  return (
    <div className='rounded-[18px] border border-green-100 bg-green-50 px-4 py-4'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='text-sm font-semibold text-green-800'>{title}</p>
          <p className='mt-1 text-[13px] leading-5 text-green-700'>{description}</p>
        </div>
        <span className='shrink-0 rounded-full border border-green-200 bg-white px-3 py-1 text-sm font-bold text-green-700'>
          {rate}%
        </span>
      </div>
      <div className='mt-4 h-2.5 overflow-hidden rounded-full bg-white'>
        <div className='h-full rounded-full bg-green-600' style={{ width: `${rate}%` }} />
      </div>
      <p className='mt-3 text-[13px] font-medium text-green-700'>
        {paid}/{Math.max(total, 0)} {countLabel}
      </p>
    </div>
  );
}

export default function DashboardStats() {
  const { t } = useI18n();
  const [stats, setStats] = useState<DashboardStatsPayload | null>(null);
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
          setError(err instanceof Error ? err.message : t('dashboard.loadFailed'));
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [t]);

  if (loading) {
    return <LoadingState text={t('dashboard.loading')} />;
  }

  if (error || !stats) {
    return (
      <Card className='border-red-200 bg-red-50 text-red-700'>
        {error ?? t('dashboard.unavailable')}
      </Card>
    );
  }

  const recentOrders = toRecentOrders(stats.recentOrders);
  const revenueData = groupRevenueByDate(recentOrders);
  const orderStatusData = countByStatus(recentOrders, 'orderStatus', t);
  const paymentRate = calculatePaymentRate(stats);

  return (
    <div className='space-y-6'>
      <AdminPageHeader
        icon={<AdminNavIcon name='dashboard' className='h-6 w-6' />}
        title={t('dashboard.title')}
        description={t('dashboard.subtitle')}
      />

      <section className='grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6'>
        <StatCard
          label={t('dashboard.totalOrders')}
          value={stats.totalOrders}
          description={t('dashboard.totalOrdersSubtext')}
          tone='blue'
        />
        <StatCard
          label={t('dashboard.totalRevenue')}
          value={formatCurrencyVND(stats.totalRevenue)}
          description={t('dashboard.totalRevenueSubtext')}
          tone='emerald'
        />
        <StatCard
          label={t('dashboard.totalCustomers')}
          value={stats.totalCustomers}
          description={t('dashboard.totalCustomersSubtext')}
          tone='emerald'
        />
        <StatCard
          label={t('dashboard.pendingOrders')}
          value={stats.pendingOrders}
          description={t('dashboard.pendingOrdersSubtext')}
          tone='amber'
        />
        <StatCard
          label={t('dashboard.paidOrders')}
          value={stats.paidOrders}
          description={t('dashboard.paidOrdersSubtext')}
          tone='blue'
        />
        <StatCard
          label={t('dashboard.needProcessing')}
          value={stats.processingOrders}
          description={t('dashboard.needProcessingSubtext')}
          tone='slate'
        />
      </section>

      <section className='grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]'>
        <ChartCard
          title={t('dashboard.revenueTrendTitle')}
          description={t('dashboard.revenueTrendDescription')}
        >
          <RevenueTrendChart data={revenueData} emptyText={t('dashboard.chartEmpty')} />
        </ChartCard>

        <ChartCard
          title={t('dashboard.orderStatusTitle')}
          description={t('dashboard.orderStatusDescription')}
        >
          <div className='space-y-5'>
            <StatusDistributionChart
              data={orderStatusData}
              emptyText={t('dashboard.chartEmpty')}
            />
            <PaymentRateCard
              rate={paymentRate}
              paid={stats.paidOrders}
              total={stats.totalOrders}
              title={t('dashboard.paymentRateTitle')}
              description={t('dashboard.paymentRateDescription')}
              countLabel={t('dashboard.paymentRateCountLabel')}
            />
          </div>
        </ChartCard>
      </section>

      <Card className='overflow-hidden p-0'>
        <div className='border-b border-slate-200 px-5 py-4 sm:px-6 sm:py-5'>
          <SectionHeader
            title={t('dashboard.recentOrders')}
            description={t('dashboard.recentOrdersDescription')}
            titleClassName='text-[20px]'
          />
        </div>
        <div className='p-4 sm:p-5'>
          <Table className='min-w-[760px]' containerClassName='shadow-none'>
            <TableHeader>
              <tr>
                <TableHead>{t('dashboard.orderCode')}</TableHead>
                <TableHead>{t('dashboard.customer')}</TableHead>
                <TableHead className='text-right'>{t('dashboard.amount')}</TableHead>
                <TableHead className='text-center'>{t('dashboard.orderStatus')}</TableHead>
                <TableHead className='text-center'>{t('dashboard.paymentStatus')}</TableHead>
              </tr>
            </TableHeader>

            <TableBody>
              {recentOrders.length === 0 ? (
                <TableEmptyState colSpan={5}>{t('dashboard.noRecentOrders')}</TableEmptyState>
              ) : (
                recentOrders.map((order) => (
                  <TableRow key={order.id} hoverable>
                    <TableCell className='font-mono text-[13px] font-semibold text-slate-800'>
                      {order.orderCode}
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell className='text-right font-medium text-slate-800'>
                      {formatCurrencyVND(order.totalAmount)}
                    </TableCell>
                    <TableCell className='text-center'>
                      <StatusBadge value={order.orderStatus} t={t} />
                    </TableCell>
                    <TableCell className='text-center'>
                      <StatusBadge value={order.paymentStatus} t={t} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
