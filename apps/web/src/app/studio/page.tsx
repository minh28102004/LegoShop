import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StudioCanvas } from "@/components/studio/StudioCanvas";
import { StudioProvider } from "@/components/studio/StudioContext";
import { StudioStepper } from "@/components/studio/StudioStepper";
import { StudioRightPanel } from "@/components/studio/StudioRightPanel";

export default function StudioPage() {
  return (
    <StudioProvider>
      <div className="studio-workbench flex flex-col overflow-hidden bg-white" style={{ height: "calc(100dvh - 60px)" }}>
        {/* ─── Top Bar ─── */}
        <div className="shrink-0 border-b border-border bg-white px-4 py-3 sm:px-6 sm:py-4">
          <nav className="mb-2 flex items-center gap-1.5 text-xs text-zinc-400">
            <Link href="/" className="text-zinc-500 hover:text-zinc-700">
              Trang chủ
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-zinc-500">studio.design</span>
          </nav>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-lg font-black tracking-tight text-zinc-900 sm:text-[22px]">
              Thiết kế & Mua hàng
            </h1>
            <StudioStepper />
          </div>
        </div>

        {/* ─── Main Content ─── */}
        {/* Desktop: row (canvas + panel). Mobile: col (canvas on top, panel below) */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          {/* Canvas area */}
          <div className="relative flex min-w-0 flex-col overflow-hidden bg-[#f4f5f7] lg:flex-1"
               style={{ height: "50vh" }}
               // On desktop the height is controlled by flex-1 + overflow; on mobile we cap at 50vh
          >
            <style>{`@media (min-width: 1024px) { .studio-canvas-wrap { height: auto !important; flex: 1; } }`}</style>
            <div className="studio-canvas-wrap flex flex-1 flex-col overflow-hidden" style={{ height: "50vh" }}>
              <StudioCanvas />
            </div>
          </div>

          {/* Right panel */}
          {/* Desktop: fixed 520px right sidebar. Mobile: full-width scrollable bottom section */}
          <div className="flex min-h-0 flex-col overflow-y-auto border-t border-border bg-white lg:w-[520px] lg:max-w-[44vw] lg:shrink-0 lg:overflow-hidden lg:border-l lg:border-t-0">
            <StudioRightPanel />
          </div>
        </div>
      </div>
    </StudioProvider>
  );
}
