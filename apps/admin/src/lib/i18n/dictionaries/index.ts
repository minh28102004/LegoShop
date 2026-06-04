import { defaultLocale, type Locale } from '@/lib/i18n/config';
import { en } from '@/lib/i18n/dictionaries/en';
import { vi } from '@/lib/i18n/dictionaries/vi';

type DictionaryShape<T> = {
  [K in keyof T]: T[K] extends string ? string : DictionaryShape<T[K]>;
};

export type Dictionary = DictionaryShape<typeof en>;

export const dictionaries: Record<Locale, Dictionary> = {
  en,
  vi,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
