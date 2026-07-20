import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { DecorativeIcon } from "@/components/shared/FeatureIcon";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { DECORATIVE_ICON_PATHS } from "@/config/icons";
import type {
  HomeFriendshipStory,
  HomeMediaAsset,
  HomeMediaLabels,
  HomeMemoryCard,
} from "@/modules/home/types/home.types";

import { DecorativeBrick } from "./DecorativeBrick";
import { FramedGiftVisual } from "./FramedGiftVisual";

const MEMORY_ICON_PATHS: Record<
  HomeMemoryCard["icon"],
  (typeof DECORATIVE_ICON_PATHS)[keyof typeof DECORATIVE_ICON_PATHS]
> = {
  graduation: DECORATIVE_ICON_PATHS.graduationCap,
  sparkles: DECORATIVE_ICON_PATHS.artistPalette,
  gift: DECORATIVE_ICON_PATHS.wrappedGift,
};

const MEMORY_CARD_STYLES = [
  {
    line: "bg-primary/70",
    wrapper: "bg-primary-light/70",
  },
  {
    line: "bg-accent",
    wrapper: "bg-accent-soft/80",
  },
  {
    line: "bg-slate-300",
    wrapper: "bg-slate-100",
  },
] as const;

type FriendshipGiftSectionProps = {
  story: HomeFriendshipStory;
  media: HomeMediaAsset | null;
  mediaLabels: HomeMediaLabels;
};

export function FriendshipGiftSection({
  media,
  mediaLabels,
  story,
}: FriendshipGiftSectionProps) {
  return (
    <section
      data-home-section="friendship"
      className="relative overflow-hidden bg-[#f4f8fc] py-12 md:py-16 lg:py-20"
    >
      <span className="absolute -left-28 bottom-0 h-72 w-72 rounded-full bg-white/90 blur-3xl" />
      <span className="absolute -right-20 top-16 h-64 w-64 rounded-full bg-primary-light/60 blur-3xl" />
      <DecorativeBrick
        tone="gold"
        size="sm"
        studs={2}
        className="absolute left-[5%] top-12 hidden -rotate-3 opacity-60 lg:inline-grid"
      />
      <Container
        size="wide"
        className="relative px-[clamp(1.25rem,4.5vw,5.5rem)]"
      >
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.48fr)_minmax(0,0.52fr)] lg:gap-[clamp(3rem,5vw,5rem)]">
          <div>
            <ScrollReveal>
              <p className="text-[13px] font-semibold uppercase leading-[1.4] tracking-[0.07em] text-primary-dark sm:text-[14px]">
                {story.eyebrow}
              </p>
              <h2 className="mt-4 max-w-[760px] text-balance font-display text-[clamp(1.875rem,7.6vw,2.125rem)] font-[650] leading-[1.2] tracking-[-0.012em] text-navy sm:text-[clamp(2.125rem,4vw,2.5rem)] lg:text-[clamp(2.5rem,3.2vw,2.875rem)] lg:leading-[1.16] lg:tracking-[-0.016em]">
                {story.title}
              </h2>
              <p className="mt-5 max-w-[700px] text-[15px] leading-[1.7] text-text-secondary sm:text-[16px] lg:text-[17px]">
                {story.subtitle}
              </p>
            </ScrollReveal>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {story.details.map((detail, index) => {
                const iconSrc = MEMORY_ICON_PATHS[detail.icon];
                const style =
                  MEMORY_CARD_STYLES[index] ?? MEMORY_CARD_STYLES[0];

                return (
                  <ScrollReveal
                    key={detail.title}
                    delay={index * 0.06}
                    className="h-full"
                  >
                    <article className="group relative h-full overflow-hidden rounded-[22px] border border-border bg-white p-5 shadow-[0_12px_30px_-28px_rgba(16,36,62,0.25)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/25 hover:shadow-sm motion-reduce:transform-none">
                      <span
                        className={`absolute inset-x-0 top-0 h-0.5 ${style.line}`}
                      />
                      <span
                        className={`inline-flex h-14 w-14 items-center justify-center rounded-[18px] ${style.wrapper}`}
                      >
                        <DecorativeIcon
                          src={iconSrc}
                          size="md"
                          className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-[1.03] motion-reduce:transform-none"
                        />
                      </span>
                      <h3 className="mt-4 text-[17px] font-semibold leading-[1.35] text-navy sm:text-[18px]">
                        {detail.title}
                      </h3>
                      <p className="mt-2 text-[14.5px] leading-[1.6] text-text-secondary sm:text-[15px]">
                        {detail.description}
                      </p>
                    </article>
                  </ScrollReveal>
                );
              })}
            </div>

            <ScrollReveal delay={0.15}>
              <Button
                asChild
                size="lg"
                className="mt-8 w-full px-6 sm:w-auto"
                rightIcon={
                  <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.9} />
                }
              >
                <Link href={story.cta.href}>{story.cta.label}</Link>
              </Button>
            </ScrollReveal>
          </div>

          <ScrollReveal variant="scale" delay={0.08}>
            <div className="relative flex items-center justify-center rounded-[30px] bg-white/70 p-3">
              <span className="absolute -bottom-5 -left-5 h-28 w-28 rounded-full bg-primary-light/75" />
              <DecorativeBrick
                tone="blue"
                size="sm"
                studs={2}
                className="absolute -right-3 top-10 z-20 rotate-6"
              />
              <FramedGiftVisual
                visual={media}
                labels={mediaLabels}
                aspect="square"
                fit="cover"
                sizes="(max-width: 640px) calc(100vw - 56px), (max-width: 1024px) 500px, 560px"
                className="max-w-[420px] sm:max-w-[500px] lg:max-w-[560px]"
              />
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
