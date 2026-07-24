import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { ProductImage } from "@/components/shared/ProductImage";
import type {
  HomeCategory,
  HomeCategoryCardLabels,
} from "@/modules/home/types/home.types";

type CategoryCardProps = HomeCategory & {
  imagePosition: string;
  labels: HomeCategoryCardLabels;
};

export function CategoryCard({
  description,
  href,
  imageAlt,
  imagePosition,
  imageUrl,
  labels,
  title,
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group relative grid h-full grid-cols-1 overflow-hidden rounded-[22px] border border-border bg-white no-underline shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_20px_45px_-32px_rgba(16,35,63,0.38)] motion-reduce:transform-none md:h-[248px] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:h-[256px]"
    >
      <span className="absolute inset-x-0 top-0 z-20 h-1 origin-left scale-x-0 bg-gradient-to-r from-primary via-primary/70 to-primary-light transition-transform duration-500 group-hover:scale-x-100 motion-reduce:transition-none" />
      <div className="relative aspect-[16/10] size-full min-w-0 overflow-hidden bg-surface-soft md:aspect-auto">
        <ProductImage
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(min-width: 1280px) 16vw, (min-width: 768px) 25vw, 100vw"
          style={{ objectPosition: imagePosition }}
          wrapperClassName="absolute inset-0 size-full bg-surface-soft"
          className="object-cover transition-transform duration-[400ms] ease-out will-change-transform group-hover:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
        />
      </div>
      <div className="flex min-w-0 flex-col justify-center p-4 sm:p-5">
        <p className="text-[13px] font-semibold uppercase leading-[1.45] tracking-[0.07em] text-primary">
          {labels.occasion}
        </p>
        <h3 className="mt-2 text-[18px] font-semibold leading-[1.35] tracking-[-0.008em] text-navy sm:text-[19px]">
          {title}
        </h3>
        <p className="mt-2 line-clamp-3 text-[14.5px] leading-[1.6] text-text-secondary sm:text-[15px]">
          {description ?? labels.fallbackDescription}
        </p>
        <span className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary-dark">
          {labels.explore}
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-light transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none" />
          </span>
        </span>
      </div>
    </Link>
  );
}
