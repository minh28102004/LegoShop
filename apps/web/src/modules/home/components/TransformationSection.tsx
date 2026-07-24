import {
  ArrowDown,
  Camera,
  MessageSquareText,
  PackageOpen,
  Shirt,
  UserRound,
  Workflow,
} from "lucide-react";
import Image from "next/image";

import { Container } from "@/components/layout/Container";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { HOMEPAGE_TRANSFORMATION_IMAGES } from "@/config/marketing-media";
import type {
  HomeCustomizationItem,
  HomeTransformation,
} from "@/modules/home/types/home.types";

import { DecorativeBrick } from "./DecorativeBrick";

const CUSTOMIZATION_ICONS: Record<
  HomeCustomizationItem["icon"],
  typeof UserRound
> = {
  face: UserRound,
  shirt: Shirt,
  accessory: PackageOpen,
  message: MessageSquareText,
};

type TransformationSectionProps = {
  content: HomeTransformation;
};

export function TransformationSection({
  content,
}: TransformationSectionProps) {
  return (
    <section
      id="transformation"
      data-home-section="transformation"
      className="relative overflow-hidden bg-white py-9 md:py-11 lg:py-10"
    >
      <DecorativeBrick
        tone="blue"
        studs={3}
        className="absolute left-[5%] top-20 hidden rotate-6 opacity-55 xl:inline-grid"
      />
      <Container
        size="wide"
        className="relative px-[clamp(1.25rem,4.5vw,5.5rem)]"
      >
        <ScrollReveal className="mx-auto max-w-[780px] text-center">
          <p className="text-[13px] font-semibold uppercase leading-[1.4] tracking-[0.07em] text-primary-dark sm:text-[14px]">
            {content.eyebrow}
          </p>
          <h2 className="mt-3 text-balance font-display text-[clamp(1.875rem,7.6vw,2.125rem)] font-[650] leading-[1.2] tracking-[-0.012em] text-navy sm:text-[clamp(2.125rem,4vw,2.5rem)] lg:text-[clamp(2.375rem,3.1vw,2.75rem)] lg:leading-[1.18] lg:tracking-[-0.016em]">
            {content.title}
          </h2>
          <p className="mx-auto mt-4 max-w-[740px] text-[15px] leading-[1.7] text-text-secondary sm:text-[16px] lg:text-[17px]">
            {content.description}
          </p>
        </ScrollReveal>

        <div className="mx-auto mt-7 grid max-w-[860px] items-center gap-4 lg:grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] lg:gap-5">
          <ScrollReveal
            variant="slideLeft"
            className="h-full w-full max-w-[350px] justify-self-center"
          >
            <article className="relative flex h-full w-full flex-col overflow-hidden rounded-[26px] border border-border/80 bg-[linear-gradient(145deg,#f8fbff_0%,#ffffff_100%)] p-3 shadow-[0_22px_50px_-42px_rgba(15,35,60,0.45)] sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-surface-soft px-3 py-1.5 text-[12px] font-semibold uppercase leading-[1.4] tracking-[0.07em] text-muted sm:text-[13px]">
                  {content.sourceBadge}
                </span>
                <Camera className="h-5 w-5 text-primary" strokeWidth={1.8} />
              </div>

              <div className="relative mt-3 aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-[#eef4f8] ring-1 ring-inset ring-border/70">
                <Image
                  src={HOMEPAGE_TRANSFORMATION_IMAGES.source}
                  alt={content.sourceTitle}
                  fill
                  sizes="(max-width: 1023px) min(82vw, 350px), 350px"
                  className="object-cover object-[center_28%]"
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-navy/20 to-transparent"
                  aria-hidden="true"
                />
              </div>
            </article>
          </ScrollReveal>

          <div className="flex items-center justify-center text-primary">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-white shadow-sm lg:rotate-[-90deg]">
              <ArrowDown className="h-[18px] w-[18px]" />
            </span>
          </div>

          <ScrollReveal
            variant="slideRight"
            delay={0.08}
            className="h-full w-full max-w-[350px] justify-self-center"
          >
            <article className="relative flex h-full w-full flex-col overflow-hidden rounded-[26px] border border-primary/15 bg-[linear-gradient(145deg,#edf7ff_0%,#fffdf7_100%)] p-3 shadow-[0_22px_50px_-42px_rgba(15,35,60,0.45)] sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-primary px-3 py-1.5 text-[12px] font-semibold uppercase leading-[1.4] tracking-[0.07em] text-white sm:text-[13px]">
                  {content.resultBadge}
                </span>
                <Workflow className="h-5 w-5 text-primary" strokeWidth={1.8} />
              </div>

              <div className="relative mt-3 aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-[#f5f1eb] ring-1 ring-inset ring-border/70">
                <Image
                  src={HOMEPAGE_TRANSFORMATION_IMAGES.result}
                  alt={`${content.resultBadge}: ${content.title}`}
                  fill
                  sizes="(max-width: 1023px) min(82vw, 350px), 350px"
                  className="object-cover object-[center_48%]"
                />
              </div>
            </article>
          </ScrollReveal>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {content.items.map((item, index) => {
            const Icon = CUSTOMIZATION_ICONS[item.icon];

            return (
              <ScrollReveal
                key={item.title}
                delay={index * 0.05}
                className="h-full"
              >
                <article className="group flex h-full gap-4 rounded-[20px] border border-border bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/30 hover:shadow-sm motion-reduce:transform-none">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-primary-light text-primary-dark transition-colors group-hover:bg-accent-soft group-hover:text-accent-dark">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 className="text-[15.5px] font-semibold leading-[1.35] text-navy sm:text-[16px]">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-[14px] leading-[1.6] text-text-secondary sm:text-[14.5px]">
                      {item.description}
                    </p>
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>


      </Container>
    </section>
  );
}
