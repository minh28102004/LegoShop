"use client";

import { useI18n } from "@/lib/i18n/useI18n";
import { HOME_TRANSLATIONS } from "@/modules/home/data/home.translations";
import type {
  HomeMediaAsset,
  HomePageData,
  HomeMediaSlot,
} from "@/modules/home/types/home.types";

import { CategorySection } from "./CategorySection";
import { FeaturedProducts } from "./FeaturedProducts";
import { FinalCtaSection } from "./FinalCtaSection";
import { FriendshipGiftSection } from "./FriendshipGiftSection";
import { HeroSection } from "./HeroSection";
import { HowToOrder } from "./HowToOrder";
import { StorySection } from "./StorySection";
import { Testimonials } from "./Testimonials";
import { TransformationSection } from "./TransformationSection";

type HomePageContentProps = {
  data: HomePageData;
};

function localizeMedia(
  media: HomeMediaAsset | null,
  alt: string,
): HomeMediaAsset | null {
  return media ? { ...media, alt } : null;
}

function uniqueMedia(
  items: Array<HomeMediaAsset | null>,
  limit: number,
): HomeMediaAsset[] {
  const seenSources = new Set<string>();

  return items.filter((item): item is HomeMediaAsset => {
    if (!item || seenSources.has(item.src) || seenSources.size >= limit) {
      return false;
    }

    seenSources.add(item.src);
    return true;
  });
}

export function HomePageContent({ data }: HomePageContentProps) {
  const { locale } = useI18n();
  const content = HOME_TRANSLATIONS[locale];
  const media = (Object.keys(data.media) as HomeMediaSlot[]).reduce(
    (localized, slot) => {
      localized[slot] = localizeMedia(data.media[slot], content.media.alt[slot]);
      return localized;
    },
    { ...data.media },
  );
  const heroSlides = data.heroSlides.map((slide) => ({
    ...slide,
    alt: content.media.alt.hero,
  }));
  const finalCtaMedia = uniqueMedia(
    [
      media["final-cta"],
      media.transformation,
      media.friendship,
      media.story,
      media.hero,
      ...heroSlides,
    ],
    5,
  );

  return (
    <div className="overflow-x-clip bg-white">
      <HeroSection
        hero={content.hero}
        media={media.hero}
        slides={heroSlides}
      />
      <StorySection
        story={content.story}
        media={media.story}
        mediaLabels={content.media}
      />
      <FriendshipGiftSection
        story={content.friendship}
        media={media.friendship}
        mediaLabels={content.media}
      />
      <TransformationSection
        content={content.transformation}
        media={media.transformation}
        mediaLabels={content.media}
      />
      <FeaturedProducts
        content={content.products}
        products={data.products}
        state={data.productState}
      />
      <HowToOrder content={content.process} />
      <CategorySection
        categories={data.categories}
        content={content.categories}
        state={data.categoryState}
      />
      <Testimonials content={content.testimonials} />
      <FinalCtaSection
        cta={content.finalCta}
        media={finalCtaMedia}
        mediaLabels={content.media}
      />
    </div>
  );
}
