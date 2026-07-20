import { Container } from "@/components/layout/Container";
import { DecorativeIcon } from "@/components/shared/FeatureIcon";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { DECORATIVE_ICON_PATHS } from "@/config/icons";
import type { HomeProcessContent } from "@/modules/home/types/home.types";

import { DecorativeBrick } from "./DecorativeBrick";
import { SectionHeader } from "./SectionHeader";

const STEP_ICON_PATHS = [
  DECORATIVE_ICON_PATHS.framedPicture,
  DECORATIVE_ICON_PATHS.camera,
  DECORATIVE_ICON_PATHS.checkMark,
  DECORATIVE_ICON_PATHS.package,
];

type HowToOrderProps = {
  content: HomeProcessContent;
};

export function HowToOrder({ content }: HowToOrderProps) {
  const { steps } = content;

  return (
    <section
      id="how-to-order"
      data-home-section="process"
      className="relative overflow-hidden bg-[#f4f8fc] py-12 md:py-16 lg:py-18"
    >
      <DecorativeBrick
        tone="gold"
        size="sm"
        studs={4}
        className="absolute right-[7%] top-16 hidden rotate-3 opacity-65 lg:inline-grid"
      />
      <Container size="default" className="relative">
        <ScrollReveal>
          <SectionHeader
            align="center"
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.subtitle}
            className="mb-10 sm:mb-12"
          />
        </ScrollReveal>

        <div className="relative hidden lg:grid lg:grid-cols-4 lg:gap-8">
          <div className="absolute left-[12.5%] right-[12.5%] top-8 h-px bg-gradient-to-r from-primary/20 via-primary/55 to-primary/20" />
          {steps.map((step, index) => {
            const iconSrc =
              STEP_ICON_PATHS[index] ?? DECORATIVE_ICON_PATHS.checkMark;

            return (
              <ScrollReveal
                key={step.step}
                delay={index * 0.07}
                className="relative text-center"
              >
                <div className="group">
                  <span className="relative z-10 mx-auto inline-flex h-16 w-16 items-center justify-center overflow-visible rounded-[20px] border border-primary/15 bg-white shadow-sm">
                    <DecorativeIcon
                      src={iconSrc}
                      size="md"
                      className="relative z-10 h-11 w-11 transform-gpu transition-transform duration-300 ease-out will-change-transform group-hover:scale-[1.08] motion-reduce:transform-none motion-reduce:transition-none"
                    />
                    <span className="absolute -right-2 -top-2 z-30 inline-flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-[#f4f8fc] bg-accent px-1 text-[13px] font-semibold leading-none text-accent-foreground">
                      {step.step}
                    </span>
                  </span>
                  <h3 className="mt-5 text-[18px] font-semibold leading-[1.35] tracking-[-0.008em] text-navy sm:text-[19px]">
                    {step.title}
                  </h3>
                  <p className="mx-auto mt-2 max-w-[240px] text-[14.5px] leading-[1.6] text-text-secondary sm:text-[15px]">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <div className="relative grid gap-3 lg:hidden">
          <span className="absolute bottom-8 left-[25px] top-8 w-px bg-primary/20" />
          {steps.map((step, index) => {
            const iconSrc =
              STEP_ICON_PATHS[index] ?? DECORATIVE_ICON_PATHS.checkMark;

            return (
              <ScrollReveal key={step.step} delay={index * 0.05}>
                <article className="group relative flex gap-4 rounded-[20px] border border-border bg-white p-5">
                  <span className="relative z-20 inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-visible rounded-[15px] border border-primary/15 bg-primary-light/55">
                    <DecorativeIcon
                      src={iconSrc}
                      size="sm"
                      className="h-8 w-8 transform-gpu transition-transform duration-300 ease-out will-change-transform group-hover:scale-[1.08] motion-reduce:transform-none motion-reduce:transition-none"
                    />
                    <span className="absolute -right-1.5 -top-1.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-accent px-1 text-[12.5px] font-semibold leading-none text-accent-foreground">
                      {step.step}
                    </span>
                  </span>
                  <div className="relative z-20">
                    <h3 className="text-[17px] font-semibold leading-[1.35] text-navy">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-[14.5px] leading-[1.6] text-text-secondary">
                      {step.description}
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
