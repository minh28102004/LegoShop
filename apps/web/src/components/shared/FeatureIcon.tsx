import Image from "next/image";

import { cn } from "@lego-shop/ui";

const ICON_SIZES = {
  sm: 32,
  md: 40,
  lg: 52,
  xl: 68,
} as const;

type IconSize = keyof typeof ICON_SIZES;

type FeatureIconBaseProps = {
  className?: string;
  priority?: boolean;
  size?: IconSize;
  src: string;
};

type FeatureIconProps = FeatureIconBaseProps &
  (
    | {
        alt: string;
        decorative?: false;
      }
    | {
        alt?: never;
        decorative: true;
      }
  );

export function FeatureIcon({
  alt,
  className,
  decorative = false,
  priority = false,
  size = "md",
  src,
}: FeatureIconProps) {
  const dimension = ICON_SIZES[size];

  return (
    <Image
      src={src}
      alt={decorative ? "" : (alt ?? "")}
      aria-hidden={decorative || undefined}
      width={dimension}
      height={dimension}
      sizes={`${dimension}px`}
      priority={priority}
      className={cn("h-auto w-auto max-w-none shrink-0 object-contain", className)}
    />
  );
}

export type DecorativeIconProps = FeatureIconBaseProps;

export function DecorativeIcon(props: DecorativeIconProps) {
  return <FeatureIcon {...props} decorative />;
}
