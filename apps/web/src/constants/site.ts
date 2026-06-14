// ============================================================
// SITE METADATA - Single source of truth cho brand info
// ============================================================

export const SITE = {
  name: 'BrickFrames',
  tagline: 'Nhung vien gach xung dang duoc trung bay.',
  description:
    'Khung tranh LEGO cao cap, duoc thiet ke de trung bay nhung bo suu tap Technic, Icons va Architecture dac biet nhat cua ban.',
  url: 'https://brickframes.vn',
  email: 'hello@brickframes.vn',
  phone: '0901 234 567',
  address: 'Quan 1, TP. Ho Chi Minh',
  locale: 'vi-VN',
  currency: 'VND',
  twitterHandle: '@brickframes_vn',
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
