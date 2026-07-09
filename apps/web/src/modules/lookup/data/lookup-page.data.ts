import { CheckCircle, Clock, Package, Truck } from 'lucide-react'

import type {
  LookupStatusTone,
  LookupStep,
} from '@/modules/lookup/types/lookup-page.types'

export const ORDER_STATUSES: Record<string, LookupStatusTone> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'Đang xử lý', color: 'bg-purple-100 text-purple-700' },
  shipping: { label: 'Đang giao', color: 'bg-orange-100 text-orange-700' },
  completed: { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
}

export const PAYMENT_STATUSES: Record<string, LookupStatusTone> = {
  unpaid: { label: 'Chưa thanh toán', color: 'text-yellow-600' },
  pending: { label: 'Đang chờ thanh toán', color: 'text-yellow-600' },
  deposit_pending: { label: 'Đang chờ đặt cọc', color: 'text-yellow-600' },
  deposit_paid: { label: 'Đã đặt cọc', color: 'text-blue-600' },
  paid: { label: 'Đã thanh toán', color: 'text-emerald-600' },
  failed: { label: 'Thanh toán thất bại', color: 'text-red-600' },
  cancelled: { label: 'Đã hủy thanh toán', color: 'text-red-600' },
  refunded: { label: 'Đã hoàn tiền', color: 'text-slate-600' },
}

export const SHIPPING_METHOD_LABELS: Record<string, string> = {
  shop_support: 'Shop hỗ trợ đặt ship',
  standard: 'Ship thường',
  fast: 'Ship nhanh',
  self: 'Tự book ship / Qua lấy',
}

export const LOOKUP_STEPS: LookupStep[] = [
  { key: 'pending', label: 'Tiếp nhận', icon: Package },
  { key: 'confirmed', label: 'Xác nhận', icon: Clock },
  { key: 'processing', label: 'Đang làm', icon: Clock },
  { key: 'shipping', label: 'Đang giao', icon: Truck },
  { key: 'completed', label: 'Hoàn thành', icon: CheckCircle },
]
