import { ImageOff } from "lucide-react";
import Image from "next/image";

import { cn } from "@lego-shop/ui";

import type {
  HomeMediaAsset,
  HomeMediaLabels,
} from "@/modules/home/types/home.types";

type FramedGiftVisualProps = {
  visual: HomeMediaAsset | null;
  className?: string;
  compact?: boolean;
  priority?: boolean;
  sizes?: string;
  aspect?: "landscape" | "square" | "portrait";
  fit?: "contain" | "cover";
  labels: HomeMediaLabels;
};

export function FramedGiftVisual({
  aspect = "landscape",
  className,
  compact = false,
  fit = "contain",
  labels,
  priority = false,
  sizes = "(max-width: 768px) calc(100vw - 32px), 46vw",
  visual,
}: FramedGiftVisualProps) {
  return (
    <div
      className={cn(
        "group/gift relative mx-auto w-full max-w-[720px]",
        compact ? "" : "py-2",
        className,
      )}
    >
      <span className="absolute left-[2%] top-[2%] h-[38%] w-[42%] rounded-full bg-primary-light/75 blur-3xl" />
      <span className="absolute bottom-[1%] right-[3%] h-[36%] w-[40%] rounded-full bg-accent/15 blur-3xl" />

      <div className="relative rounded-[26px] bg-[#17283d] p-2.5 shadow-[0_28px_64px_-44px_rgba(16,35,63,0.48)] transition-transform duration-500 ease-out group-hover/gift:-translate-y-1 motion-reduce:transform-none sm:p-3">
        <div className="rounded-[19px] bg-[#f7f4ed] p-1.5 sm:p-2">
          <div
            className={cn(
              "relative overflow-hidden rounded-[12px] bg-white",
              aspect === "square"
                ? "aspect-square"
                : aspect === "portrait"
                  ? "aspect-[4/5]"
                  : "aspect-[4/3]",
            )}
          >
            {visual ? (
              <>
                <Image
                  src={visual.src}
                  alt={visual.alt}
                  fill
                  priority={priority}
                  quality={75}
                  sizes={sizes}
                  className={cn(
                    "object-center",
                    fit === "cover" ? "object-cover" : "object-contain p-1.5",
                  )}
                />
                {visual.source === "development-fallback" ? (
                  <span className="absolute right-2 top-2 z-10 rounded-full border border-border/70 bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-muted shadow-sm">
                    {labels.developmentBadge}
                  </span>
                ) : null}
              </>
            ) : (
              <div
                role="img"
                aria-label={labels.unavailableLabel}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[linear-gradient(145deg,#eef7fd_0%,#ffffff_100%)] px-5 text-center text-muted"
              >
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-[18px] bg-white text-primary shadow-sm">
                  <ImageOff className="h-6 w-6" strokeWidth={1.7} />
                </span>
                <span className="max-w-[220px] text-[13px] font-semibold leading-5 sm:text-[14px]">
                  {labels.unavailableText}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
