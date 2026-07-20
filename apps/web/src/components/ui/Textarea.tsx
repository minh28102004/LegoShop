"use client";

import * as React from "react";

import { cn, type FieldState } from "@lego-shop/ui";

export interface TextareaProps extends React.ComponentPropsWithoutRef<"textarea"> {
  label?: string;
  error?: string;
  hint?: string;
  showCount?: boolean;
  fieldState?: FieldState;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      error,
      fieldState,
      hint,
      id,
      label,
      maxLength,
      name,
      required,
      showCount = false,
      value,
      defaultValue,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const textareaId = id ?? name ?? generatedId;
    const hintId = `${textareaId}-hint`;
    const errorId = `${textareaId}-error`;
    const describedBy = error ? errorId : hint ? hintId : undefined;
    const hasError = Boolean(error) || fieldState === "error";
    const currentLength =
      typeof value === "string"
        ? value.length
        : typeof defaultValue === "string"
          ? defaultValue.length
          : 0;

    return (
      <div className="w-full space-y-2">
        {label ? (
          <label
            htmlFor={textareaId}
            className="block text-body-sm font-semibold text-text-primary"
          >
            {label}
            {required ? <span className="text-error"> *</span> : null}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          name={name}
          required={required}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          className={cn(
            "min-h-32 w-full resize-y rounded-input border border-input bg-surface px-3 py-3 text-body-md text-text-primary shadow-control transition-base placeholder:text-text-muted focus-visible:border-primary disabled:cursor-not-allowed disabled:bg-surface-soft disabled:opacity-60",
            hasError && "border-error focus-visible:border-error",
            className,
          )}
          {...props}
        />
        <div className="flex items-start justify-between gap-4">
          {error ? (
            <p id={errorId} className="text-body-sm text-error">
              {error}
            </p>
          ) : hint ? (
            <p id={hintId} className="text-body-sm text-text-muted">
              {hint}
            </p>
          ) : (
            <span />
          )}
          {showCount && maxLength !== undefined ? (
            <span className="shrink-0 text-body-sm text-text-muted">
              {currentLength}/{maxLength}
            </span>
          ) : null}
        </div>
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
