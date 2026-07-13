"use client";

import Image from "next/image";
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

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

  if (!selected) {
    return null;
  }

  function handleLocaleChange(nextLocale: Locale, label: string, close: () => void) {
    close();

    if (nextLocale === locale) return;

    setLocale(nextLocale);
    const localeLabel = LOCALE_TOAST_LABEL[nextLocale] ?? label;
    toast.success(
      nextLocale === "vi" ? `Đã chuyển sang ${localeLabel}` : `Language changed to ${localeLabel}`,
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs font-medium text-slate-500",
        compact && "gap-0 xl:gap-2",
        className,
      )}
    >
      <span className={compact ? "hidden xl:inline" : ""}>{t("common.language")}</span>

      <Dropdown
        align="right"
        portal={portal}
        side={side}
        matchTriggerWidth
        offset={6}
        panelRole="listbox"
        onOpenChange={setOpen}
        className={cn("w-[84px] min-w-[84px]", compact && "w-[80px] min-w-[80px]")}
        panelClassName="p-1.5"
        trigger={
          <button
            type="button"
            className="admin-control admin-control-md inline-flex h-9 min-h-9 items-center gap-1.5 rounded-[12px] px-2 text-left text-[13px] font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
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
            <span
              className={cn(
                "ml-auto inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center text-slate-400 transition-transform duration-150",
                open && "rotate-180 text-[#2f91d0]",
              )}
            >
              <ChevronDownIcon />
            </span>
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
                    "m-0 flex min-h-10 w-full appearance-none items-center gap-2 rounded-[10px] border-0 bg-transparent px-2.5 py-2 text-left text-[13px] font-semibold shadow-none outline-none ring-0 transition-colors duration-150 focus:outline-none focus-visible:outline-none focus-visible:ring-0",
                    active
                      ? "bg-(--admin-primary-soft) text-(--admin-primary-strong)"
                      : "text-slate-700 hover:bg-(--admin-primary-soft) hover:text-(--admin-primary-strong)",
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
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </Dropdown>
    </div>
  );
}
