"use client";

import Image from "next/image";
import { Layers3, Type } from "lucide-react";
import toast from "react-hot-toast";

import { DECORATIVE_ICON_PATHS } from "@/config/icons";
import { useStudioI18n } from "../hooks/useStudioI18n";
import type { StudioPanelTab, StudioStep, StudioTool } from "../state/studio.types";
import { useStudio } from "./StudioContext";

const TOOL_ITEMS: Array<{
  id: StudioTool;
  icon?: string;
  step: StudioStep;
  panelTab: StudioPanelTab;
}> = [
  { id: "frame", icon: DECORATIVE_ICON_PATHS.framedPicture, step: "frame", panelTab: "frame" },
  { id: "background", icon: DECORATIVE_ICON_PATHS.artistPalette, step: "background", panelTab: "templates" },
  { id: "image", icon: DECORATIVE_ICON_PATHS.camera, step: "content", panelTab: "uploads" },
  { id: "text", step: "content", panelTab: "add-text" },
  { id: "characters", icon: DECORATIVE_ICON_PATHS.identificationCard, step: "characters", panelTab: "characters" },
  { id: "accessories", icon: DECORATIVE_ICON_PATHS.wrappedGift, step: "characters", panelTab: "accessories" },
  { id: "layers", step: "characters", panelTab: "layers" },
];

export function StudioToolRail() {
  const {
    activeTool,
    setActiveTool,
    setActiveStep,
    setActivePanelTab,
    isContextPanelCollapsed,
    setIsContextPanelCollapsed,
    frameSize,
  } = useStudio();
  const { text } = useStudioI18n();
  const labels = text.sidebar.tabs as Record<string, string>;

  return (
    <nav
      aria-label={text.common.studioTools}
      className="order-3 z-30 flex h-[calc(68px+env(safe-area-inset-bottom))] shrink-0 items-center gap-1.5 overflow-x-auto border-t border-[#e5edf5] bg-white/95 px-2.5 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl scrollbar-hide sm:justify-center lg:order-none lg:h-full lg:w-[72px] lg:flex-col lg:justify-start lg:overflow-visible lg:border-r lg:border-t-0 lg:bg-[#fbfdff] lg:px-2 lg:py-3 lg:backdrop-blur-none"
    >
      {TOOL_ITEMS.map((tool) => {
        const active = activeTool === tool.id && !isContextPanelCollapsed;
        const label = labels[tool.id] ?? tool.id;

        return (
          <div
            key={tool.id}
            className={`group/tool relative shrink-0 ${tool.id === "layers" ? "lg:mt-auto" : ""}`}
          >
            {tool.id === "layers" ? <span className="mb-2 hidden h-px w-9 bg-[#e5edf5] lg:block" /> : null}
            <button
              type="button"
              aria-label={label}
              aria-pressed={active}
              onClick={() => {
                if (tool.step !== "frame" && !frameSize) {
                  toast.error(text.validation.frameRequired);
                  setActiveStep("frame");
                  setActiveTool("frame");
                  setActivePanelTab("frame");
                  setIsContextPanelCollapsed(false);
                  return;
                }

                setActiveStep(tool.step);
                setActiveTool(tool.id);
                setActivePanelTab(tool.panelTab);
                setIsContextPanelCollapsed(false);
              }}
              className={`group/icon grid h-12 w-12 place-items-center rounded-2xl border outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#80c4e9]/70 motion-reduce:transition-none lg:h-[52px] lg:w-[52px] ${
                active
                  ? "border-[#9ed0ef] bg-[#eaf6fd] text-[#1676ae]"
                  : "border-transparent bg-transparent text-slate-500 hover:border-[#d5e7f4] hover:bg-white hover:text-[#237fb7]"
              }`}
            >
              {tool.icon ? (
                <Image
                  src={tool.icon}
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain transition-transform duration-300 ease-out group-hover/icon:scale-110 motion-reduce:transition-none"
                />
              ) : tool.id === "text" ? (
                <Type className="h-5 w-5 transition-transform duration-300 ease-out group-hover/icon:scale-110 motion-reduce:transition-none" />
              ) : (
                <Layers3 className="h-5 w-5 transition-transform duration-300 ease-out group-hover/icon:scale-110 motion-reduce:transition-none" />
              )}
            </button>
            <span className="pointer-events-none absolute left-full top-1/2 z-[70] ml-2 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity duration-150 group-hover/tool:opacity-100 lg:block">
              {label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}
