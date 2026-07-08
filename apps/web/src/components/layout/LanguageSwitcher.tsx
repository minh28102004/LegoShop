'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { LanguageSwitcher as SharedLanguageSwitcher } from '@lego-shop/ui';

const LOCALE_STORAGE_KEY = 'figurelab_locale';

type Locale = 'vi' | 'en';

const LOCALE_OPTIONS: Array<{
  value: Locale;
  label: string;
  flagSrc: string;
  flagAlt: string;
}> = [
  {
    value: 'vi',
    label: 'Vi',
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

function isLocale(value: string | null): value is Locale {
  return value === 'vi' || value === 'en';
}

export function LanguageSwitcher({
  className,
  compact = false,
}: LanguageSwitcherProps) {
  const [locale, setLocale] = useState<Locale>('vi');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (!isLocale(storedLocale)) return;

    setLocale(storedLocale);
    document.documentElement.lang = storedLocale;
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  function handleLocaleChange(nextLocale: Locale) {
    if (nextLocale === locale) return;

    setLocale(nextLocale);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    }

    const localeLabel = LOCALE_TOAST_LABEL[nextLocale];
    toast.success(
      nextLocale === 'vi' ? `Đã chuyển sang ${localeLabel}` : `Language changed to ${localeLabel}`,
    );
  }

  return (
    <SharedLanguageSwitcher
      label='Ngôn ngữ'
      value={locale}
      options={LOCALE_OPTIONS}
      onChange={handleLocaleChange}
      compact={compact}
      {...(className !== undefined ? { className } : {})}
    />
  );
}
