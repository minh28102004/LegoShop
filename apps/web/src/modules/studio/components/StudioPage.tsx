"use client";

import { Suspense } from "react";
import { Save, ShoppingBag } from "lucide-react";

import { StudioCanvas } from "@/modules/studio/components/StudioCanvas";
import {
  StudioProvider,
  useStudio,
} from "@/modules/studio/components/StudioContext";
import { StudioRightPanel } from "@/modules/studio/components/StudioRightPanel";
import { StudioSidebar } from "@/modules/studio/components/StudioSidebar";
import { StudioStepper } from "@/modules/studio/components/StudioStepper";

function StudioHeaderActions() {
  const { setStep } = useStudio();

  return (
  <div className="flex shrink-0 items-center gap-2.5">
  <button
    type="button"
    onClick={() => setStep(4)}
    className="group hidden h-11 items-center gap-2 rounded-full border border-[#dce7f1] bg-white px-4 text-[13px] font-semibold text-slate-700 shadow-[0_8px_18px_-14px_rgba(18,45,78,0.28)] transition-all duration-200 ease-out hover:-translate-y-px hover:border-[#b8d9ee] hover:bg-[#f8fbff] hover:text-[#2f91d0] hover:shadow-[0_14px_26px_-16px_rgba(47,145,208,0.38)] active:translate-y-0 active:shadow-[0_6px_14px_-12px_rgba(47,145,208,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f91d0]/30 focus-visible:ring-offset-2 md:inline-flex"
  >
    <Save className="h-5 w-5 transition-transform duration-200 ease-out group-hover:-translate-y-0.5" />
    Save Design
  </button>

  <button
    type="button"
    onClick={() => setStep(4)}
    className="group inline-flex h-11 items-center gap-2 rounded-full border border-[#e0ad1c] bg-[#ffbc1f] px-4 text-[13px] font-semibold text-[#33220a] shadow-[0_10px_22px_-14px_rgba(217,165,31,0.46)] transition-all duration-200 ease-out hover:-translate-y-px hover:border-[#d99f0d] hover:bg-[#ffc941] hover:shadow-[0_16px_30px_-15px_rgba(217,165,31,0.6)] active:translate-y-0 active:scale-[0.98] active:shadow-[0_7px_16px_-12px_rgba(217,165,31,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffbc1f]/50 focus-visible:ring-offset-2"
  >
    <ShoppingBag className="h-5 w-5 transition-transform duration-200 ease-out group-hover:-rotate-6 group-hover:scale-110" />
    Add to Cart
  </button>
</div>
  );
}

export function StudioPage() {
  return (
    <Suspense fallback={null}>
      <StudioProvider>
      <div className="studio-workbench flex h-[calc(100dvh-62px)] flex-col overflow-hidden bg-[#f3f8fd] pt-2 text-slate-950 lg:h-[calc(100dvh-58px)] lg:pt-3">
        <header className="z-30 flex h-[58px] shrink-0 items-center justify-between gap-4 border-b border-[#e5eef6] bg-white/95 px-4 backdrop-blur-xl sm:px-6">
          <div className="hidden xl:block xl:w-[220px]" />

          <div className="hidden min-w-0 flex-1 items-center justify-center xl:flex">
            <StudioStepper />
          </div>

          <StudioHeaderActions />
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <div className="hidden min-h-0 shrink-0 border-r border-[#e8eff6] bg-white md:flex">
              <StudioSidebar />
            </div>

            <main className="relative min-w-0 flex-1 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(194,226,245,0.18),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#eef4fa_100%)]">
              <div className="flex h-full min-h-0 flex-col">
                <div className="border-b border-[#e5eef6] bg-white px-3 py-2 md:hidden">
                  <StudioStepper />
                </div>

                <div className="min-h-0 flex-1">
                  <StudioCanvas />
                </div>
              </div>
            </main>
          </div>

          <aside className="min-h-[340px] shrink-0 border-t border-[#e5eef6] bg-white lg:h-auto lg:w-[368px] lg:border-l lg:border-t-0 xl:w-[392px]">
            <StudioRightPanel />
          </aside>
        </div>
      </div>
      </StudioProvider>
    </Suspense>
  );
}
