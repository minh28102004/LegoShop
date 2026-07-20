"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X } from "lucide-react";

type MultiSelectOption = {
  value: string;
  label: string;
};

type StudioSearchableMultiSelectProps = {
  label: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  searchPlaceholder: string;
  emptyLabel: string;
  clearLabel: string;
};

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
}

export function StudioSearchableMultiSelect({
  label,
  options,
  value,
  onChange,
  searchPlaceholder,
  emptyLabel,
  clearLabel,
}: StudioSearchableMultiSelectProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [panelPosition, setPanelPosition] = useState({
    left: 0,
    top: 0,
    width: 280,
  });

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const updatePanelPosition = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    const viewportPadding = 12;
    const width = Math.min(
      Math.max(rect.width, 280),
      window.innerWidth - viewportPadding * 2,
    );
    const panelHeight = panelRef.current?.offsetHeight ?? 320;
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
    const openAbove = spaceBelow < Math.min(panelHeight, 280) && rect.top > spaceBelow;
    const left = Math.min(
      Math.max(viewportPadding, rect.left),
      window.innerWidth - width - viewportPadding,
    );
    const top = openAbove
      ? Math.max(viewportPadding, rect.top - panelHeight - 8)
      : Math.min(rect.bottom + 8, window.innerHeight - panelHeight - viewportPadding);

    setPanelPosition({ left, top: Math.max(viewportPadding, top), width });
  }, []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      close();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      close();
      triggerRef.current?.focus();
    };

    updatePanelPosition();
    const animationFrame = requestAnimationFrame(() => {
      updatePanelPosition();
      searchRef.current?.focus();
    });

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(animationFrame);
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, open, updatePanelPosition]);

  const selectedOptions = useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query.trim());
    if (!normalizedQuery) return options;

    return options.filter((option) =>
      normalizeSearchValue(option.label).includes(normalizedQuery),
    );
  }, [options, query]);

  const toggleOption = (optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue],
    );
  };

  const openDropdown = () => {
    setOpen(true);
  };

  const dropdown = open ? (
    <div
      ref={panelRef}
      style={panelPosition}
      className="fixed z-[140] rounded-[20px] border border-[#dbe7f1] bg-white p-2 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1 motion-safe:duration-200"
    >
      <div className="flex h-11 items-center gap-2 rounded-xl bg-[#f6faff] px-3">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          ref={searchRef}
          role="combobox"
          aria-controls={listboxId}
          aria-expanded={open}
          aria-autocomplete="list"
          aria-activedescendant={
            filteredOptions[activeIndex]
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) =>
                Math.min(index + 1, filteredOptions.length - 1),
              );
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(0, index - 1));
            }
            if (event.key === "Enter" && filteredOptions[activeIndex]) {
              event.preventDefault();
              toggleOption(filteredOptions[activeIndex].value);
            }
            if (event.key === "Backspace" && !query && value.length > 0) {
              onChange(value.slice(0, -1));
            }
          }}
          placeholder={searchPlaceholder}
          className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm leading-none outline-none ring-0 placeholder:text-slate-400 focus:outline-none focus:ring-0"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label={clearLabel}
            className="grid h-7 w-7 place-items-center rounded-full text-slate-400 outline-none transition-colors hover:bg-white hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-[#80c4e9]/70"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <div
        id={listboxId}
        role="listbox"
        aria-multiselectable="true"
        className="mt-2 max-h-56 space-y-1 overflow-y-auto pr-1 scrollbar-hide"
      >
        {filteredOptions.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs font-medium text-slate-500">
            {emptyLabel}
          </p>
        ) : (
          filteredOptions.map((option, index) => {
            const selected = value.includes(option.value);
            return (
              <button
                key={option.value}
                id={`${listboxId}-option-${index}`}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => toggleOption(option.value)}
                className={`flex min-h-10 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#80c4e9]/70 ${
                  index === activeIndex
                    ? "bg-[#f1f8fd] text-[#176b9f]"
                    : "text-slate-700 hover:bg-[#f8fbff]"
                }`}
              >
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
                    selected
                      ? "border-[#2f91d0] bg-[#2f91d0] text-white"
                      : "border-slate-300 bg-white text-transparent"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
              </button>
            );
          })
        )}
      </div>

      {value.length > 0 ? (
        <button
          type="button"
          onClick={() => onChange([])}
          className="mt-2 h-9 w-full rounded-xl text-xs font-semibold text-slate-500 outline-none transition-colors hover:bg-slate-50 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-[#80c4e9]/70"
        >
          {clearLabel}
        </button>
      ) : null}
    </div>
  ) : null;

  return (
    <div ref={rootRef} className="relative">
      <div className="flex h-11 w-full items-center gap-1.5 rounded-2xl border border-[#dbe7f1] bg-white px-2.5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-[#b9d8ed] focus-within:border-[#9ed0ef] focus-within:ring-2 focus-within:ring-[#9ed0ef]/40">
        {selectedOptions.slice(0, 2).map((option) => (
          <button
            key={option.value}
            type="button"
            aria-label={`${clearLabel}: ${option.label}`}
            onClick={() => toggleOption(option.value)}
            className="group/chip flex h-7 max-w-[112px] shrink-0 items-center gap-1 rounded-lg bg-[#eaf6fd] pl-2 pr-1.5 text-xs font-semibold text-[#227eb8] outline-none transition-colors hover:bg-[#dceffa] focus-visible:ring-2 focus-visible:ring-[#80c4e9]/70"
          >
            <span className="truncate">{option.label}</span>
            <X className="h-3 w-3 shrink-0 opacity-60 transition-opacity group-hover/chip:opacity-100" />
          </button>
        ))}

        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-expanded={open}
          onClick={() => (open ? close() : openDropdown())}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && value.length > 0) {
              event.preventDefault();
              onChange(value.slice(0, -1));
            }
          }}
          className="h-full min-w-[20px] flex-1 truncate text-left outline-none"
        >
          {selectedOptions.length === 0 ? label : ""}
          {selectedOptions.length > 0 ? (
            <span className="sr-only">{label}</span>
          ) : null}
        </button>

        {selectedOptions.length > 2 ? (
          <span className="rounded-full bg-[#eaf6fd] px-2 py-0.5 text-[11px] font-semibold text-[#227eb8]">
            +{selectedOptions.length - 2}
          </span>
        ) : null}

        <button
          type="button"
          aria-label={label}
          aria-controls={listboxId}
          aria-expanded={open}
          onClick={() => (open ? close() : openDropdown())}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 outline-none transition-colors hover:bg-[#f1f8fd] hover:text-[#227eb8] focus-visible:ring-2 focus-visible:ring-[#80c4e9]/70"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {dropdown && typeof document !== "undefined"
        ? createPortal(dropdown, document.body)
        : null}
    </div>
  );
}
