import {
  ArrowRight,
  Check,
  MessageSquareText,
  WandSparkles,
} from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { DecorativeIcon } from "@/components/shared/FeatureIcon";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { DECORATIVE_ICON_PATHS } from "@/config/icons";
import type {
  HomeHero,
  HomeMediaAsset,
} from "@/modules/home/types/home.types";

import { DecorativeBrick } from "./DecorativeBrick";
import { FeatureTrustBar } from "./FeatureTrustBar";
import { HeroMediaSlider } from "./HeroMediaSlider";

type HeroSectionProps = {
  hero: HomeHero;
  media: HomeMediaAsset | null;
  slides: HomeMediaAsset[];
};

export function HeroSection({ hero, media, slides }: HeroSectionProps) {
  const heroSlides = slides.length > 0 ? slides : media ? [media] : [];

  return (
    <section
      data-home-section="hero"
      className="relative overflow-hidden bg-[linear-gradient(135deg,#f6fbff_0%,#ffffff_58%,#fffaf0_100%)] pb-6 pt-10 sm:pb-7 sm:pt-12 lg:pb-2 lg:pt-11 xl:pb-3 xl:pt-12"
    >
      <span className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-primary-light/80 blur-3xl" />
      <span className="pointer-events-none absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-accent-soft/80 blur-3xl" />
      <DecorativeBrick
        tone="gold"
        studs={3}
        className="absolute right-[7%] top-12 hidden rotate-6 opacity-70 lg:inline-grid"
      />
      <DecorativeBrick
        tone="blue"
        size="sm"
        studs={2}
        className="absolute bottom-12 left-[4%] hidden -rotate-6 opacity-60 xl:inline-grid"
      />

      <Container
        size="wide"
        className="relative px-[clamp(1.25rem,4.5vw,5.5rem)]"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-7 lg:grid-cols-[minmax(0,0.43fr)_minmax(0,0.57fr)] lg:gap-[clamp(2.5rem,3.5vw,4rem)]">
          <ScrollReveal className="min-w-0 max-w-[610px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/85 px-4 py-2 text-[13px] font-semibold uppercase leading-[1.4] tracking-[0.07em] text-primary-dark shadow-sm sm:text-[14px]">
              <DecorativeIcon
                src={DECORATIVE_ICON_PATHS.sparkles}
                size="sm"
                className="h-5 w-5"
              />
              {hero.eyebrow}
            </div>

            <h1 className="mt-5 max-w-full break-words text-balance font-display text-[clamp(2.05rem,8.8vw,2.375rem)] font-bold leading-[1.16] tracking-[-0.012em] text-navy sm:max-w-[610px] sm:text-[clamp(2.5rem,5vw,2.875rem)] sm:leading-[1.15] lg:text-[clamp(2.75rem,3.5vw,3.35rem)] lg:leading-[1.12] lg:tracking-[-0.02em]">
              {hero.title}
            </h1>
            <p className="mt-5 max-w-[610px] text-[15.5px] font-medium leading-[1.7] text-text-secondary sm:text-[16px] lg:mt-4 lg:text-[17px]">
              {hero.description}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:mt-6">
              <Button
                asChild
                size="lg"
                className="w-full px-6 sm:w-auto sm:min-w-[190px]"
                leftIcon={
                  <WandSparkles
                    className="h-[18px] w-[18px]"
                    strokeWidth={1.9}
                  />
                }
              >
                <Link href={hero.primaryCta.href}>{hero.primaryCta.label}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full px-6 sm:w-auto sm:min-w-[190px]"
                rightIcon={
                  <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.9} />
                }
              >
                <Link href={hero.secondaryCta.href}>
                  {hero.secondaryCta.label}
                </Link>
              </Button>
            </div>

            <ul
              className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5 lg:mt-5"
              aria-label={hero.commitmentsLabel}
            >
              {hero.trustPoints.map((point) => (
                <li
                  key={point}
                  className="inline-flex items-center gap-2 text-[14px] font-semibold leading-6 text-text-secondary"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-accent-dark">
                    <Check className="h-4 w-4" strokeWidth={2.4} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal
            variant="scale"
            delay={0.08}
            className="relative min-w-0 overflow-visible"
          >
            <div className="relative overflow-visible">
              <span className="absolute -inset-3 rotate-2 rounded-[34px] border border-accent/25 bg-accent-soft/35" />
              <HeroMediaSlider
                slides={heroSlides}
                labels={hero.sliderLabels}
              />
            </div>
            <div className="relative z-20 mt-4 flex w-full flex-wrap justify-center gap-2 lg:mt-5">
              {hero.chips.map((chip, index) => (
                <ScrollReveal key={chip} delay={0.16 + index * 0.06}>
                  <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-[12.5px] font-semibold leading-5 text-navy shadow-sm transition-transform duration-300 hover:-translate-y-1 motion-reduce:transform-none sm:text-[13px]">
                    {index < 2 ? (
                      <DecorativeIcon
                        src={
                          index === 0
                            ? DECORATIVE_ICON_PATHS.camera
                            : DECORATIVE_ICON_PATHS.sparkles
                        }
                        size="sm"
                        className="h-5 w-5"
                      />
                    ) : (
                      <MessageSquareText
                        className="h-[18px] w-[18px] text-primary"
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    )}
                    {chip}
                  </span>
                </ScrollReveal>
              ))}
            </div>
          </ScrollReveal>
        </div>

        <FeatureTrustBar items={hero.features} />
      </Container>
    </section>
  );
}
