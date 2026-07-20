"use client";

import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn, type Size } from "@lego-shop/ui";
import { Spinner } from "./Spinner";

const buttonVariants = cva(
  "group/button relative isolate inline-flex min-w-0 items-center justify-center gap-2 overflow-hidden rounded-button border border-transparent font-semibold no-underline shadow-control transition-all duration-normal ease-smooth hover:-translate-y-px active:translate-y-0 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-60 motion-reduce:transform-none motion-reduce:transition-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white hover:bg-primary-dark hover:shadow-card",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent-dark hover:shadow-card",
        secondary:
          "border-primary/30 bg-surface text-primary-dark hover:border-primary/50 hover:bg-primary-light",
        ghost:
          "bg-transparent text-text-primary shadow-none hover:bg-surface-soft hover:text-primary-dark",
        outline:
          "border-primary/30 bg-white text-primary-dark hover:border-primary/55 hover:bg-primary-light",
        destructive:
          "bg-destructive text-destructive-foreground hover:opacity-90",
      },
      size: {
        sm: "h-11 px-3.5 text-sm",
        md: "h-11 px-5 text-base",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>["variant"]
>;
export type ButtonSize = Extract<Size, "sm" | "md" | "lg" | "xl">;

export interface ButtonProps
  extends
    React.ComponentPropsWithoutRef<"button">,
    Omit<VariantProps<typeof buttonVariants>, "variant" | "size"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild = false,
      className,
      children,
      disabled,
      fullWidth = false,
      iconLeft,
      iconRight,
      isLoading = false,
      leftIcon,
      rightIcon,
      size,
      type = "button",
      variant,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || isLoading;
    const resolvedLeftIcon = iconLeft ?? leftIcon;
    const resolvedRightIcon = iconRight ?? rightIcon;

    return (
      <Comp
        ref={ref}
        className={cn(
          buttonVariants({ variant, size }),
          fullWidth && "w-full",
          className,
        )}
        disabled={asChild ? undefined : isDisabled}
        aria-busy={isLoading || undefined}
        aria-disabled={asChild && isDisabled ? true : undefined}
        type={asChild ? undefined : type}
        {...props}
      >
        {isLoading ? (
          <Spinner size="sm" />
        ) : resolvedLeftIcon ? (
          <span aria-hidden="true" className="inline-flex shrink-0">
            {resolvedLeftIcon}
          </span>
        ) : null}
        <Slottable>
          {isLoading ? <span>Đang xử lý...</span> : children}
        </Slottable>
        {!isLoading && resolvedRightIcon ? (
          <span aria-hidden="true" className="inline-flex shrink-0">
            {resolvedRightIcon}
          </span>
        ) : null}
      </Comp>
    );
  },
);

Button.displayName = "Button";
