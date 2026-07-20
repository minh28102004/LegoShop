"use client";

import { DECORATIVE_ICON_PATHS } from "@/config/icons";
import { cn } from "@lego-shop/ui";
import { DecorativeIcon } from "./FeatureIcon";
import { LazyImage, type LazyImageProps } from "./LazyImage";

export interface ProductImageProps extends Omit<
  LazyImageProps,
  "fallbackIcon" | "src"
> {
  src?: string | null;
  compactFallback?: boolean;
}

function ProductImageFallback({
  compact,
  label,
}: {
  compact: boolean;
  label: string;
}) {
  return (
    <div
      role="img"
      aria-label={`Ảnh ${label} đang được cập nhật`}
      className="flex size-full flex-col items-center justify-center gap-2 bg-primary-light/55 px-3 text-center text-text-muted"
    >
      <DecorativeIcon
        src={DECORATIVE_ICON_PATHS.framedPicture}
        size={compact ? "sm" : "md"}
        className="opacity-75"
      />
      {!compact ? (
        <span className="max-w-40 text-xs font-medium">
          Hình ảnh đang được cập nhật
        </span>
      ) : null}
    </div>
  );
}

export function ProductImage({
  alt,
  className,
  compactFallback = false,
  src,
  wrapperClassName,
  ...props
}: ProductImageProps) {
  const fallback = (
    <ProductImageFallback compact={compactFallback} label={alt} />
  );

  if (!src) {
    return (
      <div
        className={cn("relative overflow-hidden bg-surface", wrapperClassName)}
      >
        {fallback}
      </div>
    );
  }

  return (
    <LazyImage
      src={src}
      alt={alt}
      fallbackIcon={fallback}
      {...props}
      {...(wrapperClassName !== undefined ? { wrapperClassName } : {})}
      {...(className !== undefined ? { className } : {})}
    />
  );
}
