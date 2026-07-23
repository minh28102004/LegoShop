"use client";

import * as React from "react";

import { cn, type FieldState } from "@lego-shop/ui";
import {
  FORM_ERROR_CLASS,
  FORM_HINT_CLASS,
  FORM_LABEL_CLASS,
} from "./form-control";

export interface RadioProps extends Omit<
  React.ComponentPropsWithoutRef<"input">,
  "type"
> {
  label: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
  fieldState?: FieldState;
  containerClassName?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
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
    const radioId = id ?? `${name ?? "radio"}-${generatedId}`;
    const descriptionId = `${radioId}-description`;
    const errorId = `${radioId}-error`;
    const hasError = Boolean(error) || fieldState === "error";

    return (
      <div className={cn("space-y-2", containerClassName)}>
        <label
          htmlFor={radioId}
          className="grid min-h-11 cursor-pointer grid-cols-[auto_1fr] items-start gap-3 rounded-[var(--control-radius)] focus-within:ring-2 focus-within:ring-primary/20"
        >
          <input
            ref={ref}
            id={radioId}
            name={name}
            type="radio"
            required={required}
            aria-describedby={
              error ? errorId : description ? descriptionId : undefined
            }
            className={cn(
              "mt-0.5 size-5 appearance-none rounded-full border border-[hsl(var(--control-border))] bg-white shadow-control transition checked:border-[5px] checked:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-surface-soft disabled:opacity-60",
              hasError && "border-error",
              className,
            )}
            {...props}
          />
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

Radio.displayName = "Radio";
