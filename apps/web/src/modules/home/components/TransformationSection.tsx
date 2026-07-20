import {
  ArrowDown,
  ArrowUpRight,
  Camera,
  MessageSquareText,
  PackageOpen,
  PencilRuler,
  Shirt,
  UserRound,
  Workflow,
} from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/ui/Button";
import type {
  HomeCustomizationItem,
  HomeMediaAsset,
  HomeMediaLabels,
  HomeTransformation,
} from "@/modules/home/types/home.types";

import { DecorativeBrick } from "./DecorativeBrick";
import { FramedGiftVisual } from "./FramedGiftVisual";

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
  media: HomeMediaAsset | null;
  mediaLabels: HomeMediaLabels;
};

export function TransformationSection({
  content,
  media,
  mediaLabels,
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

        <div className="mx-auto mt-5 grid max-w-[780px] items-center gap-4 lg:grid-cols-[minmax(0,0.48fr)_40px_minmax(0,0.52fr)] lg:gap-5">
          <ScrollReveal
            variant="slideLeft"
            className="w-full max-w-[340px] justify-self-center"
          >
            <article className="relative flex w-full flex-col overflow-hidden rounded-[24px] border border-border/80 bg-[linear-gradient(145deg,#f8fbff_0%,#ffffff_100%)] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-surface-soft px-3 py-1.5 text-[12px] font-semibold uppercase leading-[1.4] tracking-[0.07em] text-muted sm:text-[13px]">
                  {content.sourceBadge}
                </span>
                <Camera className="h-5 w-5 text-primary" strokeWidth={1.8} />
              </div>

              <div className="mx-auto mt-3.5 flex aspect-square w-full max-w-[230px] flex-col items-center justify-center rounded-[20px] border border-dashed border-primary/30 bg-[radial-gradient(circle_at_top,#eef8ff_0%,#ffffff_66%)] p-4 text-center sm:max-w-[240px]">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary-dark">
                  <UserRound className="h-8 w-8" strokeWidth={1.4} />
                </span>
                <p className="mt-4 text-[15px] font-semibold leading-[1.35] text-navy sm:text-[16px]">
                  {content.sourceTitle}
                </p>
                <p className="mt-2 text-[14px] leading-[1.6] text-text-secondary">
                  {content.sourceDescription}
                </p>
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
            className="w-full max-w-[350px] justify-self-center"
          >
            <article className="relative w-full rounded-[24px] bg-[linear-gradient(145deg,#edf7ff_0%,#fffdf7_100%)] p-2.5">
              <span className="absolute left-5 top-5 z-30 rounded-full bg-primary px-2.5 py-1.5 text-[12px] font-semibold uppercase leading-[1.4] tracking-[0.07em] text-white sm:text-[13px]">
                {content.resultBadge}
              </span>
              <FramedGiftVisual
                visual={media}
                labels={mediaLabels}
                compact
                aspect="square"
                fit="cover"
                sizes="(max-width: 640px) calc(100vw - 64px), (max-width: 1024px) 280px, 300px"
                className="max-w-[270px] pt-8 sm:max-w-[280px] lg:max-w-[300px]"
              />
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

        <ScrollReveal delay={0.1}>
          <div className="relative mt-8 flex flex-col items-start justify-between gap-5 overflow-hidden rounded-[22px] border border-primary/15 bg-primary-light/35 p-6 sm:flex-row sm:items-center sm:p-7">
            <span
              className="absolute inset-y-0 left-0 w-1 bg-accent"
              aria-hidden="true"
            />
            <p className="max-w-[730px] text-[15px] font-semibold leading-[1.65] text-navy sm:text-[16px]">
              {content.statement}
            </p>
            <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="w-full px-6 sm:w-auto"
                leftIcon={
                  <PencilRuler
                    className="h-[18px] w-[18px]"
                    strokeWidth={1.8}
                  />
                }
              >
                <Link href={content.primaryCta.href}>
                  {content.primaryCta.label}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="w-full px-5 sm:w-auto"
                leftIcon={
                  <Workflow className="h-[18px] w-[18px]" strokeWidth={1.8} />
                }
                rightIcon={<ArrowUpRight className="h-4 w-4" />}
              >
                <Link href={content.secondaryCta.href}>
                  {content.secondaryCta.label}
                </Link>
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
