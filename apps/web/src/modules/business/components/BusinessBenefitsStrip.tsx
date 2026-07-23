import Image from "next/image";

import { Container } from "@/components/layout/Container";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import type { BusinessCompactCopy } from "@/modules/business/types/business-page.types";

export function BusinessBenefitsStrip({
  copy,
}: {
  copy: BusinessCompactCopy["benefits"];
}) {
  return (
    <section
      id="business-benefits"
      className="relative isolate overflow-hidden border-t border-[#e8f0f5] bg-[linear-gradient(180deg,#ffffff_0%,#f6fbff_100%)] py-12 sm:py-16"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-[#79c6f0]/15 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-4 h-48 w-48 rounded-full bg-[#f6d76b]/15 blur-3xl"
      />
      <Container size="default" className="relative">
        <ScrollReveal variant="up">
          <div className="group/strip relative grid overflow-hidden rounded-[26px] border border-[#dce8f1] bg-white/80 shadow-[0_22px_54px_-38px_rgba(14,39,65,0.52)] backdrop-blur-sm md:grid-cols-3">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[#2f91d0] via-[#78cdf1] to-[#f6d76b] transition-transform duration-700 ease-out group-hover/strip:scale-x-100 motion-reduce:transition-none"
            />
            {copy.items.map((item, index) => (
              <article
                key={item.title}
                className={`business-hover-lift group/benefit relative flex min-h-[168px] items-center gap-4 overflow-hidden p-5 hover:bg-[#f8fcff] sm:p-6 ${
                  index > 0
                    ? "border-t border-[#e1eaf1] md:border-l md:border-t-0"
                    : ""
                }`}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-14 -top-14 h-28 w-28 rounded-full bg-primary/0 blur-2xl transition-colors duration-300 group-hover/benefit:bg-primary/10"
                />
                <span className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-[18px] bg-white shadow-[0_12px_26px_-22px_rgba(18,45,78,0.65)] ring-1 ring-[#eaf1f6] transition-transform duration-500 ease-[cubic-bezier(0.34,1.42,0.64,1)] group-hover/benefit:-rotate-3 group-hover/benefit:scale-105 motion-reduce:transform-none motion-reduce:transition-none">
                  <Image
                    src={item.icon}
                    alt=""
                    width={42}
                    height={42}
                    className="size-10 object-contain"
                  />
                </span>
                <div className="relative z-10 min-w-0">
                  <h2 className="text-sm font-extrabold tracking-[-0.01em] text-[#0b1a31] sm:text-base">
                    {item.title}
                  </h2>
                  <p className="mt-1.5 text-xs font-medium leading-5 text-slate-600 sm:text-sm sm:leading-6">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
