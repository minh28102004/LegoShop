const DEFAULT_LOCALE = 'vi-VN';

function toDate(value: string | Date): Date {
  return typeof value === 'string' ? new Date(value) : value;
}

export function formatDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  },
  locale = DEFAULT_LOCALE,
): string {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(locale, options).format(date);
}
