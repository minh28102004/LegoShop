import { ArrowUpRight, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { DecorativeIcon } from "@/components/shared/FeatureIcon";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { DECORATIVE_ICON_PATHS } from "@/config/icons";
import type {
  HomeFinalCta,
  HomeMediaAsset,
  HomeMediaLabels,
} from "@/modules/home/types/home.types";

type FinalCtaSectionProps = {
  cta: HomeFinalCta;
  media: HomeMediaAsset[];
  mediaLabels: HomeMediaLabels;
};

type CollageImageProps = {
  className: string;
  imageClassName: string;
  sizes: string;
  visual: HomeMediaAsset;
};

function CollageImage({
  className,
  imageClassName,
  sizes,
  visual,
}: CollageImageProps) {
  return (
    <div
      className={`absolute overflow-hidden rounded-[22px] border-[5px] border-white bg-white shadow-[0_24px_50px_-30px_rgba(3,12,25,0.72)] transition-transform duration-500 ease-out will-change-transform motion-reduce:transform-none motion-reduce:transition-none ${className}`}
    >
      <Image
        src={visual.src}
        alt={visual.alt}
        fill
        quality={78}
        sizes={sizes}
        className={`object-cover ${imageClassName}`}
      />
    </div>
  );
}

export function FinalCtaSection({
  cta,
  media,
  mediaLabels,
}: FinalCtaSectionProps) {
  return (
    <section
      data-home-section="final-cta"
      className="relative isolate overflow-hidden bg-navy py-12 text-white md:py-14 lg:py-16"
    >
      <span className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <span className="absolute -bottom-28 right-[12%] h-80 w-80 rounded-full bg-white/5 blur-3xl" />

      <Container
        size="wide"
        className="relative px-[clamp(1.25rem,4.5vw,5.5rem)]"
      >
        <div className="grid items-center gap-9 lg:grid-cols-[minmax(0,0.41fr)_minmax(0,0.59fr)] lg:gap-[clamp(1.5rem,2.5vw,3rem)]">
          <ScrollReveal>
            <div className="max-w-[640px] lg:pl-[clamp(3rem,4vw,4.5rem)]">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[15px] bg-white/10">
                  <DecorativeIcon
                    src={DECORATIVE_ICON_PATHS.wrappedGift}
                    size="sm"
                    className="h-8 w-8"
                  />
                </span>
                <p className="text-[13px] font-semibold uppercase leading-[1.4] tracking-[0.07em] text-primary-light sm:text-[14px]">
                  {cta.eyebrow}
                </p>
              </div>
              <h2 className="mt-4 text-balance font-display text-[clamp(1.875rem,7.8vw,2.1875rem)] font-[650] leading-[1.2] tracking-[-0.012em] text-white sm:text-[clamp(2.125rem,4vw,2.5rem)] lg:text-[clamp(2.5rem,3.2vw,2.875rem)] lg:leading-[1.16] lg:tracking-[-0.016em]">
                {cta.title}
              </h2>
              <p className="mt-5 text-[15px] leading-[1.7] text-white/80 sm:text-[16px] lg:text-[17px]">
                {cta.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  asChild
                  size="lg"
                  variant="accent"
                  className="w-full px-6 sm:w-auto"
                  rightIcon={<ArrowUpRight className="h-4 w-4" />}
                >
                  <Link href={cta.primaryCta.href}>{cta.primaryCta.label}</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full border-white/25 bg-white/5 px-6 text-white hover:border-white/45 hover:bg-white/10 sm:w-auto"
                  leftIcon={
                    <MessageCircle
                      className="h-[18px] w-[18px]"
                      strokeWidth={1.8}
                    />
                  }
                  rightIcon={<ArrowUpRight className="h-4 w-4" />}
                >
                  <Link href={cta.secondaryCta.href}>
                    {cta.secondaryCta.label}
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="scale" delay={0.08}>
            {media[0] ? (
              <div className="group/collage relative mx-auto aspect-[4/3] w-full max-w-[760px] overflow-visible rounded-[30px] transition-transform duration-500 ease-out hover:-translate-y-1 motion-reduce:transform-none sm:aspect-[6/5] xl:max-w-[820px]">
                <span className="absolute left-[8%] top-[12%] h-[42%] w-[42%] rounded-full bg-primary/20 blur-3xl" />
                <span className="absolute bottom-[8%] right-[8%] h-[42%] w-[42%] rounded-full bg-accent/15 blur-3xl" />

                {media[1] ? (
                  <CollageImage
                    visual={media[1]}
                    sizes="(min-width: 1024px) 250px, 34vw"
                    imageClassName="object-center"
                    className="left-[2%] top-[4%] z-40 hidden h-[42%] w-[38%] -rotate-[7deg] group-hover/collage:-translate-y-1.5 group-hover/collage:-rotate-[8deg] md:block"
                  />
                ) : null}

                {media[2] ? (
                  <CollageImage
                    visual={media[2]}
                    sizes="(min-width: 1024px) 230px, 31vw"
                    imageClassName="object-[center_45%]"
                    className="bottom-[4%] left-[4%] z-40 hidden h-[38%] w-[34%] rotate-[6deg] group-hover/collage:translate-y-1 group-hover/collage:rotate-[7deg] md:block"
                  />
                ) : null}

                {media[3] ? (
                  <CollageImage
                    visual={media[3]}
                    sizes="210px"
                    imageClassName="object-center"
                    className="right-[1%] top-[1%] z-40 hidden h-[31%] w-[30%] rotate-[7deg] group-hover/collage:-translate-y-1 group-hover/collage:rotate-[8deg] lg:block"
                  />
                ) : null}

                {media[4] ? (
                  <CollageImage
                    visual={media[4]}
                    sizes="210px"
                    imageClassName="object-[center_42%]"
                    className="bottom-[1%] right-[1%] z-40 hidden h-[32%] w-[30%] -rotate-[5deg] group-hover/collage:translate-y-1.5 group-hover/collage:-rotate-[6deg] lg:block"
                  />
                ) : null}

                <CollageImage
                  visual={media[0]}
                  sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) 58vw, 440px"
                  imageClassName="object-center"
                  className="left-[3%] top-[5%] z-30 h-[90%] w-[94%] rotate-0 group-hover/collage:scale-[1.015] md:left-auto md:right-[6%] md:top-[13%] md:h-[75%] md:w-[68%] md:rotate-[1.5deg] md:group-hover/collage:rotate-0"
                />

                {media[0].source === "development-fallback" ? (
                  <span className="absolute bottom-[8%] right-[9%] z-40 rounded-full border border-white/30 bg-navy/75 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                    {mediaLabels.developmentBadge}
                  </span>
                ) : null}
              </div>
            ) : (
              <div
                role="img"
                aria-label={mediaLabels.unavailableLabel}
                className="mx-auto flex aspect-[4/3] w-full max-w-[760px] items-center justify-center rounded-[30px] border border-white/15 bg-white/5 px-8 text-center text-[14px] font-semibold text-white/70 sm:aspect-[6/5] xl:max-w-[820px]"
              >
                {mediaLabels.unavailableText}
              </div>
            )}
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
