// ============================================================
// FORMATTERS - Display formatting utilities
// Tat ca la pure functions, khong co side effects
// ============================================================

const DEFAULT_LOCALE = 'vi-VN'
const DEFAULT_CURRENCY = 'VND'
const FALLBACK_LOCALE = 'en-US'
const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24
const DAYS_PER_WEEK = 7
const DAYS_PER_MONTH = 30
const WEEKS_PER_MONTH = 5

// ------------------------------------------------------------
// PRICE FORMATTER
// ------------------------------------------------------------

/**
 * Format so tien theo dinh dang Viet Nam.
 *
 * @example
 * formatPrice(1200000)
 * formatPrice(1200000, 'USD')
 */
export function formatPrice(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
): string {
  if (currency === DEFAULT_CURRENCY) {
    return new Intl.NumberFormat(DEFAULT_LOCALE, {
      style: 'currency',
      currency: DEFAULT_CURRENCY,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return new Intl.NumberFormat(FALLBACK_LOCALE, {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format so khong co don vi tien te.
 *
 * @example
 * formatNumber(1200000)
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE).format(value)
}

/**
 * Tinh phan tram giam gia.
 *
 * @example
 * calcDiscountPercent(1200000, 1000000)
 */
export function calcDiscountPercent(
  originalPrice: number,
  salePrice: number,
): number {
  if (originalPrice <= 0 || salePrice >= originalPrice) {
    return 0
  }

  return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}

// ------------------------------------------------------------
// DATE FORMATTER
// ------------------------------------------------------------

function toDate(date: string | Date): Date {
  return typeof date === 'string' ? new Date(date) : date
}

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime())
}

/**
 * Format ISO date string thanh tieng Viet.
 *
 * @example
 * formatDate('2025-03-12')
 */
export function formatDate(date: string | Date): string {
  const normalizedDate = toDate(date)

  if (!isValidDate(normalizedDate)) {
    return ''
  }

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(normalizedDate)
}

/**
 * Format date ngan gon.
 *
 * @example
 * formatDateShort('2025-03-12')
 */
export function formatDateShort(date: string | Date): string {
  const normalizedDate = toDate(date)

  if (!isValidDate(normalizedDate)) {
    return ''
  }

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(normalizedDate)
}

/**
 * Relative time - "3 ngay truoc", "vua xong".
 *
 * @example
 * formatRelativeTime('2025-03-09')
 */
export function formatRelativeTime(
  date: string | Date,
  baseDate: string | Date = new Date(),
): string {
  const normalizedDate = toDate(date)
  const normalizedBaseDate = toDate(baseDate)

  if (!isValidDate(normalizedDate) || !isValidDate(normalizedBaseDate)) {
    return ''
  }

  const diffMs = normalizedBaseDate.getTime() - normalizedDate.getTime()
  const diffSeconds = Math.floor(diffMs / MILLISECONDS_PER_SECOND)
  const diffMinutes = Math.floor(diffSeconds / SECONDS_PER_MINUTE)
  const diffHours = Math.floor(diffMinutes / MINUTES_PER_HOUR)
  const diffDays = Math.floor(diffHours / HOURS_PER_DAY)
  const diffWeeks = Math.floor(diffDays / DAYS_PER_WEEK)
  const diffMonths = Math.floor(diffDays / DAYS_PER_MONTH)
  const rtf = new Intl.RelativeTimeFormat(DEFAULT_LOCALE, { numeric: 'auto' })

  if (Math.abs(diffSeconds) < SECONDS_PER_MINUTE) {
    return rtf.format(-diffSeconds, 'second')
  }

  if (Math.abs(diffMinutes) < MINUTES_PER_HOUR) {
    return rtf.format(-diffMinutes, 'minute')
  }

  if (Math.abs(diffHours) < HOURS_PER_DAY) {
    return rtf.format(-diffHours, 'hour')
  }

  if (Math.abs(diffDays) < DAYS_PER_WEEK) {
    return rtf.format(-diffDays, 'day')
  }

  if (Math.abs(diffWeeks) < WEEKS_PER_MONTH) {
    return rtf.format(-diffWeeks, 'week')
  }

  return rtf.format(-diffMonths, 'month')
}

// ------------------------------------------------------------
// STRING FORMATTER
// ------------------------------------------------------------

/**
 * Truncate text voi ellipsis.
 *
 * @example
 * truncate('San pham rat dac biet', 10)
 */
export function truncate(text: string, maxLength: number): string {
  if (maxLength <= 0) {
    return ''
  }

  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trimEnd()}...`
}

/**
 * Capitalize first letter.
 *
 * @example
 * capitalize('hello world')
 */
export function capitalize(text: string): string {
  if (!text) {
    return ''
  }

  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Convert string sang slug.
 *
 * @example
 * slugify('Soi Tu Nhien')
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ------------------------------------------------------------
// WEIGHT / DIMENSION
// ------------------------------------------------------------

/**
 * Format trong luong.
 *
 * @example
 * formatWeight(1200)
 */
export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toLocaleString(DEFAULT_LOCALE)} kg`
  }

  return `${grams} g`
}

/**
 * Format kich thuoc khung.
 *
 * @example
 * formatDimension(40, 30)
 */
export function formatDimension(widthCm: number, heightCm: number): string {
  return `${widthCm} x ${heightCm} cm`
}

// ------------------------------------------------------------
// PHONE / ORDER
// ------------------------------------------------------------

/**
 * Format so dien thoai Viet Nam.
 *
 * @example
 * formatPhone('0901234567')
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }

  return phone
}

/**
 * Format ma don hang.
 *
 * @example
 * formatOrderNumber('LS20260604123456')
 */
export function formatOrderNumber(orderNumber: string): string {
  return `#${orderNumber}`
}
