"use client";

import type { Product } from "@lego-shop/shared";
import { formatCurrency } from "@lego-shop/shared";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Container } from "@/components/layout/Container";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/config/routes";
import { resolveApiAssetUrl } from "@/lib/api/assets";
import { publicApiClient } from "@/lib/api/public-client";
import { BUSINESS_SHOWCASE_IMAGES } from "@/modules/business/data/business-page.data";
import type { BusinessPageCopy } from "@/modules/business/types/business-page.types";

type BusinessShowcaseProps = {
  copy: BusinessPageCopy["showcase"];
};

export function BusinessShowcase({ copy }: BusinessShowcaseProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        let response = await publicApiClient.products.listProductCatalog({
          featured: true,
          page: 1,
          pageSize: 4,
          sort: "featured",
        });

        if (response.items.length === 0) {
          response = await publicApiClient.products.listProductCatalog({
            page: 1,
            pageSize: 4,
            sort: "newest",
          });
        }

        if (active) {
          setProducts(Array.isArray(response.items) ? response.items.slice(0, 4) : []);
        }
      } catch (error) {
        console.error("[business-showcase] Failed to load products", error);
        if (active) setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProducts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="business-showcase" className="bg-white py-14 sm:py-16 lg:py-20">
      <Container size="wide">
        <ScrollReveal className="mb-9 flex flex-col gap-5 sm:mb-11 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold tracking-[0.2em] text-[#1989c9] sm:text-sm">
              {copy.eyebrow}
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-[-0.035em] text-[#071d3a] sm:text-4xl lg:text-5xl">
              {copy.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              {copy.description}
            </p>
          </div>
          <Button asChild variant="ghost" className="w-fit rounded-full text-[#147fbd]">
            <Link href={ROUTES.collection}>
              {copy.viewCollection}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </ScrollReveal>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-[430px] animate-pulse rounded-[24px] bg-[#eef5ff]" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {copy.fallbackItems.map((fallback, index) => {
              const product = products[index];
              const imageUrl =
                resolveApiAssetUrl(product?.images?.[0]) ||
                BUSINESS_SHOWCASE_IMAGES[index] ||
                BUSINESS_SHOWCASE_IMAGES[0];
              const title = product?.name?.trim() || fallback.title;
              const description = product?.description?.trim() || fallback.description;
              const occasion = product?.collection?.name?.trim() || fallback.occasion;
              const detailHref = product?.slug
                ? `${ROUTES.collection}?product=${encodeURIComponent(product.slug)}`
                : ROUTES.collection;
              const consultParams = new URLSearchParams({ message: title });

              return (
                <ScrollReveal key={product?.id ?? fallback.title} delay={index * 0.05} className="h-full">
                  <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-[#dbe8f4] bg-white shadow-[0_14px_35px_-30px_rgba(7,29,58,0.42)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#b9d8ed] hover:shadow-[0_20px_44px_-30px_rgba(7,29,58,0.5)]">
                    <Link href={detailHref} className="relative block aspect-[4/3] overflow-hidden bg-[#eef5ff]">
                      <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        sizes="(min-width: 1024px) 22vw, (min-width: 640px) 46vw, 92vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />
                      <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#147fbd] backdrop-blur">
                        {occasion}
                      </span>
                    </Link>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-xl font-bold leading-tight text-[#071d3a]">{title}</h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{description}</p>

                      <div className="mt-auto pt-6">
                        {product ? (
                          <p className="text-sm font-semibold text-slate-500">
                            {copy.priceFrom}{" "}
                            <span className="text-lg font-bold text-[#147fbd]">
                              {formatCurrency(Number(product.basePrice) || 0)}
                            </span>
                          </p>
                        ) : null}
                        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                          <Button asChild variant="outline" className="rounded-full px-4">
                            <Link href={detailHref}>
                              {copy.viewDetail}
                              <ArrowUpRight className="size-4" aria-hidden="true" />
                            </Link>
                          </Button>
                          <Button
                            asChild
                            variant="ghost"
                            className="h-11 w-11 rounded-full border border-[#cfe3f2] p-0 text-[#147fbd]"
                          >
                            <Link href={`${ROUTES.business}?${consultParams.toString()}#business-consultation`} aria-label={`${copy.consult}: ${title}`}>
                              <MessageCircle className="size-4" aria-hidden="true" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
