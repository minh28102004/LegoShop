"use client";

import { cn } from "@lego-shop/ui";
import { Check, ChevronDown, Search } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  FORM_OPTION_CLASS,
  FORM_POPOVER_CLASS,
  formControlClassName,
} from "@/components/ui/form-control";

export type CheckoutSelectOption = {
  value: string;
  label: string;
};

type CheckoutSearchableSelectProps = {
  id: string;
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  options: CheckoutSelectOption[];
  value: string;
  disabled?: boolean | undefined;
  required?: boolean | undefined;
  error?: string | undefined;
  onChange: (value: string) => void;
  onBlur?: (() => void) | undefined;
};

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
}

export function CheckoutSearchableSelect({
  id,
  label,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  options,
  value,
  disabled = false,
  required = false,
  error,
  onChange,
  onBlur,
}: CheckoutSearchableSelectProps) {
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [panelPosition, setPanelPosition] = useState({
    left: 12,
    top: 12,
    width: 280,
  });

  const selectedOption = options.find((option) => option.value === value);
  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeSearch(query.trim());
    if (!normalizedQuery) return options;
    return options.filter((option) =>
      normalizeSearch(option.label).includes(normalizedQuery),
    );
  }, [options, query]);

  const close = useCallback(
    (restoreFocus = false, notifyBlur = true) => {
      setOpen(false);
      setQuery("");
      setActiveIndex(-1);
      if (notifyBlur) onBlur?.();
      if (restoreFocus) triggerRef.current?.focus();
    },
    [onBlur],
  );

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 12;
    const width = Math.min(
      rect.width,
      window.innerWidth - viewportPadding * 2,
    );
    const panelHeight = panelRef.current?.offsetHeight ?? 320;
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
    const openAbove = spaceBelow < 260 && rect.top > spaceBelow;
    const left = Math.min(
      Math.max(viewportPadding, rect.left),
      window.innerWidth - width - viewportPadding,
    );
    const top = openAbove
      ? Math.max(viewportPadding, rect.top - panelHeight - 8)
      : Math.min(
          rect.bottom + 8,
          window.innerHeight - panelHeight - viewportPadding,
        );
    setPanelPosition({ left, top: Math.max(viewportPadding, top), width });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      searchRef.current?.focus();
    });
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      close();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [close, open, updatePosition]);

  const choose = (nextValue: string) => {
    onChange(nextValue);
    // The parent clears the selected field's error in onChange. Calling its
    // blur validator here would still read the previous React state and put
    // the stale "required" error back on the control.
    close(true, false);
  };

  const describedBy = error ? `${id}-error` : undefined;
  const dropdown = open ? (
    <div
      ref={panelRef}
      style={panelPosition}
      className={cn(
        FORM_POPOVER_CLASS,
        "fixed z-[1400] box-border p-2",
      )}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={searchRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(-1);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) =>
                Math.min(index + 1, filteredOptions.length - 1),
              );
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(0, index - 1));
            } else if (event.key === "Enter" && filteredOptions[activeIndex]) {
              event.preventDefault();
              choose(filteredOptions[activeIndex].value);
            }
          }}
          role="combobox"
          aria-label={searchPlaceholder}
          aria-controls={listboxId}
          aria-expanded="true"
          aria-autocomplete="list"
          aria-activedescendant={
            filteredOptions[activeIndex]
              ? `${listboxId}-${activeIndex}`
              : undefined
          }
          placeholder={searchPlaceholder}
          className={formControlClassName({
            className: "pl-10 pr-3 text-sm",
            size: "compact",
          })}
        />
      </div>
      <div
        id={listboxId}
        role="listbox"
        className="mt-2 max-h-56 space-y-1 overflow-y-auto"
      >
        {filteredOptions.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-slate-500">
            {emptyLabel}
          </p>
        ) : (
          filteredOptions.map((option, index) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                id={`${listboxId}-${index}`}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(-1)}
                onClick={() => choose(option.value)}
                className={cn(
                  FORM_OPTION_CLASS,
                  `w-full gap-2 px-3 text-left text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20 ${
                    activeIndex === index
                      ? "bg-[#eff8fd] text-[#176b9f]"
                      : "text-slate-700 hover:bg-[#f6fbfe]"
                  }`,
                )}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {selected ? <Check className="h-4 w-4 shrink-0" /> : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={() => {
          if (open) close();
          else setOpen(true);
        }}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={formControlClassName({
          className:
            "flex items-center justify-between px-4 text-left text-sm font-medium",
          fieldState: error ? "error" : "default",
        })}
      >
        <span className={selectedOption ? "text-slate-900" : "text-slate-400"}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <p
        id={`${id}-error`}
        className={`min-h-5 pt-1 text-xs font-medium text-red-600 ${error ? "visible" : "invisible"}`}
      >
        {error ?? "–"}
      </p>
      {dropdown && typeof document !== "undefined"
        ? createPortal(dropdown, document.body)
        : null}
    </div>
  );
}
