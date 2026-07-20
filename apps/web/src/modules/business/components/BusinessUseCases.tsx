import Image from "next/image";

import { Container } from "@/components/layout/Container";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { BUSINESS_USE_CASE_ICONS } from "@/modules/business/data/business-page.data";
import type { BusinessPageCopy } from "@/modules/business/types/business-page.types";

export function BusinessUseCases({ copy }: { copy: BusinessPageCopy["useCases"] }) {
  return (
    <section className="bg-[#f7f9ff] py-16 sm:py-20 lg:py-24">
      <Container size="wide">
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-[#147fbd] sm:text-sm">{copy.eyebrow}</p>
          <h2 className="mt-4 text-balance text-[clamp(2.2rem,4vw,4rem)] font-bold leading-[1.04] tracking-[-0.04em] text-[#071d3a]">
            {copy.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">{copy.description}</p>
        </ScrollReveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {copy.items.map((item, index) => (
            <ScrollReveal key={item.title} delay={index * 0.05}>
              <article className="group relative isolate h-full overflow-hidden rounded-[26px] border border-[#dbe8f4] bg-white p-6 shadow-[0_14px_35px_-32px_rgba(7,29,58,0.42)] transition-all duration-300 ease-out after:pointer-events-none after:absolute after:inset-y-0 after:-left-1/2 after:w-1/3 after:skew-x-[-20deg] after:bg-gradient-to-r after:from-transparent after:via-white/70 after:to-transparent after:transition-transform after:duration-700 hover:-translate-y-1 hover:border-[#b9d8ed] hover:shadow-[0_22px_48px_-34px_rgba(7,29,58,0.48)] hover:after:translate-x-[470%] motion-reduce:transform-none motion-reduce:after:hidden sm:p-7">
                <div className="relative z-10 flex items-start justify-between gap-5">
                  <span className="flex size-[72px] shrink-0 items-center justify-center rounded-[22px] bg-[#eef6ff] transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none">
                    <Image src={BUSINESS_USE_CASE_ICONS[index] ?? BUSINESS_USE_CASE_ICONS[0]} alt="" width={50} height={50} className="size-12 object-contain" />
                  </span>
                  <span className="text-sm font-bold text-[#9b7100]">0{index + 1}</span>
                </div>
                <div className="relative z-10 mt-6">
                  <h3 className="text-xl font-bold text-[#071d3a]">{item.title}</h3>
                  <p className="mt-3 text-[15px] leading-7 text-slate-600">{item.description}</p>
                  <p className="mt-5 border-t border-[#e7eef5] pt-4 text-sm font-medium leading-6 text-[#3b6d8f]">{item.example}</p>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
