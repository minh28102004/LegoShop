"use client";

import { DECORATIVE_ICON_PATHS } from "@/config/icons";
import { cn } from "@lego-shop/ui";
import { useI18n } from "@/lib/i18n/useI18n";
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
  const { dictionary } = useI18n();

  return (
    <div
      role="img"
      aria-label={dictionary.common.imageUpdatingLabel(label)}
      className="flex size-full flex-col items-center justify-center gap-2 bg-primary-light/55 px-3 text-center text-text-muted"
    >
      <DecorativeIcon
        src={DECORATIVE_ICON_PATHS.framedPicture}
        size={compact ? "sm" : "md"}
        className="opacity-75"
      />
      {!compact ? (
        <span className="max-w-40 text-xs font-medium">
          {dictionary.common.imageUpdating}
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
