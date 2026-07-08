'use client';

import toast from 'react-hot-toast';

import { LanguageSwitcher as SharedLanguageSwitcher } from '@lego-shop/ui';

import { type Locale } from '@/lib/i18n/config';
import { useI18n } from '@/lib/i18n/useI18n';

const LOCALE_OPTIONS: Array<{
  value: Locale;
  label: string;
  flagSrc: string;
  flagAlt: string;
}> = [
  {
    value: 'vi',
    label: 'VI',
    flagSrc: '/flags/vi.svg',
    flagAlt: 'Cờ Việt Nam',
  },
  {
    value: 'en',
    label: 'EN',
    flagSrc: '/flags/en.svg',
    flagAlt: 'English flag',
  },
];

const LOCALE_TOAST_LABEL: Record<Locale, string> = {
  vi: 'Tiếng Việt',
  en: 'Tiếng Anh (English)',
};

type LanguageSwitcherProps = {
  className?: string;
  compact?: boolean;
};

export default function LanguageSwitcher({
  className,
  compact = false,
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();

  function handleLocaleChange(nextLocale: Locale) {
    if (nextLocale === locale) return;

    setLocale(nextLocale);
    const localeLabel = LOCALE_TOAST_LABEL[nextLocale];
    toast.success(
      nextLocale === 'vi' ? `Đã chuyển sang ${localeLabel}` : `Language changed to ${localeLabel}`,
    );
  }

  return (
    <SharedLanguageSwitcher
      label={t('common.language')}
      value={locale}
      options={LOCALE_OPTIONS}
      onChange={handleLocaleChange}
      compact={compact}
      {...(className !== undefined ? { className } : {})}
    />
  );
}
