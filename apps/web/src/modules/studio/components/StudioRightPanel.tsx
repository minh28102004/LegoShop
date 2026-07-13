"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { formatCurrency as formatPrice } from "@lego-shop/shared";
import {
  useStudio,
  type ApiCharacterPart,
  type ApiCharacterPreset,
  type ApiFrameSize,
  type StudioCharacterInput,
  type StudioCharacterPartSnapshot,
  type StudioContentField,
  type StudioElement,
} from "./StudioContext";
import {
  Search,
  ShoppingCart,
  Zap,
  UploadCloud,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  X,
  CalendarDays,
} from "lucide-react";
import { useCartStore, type CartItemPart } from "@/features/cart/store";
import { useUIStore } from "@/features/ui/store";
import { UI_MODAL_IDS } from "@/config/routes";
import { uploadCustomerImage } from "@/lib/api/uploads";
import { isPersistableImageUrl } from "../lib/design-data";
import type { CustomFrameDesignData, JsonObject } from "@lego-shop/shared";

const getFrameColorHex = (name: string, apiHex?: string | null): string => {
  if (apiHex && apiHex.startsWith("#")) return apiHex;
  const lower = name.trim().toLowerCase();
  if (lower === "trắng" || lower === "white") return "#ffffff";
  if (lower === "đen" || lower === "black") return "#1f1f21";
  if (lower === "gỗ" || lower === "wood") return "#d7a15c";
  return "#d1d5db";
};

const STUDIO_CANVAS_MAX_BOUND = 500;
const STUDIO_CANVAS_MIN_BOUND = 240;

function parseFrameDimensions(label?: string | null) {
  const match = label?.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/i);

  if (match?.[1] && match?.[2]) {
    return {
      width: Number(match[1]),
      height: Number(match[2]),
    };
  }

  return { width: 30, height: 30 };
}

function getFrameDimensions(size?: ApiFrameSize | null) {
  if (
    typeof size?.widthCm === "number" &&
    Number.isFinite(size.widthCm) &&
    typeof size.heightCm === "number" &&
    Number.isFinite(size.heightCm)
  ) {
    return {
      width: size.widthCm,
      height: size.heightCm,
    };
  }

  return parseFrameDimensions(size?.label);
}

function getStudioCanvasSize(
  selectedSize: ApiFrameSize | null | undefined,
  allSizes: ApiFrameSize[],
) {
  const parsedSizes = allSizes.map(getFrameDimensions);
  const maxDim =
    parsedSizes.length > 0
      ? Math.max(...parsedSizes.map((size) => Math.max(size.width, size.height)), 30)
      : 30;
  const currentSize = getFrameDimensions(selectedSize);

  return {
    width: Math.max(
      STUDIO_CANVAS_MIN_BOUND,
      Math.round((currentSize.width / maxDim) * STUDIO_CANVAS_MAX_BOUND),
    ),
    height: Math.max(
      STUDIO_CANVAS_MIN_BOUND,
      Math.round((currentSize.height / maxDim) * STUDIO_CANVAS_MAX_BOUND),
    ),
  };
}

function serializeCharacterPart(part: StudioCharacterPartSnapshot): JsonObject {
  return {
    id: part.id,
    name: part.name,
    type: part.type,
    imageUrl: part.imageUrl,
  };
}

function serializeCharacterParts(parts: StudioElement["characterParts"]): JsonObject {
  const serialized: JsonObject = {};
  if (!parts) return serialized;

  Object.entries(parts).forEach(([key, value]) => {
    if (!value) return;

    if (Array.isArray(value)) {
      serialized[key] = value.map(serializeCharacterPart);
      return;
    }

    serialized[key] = serializeCharacterPart(value);
  });

  return serialized;
}

function NoButtonChromeStyle() {
  return (
    <style>{`
 .studio-no-button-chrome button {
 -webkit-appearance: none !important;
 appearance: none !important;
 box-shadow: none !important;
 filter: none !important;
 outline: none !important;
 -webkit-tap-highlight-color: transparent;
 background-image: none;
 }

 .studio-no-button-chrome button:focus,
 .studio-no-button-chrome button:focus-visible,
 .studio-no-button-chrome button:active {
 box-shadow: none !important;
 outline: none !important;
 }

 .studio-no-button-chrome button[data-flat-button="true"],
 .studio-no-button-chrome button:not([class*="border"]) {
 border: 0 !important;
 border-width: 0 !important;
 border-style: solid !important;
 border-color: transparent !important;
 }

 .studio-no-button-chrome button:disabled {
 box-shadow: none !important;
 filter: none !important;
 transform: none !important;
 border: 0 !important;
 border-color: transparent !important;
 }

 .studio-no-button-chrome button[data-soft-border="true"] {
 border-style: solid !important;
 border-width: 1px !important;
 }

 .studio-no-button-chrome button[data-flat-button="true"] {
 position: relative;
 overflow: hidden;
 }

 .studio-no-button-chrome button:not(:disabled) {
 transition-property: background-color, border-color, color, opacity, transform;
 transition-duration: 180ms;
 transition-timing-function: ease;
 }

 .studio-no-button-chrome button:not(:disabled):hover {
 transform: translateY(-1px);
 }

 .studio-no-button-chrome button:not(:disabled):active {
 transform: translateY(0);
 }

 .studio-no-button-chrome button[data-flat-button="true"]::after {
 content: "";
 pointer-events: none;
 position: absolute;
 top: 0;
 bottom: 0;
 left: -56%;
 width: 44%;
 transform: skewX(-16deg);
 background: linear-gradient(90deg, transparent, rgba(255,255,255,0.26), transparent);
 opacity: 0;
 }

 .studio-no-button-chrome button[data-flat-button="true"]:not(:disabled):hover::after {
 left: 115%;
 opacity: 1;
 transition: left 620ms ease, opacity 260ms ease;
 }
 `}</style>
  );
}

function getMissingRequiredContentField(
  fields: StudioContentField[],
  values: Record<string, string>,
) {
  return fields.find((field) => field.required && !values[field.key]?.trim());
}

export function StudioRightPanel() {
  const {
    step,
    setStep,
    totalPrice,
    frameSize,
    contentFields,
    contentValues,
    isLoadingData,
    dataError,
  } = useStudio();

  const validationMessage = useMemo(() => {
    if (isLoadingData) return "Đang tải dữ liệu thiết kế...";
    if (dataError) return dataError;
    if (step === 1 && !frameSize) return "Vui lòng chọn khung.";
    if (step === 2) {
      const missingField = getMissingRequiredContentField(
        contentFields,
        contentValues,
      );
      if (missingField)
        return `Vui lòng nhập ${missingField.label.toLowerCase()} để tiếp tục.`;
    }
    return null;
  }, [contentFields, contentValues, dataError, frameSize, isLoadingData, step]);
  const canContinue = !validationMessage;

  const handleNext = () => {
    if (!canContinue) return;
    setStep(Math.min(4, step + 1));
  };
  const handleBack = () => setStep(Math.max(1, step - 1));

  return (
    <div className="studio-no-button-chrome z-20 flex h-full min-h-0 w-full shrink-0 flex-col bg-white">
      <NoButtonChromeStyle />
      {/* Body: only this area scrolls */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] px-5 py-5 pb-6 admin-scrollbar">
        <div className="animate-fade-in space-y-5">
          {step === 1 && <Step1Frame />}
          {step === 2 && <Step2Content />}
          {step === 3 && <Step3Characters />}
          {step === 4 && <Step4Finish />}
        </div>
      </div>

      {/* Footer: always fixed at the bottom of the panel, never scrolls */}
      <div className="shrink-0 border-t border-[#dbe7f1] bg-white/96 px-5 py-5 backdrop-blur-md">
        {validationMessage && (
          <div className="mb-4 rounded-[20px] border border-amber-200/80 bg-amber-50/90 px-4 py-3.5 text-sm font-semibold leading-relaxed text-amber-800">
            {validationMessage}
          </div>
        )}
        <div className="mb-4 flex items-center justify-between px-1">
          <span className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Giá tạm tính:
          </span>
          <span className="text-2xl font-bold text-[#2f91d0]">
            {formatPrice(totalPrice)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex h-12 min-w-[120px] appearance-none items-center justify-center gap-1.5 rounded-[18px] border border-[#e4edf5] bg-white px-4 text-sm font-semibold text-slate-600 outline-none transition-all duration-200 hover:border-[#c4dbed] hover:bg-[#fbfdff] hover:text-slate-950 focus:outline-none focus-visible:outline-none"
            >
              <ChevronLeft className="h-4 w-4" /> Quay lại
            </button>
          )}

          {step < 4 && (
            <button
              type="button"
              data-flat-button="true"
              onClick={handleNext}
              disabled={!canContinue}
              className="flex h-12 flex-1 appearance-none items-center justify-center gap-2 rounded-[18px] border-0 bg-[#2f91d0] px-6 text-sm font-bold text-white outline-none transition-all duration-200 hover:bg-[#257fb7] active:bg-[#1f6d9f] disabled:cursor-not-allowed disabled:border-transparent disabled:bg-slate-200 disabled:text-slate-500 focus:outline-none focus-visible:outline-none"
            >
              Tiếp theo <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

type FrameSizeGroup = {
  key: string;
  label: string;
  price: number;
  popular: boolean;
  variants: ApiFrameSize[];
};

function getFrameSizeGroupKey(size: ApiFrameSize): string {
  if (typeof size.widthCm === "number" && typeof size.heightCm === "number") {
    return `${size.widthCm}x${size.heightCm}`;
  }
  return size.label.trim().toLowerCase();
}

function buildFrameSizeGroups(frameSizes: ApiFrameSize[]): FrameSizeGroup[] {
  const groups = new Map<string, FrameSizeGroup>();

  frameSizes.forEach((size) => {
    const key = getFrameSizeGroupKey(size);
    const current = groups.get(key);
    if (!current) {
      groups.set(key, {
        key,
        label: size.label,
        price: size.price,
        popular: size.popular,
        variants: [size],
      });
      return;
    }

    current.price = Math.min(current.price, size.price);
    current.popular = current.popular || size.popular;
    current.variants.push(size);
  });

  return Array.from(groups.values());
}

// ==================== Step 1: Chọn khung ====================
function Step1Frame() {
  const { frameSize, setFrameSize, frameSizes, isLoadingData } = useStudio();

  const frameSizeGroups = useMemo(
    () => buildFrameSizeGroups(frameSizes),
    [frameSizes],
  );
  const selectedFrameVariant = useMemo(
    () => frameSizes.find((size) => size.id === frameSize) ?? null,
    [frameSize, frameSizes],
  );
  const selectedGroupKey = selectedFrameVariant
    ? getFrameSizeGroupKey(selectedFrameVariant)
    : null;
  const selectedFrameGroup = frameSizeGroups.find(
    (group) => group.key === selectedGroupKey,
  );

  const selectFrameGroup = (group: FrameSizeGroup) => {
    const preferredColor = selectedFrameVariant?.colorName;
    const preferredHex = selectedFrameVariant?.colorHex;
    const nextVariant =
      group.variants.find(
        (variant) => preferredColor && variant.colorName === preferredColor,
      ) ??
      group.variants.find(
        (variant) => preferredHex && variant.colorHex === preferredHex,
      ) ??
      group.variants[0];

    if (nextVariant) setFrameSize(nextVariant.id);
  };

  if (isLoadingData) {
    return (
      <div className="rounded-[24px] border border-[#e4edf5] bg-white p-5">
        <div className="mb-4 h-4 w-36 rounded bg-slate-100 animate-pulse" />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[72px] rounded-[18px] bg-[#eef3f8] animate-pulse"
            />
          ))}
        </div>
        <div className="my-4 h-px bg-[#e4edf5]" />
        <div className="flex gap-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-9 w-20 rounded-full bg-[#eef3f8] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (frameSizeGroups.length === 0) {
    return (
      <div className="rounded-[24px] border border-[#e4edf5] bg-white p-5 text-sm font-medium text-slate-500">
        Chưa có kích thước khung.
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-[#e4edf5] bg-white p-5">
      <h3 className="mb-4 text-xs font-semibold tracking-wide text-slate-950 uppercase">
        Chọn kích thước
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {frameSizeGroups.map((group) => {
          const active = group.key === selectedGroupKey;
          const activeVariant = active
            ? group.variants.find((variant) => variant.id === frameSize)
            : null;
          const displayPrice = activeVariant?.price ?? group.price;

          return (
            <button
              key={group.key}
              type="button"
              onClick={() => selectFrameGroup(group)}
              className={`relative flex h-[72px] min-w-0 flex-col items-center justify-center gap-1 rounded-[18px] border px-2 text-center appearance-none outline-none transition-all duration-200 focus:outline-none focus-visible:outline-none ${
                active
                  ? "border-[#2f91d0] bg-[#2f91d0] text-white"
                  : "border-[#e4edf5] bg-white text-slate-950 hover:border-[#b9d8ed] hover:bg-[#fbfdff]"
              }`}
            >
              {group.popular && (
                <span className="absolute right-2 top-[-7px] max-w-[88px] truncate rounded-full bg-amber-200 px-2 py-0.5 text-[9px] font-extrabold leading-none text-amber-900">
                  Phổ biến
                </span>
              )}
              <span className="max-w-full truncate text-[13px] font-bold leading-tight">
                {group.label}
              </span>
              <span
                className={`text-xs font-semibold ${active ? "text-white/90" : "text-slate-500"}`}
              >
                {formatPrice(displayPrice)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="my-4 h-px bg-[#e4edf5]" />

      <p className="mb-2 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
        Màu khung
      </p>
      <div className="flex flex-wrap gap-2">
        {(selectedFrameGroup?.variants ?? []).map((variant) => {
          const active = variant.id === frameSize;
          const colorName = variant.colorName ?? "Màu khung";

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => setFrameSize(variant.id)}
              className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-semibold appearance-none outline-none transition-all duration-200 focus:outline-none focus-visible:outline-none ${
                active
                  ? "border-[#b9d8ed] bg-[#f2f9ff] text-[#2f91d0]"
                  : "border-[#e4edf5] bg-white text-slate-950 hover:border-[#b9d8ed] hover:bg-[#fbfdff]"
              }`}
            >
              <span
                className="h-3.5 w-3.5 rounded-full border border-slate-300"
                style={{
                  backgroundColor: getFrameColorHex(
                    colorName,
                    variant.colorHex,
                  ),
                }}
              />
              {colorName}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==================== Step 2: Nội dung ====================
function Step2Content() {
  const {
    activeTemplate,
    setActiveTemplate,
    customBackgroundUrl,
    setCustomBackgroundUrl,
    setCustomBackgroundOriginalName,
    templates,
    templateCategories,
    printText,
    setPrintText,
    contentFields,
    contentValues,
    setContentValue,
    clearContentValues,
    isLoadingData,
  } = useStudio();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const backgroundInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    if (!activeCategoryId) return templates;
    return templates.filter((t) => t.categoryId === activeCategoryId);
  }, [templates, activeCategoryId]);
  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === activeTemplate) ?? null,
    [activeTemplate, templates],
  );

  const handleBackgroundUpload = async (file?: File) => {
    if (!file) return;
    setIsUploadingBackground(true);
    setUploadError(null);
    try {
      const uploaded = await uploadCustomerImage(file);
      setCustomBackgroundUrl(uploaded.url);
      setCustomBackgroundOriginalName(uploaded.originalName);
      setActiveTemplate(null);
      clearContentValues();
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Không tải được ảnh lên",
      );
    } finally {
      setIsUploadingBackground(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[24px] border border-[#e4edf5] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-semibold tracking-wide text-slate-950 uppercase">
            Chọn ảnh nền
          </h3>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
            {filteredTemplates.length + (customBackgroundUrl ? 1 : 0)} mẫu
          </span>
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            type="button"
            onClick={() => setActiveCategoryId(null)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold appearance-none outline-none transition-all duration-200 focus:outline-none focus-visible:outline-none ${
              !activeCategoryId
                ? "bg-[#2f91d0] text-white"
                : "border border-[#e4edf5] bg-[#fbfdff] text-slate-600 hover:border-[#bfdcf0] hover:bg-white"
            }`}
          >
            TẤT CẢ
          </button>
          {templateCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategoryId(cat.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold appearance-none outline-none transition-all duration-200 focus:outline-none focus-visible:outline-none ${
                activeCategoryId === cat.id
                  ? "bg-[#2f91d0] text-white"
                  : "border border-[#e4edf5] bg-[#fbfdff] text-slate-600 hover:border-[#bfdcf0] hover:bg-white"
              }`}
            >
              {cat.name.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="grid max-h-[350px] grid-cols-4 gap-3 overflow-y-auto pr-1 admin-scrollbar">
          {customBackgroundUrl && (
            <button
              type="button"
              onClick={() => {
                setActiveTemplate(null);
                setCustomBackgroundOriginalName(null);
                clearContentValues();
              }}
              className={`group relative aspect-square overflow-hidden rounded-[16px] border appearance-none outline-none transition-all duration-200 focus:outline-none focus-visible:outline-none ${
                !activeTemplate
                  ? "border-[#79b9e8]"
                  : "border-[#e8eff6] bg-white hover:border-[#bfdcf0]"
              }`}
            >
              <img
                src={customBackgroundUrl}
                alt="Ảnh nền của bạn"
                className="h-full w-full object-contain bg-white p-2 transition-transform duration-500"
              />
              {!activeTemplate && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#2f91d0]/12 backdrop-blur-[1px]">
                  <div className="rounded-full bg-[#2f91d0] p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6 text-center">
                <span className="block truncate text-[9px] font-semibold uppercase tracking-wider text-white">
                  Ảnh của bạn
                </span>
              </div>
            </button>
          )}
          {isLoadingData ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-[16px] bg-[#eef3f8] animate-pulse"
              />
            ))
          ) : filteredTemplates.length === 0 && !customBackgroundUrl ? (
            <div className="col-span-4 py-10 text-center text-sm font-medium text-slate-500">
              Chưa có mẫu nào
            </div>
          ) : (
            filteredTemplates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => {
                  setCustomBackgroundUrl(null);
                  setCustomBackgroundOriginalName(null);
                  setActiveTemplate(tpl.id);
                }}
                className={`group relative aspect-square overflow-hidden rounded-[16px] border appearance-none outline-none transition-all duration-200 focus:outline-none focus-visible:outline-none ${
                  activeTemplate === tpl.id
                    ? "border-[#79b9e8]"
                    : "border-[#e8eff6] bg-white hover:border-[#bfdcf0]"
                }`}
              >
                {tpl.imageUrl ? (
                  <img
                    src={tpl.imageUrl}
                    alt={tpl.name}
                    loading="lazy"
                    className="h-full w-full object-contain bg-white p-2 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#f8fbff] p-2">
                    <span className="text-center text-[10px] font-medium leading-tight text-slate-500">
                      {tpl.name}
                    </span>
                  </div>
                )}

                {activeTemplate === tpl.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#2f91d0]/12 backdrop-blur-[1px]">
                    <div className="rounded-full bg-[#2f91d0] p-1">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6 text-center">
                  <span className="block truncate text-[9px] font-semibold uppercase tracking-wider text-white">
                    {tpl.name}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="mt-4 border-t border-[#e4edf5] pt-4">
          <button
            type="button"
            onClick={() => backgroundInputRef.current?.click()}
            disabled={isUploadingBackground}
            className="group flex w-full items-center justify-center gap-2 rounded-[16px] border border-dashed border-[#d3e3f0] bg-[#fbfdff] py-3 text-xs font-semibold text-slate-600 appearance-none outline-none transition-all duration-200 hover:border-[#aed2eb] hover:bg-white hover:text-[#2f91d0] focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70"
          >
            <UploadCloud className="h-4 w-4 transition-transform" />
            {isUploadingBackground
              ? "ĐANG TẢI ẢNH..."
              : "TẢI ẢNH NỀN CỦA BẠN LÊN"}
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
          {uploadError ? (
            <p className="mt-2 text-xs font-semibold text-red-600">
              {uploadError}
            </p>
          ) : null}
        </div>
      </div>

      <div className="rounded-[24px] border border-[#e4edf5] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] p-5">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={clearContentValues}
            className="rounded-full border-0 bg-transparent px-3 py-1.5 text-xs font-semibold text-slate-500 appearance-none outline-none transition-colors duration-200 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:outline-none"
          >
            XÓA TẤT CẢ
          </button>
        </div>
        {(selectedTemplate?.description || selectedTemplate?.instructions) && (
          <div className="mb-4 rounded-[20px] border border-[#cfe4f4] bg-[#f4faff] px-4 py-3.5 text-xs leading-relaxed text-slate-700">
            {selectedTemplate.description && (
              <p className="font-bold text-slate-900">
                {selectedTemplate.description}
              </p>
            )}
            {selectedTemplate.instructions && (
              <p className={selectedTemplate.description ? "mt-1" : ""}>
                {selectedTemplate.instructions}
              </p>
            )}
          </div>
        )}
        <div className="space-y-4">
          {contentFields.map((field) => (
            <ContentFieldInput
              key={field.key}
              field={field}
              value={contentValues[field.key] ?? ""}
              onChange={(value) => setContentValue(field.key, value)}
            />
          ))}
          {false && (
            <>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Tên / Lời tựa ngắn <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Tú & Lan"
                  value={printText.title}
                  onChange={(e) =>
                    setPrintText({ ...printText, title: e.target.value })
                  }
                  className="w-full rounded-[18px] border border-[#e4edf5] bg-white p-3.5 text-sm font-medium text-slate-950 appearance-none outline-none transition-all duration-200 focus:border-[#b9d8ed] focus:bg-[#fbfdff] focus-visible:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Ngày kỷ niệm (nếu có)
                </label>
                <input
                  type="date"
                  value={printText.date}
                  onChange={(e) =>
                    setPrintText({ ...printText, date: e.target.value })
                  }
                  className="w-full rounded-[18px] border border-[#e4edf5] bg-white p-3.5 text-sm font-medium text-slate-950 appearance-none outline-none transition-all duration-200 focus:border-[#b9d8ed] focus:bg-[#fbfdff] focus-visible:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Lời nhắn (nếu có)
                </label>
                <textarea
                  placeholder="VD: Chúc mừng sinh nhật..."
                  value={printText.message}
                  onChange={(e) =>
                    setPrintText({ ...printText, message: e.target.value })
                  }
                  rows={3}
                  className="w-full resize-none rounded-[16px] border border-[#e4edf5] bg-white p-3 text-sm font-medium text-slate-950 appearance-none outline-none transition-all duration-200 focus:border-[#b9d8ed] focus:bg-[#fbfdff] focus-visible:outline-none"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const VN_MONTHS = [
  "Tháng Một",
  "Tháng Hai",
  "Tháng Ba",
  "Tháng Tư",
  "Tháng Năm",
  "Tháng Sáu",
  "Tháng Bảy",
  "Tháng Tám",
  "Tháng Chín",
  "Tháng Mười",
  "Tháng Mười Một",
  "Tháng Mười Hai",
];

const VN_WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function parseISODate(value: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string) {
  const date = parseISODate(value);
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day} / ${month} / ${date.getFullYear()}`;
}

function getCalendarDays(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const mondayStartOffset = (firstOfMonth.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - mondayStartOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
}

function isSameDate(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function DateFieldInput({
  value,
  onChange,
  placeholder,
  inputClass,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string | undefined;
  inputClass: string;
}) {
  const selectedDate = parseISODate(value);
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => selectedDate ?? new Date());
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open && selectedDate) {
      setViewDate(selectedDate);
    }
  }, [open, selectedDate?.getTime()]);

  const days = getCalendarDays(viewDate);
  const today = new Date();

  const changeMonth = (direction: -1 | 1) => {
    setViewDate((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + direction);
      return next;
    });
  };

  const selectDate = (date: Date) => {
    onChange(toISODate(date));
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`${inputClass} flex items-center justify-between text-left`}
      >
        <span className={value ? "text-slate-900" : "text-slate-400"}>
          {formatDisplayDate(value) || placeholder || "dd / mm / yyyy"}
        </span>
        <CalendarDays className="h-4.5 w-4.5 shrink-0 text-slate-500" />
      </button>

      {open ? (
        <div className="absolute bottom-full left-0 z-[80] mb-2 w-[320px] max-w-[calc(100vw-40px)] rounded-[20px] border border-[#dbe7f1] bg-white p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-[#e4edf5] bg-white text-slate-500 appearance-none outline-none transition-all duration-200 hover:bg-[#f8fbff] hover:text-[#2f91d0] focus:outline-none focus-visible:outline-none"
              aria-label="Tháng trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <p className="text-sm font-bold text-slate-900">
              {VN_MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </p>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-[#e4edf5] bg-white text-slate-500 appearance-none outline-none transition-all duration-200 hover:bg-[#f8fbff] hover:text-[#2f91d0] focus:outline-none focus-visible:outline-none"
              aria-label="Tháng sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {VN_WEEKDAYS.map((weekday) => (
              <span
                key={weekday}
                className="py-1 text-[11px] font-bold text-slate-400"
              >
                {weekday}
              </span>
            ))}

            {days.map((date) => {
              const inCurrentMonth = date.getMonth() === viewDate.getMonth();
              const active = isSameDate(date, selectedDate);
              const isToday = isSameDate(date, today);

              return (
                <button
                  type="button"
                  key={date.toISOString()}
                  onClick={() => selectDate(date)}
                  className={[
                    "grid h-9 place-items-center rounded-xl border-0 text-sm font-semibold appearance-none outline-none transition-colors focus:outline-none focus-visible:outline-none",
                    active
                      ? "bg-[#2f91d0] text-white"
                      : isToday
                        ? "bg-[#eef7ff] text-[#2f91d0] hover:bg-[#dff0fb]"
                        : inCurrentMonth
                          ? "text-slate-700 hover:bg-[#f4faff] hover:text-[#2f91d0]"
                          : "text-slate-300 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-[#edf3f8] pt-3">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="rounded-full border-0 bg-transparent px-3 py-1.5 text-xs font-semibold text-slate-500 appearance-none outline-none transition-colors duration-200 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:outline-none"
            >
              Xóa ngày
            </button>
            <button
              type="button"
              onClick={() => selectDate(new Date())}
              className="rounded-full border-0 bg-[#eef7ff] px-3 py-1.5 text-xs font-bold text-[#2f91d0] appearance-none outline-none transition-colors duration-200 hover:bg-[#dff0fb] focus:outline-none focus-visible:outline-none"
            >
              Hôm nay
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ContentFieldInput({
  field,
  value,
  onChange,
}: {
  field: StudioContentField;
  value: string;
  onChange: (value: string) => void;
}) {
  const inputClass =
    "h-12 w-full rounded-[18px] border border-[#e4edf5] bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-[#b9d8ed] focus:bg-[#fbfdff] focus-visible:outline-none";

  return (
    <div>
      <label className="mb-2 block text-[12px] font-bold text-slate-700">
        {field.label}{" "}
        {field.required && <span className="text-[#2563eb]">*</span>}
      </label>

      {field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      ) : field.type === "image" ? (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-[#d3e3f0] bg-[#fbfdff] px-4 py-5 text-center text-sm font-semibold text-slate-600 appearance-none outline-none transition-all duration-200 hover:border-[#aed2eb] hover:bg-white hover:text-[#2f91d0]">
          <UploadCloud className="h-5 w-5" />
          <span>{value || field.placeholder || "Chọn ảnh tải lên"}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => onChange(event.target.files?.[0]?.name ?? "")}
          />
        </label>
      ) : field.type === "date" ? (
        <DateFieldInput
          value={value}
          onChange={onChange}
          placeholder={field.placeholder}
          inputClass={inputClass}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          className={inputClass}
        />
      )}

      {field.helpText && (
        <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-500">
          {field.helpText}
        </p>
      )}
    </div>
  );
}

// ==================== Step 3: Nhân vật ====================
function Step3Characters() {
  const {
    characterPrice,
    characterParts,
    characterPresets,
    accessories,
    accessoryCategories,
    addElement,
    addCharacter,
    updateCharacterParts,
    elements,
    removeElement,
    selectedId,
    setSelectedId,
    isLoadingData,
  } = useStudio();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(
    null,
  );

  const filteredAccessories = useMemo(() => {
    let list = accessories;
    if (activeCategoryId)
      list = list.filter((a) => a.categoryId === activeCategoryId);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q));
    }
    return list;
  }, [accessories, activeCategoryId, searchQuery]);

  const addedAccessoryIds = new Set(
    elements.filter((e) => e.accessoryId).map((e) => e.accessoryId),
  );
  const characterElements = useMemo(
    () => elements.filter((element) => element.type === "character"),
    [elements],
  );
  const editingCharacter = useMemo(
    () =>
      characterElements.find(
        (character) => character.id === editingCharacterId,
      ) ?? null,
    [characterElements, editingCharacterId],
  );
  const charactersTotalPrice = characterElements.length * characterPrice;

  const partById = useMemo(
    () => new Map(characterParts.map((p) => [p.id, p])),
    [characterParts],
  );

  const openCreateBuilder = () => {
    setEditingCharacterId(null);
    setBuilderOpen(true);
  };

  const openEditBuilder = (character: StudioElement) => {
    setEditingCharacterId(character.id);
    setSelectedId(character.id);
    setBuilderOpen(true);
  };

  const closeBuilder = () => {
    setBuilderOpen(false);
    setEditingCharacterId(null);
  };

  const handleSaveCharacter = (payload: StudioCharacterInput) => {
    if (editingCharacterId) {
      updateCharacterParts(editingCharacterId, payload);
    } else {
      addCharacter(payload);
    }
    closeBuilder();
  };

  const handleRemoveCharacter = (id: string, name: string) => {
    if (window.confirm(`Xóa ${name} khỏi thiết kế?`)) {
      removeElement(id);
    }
  };

  const getCharacterPartFee = (character: StudioElement): number => {
    const partIds = [
      character.faceId,
      character.hairId,
      character.torsoId,
      character.legsId,
      character.hatId,
      ...(character.accessoryIds ?? []),
    ].filter(Boolean);
    return partIds.reduce((sum, id) => {
      const part = partById.get(id as string);
      return sum + (part?.priceAdjustment ?? 0);
    }, 0);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[22px] border border-[#cfe4f4] bg-[#f4faff] p-[18px] text-sm font-semibold leading-relaxed text-[#2f6690]">
        Phí vận chuyển chưa cộng vào đơn. Shop sẽ báo phí trước khi giao và
        khách trả trực tiếp cho tài xế.
      </div>

      <div className="rounded-[24px] border border-[#e4edf5] bg-white p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xs font-semibold tracking-wide text-slate-950 uppercase">
            Quản lý nhân vật
          </h3>
          <button
            type="button"
            onClick={openCreateBuilder}
            title="Tạo nhanh nhân vật ngẫu nhiên"
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-[#b9d8ed] bg-[#f4faff] px-3 text-xs font-bold text-[#2f91d0] appearance-none outline-none transition-all duration-200 hover:border-[#2f91d0] hover:bg-[#2f91d0] hover:text-white focus:outline-none focus-visible:outline-none"
          >
            <Zap className="h-3.5 w-3.5" /> Ngẫu nhiên
          </button>
        </div>

        {/* Character chips + Add button */}
        <div className="flex flex-wrap items-center gap-2">
          {characterElements.map((character, index) => {
            const active = selectedId === character.id;
            const label = character.content || `NV ${index + 1}`;
            return (
              <div
                key={character.id}
                className={`group flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-bold transition-all duration-200 ${
                  active
                    ? "border-[#b9d8ed] bg-[#f4faff] text-[#2f91d0]"
                    : "border-[#e4edf5] bg-white text-slate-600 hover:border-[#9ed0ef]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => openEditBuilder(character)}
                  className="max-w-[72px] truncate appearance-none outline-none focus:outline-none focus-visible:outline-none"
                  title={`Sửa ${label}`}
                >
                  {label}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveCharacter(character.id, label)}
                  className="ml-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-red-100 text-red-500 opacity-70 appearance-none outline-none transition-colors duration-200 hover:bg-red-500 hover:text-white hover:opacity-100 focus:outline-none focus-visible:outline-none"
                  aria-label={`Xóa ${label}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            );
          })}

          <button
            type="button"
            data-flat-button="true"
            onClick={openCreateBuilder}
            className="inline-flex h-10 appearance-none items-center gap-2 rounded-full border-0 bg-emerald-500 px-4 text-sm font-bold text-white outline-none transition-all duration-200 hover:bg-emerald-600 active:bg-emerald-700 focus:outline-none focus-visible:outline-none"
          >
            <span className="text-base leading-none">+</span>
            <span>Thêm</span>
            <span className="rounded-full bg-white/20 px-2 py-1 text-[11px] font-bold leading-none text-white">
              10.000
            </span>
          </button>
        </div>

        {characterElements.length === 0 && (
          <p className="mt-3 text-xs font-medium text-slate-500">
            Nhấn &quot;+ Thêm&quot; để thêm nhân vật vào khung.
          </p>
        )}

        {/* Price breakdown */}
        {characterElements.length > 0 && (
          <div className="mt-4 space-y-1.5 rounded-[16px] bg-[#f4faff] px-4 py-3">
            {characterElements.map((character, index) => {
              const partFee = getCharacterPartFee(character);
              const label = character.content || `NV ${index + 1}`;
              return (
                <div
                  key={character.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-slate-600">{label}</span>
                  <span className="font-bold text-slate-950">
                    {formatPrice(characterPrice + partFee)}
                    {partFee > 0 && (
                      <span className="ml-1 font-medium text-slate-500">
                        (+{formatPrice(partFee)} part)
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
            <div className="mt-2 flex items-center justify-between border-t border-[#e4edf5] pt-2 text-xs">
              <span className="font-bold text-slate-950">Tổng nhân vật</span>
              <span className="font-bold text-[#2f91d0]">
                {formatPrice(
                  charactersTotalPrice +
                    characterElements.reduce(
                      (s, c) => s + getCharacterPartFee(c),
                      0,
                    ),
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col overflow-hidden rounded-[24px] border border-[#e4edf5] bg-white">
        <div className="border-b border-[#e4edf5] bg-[#fbfdff] p-5">
          <h3 className="mb-4 text-xs font-semibold tracking-wide text-slate-950 uppercase">
            Thêm phụ kiện &amp; Charm
          </h3>

          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm phụ kiện (hoa, xe, bóng bay...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-full border border-[#e4edf5] bg-white pl-10 pr-4 text-sm font-medium text-slate-900 appearance-none outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#b9d8ed] focus:bg-[#fbfdff] focus-visible:outline-none"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              type="button"
              onClick={() => setActiveCategoryId(null)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold appearance-none outline-none transition-all duration-200 focus:outline-none focus-visible:outline-none ${
                !activeCategoryId
                  ? "bg-[#2f91d0] text-white"
                  : "border border-[#e4edf5] bg-[#fbfdff] text-slate-600 hover:border-[#bfdcf0] hover:bg-white"
              }`}
            >
              TẤT CẢ
            </button>
            {accessoryCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategoryId(cat.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold appearance-none outline-none transition-all duration-200 focus:outline-none focus-visible:outline-none ${
                  activeCategoryId === cat.id
                    ? "bg-[#2f91d0] text-white"
                    : "border border-[#e4edf5] bg-[#fbfdff] text-slate-600 hover:border-[#bfdcf0] hover:bg-white"
                }`}
              >
                {cat.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid max-h-[380px] grid-cols-4 gap-3 overflow-y-auto p-5 admin-scrollbar">
          {isLoadingData ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-[16px] bg-[#eef3f8]"
              />
            ))
          ) : filteredAccessories.length === 0 ? (
            <div className="col-span-4 py-10 text-center text-sm font-medium text-slate-500">
              Không tìm thấy phụ kiện phù hợp
            </div>
          ) : (
            filteredAccessories.map((acc) => {
              const isAdded = addedAccessoryIds.has(acc.id);
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => {
                    if (isAdded) {
                      const el = elements.find((e) => e.accessoryId === acc.id);
                      if (el) removeElement(el.id);
                    } else {
                      addElement({
                        type: "accessory",
                        x: 80 + Math.random() * 200,
                        y: 80 + Math.random() * 200,
                        imageUrl: acc.imageUrl || acc.iconUrl || "",
                        content: acc.name,
                        width: 60,
                        height: 60,
                        price: acc.price,
                        accessoryId: acc.id,
                      });
                    }
                  }}
                  className={`group relative flex aspect-square flex-col items-center justify-center gap-1 overflow-hidden rounded-[18px] border p-2.5 appearance-none outline-none transition-all duration-200 focus:outline-none focus-visible:outline-none ${
                    isAdded
                      ? "border-[#9ed0ef] bg-[#f4faff]"
                      : "border-[#e4edf5] bg-white hover:border-[#bfdcf0] hover:bg-[#fbfdff]"
                  }`}
                >
                  {acc.imageUrl || acc.iconUrl ? (
                    <img
                      src={acc.imageUrl || acc.iconUrl || ""}
                      alt={acc.name}
                      loading="lazy"
                      className="h-10 w-10 object-contain transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-[#f4faff]" />
                  )}

                  <span className="mt-1 w-full truncate px-1 text-center text-[10px] font-bold text-slate-600">
                    {acc.name}
                  </span>

                  <span className="text-[10px] font-bold text-[#2f91d0]">
                    {formatPrice(acc.price)}
                  </span>

                  {isAdded && (
                    <div className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#2f91d0]">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      <CharacterBuilderModal
        open={builderOpen}
        editingCharacter={editingCharacter}
        characterParts={characterParts}
        characterPresets={characterPresets}
        characterIndex={
          editingCharacter
            ? Math.max(
                0,
                characterElements.findIndex(
                  (item) => item.id === editingCharacter.id,
                ),
              )
            : characterElements.length
        }
        onClose={closeBuilder}
        onSave={handleSaveCharacter}
      />
    </div>
  );
}

type CharacterPartTab =
  "FACE" | "HAIR" | "TORSO" | "LEGS" | "HAT" | "ACCESSORY" | "PRESET";

type CharacterBuilderSelection = {
  name: string;
  FACE?: string | undefined;
  HAIR?: string | undefined;
  TORSO?: string | undefined;
  LEGS?: string | undefined;
  HAT?: string | undefined;
  ACCESSORY: string[];
};

const CHARACTER_PART_TABS: Array<{
  type: CharacterPartTab;
  label: string;
  requiredMessage?: string;
}> = [
  { type: "PRESET", label: "Mẫu có sẵn" },
  {
    type: "FACE",
    label: "Khuôn mặt",
    requiredMessage: "Vui lòng chọn khuôn mặt",
  },
  { type: "HAIR", label: "Tóc", requiredMessage: "Vui lòng chọn tóc" },
  { type: "TORSO", label: "Áo", requiredMessage: "Vui lòng chọn áo" },
  { type: "LEGS", label: "Quần", requiredMessage: "Vui lòng chọn quần" },
  { type: "HAT", label: "Mũ" },
  { type: "ACCESSORY", label: "Phụ kiện" },
];

type CharacterPresetConfig = {
  id: string;
  name: string;
  description: string;
  faceHint?: string | undefined;
  hairHint?: string | undefined;
  torsoHint?: string | undefined;
  legsHint?: string | undefined;
  hatHint?: string | undefined;
};

const FALLBACK_PRESETS: CharacterPresetConfig[] = [
  {
    id: "graduation-male",
    name: "Nam tốt nghiệp",
    description: "Tóc nam + mũ tốt nghiệp",
    hairHint: "nam",
    hatHint: "tốt nghiệp",
  },
  {
    id: "graduation-female",
    name: "Nữ tốt nghiệp",
    description: "Tóc nữ + mũ tốt nghiệp",
    hairHint: "nữ",
    hatHint: "tốt nghiệp",
  },
  {
    id: "couple-red",
    name: "Đôi đỏ",
    description: "Áo và quần đỏ",
    torsoHint: "đỏ",
    legsHint: "đỏ",
  },
  {
    id: "couple-black",
    name: "Đôi đen",
    description: "Áo và quần đen",
    torsoHint: "đen",
    legsHint: "đen",
  },
  {
    id: "casual-male",
    name: "Nam bình thường",
    description: "Tóc nam tự nhiên",
    hairHint: "nam",
  },
  {
    id: "casual-female",
    name: "Nữ bình thường",
    description: "Tóc nữ tự nhiên",
    hairHint: "nữ",
  },
];

function mapApiPreset(p: ApiCharacterPreset): CharacterPresetConfig {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    faceHint: p.faceHint ?? undefined,
    hairHint: p.hairHint ?? undefined,
    torsoHint: p.torsoHint ?? undefined,
    legsHint: p.legsHint ?? undefined,
    hatHint: p.hatHint ?? undefined,
  };
}

function findPartByHint(
  parts: ApiCharacterPart[],
  hint?: string,
): string | undefined {
  if (!parts.length) return undefined;
  if (!hint) return parts[0]?.id;
  const lower = hint.toLowerCase();
  const match = parts.find((p) => p.name.toLowerCase().includes(lower));
  return (match ?? parts[0])?.id;
}

const COLOR_FILTER_TABS: ReadonlyArray<CharacterPartTab> = [
  "FACE",
  "HAIR",
  "TORSO",
  "LEGS",
  "HAT",
];

const PART_COLOR_KEYWORDS = [
  { key: "đen", label: "Đen", hex: "#1f1f21" },
  { key: "trắng", label: "Trắng", hex: "#e5e7eb" },
  { key: "đỏ", label: "Đỏ", hex: "#ef4444" },
  { key: "xanh", label: "Xanh", hex: "#3b82f6" },
  { key: "vàng", label: "Vàng", hex: "#facc15" },
  { key: "hồng", label: "Hồng", hex: "#f472b6" },
  { key: "xám", label: "Xám", hex: "#9ca3af" },
  { key: "nâu", label: "Nâu", hex: "#92400e" },
  { key: "tím", label: "Tím", hex: "#a855f7" },
  { key: "cam", label: "Cam", hex: "#f97316" },
  { key: "xanh lá", label: "Xanh lá", hex: "#22c55e" },
] as const;

function getCharacterPartImage(part?: ApiCharacterPart | null) {
  return part?.imageUrl || "";
}

function getCharacterBuilderInitialSelection(
  character: StudioElement | null,
  characterIndex: number,
): CharacterBuilderSelection {
  return {
    name: character?.content || `NV ${characterIndex + 1}`,
    FACE: character?.faceId,
    HAIR: character?.hairId,
    TORSO: character?.torsoId,
    LEGS: character?.legsId,
    HAT: character?.hatId,
    ACCESSORY: character?.accessoryIds ?? [],
  };
}

function CharacterBuilderModal({
  open,
  editingCharacter,
  characterParts,
  characterPresets,
  characterIndex,
  onClose,
  onSave,
}: {
  open: boolean;
  editingCharacter: StudioElement | null;
  characterParts: ApiCharacterPart[];
  characterPresets: ApiCharacterPreset[];
  characterIndex: number;
  onClose: () => void;
  onSave: (input: StudioCharacterInput) => void;
}) {
  const [activeTab, setActiveTab] = useState<CharacterPartTab>("FACE");
  const [selection, setSelection] = useState<CharacterBuilderSelection>(() =>
    getCharacterBuilderInitialSelection(editingCharacter, characterIndex),
  );
  const [error, setError] = useState<string | null>(null);
  const [colorFilter, setColorFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setActiveTab("PRESET");
    setSelection(
      getCharacterBuilderInitialSelection(editingCharacter, characterIndex),
    );
    setError(null);
    setColorFilter(null);
  }, [characterIndex, editingCharacter, open]);

  useEffect(() => {
    setColorFilter(null);
  }, [activeTab]);

  const partsByType = useMemo(() => {
    const groups = new Map<CharacterPartTab, ApiCharacterPart[]>();
    CHARACTER_PART_TABS.forEach((tab) => groups.set(tab.type, []));
    characterParts.forEach((part) => {
      const list = groups.get(part.type as CharacterPartTab);
      if (list) list.push(part);
    });
    groups.forEach((list) =>
      list.sort(
        (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
      ),
    );
    return groups;
  }, [characterParts]);

  const partById = useMemo(
    () => new Map(characterParts.map((part) => [part.id, part])),
    [characterParts],
  );

  const selectedFace = selection.FACE
    ? partById.get(selection.FACE)
    : undefined;
  const selectedHair = selection.HAIR
    ? partById.get(selection.HAIR)
    : undefined;
  const selectedTorso = selection.TORSO
    ? partById.get(selection.TORSO)
    : undefined;
  const selectedLegs = selection.LEGS
    ? partById.get(selection.LEGS)
    : undefined;
  const selectedHat = selection.HAT ? partById.get(selection.HAT) : undefined;
  const selectedAccessories = selection.ACCESSORY.map((id) =>
    partById.get(id),
  ).filter((part): part is ApiCharacterPart => Boolean(part));

  const totalPartFee = [
    selectedFace,
    selectedHair,
    selectedTorso,
    selectedLegs,
    selectedHat,
    ...selectedAccessories,
  ]
    .filter(Boolean)
    .reduce((sum, p) => sum + (p?.priceAdjustment ?? 0), 0);

  const activePresets: CharacterPresetConfig[] =
    characterPresets.length > 0
      ? characterPresets.map(mapApiPreset)
      : FALLBACK_PRESETS;

  const randomize = () => {
    const pick = (type: CharacterPartTab) => {
      const list = partsByType.get(type) ?? [];
      return list.length > 0
        ? list[Math.floor(Math.random() * list.length)]?.id
        : undefined;
    };
    setSelection((curr) => ({
      name: curr.name,
      FACE: pick("FACE"),
      HAIR: pick("HAIR"),
      TORSO: pick("TORSO"),
      LEGS: pick("LEGS"),
      HAT: undefined,
      ACCESSORY: [],
    }));
    setError(null);
  };

  const applyPreset = (preset: CharacterPresetConfig) => {
    const faces = partsByType.get("FACE") ?? [];
    const hairs = partsByType.get("HAIR") ?? [];
    const torsos = partsByType.get("TORSO") ?? [];
    const legs = partsByType.get("LEGS") ?? [];
    const hats = partsByType.get("HAT") ?? [];
    setSelection((curr) => ({
      ...curr,
      FACE: findPartByHint(faces, preset.faceHint) ?? curr.FACE,
      HAIR: findPartByHint(hairs, preset.hairHint) ?? curr.HAIR,
      TORSO: findPartByHint(torsos, preset.torsoHint) ?? curr.TORSO,
      LEGS: findPartByHint(legs, preset.legsHint) ?? curr.LEGS,
      HAT: preset.hatHint ? findPartByHint(hats, preset.hatHint) : curr.HAT,
      ACCESSORY: [],
    }));
    setActiveTab("FACE");
    setError(null);
  };

  const togglePart = (part: ApiCharacterPart) => {
    setError(null);
    if (part.type === "ACCESSORY") {
      setSelection((current) => ({
        ...current,
        ACCESSORY: current.ACCESSORY.includes(part.id)
          ? current.ACCESSORY.filter((id) => id !== part.id)
          : [...current.ACCESSORY, part.id],
      }));
      return;
    }
    if (part.type === "HAT") {
      setSelection((current) => ({
        ...current,
        HAT: current.HAT === part.id ? undefined : part.id,
      }));
      return;
    }

    setSelection((current) => ({
      ...current,
      [part.type]: part.id,
    }));
  };

  const save = () => {
    for (const tab of CHARACTER_PART_TABS) {
      if (
        !tab.requiredMessage ||
        tab.type === "PRESET" ||
        tab.type === "ACCESSORY" ||
        tab.type === "HAT"
      )
        continue;
      if (!selection[tab.type]) {
        setError(tab.requiredMessage);
        setActiveTab(tab.type);
        return;
      }
    }

    if (!selectedFace || !selectedHair || !selectedTorso || !selectedLegs) {
      setError("Vui lòng chọn đủ bộ phận nhân vật");
      return;
    }

    const payload: StudioCharacterInput = {
      name: selection.name.trim() || `NV ${characterIndex + 1}`,
      face: selectedFace,
      hair: selectedHair,
      torso: selectedTorso,
      legs: selectedLegs,
      accessories: selectedAccessories,
    };
    if (selectedHat) {
      payload.hat = selectedHat;
    }
    onSave(payload);
  };

  const activeParts = partsByType.get(activeTab) ?? [];

  const availableColors = useMemo(() => {
    if (!COLOR_FILTER_TABS.includes(activeTab)) return [];
    return PART_COLOR_KEYWORDS.filter((color) =>
      activeParts.some((part) => part.name.toLowerCase().includes(color.key)),
    );
  }, [activeTab, activeParts]);

  const filteredParts = useMemo(() => {
    if (!colorFilter) return activeParts;
    return activeParts.filter((part) =>
      part.name.toLowerCase().includes(colorFilter),
    );
  }, [activeParts, colorFilter]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="studio-no-button-chrome z-[1000] flex items-center justify-center bg-slate-950/60 px-4 py-4 backdrop-blur-sm"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        minHeight: "100dvh",
      }}
      onClick={onClose}
    >
      <div
        className="isolate flex w-full flex-col overflow-hidden rounded-[28px] border border-[#dbe7f1] bg-white"
        style={{
          width: "min(1040px, calc(100vw - 32px))",
          maxHeight: "calc(100dvh - 32px)",
          backgroundColor: "#f8fafc",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 bg-gradient-to-br from-[#2f91d0] to-[#58afe2] px-5 py-5 text-white sm:px-6">
          <div className="min-w-0">
            <h3 className="truncate text-xl font-extrabold text-white sm:text-2xl">
              Tạo nhân vật LEGO
            </h3>
            <p className="mt-1 text-sm font-semibold text-white/95">
              {editingCharacter
                ? "Sửa lựa chọn part cho nhân vật"
                : "Chọn đủ khuôn mặt, tóc, áo và quần"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={randomize}
              title="Chọn ngẫu nhiên"
              className="flex items-center gap-1.5 rounded-full border-0 bg-white/15 px-3 py-2 text-xs font-bold text-white appearance-none outline-none transition-all duration-200 hover:bg-white/25 focus:outline-none focus-visible:outline-none"
            >
              <Zap className="h-3.5 w-3.5" /> Ngẫu nhiên
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-0 bg-white/15 text-white appearance-none outline-none transition-all duration-200 hover:bg-white hover:text-slate-900 focus:outline-none focus-visible:outline-none"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 overflow-hidden bg-[#f8fafc] md:grid-cols-[340px_minmax(0,1fr)]">
          <div className="flex min-h-0 flex-col gap-5 border-b border-[#e4edf5] bg-[#f8fafc] p-5 sm:p-6 md:border-b-0 md:border-r">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Tên nhân vật
              </span>
              <input
                value={selection.name}
                onChange={(event) =>
                  setSelection((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-[16px] border border-[#e4edf5] bg-white px-3 text-sm font-bold text-slate-950 appearance-none outline-none transition-all duration-200 focus:border-[#2f91d0] focus-visible:outline-none"
              />
            </label>

            <CharacterBuilderPreview
              face={selectedFace}
              hair={selectedHair}
              torso={selectedTorso}
              legs={selectedLegs}
              hat={selectedHat}
              accessories={selectedAccessories}
              name={selection.name || `NV ${characterIndex + 1}`}
            />
          </div>

          <div className="flex min-h-0 flex-col bg-white">
            <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-[#e4edf5] bg-white px-4 py-3 scrollbar-hide sm:px-5">
              {CHARACTER_PART_TABS.map((tab) => {
                const selected =
                  tab.type === "PRESET"
                    ? false
                    : tab.type === "ACCESSORY"
                      ? selection.ACCESSORY.length > 0
                      : Boolean(selection[tab.type]);
                return (
                  <button
                    key={tab.type}
                    type="button"
                    onClick={() => setActiveTab(tab.type)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold appearance-none outline-none transition-colors duration-200 focus:outline-none focus-visible:outline-none ${
                      activeTab === tab.type
                        ? "border-[#b9d8ed] bg-[#f4faff] text-[#2f91d0]"
                        : selected
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-[#e4edf5] bg-white text-slate-600 hover:border-[#9ed0ef]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-white p-5 sm:p-6 admin-scrollbar">
              {activeTab === "PRESET" ? (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-slate-500">
                    Chọn mẫu có sẵn để điền nhanh. Bạn vẫn có thể sửa từng part
                    sau khi chọn.
                  </p>
                  <div className="grid grid-cols-2 gap-3.5">
                    {activePresets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="group flex flex-col items-start gap-1.5 rounded-[20px] border border-[#e4edf5] bg-white p-4 text-left appearance-none outline-none transition-all duration-200 hover:border-[#2f91d0] focus:outline-none focus-visible:outline-none"
                      >
                        <span className="text-sm font-bold text-slate-950 group-hover:text-[#2f91d0]">
                          {preset.name}
                        </span>
                        <span className="text-[11px] font-medium leading-relaxed text-slate-500">
                          {preset.description}
                        </span>
                        <span className="mt-0.5 rounded-full bg-[#f4faff] px-2 py-0.5 text-[10px] font-bold text-[#2f91d0]">
                          Áp dụng
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : filteredParts.length === 0 && activeParts.length === 0 ? (
                <div className="grid min-h-[300px] place-items-center rounded-[18px] border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      Chưa có part trong nhóm này
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Thêm part ở admin để khách chọn được trong Studio.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {availableColors.length > 1 && (
                    <div className="mb-3 flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setColorFilter(null)}
                        className={`rounded-full border px-3 py-1 text-[11px] font-bold appearance-none outline-none transition-colors duration-200 focus:outline-none focus-visible:outline-none ${
                          !colorFilter
                            ? "border-[#b9d8ed] bg-[#f4faff] text-[#2f91d0]"
                            : "border-[#e4edf5] bg-white text-slate-600 hover:border-[#9ed0ef]"
                        }`}
                      >
                        Tất cả
                      </button>
                      {availableColors.map((color) => (
                        <button
                          key={color.key}
                          type="button"
                          onClick={() =>
                            setColorFilter(
                              colorFilter === color.key ? null : color.key,
                            )
                          }
                          title={color.label}
                          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold appearance-none outline-none transition-colors duration-200 focus:outline-none focus-visible:outline-none ${
                            colorFilter === color.key
                              ? "border-[#b9d8ed] bg-[#f4faff] text-[#2f91d0]"
                              : "border-[#e4edf5] bg-white text-slate-600 hover:border-[#9ed0ef]"
                          }`}
                        >
                          <span
                            className="h-3 w-3 shrink-0 rounded-full border border-slate-300"
                            style={{ backgroundColor: color.hex }}
                          />
                          {color.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {filteredParts.length === 0 ? (
                    <div className="flex min-h-[120px] items-center justify-center rounded-[16px] border border-dashed border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                      Không có part màu này
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-3">
                      {activeTab === "HAT" && (
                        <button
                          type="button"
                          onClick={() =>
                            setSelection((c) => ({ ...c, HAT: undefined }))
                          }
                          className={`group relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-[16px] border bg-white p-3 appearance-none outline-none transition-all duration-200 focus:outline-none focus-visible:outline-none ${
                            !selection.HAT
                              ? "border-[#9ed0ef]"
                              : "border-[#e4edf5] hover:border-[#9ed0ef]"
                          }`}
                        >
                          <div className="grid h-12 w-12 place-items-center rounded-full bg-[#f4faff]">
                            <X className="h-6 w-6 text-slate-400" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-600">
                            Không chọn
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            Miễn phí
                          </span>
                          {!selection.HAT && (
                            <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-[#2f91d0] text-white">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </button>
                      )}
                      {filteredParts.map((part) => {
                        const active =
                          part.type === "ACCESSORY"
                            ? selection.ACCESSORY.includes(part.id)
                            : selection[part.type] === part.id;
                        return (
                          <button
                            key={part.id}
                            type="button"
                            onClick={() => togglePart(part)}
                            className={`group relative flex aspect-square flex-col items-center justify-between overflow-hidden rounded-[20px] border bg-white p-2.5 appearance-none outline-none transition-all duration-200 focus:outline-none focus-visible:outline-none ${
                              active
                                ? "border-[#9ed0ef]"
                                : "border-[#e4edf5] hover:border-[#9ed0ef]"
                            }`}
                          >
                            <div className="relative min-h-0 w-full flex-1">
                              {part.imageUrl ? (
                                <img
                                  src={part.imageUrl}
                                  alt={part.name}
                                  loading="lazy"
                                  className="h-full w-full object-contain transition-transform"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="grid h-full place-items-center rounded-[12px] bg-[#f4faff] text-xs font-bold text-slate-500">
                                  {part.type}
                                </div>
                              )}
                              {active && (
                                <span className="absolute right-0 top-0 grid h-5 w-5 place-items-center rounded-full bg-[#2f91d0] text-white">
                                  <Check className="h-3.5 w-3.5" />
                                </span>
                              )}
                            </div>
                            <div className="mt-1 w-full text-center">
                              <span className="block truncate px-1 text-[10px] font-bold leading-tight text-slate-950">
                                {part.name}
                              </span>
                              <span
                                className={`text-[10px] font-bold ${part.priceAdjustment > 0 ? "text-[#2f91d0]" : "text-slate-500"}`}
                              >
                                {part.priceAdjustment > 0
                                  ? `+${formatPrice(part.priceAdjustment)}`
                                  : "Miễn phí"}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#e4edf5] bg-white px-5 py-4 sm:px-6 sm:py-5">
          {error ? (
            <p className="mb-3 rounded-[16px] border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}
          <div className="mb-3 flex items-center justify-between rounded-[16px] bg-[#f4faff] px-4 py-2 text-xs">
            <span className="font-medium text-slate-600">
              1 nhân vật: 10.000
              {totalPartFee > 0 && ` + part: +${formatPrice(totalPartFee)}`}
            </span>
            <span className="font-bold text-[#2f91d0]">
              {formatPrice(10000 + totalPartFee)}
            </span>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-[18px] border border-[#e4edf5] bg-white px-5 text-sm font-bold text-slate-600 appearance-none outline-none transition-colors duration-200 hover:bg-[#fbfdff] focus:outline-none focus-visible:outline-none"
            >
              Hủy
            </button>
            <button
              type="button"
              data-flat-button="true"
              onClick={save}
              className="h-12 rounded-[18px] border-0 bg-[#2f91d0] px-6 text-sm font-bold text-white appearance-none outline-none transition-colors duration-200 hover:bg-[#257fb7] focus:outline-none focus-visible:outline-none"
            >
              Lưu nhân vật
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function CharacterBuilderPreview({
  face,
  hair,
  torso,
  legs,
  hat,
  accessories,
  name,
}: {
  face?: ApiCharacterPart | undefined;
  hair?: ApiCharacterPart | undefined;
  torso?: ApiCharacterPart | undefined;
  legs?: ApiCharacterPart | undefined;
  hat?: ApiCharacterPart | undefined;
  accessories: ApiCharacterPart[];
  name: string;
}) {
  const layers = [legs, torso, face, hair, hat, ...accessories].filter(
    Boolean,
  ) as ApiCharacterPart[];

  return (
    <div className="rounded-[24px] border border-[#e4edf5] bg-white p-5">
      <div className="relative mx-auto h-72 w-44 overflow-visible rounded-[22px] bg-[#f4faff]">
        {layers.length > 0 ? (
          layers.map((part) => (
            <img
              key={`${part.type}-${part.id}`}
              src={getCharacterPartImage(part)}
              alt=""
              className="absolute inset-0 h-full w-full object-contain"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ))
        ) : (
          <div className="grid h-full place-items-center text-xs font-bold text-slate-400">
            NV
          </div>
        )}
      </div>
      <p className="mt-3 truncate text-center text-sm font-bold text-slate-950">
        {name}
      </p>
    </div>
  );
}

// ==================== Step 4: Hoàn tất ====================
function Step4Finish() {
  const {
    totalPrice,
    frameSize,
    frameSizes,
    characterCount,
    characterPrice,
    elements,
    printText,
    contentFields,
    contentValues,
    activeTemplate,
    customBackgroundUrl,
    customBackgroundOriginalName,
    templates,
    isEditMode,
    editCartItemId,
    setStep,
  } = useStudio();
  const addItem = useCartStore((state) => state.addItem);
  const updateItem = useCartStore((state) => state.updateItem);
  const openCart = useCartStore((state) => state.openCart);
  const openModal = useUIStore((state) => state.openModal);

  const [seconds, setSeconds] = useState(15 * 60);
  useEffect(() => {
    const interval = setInterval(
      () => setSeconds((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => clearInterval(interval);
  }, []);

  const timerMins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const timerSecs = String(seconds % 60).padStart(2, "0");

  const frameObj = frameSizes.find((s) => s.id === frameSize);
  const designCanvasSize = getStudioCanvasSize(frameObj, frameSizes);
  const accessoryItems = elements.filter((e) => e.type === "accessory");
  const characterItems = elements.filter((e) => e.type === "character");
  const selectedTemplate = templates.find((t) => t.id === activeTemplate);
  const previewUrl = customBackgroundUrl ?? selectedTemplate?.imageUrl ?? null;
  const missingRequiredContent = getMissingRequiredContentField(
    contentFields,
    contentValues,
  );
  const hasPersistablePreview = isPersistableImageUrl(previewUrl);
  const canCheckout = Boolean(
    frameSize && !missingRequiredContent && hasPersistablePreview,
  );
  const checkoutBlockMessage = !frameSize
    ? "Vui lòng chọn khung trước khi thanh toán."
    : missingRequiredContent
      ? `Vui lòng nhập ${missingRequiredContent.label.toLowerCase()} trước khi thanh toán.`
      : !hasPersistablePreview
        ? "Vui lòng chọn mẫu nền hoặc tải ảnh để tiếp tục thanh toán."
        : null;
  const accessorySnapshot = accessoryItems
    .filter((el) => typeof el.accessoryId === "string")
    .map((el) => ({
      id: el.accessoryId as string,
      name: el.content || "Accessory",
      price: el.price || 0,
      quantity: 1,
    }));
  const charactersTotalPrice = characterItems.reduce(
    (sum, character) => sum + (character.price ?? characterPrice),
    0,
  );

  const getContentValue = (candidates: string[], fallback = "") => {
    for (const candidate of candidates) {
      const directValue = contentValues[candidate];
      if (directValue?.trim()) return directValue.trim();
    }

    const matchedField = contentFields.find((field) => {
      const haystack = `${field.key} ${field.label}`.toLowerCase();
      return candidates.some((candidate) =>
        haystack.includes(candidate.toLowerCase()),
      );
    });
    const matchedValue = matchedField
      ? contentValues[matchedField.key]
      : undefined;

    return matchedValue?.trim() || fallback;
  };

  const backgroundId =
    selectedTemplate?.source === "background" &&
    selectedTemplate.id.startsWith("background:")
      ? selectedTemplate.id.replace("background:", "")
      : null;

  const buildDesignData = (): CustomFrameDesignData => ({
    version: 1,
    type: "CUSTOM_FRAME",
    frameOptionId: frameSize,
    frameOptionLabel: frameObj?.label ?? frameSize,
    ...(frameObj?.colorName ? { frameColorName: frameObj.colorName } : {}),
    ...(frameObj?.colorHex ? { frameColorHex: frameObj.colorHex } : {}),
    canvasSize: designCanvasSize,
    backgroundId,
    backgroundName: selectedTemplate?.name ?? null,
    content: {
      recipientName: getContentValue(
        ["recipientName", "title", "name", "ten"],
        printText.title,
      ),
      graduationDate: getContentValue(
        ["graduationDate", "date", "ngay"],
        printText.date,
      ),
      majorOrSchool: getContentValue([
        "majorOrSchool",
        "major",
        "school",
        "nganh",
        "truong",
      ]),
      message: getContentValue(
        ["message", "note", "loi", "thong"],
        printText.message,
      ),
    },
    contentValues: { ...contentValues },
    printText: { ...printText },
    elements: elements
      .filter((el) => el.type === "text")
      .map((el) => ({
        id: el.id,
        type: el.type,
        x: el.x,
        y: el.y,
        ...(el.content ? { content: el.content } : {}),
        ...(typeof el.fontSize === "number" ? { fontSize: el.fontSize } : {}),
        ...(el.color ? { color: el.color } : {}),
        ...(typeof el.width === "number" ? { width: el.width } : {}),
        ...(typeof el.height === "number" ? { height: el.height } : {}),
      })),
    uploadedImages: customBackgroundUrl
      ? [
          {
            id: "background-upload",
            url: customBackgroundUrl,
            type: "background",
            originalName: customBackgroundOriginalName,
            position: { x: 0, y: 0, scale: 1, rotate: 0 },
          },
        ]
      : [],
    accessories: accessoryItems
      .filter((el) => typeof el.accessoryId === "string")
      .map((el) => ({
        id: el.accessoryId as string,
        name: el.content || "Accessory",
        quantity: 1,
        imageUrl: el.imageUrl ?? null,
        position: {
          x: el.x,
          y: el.y,
          scale: el.width ? el.width / 60 : 1,
          rotate: 0,
        },
      })),
    characters: characterItems.map((el, index) => {
      const x = el.x;
      const y = el.y;
      const scale = el.scale ?? (el.width ? el.width / 54 : 1);
      const rotation = el.rotation ?? 0;

      return {
        id: el.id,
        ...(el.characterId ? { catalogId: el.characterId } : {}),
        name: el.content || `NV ${index + 1}`,
        x,
        y,
        scale,
        rotation,
        faceId: el.faceId ?? "",
        hairId: el.hairId ?? "",
        torsoId: el.torsoId ?? "",
        legsId: el.legsId ?? "",
        ...(el.hatId ? { hatId: el.hatId } : {}),
        accessoryIds: el.accessoryIds ?? [],
        characterParts: serializeCharacterParts(el.characterParts),
        imageUrl: el.imageUrl ?? null,
        price: el.price ?? characterPrice,
        position: {
          x,
          y,
          scale,
          rotate: rotation,
          rotation,
        },
      };
    }),
    previewUrl,
  });

  const buildCartParts = (): CartItemPart[] => {
    const parts: CartItemPart[] = [];

    if (frameObj) {
      parts.push({
        id: frameSize,
        type: "frame",
        name: [frameObj.label, frameObj.colorName].filter(Boolean).join(" - "),
        quantity: 1,
        unitPrice: frameObj.price,
        totalPrice: frameObj.price,
      });
    }

    if (selectedTemplate || customBackgroundUrl) {
      const imageUrl =
        customBackgroundUrl ?? selectedTemplate?.imageUrl ?? null;
      parts.push({
        ...(backgroundId ? { id: backgroundId } : {}),
        type: "background",
        name:
          selectedTemplate?.name ??
          customBackgroundOriginalName ??
          "Anh nen tuy chinh",
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        imageUrl,
      });
    }

    characterItems.forEach((character, index) => {
      parts.push({
        ...(character.characterId ? { id: character.characterId } : {}),
        type: "character",
        name: character.content || `NV ${index + 1}`,
        quantity: 1,
        unitPrice: character.price ?? characterPrice,
        totalPrice: character.price ?? characterPrice,
        ...(character.imageUrl ? { imageUrl: character.imageUrl } : {}),
      });
    });

    accessoryItems.forEach((accessory) => {
      parts.push({
        ...(accessory.accessoryId ? { id: accessory.accessoryId } : {}),
        type: "accessory",
        name: accessory.content || "Accessory",
        quantity: 1,
        unitPrice: accessory.price || 0,
        totalPrice: accessory.price || 0,
        ...(accessory.imageUrl ? { imageUrl: accessory.imageUrl } : {}),
      });
    });

    return parts;
  };

  const buildCartItem = () => ({
    productId: null,
    productName: `Khung LEGO tùy chỉnh${printText.title ? ` - ${printText.title}` : ""}`,
    quantity: 1,
    unitPrice: totalPrice,
    frameOptionId: frameSize,
    frameSizeId: frameSize,
    frameSizeLabel: frameObj?.label ?? frameSize,
    frameColorName: frameObj?.colorName ?? "",
    accessories: accessorySnapshot,
    parts: buildCartParts(),
    templateId: activeTemplate,
    designData: buildDesignData(),
    previewUrl,
  });

  const persistCartItem = () => {
    const cartItem = buildCartItem();
    if (isEditMode && editCartItemId) {
      updateItem(editCartItemId, cartItem);
      return;
    }

    addItem(cartItem);
  };

  const openCartDrawer = () => {
    openCart();
    openModal(UI_MODAL_IDS.CART_DRAWER);
    window.dispatchEvent(new CustomEvent("legoshop:open-cart"));
  };

  const handleAddToCart = () => {
    if (!canCheckout) return;
    persistCartItem();
    openCartDrawer();
  };
  const handleBuyNow = () => {
    if (!canCheckout) return;
    persistCartItem();
    openCartDrawer();
  };

  return (
    <div className="space-y-5 pb-6">
      {seconds > 0 && (
        <div className="flex animate-fade-in items-center justify-between rounded-[24px] bg-gradient-to-r from-[#2f91d0] to-[#5aaee3] px-5 py-4 text-white">
          <div>
            <div className="flex items-center gap-1.5 text-[13px] font-semibold tracking-wide">
              <Zap className="h-4 w-4 fill-white" /> ƯU ĐÃI PHÚT CHÓT!
            </div>
            <div className="mt-1 text-[11px] font-medium text-white/90">
              Hoàn tất thiết kế ngay để nhận 1 sticker quà tặng
            </div>
          </div>
          <div className="rounded-2xl bg-white/16 px-2.5 py-1.5 font-mono text-lg font-bold tracking-widest backdrop-blur-sm">
            {timerMins}:{timerSecs}
          </div>
        </div>
      )}

      <div className="rounded-[24px] border border-[#e4edf5] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)]">
        <div className="flex items-center justify-between border-b border-[#e4edf5] bg-transparent px-[18px] py-4">
          <h3 className="text-xs font-semibold tracking-wide text-slate-950 uppercase">
            Chi tiết thiết kế
          </h3>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
            {characterCount} NV
          </span>
        </div>

        <div className="divide-y divide-[#e4edf5]">
          {frameObj && (
            <div className="flex items-start justify-between px-[18px] py-4 transition-colors duration-200 hover:bg-slate-50/60">
              <div>
                <p className="text-sm font-bold text-slate-950">
                  {frameObj.label}
                </p>
                {frameObj.colorName ? (
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    Màu: {frameObj.colorName}
                  </p>
                ) : null}
              </div>
              <span className="text-sm font-bold text-slate-950">
                {formatPrice(frameObj.price)}
              </span>
            </div>
          )}

          {characterCount > 0 && (
            <div className="flex items-start justify-between px-[18px] py-4 transition-colors duration-200 hover:bg-slate-50/60">
              <div>
                <p className="text-sm font-bold text-slate-950">
                  Nhân vật LEGO
                </p>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  {characterCount} × {formatPrice(characterPrice)}
                </p>
              </div>
              <span className="text-sm font-bold text-slate-950">
                {formatPrice(charactersTotalPrice)}
              </span>
            </div>
          )}

          {accessoryItems.map((el) => (
            <div
              key={el.id}
              className="flex items-start justify-between px-[18px] py-4 transition-colors duration-200 hover:bg-slate-50/60"
            >
              <div>
                <p className="text-sm font-bold text-slate-950">{el.content}</p>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  Số lượng: 1
                </p>
              </div>
              <span className="text-sm font-bold text-slate-950">
                {formatPrice(el.price || 0)}
              </span>
            </div>
          ))}
        </div>

        <div className="mx-5 mb-5 rounded-[22px] border border-[#dbe7f1] bg-[#f8fbff] px-5 py-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-widest text-slate-600">
              Tổng cộng
            </span>
            <span className="text-2xl font-bold text-[#2f91d0]">
              {formatPrice(totalPrice)}
            </span>
          </div>
          <p className="mt-2 text-right text-xs font-medium text-slate-500">
            Chưa bao gồm phí ship. Shop báo phí trước khi giao.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-[24px] border border-[#cfe4f4] bg-[#f4faff] p-5">
        <span className="text-xl leading-none">💡</span>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
            Mẹo: Đặt sớm (Early Bird)
          </p>
          <p className="text-xs font-medium leading-relaxed text-[#437ea8]">
            Sản phẩm cần <strong>1-2 ngày</strong> hoàn thiện. Chọn ngày nhận{" "}
            <strong>sau 20 ngày</strong> để được giảm ngay{" "}
            <span className="font-bold text-blue-800">5%</span>!
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        {checkoutBlockMessage ? (
          <div
            role="alert"
            className="rounded-[22px] border border-amber-200/80 bg-amber-50/90 px-4 py-4 text-sm font-medium leading-relaxed text-amber-800"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{checkoutBlockMessage}</span>
            </div>
            {missingRequiredContent ? (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="mt-3 inline-flex h-9 items-center justify-center rounded-full border border-amber-300 bg-white px-3 text-xs font-semibold text-amber-900 appearance-none outline-none transition-colors duration-200 hover:bg-amber-100 focus:outline-none focus-visible:outline-none"
              >
                Điền nội dung
              </button>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          data-flat-button="true"
          onClick={handleBuyNow}
          disabled={!canCheckout}
          className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-[18px] border-0 bg-[#2f91d0] px-4 text-sm font-semibold text-white appearance-none outline-none transition-colors duration-200 hover:bg-[#257fb7] disabled:cursor-not-allowed disabled:border-0 disabled:bg-slate-200 disabled:text-slate-500 focus:outline-none focus-visible:outline-none"
        >
          <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
            <div className="relative h-full w-8 bg-white/20" />
          </div>
          <span>Thanh toán ngay</span>{" "}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>

        <div className="grid gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!canCheckout}
            className="flex h-12 items-center justify-center gap-2 rounded-[18px] border border-[#e4edf5] bg-white px-4 text-sm font-semibold text-slate-950 appearance-none outline-none transition-all duration-200 hover:border-[#bfdcf0] hover:bg-[#fbfdff] hover:text-[#2f91d0] disabled:cursor-not-allowed disabled:border-transparent disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus-visible:outline-none"
          >
            <ShoppingCart className="h-4 w-4" />{" "}
            {isEditMode ? "Cập nhật thiết kế" : "Thêm vào giỏ"}
          </button>
        </div>
      </div>
    </div>
  );
}
