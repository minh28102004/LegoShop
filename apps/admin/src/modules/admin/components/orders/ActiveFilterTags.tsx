import dayjs from 'dayjs';
import Badge from '@/common/components/ui/Badge';
import { cn } from '@/common/utils/cn';
import type { OrderFilterGroup, OrderFilters } from '@/modules/admin/components/orders/order-filter.types';

type ActiveFilterTagsProps = {
  filters: OrderFilters;
  getStatusLabel: (value: string) => string;
  onClearDateRange: () => void;
  onClearPrice: () => void;
  onRemoveGroupValue: (group: OrderFilterGroup, value: string) => void;
};

function CloseIcon() {
  return (
    <svg viewBox='0 0 20 20' fill='none' className='h-3.5 w-3.5' aria-hidden='true'>
      <path
        d='M5.5 5.5L14.5 14.5M14.5 5.5L5.5 14.5'
        stroke='currentColor'
        strokeLinecap='round'
        strokeWidth='1.8'
      />
    </svg>
  );
}

function formatDate(value: string) {
  const date = dayjs(value);
  return date.isValid() ? date.format('DD/MM/YYYY') : value;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ActiveFilterTags({
  filters,
  getStatusLabel,
  onClearDateRange,
  onClearPrice,
  onRemoveGroupValue,
}: ActiveFilterTagsProps) {
  const chips: Array<{
    id: string;
    label: string;
    onRemove: () => void;
  }> = [];

  filters.orderStatus.forEach((value) => {
    chips.push({
      id: `order-${value}`,
      label: getStatusLabel(value),
      onRemove: () => onRemoveGroupValue('orderStatus', value),
    });
  });

  filters.paymentStatus.forEach((value) => {
    chips.push({
      id: `payment-${value}`,
      label: getStatusLabel(value),
      onRemove: () => onRemoveGroupValue('paymentStatus', value),
    });
  });

  filters.shippingStatus.forEach((value) => {
    chips.push({
      id: `shipping-${value}`,
      label: getStatusLabel(value),
      onRemove: () => onRemoveGroupValue('shippingStatus', value),
    });
  });

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const min = filters.minPrice !== undefined ? `${formatPrice(filters.minPrice)} đ` : '';
    const max = filters.maxPrice !== undefined ? `${formatPrice(filters.maxPrice)} đ` : '';
    const label = min && max ? `${min} - ${max}` : min ? `>= ${min}` : `<= ${max}`;
    chips.push({
      id: 'price-range',
      label,
      onRemove: onClearPrice,
    });
  }

  if (filters.dateRange) {
    const [from, to] = filters.dateRange;
    chips.push({
      id: 'date-range',
      label: `${formatDate(from)} - ${formatDate(to)}`,
      onRemove: onClearDateRange,
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className='flex flex-wrap items-center gap-2'>
      {chips.map((chip) => (
        <Badge
          key={chip.id}
          tone='slate'
          className='gap-2 border-slate-200 bg-white px-3 py-1.5 text-[12px] shadow-[0_1px_2px_rgba(15,23,42,0.04)]'
        >
          <span className='max-w-[220px] truncate'>{chip.label}</span>
          <button
            type='button'
            onClick={chip.onRemove}
            aria-label={`Remove ${chip.label}`}
            className={cn(
              'inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400',
              'transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700',
            )}
          >
            <CloseIcon />
          </button>
        </Badge>
      ))}
    </div>
  );
}
