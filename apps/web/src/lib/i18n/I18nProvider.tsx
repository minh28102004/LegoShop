"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { DEFAULT_LOCALE, LOCALES, LOCALE_STORAGE_KEY, type Locale } from "./config";
import { messages } from "./messages";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return LOCALES.includes(value as Locale);
}

function resolveMessage(locale: Locale, key: string) {
  const parts = key.split(".");
  let current: unknown = messages[locale];

  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in current)) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === "string" ? current : undefined;
}

function applyReplacements(template: string, replacements?: Record<string, string>) {
  if (!replacements) {
    return template;
  }

  return Object.entries(replacements).reduce(
    (result, [token, value]) => result.replaceAll(`{${token}}`, value),
    template,
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);

    if (!isLocale(storedLocale)) return;

    let cancelled = false;
    window.queueMicrotask(() => {
      if (!cancelled) setLocaleState(storedLocale);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function setLocale(nextLocale: Locale) {
    setLocaleState(nextLocale);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    }
  }

  function t(key: string, replacements?: Record<string, string>) {
    const activeMessage =
      resolveMessage(locale, key) ?? resolveMessage(DEFAULT_LOCALE, key) ?? key;

    return applyReplacements(activeMessage, replacements);
  }

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }

  return context;
}
