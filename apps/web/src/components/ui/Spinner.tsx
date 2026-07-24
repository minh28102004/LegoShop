"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn, type Size } from "@lego-shop/ui";
import { useI18n } from "@/lib/i18n/useI18n";

const spinnerVariants = cva(
  "inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent",
  {
    variants: {
      size: {
        sm: "size-4",
        md: "size-5",
        lg: "size-6",
      },
      color: {
        inherit: "text-current",
        primary: "text-primary",
        muted: "text-text-muted",
        inverse: "text-text-inverse",
      },
    },
    defaultVariants: {
      size: "md",
      color: "inherit",
    },
  },
);

export interface SpinnerProps
  extends
    Omit<React.ComponentPropsWithoutRef<"span">, "color">,
    Omit<VariantProps<typeof spinnerVariants>, "size"> {
  size?: Extract<Size, "sm" | "md" | "lg">;
  color?: "inherit" | "primary" | "muted" | "inverse";
}

export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ className, size, color, role = "status", ...props }, ref) => {
    const { dictionary } = useI18n();

    return (
      <span
        ref={ref}
        role={role}
        aria-label={dictionary.common.loading}
        className={cn(spinnerVariants({ size, color }), className)}
        {...props}
      />
    );
  },
);

Spinner.displayName = "Spinner";
