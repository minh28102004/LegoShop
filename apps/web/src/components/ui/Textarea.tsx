"use client";

import * as React from "react";

import { cn, type FieldState } from "@lego-shop/ui";
import {
  FORM_ERROR_CLASS,
  FORM_HINT_CLASS,
  FORM_LABEL_CLASS,
  formControlClassName,
} from "./form-control";

export interface TextareaProps extends React.ComponentPropsWithoutRef<"textarea"> {
  label?: string | undefined;
  error?: string | undefined;
  hint?: string | undefined;
  showCount?: boolean;
  fieldState?: FieldState | undefined;
  containerClassName?: string | undefined;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      containerClassName,
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
      <div className={cn("w-full space-y-2", containerClassName)}>
        {label ? (
          <label htmlFor={textareaId} className={FORM_LABEL_CLASS}>
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
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={formControlClassName({
            className: cn("resize-y px-4 py-3 text-sm leading-6", className),
            fieldState: hasError ? "error" : fieldState,
          })}
          {...props}
        />
        {error || hint || (showCount && maxLength !== undefined) ? (
          <div className="flex items-start justify-between gap-4">
            {error ? (
              <p id={errorId} className={FORM_ERROR_CLASS} role="alert">
                {error}
              </p>
            ) : hint ? (
              <p id={hintId} className={FORM_HINT_CLASS}>
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
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
