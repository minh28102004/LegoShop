"use client";

import Image from "next/image";
import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { formatCurrency as formatPrice } from "@lego-shop/shared";
import {
  useStudio,
  type ApiCharacterPart,
  type ApiCharacterPreset,
  type ApiFrameSize,
  type StudioCharacterInput,
  type StudioContentField,
  type StudioElement,
} from "./StudioContext";
import {
  Search,
  Zap,
  UploadCloud,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  CalendarDays,
  PanelRightClose,
} from "lucide-react";
import { uploadCustomerImage } from "@/lib/api/uploads";
import { Modal } from "@/components/ui/Modal";
import { useStudioI18n } from "../hooks/useStudioI18n";
import { StudioReviewPanel } from "./StudioReviewPanel";
import { StudioSidebar } from "./StudioSidebar";
import { StudioSearchableMultiSelect } from "./StudioSearchableMultiSelect";
import {
  DEFAULT_PANEL_TAB_BY_STEP,
  DEFAULT_TOOL_BY_STEP,
  STUDIO_STEPS,
  STUDIO_STEP_INDEX,
  type StudioStep,
} from "../state/studio.types";

const getFrameColorHex = (name: string, apiHex?: string | null): string => {
  if (apiHex && apiHex.startsWith("#")) return apiHex;
  const lower = name.trim().toLowerCase();
  if (lower === "trắng" || lower === "white") return "#ffffff";
  if (lower === "đen" || lower === "black") return "#1f1f21";
  if (lower === "gỗ" || lower === "wood") return "#d7a15c";
  return "#d1d5db";
};

export function StudioRightPanel() {
  const {
    activeStep,
    setActiveStep,
    totalPrice,
    isLoadingData,
    dataError,
    validateStep,
    activeTool,
    setActiveTool,
    activePanelTab,
    setActivePanelTab,
    setIsContextPanelCollapsed,
  } = useStudio();
  const { text } = useStudioI18n();
  const currentStepIndex = STUDIO_STEP_INDEX[activeStep];

  const validationMessage = useMemo(() => {
    if (isLoadingData) return text.common.loading;
    if (dataError) return dataError;
    return validateStep(activeStep).summaryErrors[0] ?? null;
  }, [activeStep, dataError, isLoadingData, text.common.loading, validateStep]);
  const canContinue = !validationMessage;

  const activateStep = (nextStep: StudioStep) => {
    setActiveStep(nextStep);
    setActiveTool(DEFAULT_TOOL_BY_STEP[nextStep]);
    setActivePanelTab(DEFAULT_PANEL_TAB_BY_STEP[nextStep]);
    setIsContextPanelCollapsed(false);
  };

  const handleNext = () => {
    if (!canContinue) return;
    const nextStep = STUDIO_STEPS[currentStepIndex + 1];
    if (nextStep) activateStep(nextStep);
  };
  const handleBack = () => {
    const previousStep = STUDIO_STEPS[currentStepIndex - 1];
    if (previousStep) activateStep(previousStep);
  };

  const panelTitle = text.workflow[activeStep];

  const contextualContent = (() => {
    if (activeStep === "review" || activePanelTab === "review") {
      return <StudioReviewPanel />;
    }
    if (
      activeStep === "characters" ||
      activePanelTab === "characters" ||
      activePanelTab === "accessories"
    ) {
      return <Step3Characters />;
    }
    if (activeStep === "frame" || activePanelTab === "frame") {
      return <Step1Frame />;
    }
    if (
      activeStep === "background" ||
      activePanelTab === "templates" ||
      activePanelTab === "backgrounds"
    ) {
      return (
        <div className="space-y-5">
          <Step2Content mode="background" />
          <StudioSidebar embedded />
        </div>
      );
    }
    if (
      activeStep === "content" ||
      activePanelTab === "information" ||
      activePanelTab === "uploads" ||
      activePanelTab === "add-text" ||
      activePanelTab === "formatting"
    ) {
      return (
        <div className="space-y-5">
          <Step2Content mode="content" />
          <StudioSidebar embedded />
        </div>
      );
    }
    return <StudioSidebar embedded />;
  })();

  return (
    <div className="z-20 flex h-full min-h-0 w-full shrink-0 flex-col bg-white">
      <div className="relative flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[#e5edf5] px-4 pt-2 lg:h-14 lg:pt-0">
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-slate-200 lg:hidden"
        />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2f91d0]">
            Studio
          </p>
          <h2 className="truncate text-base font-bold text-slate-950">
            {panelTitle}
          </h2>
        </div>
        <button
          type="button"
          data-studio-panel-close
          onClick={() => setIsContextPanelCollapsed(true)}
          aria-label={text.common.closePanel}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 outline-none transition-colors duration-200 hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-[#9ed0ef]/60"
        >
          <X className="h-[18px] w-[18px] lg:hidden" />
          <PanelRightClose className="hidden h-[18px] w-[18px] lg:block" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] px-4 py-4">
        <div
          key={`${activeStep}-${activeTool}-${activePanelTab}`}
          className="animate-fade-in"
        >
          {contextualContent}
        </div>
      </div>

      {activeStep !== "review" ? (
      <div className="shrink-0 border-t border-[#dbe7f1] bg-white/96 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur-md lg:pb-4">
        {validationMessage && (
          <div className="mb-3 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-3.5 py-3 text-xs font-semibold leading-relaxed text-amber-800">
            {validationMessage}
          </div>
        )}
        <div className="mb-3 flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {text.panels.estimatedPrice}
          </span>
          <span className="text-xl font-bold text-[#2f91d0]">
            {formatPrice(totalPrice)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {currentStepIndex > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex h-11 min-w-[108px] items-center justify-center gap-1.5 rounded-2xl border border-[#e4edf5] bg-white px-4 text-sm font-semibold text-slate-600 outline-none transition-colors duration-200 hover:border-[#c4dbed] hover:bg-[#f8fbff] hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-[#9ed0ef]/60"
            >
              <ChevronLeft className="h-4 w-4" /> {text.common.back}
            </button>
          )}

          {currentStepIndex < STUDIO_STEPS.length - 1 && (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canContinue}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#2f91d0] px-5 text-sm font-bold text-white outline-none transition-colors duration-200 hover:bg-[#257fb7] active:bg-[#1f6d9f] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 focus-visible:ring-2 focus-visible:ring-[#80c4e9]/70"
            >
              {text.common.next} <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      ) : null}
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
  const { text } = useStudioI18n();

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
        {text.panels.noFrame}
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-[#e4edf5] bg-white p-5">
      <h3 className="mb-4 text-xs font-semibold tracking-wide text-slate-950 uppercase">
        {text.panels.selectSize}
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
                  {text.panels.popular}
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
        {text.panels.frameColor}
      </p>
      <div className="flex flex-wrap gap-2">
        {(selectedFrameGroup?.variants ?? []).map((variant) => {
          const active = variant.id === frameSize;
          const colorName = variant.colorName ?? text.panels.frameColorFallback;

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
function Step2Content({
  mode = "background",
}: {
  mode?: "background" | "content";
}) {
  const {
    activeTemplate,
    setActiveTemplate,
    customBackgroundUrl,
    setCustomBackgroundUrl,
    setCustomBackgroundOriginalName,
    templates,
    templateCategories,
    contentFields,
    contentValues,
    setContentValue,
    clearContentValues,
    isBackgroundsLoading,
    backgroundsError,
  } = useStudio();
  const { text } = useStudioI18n();
  const [activeCategoryIds, setActiveCategoryIds] = useState<string[]>([]);
  const backgroundInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const effectiveCategoryIds = useMemo(
    () =>
      activeCategoryIds.filter((categoryId) =>
        templateCategories.some((category) => category.id === categoryId),
      ),
    [activeCategoryIds, templateCategories],
  );

  const filteredTemplates = useMemo(() => {
    if (effectiveCategoryIds.length === 0) return templates;
    return templates.filter(
      (template) =>
        template.categoryId && effectiveCategoryIds.includes(template.categoryId),
    );
  }, [templates, effectiveCategoryIds]);
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
        error instanceof Error ? error.message : text.canvas.uploadError,
      );
    } finally {
      setIsUploadingBackground(false);
    }
  };

  return (
    <div className="space-y-5">
      {mode === "background" ? (
      <div className="rounded-[24px] border border-[#e4edf5] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-semibold tracking-wide text-slate-950 uppercase">
            {text.panels.chooseBackground}
          </h3>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
            {text.panels.backgroundCount(
              filteredTemplates.length + (customBackgroundUrl ? 1 : 0),
            )}
          </span>
        </div>

        {templateCategories.length > 0 ? (
          <div className="mb-4">
            <StudioSearchableMultiSelect
              label={text.common.all}
              options={templateCategories.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
              value={effectiveCategoryIds}
              onChange={setActiveCategoryIds}
              searchPlaceholder={text.sidebar.searchTemplates}
              emptyLabel={text.sidebar.noTemplateMatches}
              clearLabel={text.panels.clearAll}
            />
          </div>
        ) : null}

        {backgroundsError ? (
          <div
            role="status"
            className="mb-4 flex items-start gap-2 rounded-[16px] border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-semibold leading-relaxed text-amber-800"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{backgroundsError}</span>
          </div>
        ) : null}

        <div className="grid max-h-[350px] grid-cols-4 gap-3 overflow-y-auto pr-1">
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
              <Image
                src={customBackgroundUrl}
                alt={text.panels.yourBackground}
                fill
                unoptimized
                sizes="96px"
                className="object-contain bg-white p-2 transition-transform duration-500"
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
                  {text.panels.yourBackground}
                </span>
              </div>
            </button>
          )}
          {isBackgroundsLoading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-[16px] bg-[#eef3f8] animate-pulse"
              />
            ))
          ) : filteredTemplates.length === 0 && !customBackgroundUrl ? (
            <div className="col-span-4 py-10 text-center text-sm font-medium text-slate-500">
              {text.panels.noBackgrounds}
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
                {tpl.thumbnailUrl || tpl.imageUrl ? (
                  <Image
                    src={tpl.thumbnailUrl ?? tpl.imageUrl ?? ""}
                    alt={tpl.name}
                    fill
                    unoptimized
                    sizes="96px"
                    className="object-contain bg-white p-2 transition-transform duration-500"
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
              ? text.panels.uploadingBackground.toUpperCase()
              : text.panels.uploadBackground.toUpperCase()}
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
      ) : null}

      {mode === "content" ? (
      <div className="rounded-[24px] border border-[#e4edf5] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] p-5">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={clearContentValues}
            className="rounded-full border-0 bg-transparent px-3 py-1.5 text-xs font-semibold text-slate-500 appearance-none outline-none transition-colors duration-200 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:outline-none"
          >
            {text.panels.clearAll.toUpperCase()}
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
        </div>
      </div>
      ) : null}
    </div>
  );
}

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
  const { locale, text } = useStudioI18n();
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

  const days = getCalendarDays(viewDate);
  const today = new Date();
  const weekdays =
    locale === "vi"
      ? ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const monthLabel = new Intl.DateTimeFormat(
    locale === "vi" ? "vi-VN" : "en-US",
    { month: "long", year: "numeric" },
  ).format(viewDate);

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

  const toggleCalendar = () => {
    const nextOpen = !open;
    if (nextOpen && selectedDate) setViewDate(selectedDate);
    setOpen(nextOpen);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggleCalendar}
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
              aria-label={text.common.previousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <p className="text-sm font-bold text-slate-900">{monthLabel}</p>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-[#e4edf5] bg-white text-slate-500 appearance-none outline-none transition-all duration-200 hover:bg-[#f8fbff] hover:text-[#2f91d0] focus:outline-none focus-visible:outline-none"
              aria-label={text.common.nextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {weekdays.map((weekday) => (
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
              {text.common.clearDate}
            </button>
            <button
              type="button"
              onClick={() => selectDate(new Date())}
              className="rounded-full border-0 bg-[#eef7ff] px-3 py-1.5 text-xs font-bold text-[#2f91d0] appearance-none outline-none transition-colors duration-200 hover:bg-[#dff0fb] focus:outline-none focus-visible:outline-none"
            >
              {text.common.today}
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
  const { text } = useStudioI18n();
  const inputClass =
    "h-11 w-full rounded-2xl border border-[#dbe7f1] bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-[#b9d8ed] focus:border-[#2f91d0] focus:bg-white focus:ring-4 focus:ring-[#d9eefb]/70 focus-visible:outline-none";

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
          className={`${inputClass} h-auto min-h-24 max-h-40 resize-y overflow-y-auto py-3`}
        />
      ) : field.type === "image" ? (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-[#d3e3f0] bg-[#fbfdff] px-4 py-5 text-center text-sm font-semibold text-slate-600 appearance-none outline-none transition-all duration-200 hover:border-[#aed2eb] hover:bg-white hover:text-[#2f91d0]">
          <UploadCloud className="h-5 w-5" />
          <span>{value || field.placeholder || text.common.chooseUpload}</span>
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
const CHARACTER_ACCESSORY_PAGE_SIZE = 24;

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
    isAccessoriesLoading,
    accessoriesError,
    isAccessoryCategoriesLoading,
    accessoryCategoriesError,
  } = useStudio();
  const { text } = useStudioI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeAccessoryCategoryIds, setActiveAccessoryCategoryIds] = useState<
    string[]
  >([]);
  const [accessoryPagination, setAccessoryPagination] = useState({
    key: "",
    count: CHARACTER_ACCESSORY_PAGE_SIZE,
  });
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(
    null,
  );
  const [pendingCharacterRemoval, setPendingCharacterRemoval] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const filteredAccessories = useMemo(() => {
    let list = accessories;
    if (activeAccessoryCategoryIds.length > 0) {
      list = list.filter(
        (accessory) =>
          accessory.categoryId &&
          activeAccessoryCategoryIds.includes(accessory.categoryId),
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q));
    }
    return list;
  }, [accessories, activeAccessoryCategoryIds, searchQuery]);

  const accessoryPaginationKey = `${searchQuery.trim().toLowerCase()}:${activeAccessoryCategoryIds.join(",")}`;
  const visibleAccessoryCount =
    accessoryPagination.key === accessoryPaginationKey
      ? accessoryPagination.count
      : CHARACTER_ACCESSORY_PAGE_SIZE;
  const visibleAccessories = useMemo(
    () => filteredAccessories.slice(0, visibleAccessoryCount),
    [filteredAccessories, visibleAccessoryCount],
  );

  const selectedAccessoryElements = useMemo(
    () =>
      elements.filter(
        (element) => element.type === "accessory" && element.accessoryId,
      ),
    [elements],
  );
  const addedAccessoryIds = new Set(
    selectedAccessoryElements
      .map((element) => element.accessoryId)
      .filter((id): id is string => Boolean(id)),
  );
  const selectedAccessoriesTotal = selectedAccessoryElements.reduce(
    (total, element) => total + (element.price ?? 0),
    0,
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
    setPendingCharacterRemoval({ id, name });
  };

  const confirmCharacterRemoval = () => {
    if (!pendingCharacterRemoval) return;

    removeElement(pendingCharacterRemoval.id);
    setPendingCharacterRemoval(null);
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
        {text.panels.shippingBanner}
      </div>

      <div className="rounded-[24px] border border-[#e4edf5] bg-white p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xs font-semibold tracking-wide text-slate-950 uppercase">
            {text.panels.manageCharacters}
          </h3>
          <button
            type="button"
            onClick={openCreateBuilder}
            title={text.panels.randomCharacterTitle}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-[#b9d8ed] bg-[#f4faff] px-3 text-xs font-bold text-[#2f91d0] appearance-none outline-none transition-all duration-200 hover:border-[#2f91d0] hover:bg-[#2f91d0] hover:text-white focus:outline-none focus-visible:outline-none"
          >
            <Zap className="h-3.5 w-3.5" /> {text.panels.randomCharacter}
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
                  title={`${text.common.edit} ${label}`}
                >
                  {label}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveCharacter(character.id, label)}
                  className="ml-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-red-100 text-red-500 opacity-70 appearance-none outline-none transition-colors duration-200 hover:bg-red-500 hover:text-white hover:opacity-100 focus:outline-none focus-visible:outline-none"
                  aria-label={`${text.common.remove} ${label}`}
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
            <span>{text.panels.addShort}</span>
            <span className="rounded-full bg-white/20 px-2 py-1 text-[11px] font-bold leading-none text-white">
              {formatPrice(characterPrice)}
            </span>
          </button>
        </div>

        {characterElements.length === 0 && (
          <p className="mt-3 text-xs font-medium text-slate-500">
            {text.panels.noCharactersHint}
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
                        (+{formatPrice(partFee)} {text.panels.partFee})
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
            <div className="mt-2 flex items-center justify-between border-t border-[#e4edf5] pt-2 text-xs">
              <span className="font-bold text-slate-950">
                {text.panels.characterTotal}
              </span>
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
            {text.panels.accessoriesAndCharms}
          </h3>

          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={text.panels.searchAccessories}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-2xl border border-[#dbe7f1] bg-white pl-10 pr-4 text-sm font-medium text-slate-900 appearance-none outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-[#b9d8ed] focus:border-[#2f91d0] focus:bg-white focus:ring-4 focus:ring-[#d9eefb]/70 focus-visible:outline-none"
            />
          </div>

          {isAccessoryCategoriesLoading ? (
            <div
              className="h-11 animate-pulse rounded-2xl bg-slate-100"
              aria-hidden="true"
            />
          ) : accessoryCategories.length > 0 ? (
            <StudioSearchableMultiSelect
              label={text.common.all}
              options={accessoryCategories.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
              value={activeAccessoryCategoryIds}
              onChange={setActiveAccessoryCategoryIds}
              searchPlaceholder={text.panels.searchAccessories}
              emptyLabel={text.panels.noAccessoryMatches}
              clearLabel={text.common.remove}
            />
          ) : null}

          {accessoryCategoriesError ? (
            <p className="mt-3 flex items-start gap-2 text-xs font-semibold leading-relaxed text-amber-700">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{accessoryCategoriesError}</span>
            </p>
          ) : null}
        </div>

        <div className="grid max-h-[380px] grid-cols-4 gap-3 overflow-y-auto p-5">
          {isAccessoriesLoading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-[16px] bg-[#eef3f8]"
              />
            ))
          ) : accessoriesError ? (
            <div className="col-span-4 flex items-start gap-2 rounded-[16px] border border-rose-200 bg-rose-50 px-3 py-3 text-xs font-semibold leading-relaxed text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{accessoriesError}</span>
            </div>
          ) : filteredAccessories.length === 0 ? (
            <div className="col-span-4 py-10 text-center text-sm font-medium text-slate-500">
              {accessories.length === 0
                ? text.panels.noAccessoriesAvailable
                : text.panels.noAccessoryMatches}
            </div>
          ) : (
            visibleAccessories.map((acc) => {
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
                    <Image
                      src={acc.imageUrl || acc.iconUrl || ""}
                      alt={acc.name}
                      width={40}
                      height={40}
                      unoptimized
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

          {!isAccessoriesLoading &&
          !accessoriesError &&
          visibleAccessories.length < filteredAccessories.length ? (
            <button
              type="button"
              onClick={() =>
                setAccessoryPagination({
                  key: accessoryPaginationKey,
                  count: Math.min(
                    visibleAccessoryCount + CHARACTER_ACCESSORY_PAGE_SIZE,
                    filteredAccessories.length,
                  ),
                })
              }
              className="col-span-4 h-10 rounded-xl border border-[#dbe7f1] bg-white text-xs font-semibold text-[#227eb8] transition-colors duration-200 hover:border-[#b9d8ed] hover:bg-[#f8fbff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80c4e9]/70"
            >
              {text.sidebar.loadMore(
                visibleAccessories.length,
                filteredAccessories.length,
              )}
            </button>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#e4edf5] bg-[#fbfdff] px-5 py-3 text-xs">
          <span className="font-semibold text-slate-600">
            {text.panels.selectedCharms(selectedAccessoryElements.length)}
          </span>
          <span className="font-bold text-[#2f91d0]">
            {formatPrice(selectedAccessoriesTotal)}
          </span>
        </div>
      </div>

      <CharacterBuilderModal
        key={`${builderOpen ? "open" : "closed"}:${editingCharacter?.id ?? "new"}:${characterElements.length}`}
        open={builderOpen}
        editingCharacter={editingCharacter}
        characterParts={characterParts}
        characterPresets={characterPresets}
        characterPrice={characterPrice}
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

      <Modal
        isOpen={pendingCharacterRemoval !== null}
        onClose={() => setPendingCharacterRemoval(null)}
        title={text.panels.removeCharacterTitle}
        size="sm"
        contentClassName="p-5 sm:p-6"
        className="max-w-md rounded-[24px] border border-[#e4edf5] bg-white shadow-sm"
      >
        <p className="text-sm font-medium leading-6 text-slate-600">
          {pendingCharacterRemoval
            ? text.panels.removeCharacter(pendingCharacterRemoval.name)
            : ""}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setPendingCharacterRemoval(null)}
            className="h-10 rounded-xl border border-[#dbe7f1] bg-white px-4 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-[#b9d8ed] hover:bg-[#f8fbff]"
          >
            {text.common.cancel}
          </button>
          <button
            type="button"
            onClick={confirmCharacterRemoval}
            className="h-10 rounded-xl border border-rose-500 bg-rose-500 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:border-rose-600 hover:bg-rose-600"
          >
            {text.common.remove}
          </button>
        </div>
      </Modal>
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
  required?: boolean;
}> = [
  { type: "PRESET" },
  { type: "FACE", required: true },
  { type: "HAIR", required: true },
  { type: "TORSO", required: true },
  { type: "LEGS", required: true },
  { type: "HAT" },
  { type: "ACCESSORY" },
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

const FALLBACK_PRESET_CONFIGS: Omit<
  CharacterPresetConfig,
  "name" | "description"
>[] = [
  {
    id: "graduation-male",
    hairHint: "nam",
    hatHint: "tốt nghiệp",
  },
  {
    id: "graduation-female",
    hairHint: "nữ",
    hatHint: "tốt nghiệp",
  },
  {
    id: "couple-red",
    torsoHint: "đỏ",
    legsHint: "đỏ",
  },
  {
    id: "couple-black",
    torsoHint: "đen",
    legsHint: "đen",
  },
  {
    id: "casual-male",
    hairHint: "nam",
  },
  {
    id: "casual-female",
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
  { key: "đen", labelVi: "Đen", labelEn: "Black", hex: "#1f1f21" },
  { key: "trắng", labelVi: "Trắng", labelEn: "White", hex: "#e5e7eb" },
  { key: "đỏ", labelVi: "Đỏ", labelEn: "Red", hex: "#ef4444" },
  { key: "xanh", labelVi: "Xanh", labelEn: "Blue", hex: "#3b82f6" },
  { key: "vàng", labelVi: "Vàng", labelEn: "Yellow", hex: "#facc15" },
  { key: "hồng", labelVi: "Hồng", labelEn: "Pink", hex: "#f472b6" },
  { key: "xám", labelVi: "Xám", labelEn: "Gray", hex: "#9ca3af" },
  { key: "nâu", labelVi: "Nâu", labelEn: "Brown", hex: "#92400e" },
  { key: "tím", labelVi: "Tím", labelEn: "Purple", hex: "#a855f7" },
  { key: "cam", labelVi: "Cam", labelEn: "Orange", hex: "#f97316" },
  { key: "xanh lá", labelVi: "Xanh lá", labelEn: "Green", hex: "#22c55e" },
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
  characterPrice,
  characterIndex,
  onClose,
  onSave,
}: {
  open: boolean;
  editingCharacter: StudioElement | null;
  characterParts: ApiCharacterPart[];
  characterPresets: ApiCharacterPreset[];
  characterPrice: number;
  characterIndex: number;
  onClose: () => void;
  onSave: (input: StudioCharacterInput) => void;
}) {
  const { locale, text } = useStudioI18n();
  const [activeTab, setActiveTab] = useState<CharacterPartTab>("PRESET");
  const [selection, setSelection] = useState<CharacterBuilderSelection>(() =>
    getCharacterBuilderInitialSelection(editingCharacter, characterIndex),
  );
  const [error, setError] = useState<string | null>(null);
  const [colorFilter, setColorFilter] = useState<string | null>(null);

  const characterPartLabels: Record<CharacterPartTab, string> = {
    PRESET: text.panels.presets,
    FACE: text.panels.face,
    HAIR: text.panels.hair,
    TORSO: text.panels.torso,
    LEGS: text.panels.legs,
    HAT: text.panels.hat,
    ACCESSORY: text.panels.characterAccessories,
  };

  const changeActiveTab = (tab: CharacterPartTab) => {
    setActiveTab(tab);
    setColorFilter(null);
  };

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
      : FALLBACK_PRESET_CONFIGS.map((preset, index) => ({
          ...preset,
          name: text.panels.fallbackPresets[index]?.[0] ?? preset.id,
          description: text.panels.fallbackPresets[index]?.[1] ?? "",
        }));

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
    changeActiveTab("FACE");
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
        !tab.required ||
        tab.type === "PRESET" ||
        tab.type === "ACCESSORY" ||
        tab.type === "HAT"
      )
        continue;
      if (!selection[tab.type]) {
        setError(text.panels.requiredPart(characterPartLabels[tab.type]));
        changeActiveTab(tab.type);
        return;
      }
    }

    if (!selectedFace || !selectedHair || !selectedTorso || !selectedLegs) {
      setError(text.panels.requiredCharacterParts);
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

  const activeParts = useMemo(
    () => partsByType.get(activeTab) ?? [],
    [activeTab, partsByType],
  );

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
        role="dialog"
        aria-modal="true"
        aria-labelledby="studio-character-builder-title"
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
            <h3
              id="studio-character-builder-title"
              className="truncate text-xl font-extrabold text-white sm:text-2xl"
            >
              {editingCharacter
                ? text.panels.editCharacter
                : text.panels.createCharacter}
            </h3>
            <p className="mt-1 text-sm font-semibold text-white/95">
              {editingCharacter
                ? text.panels.builderSubtitleEdit
                : text.panels.builderSubtitleCreate}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={randomize}
              title={text.panels.randomCharacterTitle}
              className="flex items-center gap-1.5 rounded-full border-0 bg-white/15 px-3 py-2 text-xs font-bold text-white appearance-none outline-none transition-all duration-200 hover:bg-white/25 focus:outline-none focus-visible:outline-none"
            >
              <Zap className="h-3.5 w-3.5" /> {text.panels.randomCharacter}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-0 bg-white/15 text-white appearance-none outline-none transition-all duration-200 hover:bg-white hover:text-slate-900 focus:outline-none focus-visible:outline-none"
              aria-label={text.common.close}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 overflow-hidden bg-[#f8fafc] md:grid-cols-[340px_minmax(0,1fr)]">
          <div className="flex min-h-0 flex-col gap-5 border-b border-[#e4edf5] bg-[#f8fafc] p-5 sm:p-6 md:border-b-0 md:border-r">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                {text.panels.characterName}
              </span>
              <input
                value={selection.name}
                onChange={(event) =>
                  setSelection((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-2xl border border-[#dbe7f1] bg-white px-3 text-sm font-semibold text-slate-950 appearance-none outline-none transition-all duration-200 hover:border-[#b9d8ed] focus:border-[#2f91d0] focus:bg-white focus:ring-4 focus:ring-[#d9eefb]/70 focus-visible:outline-none"
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
                    onClick={() => changeActiveTab(tab.type)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold appearance-none outline-none transition-colors duration-200 focus:outline-none focus-visible:outline-none ${
                      activeTab === tab.type
                        ? "border-[#b9d8ed] bg-[#f4faff] text-[#2f91d0]"
                        : selected
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-[#e4edf5] bg-white text-slate-600 hover:border-[#9ed0ef]"
                    }`}
                  >
                    {characterPartLabels[tab.type]}
                  </button>
                );
              })}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-white p-5 sm:p-6">
              {activeTab === "PRESET" ? (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-slate-500">
                    {text.panels.presetHelp}
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
                          {text.panels.applyPreset}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : filteredParts.length === 0 && activeParts.length === 0 ? (
                <div className="grid min-h-[300px] place-items-center rounded-[18px] border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      {text.panels.noPartsTitle}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {text.panels.noPartsAdminHint}
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
                        {text.common.all}
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
                          title={
                            locale === "vi" ? color.labelVi : color.labelEn
                          }
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
                          {locale === "vi" ? color.labelVi : color.labelEn}
                        </button>
                      ))}
                    </div>
                  )}
                  {filteredParts.length === 0 ? (
                    <div className="flex min-h-[120px] items-center justify-center rounded-[16px] border border-dashed border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                      {text.panels.noPartsForColor}
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
                            {text.panels.noSelection}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {text.common.free}
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
                                <Image
                                  src={part.imageUrl}
                                  alt={part.name}
                                  fill
                                  unoptimized
                                  sizes="120px"
                                  className="object-contain transition-transform"
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
                                  : text.common.free}
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
              {text.panels.characterBaseLine}: {formatPrice(characterPrice)}
              {totalPartFee > 0 &&
                ` + ${text.panels.partFee}: +${formatPrice(totalPartFee)}`}
            </span>
            <span className="font-bold text-[#2f91d0]">
              {formatPrice(characterPrice + totalPartFee)}
            </span>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-[18px] border border-[#e4edf5] bg-white px-5 text-sm font-bold text-slate-600 appearance-none outline-none transition-colors duration-200 hover:bg-[#fbfdff] focus:outline-none focus-visible:outline-none"
            >
              {text.common.cancel}
            </button>
            <button
              type="button"
              data-flat-button="true"
              onClick={save}
              className="h-12 rounded-[18px] border-0 bg-[#2f91d0] px-6 text-sm font-bold text-white appearance-none outline-none transition-colors duration-200 hover:bg-[#257fb7] focus:outline-none focus-visible:outline-none"
            >
              {text.panels.saveCharacter}
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
            <Image
              key={`${part.type}-${part.id}`}
              src={getCharacterPartImage(part)}
              alt=""
              fill
              unoptimized
              sizes="176px"
              className="object-contain"
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
