import Image from "next/image";
import { Check, ChevronRight } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import {
  BUSINESS_BENEFIT_ICONS,
  BUSINESS_HERO_IMAGES,
  BUSINESS_PROCESS_ICONS,
} from "@/modules/business/data/business-page.data";
import type { BusinessPageCopy } from "@/modules/business/types/business-page.types";

type BusinessValueProcessProps = {
  benefits: BusinessPageCopy["benefits"];
  process: BusinessPageCopy["process"];
};

export function BusinessValueProcess({
  benefits,
  process,
}: BusinessValueProcessProps) {
  return (
    <section className="overflow-hidden bg-white py-14 sm:py-16 lg:py-20">
      <Container size="wide">
        <div className="grid items-center gap-9 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <ScrollReveal variant="slideLeft" className="relative mx-auto w-full max-w-[610px]">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[30px] bg-[#edf6fc] p-4 sm:p-5">
              <div className="relative size-full overflow-hidden rounded-[24px] bg-white">
                <Image
                  src={BUSINESS_HERO_IMAGES[2]}
                  alt={benefits.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 42vw, 92vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-x-7 bottom-7 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-[0_14px_34px_-26px_rgba(7,29,58,0.5)] backdrop-blur sm:inset-x-9 sm:bottom-9">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#fff1bd] text-[#8a6500]">
                  <Check className="size-4" strokeWidth={2.6} aria-hidden="true" />
                </span>
                <p className="text-sm font-bold text-[#071d3a]">{benefits.items[2]?.title}</p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="slideRight" delay={0.06}>
            <p className="text-xs font-bold tracking-[0.2em] text-[#147fbd] sm:text-sm">
              {benefits.eyebrow}
            </p>
            <h2 className="mt-3 max-w-3xl text-balance text-3xl font-bold leading-[1.08] tracking-[-0.04em] text-[#071d3a] sm:text-4xl lg:text-[44px]">
              {benefits.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              {benefits.description}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {benefits.items.map((item, index) => (
                <article
                  key={item.title}
                  className="flex gap-3.5 rounded-[20px] border border-[#e1ebf3] bg-[#f9fcff] p-4"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Image
                      src={BUSINESS_BENEFIT_ICONS[index] ?? BUSINESS_BENEFIT_ICONS[0]}
                      alt=""
                      width={32}
                      height={32}
                      className="size-8 object-contain"
                    />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#071d3a]">{item.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </ScrollReveal>
        </div>

        <div className="mt-12 border-t border-[#dfeaf2] pt-10 lg:mt-14 lg:pt-12">
          <ScrollReveal className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-[#147fbd] sm:text-sm">
                {process.eyebrow}
              </p>
              <h2 className="mt-3 text-balance text-2xl font-bold tracking-[-0.035em] text-[#071d3a] sm:text-3xl">
                {process.title}
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base lg:justify-self-end">
              {process.description}
            </p>
          </ScrollReveal>

          <div className="mt-7 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {process.items.map((item, index) => (
              <ScrollReveal key={item.title} delay={index * 0.05}>
                <article className="relative flex h-full gap-4 rounded-[22px] border border-[#dce8f1] bg-[#f8fbfe] p-4 sm:p-5">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Image
                      src={BUSINESS_PROCESS_ICONS[index] ?? BUSINESS_PROCESS_ICONS[0]}
                      alt=""
                      width={34}
                      height={34}
                      className="size-8 object-contain"
                    />
                  </span>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold tracking-[0.14em] text-[#147fbd]">
                      0{index + 1}
                    </span>
                    <h3 className="mt-0.5 text-sm font-bold text-[#071d3a]">{item.title}</h3>
                    <p className="mt-1.5 text-xs leading-5 text-slate-500">{item.description}</p>
                  </div>
                  {index < process.items.length - 1 ? (
                    <ChevronRight className="absolute -right-3 top-1/2 z-10 hidden size-5 -translate-y-1/2 rounded-full bg-white text-[#6ab5df] shadow-sm lg:block" aria-hidden="true" />
                  ) : null}
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
