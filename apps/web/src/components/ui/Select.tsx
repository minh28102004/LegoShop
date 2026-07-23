"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronDown, LoaderCircle } from "lucide-react";

import { cn, type FieldState } from "@lego-shop/ui";
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
  "flex w-full items-center justify-between px-4 text-left text-sm font-medium data-[placeholder]:text-text-muted",
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
      React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
      "defaultValue" | "dir" | "onValueChange" | "value"
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
    const [uncontrolledValue, setUncontrolledValue] = React.useState(
      defaultValue ?? "",
    );
    const selectId = id ?? name ?? generatedId;
    const hintId = `${selectId}-hint`;
    const errorId = `${selectId}-error`;
    const describedBy = error ? errorId : hint ? hintId : undefined;
    const visualState = error || fieldState === "error" ? "error" : state;
    const selectedValue = value ?? uncontrolledValue;
    const selectedOption = options.find(
      (option) => option.value === selectedValue,
    );
    const rootProps: React.ComponentPropsWithoutRef<
      typeof SelectPrimitive.Root
    > = {};

    if (value !== undefined) rootProps.value = value;
    if (defaultValue !== undefined) rootProps.defaultValue = defaultValue;
    rootProps.onValueChange = (nextValue) => {
      if (value === undefined) setUncontrolledValue(nextValue);
      onValueChange?.(nextValue);
    };
    if (name !== undefined) rootProps.name = name;
    if (required !== undefined) rootProps.required = required;

    return (
      <div className={cn("w-full space-y-2", containerClassName)}>
        {label ? (
          <label htmlFor={selectId} className={FORM_LABEL_CLASS}>
            {label}
            {required ? <span className="text-error"> *</span> : null}
          </label>
        ) : null}
        <SelectPrimitive.Root {...rootProps}>
          <SelectPrimitive.Trigger
            ref={ref}
            id={selectId}
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
            <SelectPrimitive.Value placeholder={resolvedPlaceholder}>
              {selectedOption?.label}
            </SelectPrimitive.Value>
            <SelectPrimitive.Icon className="ml-2 text-text-muted">
              {loading ? (
                <LoaderCircle
                  className="size-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : (
                <ChevronDown className="size-4" aria-hidden="true" />
              )}
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              position="popper"
              sideOffset={6}
              className={cn(
                "z-z-popover",
                FORM_POPOVER_CLASS,
                contentClassName,
              )}
            >
              <SelectPrimitive.Viewport className="p-1">
                {options.map((option) => {
                  const itemProps: React.ComponentPropsWithoutRef<
                    typeof SelectPrimitive.Item
                  > = {
                    value: option.value,
                    className: cn(
                      FORM_OPTION_CLASS,
                      "relative cursor-pointer select-none px-3 py-2 pr-8 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                      itemClassName,
                    ),
                  };

                  if (option.disabled !== undefined) {
                    itemProps.disabled = option.disabled;
                  }

                  return (
                    <SelectPrimitive.Item key={option.value} {...itemProps}>
                      <SelectPrimitive.ItemText>
                        {option.label}
                      </SelectPrimitive.ItemText>
                      <SelectPrimitive.ItemIndicator className="absolute right-3 text-primary">
                        <Check className="size-4" aria-hidden="true" />
                      </SelectPrimitive.ItemIndicator>
                    </SelectPrimitive.Item>
                  );
                })}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
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
