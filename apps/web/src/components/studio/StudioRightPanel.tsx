"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useStudio, type StudioContentField } from "./StudioContext";
import { formatPrice } from "@/lib/formatters";
import {
  Search,
  ShoppingCart,
  Zap,
  UploadCloud,
  Check,
  ChevronLeft,
  ChevronRight,
  Save,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { UI_MODAL_IDS } from "@/constants";
import { useAuthStore } from "@/stores/authStore";
import { browserApiClient } from "@/lib/api/browser-client";
import type { JsonObject } from "@lego-shop/shared";

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

// ─── Freeship Progress Bar ─────────────────────────────────────────────────
function FreeshipBar({
  amount,
  progress,
}: {
  amount: number;
  progress: number;
}) {
  if (progress >= 100) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm animate-fade-in">
        <span className="text-lg">🎉</span> Bạn đã được Miễn phí vận chuyển!
      </div>
    );
  }
  return (
    <div className="space-y-2 rounded-xl border border-border bg-surface p-4 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary">
          Thêm{" "}
          <span className="font-bold text-text-primary">
            {formatPrice(amount)}
          </span>{" "}
          để Freeship
        </span>
        <span className="font-bold text-[#d94f77]">{progress}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-hover shadow-inner">
        <div
          className="h-full rounded-full bg-[#ef9ab3] transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function StudioRightPanel() {
  const {
    step,
    setStep,
    totalPrice,
    frameSize,
    frameColor,
    contentFields,
    contentValues,
    isLoadingData,
    dataError,
  } = useStudio();

  const validationMessage = useMemo(() => {
    if (isLoadingData) return "Đang tải dữ liệu thiết kế...";
    if (dataError) return dataError;
    if (step === 1 && (!frameSize || !frameColor))
      return "Vui lòng chọn kích thước và màu khung.";
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
    frameColor,
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

// ─── Step 1: Chọn khung ────────────────────────────────────────────────────
function Step1Frame() {
  const {
    frameSize,
    setFrameSize,
    frameColor,
    setFrameColor,
    frameSizes,
    frameColors,
    isLoadingData,
  } = useStudio();

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-surface-hover animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-xs font-bold tracking-widest text-text-muted uppercase font-body">
          Kích thước khung
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {frameSizes.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setFrameSize(s.id)}
              className={`group relative flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 transition-all duration-300 ${
                frameSize === s.id
                  ? "border-[#ef9ab3] bg-[#fff4f7] shadow-md"
                  : "border-border bg-surface hover:border-[#ef9ab3]/50 hover:bg-[#fff4f7]/50 hover:shadow-sm"
              }`}
              style={{
                paddingTop: s.popular ? 32 : 16,
                paddingBottom: 16,
                paddingLeft: 8,
                paddingRight: 8,
              }}
            >
              {s.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-950 shadow-md">
                  Phổ biến nhất
                </span>
              )}
              <span
                className={`text-sm font-bold transition-colors ${frameSize === s.id ? "text-[#d94f77]" : "text-text-primary"}`}
              >
                {s.label}
              </span>
              <span className="text-xs font-semibold text-text-muted">
                {formatPrice(s.price)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xs font-bold tracking-widest text-text-muted uppercase font-body">
          Màu sắc khung
        </h3>
        <div className="flex flex-wrap gap-3">
          {frameColors.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFrameColor(c.name)}
              className={`flex items-center gap-2.5 rounded-full border-2 px-4 py-2 text-sm transition-all duration-300 ${
                frameColor === c.name
                  ? "border-[#ef9ab3] bg-[#fff4f7] shadow-sm"
                  : "border-border bg-surface hover:border-[#ef9ab3]/50 hover:bg-[#fff4f7]/50"
              }`}
            >
              <span
                className="h-4 w-4 shrink-0 rounded-full border border-zinc-200 shadow-inner"
                style={{
                  backgroundColor: getFrameColorHex(c.name, c.colorHex),
                }}
              />
              <span
                className={`font-bold text-xs ${frameColor === c.name ? "text-[#d94f77]" : "text-text-secondary"}`}
              >
                {c.name}
              </span>
              {frameColor === c.name && (
                <Check className="h-3.5 w-3.5 text-[#d94f77]" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <p className="mb-4 flex items-center gap-2 text-xs font-black tracking-widest text-text-secondary uppercase">
          <span className="h-2 w-2 rounded-full bg-[#ef9ab3] animate-pulse" />
          Giá cơ bản bao gồm:
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {[
            { icon: "🖼️", label: "1 Khung tranh LEGO" },
            { icon: "🎨", label: "1 Nền thiết kế" },
            { icon: "👤", label: "1-2 Nhân vật" },
            { icon: "🎁", label: "Hộp quà tặng" },
            { icon: "👜", label: "Túi xách tay" },
            { icon: "💌", label: "Thiệp chúc mừng" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="text-base drop-shadow-sm">{item.icon}</span>
              <span className="text-xs font-medium text-text-secondary">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="rounded-xl border border-border bg-surface-hover px-4 py-3 text-xs leading-relaxed text-text-muted shadow-inner font-medium">
        * Đây là bản xem trước mô phỏng. Sau khi đặt hàng, Designer sẽ thiết kế
        lại bố cục & màu sắc đẹp nhất và gửi bạn duyệt trước khi in ấn.
      </p>
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
    templates,
    templateCategories,
    printText,
    setPrintText,
    contentFields,
    contentValues,
    setContentValue,
    clearContentValues,
    isLoadingData,
    freeshipAmount,
    freeshipProgress,
  } = useStudio();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const backgroundInputRef = useRef<HTMLInputElement | null>(null);

  const filteredTemplates = useMemo(() => {
    if (!activeCategoryId) return templates;
    return templates.filter((t) => t.categoryId === activeCategoryId);
  }, [templates, activeCategoryId]);
  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === activeTemplate) ?? null,
    [activeTemplate, templates],
  );

  const handleBackgroundUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCustomBackgroundUrl(reader.result);
        setActiveTemplate(null);
        clearContentValues();
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <FreeshipBar amount={freeshipAmount} progress={freeshipProgress} />

      <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-background">
          <h3 className="text-sm font-bold text-text-primary">CHỌN ẢNH NỀN</h3>
          <span className="rounded-full bg-surface-hover px-2.5 py-0.5 text-xs font-bold text-text-muted">
            {filteredTemplates.length + (customBackgroundUrl ? 1 : 0)} mẫu
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto px-5 py-4 scrollbar-hide">
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

        <div className="grid max-h-[280px] grid-cols-4 gap-3 overflow-y-auto px-5 pb-5 scrollbar-hide">
          {customBackgroundUrl && (
            <button
              type="button"
              onClick={() => {
                setActiveTemplate(null);
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

        <div className="border-t border-border bg-background p-4">
          <button
            type="button"
            onClick={() => backgroundInputRef.current?.click()}
            className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface py-3 text-xs font-bold text-text-secondary transition-all hover:border-[#ef9ab3] hover:bg-[#fff4f7] hover:text-[#d94f77]"
          >
            <UploadCloud className="h-4 w-4 transition-transform group-hover:-translate-y-1" />
            TẢI ẢNH NỀN CỦA BẠN LÊN
          </button>
          <input
            ref={backgroundInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) =>
              handleBackgroundUpload(event.target.files?.[0])
            }
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-primary">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
              2
            </div>
            NHẬP THÔNG TIN IN ẤN
          </h3>
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
    "w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-[#ef9ab3] focus:ring-2 focus:ring-[#ef9ab3]/20";

  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-600">
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
    accessories,
    accessoryCategories,
    addElement,
    addCharacter,
    removeLastCharacter,
    elements,
    removeElement,
    freeshipAmount,
    freeshipProgress,
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

  return (
    <div className="space-y-6">
      <FreeshipBar amount={freeshipAmount} progress={freeshipProgress} />

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-text-primary uppercase">
          Quản lý nhân vật
        </h3>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={addCharacter}
            className="flex items-center gap-2 rounded-xl bg-text-primary px-5 py-2.5 text-sm font-bold text-background shadow-md transition-all hover:-translate-y-0.5 hover:bg-text-secondary hover:shadow-lg active:translate-y-0"
          >
            <span>+</span> Thêm nhân vật
          </button>

          {characterCount > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-2 shadow-sm">
              <span className="text-sm font-black text-text-primary">
                {characterCount} NV
              </span>
              <div className="h-4 w-px bg-border" />
              <button
                type="button"
                onClick={removeLastCharacter}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-hover text-lg font-bold text-text-secondary transition-colors hover:bg-error/10 hover:text-error"
              >
                −
              </button>
            </div>
          )}
        </div>
        {characterCount > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-surface-hover px-3 py-2 text-xs font-medium text-text-secondary">
            <span>
              {characterCount} nhân vật × {formatPrice(characterPrice)}
            </span>
            <span className="font-bold text-text-primary">
              {formatPrice(characterCount * characterPrice)}
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
    freeshipAmount,
    frameSize,
    frameSizes,
    frameColor,
    characterCount,
    characterPrice,
    elements,
    printText,
    contentFields,
    contentValues,
    activeTemplate,
    customBackgroundUrl,
    templates,
  } = useStudio();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
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
  const accessoryItems = elements.filter(
    (e) => e.type === "accessory" && e.price && e.price > 0,
  );
  const selectedTemplate = templates.find((t) => t.id === activeTemplate);
  const previewUrl = customBackgroundUrl ?? selectedTemplate?.imageUrl ?? null;
  const missingRequiredContent = getMissingRequiredContentField(
    contentFields,
    contentValues,
  );
  const canCheckout = Boolean(
    frameSize && frameColor && !missingRequiredContent,
  );
  const accessorySnapshot = accessoryItems
    .filter((el) => typeof el.accessoryId === "string")
    .map((el) => ({
      id: el.accessoryId as string,
      name: el.content || "Accessory",
      price: el.price || 0,
    }));
  const charactersTotalPrice = characterCount * characterPrice;

  const buildCartItem = () => ({
    productId: null,
    productName: `Khung LEGO tùy chỉnh${printText.title ? ` - ${printText.title}` : ""}`,
    quantity: 1,
    unitPrice: totalPrice,
    frameSizeId: frameSize,
    frameSizeLabel: frameObj?.label ?? frameSize,
    frameColorName: frameColor,
    accessories: accessorySnapshot,
    templateId: activeTemplate,
    designData: {
      elements,
      printText,
      contentFields,
      contentValues,
      templateId: activeTemplate,
      templateName: selectedTemplate?.name,
      templateInstructions: selectedTemplate?.instructions,
      backgroundImageUrl: previewUrl,
      backgroundSource: customBackgroundUrl
        ? "upload"
        : (selectedTemplate?.source ?? "template"),
      characterCount,
      accessories: accessorySnapshot,
    },
    previewUrl,
  });

  const buildUserDesignData = (): JsonObject => ({
    elements: elements.map(
      (element): JsonObject => ({
        id: element.id,
        type: element.type,
        x: element.x,
        y: element.y,
        ...(element.content !== undefined ? { content: element.content } : {}),
        ...(element.imageUrl !== undefined
          ? { imageUrl: element.imageUrl }
          : {}),
        ...(element.fontSize !== undefined
          ? { fontSize: element.fontSize }
          : {}),
        ...(element.color !== undefined ? { color: element.color } : {}),
        ...(element.width !== undefined ? { width: element.width } : {}),
        ...(element.height !== undefined ? { height: element.height } : {}),
        ...(element.price !== undefined ? { price: element.price } : {}),
        ...(element.accessoryId !== undefined
          ? { accessoryId: element.accessoryId }
          : {}),
      }),
    ),
    printText: {
      title: printText.title,
      date: printText.date,
      message: printText.message,
    },
    contentFields: contentFields.map(
      (field): JsonObject => ({
        key: field.key,
        label: field.label,
        type: field.type,
        required: field.required,
        ...(field.placeholder ? { placeholder: field.placeholder } : {}),
        ...(field.helpText ? { helpText: field.helpText } : {}),
      }),
    ),
    contentValues,
    templateId: activeTemplate,
    backgroundImageUrl: previewUrl,
    backgroundSource: customBackgroundUrl
      ? "upload"
      : (selectedTemplate?.source ?? "template"),
    characterCount,
  });

  const handleAddToCart = () => {
    if (!canCheckout) return;
    addItem(buildCartItem());
    openCart();
    openModal(UI_MODAL_IDS.CART_DRAWER);
    window.dispatchEvent(new CustomEvent("legoshop:open-cart"));
  };
  const handleBuyNow = () => {
    if (!canCheckout) return;
    addItem(buildCartItem());
    router.push("/checkout");
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
                <p className="mt-0.5 text-xs font-medium text-text-muted">
                  Màu {frameColor}
                </p>
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
          {freeshipAmount > 0 && (
            <p className="mt-2 text-right text-xs font-medium text-text-muted">
              Thêm{" "}
              <span className="font-bold text-text-primary">
                {formatPrice(freeshipAmount)}
              </span>{" "}
              để được <strong className="text-emerald-600">FREESHIP</strong>
            </p>
          )}
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

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!canCheckout}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-border bg-surface px-4 py-3.5 text-sm font-bold text-text-primary shadow-sm transition-all hover:border-[#ef9ab3]/60 hover:bg-[#fff4f7] hover:text-[#d94f77] disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
          >
            <ShoppingCart className="h-4 w-4" /> Thêm vào giỏ
          </button>

          <button
            type="button"
            onClick={async () => {
              const user = useAuthStore.getState().user;
              if (!user) {
                alert("Vui lòng đăng nhập để lưu thiết kế!");
                router.push("/login");
                return;
              }
              try {
                await browserApiClient.userDesigns.createUserDesign({
                  name: `Thiết kế ${new Date().toLocaleDateString()}`,
                  designData: buildUserDesignData(),
                });
                alert("Lưu thiết kế thành công!");
              } catch (err) {
                alert(
                  err instanceof Error ? err.message : "Lỗi khi lưu thiết kế",
                );
              }
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-surface-hover px-4 py-3.5 text-sm font-bold text-text-secondary shadow-sm transition-all hover:bg-border hover:text-text-primary"
          >
            <Save className="h-4 w-4" /> Lưu bản nháp
          </button>
        </div>
      </div>
    </div>
  );
}
