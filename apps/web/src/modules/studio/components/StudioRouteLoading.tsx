"use client";

import { useI18n } from "@/lib/i18n/useI18n";

export function StudioRouteLoading() {
  const { dictionary } = useI18n();
  const copy = dictionary.studio.routeLoading;

  return (
    <section
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="grid min-h-[calc(100dvh-62px)] place-items-center bg-[radial-gradient(circle_at_50%_38%,#ffffff_0%,#f4faff_48%,#eaf3f9_100%)] px-5 lg:min-h-[calc(100dvh-58px)]"
    >
      <div className="flex max-w-sm flex-col items-center text-center">
        <div className="brick-bounce-loader" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <p className="mt-5 text-xl font-bold tracking-[-0.025em] text-navy">
          {copy.title}
        </p>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
          {copy.description}
        </p>
        <span className="sr-only">{copy.screenReader}</span>
      </div>
    </section>
  );
}
