import Image from "next/image";

import { Container } from "@/components/layout/Container";
import { BUSINESS_HERO_IMAGE } from "@/modules/business/data/business-compact.data";
import type { BusinessCompactCopy } from "@/modules/business/types/business-page.types";

type BusinessHeroProps = {
  copy: BusinessCompactCopy["hero"];
};

export function BusinessHero({ copy }: BusinessHeroProps) {
  return (
    <section className="relative isolate min-h-[320px] overflow-hidden border-b border-border bg-primary-light">
      <Image
        src={BUSINESS_HERO_IMAGE}
        alt={copy.imageAlt}
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-[center_48%]"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(255,255,255,0.97)_0%,rgba(247,252,255,0.92)_38%,rgba(235,247,255,0.68)_68%,rgba(187,225,247,0.42)_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_20%,rgba(36,136,199,0.2),transparent_42%)]" />

      <Container
        size="default"
        className="flex min-h-[320px] items-center py-9 sm:py-10"
      >
        <div className="w-full min-w-0 max-w-[650px] animate-[business-rise_.55s_ease-out_both]">
          <p className="inline-flex rounded-full bg-primary px-4 py-2 text-[10px] font-extrabold tracking-[0.13em] text-white shadow-sm sm:text-xs">
            {copy.eyebrow}
          </p>
          <h1 className="mt-4 max-w-full break-words text-balance text-[clamp(2.25rem,4vw,3.5rem)] font-extrabold leading-[0.98] tracking-[-0.055em] text-navy">
            {copy.title}
          </h1>
          <p className="mt-3 font-serif text-[clamp(1.9rem,3.4vw,3.1rem)] italic leading-none tracking-[-0.045em] text-primary-dark">
            {copy.accent}
          </p>
          <p className="mt-5 max-w-[570px] text-sm font-medium leading-6 text-slate-600 sm:text-base sm:leading-7">
            {copy.description}
          </p>
        </div>
      </Container>
    </section>
  );
}
