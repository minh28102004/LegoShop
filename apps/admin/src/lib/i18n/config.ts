import { STORAGE_KEYS } from '@/common/constants/storage-keys';

export const locales = ['en', 'vi'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'vi';
export const localeStorageKey = STORAGE_KEYS.adminLocale;

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
