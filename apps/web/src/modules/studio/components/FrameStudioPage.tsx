"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

import { StudioCanvas } from "@/modules/studio/components/StudioCanvas";
import {
  StudioProvider,
  useStudio,
} from "@/modules/studio/components/StudioContext";
import { StudioRightPanel } from "@/modules/studio/components/StudioRightPanel";
import { StudioStepper } from "@/modules/studio/components/StudioStepper";
import { StudioToolDrawer } from "@/modules/studio/components/StudioToolDrawer";
import { StudioToolRail } from "@/modules/studio/components/StudioToolRail";
import { useStudioI18n } from "@/modules/studio/hooks/useStudioI18n";
import type { StudioTool } from "@/modules/studio/state/studio.types";

function StudioWorkspace() {
  const { activeStep, isContextPanelCollapsed, setIsContextPanelCollapsed } =
    useStudio();
  const { text } = useStudioI18n();
  const panelRef = useRef<HTMLElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const toolTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [activeQuickTool, setActiveQuickTool] =
    useState<StudioTool>("background");
  const [isToolDrawerOpen, setIsToolDrawerOpen] = useState(false);
  const panelOpen = !isContextPanelCollapsed;

  const handleToolDrawerOpenChange = useCallback(
    (open: boolean, trigger?: HTMLButtonElement | null) => {
      if (trigger) toolTriggerRef.current = trigger;
      setIsToolDrawerOpen(open);

      if (!open && toolTriggerRef.current) {
        window.requestAnimationFrame(() => toolTriggerRef.current?.focus());
      }
    },
    [],
  );

  const closeToolDrawer = useCallback(() => {
    handleToolDrawerOpenChange(false);
  }, [handleToolDrawerOpenChange]);

  useEffect(() => {
    const scrollRoot = document.querySelector<HTMLElement>("#site-scroll-root");
    if (!scrollRoot) return;

    const previousOverflowY = scrollRoot.style.overflowY;
    const previousOverscrollBehavior = scrollRoot.style.overscrollBehavior;
    const previousScrollTop = scrollRoot.scrollTop;

    scrollRoot.scrollTop = 0;
    scrollRoot.style.overflowY = "hidden";
    scrollRoot.style.overscrollBehavior = "none";

    return () => {
      scrollRoot.style.overflowY = previousOverflowY;
      scrollRoot.style.overscrollBehavior = previousOverscrollBehavior;
      scrollRoot.scrollTop = previousScrollTop;
    };
  }, []);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 1023px)");
    const closePanelOnMobile = () => {
      if (mobileQuery.matches) setIsContextPanelCollapsed(true);
    };

    closePanelOnMobile();
    mobileQuery.addEventListener("change", closePanelOnMobile);

    return () => {
      mobileQuery.removeEventListener("change", closePanelOnMobile);
    };
  }, [setIsContextPanelCollapsed]);

  useEffect(() => {
    if (!panelOpen || !window.matchMedia("(max-width: 1023px)").matches) {
      return;
    }

    const panel = panelRef.current;
    if (!panel) return;

    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousBodyOverflow = document.body.style.overflow;
    const scrollRoot = document.querySelector<HTMLElement>("#site-scroll-root");
    const previousRootOverflow = scrollRoot?.style.overflow ?? "";
    document.body.style.overflow = "hidden";
    if (scrollRoot) scrollRoot.style.overflow = "hidden";

    const getFocusableElements = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("inert"));

    const focusFrame = window.requestAnimationFrame(() => {
      panel.querySelector<HTMLElement>("[data-studio-panel-close]")?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsContextPanelCollapsed(true);
        return;
      }

      if (event.key !== "Tab") return;
      const focusableElements = getFocusableElements();
      const first = focusableElements[0];
      const last = focusableElements.at(-1);
      if (!first || !last) {
        event.preventDefault();
        panel.focus();
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      if (scrollRoot) scrollRoot.style.overflow = previousRootOverflow;
      returnFocusRef.current?.focus();
    };
  }, [panelOpen, setIsContextPanelCollapsed]);

  return (
    <div className="studio-workbench flex h-[calc(100dvh-62px)] min-h-0 flex-col overflow-hidden overscroll-none bg-[#f3f8fd] text-slate-950 lg:h-[calc(100dvh-58px)] xl:h-[calc(100dvh-62px)]">
      <header className="z-30 flex h-14 shrink-0 items-center border-b border-[#e5edf5] bg-white/95 backdrop-blur-xl">
        <div className="hidden w-[72px] shrink-0 lg:block" aria-hidden="true" />
        <div className="min-w-0 flex-1 overflow-x-auto px-3 scrollbar-hide sm:px-5">
          <StudioStepper />
        </div>

        {panelOpen ? (
          <div className="hidden h-full w-[calc(40%_-_28.8px)] shrink-0 items-center justify-between gap-3 border-l border-[#e5edf5] bg-white px-4 lg:flex">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2f91d0]">
                {text.common.studioLabel}
              </p>
              <h2 className="truncate text-base font-bold leading-tight text-slate-950">
                {text.workflow[activeStep]}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsContextPanelCollapsed(true)}
              aria-label={text.common.closePanel}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 outline-none transition-colors duration-200 hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-[#9ed0ef]/60"
            >
              <PanelRightClose className="h-[18px] w-[18px]" />
            </button>
          </div>
        ) : (
          <div className="hidden shrink-0 items-center pr-4 lg:flex">
            <button
              type="button"
              onClick={() => setIsContextPanelCollapsed(false)}
              aria-label={text.common.openPanel}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#dbe7f1] bg-white px-3 text-xs font-semibold text-slate-600 transition-colors duration-200 hover:border-[#b9d8ed] hover:bg-[#f8fbff] hover:text-[#2f91d0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ed0ef]/70"
            >
              <PanelRightOpen className="h-4 w-4" aria-hidden="true" />
              {text.common.openPanel}
            </button>
          </div>
        )}
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <StudioToolRail
          activeTool={activeQuickTool}
          drawerOpen={isToolDrawerOpen}
          onActiveToolChange={setActiveQuickTool}
          onDrawerOpenChange={handleToolDrawerOpenChange}
        />

        <StudioToolDrawer
          activeTool={activeQuickTool}
          open={isToolDrawerOpen}
          onClose={closeToolDrawer}
        />

        <main className="relative order-1 min-h-0 min-w-0 flex-1 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(194,226,245,0.2),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4fa_100%)] lg:order-none">
          <StudioCanvas />
        </main>

        {panelOpen ? (
          <button
            type="button"
            aria-label={text.common.closePanel}
            onClick={() => setIsContextPanelCollapsed(true)}
            className="fixed inset-0 z-[80] bg-slate-950/35 opacity-100 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden"
          />
        ) : null}

        <aside
          ref={panelRef}
          role="dialog"
          aria-label={text.common.studioTools}
          aria-modal={panelOpen ? "true" : undefined}
          aria-hidden={!panelOpen}
          inert={!panelOpen}
          tabIndex={-1}
          className={[
            "fixed inset-x-0 bottom-0 z-[90] h-[min(78dvh,720px)] min-h-0 w-full overflow-hidden rounded-t-[28px] border-t border-[#e5edf5] bg-white shadow-[0_-24px_60px_-40px_rgba(15,23,42,0.45)]",
            "transition-[transform,width] duration-300 ease-out motion-reduce:transition-none",
            "lg:relative lg:inset-auto lg:z-20 lg:h-auto lg:shrink-0 lg:translate-y-0 lg:rounded-none lg:border-l lg:border-t-0 lg:shadow-none",
            panelOpen
              ? "translate-y-0 lg:w-[calc(40%_-_28.8px)]"
              : "pointer-events-none translate-y-full lg:w-0 lg:border-l-0",
          ].join(" ")}
        >
          <StudioRightPanel />
        </aside>
      </div>
    </div>
  );
}

export function FrameStudioPage() {
  return (
    <Suspense fallback={null}>
      <StudioProvider>
        <StudioWorkspace />
      </StudioProvider>
    </Suspense>
  );
}
