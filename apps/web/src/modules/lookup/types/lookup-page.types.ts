import type { LucideIcon } from 'lucide-react'
import type {
  TrackOrderItemSummaryContract,
  TrackOrderResponseContract,
} from '@lego-shop/shared'

export type TrackingResult = TrackOrderResponseContract | { error: true }

export type LookupStatusTone = {
  label: string
  color: string
}

export type LookupStep = {
  key: string
  label: string
  icon: LucideIcon
}

export type TrackingPart = {
  name: string
  quantity: number
  totalPrice?: number
  imageUrl?: string | null
  meta?: string
}

export type LookupOrderItem = TrackOrderItemSummaryContract
