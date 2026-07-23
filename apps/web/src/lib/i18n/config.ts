export const LOCALES = ["vi", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "vi";

export const LOCALE_STORAGE_KEY = "figure-lab-locale";

export const LOCALE_FORMATS: Record<Locale, string> = {
  vi: "vi-VN",
  en: "en-US",
};
