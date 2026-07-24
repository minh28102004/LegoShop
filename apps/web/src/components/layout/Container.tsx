"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn, type Size } from "@lego-shop/ui";

const containerVariants = cva("mx-auto w-full px-4 sm:px-6 lg:px-8", {
  variants: {
    size: {
      sm: "max-w-screen-sm",
      md: "max-w-screen-md",
      lg: "max-w-screen-lg",
      xl: "max-w-screen-2xl",
      narrow: "max-w-[960px] md:px-8 lg:px-10",
      default: "max-w-[1280px] md:px-8 lg:px-10",
      wide: "max-w-[1480px] px-5 sm:px-6 md:px-10 lg:px-16 2xl:px-[88px]",
      full: "max-w-none",
    },
  },
  defaultVariants: {
    size: "xl",
  },
});

export interface ContainerProps
  extends
    React.ComponentPropsWithoutRef<"div">,
    Omit<VariantProps<typeof containerVariants>, "size"> {
  size?:
    | Extract<Size, "sm" | "md" | "lg" | "xl">
    | "narrow"
    | "default"
    | "wide"
    | "full";
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(containerVariants({ size }), className)}
      {...props}
    />
  ),
);

Container.displayName = "Container";
