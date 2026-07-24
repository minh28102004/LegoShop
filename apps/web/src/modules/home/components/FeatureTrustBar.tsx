import { FeatureIcon } from "@/components/shared/FeatureIcon";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { DECORATIVE_ICON_PATHS } from "@/config/icons";
import type { HomeFeatureItem } from "@/modules/home/types/home.types";

const FEATURE_ICON_PATHS: Record<
  HomeFeatureItem["icon"],
  (typeof DECORATIVE_ICON_PATHS)[keyof typeof DECORATIVE_ICON_PATHS]
> = {
  highVoltage: DECORATIVE_ICON_PATHS.highVoltage,
  artistPalette: DECORATIVE_ICON_PATHS.artistPalette,
  wrappedGift: DECORATIVE_ICON_PATHS.wrappedGift,
  shield: DECORATIVE_ICON_PATHS.shield,
};

type FeatureTrustBarProps = {
  items: HomeFeatureItem[];
};

export function FeatureTrustBar({ items }: FeatureTrustBarProps) {
  return (
    <div className="mt-6 grid overflow-hidden rounded-[24px] border border-border/80 bg-white shadow-[0_18px_45px_-38px_rgba(16,36,62,0.38)] sm:grid-cols-2 lg:mt-7 lg:grid-cols-4">
      {items.map((item, index) => (
        <ScrollReveal
          key={item.title}
          delay={0.08 + index * 0.05}
          className="h-full border-border/70 max-sm:border-b sm:[&:nth-child(-n+2)]:border-b sm:[&:nth-child(even)]:border-l lg:border-b-0 lg:[&:not(:first-child)]:border-l"
        >
          <article className="group relative isolate flex h-full items-center gap-3.5 overflow-hidden bg-white px-5 py-3.5 after:pointer-events-none after:absolute after:inset-y-0 after:left-0 after:z-20 after:w-[42%] after:translate-x-[-160%] after:skew-x-[-18deg] after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.65),transparent)] after:opacity-0 after:transition-none after:content-[''] hover:after:translate-x-[340%] hover:after:opacity-100 hover:after:transition-transform hover:after:duration-700 hover:after:ease-out motion-reduce:after:hidden sm:px-5 xl:px-6">
            <span className="relative z-10 inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[17px] bg-surface-soft transition-shadow duration-500 ease-out group-hover:shadow-[0_12px_24px_-14px_rgba(15,23,42,0.28)] motion-reduce:transition-none">
              <FeatureIcon
                src={FEATURE_ICON_PATHS[item.icon]}
                decorative
                size="md"
                className="transform-gpu transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.12] motion-reduce:transform-none motion-reduce:transition-none"
              />
            </span>
            <div className="relative z-10 min-w-0">
              <h2 className="text-[15px] font-semibold leading-[1.35] text-navy sm:text-[16px]">
                {item.title}
              </h2>
              <p className="mt-1.5 text-[13.5px] leading-[1.55] text-text-secondary sm:text-[14px]">
                {item.description}
              </p>
            </div>
          </article>
        </ScrollReveal>
      ))}
    </div>
  );
}
