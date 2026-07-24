import Image from "next/image";
import { Check } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { BUSINESS_BENEFIT_ICONS, BUSINESS_HERO_IMAGES } from "@/modules/business/data/business-page.data";
import type { BusinessPageCopy } from "@/modules/business/types/business-page.types";

export function BusinessBenefits({ copy }: { copy: BusinessPageCopy["benefits"] }) {
  return (
    <section className="overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <Container size="wide">
        <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <ScrollReveal variant="slideLeft" className="relative mx-auto w-full max-w-[620px]">
            <div className="relative aspect-[4/4.25] overflow-hidden rounded-[34px] bg-[#eef6ff] p-5 sm:p-7">
              <div className="relative size-full overflow-hidden rounded-[26px]">
                <Image src={BUSINESS_HERO_IMAGES[2]} alt={copy.imageAlt} fill sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover" />
              </div>
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/70 bg-white/88 p-4 shadow-sm backdrop-blur sm:bottom-9 sm:left-9 sm:right-9">
                <div className="flex items-center gap-3 text-sm font-bold text-[#071d3a]">
                  <span className="flex size-9 items-center justify-center rounded-full bg-[#fff1bd] text-[#9b7100]">
                    <Check className="size-4" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  {copy.items[2]?.title}
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="slideRight" delay={0.08}>
            <p className="text-xs font-bold tracking-[0.2em] text-[#147fbd] sm:text-sm">{copy.eyebrow}</p>
            <h2 className="mt-4 max-w-3xl text-balance text-[clamp(2.2rem,4vw,4rem)] font-bold leading-[1.04] tracking-[-0.04em] text-[#071d3a]">
              {copy.title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">{copy.description}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {copy.items.map((item, index) => (
                <article key={item.title} className="group rounded-[22px] border border-[#e2ebf3] bg-[#fbfdff] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#b9d8ed] hover:shadow-sm motion-reduce:transform-none">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <Image src={BUSINESS_BENEFIT_ICONS[index] ?? BUSINESS_BENEFIT_ICONS[0]} alt="" width={34} height={34} className="size-8 object-contain" />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-[#071d3a]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
                </article>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
