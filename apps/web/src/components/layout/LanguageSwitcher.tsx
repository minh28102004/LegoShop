"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Dropdown, cn } from "@lego-shop/ui";

import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/useI18n";

const LOCALE_OPTIONS: Array<{
  value: Locale;
  label: string;
  flagSrc: string;
  flagAlt: string;
}> = [
  {
    value: "vi",
    label: "VI",
    flagSrc: "/flags/vi.svg",
    flagAlt: "Cờ Việt Nam",
  },
  {
    value: "en",
    label: "EN",
    flagSrc: "/flags/en.svg",
    flagAlt: "English flag",
  },
];

const LOCALE_TOAST_LABEL: Record<Locale, string> = {
  vi: "Tiếng Việt",
  en: "English",
};

type LanguageSwitcherProps = {
  className?: string;
  compact?: boolean;
  portal?: boolean;
  side?: "top" | "bottom";
};

export function LanguageSwitcher({
  className,
  compact = false,
  portal = true,
  side = "bottom",
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const selected =
    LOCALE_OPTIONS.find((option) => option.value === locale) ??
    LOCALE_OPTIONS.find((option) => option.value === DEFAULT_LOCALE) ??
    LOCALE_OPTIONS[0];

  if (!selected) return null;

  function handleLocaleChange(
    nextLocale: Locale,
    label: string,
    close: () => void,
  ) {
    close();

    if (nextLocale === locale) return;

    setLocale(nextLocale);
    const localeLabel = LOCALE_TOAST_LABEL[nextLocale] ?? label;
    toast.success(
      nextLocale === "vi"
        ? `Đã chuyển sang ${localeLabel}`
        : `Language changed to ${localeLabel}`,
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-[14px] font-medium text-text-muted",
        compact && "gap-0 xl:gap-2",
        className,
      )}
    >
      <span className={compact ? "hidden xl:inline" : ""}>
        {t("common.language")}
      </span>

      <Dropdown
        align="right"
        portal={portal}
        side={side}
        matchTriggerWidth
        offset={6}
        panelRole="listbox"
        onOpenChange={setOpen}
        className={cn(
          "w-[92px] min-w-[92px]",
          compact && "w-[88px] min-w-[88px]",
        )}
        panelClassName="p-1.5"
        trigger={
          <button
            type="button"
            className="inline-flex h-11 w-full items-center gap-1.5 rounded-button border border-border bg-white px-2.5 text-left text-[14px] font-semibold text-text-primary shadow-control transition-all duration-fast ease-smooth hover:border-primary/40 hover:bg-surface-soft"
            aria-label={t("common.language")}
          >
            <Image
              src={selected.flagSrc}
              alt={selected.flagAlt}
              width={20}
              height={20}
              className="h-5 w-5 shrink-0 rounded-full object-cover"
            />
            <span className="min-w-0 flex-1 truncate">{selected.label}</span>
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "ml-auto size-[18px] shrink-0 text-text-muted transition-transform duration-fast",
                open && "rotate-180 text-primary",
              )}
              strokeWidth={1.8}
            />
          </button>
        }
      >
        {({ close }) => (
          <div className="space-y-1">
            {LOCALE_OPTIONS.map((option) => {
              const active = option.value === locale;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={cn(
                    "flex min-h-10 w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[14px] font-semibold transition-colors duration-fast",
                    active
                      ? "bg-primary-light text-primary-dark"
                      : "text-text-primary hover:bg-primary-light hover:text-primary-dark",
                  )}
                  onClick={() => {
                    handleLocaleChange(option.value, option.label, close);
                  }}
                >
                  <Image
                    src={option.flagSrc}
                    alt={option.flagAlt}
                    width={20}
                    height={20}
                    className="h-5 w-5 shrink-0 rounded-full object-cover"
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </Dropdown>
    </div>
  );
}
