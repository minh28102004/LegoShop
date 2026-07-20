import { Container } from "@/components/layout/Container";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import type {
  HomeCategoriesContent,
  HomeCategory,
  HomeResourceState,
} from "@/modules/home/types/home.types";

import { CategoryCard } from "./CategoryCard";
import { SectionHeader } from "./SectionHeader";

type CategorySectionProps = {
  categories: HomeCategory[];
  state: HomeResourceState;
  content: HomeCategoriesContent;
};

const CATEGORY_IMAGE_POSITIONS = [
  "50% 52%",
  "50% 48%",
  "50% 48%",
  "50% 45%",
  "50% 48%",
  "50% 42%",
] as const;

export function CategorySection({
  categories,
  content,
  state,
}: CategorySectionProps) {
  return (
    <section
      id="categories"
      data-home-section="categories"
      className="bg-white py-14 md:py-16 lg:py-20"
    >
      <Container
        size="wide"
        className="px-[clamp(1.25rem,4.5vw,5.5rem)]"
      >
        <ScrollReveal>
          <SectionHeader
            align="center"
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.subtitle}
            className="mb-9 sm:mb-10"
          />
        </ScrollReveal>
        {categories.length > 0 ? (
          <div className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5">
            {categories.map((category, index) => (
              <ScrollReveal
                key={category.id}
                delay={(index % 3) * 0.055}
                className="h-full"
              >
                <CategoryCard
                  {...category}
                  imagePosition={
                    CATEGORY_IMAGE_POSITIONS[
                      index % CATEGORY_IMAGE_POSITIONS.length
                    ] ?? "50% 50%"
                  }
                  labels={content.card}
                />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div
            role="status"
            className="rounded-[22px] border border-dashed border-primary/25 bg-primary-light/25 px-6 py-10 text-center"
          >
            <p className="text-[16px] font-semibold text-navy">
              {content.emptyTitle}
            </p>
            <p className="mx-auto mt-2 max-w-[560px] text-[14px] leading-6 text-text-secondary">
              {state === "error"
                ? content.errorDescription
                : content.emptyDescription}
            </p>
          </div>
        )}
      </Container>
    </section>
  );
}
