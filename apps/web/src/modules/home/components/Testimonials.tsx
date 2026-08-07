"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Quote,
  Star,
  X,
} from "lucide-react";

import { Container } from "@/components/layout/Container";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Modal } from "@/components/ui/Modal";
import type { HomeTestimonialsContent } from "@/modules/home/types/home.types";

import { DecorativeBrick } from "./DecorativeBrick";
import { SectionHeader } from "./SectionHeader";

type TestimonialsProps = {
  content: HomeTestimonialsContent;
};

type ImagePreview = {
  images: string[];
  index: number;
  name: string;
  productType: string;
};

export function Testimonials({ content }: TestimonialsProps) {
  const [preview, setPreview] = useState<ImagePreview | null>(null);
  const closePreview = useCallback(() => setPreview(null), []);
  const movePreview = useCallback((direction: -1 | 1) => {
    setPreview((current) => {
      if (!current || current.images.length < 2) return current;

      return {
        ...current,
        index:
          (current.index + direction + current.images.length) %
          current.images.length,
      };
    });
  }, []);

  useEffect(() => {
    if (!preview || preview.images.length < 2) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") movePreview(-1);
      if (event.key === "ArrowRight") movePreview(1);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [movePreview, preview]);

  const previewImage = preview?.images[preview.index];

  return (
    <>
      <section
        data-home-section="testimonials"
        className="relative overflow-hidden bg-[#f4f8fc] py-12 md:py-16 lg:py-18"
      >
        <DecorativeBrick
          tone="blue"
          studs={3}
          className="absolute left-[6%] top-16 hidden -rotate-6 opacity-55 xl:inline-grid"
        />
        <Container size="wide" className="relative">
          <ScrollReveal>
            <SectionHeader
              align="center"
              eyebrow={content.eyebrow}
              title={content.title}
              subtitle={content.subtitle}
              className="mb-9 sm:mb-10"
            />
          </ScrollReveal>

          <div className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
            {content.items.map((item, index) => (
              <ScrollReveal
                key={item.id ?? `${item.name}-${index}`}
                delay={index * 0.06}
                className="h-full"
              >
                <article className="group relative flex h-full flex-col rounded-[22px] border border-border bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_16px_34px_-28px_rgba(16,36,62,0.34)] motion-reduce:transform-none sm:p-7">
                  {item.isSample ? (
                    <span className="mb-4 inline-flex w-fit rounded-full border border-primary/15 bg-primary-light/45 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-primary-dark">
                      {content.sampleLabel}
                    </span>
                  ) : null}
                  <span className="absolute right-6 top-6 inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-accent-soft text-accent-dark transition-colors duration-300 group-hover:bg-accent">
                    <Quote className="h-5 w-5" fill="currentColor" />
                  </span>
                  <div
                    className="flex items-center gap-1 text-accent-dark"
                    aria-label={`${item.rating} ${content.ratingSuffix}`}
                  >
                    {Array.from({ length: item.rating }).map((_, starIndex) => (
                      <Star
                        key={`${item.name}-${starIndex}`}
                        className="h-4 w-4 fill-current"
                      />
                    ))}
                  </div>
                  {item.images?.[0] ? (
                    <button
                      type="button"
                      aria-label={`${content.openImage}: ${item.name}`}
                      className="group/image relative mt-4 block w-full overflow-hidden rounded-[16px] border border-border bg-[#f8fafc] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      onClick={() =>
                        setPreview({
                          images: item.images ?? [],
                          index: 0,
                          name: item.name,
                          productType: item.productType,
                        })
                      }
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.images[0]}
                        alt={`${item.name} - ${item.productType}`}
                        loading="lazy"
                        className="h-44 w-full object-cover object-top transition-transform duration-300 group-hover/image:scale-[1.025] sm:h-48"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-navy/0 transition-colors group-hover/image:bg-navy/20 group-focus-visible/image:bg-navy/20">
                        <span className="inline-flex h-11 w-11 scale-90 items-center justify-center rounded-full bg-white/95 text-navy opacity-0 shadow-lg transition-all group-hover/image:scale-100 group-hover/image:opacity-100 group-focus-visible/image:scale-100 group-focus-visible/image:opacity-100">
                          <Maximize2 className="h-5 w-5" />
                        </span>
                      </span>
                      {item.images.length > 1 ? (
                        <span className="absolute bottom-2 right-2 rounded-full bg-navy/85 px-2.5 py-1 text-[11px] font-semibold text-white">
                          +{item.images.length - 1}
                        </span>
                      ) : null}
                    </button>
                  ) : null}
                  <p className="mt-4 flex-1 text-[15px] leading-[1.7] text-text-secondary sm:text-[15.5px]">
                    “{item.quote}”
                  </p>
                  <div className="mt-auto flex items-center gap-3 pt-6">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-[14px] font-semibold text-primary-dark transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                      {item.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-[14.5px] font-semibold text-navy sm:text-[15px]">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-[13.5px] font-medium text-muted sm:text-[14px]">
                        {item.productType}
                      </p>
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      <Modal
        isOpen={preview !== null}
        onClose={closePreview}
        size="full"
        title={
          preview
            ? `${content.imagePreview}: ${preview.name}`
            : content.imagePreview
        }
        className="flex flex-col bg-[#071d3a]"
        headerClassName="border-white/15 bg-[#071d3a] text-white"
        titleClassName="truncate text-lg text-white sm:text-xl"
        contentClassName="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black/90 p-2 sm:p-6"
        headerAccessory={
          <button
            type="button"
            aria-label={content.closeImage}
            onClick={closePreview}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-5 w-5" />
          </button>
        }
      >
        {preview && previewImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage}
              alt={`${preview.name} - ${preview.productType}`}
              className="max-h-full max-w-full object-contain"
            />

            {preview.images.length > 1 ? (
              <>
                <button
                  type="button"
                  aria-label={content.previousImage}
                  onClick={() => movePreview(-1)}
                  className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 text-white shadow-lg transition-colors hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-6 sm:h-12 sm:w-12"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  aria-label={content.nextImage}
                  onClick={() => movePreview(1)}
                  className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 text-white shadow-lg transition-colors hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-6 sm:h-12 sm:w-12"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1.5 text-sm font-semibold text-white sm:bottom-6">
                  {preview.index + 1}/{preview.images.length}
                </span>
              </>
            ) : null}
          </>
        ) : null}
      </Modal>
    </>
  );
}
