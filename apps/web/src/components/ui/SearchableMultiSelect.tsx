"use client";

import { cn, Dropdown } from "@lego-shop/ui";
import { Check, ChevronDown, Minus, Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  FORM_OPTION_CLASS,
  FORM_POPOVER_CLASS,
  formControlClassName,
} from "./form-control";

export type SearchableMultiSelectOption = {
  label: string;
  value: string;
  searchText?: string;
};

type SearchableMultiSelectProps = {
  ariaLabel: string;
  clearLabel: string;
  emptyLabel: string;
  options: SearchableMultiSelectOption[];
  placeholder: string;
  searchPlaceholder: string;
  selectAllLabel?: string;
  values: string[];
  onChange: (values: string[]) => void;
  className?: string;
  maxVisibleLabels?: number;
};

export function SearchableMultiSelect({
  ariaLabel,
  clearLabel,
  emptyLabel,
  options,
  placeholder,
  searchPlaceholder,
  selectAllLabel,
  values,
  onChange,
  className,
  maxVisibleLabels = 1,
}: SearchableMultiSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const listboxId = useId();
  const searchRef = useRef<HTMLInputElement | null>(null);
  const selected = useMemo(
    () => options.filter((option) => values.includes(option.value)),
    [options, values],
  );
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return options;
    return options.filter((option) =>
      `${option.label} ${option.searchText ?? ""}`
        .toLocaleLowerCase()
        .includes(normalized),
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setQuery("");
  };

  const visibleLabels = selected.slice(0, maxVisibleLabels);
  const remaining = Math.max(0, selected.length - visibleLabels.length);
  const allSelected = options.length > 0 && selected.length === options.length;
  const partiallySelected = selected.length > 0 && !allSelected;

  return (
    <Dropdown
      align="left"
      portal
      matchTriggerWidth
      offset={6}
      panelRole="listbox"
      panelId={listboxId}
      onOpenChange={handleOpenChange}
      className={cn("min-w-0", className)}
      panelClassName={cn(
        FORM_POPOVER_CLASS,
        "min-w-[300px] max-w-[340px] p-2.5",
      )}
      trigger={
        <button
          type="button"
          aria-label={ariaLabel}
          role="combobox"
          aria-controls={listboxId}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={formControlClassName({
            className:
              "flex min-w-0 items-center gap-2 px-4 text-left text-sm font-semibold",
            size: "compact",
          })}
        >
          <span className="min-w-0 flex-1 truncate">
            {visibleLabels.length > 0
              ? visibleLabels.map((option) => option.label).join(", ")
              : placeholder}
          </span>
          {remaining > 0 ? (
            <span className="shrink-0 rounded-full bg-primary-light px-2 py-0.5 text-[11px] text-primary-dark">
              +{remaining}
            </span>
          ) : null}
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
              open && "rotate-180 text-primary-dark",
            )}
          />
        </button>
      }
    >
      {() => (
        <div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              placeholder={searchPlaceholder}
              className={formControlClassName({
                className: "pl-10 pr-3 text-sm",
                size: "compact",
              })}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  document
                    .querySelector<HTMLElement>("[data-multiselect-option]")
                    ?.focus();
                }
              }}
            />
          </div>

          {selectAllLabel && options.length > 0 ? (
            <button
              type="button"
              className={cn(
                FORM_OPTION_CLASS,
                "mt-2 w-full gap-2 border border-border px-2.5 py-2 text-left text-sm font-semibold focus-visible:ring-2 focus-visible:ring-primary/20",
              )}
              onClick={() =>
                onChange(
                  allSelected ? [] : options.map((option) => option.value),
                )
              }
            >
              <span
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-md border",
                  allSelected || partiallySelected
                    ? "border-primary bg-primary text-white"
                    : "border-slate-300 bg-white",
                )}
              >
                {allSelected ? (
                  <Check className="h-3.5 w-3.5" />
                ) : partiallySelected ? (
                  <Minus className="h-3.5 w-3.5" />
                ) : null}
              </span>
              <span className="min-w-0 flex-1 truncate">{selectAllLabel}</span>
            </button>
          ) : null}

          <div className="mt-2 max-h-[340px] space-y-1 overflow-y-auto pr-0.5">
            {filtered.length > 0 ? (
              filtered.map((option, index) => {
                const active = values.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    data-multiselect-option
                    className={cn(
                      FORM_OPTION_CLASS,
                      "w-full gap-2 px-2.5 py-2 text-left text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20",
                      active
                        ? "bg-primary-light/70 text-primary-dark"
                        : "bg-white text-slate-700 hover:bg-primary-light/35 hover:text-primary-dark",
                    )}
                    onClick={() =>
                      onChange(
                        active
                          ? values.filter((value) => value !== option.value)
                          : [...values, option.value],
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key !== "ArrowDown" && event.key !== "ArrowUp")
                        return;
                      event.preventDefault();
                      const elements = Array.from(
                        document.querySelectorAll<HTMLElement>(
                          "[data-multiselect-option]",
                        ),
                      );
                      const nextIndex =
                        event.key === "ArrowDown"
                          ? Math.min(elements.length - 1, index + 1)
                          : Math.max(0, index - 1);
                      elements[nextIndex]?.focus();
                    }}
                  >
                    <span
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-md border",
                        active
                          ? "border-primary bg-primary text-white"
                          : "border-slate-300 bg-white",
                      )}
                    >
                      {active ? <Check className="h-3.5 w-3.5" /> : null}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {option.label}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-6 text-center text-sm text-text-muted">
                {emptyLabel}
              </p>
            )}
          </div>

          {values.length > 0 ? (
            <button
              type="button"
              className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[11px] border border-border bg-white text-xs font-semibold text-slate-600 transition-colors hover:border-primary/25 hover:bg-primary-light/35 hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              onClick={() => onChange([])}
            >
              <X className="h-3.5 w-3.5" />
              {clearLabel}
            </button>
          ) : null}
        </div>
      )}
    </Dropdown>
  );
}
