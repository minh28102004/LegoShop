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
  if (name === 'payment' || name === 'price') {
    return (
      <svg viewBox='0 0 24 24' fill='none' className='h-4 w-4' aria-hidden='true'>
        <path d='M12 3V21' stroke='currentColor' strokeLinecap='round' strokeWidth='1.9' />
        <path
          d='M16.4 7.5C15.6 6.6 14.2 6 12.7 6H11C9 6 7.6 7 7.6 8.6C7.6 10.1 8.7 11 10.7 11.4L13.3 11.9C15.4 12.3 16.5 13.2 16.5 14.8C16.5 16.5 15 18 12.8 18H10.9C9.2 18 7.8 17.3 6.9 16.2'
          stroke='currentColor'
          strokeLinecap='round'
          strokeWidth='1.9'
        />
      </svg>
    );
  }

  if (name === 'shipping') {
    return (
      <svg viewBox='0 0 24 24' fill='none' className='h-4 w-4' aria-hidden='true'>
        <path d='M3.5 7H14.5V17H3.5V7Z' stroke='currentColor' strokeLinejoin='round' strokeWidth='1.9' />
        <path d='M14.5 10H18L20.5 13V17H14.5V10Z' stroke='currentColor' strokeLinejoin='round' strokeWidth='1.9' />
        <circle cx='7' cy='18' r='1.7' stroke='currentColor' strokeWidth='1.8' />
        <circle cx='17.5' cy='18' r='1.7' stroke='currentColor' strokeWidth='1.8' />
      </svg>
    );
  }

  return (
    <svg viewBox='0 0 24 24' fill='none' className='h-4 w-4' aria-hidden='true'>
      <path d='M4 6H20L14 12.5V18L10 20V12.5L4 6Z' stroke='currentColor' strokeLinejoin='round' strokeWidth='1.9' />
    </svg>
  );
}

function ApplyIcon() {
  return (
    <svg viewBox='0 0 20 20' fill='none' className='h-4 w-4' aria-hidden='true'>
      <path d='M4.5 10.5L8 14L15.5 6.5' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg viewBox='0 0 20 20' fill='none' className='h-4 w-4' aria-hidden='true'>
      <path d='M5 7V4H8' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.8' />
      <path d='M5.5 7.4C6.5 5.7 8.3 4.7 10.4 4.7C13.6 4.7 16.2 7.3 16.2 10.5C16.2 13.7 13.6 16.3 10.4 16.3C8.4 16.3 6.7 15.3 5.7 13.8' stroke='currentColor' strokeLinecap='round' strokeWidth='1.8' />
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

function selectedCountLabel(count: number) {
  return `${count} mục đã chọn`;
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
  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement='right'
      size='default'
      title={<span className='text-base font-bold text-slate-950'>Bộ lọc</span>}
      rootClassName='orders-filter-drawer'
      styles={{
        body: { padding: 0 },
        header: { borderBottom: '1px solid rgba(226, 232, 240, 0.8)' },
      }}
    >
      <div className='flex h-full flex-col'>
        <div className='admin-scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-4'>
          <FilterSection title='Trạng thái đơn' icon={<SectionIcon name='order' />}>
            <MultiSelectFilter
              values={draftFilters.orderStatus}
              ariaLabel='Trạng thái đơn'
              allLabel='Tất cả trạng thái đơn'
              placeholder='Chọn trạng thái đơn'
              options={buildStatusOptions(ORDER_STATUS_OPTIONS, getStatusLabel)}
              selectedLabel={selectedCountLabel}
              onChange={(values) => {
                onDraftChange({ ...draftFilters, orderStatus: values as OrderStatus[] });
              }}
            />
          </FilterSection>

          <FilterSection title='Thanh toán' icon={<SectionIcon name='payment' />}>
            <MultiSelectFilter
              values={draftFilters.paymentStatus}
              ariaLabel='Thanh toán'
              allLabel='Tất cả trạng thái thanh toán'
              placeholder='Chọn thanh toán'
              options={buildStatusOptions(PAYMENT_STATUS_OPTIONS, getStatusLabel)}
              selectedLabel={selectedCountLabel}
              onChange={(values) => {
                onDraftChange({ ...draftFilters, paymentStatus: values as PaymentStatus[] });
              }}
            />
          </FilterSection>

          <FilterSection title='Giao hàng' icon={<SectionIcon name='shipping' />}>
            <MultiSelectFilter
              values={draftFilters.shippingStatus}
              ariaLabel='Giao hàng'
              allLabel='Tất cả trạng thái giao hàng'
              placeholder='Chọn giao hàng'
              options={buildStatusOptions(SHIPPING_STATUS_OPTIONS, getStatusLabel)}
              selectedLabel={selectedCountLabel}
              onChange={(values) => {
                onDraftChange({ ...draftFilters, shippingStatus: values as ShippingStatus[] });
              }}
            />
          </FilterSection>

          <FilterSection title='Khoảng giá' icon={<SectionIcon name='price' />}>
            <div className='grid grid-cols-2 gap-2'>
              <Input
                type='number'
                min={0}
                value={draftFilters.minPrice ?? ''}
                placeholder='Giá từ'
                className='h-10 rounded-[12px]'
                onChange={(event) => {
                  onDraftChange({
                    ...draftFilters,
                    minPrice: getOptionalPositiveNumber(event.target.value),
                  });
                }}
              />
              <Input
                type='number'
                min={0}
                value={draftFilters.maxPrice ?? ''}
                placeholder='Giá đến'
                className='h-10 rounded-[12px]'
                onChange={(event) => {
                  onDraftChange({
                    ...draftFilters,
                    maxPrice: getOptionalPositiveNumber(event.target.value),
                  });
                }}
              />
            </div>
          </FilterSection>
        </div>

        <div className='flex items-center gap-2 bg-white px-4 py-3 shadow-[0_-1px_0_rgba(226,232,240,0.8)]'>
          <Button
            type='button'
            variant='secondary'
            className='h-10 flex-1 rounded-[12px]'
            leftIcon={<ResetIcon />}
            onClick={() => onDraftChange(clearAdvancedOrderFilters(draftFilters))}
          >
            Đặt lại
          </Button>
          <Button
            type='button'
            className='h-10 flex-1 rounded-[12px]'
            leftIcon={<ApplyIcon />}
            onClick={() => onApply(draftFilters)}
          >
            Áp dụng
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
