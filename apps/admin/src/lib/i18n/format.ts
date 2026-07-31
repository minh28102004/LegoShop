import type { Locale } from '@/lib/i18n/config';

const LOCALE_TAGS: Record<Locale, string> = {
  vi: 'vi-VN',
  en: 'en-US',
};

export function formatVnd(value: number, locale: Locale) {
  return new Intl.NumberFormat(LOCALE_TAGS[locale], {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(LOCALE_TAGS[locale]).format(
    Number.isFinite(value) ? value : 0,
  );
}

export function formatCompactNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(LOCALE_TAGS[locale], {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatDateTime(
  value: string | number | Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], options).format(date);
}

export function formatDate(value: string | number | Date, locale: Locale) {
  return formatDateTime(value, locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
