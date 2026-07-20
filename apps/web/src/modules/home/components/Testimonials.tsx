import { Quote, Star } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import type { HomeTestimonialsContent } from "@/modules/home/types/home.types";

import { DecorativeBrick } from "./DecorativeBrick";
import { SectionHeader } from "./SectionHeader";

type TestimonialsProps = {
  content: HomeTestimonialsContent;
};

export function Testimonials({ content }: TestimonialsProps) {
  return (
    <section
      data-home-section="testimonials"
      className="relative overflow-hidden bg-[#f4f8fc] py-12 md:py-16 lg:py-18"
    >
      <DecorativeBrick
        tone="blue"
        studs={3}
        className="absolute left-[6%] top-16 hidden -rotate-6 opacity-55 xl:inline-grid"
      />
      <Container size="wide" className="relative">
        <ScrollReveal>
          <SectionHeader
            align="center"
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.subtitle}
            className="mb-9 sm:mb-10"
          />
        </ScrollReveal>

        <div className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
          {content.items.map((item, index) => (
            <ScrollReveal
              key={item.name}
              delay={index * 0.06}
              className="h-full"
            >
              <article className="group relative flex h-full flex-col rounded-[22px] border border-border bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_16px_34px_-28px_rgba(16,36,62,0.34)] motion-reduce:transform-none sm:p-7">
                <span className="mb-4 inline-flex w-fit rounded-full border border-primary/15 bg-primary-light/45 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-primary-dark">
                  {content.sampleLabel}
                </span>
                <span className="absolute right-6 top-6 inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-accent-soft text-accent-dark transition-colors duration-300 group-hover:bg-accent">
                  <Quote className="h-5 w-5" fill="currentColor" />
                </span>
                <div
                  className="flex items-center gap-1 text-accent-dark"
                  aria-label={`${item.rating} ${content.ratingSuffix}`}
                >
                  {Array.from({ length: item.rating }).map((_, starIndex) => (
                    <Star
                      key={`${item.name}-${starIndex}`}
                      className="h-4 w-4 fill-current"
                    />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-[15px] leading-[1.7] text-text-secondary sm:text-[15.5px]">
                  “{item.quote}”
                </p>
                <div className="mt-auto flex items-center gap-3 pt-6">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-[14px] font-semibold text-primary-dark transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                    {item.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-[14.5px] font-semibold text-navy sm:text-[15px]">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-[13.5px] font-medium text-muted sm:text-[14px]">
                      {item.productType}
                    </p>
                  </div>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
