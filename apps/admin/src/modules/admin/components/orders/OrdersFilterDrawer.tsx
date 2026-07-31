'use client';

import { Drawer } from 'antd';
import type { ReactNode } from 'react';
import Button from '@/common/components/ui/Button';
import Input from '@/common/components/ui/Input';
import MultiSelectFilter from '@/modules/admin/components/filters/MultiSelectFilter';
import {
  clearAdvancedOrderFilters,
  getOptionalPositiveNumber,
  type OrderFilterOption,
  type OrderFilters,
} from '@/modules/admin/components/orders/order-filter.types';
import type { OrderStatus, PaymentStatus, ShippingStatus } from '@/modules/admin/types/admin.types';
import { useI18n } from '@/lib/i18n/useI18n';

type OrdersFilterDrawerProps = {
  draftFilters: OrderFilters;
  getStatusLabel: (value: string) => string;
  onApply: (filters: OrderFilters) => void;
  onClose: () => void;
  onDraftChange: (filters: OrderFilters) => void;
  open: boolean;
};

const ORDER_STATUS_OPTIONS: Array<OrderFilterOption<OrderStatus>> = [
  { value: 'pending', label: 'pending' },
  { value: 'confirmed', label: 'confirmed' },
  { value: 'completed', label: 'completed' },
  { value: 'cancelled', label: 'cancelled' },
];
const PAYMENT_STATUS_OPTIONS: Array<OrderFilterOption<PaymentStatus>> = [
  { value: 'paid', label: 'paid' },
  { value: 'unpaid', label: 'unpaid' },
  { value: 'refunded', label: 'refunded' },
];
const SHIPPING_STATUS_OPTIONS: Array<OrderFilterOption<ShippingStatus>> = [
  { value: 'preparing', label: 'preparing' },
  { value: 'shipping', label: 'shipping' },
  { value: 'delivered', label: 'delivered' },
];

function SectionIcon({ name }: { name: 'order' | 'payment' | 'price' | 'shipping' }) {
  if (name === 'shipping') {
    return (
      <svg viewBox='0 0 24 24' fill='none' className='h-4 w-4' aria-hidden='true'>
        <path d='M3.5 7H14.5V17H3.5V7ZM14.5 10H18L20.5 13V17H14.5V10Z' stroke='currentColor' strokeLinejoin='round' strokeWidth='1.9' />
        <circle cx='7' cy='18' r='1.7' stroke='currentColor' strokeWidth='1.8' />
        <circle cx='17.5' cy='18' r='1.7' stroke='currentColor' strokeWidth='1.8' />
      </svg>
    );
  }
  if (name === 'payment' || name === 'price') {
    return (
      <svg viewBox='0 0 24 24' fill='none' className='h-4 w-4' aria-hidden='true'>
        <path d='M12 3V21M16.4 7.5C15.6 6.6 14.2 6 12.7 6H11C9 6 7.6 7 7.6 8.6C7.6 10.1 8.7 11 10.7 11.4L13.3 11.9C15.4 12.3 16.5 13.2 16.5 14.8C16.5 16.5 15 18 12.8 18H10.9C9.2 18 7.8 17.3 6.9 16.2' stroke='currentColor' strokeLinecap='round' strokeWidth='1.9' />
      </svg>
    );
  }
  return (
    <svg viewBox='0 0 24 24' fill='none' className='h-4 w-4' aria-hidden='true'>
      <path d='M4 6H20L14 12.5V18L10 20V12.5L4 6Z' stroke='currentColor' strokeLinejoin='round' strokeWidth='1.9' />
    </svg>
  );
}

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
        <h3 className='text-[13px] font-bold text-slate-700'>{title}</h3>
      </div>
      {children}
    </section>
  );
}

function buildStatusOptions<TValue extends string>(
  options: Array<OrderFilterOption<TValue>>,
  getStatusLabel: (value: string) => string,
) {
  return options.map((option) => ({
    value: option.value,
    label: getStatusLabel(option.value),
  }));
}

export default function OrdersFilterDrawer({
  draftFilters,
  getStatusLabel,
  onApply,
  onClose,
  onDraftChange,
  open,
}: OrdersFilterDrawerProps) {
  const { t } = useI18n();
  const selectedCountLabel = (count: number) =>
    t('orderFilters.selectedCount').replace('{count}', String(count));

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement='right'
      size='min(100vw, 430px)'
      title={<span className='text-base font-bold text-slate-950'>{t('orderFilters.title')}</span>}
      rootClassName='orders-filter-drawer'
      styles={{
        body: { padding: 0 },
        header: { borderBottom: '1px solid rgba(226, 232, 240, 0.8)' },
      }}
    >
      <div className='flex h-full min-h-0 flex-col'>
        <div className='admin-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4'>
          <FilterSection title={t('orderFilters.orderStatus')} icon={<SectionIcon name='order' />}>
            <MultiSelectFilter
              values={draftFilters.orderStatus}
              ariaLabel={t('orderFilters.orderStatus')}
              allLabel={t('orders.allOrderStatuses')}
              placeholder={t('orderFilters.selectOrderStatus')}
              options={buildStatusOptions(ORDER_STATUS_OPTIONS, getStatusLabel)}
              selectedLabel={selectedCountLabel}
              onChange={(values) => onDraftChange({ ...draftFilters, orderStatus: values as OrderStatus[] })}
            />
          </FilterSection>

          <FilterSection title={t('orderFilters.payment')} icon={<SectionIcon name='payment' />}>
            <MultiSelectFilter
              values={draftFilters.paymentStatus}
              ariaLabel={t('orderFilters.payment')}
              allLabel={t('orders.allPaymentStatuses')}
              placeholder={t('orderFilters.selectPaymentStatus')}
              options={buildStatusOptions(PAYMENT_STATUS_OPTIONS, getStatusLabel)}
              selectedLabel={selectedCountLabel}
              onChange={(values) => onDraftChange({ ...draftFilters, paymentStatus: values as PaymentStatus[] })}
            />
          </FilterSection>

          <FilterSection title={t('orderFilters.shipping')} icon={<SectionIcon name='shipping' />}>
            <MultiSelectFilter
              values={draftFilters.shippingStatus}
              ariaLabel={t('orderFilters.shipping')}
              allLabel={t('orders.allShippingStatuses')}
              placeholder={t('orderFilters.selectShippingStatus')}
              options={buildStatusOptions(SHIPPING_STATUS_OPTIONS, getStatusLabel)}
              selectedLabel={selectedCountLabel}
              onChange={(values) => onDraftChange({ ...draftFilters, shippingStatus: values as ShippingStatus[] })}
            />
          </FilterSection>

          <FilterSection title={t('orderFilters.priceRange')} icon={<SectionIcon name='price' />}>
            <div className='grid grid-cols-1 gap-2 min-[390px]:grid-cols-2'>
              <Input
                type='number'
                min={0}
                value={draftFilters.minPrice ?? ''}
                placeholder={t('orderFilters.priceFrom')}
                className='h-10 rounded-[12px]'
                onChange={(event) => onDraftChange({
                  ...draftFilters,
                  minPrice: getOptionalPositiveNumber(event.target.value),
                })}
              />
              <Input
                type='number'
                min={0}
                value={draftFilters.maxPrice ?? ''}
                placeholder={t('orderFilters.priceTo')}
                className='h-10 rounded-[12px]'
                onChange={(event) => onDraftChange({
                  ...draftFilters,
                  maxPrice: getOptionalPositiveNumber(event.target.value),
                })}
              />
            </div>
          </FilterSection>
        </div>

        <div className='grid shrink-0 grid-cols-2 gap-2 bg-white px-4 py-3 shadow-[0_-1px_0_rgba(226,232,240,0.8)]'>
          <Button
            type='button'
            variant='secondary'
            className='min-h-11 rounded-[12px]'
            onClick={() => onDraftChange(clearAdvancedOrderFilters(draftFilters))}
          >
            {t('orderFilters.reset')}
          </Button>
          <Button
            type='button'
            className='min-h-11 rounded-[12px]'
            onClick={() => onApply(draftFilters)}
          >
            {t('orderFilters.apply')}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
