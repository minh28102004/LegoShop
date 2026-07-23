"use client";

import Image from "next/image";

import { Container } from "@/components/layout/Container";
import { BUSINESS_METRIC_ICONS } from "@/modules/business/data/business-page.data";
import type { BusinessMetricCopy } from "@/modules/business/types/business-page.types";
import { useI18n } from "@/lib/i18n/useI18n";

export function BusinessMetrics({ items }: { items: BusinessMetricCopy[] }) {
  const { dictionary } = useI18n();

  return (
    <section
      aria-label={dictionary.businessLegacy.metricsAriaLabel}
      className="bg-white py-5 sm:py-6"
    >
      <Container size="wide">
        <div className="grid grid-cols-2 overflow-hidden rounded-[24px] border border-[#dbe8f4] bg-white shadow-[0_16px_45px_-36px_rgba(7,29,58,0.4)] lg:grid-cols-4 lg:rounded-[28px]">
          {items.map((item, index) => (
            <article
              key={item.title}
              className="group relative isolate flex min-h-24 items-center gap-2.5 overflow-hidden border-b border-r border-[#e4edf5] px-3 py-4 after:pointer-events-none after:absolute after:inset-y-0 after:-left-1/2 after:w-1/3 after:skew-x-[-20deg] after:bg-gradient-to-r after:from-transparent after:via-white/70 after:to-transparent after:transition-transform after:duration-700 hover:after:translate-x-[470%] motion-reduce:after:hidden [&:nth-child(2n)]:border-r-0 [&:nth-child(n+3)]:border-b-0 sm:gap-3.5 sm:px-4 lg:border-b-0 lg:border-r lg:[&:nth-child(2)]:border-r lg:[&:nth-child(3)]:border-r lg:last:border-r-0"
            >
              <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef6ff] transition-transform duration-300 ease-out group-hover:scale-[1.08] motion-reduce:transition-none sm:size-12 sm:rounded-2xl">
                <Image src={BUSINESS_METRIC_ICONS[index] ?? BUSINESS_METRIC_ICONS[0]} alt="" width={34} height={34} className="size-7 object-contain sm:size-8" />
              </span>
              <span className="relative z-10">
                <strong className="block text-xs font-bold leading-5 text-[#071d3a] sm:text-sm">{item.title}</strong>
                <span className="mt-1 block text-xs leading-5 text-slate-500">{item.description}</span>
              </span>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
