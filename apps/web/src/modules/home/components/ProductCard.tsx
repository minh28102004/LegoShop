"use client";

import { ArrowRight, MessageCircle } from "lucide-react";
import { formatCurrency } from "@lego-shop/shared";

import { ProductImage } from "@/components/shared/ProductImage";
import { Tooltip } from "@/components/ui/Tooltip";
import type { ProductDetailDictionary } from "@/lib/i18n/dictionaries";
import type { HomeFeaturedProduct } from "@/modules/home/types/home.types";

type ProductCardProps = HomeFeaturedProduct & {
  detailLabels: ProductDetailDictionary;
  onConsult: (product: HomeFeaturedProduct) => void;
  onSelect: (product: HomeFeaturedProduct) => void;
};

export function ProductCard(props: ProductCardProps) {
  const {
    accessoryCount,
    basePrice,
    characterCount,
    detailLabels,
    imageUrl,
    includedItemLabels,
    onConsult,
    onSelect,
    orderCount,
    originalPrice,
    slug,
    title,
  } = props;
  const includedItems = (
    Array.isArray(includedItemLabels) ? includedItemLabels : []
  )
    .filter(Boolean)
    .slice(0, 3);
  const configurationSummary = `${characterCount} NV - ${accessoryCount} Charm`;
  const canOpenTemplate = Boolean(slug?.trim());
  const handleSelect = () => {
    if (!canOpenTemplate) return;
    onSelect(props);
  };

  return (
    <article className="group relative isolate flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[22px] border border-border/80 bg-white shadow-[0_8px_24px_-16px_rgba(16,35,63,0.28)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_20px_45px_-32px_rgba(16,35,63,0.38)] motion-reduce:transform-none">
      <button
        type="button"
        aria-label={`${detailLabels.chooseTemplate}: ${title}`}
        disabled={!canOpenTemplate}
        className="relative z-0 block w-full shrink-0 overflow-hidden rounded-t-[21px] bg-[#edf3f8] p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-80"
        onClick={handleSelect}
      >
        <span className="absolute left-3 top-3 z-20 rounded-full border border-white/80 bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-primary-dark shadow-sm backdrop-blur">
          {detailLabels.customBadge}
        </span>
        <ProductImage
          src={imageUrl}
          alt={title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, calc(100vw - 40px)"
          wrapperClassName="pointer-events-none aspect-[4/3] w-full rounded-none bg-[#edf3f8]"
          className="object-cover"
        />
      </button>

      <div className="flex flex-1 flex-col bg-white px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
        <button
          type="button"
          disabled={!canOpenTemplate}
          className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 disabled:cursor-not-allowed"
          onClick={handleSelect}
        >
          <h3 className="line-clamp-2 bg-transparent text-[18px] font-bold leading-[1.35] tracking-[-0.012em] text-navy sm:text-[19px]">
            {title}
          </h3>
        </button>

        <div className="mt-2 flex min-h-6 flex-wrap items-center gap-2.5">
          <p className="text-[12.5px] font-semibold text-text-muted">
            {orderCount.toLocaleString()} {detailLabels.orders}
          </p>
          {includedItems.length > 0 ? (
            <>
              <span aria-hidden="true" className="h-4 w-px bg-slate-200" />
              <span className="inline-flex max-w-full rounded-lg border border-primary/15 bg-primary-light/55 px-2.5 py-1 text-[10.5px] font-bold uppercase leading-4 text-primary-dark">
                <span className="truncate">+ {includedItems.join(", ")}</span>
              </span>
            </>
          ) : null}
        </div>

        <div className="mt-auto pt-4">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-text-muted">
            {detailLabels.basePrice}
          </p>
          <div className="mt-1 flex min-h-8 items-end justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="whitespace-nowrap text-[21px] font-bold leading-none text-navy">
                {formatCurrency(basePrice)}
              </span>
              {originalPrice !== null && originalPrice > basePrice ? (
                <span className="whitespace-nowrap text-[12px] font-medium text-text-muted line-through">
                  {formatCurrency(originalPrice)}
                </span>
              ) : null}
            </div>
            <span className="mb-0.5 shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
              {configurationSummary}
            </span>
          </div>

          <div className="mt-3.5 grid grid-cols-[minmax(0,1fr)_44px] gap-2.5">
            <button
              type="button"
              disabled={!canOpenTemplate}
              className="relative z-10 inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-[12px] bg-navy px-3 text-[12.5px] font-bold uppercase tracking-[0.055em] text-white transition-all duration-200 hover:-translate-y-px hover:bg-primary-dark hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 active:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:hover:translate-y-0 motion-reduce:transform-none"
              onClick={handleSelect}
            >
              <span className="truncate">{detailLabels.chooseTemplate}</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </button>
            <Tooltip content={detailLabels.consultation} position="top">
              <button
                type="button"
                aria-label={`${detailLabels.consultation}: ${title}`}
                className="grid h-10 w-11 place-items-center rounded-[12px] border border-primary/15 bg-primary-light/55 text-primary-dark transition-all duration-200 hover:-translate-y-px hover:border-primary/30 hover:bg-primary-light hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 active:translate-y-0 motion-reduce:transform-none"
                onClick={() => onConsult(props)}
              >
                <MessageCircle
                  className="h-[18px] w-[18px]"
                  strokeWidth={1.9}
                />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </article>
  );
}
