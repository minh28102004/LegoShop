// ============================================================
// SITE METADATA - Single source of truth cho brand info
// ============================================================

export const SITE = {
  name: 'THE LUVIN',
  tagline: 'Quà tặng cá nhân hóa từ khung LEGO độc đáo.',
  description:
    'Thiết kế khung tranh LEGO cá nhân hóa cho mọi dịp đặc biệt. Độc đáo, ý nghĩa và chỉ mất 5 phút để tạo ra.',
  url: 'https://theluvin.vn',
  email: 'hello@theluvin.vn',
  phone: '0901 234 567',
  address: 'Quận 1, TP. Hồ Chí Minh',
  locale: 'vi-VN',
  currency: 'VND',
  twitterHandle: '@theluvin_vn',
  ogImage: '/og-image.jpg',
} as const

export const BUSINESS_HOURS = {
  weekdays: '9:00 - 18:00',
  weekend: '10:00 - 16:00',
  timezone: 'Asia/Ho_Chi_Minh',
} as const

export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/brickframes',
  instagram: 'https://instagram.com/brickframes.vn',
  tiktok: 'https://tiktok.com/@brickframes.vn',
  youtube: 'https://youtube.com/@brickframes',
} as const

export const SEO = {
  defaultTitle: `${SITE.name} - Nhung vien gach xung dang duoc trung bay`,
  titleTemplate: `%s | ${SITE.name}`,
  defaultDescription: SITE.description,
} as const
