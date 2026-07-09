"use client";

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
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={() => setStep(4)}
        className="hidden h-10 items-center gap-2 rounded-full border border-[#dce7f1] bg-white px-4 text-[13px] font-semibold text-slate-700 shadow-[0_10px_20px_-22px_rgba(18,45,78,0.18)] transition-all duration-200 hover:-translate-y-px hover:border-[#c6e4f5] hover:bg-[#f8fbff] hover:text-[#2f91d0] md:inline-flex"
      >
        <Save className="h-4 w-4" />
        Save Design
      </button>
      <button
        type="button"
        onClick={() => setStep(4)}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-[#e2b63f] bg-[#ffbc1f] px-4 text-[13px] font-semibold text-[#33220a] shadow-[0_12px_24px_-22px_rgba(217,165,31,0.44)] transition-all duration-200 hover:-translate-y-px hover:bg-[#ffc941]"
      >
        <ShoppingBag className="h-4 w-4" />
        Add to Cart
      </button>
    </div>
  );
}

export function StudioPage() {
  return (
    <StudioProvider>
      <div
        className="studio-workbench flex flex-col overflow-hidden bg-[#f3f8fd] text-slate-950"
        style={{ height: "calc(100dvh - 72px)" }}
      >
        <header className="z-30 flex h-[58px] shrink-0 items-center justify-between gap-4 border-b border-[#e5eef6] bg-white/95 px-4 shadow-[0_10px_22px_-24px_rgba(18,45,78,0.14)] backdrop-blur-xl sm:px-6">
          <div className="hidden xl:block xl:w-[220px]" />
          <div className="hidden min-w-0 flex-1 justify-center xl:flex">
            <StudioStepper />
          </div>
          <StudioHeaderActions />
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <div className="hidden min-h-0 shrink-0 border-r border-[#e8eff6] bg-white md:flex">
              <StudioSidebar />
            </div>

            <main className="relative min-w-0 flex-1 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(194,226,245,0.22),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#eef4fa_100%)]">
              <div className="flex h-full min-h-0 flex-col">
                <div className="border-b border-[#e5eef6] bg-white px-3 py-2 shadow-[0_8px_16px_-18px_rgba(18,45,78,0.16)] md:hidden">
                  <StudioStepper />
                </div>
                <div className="min-h-0 flex-1">
                  <StudioCanvas />
                </div>
              </div>
            </main>
          </div>

          <aside className="min-h-[340px] shrink-0 overflow-hidden border-t border-[#e5eef6] bg-white shadow-[0_-8px_24px_rgba(15,23,42,0.04)] lg:h-auto lg:w-[368px] lg:border-l lg:border-t-0 lg:shadow-[0_16px_36px_rgba(15,23,42,0.07)] xl:w-[392px]">
            <StudioRightPanel />
          </aside>
        </div>
      </div>
    </StudioProvider>
  );
}
