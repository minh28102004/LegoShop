import Image from "next/image";

import { Container } from "@/components/layout/Container";
import { BUSINESS_METRIC_ICONS } from "@/modules/business/data/business-page.data";
import type { BusinessMetricCopy } from "@/modules/business/types/business-page.types";

export function BusinessMetrics({ items }: { items: BusinessMetricCopy[] }) {
  return (
    <section aria-label="Business service metrics" className="bg-white py-6 sm:py-8">
      <Container size="wide">
        <div className="grid overflow-hidden rounded-[28px] border border-[#dbe8f4] bg-white shadow-[0_16px_45px_-36px_rgba(7,29,58,0.4)] sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <article
              key={item.title}
              className="group relative isolate flex min-h-36 items-center gap-4 overflow-hidden border-b border-[#e4edf5] px-5 py-6 last:border-b-0 after:pointer-events-none after:absolute after:inset-y-0 after:-left-1/2 after:w-1/3 after:skew-x-[-20deg] after:bg-gradient-to-r after:from-transparent after:via-white/70 after:to-transparent after:transition-transform after:duration-700 hover:after:translate-x-[470%] motion-reduce:after:hidden sm:border-r sm:[&:nth-child(2)]:border-r-0 sm:[&:nth-child(n+3)]:border-b-0 lg:border-b-0 lg:[&:nth-child(2)]:border-r lg:last:border-r-0"
            >
              <span className="relative z-10 flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#eef6ff] transition-transform duration-300 ease-out group-hover:scale-[1.08] motion-reduce:transition-none">
                <Image src={BUSINESS_METRIC_ICONS[index] ?? BUSINESS_METRIC_ICONS[0]} alt="" width={44} height={44} className="size-11 object-contain" />
              </span>
              <span className="relative z-10">
                <strong className="block text-base font-bold text-[#071d3a]">{item.title}</strong>
                <span className="mt-1 block text-sm leading-6 text-slate-500">{item.description}</span>
              </span>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
