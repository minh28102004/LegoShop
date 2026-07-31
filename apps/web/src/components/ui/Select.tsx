"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronDown, LoaderCircle } from "lucide-react";

import { cn, Dropdown, type FieldState } from "@lego-shop/ui";
import { useI18n } from "@/lib/i18n/useI18n";
import {
  FORM_ERROR_CLASS,
  FORM_HINT_CLASS,
  FORM_LABEL_CLASS,
  FORM_OPTION_CLASS,
  FORM_POPOVER_CLASS,
  formControlClassName,
  type ControlSize,
} from "./form-control";

const selectTriggerVariants = cva(
  "group flex w-full items-center justify-between px-4 text-left text-sm font-semibold data-[placeholder]:text-text-muted",
  {
    variants: {
      state: {
        default: "",
        error: "border-error focus-visible:border-error",
      },
    },
    defaultVariants: {
      state: "default",
    },
  },
);

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends
    Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      "defaultValue" | "name" | "onChange" | "value"
    >,
    VariantProps<typeof selectTriggerVariants> {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  hint?: string;
  name?: string;
  required?: boolean;
  fieldState?: FieldState;
  contentClassName?: string;
  optionsClassName?: string;
  itemClassName?: string;
  controlSize?: ControlSize;
  containerClassName?: string;
  loading?: boolean;
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      contentClassName,
      containerClassName,
      controlSize = "default",
      defaultValue,
      disabled,
      error,
      fieldState,
      hint,
      id,
      label,
      loading = false,
      itemClassName,
      name,
      onValueChange,
      optionsClassName,
      options,
      placeholder,
      required,
      state,
      value,
      ...props
    },
    ref,
  ) => {
    const { dictionary } = useI18n();
    const resolvedPlaceholder =
      placeholder ?? dictionary.common.selectPlaceholder;
    const generatedId = React.useId();
    const generatedListboxId = React.useId();
    const [open, setOpen] = React.useState(false);
    const [uncontrolledValue, setUncontrolledValue] = React.useState(
      defaultValue ?? "",
    );
    const selectId = id ?? name ?? generatedId;
    const hintId = `${selectId}-hint`;
    const errorId = `${selectId}-error`;
    const describedBy = error ? errorId : hint ? hintId : undefined;
    const listboxId = `${selectId}-${generatedListboxId}-listbox`;
    const visualState = error || fieldState === "error" ? "error" : state;
    const selectedValue = value ?? uncontrolledValue;
    const selectedOption = options.find(
      (option) => option.value === selectedValue,
    );
    const triggerRef = React.useRef<HTMLButtonElement | null>(null);

    React.useImperativeHandle(ref, () => triggerRef.current!, []);

    React.useEffect(() => {
      if (!open) return;

      const frame = window.requestAnimationFrame(() => {
        const listbox = document.getElementById(listboxId);
        const selectedItem =
          listbox?.querySelector<HTMLElement>(
            '[data-select-option][aria-selected="true"]',
          ) ??
          listbox?.querySelector<HTMLElement>(
            "[data-select-option]:not([aria-disabled='true'])",
          );

        selectedItem?.focus({ preventScroll: true });
      });

      return () => window.cancelAnimationFrame(frame);
    }, [listboxId, open]);

    const handleValueChange = (nextValue: string) => {
      if (value === undefined) setUncontrolledValue(nextValue);
      onValueChange?.(nextValue);
    };

    const focusSiblingOption = (
      currentTarget: HTMLElement,
      direction: 1 | -1,
    ) => {
      const listbox = document.getElementById(listboxId);
      const items = Array.from(
        listbox?.querySelectorAll<HTMLElement>(
          "[data-select-option]:not([aria-disabled='true'])",
        ) ?? [],
      );
      const currentIndex = items.indexOf(currentTarget);
      const nextIndex =
        currentIndex < 0
          ? 0
          : (currentIndex + direction + items.length) % items.length;

      items[nextIndex]?.focus({ preventScroll: true });
    };

    return (
      <div className={cn("w-full space-y-2", containerClassName)}>
        {label ? (
          <label htmlFor={selectId} className={FORM_LABEL_CLASS}>
            {label}
            {required ? <span className="text-error"> *</span> : null}
          </label>
        ) : null}
        <Dropdown
          align="left"
          portal
          matchTriggerWidth
          offset={6}
          panelRole="listbox"
          panelId={listboxId}
          onOpenChange={setOpen}
          className="w-full"
          panelClassName={cn(
            FORM_POPOVER_CLASS,
            "w-full min-w-0 max-w-none p-2 !animate-none",
            contentClassName,
          )}
          trigger={
            <button
              ref={triggerRef}
              id={selectId}
              type="button"
              role="combobox"
              aria-controls={listboxId}
              aria-expanded={open}
              aria-haspopup="listbox"
              aria-invalid={visualState === "error" || undefined}
              aria-busy={loading || undefined}
              aria-describedby={describedBy}
              disabled={loading || disabled}
              className={formControlClassName({
                className: cn(
                  selectTriggerVariants({ state: visualState }),
                  className,
                ),
                fieldState: visualState === "error" ? "error" : fieldState,
                size: controlSize,
              })}
              {...props}
            >
              <span
                className={cn(
                  "min-w-0 flex-1 truncate",
                  !selectedOption && "text-text-muted",
                )}
              >
                {selectedOption?.label ?? resolvedPlaceholder}
              </span>
              <span className="ml-2 shrink-0 text-text-muted transition-colors duration-200 group-data-[state=open]:text-primary-dark">
                {loading ? (
                  <LoaderCircle
                    className="size-4 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                ) : (
                  <ChevronDown
                    className={cn(
                      "size-4 transition-transform duration-200 ease-out motion-reduce:transition-none",
                      open && "rotate-180 text-primary-dark",
                    )}
                    aria-hidden="true"
                  />
                )}
              </span>
            </button>
          }
        >
          {({ close }) => (
            <div className={cn("space-y-0.5", optionsClassName)}>
              {options.map((option) => {
                const active = option.value === selectedValue;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    data-select-option
                    aria-selected={active}
                    aria-disabled={option.disabled || undefined}
                    disabled={option.disabled}
                    className={cn(
                      FORM_OPTION_CLASS,
                      "relative min-h-9 w-full cursor-pointer select-none px-2.5 py-1.5 pr-9 text-left text-sm font-semibold outline-none transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50",
                      active && "bg-primary-light font-bold text-primary-dark",
                      itemClassName,
                    )}
                    onClick={() => {
                      if (option.disabled) return;
                      handleValueChange(option.value);
                      close();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        focusSiblingOption(event.currentTarget, 1);
                      } else if (event.key === "ArrowUp") {
                        event.preventDefault();
                        focusSiblingOption(event.currentTarget, -1);
                      } else if (event.key === "Home") {
                        event.preventDefault();
                        document
                          .getElementById(listboxId)
                          ?.querySelector<HTMLElement>(
                            "[data-select-option]:not([aria-disabled='true'])",
                          )
                          ?.focus({ preventScroll: true });
                      } else if (event.key === "End") {
                        event.preventDefault();
                        const items = document
                          .getElementById(listboxId)
                          ?.querySelectorAll<HTMLElement>(
                            "[data-select-option]:not([aria-disabled='true'])",
                          );
                        items?.[items.length - 1]?.focus({
                          preventScroll: true,
                        });
                      }
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {option.label}
                    </span>
                    {active ? (
                      <span className="absolute right-2 grid size-6 place-items-center rounded-full bg-primary-light text-primary-dark">
                        <Check
                          className="size-3.5 stroke-[2.5]"
                          aria-hidden="true"
                        />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </Dropdown>
        {name ? (
          <input
            type="hidden"
            name={name}
            value={selectedValue}
            required={required}
          />
        ) : null}
        {error ? (
          <p id={errorId} className={FORM_ERROR_CLASS} role="alert">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className={FORM_HINT_CLASS}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = "Select";
