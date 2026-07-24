"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Frame, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Container } from "@/components/layout/Container";
import { Modal } from "@/components/ui/Modal";
import { ROUTES } from "@/config/routes";
import { useI18n } from "@/lib/i18n/useI18n";

const MODE_IMAGES = {
  character: {
    position: "object-[50%_48%]",
    src: "/home/minifigure-transformation-result.jpg",
  },
  frame: {
    position: "object-[50%_56%]",
    src: "/home/figure-lab-team-gift.jpg",
  },
} as const;

type StudioModeCardProps = {
  mode: "frame" | "character";
  title: string;
  description: string;
  steps: string[];
  cta: string;
  onSelect: () => void;
};

function StudioModeCard({
  cta,
  description,
  mode,
  onSelect,
  steps,
  title,
}: StudioModeCardProps) {
  const FunctionalIcon = mode === "frame" ? Frame : Sparkles;

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`${title}. ${cta}`}
      className="group relative isolate flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-[24px] border border-[#cfdde8] bg-white p-5 shadow-[0_20px_48px_-38px_rgba(18,45,78,0.32)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-[#9fcce8] hover:shadow-[0_26px_55px_-38px_rgba(18,45,78,0.4)] focus-visible:border-[#258fce] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#258fce] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none sm:p-6"
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onSelect();
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-1/2 z-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/75 to-transparent opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover:translate-x-[460%] group-hover:opacity-70 motion-reduce:hidden"
      />

      <div className="relative z-10 h-[142px] overflow-hidden rounded-[18px] border border-[#dceaf3] bg-[#edf6fb] sm:h-[154px]">
        <Image
          src={MODE_IMAGES[mode].src}
          alt=""
          aria-hidden="true"
          fill
          sizes="(min-width: 768px) 460px, calc(100vw - 80px)"
          className={`object-cover ${MODE_IMAGES[mode].position} transition-transform duration-500 ease-out group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none`}
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#0c213b]/18 via-transparent to-white/5"
        />
        <span className="absolute right-3 top-3 grid size-11 shrink-0 place-items-center rounded-[14px] border border-white/80 bg-white/90 text-[#258fce] shadow-[0_12px_28px_-18px_rgba(18,45,78,0.5)] backdrop-blur-sm">
          <FunctionalIcon className="size-5" aria-hidden="true" />
        </span>
      </div>

      <div className="relative z-10 mt-5">
        <h3 className="text-xl font-bold tracking-[-0.025em] text-navy sm:text-2xl">
          {title}
        </h3>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
          {description}
        </p>
      </div>

      <ul className="relative z-10 mt-5 grid flex-1 gap-2.5">
        {steps.map((step) => (
          <li
            key={step}
            className="flex items-start gap-2.5 text-sm font-semibold leading-5 text-slate-700"
          >
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#e8f5fd] text-[#258fce]">
              <Check className="size-3.5 stroke-[2.5]" aria-hidden="true" />
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ul>

      <span className="relative z-10 mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[15px] bg-[#258fce] px-5 text-sm font-bold text-white transition-[background-color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:bg-[#1d7fb8] group-active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none">
        <span>{cta}</span>
        <ArrowRight
          className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none"
          aria-hidden="true"
        />
      </span>
    </article>
  );
}

export function StudioModeLanding() {
  const router = useRouter();
  const { dictionary } = useI18n();
  const copy = dictionary.studio.modeSelection;
  const [chooserOpen, setChooserOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setChooserOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <section className="relative isolate min-h-[calc(100dvh-62px)] overflow-hidden bg-[radial-gradient(circle_at_18%_18%,rgba(121,198,240,0.2),transparent_34%),radial-gradient(circle_at_82%_78%,rgba(246,215,107,0.18),transparent_32%),linear-gradient(180deg,#fbfdff_0%,#eef6fb_100%)] py-14 lg:min-h-[calc(100dvh-58px)] lg:py-20">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(47,145,208,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(47,145,208,0.05)_1px,transparent_1px)] [background-size:34px_34px]"
        />

        <Container
          size="default"
          className="relative flex min-h-[min(620px,calc(100dvh-180px))] flex-col items-center justify-center text-center"
        >
          <div className="grid size-20 place-items-center rounded-[24px] border border-[#d3e7f3] bg-white shadow-[0_20px_48px_-34px_rgba(18,45,78,0.32)]">
            <Image
              src="/assets/icons/fluent-emoji/artist-palette-3d.png"
              alt=""
              aria-hidden="true"
              width={60}
              height={60}
              className="size-[58px] object-contain"
            />
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#258fce]">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-[clamp(2.15rem,6vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.045em] text-navy">
            {copy.landingTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-slate-600 sm:text-lg">
            {copy.landingDescription}
          </p>
          <button
            type="button"
            onClick={() => setChooserOpen(true)}
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-[15px] bg-[#258fce] px-6 text-sm font-bold text-white shadow-[0_18px_38px_-28px_rgba(22,111,165,0.5)] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#1d7fb8] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#258fce] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
          >
            {copy.openChooser}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </Container>
      </section>

      <Modal
        isOpen={chooserOpen}
        onClose={() => setChooserOpen(false)}
        title={copy.modalTitle}
        size="lg"
        className="max-w-[1040px] rounded-[28px] border border-[#cbdce8] bg-white shadow-[0_34px_90px_-38px_rgba(5,28,56,0.52)]"
        contentClassName="max-h-[calc(100dvh-112px)] bg-[#f5f9fc] p-4 sm:p-6"
      >
        <button
          type="button"
          aria-label={copy.closeModal}
          onClick={() => setChooserOpen(false)}
          className="absolute right-3 top-3 z-20 grid size-11 place-items-center rounded-[14px] text-slate-500 transition-colors hover:bg-[#edf6fc] hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#258fce] sm:right-4 sm:top-3"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        <p className="mb-5 max-w-2xl pr-8 text-sm font-medium leading-6 text-slate-600 sm:text-base">
          {copy.modalDescription}
        </p>

        <div className="grid items-stretch gap-4 md:grid-cols-2">
          <StudioModeCard
            mode="frame"
            title={copy.frame.title}
            description={copy.frame.description}
            steps={copy.frame.steps}
            cta={copy.frame.cta}
            onSelect={() => router.push(ROUTES.studioFrame)}
          />
          <StudioModeCard
            mode="character"
            title={copy.character.title}
            description={copy.character.description}
            steps={copy.character.steps}
            cta={copy.character.cta}
            onSelect={() => router.push(ROUTES.studioCharacter)}
          />
        </div>
      </Modal>
    </>
  );
}
