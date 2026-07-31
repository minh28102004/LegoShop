"use client";

import Image from "next/image";

import { DECORATIVE_ICON_PATHS } from "@/config/icons";
import { useStudioI18n } from "../hooks/useStudioI18n";
import type {
  StudioPanelTab,
  StudioTool,
} from "../state/studio.types";

export const STUDIO_TOOL_DRAWER_ID = "studio-tool-drawer";

export const STUDIO_QUICK_TOOLS: Array<{
  id: StudioTool;
  panelTab: StudioPanelTab;
}> = [
  {
    id: "background",
    panelTab: "templates",
  },
  {
    id: "characters",
    panelTab: "characters",
  },
  {
    id: "accessories",
    panelTab: "accessories",
  },
  {
    id: "image",
    panelTab: "uploads",
  },
  { id: "text", panelTab: "add-text" },
];

const TOOL_ICON_PATHS: Record<StudioTool, string> = {
  frame: DECORATIVE_ICON_PATHS.framedPicture,
  background: DECORATIVE_ICON_PATHS.framedPicture,
  characters: DECORATIVE_ICON_PATHS.man,
  accessories: DECORATIVE_ICON_PATHS.puzzlePiece,
  image: DECORATIVE_ICON_PATHS.camera,
  text: DECORATIVE_ICON_PATHS.receipt,
  layers: DECORATIVE_ICON_PATHS.package,
};

export function StudioToolIcon({
  tool,
  className = "h-5 w-5",
}: {
  tool: StudioTool;
  className?: string;
}) {
  return (
    <Image
      src={TOOL_ICON_PATHS[tool]}
      alt=""
      width={36}
      height={36}
      aria-hidden="true"
      draggable={false}
      className={`select-none object-contain object-center ${className}`}
    />
  );
}

type StudioToolRailProps = {
  activeTool: StudioTool;
  drawerOpen: boolean;
  onActiveToolChange: (tool: StudioTool) => void;
  onDrawerOpenChange: (
    open: boolean,
    trigger?: HTMLButtonElement | null,
  ) => void;
};

export function StudioToolRail({
  activeTool,
  drawerOpen,
  onActiveToolChange,
  onDrawerOpenChange,
}: StudioToolRailProps) {
  const { text } = useStudioI18n();
  const labels = text.sidebar.tabs as Record<string, string>;

  return (
    <nav
      aria-label={text.common.studioTools}
      className="order-3 z-[45] flex h-[calc(68px+env(safe-area-inset-bottom))] shrink-0 items-center gap-1.5 overflow-x-auto border-t border-[#e5edf5] bg-white/95 px-2.5 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl scrollbar-hide sm:justify-center lg:order-none lg:h-full lg:w-[72px] lg:flex-col lg:justify-start lg:overflow-visible lg:border-r lg:border-t-0 lg:bg-[#fbfdff] lg:px-2 lg:py-3 lg:backdrop-blur-none"
    >
      {STUDIO_QUICK_TOOLS.map((tool) => {
        const active = activeTool === tool.id && drawerOpen;
        const label =
          tool.id === "text"
            ? text.workflow.content
            : labels[tool.id] ?? tool.id;

        return (
          <div
            key={tool.id}
            className="group/tool relative shrink-0"
          >
            <button
              type="button"
              aria-label={label}
              aria-pressed={active}
              aria-expanded={active}
              aria-controls={STUDIO_TOOL_DRAWER_ID}
              data-studio-tool-active={active || undefined}
              onClick={(event) => {
                if (active) {
                  onDrawerOpenChange(false, event.currentTarget);
                  return;
                }

                onActiveToolChange(tool.id);
                onDrawerOpenChange(true, event.currentTarget);
              }}
              className={`group/icon relative grid h-12 w-12 place-items-center rounded-2xl border outline-none transition-[border-color,background-color,color,transform] duration-200 focus-visible:ring-2 focus-visible:ring-[#80c4e9]/70 motion-reduce:transition-none lg:h-[52px] lg:w-[52px] ${
                active
                  ? "border-[#79bee7] bg-[#eaf7fe] text-[#1676ae]"
                  : "border-transparent bg-transparent text-slate-500 hover:border-[#d5e7f4] hover:bg-white hover:text-[#237fb7]"
              }`}
            >
              <StudioToolIcon
                tool={tool.id}
                className="h-8 w-8 transition-transform duration-300 ease-out group-hover/icon:scale-110 motion-reduce:transition-none"
              />

              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-1/2 h-1.5 w-5 -translate-x-1/2 rounded-full bg-[#2f91d0] lg:-right-[11px] lg:bottom-auto lg:left-auto lg:top-1/2 lg:h-5 lg:w-1.5 lg:-translate-y-1/2 lg:translate-x-0"
                />
              ) : null}
            </button>
            {!drawerOpen ? (
              <span className="pointer-events-none absolute left-full top-1/2 z-[70] ml-2 hidden -translate-y-1/2 whitespace-nowrap rounded-xl border border-[#dbe7f1] bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 opacity-0 shadow-[0_8px_24px_rgba(15,35,65,0.12)] transition-opacity duration-150 group-hover/tool:opacity-100 lg:block">
                {label}
              </span>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
