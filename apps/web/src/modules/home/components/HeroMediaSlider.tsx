"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@lego-shop/ui";

import type {
  HomeHeroSliderLabels,
  HomeMediaAsset,
} from "@/modules/home/types/home.types";

const SLIDE_INTERVAL_MS = 5200;

type HeroMediaSliderProps = {
  slides: HomeMediaAsset[];
  labels: HomeHeroSliderLabels;
};

export function HeroMediaSlider({ labels, slides }: HeroMediaSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMultipleSlides = slides.length > 1;

  const showSlide = useCallback(
    (nextIndex: number) => {
      if (!hasMultipleSlides || nextIndex === activeIndex) return;
      setPreviousIndex(activeIndex);
      setActiveIndex((nextIndex + slides.length) % slides.length);

      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = setTimeout(() => setPreviousIndex(null), 700);
    },
    [activeIndex, hasMultipleSlides, slides.length],
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!hasMultipleSlides || paused || reducedMotion) return;
    const interval = window.setInterval(
      () => showSlide((activeIndex + 1) % slides.length),
      SLIDE_INTERVAL_MS,
    );
    return () => window.clearInterval(interval);
  }, [activeIndex, hasMultipleSlides, paused, reducedMotion, showSlide, slides.length]);

  useEffect(
    () => () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    },
    [],
  );

  const activeSlide = slides[activeIndex];
  const previousSlide = previousIndex === null ? null : slides[previousIndex];
  const nextSlide = slides[(activeIndex + 1) % slides.length];

  if (!activeSlide) return null;

  return (
    <div
      className="group relative aspect-square max-h-[400px] w-full overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,#edf7ff_0%,#fffdf7_100%)] shadow-[0_30px_70px_-48px_rgba(15,35,60,0.5)] sm:aspect-[3/2] sm:max-h-[480px] lg:aspect-[3/2] lg:max-h-[500px] xl:max-h-[520px] 2xl:max-h-[540px]"
      role="region"
      aria-label={labels.gallery}
      aria-roledescription="carousel"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") showSlide(activeIndex - 1);
        if (event.key === "ArrowRight") showSlide(activeIndex + 1);
      }}
    >
      {previousSlide ? (
        <Image
          key={`previous-${previousSlide.src}`}
          src={previousSlide.src}
          alt=""
          fill
          aria-hidden="true"
          sizes="(max-width: 1023px) calc(100vw - 40px), 56vw"
          className="object-cover object-center opacity-100"
        />
      ) : null}
      <Image
        key={activeSlide.src}
        src={activeSlide.src}
        alt={activeSlide.alt}
        fill
        priority={activeIndex === 0}
        loading={activeIndex === 0 ? undefined : "eager"}
        sizes="(max-width: 1023px) calc(100vw - 40px), 56vw"
        className={cn(
          "object-cover object-center",
          !reducedMotion && "animate-home-hero-fade",
        )}
      />

      {hasMultipleSlides ? (
        <>
          {nextSlide ? (
            <Image
              src={nextSlide.src}
              alt=""
              fill
              aria-hidden="true"
              sizes="(max-width: 1023px) calc(100vw - 40px), 56vw"
              className="pointer-events-none -z-10 object-cover object-center opacity-0"
            />
          ) : null}
          <button
            type="button"
            onClick={() => showSlide(activeIndex - 1)}
            className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-white/85 text-navy opacity-0 shadow-sm backdrop-blur transition-all duration-200 hover:bg-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 group-hover:opacity-100"
            aria-label={labels.previous}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => showSlide(activeIndex + 1)}
            className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-white/85 text-navy opacity-0 shadow-sm backdrop-blur transition-all duration-200 hover:bg-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 group-hover:opacity-100"
            aria-label={labels.next}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}
    </div>
  );
}
