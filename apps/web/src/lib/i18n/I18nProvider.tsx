"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_STORAGE_KEY,
  type Locale,
} from "./config";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionaries";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dictionary: Dictionary;
  t: (key: string, replacements?: Record<string, string>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return LOCALES.includes(value as Locale);
}

function resolveMessage(dictionary: Dictionary, key: string) {
  const parts = key.split(".");
  let current: unknown = dictionary;

  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in current)) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === "string" ? current : undefined;
}

function applyReplacements(
  template: string,
  replacements?: Record<string, string>,
) {
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
  const pathname = usePathname();

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

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    }
  }, []);

  const dictionary = useMemo(() => getDictionary(locale), [locale]);

  useEffect(() => {
    const routeTitle =
      pathname === "/business"
        ? dictionary.metadata.business.title
        : pathname === "/collection"
          ? dictionary.metadata.collection.title
          : pathname === "/order-tracking"
            ? dictionary.metadata.orderTracking.title
            : pathname.startsWith("/studio")
              ? dictionary.metadata.studio.title
              : pathname === "/cart"
                ? dictionary.cart.title
                : pathname === "/checkout"
                  ? dictionary.checkout.title
                  : pathname === "/login"
                    ? dictionary.auth.login.title
                    : pathname === "/register"
                      ? dictionary.auth.register.title
                      : pathname === "/order-success"
                        ? dictionary.orderSuccess.title
                        : pathname === "/payment/cancel"
                          ? dictionary.payment.cancel.title
                          : pathname === "/payment/success"
                            ? dictionary.payment.success.paidTitle
                            : pathname === "/privacy-policy"
                              ? dictionary.privacyPolicy.title
                              : pathname === "/loading-lab"
                                ? dictionary.loadingLab.metadataTitle
                                : null;

    const localizedTitle = routeTitle
      ? routeTitle.includes("Figure Lab")
        ? routeTitle
        : `${routeTitle} | Figure Lab`
      : dictionary.metadata.site.defaultTitle;

    const syncDocumentTitle = () => {
      if (document.title !== localizedTitle) {
        document.title = localizedTitle;
      }
    };

    syncDocumentTitle();

    // Next.js can stream route metadata after client effects. Keep the active
    // locale authoritative so a late head update cannot restore the VI title.
    const observer = new MutationObserver(syncDocumentTitle);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [dictionary, pathname]);

  const t = useCallback(
    (key: string, replacements?: Record<string, string>) => {
      const activeMessage =
        resolveMessage(dictionary, key) ??
        resolveMessage(getDictionary(DEFAULT_LOCALE), key) ??
        key;

      return applyReplacements(activeMessage, replacements);
    },
    [dictionary],
  );

  const value = useMemo(
    () => ({ locale, setLocale, dictionary, t }),
    [dictionary, locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }

  return context;
}
