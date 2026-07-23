"use client";

import { useI18n } from "@/lib/i18n/useI18n";

export default function Loading() {
  const { dictionary } = useI18n();
  const copy = dictionary.pageLoading;

  return (
    <section
      data-testid="page-loading"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-busy="true"
      className="relative isolate grid min-h-[calc(100dvh-62px)] place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_38%,#ffffff_0%,#f7fbff_42%,#edf5fb_100%)] px-5 py-12 lg:min-h-[calc(100dvh-58px)]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(47,145,208,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(47,145,208,0.055)_1px,transparent_1px)] [background-size:32px_32px]"
      />
      <span
        aria-hidden="true"
        className="absolute -left-24 top-[18%] h-72 w-72 rounded-full bg-[#79c6f0]/15 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="absolute -right-20 bottom-[14%] h-64 w-64 rounded-full bg-[#f6d76b]/20 blur-3xl"
      />

      <div className="relative flex w-full max-w-[460px] flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe5f3] bg-white/85 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#258fce] shadow-[0_12px_30px_-24px_rgba(18,45,78,0.35)] backdrop-blur-sm sm:text-xs">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-[#f2c94c] shadow-[0_0_0_4px_rgba(242,201,76,0.18)] motion-safe:animate-pulse"
          />
          {dictionary.common.brandName}
        </div>

        <div
          className="mt-2 h-[190px] w-[220px] overflow-hidden"
          aria-hidden="true"
        >
          <div className="brick-stack-loader mx-auto translate-y-5">
            <span className="brick-stack-loader__brick brick-stack-loader__brick--red" />
            <span className="brick-stack-loader__brick brick-stack-loader__brick--yellow" />
            <span className="brick-stack-loader__brick brick-stack-loader__brick--blue" />
            <span className="brick-stack-loader__brick brick-stack-loader__brick--red brick-stack-loader__brick--small" />
            <span className="brick-stack-loader__shadow" />
          </div>
        </div>

        <p className="font-display text-[clamp(1.35rem,4.8vw,1.75rem)] font-bold leading-tight tracking-[-0.025em] text-navy">
          {copy.title}
        </p>
        <p className="mt-3 max-w-[360px] text-sm font-medium leading-6 text-slate-500 sm:text-[15px]">
          {copy.description}
        </p>

        <div
          aria-hidden="true"
          className="mt-7 h-1.5 w-full max-w-[240px] overflow-hidden rounded-full bg-[#dceaf4] shadow-inner"
        >
          <span className="figure-page-loader__progress block h-full w-full rounded-full bg-gradient-to-r from-[#7bc7f0] via-[#2f91d0] to-[#f6d76b]" />
        </div>

        <span className="sr-only">{copy.screenReader}</span>
      </div>
    </section>
  );
}
