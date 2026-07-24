import { ArrowUpRight, Quote } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { DecorativeIcon } from "@/components/shared/FeatureIcon";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { DECORATIVE_ICON_PATHS } from "@/config/icons";
import type {
  HomeMediaAsset,
  HomeMediaLabels,
  HomeStory,
} from "@/modules/home/types/home.types";

import { DecorativeBrick } from "./DecorativeBrick";
import { FramedGiftVisual } from "./FramedGiftVisual";

type StorySectionProps = {
  story: HomeStory;
  media: HomeMediaAsset | null;
  mediaLabels: HomeMediaLabels;
};

export function StorySection({ media, mediaLabels, story }: StorySectionProps) {
  const highlightedPhrase = story.highlightedPhrase;
  const [titleStart, titleEnd] = story.title.split(highlightedPhrase);

  return (
    <section
      id="about-figure-lab"
      data-home-section="story"
      className="bg-white py-12 md:py-16 lg:py-20"
    >
      <Container
        size="wide"
        className="px-[clamp(1.25rem,4.5vw,5.5rem)]"
      >
        <ScrollReveal>
          <article className="group/story relative isolate">
            <span className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary-light/65 blur-3xl" />
            <DecorativeBrick
              tone="gold"
              size="sm"
              studs={2}
              className="absolute bottom-7 right-8 hidden rotate-6 opacity-65 transition-transform group-hover/story:translate-x-0.5 group-hover/story:-translate-y-0.5 lg:inline-grid"
            />

            <div className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-[clamp(3rem,5vw,5rem)]">
              <ScrollReveal
                variant="slideLeft"
                className="relative order-2 min-w-0 lg:order-1"
              >
                <div className="relative flex items-center justify-center rounded-[30px] bg-[linear-gradient(145deg,#edf7ff_0%,#fffdf7_100%)] p-3">
                  <div className="absolute left-5 top-5 z-30 inline-flex items-center gap-2 rounded-[12px] border border-white/80 bg-white/95 px-3 py-2 text-[13px] font-semibold text-navy shadow-sm sm:left-7 sm:top-7 sm:text-[14px]">
                    <DecorativeIcon
                      src={DECORATIVE_ICON_PATHS.graduationCap}
                      size="sm"
                      className="h-5 w-5"
                    />
                    {story.visualBadge}
                  </div>
                  <FramedGiftVisual
                    visual={media}
                    labels={mediaLabels}
                    aspect="square"
                    fit="cover"
                    sizes="(max-width: 640px) calc(100vw - 64px), (max-width: 1024px) 500px, 560px"
                    className="relative z-10 max-w-[420px] pt-12 sm:max-w-[500px] lg:max-w-[560px]"
                  />
                </div>
              </ScrollReveal>

              <ScrollReveal
                variant="slideRight"
                delay={0.1}
                className="order-1 lg:order-2"
              >
                <div className="max-w-[640px] py-2 lg:py-4">
                  <p className="text-[13px] font-semibold uppercase leading-[1.4] tracking-[0.07em] text-primary-dark sm:text-[14px]">
                    {story.eyebrow}
                  </p>
                  <h2 className="mt-4 max-w-[700px] text-balance font-display text-[clamp(1.875rem,7.6vw,2.125rem)] font-[650] leading-[1.2] tracking-[-0.012em] text-navy sm:text-[clamp(2.125rem,4vw,2.5rem)] lg:text-[clamp(2.5rem,3.2vw,2.875rem)] lg:leading-[1.16] lg:tracking-[-0.016em]">
                    {titleStart}
                    <span className="relative inline whitespace-normal">
                      <span className="absolute inset-x-0 bottom-[0.08em] -z-10 h-[0.28em] rounded-full bg-accent/45" />
                      {highlightedPhrase}
                    </span>
                    {titleEnd}
                  </h2>
                  <div className="mt-6 space-y-5">
                    {story.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-[15.5px] leading-[1.7] text-text-secondary sm:text-[16px] lg:text-[17px]"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  <ScrollReveal delay={0.18}>
                    <blockquote className="mt-7 rounded-[18px] border border-accent/35 bg-accent-soft/75 p-5 sm:p-6">
                      <Quote
                        className="mb-2 h-5 w-5 text-accent-dark"
                        aria-hidden="true"
                      />
                      <p className="text-[20px] font-semibold leading-[1.4] text-navy sm:text-[22px]">
                        {story.quote}
                      </p>
                    </blockquote>
                  </ScrollReveal>

                  <Button
                    asChild
                    size="lg"
                    className="mt-7 w-full px-6 sm:w-auto"
                    rightIcon={
                      <ArrowUpRight
                        className="h-[18px] w-[18px]"
                        strokeWidth={1.9}
                      />
                    }
                  >
                    <Link href={story.cta.href}>{story.cta.label}</Link>
                  </Button>
                </div>
              </ScrollReveal>
            </div>
          </article>
        </ScrollReveal>
      </Container>
    </section>
  );
}
