"use client";

import * as React from "react";

import { cn } from "@lego-shop/ui";
import { Button, type ButtonProps } from "./Button";
import { Tooltip } from "./Tooltip";

export interface IconButtonProps extends Omit<
  ButtonProps,
  "children" | "iconLeft" | "iconRight" | "leftIcon" | "rightIcon"
> {
  icon: React.ReactNode;
  label: string;
  showTooltip?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      icon,
      label,
      showTooltip = true,
      size = "md",
      variant = "ghost",
      ...props
    },
    ref,
  ) => {
    const control = (
      <Button
        ref={ref}
        aria-label={label}
        className={cn(
          "shrink-0 p-0",
          size === "sm" && "size-11",
          size === "md" && "size-11",
          size === "lg" && "size-12",
          size === "xl" && "size-14",
          className,
        )}
        size={size}
        variant={variant}
        {...props}
      >
        <span aria-hidden="true" className="inline-flex">
          {icon}
        </span>
      </Button>
    );

    return showTooltip ? <Tooltip content={label}>{control}</Tooltip> : control;
  },
);

IconButton.displayName = "IconButton";
