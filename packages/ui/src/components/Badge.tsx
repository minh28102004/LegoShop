import * as React from 'react'

import { cn } from '../cn'

export type BadgeTone =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'info'
  | 'blue'
  | 'sky'
  | 'cyan'
  | 'green'
  | 'emerald'
  | 'amber'
  | 'slate'
  | 'rose'

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'outline'

export interface BadgeProps extends React.ComponentPropsWithoutRef<'span'> {
  tone?: BadgeTone
  variant?: BadgeVariant
  size?: 'sm' | 'md'
}

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: 'border-slate-200 bg-slate-100 text-slate-700',
  inactive: 'border-slate-200 bg-slate-100 text-slate-700',
  slate: 'border-slate-200 bg-slate-100 text-slate-700',
  success: 'border-green-200 bg-green-50 text-green-700',
  active: 'border-green-200 bg-green-50 text-green-700',
  green: 'border-green-200 bg-green-50 text-green-700',
  emerald: 'border-green-200 bg-green-50 text-green-700',
  warning: 'border-[#f4cc45] bg-[#fff8d8] text-amber-800',
  pending: 'border-[#f4cc45] bg-[#fff8d8] text-amber-800',
  amber: 'border-[#f4cc45] bg-[#fff8d8] text-amber-800',
  danger: 'border-red-200 bg-red-50 text-red-700',
  rose: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-[#d7efff] bg-[#edf8ff] text-[#2f91d0]',
  blue: 'border-[#d7efff] bg-[#edf8ff] text-[#2f91d0]',
  sky: 'border-[#d7efff] bg-[#edf8ff] text-[#2f91d0]',
  cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700',
}

const VARIANT_TO_TONE: Record<BadgeVariant, BadgeTone> = {
  default: 'neutral',
  primary: 'info',
  success: 'success',
  warning: 'warning',
  error: 'danger',
  outline: 'neutral',
}

const STATUS_ALIAS: Record<string, string> = {
  dang_hoat_dong: 'active',
  hoat_dong: 'active',
  published: 'active',
  enabled: 'active',
  visible: 'visible',
  hien_thi: 'visible',
  inactive: 'inactive',
  tam_dung: 'inactive',
  ngung_hoat_dong: 'inactive',
  disabled: 'inactive',
  draft: 'draft',
  nhap: 'draft',
  hidden: 'hidden',
  an: 'hidden',
  archived: 'closed',
  closed: 'closed',
  da_dong: 'closed',
  out_of_stock: 'out_of_stock',
  sold_out: 'out_of_stock',
  het_hang: 'out_of_stock',
  cho_xu_ly: 'pending',
  cho_thanh_toan: 'unpaid',
  chua_thanh_toan: 'unpaid',
  da_xac_nhan: 'confirmed',
  dang_chuan_bi: 'preparing',
  dang_giao: 'shipping',
  hoan_thanh: 'completed',
  hoan_tat: 'completed',
  da_huy: 'cancelled',
  that_bai: 'failed',
  giao_that_bai: 'delivery_failed',
  delivery_failed: 'delivery_failed',
  shipping_failed: 'delivery_failed',
  failed_delivery: 'delivery_failed',
  da_giao: 'delivered',
  da_thanh_toan: 'paid',
  thanh_toan_that_bai: 'failed',
  hoan_tien: 'refunded',
  da_hoan_tien: 'refunded',
  refund: 'refunded',
  refunding: 'refunded',
  moi: 'new',
  dang_xu_ly: 'processing',
  da_lien_he: 'contacted',
  da_phan_hoi: 'contacted',
  responded: 'contacted',
  replied: 'contacted',
  resolved: 'done',
  success: 'paid',
  succeeded: 'paid',
  expired: 'failed',
  voided: 'cancelled',
}

const STATUS_TONE: Record<string, BadgeTone> = {
  active: 'success',
  visible: 'success',
  paid: 'success',
  completed: 'success',
  delivered: 'success',
  contacted: 'success',
  done: 'success',
  pending: 'pending',
  unpaid: 'pending',
  deposit_pending: 'pending',
  new: 'pending',
  out_of_stock: 'pending',
  confirmed: 'info',
  processing: 'info',
  preparing: 'info',
  shipping: 'info',
  deposit_paid: 'info',
  inactive: 'neutral',
  draft: 'neutral',
  hidden: 'neutral',
  closed: 'neutral',
  cancelled: 'danger',
  failed: 'danger',
  delivery_failed: 'danger',
  refunded: 'cyan',
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tone, variant, size = 'md', ...props }, ref) => {
    const resolvedTone = tone ?? VARIANT_TO_TONE[variant ?? 'default']

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex w-fit items-center rounded-full border font-semibold',
          size === 'sm' ? 'min-h-6 px-2 py-0.5 text-[11px]' : 'min-h-7 px-2.5 py-1 text-xs',
          TONE_CLASS[resolvedTone],
          className,
        )}
        {...props}
      />
    )
  },
)

Badge.displayName = 'Badge'

export function normalizeStatus(value?: string | null) {
  const normalized = (value ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  return STATUS_ALIAS[normalized] ?? normalized
}

export function getStatusBadgeTone(value?: string | null): BadgeTone {
  return STATUS_TONE[normalizeStatus(value)] ?? 'neutral'
}

function formatUnknownStatus(value: string) {
  const readable = value.trim().replace(/[-_]+/g, ' ')
  return readable ? readable.charAt(0).toUpperCase() + readable.slice(1) : '-'
}

export function getStatusBadgeLabel(value: string, t: (key: string) => string) {
  const normalized = normalizeStatus(value)
  const translated = t(`status.${normalized}`)
  return translated === `status.${normalized}` ? formatUnknownStatus(value) : translated
}

export function StatusBadge({
  value,
  t,
  className,
}: {
  value?: string | null
  t: (key: string) => string
  className?: string
}) {
  const normalized = normalizeStatus(value)

  if (!normalized) {
    return <span className={cn('text-sm text-slate-400', className)}>-</span>
  }

  return (
    <Badge
      tone={getStatusBadgeTone(normalized)}
      className={cn('px-2.5 py-1 text-[12px] font-semibold leading-none', className)}
    >
      <span>{getStatusBadgeLabel(normalized, t)}</span>
    </Badge>
  )
}
