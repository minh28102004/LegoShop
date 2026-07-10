"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import {
  Image as ImageIcon,
  Maximize2,
  Minus,
  MousePointer2,
  Move,
  Plus,
  Redo,
  RotateCcw,
  Share2,
  Sparkles,
  Trash2,
  Type,
  Undo,
} from "lucide-react";

import { uploadCustomerImage } from "@/lib/api/uploads";
import {
  useStudio,
  type StudioCharacterPartSnapshot,
  type StudioElement,
} from "./StudioContext";

const getFrameColorHex = (name: string, apiHex?: string | null): string => {
  if (apiHex && apiHex.startsWith("#")) return apiHex;

  const lower = (name || "").trim().toLowerCase();

  if (lower === "trắng" || lower === "white") return "#ffffff";
  if (lower === "đen" || lower === "black") return "#1f1f21";
  if (lower === "gỗ" || lower === "wood") return "#d7a15c";

  return "#d1d5db";
};

function getCharacterPart(
  element: StudioElement,
  type: "FACE" | "HAIR" | "TORSO" | "LEGS" | "HAT",
) {
  const value = element.characterParts?.[type];

  return Array.isArray(value) ? value[0] : value;
}

function getCharacterAccessories(
  element: StudioElement,
): StudioCharacterPartSnapshot[] {
  const value = element.characterParts?.ACCESSORY;

  if (!value) return [];

  return Array.isArray(value) ? value : [value];
}

function CharacterLayeredPreview({ element }: { element: StudioElement }) {
  const legs = getCharacterPart(element, "LEGS");
  const torso = getCharacterPart(element, "TORSO");
  const face = getCharacterPart(element, "FACE");
  const hair = getCharacterPart(element, "HAIR");
  const hat = getCharacterPart(element, "HAT");
  const accessories = getCharacterAccessories(element);

  const layers = [legs, torso, face, hair, hat, ...accessories].filter(
    (part): part is StudioCharacterPartSnapshot => Boolean(part?.imageUrl),
  );

  if (layers.length === 0) return null;

  return (
    <div className="pointer-events-none relative h-full w-full overflow-visible">
      {layers.map((part) => (
        <img
          key={`${part.type}-${part.id}`}
          src={part.imageUrl ?? ""}
          alt=""
          className="absolute inset-0 h-full w-full object-contain"
          draggable={false}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ))}

      <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 rounded-full bg-white/92 px-1.5 py-0.5 text-[9px] font-medium text-zinc-900 shadow-sm">
        {element.content}
      </span>
    </div>
  );
}

function ToolbarIconButton({
  title,
  disabled,
  onClick,
  children,
  tone = "default",
}: {
  title: string;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={[
        "grid h-9 w-9 shrink-0 place-items-center rounded-full border bg-white/95 backdrop-blur transition-all duration-150",
        "outline-none focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-[#9ed0ef]/60",
        tone === "danger"
          ? "border-rose-200 text-rose-500 hover:bg-rose-50"
          : "border-[#e4edf5] text-slate-500 hover:bg-[#f8fbff] hover:text-[#2f91d0]",
        disabled
          ? "cursor-not-allowed border-[#e7eef5] text-slate-300 shadow-none hover:bg-white/95 hover:text-slate-300"
          : "shadow-sm hover:-translate-y-px",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ToolbarTextButton({
  title,
  icon,
  label,
  disabled,
  onClick,
  tone = "default",
}: {
  title: string;
  icon: ReactNode;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
  tone?: "default" | "success";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={[
        "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border px-3 text-xs font-semibold backdrop-blur transition-all duration-150",
        "outline-none focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-[#9ed0ef]/60",
        tone === "success"
          ? "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "border-[#e4edf5] bg-white/95 text-slate-600 hover:bg-[#f8fbff] hover:text-[#2f91d0]",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "shadow-sm hover:-translate-y-px",
      ].join(" ")}
    >
      {icon}
      <span className="hidden 2xl:inline">{label}</span>
    </button>
  );
}

function DecorativeCanvasIcons() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 hidden select-none sm:block">
      <Sparkles className="absolute left-7 top-9 h-6 w-6 text-amber-400/20" />
      <MousePointer2 className="absolute right-9 top-16 h-5 w-5 -rotate-12 text-[#2f91d0]/16" />
      <Move className="absolute bottom-12 left-10 h-5 w-5 text-[#2f91d0]/16" />
      <Maximize2 className="absolute bottom-14 right-12 h-5 w-5 text-amber-400/18" />
    </div>
  );
}

function CanvasElementView({
  element,
  isSelected,
  isDragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  element: StudioElement;
  isSelected: boolean;
  isDragging: boolean;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      data-canvas-element="true"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={[
        "absolute select-none rounded-[8px]",
        isDragging ? "transition-none" : "transition-shadow duration-150",
        isDragging ? "cursor-grabbing" : "cursor-grab",
        isSelected
          ? "ring-2 ring-[#2f91d0]/75 ring-offset-2 ring-offset-white"
          : "hover:ring-1 hover:ring-[#2f91d0]/35 hover:ring-offset-1 hover:ring-offset-white/60",
      ].join(" ")}
      style={{
        left: element.x,
        top: element.y,
        fontSize: element.fontSize,
        color: element.color,
        width: element.width,
        height: element.height,
        touchAction: "none",
      }}
    >
      {element.type === "character" && element.characterParts ? (
        <CharacterLayeredPreview element={element} />
      ) : (element.type === "accessory" || element.type === "character") &&
        element.imageUrl ? (
        <img
          src={element.imageUrl}
          alt={element.content}
          className="pointer-events-none h-full w-full object-contain"
          draggable={false}
        />
      ) : element.type === "character" ? (
        <div className="pointer-events-none flex h-full w-full flex-col items-center justify-end">
          <div className="h-5 w-5 rounded-full border-2 border-zinc-950 bg-amber-200" />
          <div className="mt-0.5 h-9 w-7 rounded-md border-2 border-zinc-950 bg-primary" />
          <span className="mt-1 rounded-full bg-white/92 px-1.5 py-0.5 text-[9px] font-medium text-zinc-900 shadow-sm">
            {element.content}
          </span>
        </div>
      ) : (
        <span className="pointer-events-none whitespace-nowrap">
          {element.content}
        </span>
      )}

      {isSelected ? (
        <>
          <span className="pointer-events-none absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full border border-white bg-[#2f91d0]" />
          <span className="pointer-events-none absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border border-white bg-[#2f91d0]" />
          <span className="pointer-events-none absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-full border border-white bg-[#2f91d0]" />
          <span className="pointer-events-none absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-full border border-white bg-[#2f91d0]" />
        </>
      ) : null}
    </div>
  );
}

export function StudioCanvas() {
  const {
    elements,
    selectedId,
    setSelectedId,
    updateElement,
    removeElement,
    activeTemplate,
    zoom,
    setZoom,
    addElement,
    templates,
    frameSize,
    frameSizes,
    customBackgroundUrl,
    setCustomBackgroundUrl,
    setCustomBackgroundOriginalName,
  } = useStudio();

  const currentTemplate = templates.find(
    (template) => template.id === activeTemplate,
  );

  const activeTemplateImage = customBackgroundUrl ?? currentTemplate?.imageUrl;

  const backgroundInputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const [viewportSize, setViewportSize] = useState({
    width: 0,
    height: 0,
  });
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  const selectedIdRef = useRef<string | null>(selectedId ?? null);
  const selectionHistoryRef = useRef<(string | null)[]>([selectedId ?? null]);
  const selectionIndexRef = useRef(0);
  const [, forceSelectionHistoryRender] = useState(0);

  const bumpSelectionHistoryRender = () => {
    forceSelectionHistoryRender((value) => value + 1);
  };

  useEffect(() => {
    const current = selectedId ?? null;

    if (selectedIdRef.current === current) return;

    selectedIdRef.current = current;

    if (selectionHistoryRef.current[selectionIndexRef.current] === current) {
      return;
    }

    const nextHistory = selectionHistoryRef.current.slice(
      0,
      selectionIndexRef.current + 1,
    );

    nextHistory.push(current);

    selectionHistoryRef.current = nextHistory.slice(-50);
    selectionIndexRef.current = selectionHistoryRef.current.length - 1;

    bumpSelectionHistoryRender();
  }, [selectedId]);

  const commitSelection = useCallback(
    (nextId: string | null) => {
      if (selectedIdRef.current === nextId) return;

      selectedIdRef.current = nextId;

      const nextHistory = selectionHistoryRef.current.slice(
        0,
        selectionIndexRef.current + 1,
      );

      nextHistory.push(nextId);

      selectionHistoryRef.current = nextHistory.slice(-50);
      selectionIndexRef.current = selectionHistoryRef.current.length - 1;

      setSelectedId(nextId);
      bumpSelectionHistoryRender();
    },
    [setSelectedId],
  );

  const goSelectionHistory = useCallback(
    (direction: -1 | 1) => {
      const nextIndex = selectionIndexRef.current + direction;

      if (nextIndex < 0 || nextIndex >= selectionHistoryRef.current.length) {
        return;
      }

      selectionIndexRef.current = nextIndex;

      const nextId = selectionHistoryRef.current[nextIndex] ?? null;

      selectedIdRef.current = nextId;
      setSelectedId(nextId);
      bumpSelectionHistoryRender();
    },
    [setSelectedId],
  );

  const canUndoSelection = selectionIndexRef.current > 0;
  const canRedoSelection =
    selectionIndexRef.current < selectionHistoryRef.current.length - 1;

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const updateSize = () => {
      const rect = node.getBoundingClientRect();

      setViewportSize({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const parseFrameDimensions = (label: string) => {
    const match = label.match(/(\d+)\s*x\s*(\d+)/i);

    if (match?.[1] && match?.[2]) {
      return {
        w: parseInt(match[1], 10),
        h: parseInt(match[2], 10),
      };
    }

    return { w: 20, h: 20 };
  };

  const parsedSizes = frameSizes.map((size) => {
    const { w, h } = parseFrameDimensions(size.label);

    return { id: size.id, w, h };
  });

  const maxDim =
    parsedSizes.length > 0
      ? Math.max(...parsedSizes.map((size) => Math.max(size.w, size.h)), 30)
      : 30;

  const selectedFrameSize = frameSizes.find((size) => size.id === frameSize);
  const frameColorHex = getFrameColorHex(
    selectedFrameSize?.colorName ?? "",
    selectedFrameSize?.colorHex,
  );

  const currentSizeObj =
    selectedFrameSize?.widthCm && selectedFrameSize?.heightCm
      ? { w: selectedFrameSize.widthCm, h: selectedFrameSize.heightCm }
      : parsedSizes.find((size) => size.id === frameSize) || { w: 20, h: 20 };

  const maxBound = 500;
  const minBound = 240;

  const canvasW = Math.max(
    minBound,
    Math.round((currentSizeObj.w / maxDim) * maxBound),
  );
  const canvasH = Math.max(
    minBound,
    Math.round((currentSizeObj.h / maxDim) * maxBound),
  );

  const FRAME_BORDER = 12;
  const OUTER_PADDING = 14;

  const contentOuterW = canvasW + FRAME_BORDER * 2 + OUTER_PADDING * 2;
  const contentOuterH = canvasH + FRAME_BORDER * 2 + OUTER_PADDING * 2;

  const fitScale = useMemo(() => {
    if (!viewportSize.width || !viewportSize.height) return 0.88;

    const usableW = Math.max(260, viewportSize.width - 120);
    const usableH = Math.max(260, viewportSize.height - 132);

    return Math.min(1, usableW / contentOuterW, usableH / contentOuterH);
  }, [contentOuterH, contentOuterW, viewportSize.height, viewportSize.width]);

  const previewScale = fitScale * zoom;
  const scaledW = contentOuterW * previewScale;
  const scaledH = contentOuterH * previewScale;
  const isZoomedIn = zoom > 1.001;

  const scrollPadX = isZoomedIn ? 84 : 32;
  const scrollPadTop = isZoomedIn ? 84 : 34;
  const scrollPadBottom = isZoomedIn ? 132 : 92;

  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    lastX: number;
    lastY: number;
    rafId: number | null;
  } | null>(null);

  const panRef = useRef<{
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);

  const centerFractionRef = useRef<{ x: number; y: number } | null>(null);

  const captureCenterFraction = () => {
    const el = scrollRef.current;
    if (!el || el.scrollWidth === 0 || el.scrollHeight === 0) return;

    const cx = el.scrollLeft + el.clientWidth / 2;
    const cy = el.scrollTop + el.clientHeight / 2;

    centerFractionRef.current = {
      x: cx / el.scrollWidth,
      y: cy / el.scrollHeight,
    };
  };

  const flushDrag = () => {
    const drag = dragRef.current;
    if (!drag) return;

    updateElement(drag.id, { x: drag.lastX, y: drag.lastY });
    drag.rafId = null;
  };

  const handleElementPointerDown = (
    event: PointerEvent<HTMLDivElement>,
    id: string,
    initialX: number,
    initialY: number,
  ) => {
    event.stopPropagation();

    commitSelection(id);
    setDraggingId(id);

    dragRef.current = {
      id,
      startX: event.clientX,
      startY: event.clientY,
      initialX,
      initialY,
      lastX: initialX,
      lastY: initialY,
      rafId: null,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleElementPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;

    const dx = (event.clientX - drag.startX) / previewScale;
    const dy = (event.clientY - drag.startY) / previewScale;
    const nextX = drag.initialX + dx;
    const nextY = drag.initialY + dy;

    if (
      Math.abs(nextX - drag.lastX) < 0.35 &&
      Math.abs(nextY - drag.lastY) < 0.35
    ) {
      return;
    }

    drag.lastX = nextX;
    drag.lastY = nextY;

    if (drag.rafId == null) {
      drag.rafId = requestAnimationFrame(flushDrag);
    }
  };

  const handleElementPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;

    if (drag?.rafId != null) {
      cancelAnimationFrame(drag.rafId);
      updateElement(drag.id, { x: drag.lastX, y: drag.lastY });
    }

    dragRef.current = null;
    setDraggingId(null);

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // pointer capture may already be released
    }
  };

  const handleCanvasPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!isZoomedIn || event.button !== 0) return;

    const target = event.target;

    if (
      target instanceof Element &&
      target.closest('[data-canvas-element="true"]')
    ) {
      return;
    }

    event.stopPropagation();

    const el = scrollRef.current;
    if (!el) return;

    panRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
    };

    setIsPanning(true);

    try {
      el.setPointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  };

  const handleCanvasPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const pan = panRef.current;
    const el = scrollRef.current;

    if (!pan || !el) return;

    el.scrollLeft = pan.scrollLeft - (event.clientX - pan.startX);
    el.scrollTop = pan.scrollTop - (event.clientY - pan.startY);
  };

  const handleCanvasPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    panRef.current = null;
    setIsPanning(false);

    const el = scrollRef.current;

    try {
      el?.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (!centerFractionRef.current) {
      requestAnimationFrame(() => {
        el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
        el.scrollTop = Math.max(0, (el.scrollHeight - el.clientHeight) / 2);
      });

      return;
    }

    const { x: fx, y: fy } = centerFractionRef.current;

    requestAnimationFrame(() => {
      el.scrollLeft = Math.max(0, fx * el.scrollWidth - el.clientWidth / 2);
      el.scrollTop = Math.max(0, fy * el.scrollHeight - el.clientHeight / 2);
    });

    centerFractionRef.current = null;
  }, [
    zoom,
    canvasW,
    canvasH,
    fitScale,
    viewportSize.width,
    viewportSize.height,
  ]);

  useEffect(() => {
    return () => {
      const drag = dragRef.current;

      if (drag?.rafId != null) {
        cancelAnimationFrame(drag.rafId);
      }
    };
  }, []);

  const handleBackgroundUpload = async (file?: File) => {
    if (!file) return;

    setUploadingBackground(true);
    setUploadError(null);

    try {
      const uploaded = await uploadCustomerImage(file);

      setCustomBackgroundUrl(uploaded.url);
      setCustomBackgroundOriginalName(uploaded.originalName);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Không tải được ảnh lên",
      );
    } finally {
      setUploadingBackground(false);
    }
  };

  const removeSelectedElement = useCallback(() => {
    if (!selectedId) return;

    removeElement(selectedId);
    commitSelection(null);
  }, [selectedId, removeElement, commitSelection]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedId &&
        !draggingId
      ) {
        const tag = (document.activeElement as HTMLElement)?.tagName;

        if (tag !== "INPUT" && tag !== "TEXTAREA") {
          removeElement(selectedId);
          commitSelection(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, draggingId, removeElement, commitSelection]);

  const increaseZoom = () => {
    captureCenterFraction();
    setZoom(Math.min(1.8, Number((zoom + 0.1).toFixed(2))));
  };

  const decreaseZoom = () => {
    captureCenterFraction();
    setZoom(Math.max(0.7, Number((zoom - 0.1).toFixed(2))));
  };

  const resetZoom = () => {
    centerFractionRef.current = null;
    setZoom(1);
  };

  return (
    <div
      className="relative flex h-full flex-1 flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(194,226,245,0.14),transparent_24%),linear-gradient(180deg,#f9fbfe_0%,#eff5fb_100%)]"
      onClick={() => commitSelection(null)}
    >
      <div
        className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-hide"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center gap-1 rounded-full border border-slate-200/70 bg-white/90 px-1.5 py-1 shadow-sm backdrop-blur">
          <ToolbarIconButton title="Reset zoom" onClick={resetZoom}>
            <RotateCcw className="h-4 w-4" />
          </ToolbarIconButton>

          <div className="h-5 w-px bg-[#dce7f0]" />

          <ToolbarIconButton title="Thu nhỏ" onClick={decreaseZoom}>
            <Minus className="h-4 w-4" />
          </ToolbarIconButton>

          <span className="min-w-[54px] text-center text-sm font-semibold text-slate-700">
            {Math.round(zoom * 100)}%
          </span>

          <ToolbarIconButton title="Phóng to" onClick={increaseZoom}>
            <Plus className="h-4 w-4" />
          </ToolbarIconButton>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <ToolbarTextButton
            title="Thêm chữ"
            label="Thêm chữ"
            icon={<Type className="h-3.5 w-3.5" />}
            onClick={() =>
              addElement({
                type: "text",
                content: "Văn bản mới",
                x: 120 + Math.random() * 160,
                y: 120 + Math.random() * 160,
                fontSize: 14,
                color: "#000000",
              })
            }
          />

          <ToolbarTextButton
            title="Thêm hình ảnh"
            label={uploadingBackground ? "Đang tải..." : "Hình ảnh"}
            tone="success"
            disabled={uploadingBackground}
            icon={<ImageIcon className="h-3.5 w-3.5" />}
            onClick={() => backgroundInputRef.current?.click()}
          />

          <input
            ref={backgroundInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) =>
              handleBackgroundUpload(event.target.files?.[0])
            }
          />
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <div className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-white/90 px-1.5 py-1 shadow-sm backdrop-blur lg:flex">
            <ToolbarIconButton
              title="Quay lại lựa chọn trước"
              disabled={!canUndoSelection}
              onClick={() => goSelectionHistory(-1)}
            >
              <Undo className="h-4 w-4" />
            </ToolbarIconButton>

            <ToolbarIconButton
              title="Tiến tới lựa chọn sau"
              disabled={!canRedoSelection}
              onClick={() => goSelectionHistory(1)}
            >
              <Redo className="h-4 w-4" />
            </ToolbarIconButton>
          </div>

          <ToolbarIconButton
            title="Xóa"
            tone={selectedId ? "danger" : "default"}
            disabled={!selectedId}
            onClick={removeSelectedElement}
          >
            <Trash2 className="h-4 w-4" />
          </ToolbarIconButton>

          <ToolbarIconButton title="Chia sẻ">
            <Share2 className="h-4 w-4" />
          </ToolbarIconButton>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="relative flex min-h-0 flex-1 px-4 pb-8 pt-[62px] sm:px-5 sm:pb-9"
      >
        <DecorativeCanvasIcons />

        <div className="relative mx-auto min-h-0 w-full max-w-[980px] flex-1 overflow-hidden rounded-[28px] border border-slate-200/60 bg-white/70 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] backdrop-blur-sm">
          <div
            ref={scrollRef}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onPointerCancel={handleCanvasPointerUp}
            className={[
              "h-full w-full min-w-0 overflow-scroll overscroll-contain admin-scrollbar",
              isZoomedIn
                ? isPanning
                  ? "cursor-grabbing"
                  : "cursor-grab"
                : "cursor-default",
            ].join(" ")}
            style={{
              scrollbarGutter: "stable both-edges",
            }}
          >
            <div
              className="flex items-start justify-center"
              style={{
                minWidth: Math.max(
                  viewportSize.width,
                  scaledW + scrollPadX * 2,
                ),
                minHeight: Math.max(
                  viewportSize.height,
                  scaledH + scrollPadTop + scrollPadBottom,
                ),
                paddingTop: scrollPadTop,
                paddingBottom: scrollPadBottom,
                paddingLeft: scrollPadX,
                paddingRight: scrollPadX,
              }}
            >
              <div
                className="relative shrink-0 transition-[width,height] duration-300 ease-out"
                style={{
                  width: scaledW,
                  height: scaledH,
                }}
              >
                <div
                  className="absolute left-0 top-0 flex items-center justify-center p-[14px] transition-transform duration-300 ease-out"
                  style={{
                    width: contentOuterW,
                    height: contentOuterH,
                    transform: `scale(${previewScale})`,
                    transformOrigin: "top left",
                  }}
                >
                  <div
                    className={[
                      "relative overflow-hidden bg-white bg-cover bg-center bg-no-repeat",
                      draggingId
                        ? "transition-none"
                        : "transition-[width,height,border-color,box-shadow] duration-300 ease-out",
                    ].join(" ")}
                    style={{
                      width: `${canvasW}px`,
                      height: `${canvasH}px`,
                      backgroundImage: activeTemplateImage
                        ? `url(${activeTemplateImage})`
                        : "none",
                      border: `${FRAME_BORDER}px solid ${frameColorHex}`,
                      boxSizing: "content-box",
                      boxShadow:
                        "0 20px 50px -32px rgba(15,23,42,0.22), inset 0 0 0 1px rgba(15,23,42,0.04)",
                    }}
                  >
                    {!activeTemplateImage && elements.length === 0 ? (
                      <div className="pointer-events-none absolute inset-8 flex flex-col items-center justify-center rounded-[18px] border border-dashed border-[#c8dced] bg-white/52 text-[#7e97b4]">
                        <span className="text-center text-sm font-semibold">
                          Khu vực thiết kế
                        </span>
                        <span className="mt-1 max-w-[180px] text-center text-xs opacity-75">
                          Chọn mẫu hoặc thêm chữ và phụ kiện để bắt đầu
                        </span>
                      </div>
                    ) : null}

                    {uploadError ? (
                      <div className="absolute left-4 right-4 top-4 rounded-[14px] border border-rose-200 bg-rose-50/95 px-3 py-2 text-xs font-medium text-rose-700 shadow-sm">
                        {uploadError}
                      </div>
                    ) : null}

                    {elements.map((element) => (
                      <CanvasElementView
                        key={element.id}
                        element={element}
                        isSelected={selectedId === element.id}
                        isDragging={draggingId === element.id}
                        onPointerDown={(event) =>
                          handleElementPointerDown(
                            event,
                            element.id,
                            element.x,
                            element.y,
                          )
                        }
                        onPointerMove={handleElementPointerMove}
                        onPointerUp={handleElementPointerUp}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
