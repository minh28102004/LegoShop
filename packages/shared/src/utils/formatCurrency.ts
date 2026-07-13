const DEFAULT_LOCALE = 'vi-VN';
const DEFAULT_CURRENCY = 'VND';

export function formatCurrency(
  value: number,
  options: {
    locale?: string;
    currency?: string;
    maximumFractionDigits?: number;
  } = {},
): string {
  const currency = options.currency ?? DEFAULT_CURRENCY;

  return new Intl.NumberFormat(options.locale ?? DEFAULT_LOCALE, {
    style: 'currency',
    currency,
    maximumFractionDigits:
      options.maximumFractionDigits ?? (currency === DEFAULT_CURRENCY ? 0 : undefined),
  }).format(value);
}
