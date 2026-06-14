import type { OrderStatus, PaymentStatus, ShippingStatus } from '@/modules/admin/types/admin.types';
import {
  areTableSortsEqual,
  DEFAULT_TABLE_SORTS,
  type TableSort,
} from '@/common/components/ui/Table';

export type SortDirection = 'asc' | 'desc';

export type OrderFilters = {
  keyword: string;
  orderStatus: OrderStatus[];
  paymentStatus: PaymentStatus[];
  shippingStatus: ShippingStatus[];
  minPrice?: number;
  maxPrice?: number;
  dateRange?: [string, string];
  sorts: TableSort[];
};

export type OrderFilterGroup = 'orderStatus' | 'paymentStatus' | 'shippingStatus';

export type OrderFilterOption<TValue extends string = string> = {
  value: TValue;
  label: string;
};

export const DEFAULT_ORDER_FILTERS: OrderFilters = {
  keyword: '',
  orderStatus: [],
  paymentStatus: [],
  shippingStatus: [],
  sorts: [...DEFAULT_TABLE_SORTS],
};

export function countAdvancedOrderFilters(filters: OrderFilters): number {
  let count = 0;
  count += filters.orderStatus.length;
  count += filters.paymentStatus.length;
  count += filters.shippingStatus.length;
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count += 1;
  return count;
}

export function hasAnyOrderFilter(filters: OrderFilters): boolean {
  return (
    filters.keyword.length > 0 ||
    filters.orderStatus.length > 0 ||
    filters.paymentStatus.length > 0 ||
    filters.shippingStatus.length > 0 ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.dateRange !== undefined ||
    !areTableSortsEqual(filters.sorts, DEFAULT_ORDER_FILTERS.sorts)
  );
}

export function clearAdvancedOrderFilters(filters: OrderFilters): OrderFilters {
  return {
    ...filters,
    orderStatus: [],
    paymentStatus: [],
    shippingStatus: [],
    minPrice: undefined,
    maxPrice: undefined,
  };
}

export function getOptionalPositiveNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const numberValue = Number(trimmed);
  if (!Number.isFinite(numberValue) || numberValue < 0) return undefined;
  return numberValue;
}
