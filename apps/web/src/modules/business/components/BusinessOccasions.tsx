import Image from "next/image";

import { Container } from "@/components/layout/Container";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import type { BusinessCompactCopy } from "@/modules/business/types/business-page.types";

export function BusinessOccasions({
  copy,
}: {
  copy: BusinessCompactCopy["occasions"];
}) {
  return (
    <section className="border-y border-[#e7edf3] bg-[#f6f9fc] py-14 sm:py-16">
      <Container size="default">
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-extrabold tracking-[0.18em] text-[#147fbd]">
            {copy.eyebrow}
          </p>
          <h2 className="mt-3 text-balance text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.05] tracking-[-0.045em] text-[#0b1a31]">
            {copy.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
            {copy.description}
          </p>
        </ScrollReveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {copy.items.map((item, index) => (
            <ScrollReveal key={item.title} delay={index * 0.035}>
              <article className="business-hover-lift group relative isolate flex h-full min-h-[138px] items-start gap-4 overflow-hidden rounded-[22px] border border-[#e1e9f0] bg-white p-5 shadow-[0_14px_32px_-30px_rgba(14,39,65,0.55)] after:pointer-events-none after:absolute after:inset-y-0 after:-left-1/2 after:w-1/4 after:skew-x-[-20deg] after:bg-gradient-to-r after:from-transparent after:via-white/80 after:to-transparent after:transition-transform after:duration-700 hover:border-[#bedced] hover:shadow-[0_20px_38px_-28px_rgba(14,39,65,0.45)] hover:after:translate-x-[620%] motion-reduce:after:hidden">
                <span className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-[18px] bg-[#eff7fd]">
                  <Image
                    src={item.icon}
                    alt=""
                    width={42}
                    height={42}
                    className="size-10 object-contain"
                  />
                </span>
                <div className="relative z-10 min-w-0 pt-0.5">
                  <h3 className="text-base font-extrabold text-[#0b1a31] sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
