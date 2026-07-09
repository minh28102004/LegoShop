"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Image as ImageIcon,
  Minus,
  Plus,
  Redo,
  RotateCcw,
  Share2,
  Trash2,
  Type,
  Undo,
} from "lucide-react";

import { uploadCustomerImage } from "@/lib/api/uploads";
import { useStudio } from "./StudioContext";

const getFrameColorHex = (name: string, apiHex?: string | null): string => {
  if (apiHex && apiHex.startsWith("#")) return apiHex;
  const lower = (name || "").trim().toLowerCase();
  if (lower === "trắng" || lower === "white") return "#ffffff";
  if (lower === "đen" || lower === "black") return "#1f1f21";
  if (lower === "gỗ" || lower === "wood") return "#d7a15c";
  return "#d1d5db";
};

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
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={[
        "grid h-9 w-9 place-items-center rounded-full border bg-white/94 shadow-[0_12px_22px_-18px_rgba(18,45,78,0.18)] backdrop-blur transition-all duration-200",
        tone === "danger"
          ? "border-rose-200 text-rose-500 hover:-translate-y-0.5 hover:bg-rose-50"
          : "border-[#e4edf5] text-slate-500 hover:-translate-y-0.5 hover:bg-[#f8fbff] hover:text-[#2f91d0]",
        disabled
          ? "cursor-not-allowed border-[#e7eef5] text-slate-300 hover:translate-y-0 hover:bg-white/94 hover:text-slate-300"
          : "",
      ].join(" ")}
    >
      {children}
    </button>
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
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
  const frameColorHex = getFrameColorHex("", selectedFrameSize?.colorHex);
  const currentSizeObj =
    selectedFrameSize?.widthCm && selectedFrameSize?.heightCm
      ? { w: selectedFrameSize.widthCm, h: selectedFrameSize.heightCm }
      : parsedSizes.find((size) => size.id === frameSize) || { w: 20, h: 20 };

  const maxBound = 462;
  const minBound = 220;
  const canvasW = Math.max(
    minBound,
    Math.round((currentSizeObj.w / maxDim) * maxBound),
  );
  const canvasH = Math.max(
    minBound,
    Math.round((currentSizeObj.h / maxDim) * maxBound),
  );

  const baseScale = useMemo(
    () => Math.min(1.08, 520 / canvasW, 680 / canvasH),
    [canvasH, canvasW],
  );
  const previewScale = baseScale * zoom;

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const handlePointerDown = (
    event: React.PointerEvent,
    id: string,
    initialX: number,
    initialY: number,
  ) => {
    event.stopPropagation();
    setSelectedId(id);
    setIsDragging(true);
    dragRef.current = {
      id,
      startX: event.clientX,
      startY: event.clientY,
      initialX,
      initialY,
    };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!isDragging || !dragRef.current) return;
    const { id, startX, startY, initialX, initialY } = dragRef.current;
    const dx = (event.clientX - startX) / previewScale;
    const dy = (event.clientY - startY) / previewScale;
    updateElement(id, { x: initialX + dx, y: initialY + dy });
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    setIsDragging(false);
    dragRef.current = null;
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
  };

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedId &&
        !isDragging
      ) {
        const tag = (document.activeElement as HTMLElement)?.tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") {
          removeElement(selectedId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, isDragging, removeElement]);

  const increaseZoom = () =>
    setZoom(Math.min(1.8, Number((zoom + 0.1).toFixed(2))));
  const decreaseZoom = () =>
    setZoom(Math.max(0.7, Number((zoom - 0.1).toFixed(2))));
  const resetZoom = () => setZoom(1);

  return (
    <div
      className="relative flex h-full flex-1 flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(194,226,245,0.14),transparent_24%),linear-gradient(180deg,#f9fbfe_0%,#eff5fb_100%)]"
      onClick={() => setSelectedId(null)}
    >
      <div className="pointer-events-none absolute inset-x-4 top-4 z-10 flex items-start justify-between gap-3 sm:inset-x-5">
        <span className="pointer-events-auto inline-flex h-8 items-center rounded-full border border-[#e3edf6] bg-white/92 px-3.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7691b1] shadow-[0_10px_18px_-18px_rgba(18,45,78,0.18)] backdrop-blur">
          Ảnh xem trước
        </span>

        <div
          className="pointer-events-auto absolute left-1/2 top-0 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-slate-200/70 bg-white/90 px-1.5 py-1 shadow-sm backdrop-blur md:flex"
          onClick={(event) => event.stopPropagation()}
        >
          <ToolbarIconButton title="Reset zoom" onClick={resetZoom}>
            <RotateCcw className="h-4 w-4" />
          </ToolbarIconButton>
          <div className="h-5 w-px bg-[#dce7f0]" />
          <ToolbarIconButton title="Thu nhỏ" onClick={decreaseZoom}>
            <Minus className="h-4 w-4" />
          </ToolbarIconButton>
          <span className="min-w-[52px] text-center text-[13px] font-semibold text-slate-700">
            {Math.round(zoom * 100)}%
          </span>
          <ToolbarIconButton title="Phóng to" onClick={increaseZoom}>
            <Plus className="h-4 w-4" />
          </ToolbarIconButton>
        </div>

        <div
          className="pointer-events-auto flex items-center gap-1.5"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
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
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200/70 bg-white/94 px-3.5 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-px hover:bg-slate-100 hover:text-[#2f91d0]"
          >
            <Type className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Thêm chữ</span>
          </button>
          <button
            type="button"
            onClick={() => backgroundInputRef.current?.click()}
            disabled={uploadingBackground}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3.5 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-px hover:bg-emerald-100"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">
              {uploadingBackground ? "Đang tải..." : "Hình ảnh"}
            </span>
          </button>
          <input
            ref={backgroundInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) =>
              handleBackgroundUpload(event.target.files?.[0])
            }
          />

          <div className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-white/90 px-1.5 py-1 shadow-sm backdrop-blur lg:flex">
            <ToolbarIconButton title="Hoàn tác">
              <Undo className="h-4 w-4" />
            </ToolbarIconButton>
            <ToolbarIconButton title="Làm lại">
              <Redo className="h-4 w-4" />
            </ToolbarIconButton>
          </div>

          <ToolbarIconButton
            title="Xóa"
            tone={selectedId ? "danger" : "default"}
            disabled={!selectedId}
            onClick={() => selectedId && removeElement(selectedId)}
          >
            <Trash2 className="h-4 w-4" />
          </ToolbarIconButton>

          <button
            type="button"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 bg-white/94 text-slate-500 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-px hover:bg-slate-100 hover:text-[#2f91d0] lg:inline-flex"
            title="Chia sẻ"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-auto px-4 pb-4 pt-[74px] sm:px-5 sm:pb-5 sm:pt-[78px]">
        <div className="flex min-h-full w-full items-center justify-center">
          <div
            className="flex w-full max-w-[980px] items-center justify-center rounded-[28px] border border-slate-200/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(245,250,255,0.9))] px-3 py-4 shadow-[0_18px_38px_-34px_rgba(18,45,78,0.2)] sm:px-4 sm:py-4"
            style={{ maxHeight: "calc(100dvh - 214px)" }}
          >
            <div className="grid w-full place-items-center overflow-auto">
              <div
                className="relative shrink-0 bg-white/82 p-4"
                style={{
                  transform: `scale(${previewScale})`,
                  transformOrigin: "center center",
                }}
              >
                <div
                  className="relative origin-center overflow-hidden bg-white bg-center bg-cover bg-no-repeat transition-all duration-300"
                  style={{
                    width: `${canvasW}px`,
                    height: `${canvasH}px`,
                    backgroundImage: activeTemplateImage
                      ? `url(${activeTemplateImage})`
                      : "none",
                    border: `12px solid ${frameColorHex}`,
                    boxSizing: "content-box",
                    boxShadow:
                      "0 20px 50px -32px rgba(15,23,42,0.35), 0 10px 22px -18px rgba(18,45,78,0.12), inset 0 0 0 1px rgba(15,23,42,0.04), inset 0 2px 6px rgba(255,255,255,0.18)",
                  }}
                >
                  {!activeTemplateImage && elements.length === 0 ? (
                    <div className="absolute inset-8 flex flex-col items-center justify-center rounded-[18px] border border-dashed border-[#c8dced] bg-white/52 text-[#7e97b4] pointer-events-none shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                      <span className="text-sm text-center font-semibold">
                        Khu vực thiết kế
                      </span>
                      <span className="mt-1 max-w-[180px] text-center text-xs opacity-75">
                        Chọn mẫu hoặc thêm chữ và phụ kiện để bắt đầu
                      </span>
                    </div>
                  ) : null}

                  {uploadError ? (
                    <div className="absolute left-4 right-4 top-4 rounded-[14px] border border-rose-200 bg-rose-50/95 px-3 py-2 text-xs font-medium text-rose-700 shadow-[0_12px_22px_-22px_rgba(225,29,72,0.24)]">
                      {uploadError}
                    </div>
                  ) : null}

                  {elements.map((element) => {
                    const isSelected = selectedId === element.id;

                    return (
                      <div
                        key={element.id}
                        onPointerDown={(event) =>
                          handlePointerDown(event, element.id, element.x, element.y)
                        }
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        className={[
                          "absolute cursor-move select-none rounded-[8px] transition-all duration-200",
                          isSelected
                            ? "ring-2 ring-[#2f91d0]/75 ring-offset-2 ring-offset-white shadow-[0_14px_22px_-18px_rgba(47,145,208,0.28)]"
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
                        {(element.type === "accessory" ||
                          element.type === "character") &&
                        element.imageUrl ? (
                          <img
                            src={element.imageUrl}
                            alt={element.content}
                            className="pointer-events-none h-full w-full object-contain drop-shadow-[0_8px_16px_rgba(15,23,42,0.12)]"
                          />
                        ) : element.type === "character" ? (
                          <div className="pointer-events-none flex h-full w-full flex-col items-center justify-end">
                            <div className="h-5 w-5 rounded-full border-2 border-zinc-950 bg-amber-200 shadow-sm" />
                            <div className="mt-0.5 h-9 w-7 rounded-md border-2 border-zinc-950 bg-primary shadow-sm" />
                            <span className="mt-1 rounded-full bg-white/88 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-900 shadow-[0_8px_16px_-12px_rgba(15,23,42,0.18)]">
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
                            <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full border border-white bg-[#2f91d0] shadow-[0_8px_14px_-8px_rgba(47,145,208,0.45)]" />
                            <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border border-white bg-[#2f91d0] shadow-[0_8px_14px_-8px_rgba(47,145,208,0.45)]" />
                            <span className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-full border border-white bg-[#2f91d0] shadow-[0_8px_14px_-8px_rgba(47,145,208,0.45)]" />
                            <span className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-full border border-white bg-[#2f91d0] shadow-[0_8px_14px_-8px_rgba(47,145,208,0.45)]" />
                          </>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
