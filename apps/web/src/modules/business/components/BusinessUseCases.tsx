import Image from "next/image";

import { Container } from "@/components/layout/Container";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { BUSINESS_USE_CASE_ICONS } from "@/modules/business/data/business-page.data";
import type { BusinessPageCopy } from "@/modules/business/types/business-page.types";

export function BusinessUseCases({ copy }: { copy: BusinessPageCopy["useCases"] }) {
  return (
    <section className="bg-[#f7f9fc] py-14 sm:py-16 lg:py-20">
      <Container size="wide">
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-[#147fbd] sm:text-sm">{copy.eyebrow}</p>
          <h2 className="mt-3 text-balance text-[clamp(2rem,3.5vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.04em] text-[#071d3a]">
            {copy.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{copy.description}</p>
        </ScrollReveal>

        <div className="mt-9 grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3">
          {copy.items.map((item, index) => (
            <ScrollReveal key={item.title} delay={index * 0.05}>
              <article className="group relative isolate h-full overflow-hidden rounded-[24px] border border-[#dbe8f4] bg-white p-5 shadow-[0_14px_35px_-32px_rgba(7,29,58,0.42)] transition-all duration-300 ease-out after:pointer-events-none after:absolute after:inset-y-0 after:-left-1/2 after:w-1/3 after:skew-x-[-20deg] after:bg-gradient-to-r after:from-transparent after:via-white/70 after:to-transparent after:transition-transform after:duration-700 hover:-translate-y-1 hover:border-[#b9d8ed] hover:shadow-[0_22px_48px_-34px_rgba(7,29,58,0.48)] hover:after:translate-x-[470%] motion-reduce:transform-none motion-reduce:after:hidden">
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-[18px] bg-[#eef6ff] transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none">
                    <Image src={BUSINESS_USE_CASE_ICONS[index] ?? BUSINESS_USE_CASE_ICONS[0]} alt="" width={40} height={40} className="size-10 object-contain" />
                  </span>
                  <span className="text-sm font-bold text-[#9b7100]">0{index + 1}</span>
                </div>
                <div className="relative z-10 mt-4">
                  <h3 className="text-lg font-bold text-[#071d3a]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  <p className="mt-4 border-t border-[#e7eef5] pt-3 text-xs font-medium leading-5 text-[#3b6d8f]">{item.example}</p>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
