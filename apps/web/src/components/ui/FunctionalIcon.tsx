import type { ComponentPropsWithoutRef } from "react";
import type { LucideIcon } from "lucide-react";

import { FUNCTIONAL_ICONS, type FunctionalIconName } from "@/config/icons";
import { cn } from "@lego-shop/ui";

const ICON_SIZES = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
} as const;

export interface FunctionalIconProps extends Omit<
  ComponentPropsWithoutRef<LucideIcon>,
  "name"
> {
  name: FunctionalIconName;
  size?: keyof typeof ICON_SIZES;
}

export function FunctionalIcon({
  className,
  name,
  size = "md",
  strokeWidth = 1.9,
  ...props
}: FunctionalIconProps) {
  const Icon = FUNCTIONAL_ICONS[name];

  return (
    <Icon
      aria-hidden="true"
      className={cn(ICON_SIZES[size], className)}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}
