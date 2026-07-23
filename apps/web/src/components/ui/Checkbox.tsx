"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { cn, type FieldState } from "@lego-shop/ui";
import {
  FORM_ERROR_CLASS,
  FORM_HINT_CLASS,
  FORM_LABEL_CLASS,
} from "./form-control";

export interface CheckboxProps extends Omit<
  React.ComponentPropsWithoutRef<"input">,
  "type"
> {
  label: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
  fieldState?: FieldState;
  containerClassName?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      containerClassName,
      description,
      error,
      fieldState,
      id,
      label,
      name,
      required,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const checkboxId = id ?? name ?? generatedId;
    const descriptionId = `${checkboxId}-description`;
    const errorId = `${checkboxId}-error`;
    const describedBy = error
      ? errorId
      : description
        ? descriptionId
        : undefined;
    const hasError = Boolean(error) || fieldState === "error";

    return (
      <div className={cn("space-y-2", containerClassName)}>
        <label
          htmlFor={checkboxId}
          className="grid min-h-11 cursor-pointer grid-cols-[auto_1fr] items-start gap-3 rounded-[var(--control-radius)]"
        >
          <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
            <input
              ref={ref}
              id={checkboxId}
              name={name}
              type="checkbox"
              required={required}
              aria-invalid={hasError}
              aria-describedby={describedBy}
              className={cn(
                "peer absolute inset-0 size-5 appearance-none rounded-[6px] border border-[hsl(var(--control-border))] bg-surface shadow-control transition-[border-color,background-color,box-shadow] duration-fast checked:border-primary checked:bg-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:bg-surface-soft disabled:opacity-60 motion-reduce:transition-none",
                hasError && "border-error focus-visible:border-error",
                className,
              )}
              {...props}
            />
            <Check
              className="pointer-events-none relative size-3.5 scale-75 text-white opacity-0 transition-[opacity,transform] duration-fast peer-checked:scale-100 peer-checked:opacity-100 motion-reduce:transition-none"
              strokeWidth={3}
              aria-hidden="true"
            />
          </span>
          <span className="space-y-1">
            <span className={FORM_LABEL_CLASS}>
              {label}
              {required ? <span className="text-error"> *</span> : null}
            </span>
            {description ? (
              <span id={descriptionId} className={cn("block", FORM_HINT_CLASS)}>
                {description}
              </span>
            ) : null}
          </span>
        </label>
        {error ? (
          <p id={errorId} className={FORM_ERROR_CLASS} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
