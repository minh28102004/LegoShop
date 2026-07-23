"use client";

import * as React from "react";
import { LoaderCircle, X } from "lucide-react";

import { cn, type FieldState } from "@lego-shop/ui";
import {
  FORM_ERROR_CLASS,
  FORM_HINT_CLASS,
  FORM_LABEL_CLASS,
  formControlClassName,
  type ControlSize,
} from "./form-control";

export interface InputProps extends Omit<
  React.ComponentPropsWithoutRef<"input">,
  "size"
> {
  label?: string | undefined;
  error?: string | undefined;
  hint?: string | undefined;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fieldState?: FieldState | undefined;
  containerClassName?: string | undefined;
  controlSize?: ControlSize | undefined;
  clearable?: boolean;
  clearLabel?: string | undefined;
  onClear?: (() => void) | undefined;
  loading?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      controlSize = "default",
      clearable = false,
      clearLabel = "Clear",
      error,
      hint,
      id,
      label,
      leftIcon,
      loading = false,
      name,
      required,
      rightIcon,
      fieldState,
      onClear,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? name ?? generatedId;
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;
    const describedBy = error ? errorId : hint ? hintId : undefined;
    const hasError = Boolean(error) || fieldState === "error";
    const hasValue =
      props.value !== undefined &&
      props.value !== null &&
      String(props.value).length > 0;
    const showClear = !loading && clearable && hasValue && Boolean(onClear);

    return (
      <div className={cn("w-full space-y-2", containerClassName)}>
        {label ? (
          <label htmlFor={inputId} className={FORM_LABEL_CLASS}>
            {label}
            {required ? <span className="text-error"> *</span> : null}
          </label>
        ) : null}
        <div className="relative">
          {leftIcon ? (
            <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-text-muted">
              {leftIcon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            name={name}
            required={required}
            aria-invalid={hasError || undefined}
            aria-busy={loading || undefined}
            aria-describedby={describedBy}
            className={formControlClassName({
              className: cn(
                "px-4 text-sm font-medium",
                leftIcon && "pl-11",
                (rightIcon || showClear || loading) && "pr-11",
                className,
              ),
              fieldState: hasError ? "error" : fieldState,
              size: controlSize,
            })}
            {...props}
          />
          {loading ? (
            <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 text-primary">
              <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
            </span>
          ) : showClear ? (
            <button
              type="button"
              aria-label={clearLabel}
              className="absolute right-2 top-1/2 grid min-h-8 min-w-8 -translate-y-1/2 place-items-center rounded-[10px] text-text-muted transition-colors hover:bg-primary-light hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
              onClick={onClear}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : rightIcon ? (
            <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 text-text-muted">
              {rightIcon}
            </span>
          ) : null}
        </div>
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

Input.displayName = "Input";
