import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, Check } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { BUSINESS_HERO_IMAGES } from "@/modules/business/data/business-page.data";
import type { BusinessPageCopy } from "@/modules/business/types/business-page.types";

type BusinessHeroProps = {
  copy: BusinessPageCopy["hero"];
};

export function BusinessHero({ copy }: BusinessHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[#dbe8f4] bg-[linear-gradient(135deg,#f4f9ff_0%,#ffffff_48%,#fff9e9_100%)] py-12 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute -left-24 top-16 size-72 rounded-full bg-[#dceeff]/65 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-80 rounded-full bg-[#fff0b8]/55 blur-3xl" />

      <Container size="wide" className="relative">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.84fr_1.16fr] lg:gap-16">
          <ScrollReveal variant="slideLeft" className="w-full max-w-full lg:max-w-2xl">
            <p className="inline-flex max-w-full items-center whitespace-normal rounded-full border border-[#b9d8ed] bg-white/80 px-4 py-2 text-center text-xs font-bold leading-5 tracking-[0.18em] text-[#147fbd] shadow-sm backdrop-blur sm:text-sm">
              {copy.eyebrow}
            </p>
            <h1 className="mt-6 max-w-full break-words text-balance text-[clamp(2.75rem,5vw,5.4rem)] font-bold leading-[0.98] tracking-[-0.055em] text-[#071d3a]">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              {copy.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full rounded-full px-7 sm:w-auto">
                <Link href="#business-consultation">
                  {copy.primaryCta}
                  <ArrowDownRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full rounded-full px-7 sm:w-auto">
                <Link href="#business-showcase">{copy.secondaryCta}</Link>
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-3">
              {copy.commitments.map((item) => (
                <li key={item} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <span className="flex size-6 items-center justify-center rounded-full bg-[#fff1bd] text-[#9b7100]">
                    <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal variant="slideRight" delay={0.08} className="relative mx-auto w-full max-w-[760px]">
            <div className="relative aspect-[1.13/0.82] min-h-[390px] sm:min-h-[480px] lg:min-h-[560px]">
              <div className="absolute inset-x-[7%] inset-y-[8%] rotate-[1.5deg] overflow-hidden rounded-[34px] border-[8px] border-white bg-white shadow-[0_28px_70px_-38px_rgba(7,29,58,0.52)] transition-transform duration-500 hover:rotate-0 hover:scale-[1.01]">
                <Image
                  src={BUSINESS_HERO_IMAGES[0]}
                  alt={copy.imageAlts[0] ?? copy.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 46vw, 90vw"
                  className="object-cover object-center"
                />
              </div>

              <div className="absolute left-0 top-0 hidden h-[36%] w-[34%] -rotate-6 overflow-hidden rounded-[24px] border-[6px] border-white shadow-[0_20px_45px_-28px_rgba(7,29,58,0.55)] transition-transform duration-500 hover:-translate-y-1 hover:-rotate-3 md:block">
                <Image src={BUSINESS_HERO_IMAGES[1]} alt={copy.imageAlts[1] ?? ""} fill sizes="240px" className="object-cover" />
              </div>
              <div className="absolute right-0 top-[4%] hidden h-[32%] w-[29%] rotate-6 overflow-hidden rounded-[22px] border-[6px] border-white shadow-[0_20px_45px_-28px_rgba(7,29,58,0.55)] transition-transform duration-500 hover:translate-y-1 hover:rotate-3 sm:block">
                <Image src={BUSINESS_HERO_IMAGES[2]} alt={copy.imageAlts[2] ?? ""} fill sizes="220px" className="object-cover" />
              </div>
              <div className="absolute bottom-0 left-[5%] hidden h-[30%] w-[29%] rotate-4 overflow-hidden rounded-[22px] border-[6px] border-white shadow-[0_20px_45px_-28px_rgba(7,29,58,0.55)] transition-transform duration-500 hover:-translate-y-1 hover:rotate-1 lg:block">
                <Image src={BUSINESS_HERO_IMAGES[3]} alt={copy.imageAlts[3] ?? ""} fill sizes="220px" className="object-cover" />
              </div>

              <div className="absolute bottom-[3%] right-[4%] z-20 max-w-[260px] rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-sm font-semibold text-[#071d3a] shadow-[0_16px_40px_-28px_rgba(7,29,58,0.6)] backdrop-blur">
                <span className="mr-2 inline-block size-2 rounded-full bg-[#f6d76b]" />
                {copy.floatingLabel}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
