import Image from "next/image";

import { Container } from "@/components/layout/Container";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { BUSINESS_PROCESS_ICONS } from "@/modules/business/data/business-page.data";
import type { BusinessPageCopy } from "@/modules/business/types/business-page.types";

export function BusinessProcess({ copy }: { copy: BusinessPageCopy["process"] }) {
  return (
    <section className="bg-[#eef5ff] py-16 sm:py-20 lg:py-24">
      <Container size="wide">
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-[#147fbd] sm:text-sm">{copy.eyebrow}</p>
          <h2 className="mt-4 text-balance text-[clamp(2.2rem,4vw,4rem)] font-bold leading-[1.04] tracking-[-0.04em] text-[#071d3a]">{copy.title}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">{copy.description}</p>
        </ScrollReveal>

        <div className="relative mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[52px] hidden h-px bg-[#9ed0ef] lg:block" />
          {copy.items.map((item, index) => (
            <ScrollReveal key={item.title} delay={index * 0.07}>
              <article className="group relative z-10 h-full rounded-[26px] border border-[#d6e7f4] bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#9ed0ef] hover:shadow-[0_18px_42px_-34px_rgba(7,29,58,0.48)] motion-reduce:transform-none">
                <span className="absolute right-5 top-5 rounded-full bg-[#fff1bd] px-2.5 py-1 text-xs font-bold text-[#755400]">0{index + 1}</span>
                <span className="mx-auto flex size-[76px] items-center justify-center rounded-[24px] border border-[#dceaf5] bg-[#f8fbff] transition-transform duration-300 group-hover:scale-105">
                  <Image src={BUSINESS_PROCESS_ICONS[index] ?? BUSINESS_PROCESS_ICONS[0]} alt="" width={50} height={50} className="size-12 object-contain" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-[#071d3a]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">{item.description}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
