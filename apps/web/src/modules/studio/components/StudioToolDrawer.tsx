"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import { X } from "lucide-react";

import { useStudioI18n } from "../hooks/useStudioI18n";
import type { StudioTool } from "../state/studio.types";
import { StudioCharacterLibraryPanel } from "./StudioRightPanel";
import { StudioSidebar } from "./StudioSidebar";
import {
  STUDIO_QUICK_TOOLS,
  STUDIO_TOOL_DRAWER_ID,
  StudioToolIcon,
} from "./StudioToolRail";

type StudioToolDrawerProps = {
  activeTool: StudioTool;
  open: boolean;
  onClose: () => void;
};

export function StudioToolDrawer({
  activeTool,
  open,
  onClose,
}: StudioToolDrawerProps) {
  const { text } = useStudioI18n();
  const drawerRef = useRef<HTMLElement | null>(null);
  const contentControls = useAnimationControls();
  const reduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const labels = text.sidebar.tabs as Record<string, string>;

  const descriptions: Record<string, string> = {
    frame: text.panels.selectSize,
    background: text.panels.chooseBackground,
    image: text.sidebar.uploadFormats,
    text: text.canvas.addText,
    characters: text.panels.noCharactersHint,
    accessories: text.panels.accessoriesAndCharms,
    layers: text.sidebar.tabs.layers,
  };

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobile(mobileQuery.matches);

    updateViewport();
    mobileQuery.addEventListener("change", updateViewport);
    return () => mobileQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose, open]);

  useEffect(() => {
    if (!open || !isMobile) return;

    const drawer = drawerRef.current;
    if (!drawer) return;

    const scrollRoot = document.querySelector<HTMLElement>("#site-scroll-root");
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = scrollRoot?.style.overflow ?? "";
    document.body.style.overflow = "hidden";
    if (scrollRoot) scrollRoot.style.overflow = "hidden";

    const getFocusableElements = () =>
      Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

    const focusFrame = window.requestAnimationFrame(() => {
      drawer
        .querySelector<HTMLElement>("[data-studio-tool-drawer-close]")
        ?.focus();
    });

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusable = getFocusableElements();
      const first = focusable[0];
      const last = focusable.at(-1);

      if (!first || !last) {
        event.preventDefault();
        drawer.focus();
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

    document.addEventListener("keydown", trapFocus);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", trapFocus);
      document.body.style.overflow = previousBodyOverflow;
      if (scrollRoot) scrollRoot.style.overflow = previousRootOverflow;
    };
  }, [isMobile, open]);

  useEffect(() => {
    if (!open) return;

    void contentControls.start({
      opacity: reduceMotion ? 1 : [0.72, 1],
      x: reduceMotion ? 0 : [8, 0],
      transition: {
        duration: reduceMotion ? 0 : 0.16,
        ease: "easeOut",
      },
    });
  }, [activeTool, contentControls, open, reduceMotion]);

  const title =
    activeTool === "text"
      ? text.workflow.content
      : (labels[activeTool] ?? activeTool);
  const description = descriptions[activeTool] ?? text.common.studioTools;
  const activeToolConfig = STUDIO_QUICK_TOOLS.find(
    (tool) => tool.id === activeTool,
  );

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label={text.common.closePanel}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            className="absolute inset-0 z-[35] bg-slate-950/30 backdrop-blur-[1px] md:hidden"
          />

          <motion.aside
            id={STUDIO_TOOL_DRAWER_ID}
            ref={drawerRef}
            role="dialog"
            aria-modal={isMobile || undefined}
            aria-label={title}
            tabIndex={-1}
            initial={{
              opacity: 0,
              x: reduceMotion ? 0 : -24,
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{
              opacity: 0,
              x: reduceMotion ? 0 : -24,
            }}
            transition={{
              duration: reduceMotion ? 0 : 0.2,
              ease: "easeOut",
            }}
            className="absolute inset-y-0 left-0 z-[40] grid w-[min(90vw,360px)] min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden border-r border-[#dce8f2] bg-white shadow-[14px_0_38px_rgba(15,35,65,0.1)] sm:w-[320px] lg:left-[72px] lg:w-[344px]"
          >
            <header className="flex min-h-[84px] shrink-0 items-start gap-3 border-b border-[#e6eef5] bg-white px-4 py-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#b9dff4] bg-[#edf8fe] text-[#258fcb]">
                <StudioToolIcon tool={activeTool} className="h-7 w-7" />
              </span>

              <div className="min-w-0 flex-1 pt-0.5">
                <h2 className="truncate text-base font-bold tracking-[-0.02em] text-slate-950">
                  {title}
                </h2>
                <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-slate-500">
                  {description}
                </p>
              </div>

              <motion.button
                type="button"
                data-studio-tool-drawer-close
                onClick={onClose}
                aria-label={text.common.closePanel}
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-md bg-transparent p-2 text-slate-800 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffe16a]/45"
              >
                <X className="h-[22px] w-[22px]" aria-hidden="true" />
              </motion.button>
            </header>

            <motion.div
              animate={contentControls}
              className="min-h-0 overflow-y-auto overscroll-contain bg-white [scrollbar-gutter:stable]"
              data-studio-tool-drawer-scroll
            >
              {activeTool === "characters" ? (
                <StudioCharacterLibraryPanel mode="characters" />
              ) : activeTool === "accessories" ? (
                <StudioCharacterLibraryPanel mode="accessories" />
              ) : (
                <StudioSidebar
                  embedded
                  panelTab={activeToolConfig?.panelTab ?? "templates"}
                />
              )}
            </motion.div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
