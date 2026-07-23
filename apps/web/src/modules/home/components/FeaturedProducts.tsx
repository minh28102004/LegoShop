"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

import { Container } from "@/components/layout/Container";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { ROUTES } from "@/config/routes";
import { useI18n } from "@/lib/i18n/useI18n";
import type {
  HomeFeaturedProduct,
  HomeProductsContent,
  HomeResourceState,
} from "@/modules/home/types/home.types";

import { ProductCard } from "./ProductCard";
import { ProductTemplateDetailModal } from "./ProductTemplateDetailModal";
import { SectionHeader } from "./SectionHeader";

type FeaturedProductsProps = {
  products: HomeFeaturedProduct[];
  state: HomeResourceState;
  content: HomeProductsContent;
};

type SelectedProduct = Pick<HomeFeaturedProduct, "id" | "slug" | "title">;

export function FeaturedProducts({
  content,
  products,
  state,
}: FeaturedProductsProps) {
  const router = useRouter();
  const { dictionary } = useI18n();
  const [selectedProduct, setSelectedProduct] =
    useState<SelectedProduct | null>(null);
  const detailLabels = dictionary.productDetail;
  const visibleProducts = products.slice(0, 4);
  const closeProductModal = useCallback(() => setSelectedProduct(null), []);
  const openProductModal = useCallback(
    (product: HomeFeaturedProduct) => {
      const id = product.id?.trim();
      const slug = product.slug?.trim();

      if (!id || !slug) {
        console.error("[featured-products] Product is missing id or slug", {
          id: product.id,
          slug: product.slug,
        });
        toast.error(detailLabels.loadError);
        return;
      }

      setSelectedProduct({ id, slug, title: product.title });
    },
    [detailLabels.loadError],
  );

  return (
    <>
      <section
        data-home-section="products"
        className="bg-gradient-to-b from-amber-50/40 via-slate-100 to-white py-12 md:py-16 lg:py-20"
      >
        <Container
          size="full"
          className="max-w-[1520px] px-4 sm:px-6 lg:px-8"
        >
          <ScrollReveal>
            <SectionHeader
              eyebrow={content.eyebrow}
              title={content.title}
              subtitle={content.subtitle}
              cta={content.cta}
              className="mb-9 sm:mb-10"
            />
          </ScrollReveal>

          {visibleProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 min-[1200px]:grid-cols-4 xl:grid-cols-4 xl:gap-6">
              {visibleProducts.map((product, index) => (
                <ScrollReveal
                  key={product.id}
                  delay={index * 0.045}
                  className="h-full"
                >
                  <ProductCard
                    {...product}
                    detailLabels={detailLabels}
                    onSelect={openProductModal}
                    onConsult={(selectedProduct) => {
                      const message = detailLabels.consultationMessage(
                        selectedProduct.title,
                      );
                      const params = new URLSearchParams({
                        product: selectedProduct.title,
                        productId: selectedProduct.id,
                        message,
                      });
                      router.push(`${ROUTES.business}?${params.toString()}`);
                    }}
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

      <ProductTemplateDetailModal
        isOpen={selectedProduct !== null}
        slug={selectedProduct?.slug ?? null}
        labels={detailLabels}
        onClose={closeProductModal}
      />
    </>
  );
}
