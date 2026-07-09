import {
  BadgePercent,
  Building2,
  MessageSquare,
  Users,
} from 'lucide-react'

import type { BusinessBenefit } from '@/modules/business/types/business-page.types'

export const BUSINESS_BENEFITS: BusinessBenefit[] = [
  {
    icon: BadgePercent,
    color: 'bg-primary/10 text-primary',
    title: 'Chiết khấu số lượng lớn',
    desc: 'Giá ưu đãi cho đơn từ 10 sản phẩm trở lên',
  },
  {
    icon: MessageSquare,
    color: 'bg-blue-100 text-blue-600',
    title: 'Thiết kế theo yêu cầu',
    desc: 'Tùy biến logo, màu sắc thương hiệu riêng biệt',
  },
  {
    icon: Users,
    color: 'bg-emerald-100 text-emerald-600',
    title: 'Tư vấn tận tình',
    desc: 'Đội ngũ hỗ trợ 24/7, phản hồi trong 2 giờ',
  },
  {
    icon: Building2,
    color: 'bg-purple-100 text-purple-600',
    title: 'Giao hàng đúng hẹn',
    desc: 'Đảm bảo tiến độ cho sự kiện của bạn',
  },
]

export const BUSINESS_USE_CASES = [
  'Sự kiện công ty',
  'Quà tri ân nhân viên',
  'Tết & Lễ hội',
  'Team building',
  'Ra mắt sản phẩm',
  'Kỷ niệm thành lập',
  'Quà tặng đối tác',
] as const
