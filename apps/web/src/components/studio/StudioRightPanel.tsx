"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useStudio, type ApiFrameSize, type StudioContentField } from "./StudioContext";
import { formatPrice } from "@/lib/formatters";
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
} from "lucide-react";
import { useCartStore, type CartItemPart } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { UI_MODAL_IDS } from "@/constants";
import { uploadCustomerImage } from "@/lib/api/uploads";
import { isPersistableImageUrl } from "./design-data";
import type { CustomFrameDesignData } from "@lego-shop/shared";

const getFrameColorHex = (name: string, apiHex?: string | null): string => {
  if (apiHex && apiHex.startsWith("#")) return apiHex;
  const lower = name.trim().toLowerCase();
  if (lower === "trắng" || lower === "white") return "#ffffff";
  if (lower === "đen" || lower === "black") return "#1f1f21";
  if (lower === "gỗ" || lower === "wood") return "#d7a15c";
  return "#d1d5db";
};

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
    if (step === 1 && !frameSize)
      return "Vui lòng chọn khung.";
    if (step === 2) {
      const missingField = getMissingRequiredContentField(
        contentFields,
        contentValues,
      );
      if (missingField)
        return `Vui lòng nhập ${missingField.label.toLowerCase()} để tiếp tục.`;
    }
    return null;
  }, [
    contentFields,
    contentValues,
    dataError,
    frameSize,
    isLoadingData,
    step,
  ]);
  const canContinue = !validationMessage;

  const handleNext = () => {
    if (!canContinue) return;
    setStep(Math.min(4, step + 1));
  };
  const handleBack = () => setStep(Math.max(1, step - 1));

  return (
    <div className="z-20 flex w-[520px] max-w-[44vw] shrink-0 flex-col border-l border-border bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
      <div className="flex-1 overflow-y-auto p-7 space-y-6 scrollbar-hide">
        <div className="animate-fade-in">
          {step === 1 && <Step1Frame />}
          {step === 2 && <Step2Content />}
          {step === 3 && <Step3Characters />}
          {step === 4 && <Step4Finish />}
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-white p-6 shadow-[0_-8px_30px_rgba(15,23,42,0.06)]">
        {validationMessage && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-relaxed text-amber-800">
            {validationMessage}
          </div>
        )}
        <div className="mb-4 flex items-center justify-between px-1">
          <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">
            Giá tạm tính:
          </span>
          <span className="text-2xl font-black text-[#ef9ab3] drop-shadow-sm">
            {formatPrice(totalPrice)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center justify-center gap-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-bold text-text-secondary shadow-sm transition-all hover:bg-surface-hover hover:text-text-primary"
            >
              <ChevronLeft className="h-4 w-4" /> Quay lại
            </button>
          )}

          {step < 4 && (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canContinue}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-[#ef9ab3] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#e77f9f] hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none disabled:hover:translate-y-0"
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

// ─── Step 1: Chọn khung ────────────────────────────────────────────────────
function Step1Frame() {
  const {
    frameSize,
    setFrameSize,
    frameSizes,
    isLoadingData,
  } = useStudio();

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
      group.variants.find((variant) => preferredColor && variant.colorName === preferredColor) ??
      group.variants.find((variant) => preferredHex && variant.colorHex === preferredHex) ??
      group.variants[0];

    if (nextVariant) setFrameSize(nextVariant.id);
  };

  if (isLoadingData) {
    return (
      <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
        <div className="mb-4 h-4 w-36 rounded bg-surface-hover animate-pulse" />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[72px] rounded-md bg-surface-hover animate-pulse"
            />
          ))}
        </div>
        <div className="my-4 h-px bg-border" />
        <div className="flex gap-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-9 w-20 rounded-md bg-surface-hover animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (frameSizeGroups.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-white p-4 text-sm font-semibold text-text-muted shadow-sm">
        Chưa có kích thước khung.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-xs font-black tracking-wide text-text-primary uppercase">
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
              className={`relative flex h-[72px] min-w-0 flex-col items-center justify-center gap-1 rounded-md border px-2 text-center transition-all ${
                active
                  ? "border-[#ef9ab3] bg-[#ef9ab3] text-white shadow-md"
                  : "border-border bg-white text-text-primary hover:border-[#ef9ab3] hover:bg-[#fff4f7]"
              }`}
            >
              {group.popular && (
                <span className="absolute right-2 top-[-7px] max-w-[88px] truncate rounded-[4px] bg-amber-400 px-1.5 py-0.5 text-[9px] font-black leading-none text-amber-950 shadow-sm">
                  Phổ biến nhất
                </span>
              )}
              <span className="max-w-full truncate text-[13px] font-bold leading-tight">
                {group.label}
              </span>
              <span className={`text-xs font-semibold ${active ? "text-white/90" : "text-text-muted"}`}>
                {formatPrice(displayPrice)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="my-4 h-px bg-border" />

      <p className="mb-2 text-[11px] font-black tracking-wide text-text-muted uppercase">
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
              className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-bold transition-all ${
                active
                  ? "border-[#ef9ab3] bg-[#fff4f7] text-[#d94f77]"
                  : "border-border bg-white text-text-primary hover:border-[#ef9ab3]"
              }`}
            >
              <span
                className="h-3.5 w-3.5 rounded-full border border-zinc-300 shadow-inner"
                style={{ backgroundColor: getFrameColorHex(colorName, variant.colorHex) }}
              />
              {colorName}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 2: Nội dung ──────────────────────────────────────────────────────
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
      setUploadError(error instanceof Error ? error.message : "Không tải được ảnh lên");
    } finally {
      setIsUploadingBackground(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary">CHỌN ẢNH NỀN</h3>
          <span className="rounded-full bg-surface-hover px-2.5 py-0.5 text-xs font-bold text-text-muted">
            {filteredTemplates.length + (customBackgroundUrl ? 1 : 0)} mẫu
          </span>
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            type="button"
            onClick={() => setActiveCategoryId(null)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              !activeCategoryId
                ? "bg-[#ef9ab3] text-white shadow-md"
                : "border border-border bg-surface text-text-secondary hover:border-[#ef9ab3]/50 hover:bg-[#fff4f7]"
            }`}
          >
            TẤT CẢ
          </button>
          {templateCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategoryId(cat.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                activeCategoryId === cat.id
                  ? "bg-[#ef9ab3] text-white shadow-md"
                  : "border border-border bg-surface text-text-secondary hover:border-[#ef9ab3]/50 hover:bg-[#fff4f7]"
              }`}
            >
              {cat.name.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="grid max-h-[320px] grid-cols-4 gap-3 overflow-y-auto pr-1 scrollbar-hide">
          {customBackgroundUrl && (
            <button
              type="button"
              onClick={() => {
                setActiveTemplate(null);
                setCustomBackgroundOriginalName(null);
                clearContentValues();
              }}
              className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                !activeTemplate
                  ? "border-[#ef9ab3] shadow-md scale-95 ring-4 ring-[#ef9ab3]/20"
                  : "border-transparent bg-surface-hover hover:border-[#ef9ab3]/40 hover:shadow-md"
              }`}
            >
              <img
                src={customBackgroundUrl}
                alt="Ảnh nền của bạn"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {!activeTemplate && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#ef9ab3]/20 backdrop-blur-[1px]">
                  <div className="rounded-full bg-[#ef9ab3] p-1 shadow-lg">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-center pt-6">
                <span className="block truncate text-[9px] font-extrabold uppercase tracking-wider text-white drop-shadow-md">
                  Ảnh của bạn
                </span>
              </div>
            </button>
          )}
          {isLoadingData ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-surface-hover animate-pulse"
              />
            ))
          ) : filteredTemplates.length === 0 && !customBackgroundUrl ? (
            <div className="col-span-4 py-10 text-center text-sm font-medium text-text-muted">
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
                className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                  activeTemplate === tpl.id
                    ? "border-[#ef9ab3] shadow-md scale-95 ring-4 ring-[#ef9ab3]/20"
                    : "border-transparent bg-surface-hover hover:border-[#ef9ab3]/40 hover:shadow-md"
                }`}
              >
                {tpl.imageUrl ? (
                  <img
                    src={tpl.imageUrl}
                    alt={tpl.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface-hover p-2">
                    <span className="text-center text-[10px] font-medium leading-tight text-text-muted">
                      {tpl.name}
                    </span>
                  </div>
                )}

                {activeTemplate === tpl.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#ef9ab3]/20 backdrop-blur-[1px]">
                    <div className="rounded-full bg-[#ef9ab3] p-1 shadow-lg">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-center pt-6">
                  <span className="block truncate text-[9px] font-extrabold uppercase tracking-wider text-white drop-shadow-md">
                    {tpl.name}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => backgroundInputRef.current?.click()}
            disabled={isUploadingBackground}
            className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface py-3 text-xs font-bold text-text-secondary transition-all hover:border-[#ef9ab3] hover:bg-[#fff4f7] hover:text-[#d94f77]"
          >
            <UploadCloud className="h-4 w-4 transition-transform group-hover:-translate-y-1" />
            {isUploadingBackground ? "ĐANG TẢI ẢNH..." : "TẢI ẢNH NỀN CỦA BẠN LÊN"}
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
            <p className="mt-2 text-xs font-semibold text-red-600">{uploadError}</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            className="text-xs font-bold text-text-muted transition-colors hover:text-error"
            onClick={clearContentValues}
          >
            XÓA TẤT CẢ
          </button>
        </div>
        {(selectedTemplate?.description || selectedTemplate?.instructions) && (
          <div className="mb-4 rounded-xl border border-[#ef9ab3]/30 bg-[#fff4f7] px-4 py-3 text-xs leading-relaxed text-slate-700">
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
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  Tên / Lời tựa ngắn <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Tú & Lan"
                  value={printText.title}
                  onChange={(e) =>
                    setPrintText({ ...printText, title: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-background p-3 text-sm font-medium text-text-primary shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  Ngày kỷ niệm (nếu có)
                </label>
                <input
                  type="date"
                  value={printText.date}
                  onChange={(e) =>
                    setPrintText({ ...printText, date: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-background p-3 text-sm font-medium text-text-primary shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  Lời nhắn (nếu có)
                </label>
                <textarea
                  placeholder="VD: Chúc mừng sinh nhật..."
                  value={printText.message}
                  onChange={(e) =>
                    setPrintText({ ...printText, message: e.target.value })
                  }
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm font-medium text-text-primary shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Nhân vật ──────────────────────────────────────────────────────
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
    "w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-[#ef9ab3] focus:ring-2 focus:ring-[#ef9ab3]/20";

  return (
    <div>
      <label className="mb-2 block text-[12px] font-bold text-slate-700">
        {field.label}{" "}
        {field.required && <span className="text-[#ef5f86]">*</span>}
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
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-white px-4 py-5 text-center text-sm font-bold text-slate-600 transition-all hover:border-[#ef9ab3] hover:bg-[#fff4f7] hover:text-[#d94f77]">
          <UploadCloud className="h-5 w-5" />
          <span>{value || field.placeholder || "Chọn ảnh tải lên"}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => onChange(event.target.files?.[0]?.name ?? "")}
          />
        </label>
      ) : (
        <input
          type={field.type === "date" ? "date" : "text"}
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

function Step3Characters() {
  const {
    characterCount,
    characterPrice,
    characters,
    accessories,
    accessoryCategories,
    addElement,
    addCharacter,
    elements,
    removeElement,
    selectedId,
    setSelectedId,
    isLoadingData,
  } = useStudio();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

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
  const charactersTotalPrice = useMemo(
    () => characterElements.reduce((sum, character) => sum + (character.price ?? characterPrice), 0),
    [characterElements, characterPrice],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-4 text-xs font-semibold leading-5 text-text-secondary shadow-sm">
        Phí vận chuyển chưa cộng vào đơn. Shop sẽ báo phí trước khi giao và khách trả trực tiếp cho tài xế.
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-text-primary uppercase">
          Quản lý nhân vật
        </h3>
        {characters.length > 0 ? (
          <div className="mb-4 grid max-h-[220px] grid-cols-2 gap-2 overflow-y-auto pr-1 scrollbar-hide">
            {characters.map((character) => (
              <button
                key={character.id}
                type="button"
                onClick={() => addCharacter(character)}
                className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-white p-2 text-left transition hover:border-[#ef9ab3]/60 hover:bg-[#fff4f7]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-hover">
                  {character.imageUrl ? (
                    <img src={character.imageUrl} alt={character.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-black text-text-muted">NV</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-black text-text-primary">{character.name}</p>
                  <p className="text-[11px] font-semibold text-[#ef5f86]">{formatPrice(character.price)}</p>
                </div>
              </button>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          {characterElements.map((character, index) => {
            const active = selectedId === character.id;
            return (
              <div key={character.id} className="relative">
                <button
                  type="button"
                  onClick={() => setSelectedId(character.id)}
                  className={`h-10 rounded-xl border px-4 text-sm font-black transition-all ${
                    active
                      ? "border-[#ef9ab3] bg-[#fff4f7] text-[#ef5f86] shadow-sm"
                      : "border-border bg-surface-hover text-text-secondary hover:border-[#ef9ab3]/60 hover:bg-[#fff4f7]"
                  }`}
                >
                  {character.content || `NV ${index + 1}`}
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeElement(character.id);
                  }}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-error text-xs font-black leading-none text-white shadow-sm transition-transform hover:scale-105"
                  aria-label={`Xóa ${character.content || `NV ${index + 1}`}`}
                >
                  ×
                </button>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => addCharacter()}
            className="flex h-10 items-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-black text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-lg active:translate-y-0"
          >
            <span>+</span> Thêm ({formatPrice(characterPrice)})
          </button>
        </div>
        {characterCount > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-surface-hover px-3 py-2 text-xs font-medium text-text-secondary">
            <span>
              {characterCount} nhân vật × {formatPrice(characterPrice)}
            </span>
            <span className="font-bold text-text-primary">
              {formatPrice(charactersTotalPrice)}
            </span>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden flex flex-col">
        <div className="border-b border-border bg-background px-5 py-4">
          <h3 className="mb-4 text-sm font-bold text-text-primary uppercase">
            Thêm phụ kiện & Charm
          </h3>

          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Tìm phụ kiện (hoa, xe, bóng bay...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm font-medium shadow-inner outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              type="button"
              onClick={() => setActiveCategoryId(null)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                !activeCategoryId
                  ? "bg-text-primary text-background shadow-md"
                  : "border border-border bg-surface text-text-secondary hover:border-text-muted hover:bg-surface-hover"
              }`}
            >
              TẤT CẢ
            </button>
            {accessoryCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategoryId(cat.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  activeCategoryId === cat.id
                    ? "bg-text-primary text-background shadow-md"
                    : "border border-border bg-surface text-text-secondary hover:border-text-muted hover:bg-surface-hover"
                }`}
              >
                {cat.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid max-h-[340px] grid-cols-4 gap-3 overflow-y-auto bg-surface p-5 scrollbar-hide">
          {isLoadingData ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-surface-hover animate-pulse"
              />
            ))
          ) : filteredAccessories.length === 0 ? (
            <div className="col-span-4 py-10 text-center text-sm font-medium text-text-muted">
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
                    } else
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
                  }}
                  className={`group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl border-2 p-2 transition-all duration-300 ${
                    isAdded
                      ? "border-[#ef9ab3] bg-[#fff4f7] shadow-inner"
                      : "border-border bg-surface hover:border-[#ef9ab3]/40 hover:bg-[#fff4f7]/50 hover:shadow-md"
                  }`}
                >
                  {acc.imageUrl || acc.iconUrl ? (
                    <img
                      src={acc.imageUrl || acc.iconUrl || ""}
                      alt={acc.name}
                      loading="lazy"
                      className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-sm"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-surface-hover" />
                  )}

                  <span className="mt-2 w-full truncate px-1 text-center text-[10px] font-bold text-text-secondary">
                    {acc.name}
                  </span>

                  <span className="mt-0.5 text-[10px] font-black text-[#ef5f86]">
                    {formatPrice(acc.price)}
                  </span>

                  {isAdded && (
                    <div className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ef9ab3] shadow-sm">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Hoàn tất ──────────────────────────────────────────────────────
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
      return candidates.some((candidate) => haystack.includes(candidate.toLowerCase()));
    });
    const matchedValue = matchedField ? contentValues[matchedField.key] : undefined;

    return matchedValue?.trim() || fallback;
  };

  const backgroundId =
    selectedTemplate?.source === "background" && selectedTemplate.id.startsWith("background:")
      ? selectedTemplate.id.replace("background:", "")
      : null;

  const buildDesignData = (): CustomFrameDesignData => ({
    version: 1,
    type: "CUSTOM_FRAME",
    frameOptionId: frameSize,
    frameOptionLabel: frameObj?.label ?? frameSize,
    ...(frameObj?.colorName ? { frameColorName: frameObj.colorName } : {}),
    ...(frameObj?.colorHex ? { frameColorHex: frameObj.colorHex } : {}),
    backgroundId,
    backgroundName: selectedTemplate?.name ?? null,
    content: {
      recipientName: getContentValue(["recipientName", "title", "name", "ten"], printText.title),
      graduationDate: getContentValue(["graduationDate", "date", "ngay"], printText.date),
      majorOrSchool: getContentValue(["majorOrSchool", "major", "school", "nganh", "truong"]),
      message: getContentValue(["message", "note", "loi", "thong"], printText.message),
    },
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
        position: {
          x: el.x,
          y: el.y,
          scale: el.width ? el.width / 60 : 1,
          rotate: 0,
        },
      })),
    characters: characterItems
      .map((el, index) => ({
        id: el.id,
        ...(el.characterId ? { catalogId: el.characterId } : {}),
        name: el.content || `NV ${index + 1}`,
        imageUrl: el.imageUrl ?? null,
        price: el.price ?? characterPrice,
        position: {
          x: el.x,
          y: el.y,
          scale: el.width ? el.width / 46 : 1,
          rotate: 0,
        },
      })),
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
      const imageUrl = customBackgroundUrl ?? selectedTemplate?.imageUrl ?? null;
      parts.push({
        ...(backgroundId ? { id: backgroundId } : {}),
        type: "background",
        name: selectedTemplate?.name ?? customBackgroundOriginalName ?? "Anh nen tuy chinh",
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
    <div className="space-y-6">
      {seconds > 0 && (
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 p-4 text-white shadow-md animate-fade-in">
          <div>
            <div className="flex items-center gap-1.5 text-sm font-black tracking-wide">
              <Zap className="h-4 w-4 fill-white" /> ƯU ĐÃI PHÚT CHÓT!
            </div>
            <div className="mt-1 text-xs font-medium text-white/90">
              Hoàn tất thiết kế ngay để nhận 1 Sticker quà tặng
            </div>
          </div>
          <div className="rounded-xl bg-black/20 px-3 py-2 font-mono text-xl font-black tracking-widest backdrop-blur-sm shadow-inner">
            {timerMins}:{timerSecs}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-background px-5 py-4">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
            Chi tiết thiết kế
          </h3>
          <span className="rounded-full bg-surface-hover px-2.5 py-1 text-xs font-bold text-text-secondary shadow-inner">
            {characterCount} NV
          </span>
        </div>

        <div className="divide-y divide-border">
          {frameObj && (
            <div className="flex items-start justify-between px-5 py-4 transition-colors hover:bg-surface-hover/50">
              <div>
                <p className="text-sm font-bold text-text-primary">
                  {frameObj.label}
                </p>
                {frameObj.colorName ? (
                  <p className="mt-0.5 text-xs font-medium text-text-muted">
                    Màu: {frameObj.colorName}
                  </p>
                ) : null}
              </div>
              <span className="text-sm font-bold text-text-primary">
                {formatPrice(frameObj.price)}
              </span>
            </div>
          )}

          {characterCount > 0 && (
            <div className="flex items-start justify-between px-5 py-4 transition-colors hover:bg-surface-hover/50">
              <div>
                <p className="text-sm font-bold text-text-primary">
                  Nhân vật LEGO
                </p>
                <p className="mt-0.5 text-xs font-medium text-text-muted">
                  {characterCount} × {formatPrice(characterPrice)}
                </p>
              </div>
              <span className="text-sm font-bold text-text-primary">
                {formatPrice(charactersTotalPrice)}
              </span>
            </div>
          )}

          {accessoryItems.map((el) => (
            <div
              key={el.id}
              className="flex items-start justify-between px-5 py-4 transition-colors hover:bg-surface-hover/50"
            >
              <div>
                <p className="text-sm font-bold text-text-primary">
                  {el.content}
                </p>
                <p className="mt-0.5 text-xs font-medium text-text-muted">
                  Số lượng: 1
                </p>
              </div>
              <span className="text-sm font-bold text-text-primary">
                {formatPrice(el.price || 0)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-dashed border-border bg-background px-5 py-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black uppercase text-text-secondary tracking-widest">
              Tổng cộng
            </span>
            <span className="text-2xl font-black text-[#ef9ab3] drop-shadow-sm">
              {formatPrice(totalPrice)}
            </span>
          </div>
          <p className="mt-2 text-right text-xs font-medium text-text-muted">
            Chưa bao gồm phí ship. Shop báo phí trước khi giao.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-sm">
        <span className="text-xl">💡</span>
        <div>
          <p className="mb-1 text-xs font-black text-blue-700 uppercase tracking-wider">
            Mẹo: Đặt sớm (Early Bird)
          </p>
          <p className="text-xs font-medium leading-relaxed text-blue-600/90">
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
            className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-relaxed text-amber-800 shadow-sm"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{checkoutBlockMessage}</span>
            </div>
            {missingRequiredContent ? (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="mt-3 inline-flex h-9 items-center justify-center rounded-xl border border-amber-300 bg-white px-3 text-xs font-black text-amber-900 transition-colors hover:bg-amber-100"
              >
                Điền nội dung
              </button>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!canCheckout}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#ef9ab3] px-4 py-4 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#e77f9f] hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none disabled:hover:translate-y-0"
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
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-border bg-surface px-4 py-3.5 text-sm font-bold text-text-primary shadow-sm transition-all hover:border-[#ef9ab3]/60 hover:bg-[#fff4f7] hover:text-[#d94f77] disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
          >
            <ShoppingCart className="h-4 w-4" /> {isEditMode ? "Cập nhật thiết kế" : "Thêm vào giỏ"}
          </button>
        </div>
      </div>
    </div>
  );
}
