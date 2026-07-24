"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertCircle,
  Check,
  LayoutTemplate,
  Plus,
  Puzzle,
  Search,
  Trash2,
  Type,
  UploadCloud,
  UserRound,
} from "lucide-react";
import { formatCurrency as formatPrice } from "@lego-shop/shared";

import { DECORATIVE_ICON_PATHS } from "@/config/icons";
import { uploadCustomerImage } from "@/lib/api/uploads";
import { useStudioI18n } from "../hooks/useStudioI18n";
import { useStudio, type StudioElement } from "./StudioContext";
import { StudioSearchableMultiSelect } from "./StudioSearchableMultiSelect";

type StudioTab = "templates" | "uploads" | "text" | "assets" | "layers";

const QUICK_STICKERS = [
  {
    id: "sparkles",
    imageUrl: DECORATIVE_ICON_PATHS.sparkles,
  },
  {
    id: "gift",
    imageUrl: DECORATIVE_ICON_PATHS.wrappedGift,
  },
  {
    id: "camera",
    imageUrl: DECORATIVE_ICON_PATHS.camera,
  },
  {
    id: "palette",
    imageUrl: DECORATIVE_ICON_PATHS.artistPalette,
  },
  {
    id: "graduation",
    imageUrl: DECORATIVE_ICON_PATHS.graduationCap,
  },
  {
    id: "package",
    imageUrl: DECORATIVE_ICON_PATHS.package,
  },
] as const;

function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-[20px] border border-dashed border-[#dbe7f1] bg-[linear-gradient(180deg,#fbfdff_0%,#f7fbfe_100%)] px-4 py-8 text-center">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description ? (
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
          {description}
        </p>
      ) : null}
    </div>
  );
}

type StudioMediaThumbnailProps = {
  alt: string;
  fallback: ReactNode;
  imageClassName: string;
  priority?: boolean;
  src?: string | null | undefined;
};

function StudioMediaThumbnail(props: StudioMediaThumbnailProps) {
  return (
    <StudioMediaThumbnailContent key={props.src || "empty-media"} {...props} />
  );
}

function StudioMediaThumbnailContent({
  alt,
  fallback,
  imageClassName,
  priority = false,
  src,
}: StudioMediaThumbnailProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src || failed) {
    return (
      <div className="grid h-full w-full place-items-center">{fallback}</div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {!loaded ? (
        <span className="absolute inset-2 animate-pulse rounded-xl bg-slate-200/65" />
      ) : null}
      <Image
        key={src}
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 767px) 42vw, 148px"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setLoaded(false);
          setFailed(true);
        }}
        className={`${imageClassName} ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

function TemplateCard({
  active,
  imageUrl,
  name,
  onClick,
  priority = false,
}: {
  active: boolean;
  imageUrl?: string | null;
  name: string;
  onClick: () => void;
  priority?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex h-[144px] flex-col rounded-[20px] border bg-white text-left transition-all duration-200 ease-out",
        active
          ? "border-[#2f91d0] bg-[#f4faff] ring-1 ring-inset ring-[#bcdff0]"
          : "border-slate-200/80 hover:-translate-y-0.5 hover:border-[#bcdff0] hover:bg-[#fbfdff] hover:shadow-sm",
      ].join(" ")}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-t-[19px] bg-[#f8fbff]">
        <StudioMediaThumbnail
          src={imageUrl}
          alt={name}
          priority={priority}
          imageClassName="object-contain p-2.5 transition-[opacity,transform] duration-300 ease-out group-hover:scale-[1.03]"
          fallback={
            <div className="grid place-items-center gap-1.5 px-3 text-center">
              <LayoutTemplate className="h-6 w-6 text-slate-300" />
              <span className="max-w-[100px] text-[11px] font-semibold leading-4 text-slate-400">
                {name}
              </span>
            </div>
          }
        />

        {active ? (
          <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-[#2f91d0] text-white shadow-sm">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-[#edf3f8] px-2.5 py-2">
        <p className="truncate text-xs font-bold text-slate-800">{name}</p>
      </div>
    </button>
  );
}

function AddContentRow({
  title,
  subtitle,
  emphasis,
  onClick,
}: {
  title: string;
  subtitle: string;
  emphasis: "title" | "body" | "caption";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[84px] w-full items-center justify-between rounded-[20px] border border-[#e4edf5] bg-white px-4 py-3.5 text-left transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#bddaf0] hover:bg-[#fbfdff] hover:shadow-sm"
    >
      <div className="min-w-0">
        <p
          className={
            emphasis === "title"
              ? "text-lg font-bold tracking-[-0.02em] text-slate-950"
              : emphasis === "caption"
                ? "text-xs font-bold uppercase tracking-wide text-slate-950"
                : "text-base font-bold tracking-[-0.02em] text-slate-950"
          }
        >
          {title}
        </p>

        <p className="mt-0.5 text-xs font-medium text-slate-500">{subtitle}</p>
      </div>

      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eef7ff] text-[#2f91d0] transition-all duration-200 group-hover:bg-[#2f91d0] group-hover:text-white">
        <Plus className="h-4 w-4" />
      </span>
    </button>
  );
}

function LayerItemRow({
  active,
  label,
  content,
  index,
  type,
  imageUrl,
  onSelect,
  onRemove,
  removeLabel,
}: {
  active: boolean;
  label: string;
  content: string;
  index: number;
  type: "text" | "character" | "accessory";
  imageUrl?: string | null;
  onSelect: () => void;
  onRemove: () => void;
  removeLabel: string;
}) {
  const showPreview = type === "accessory" && Boolean(imageUrl);

  const icon =
    type === "text" ? (
      <Type className="h-[15px] w-[15px]" />
    ) : type === "character" ? (
      <UserRound className="h-[15px] w-[15px]" />
    ) : (
      <Puzzle className="h-[15px] w-[15px]" />
    );

  const badgeClass =
    type === "text"
      ? "bg-violet-50 text-violet-600"
      : type === "character"
        ? "bg-emerald-50 text-emerald-600"
        : "bg-amber-50 text-amber-700";

  return (
    <div
      className={[
        "group flex items-center gap-2.5 rounded-[18px] border px-3 py-2.5 transition-all duration-200 ease-out",
        active
          ? "border-[#b9d8ed] bg-[#f8fcff]"
          : "border-[#e4edf5] bg-white hover:-translate-y-[1px] hover:border-[#cfe4f4] hover:bg-[#fbfdff] hover:shadow-sm",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-2.5 border-0 bg-transparent p-0 text-left outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
      >
        <div
          className={[
            "relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[14px] border transition-all duration-200",
            active
              ? "border-[#d6eafa] bg-white text-[#2f91d0]"
              : "border-[#edf3f8] bg-white text-slate-500 group-hover:border-[#d6eafa] group-hover:text-[#2f91d0]",
          ].join(" ")}
        >
          {showPreview ? (
            <Image
              src={imageUrl ?? ""}
              alt={content || label}
              fill
              sizes="40px"
              className="object-contain p-1"
            />
          ) : (
            icon
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-1.5">
            <span
              className={[
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.13em]",
                badgeClass,
              ].join(" ")}
            >
              {label}
            </span>

            <span className="text-[11px] font-semibold text-slate-400">
              #{index + 1}
            </span>
          </div>

          <p
            className={[
              "truncate text-sm font-semibold leading-tight transition-colors duration-200",
              active
                ? "text-[#16496f]"
                : "text-slate-700 group-hover:text-slate-950",
            ].join(" ")}
          >
            {content || `${label} ${index + 1}`}
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-0 bg-transparent text-slate-400 outline-none ring-0 transition-all duration-200 hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

type StudioSidebarProps = {
  embedded?: boolean;
};

const TEMPLATE_PAGE_SIZE = 12;
const ACCESSORY_PAGE_SIZE = 24;

export function StudioSidebar({ embedded = false }: StudioSidebarProps) {
  const { text } = useStudioI18n();
  const [query, setQuery] = useState("");
  const [activeTemplateCategoryIds, setActiveTemplateCategoryIds] = useState<
    string[]
  >([]);
  const [activeAccessoryCategoryIds, setActiveAccessoryCategoryIds] = useState<
    string[]
  >([]);
  const [templatePagination, setTemplatePagination] = useState({
    key: "",
    count: TEMPLATE_PAGE_SIZE,
  });
  const [accessoryPagination, setAccessoryPagination] = useState({
    key: "",
    count: ACCESSORY_PAGE_SIZE,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const quickStickers = useMemo(
    () =>
      QUICK_STICKERS.map((sticker) => ({
        ...sticker,
        label: text.sidebar.quickStickers[sticker.id],
      })),
    [text.sidebar.quickStickers],
  );

  const {
    activeTemplate,
    setActiveTemplate,
    customBackgroundUrl,
    setCustomBackgroundUrl,
    setCustomBackgroundOriginalName,
    clearContentValues,
    addElement,
    removeElement,
    selectedId,
    setSelectedId,
    templates,
    templateCategories,
    accessories,
    accessoryCategories,
    elements,
    isBackgroundsLoading,
    backgroundsError,
    isAccessoriesLoading,
    accessoriesError,
    isAccessoryCategoriesLoading,
    accessoryCategoriesError,
    activePanelTab,
  } = useStudio();

  const activeTab: StudioTab =
    activePanelTab === "uploads"
      ? "uploads"
      : activePanelTab === "information" ||
          activePanelTab === "add-text" ||
          activePanelTab === "formatting"
        ? "text"
        : activePanelTab === "accessories"
          ? "assets"
          : activePanelTab === "layers"
            ? "layers"
            : "templates";

  const normalizedQuery = query.trim().toLowerCase();
  const showSearch = activeTab === "templates" || activeTab === "assets";
  const effectiveTemplateCategoryIds = activeTemplateCategoryIds.filter((id) =>
    templateCategories.some((category) => category.id === id),
  );
  const effectiveAccessoryCategoryIds = activeAccessoryCategoryIds.filter(
    (id) => accessoryCategories.some((category) => category.id === id),
  );

  const filteredTemplates = useMemo(() => {
    let items =
      effectiveTemplateCategoryIds.length > 0
        ? templates.filter((template) =>
            Boolean(
              template.categoryId &&
              effectiveTemplateCategoryIds.includes(template.categoryId),
            ),
          )
        : templates;

    if (!normalizedQuery) return items;

    items = items.filter((template) =>
      template.name.toLowerCase().includes(normalizedQuery),
    );

    return items;
  }, [effectiveTemplateCategoryIds, normalizedQuery, templates]);

  const filteredAccessories = useMemo(() => {
    let items =
      effectiveAccessoryCategoryIds.length > 0
        ? accessories.filter((accessory) =>
            Boolean(
              accessory.categoryId &&
              effectiveAccessoryCategoryIds.includes(accessory.categoryId),
            ),
          )
        : accessories;

    if (!normalizedQuery) return items;

    items = items.filter((accessory) =>
      accessory.name.toLowerCase().includes(normalizedQuery),
    );

    return items;
  }, [accessories, effectiveAccessoryCategoryIds, normalizedQuery]);

  const templatePaginationKey = `${normalizedQuery}:${activeTemplateCategoryIds.join(",")}`;
  const accessoryPaginationKey = `${normalizedQuery}:${activeAccessoryCategoryIds.join(",")}`;
  const visibleTemplateCount =
    templatePagination.key === templatePaginationKey
      ? templatePagination.count
      : TEMPLATE_PAGE_SIZE;
  const visibleAccessoryCount =
    accessoryPagination.key === accessoryPaginationKey
      ? accessoryPagination.count
      : ACCESSORY_PAGE_SIZE;
  const visibleTemplates = filteredTemplates.slice(0, visibleTemplateCount);
  const visibleAccessories = filteredAccessories.slice(
    0,
    visibleAccessoryCount,
  );

  const selectedAccessoryElements = useMemo(
    () =>
      elements.filter(
        (element) => element.type === "accessory" && element.accessoryId,
      ),
    [elements],
  );
  const selectedAccessoryByCatalogId = useMemo(() => {
    const selected = new Map<string, StudioElement>();
    selectedAccessoryElements.forEach((element) => {
      if (element.accessoryId) selected.set(element.accessoryId, element);
    });
    return selected;
  }, [selectedAccessoryElements]);
  const selectedAccessoriesTotal = selectedAccessoryElements.reduce(
    (total, element) => total + (element.price ?? 0),
    0,
  );

  const handleUpload = async (file?: File) => {
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const uploaded = await uploadCustomerImage(file);

      setCustomBackgroundUrl(uploaded.url);
      setCustomBackgroundOriginalName(uploaded.originalName);
      setActiveTemplate(null);
      clearContentValues();
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : text.sidebar.uploadError,
      );
    } finally {
      setUploading(false);
    }
  };

  const addText = (variant: "title" | "body" | "caption") => {
    addElement({
      type: "text",
      content:
        variant === "title"
          ? text.sidebar.defaultTitleText
          : variant === "caption"
            ? text.sidebar.defaultCaptionText
            : text.sidebar.defaultBodyText,
      x: variant === "title" ? 110 : 120,
      y: variant === "title" ? 285 : 320,
      fontSize: variant === "title" ? 22 : variant === "caption" ? 13 : 16,
      color: variant === "caption" ? "#64748b" : "#0f172a",
    });
  };

  const addSticker = (sticker: (typeof quickStickers)[number]) => {
    addElement({
      type: "accessory",
      content: sticker.label,
      imageUrl: sticker.imageUrl,
      x: 150,
      y: 150,
      width: 64,
      height: 64,
    });
  };

  return (
    <div className="flex min-h-0 w-full flex-col bg-white">
      <div
        className={[
          "border-b border-[#edf3f8] px-4 py-3.5",
          embedded ? "bg-[#fbfdff]" : "bg-white",
        ].join(" ")}
      >
        {!embedded ? (
          <p className="text-lg font-bold leading-none tracking-[-0.025em] text-slate-950">
            {text.sidebar.tabs[activeTab]}
          </p>
        ) : null}

        {showSearch ? (
          <div
            className={`${embedded ? "" : "mt-3.5"} form-control form-control--compact flex items-center gap-2.5 px-3.5 focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15`}
          >
            <Search className="h-4 w-4 shrink-0 text-slate-400" />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                activeTab === "templates"
                  ? text.sidebar.searchTemplates
                  : text.sidebar.searchAccessories
              }
              className="min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-sm font-medium text-slate-700 shadow-none outline-none ring-0 placeholder:text-text-muted focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
              style={{
                boxShadow: "none",
                WebkitBoxShadow: "none",
              }}
            />
          </div>
        ) : null}
      </div>

      <div className="px-4 py-4">
        {activeTab === "templates" && (
          <div className="space-y-3">
            {templateCategories.length > 0 ? (
              <StudioSearchableMultiSelect
                label={text.common.all}
                options={templateCategories.map((category) => ({
                  value: category.id,
                  label: category.name,
                }))}
                value={effectiveTemplateCategoryIds}
                onChange={setActiveTemplateCategoryIds}
                searchPlaceholder={text.sidebar.searchTemplates}
                emptyLabel={text.sidebar.noTemplateMatches}
                clearLabel={text.common.remove}
              />
            ) : null}

            {backgroundsError ? (
              <div className="flex items-start gap-2 rounded-[16px] border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-semibold leading-relaxed text-amber-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{backgroundsError}</span>
              </div>
            ) : null}

            {isBackgroundsLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[144px] animate-pulse rounded-[20px] bg-[#eef3f8]"
                  />
                ))}
              </div>
            ) : filteredTemplates.length === 0 && !customBackgroundUrl ? (
              <EmptyState
                title={
                  normalizedQuery
                    ? text.sidebar.noTemplateMatches
                    : text.sidebar.noTemplates
                }
                description={
                  normalizedQuery
                    ? text.sidebar.noMatchesDescription
                    : text.sidebar.noTemplatesDescription
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {customBackgroundUrl ? (
                  <TemplateCard
                    active={!activeTemplate}
                    imageUrl={customBackgroundUrl}
                    name={text.sidebar.yourPhoto}
                    onClick={() => {
                      setActiveTemplate(null);
                      clearContentValues();
                    }}
                  />
                ) : null}

                {visibleTemplates.map((template, index) => (
                  <TemplateCard
                    key={template.id}
                    active={activeTemplate === template.id}
                    imageUrl={template.thumbnailUrl ?? template.imageUrl}
                    name={template.name}
                    priority={index === 0 && !customBackgroundUrl}
                    onClick={() => {
                      setCustomBackgroundUrl(null);
                      setCustomBackgroundOriginalName(null);
                      setActiveTemplate(template.id);
                    }}
                  />
                ))}
              </div>
            )}

            {visibleTemplates.length < filteredTemplates.length ? (
              <button
                type="button"
                onClick={() =>
                  setTemplatePagination({
                    key: templatePaginationKey,
                    count: visibleTemplateCount + TEMPLATE_PAGE_SIZE,
                  })
                }
                className="mt-3 w-full rounded-2xl border border-[#dbe7f1] bg-white px-4 py-2.5 text-sm font-semibold text-[#247fb9] transition-colors duration-200 hover:border-[#b9d8ed] hover:bg-[#f8fbff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc6e6] focus-visible:ring-offset-2"
              >
                {text.sidebar.loadMore(
                  visibleTemplates.length,
                  filteredTemplates.length,
                )}
              </button>
            ) : null}
          </div>
        )}

        {activeTab === "uploads" && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              disabled={uploading}
              className="group flex min-h-[150px] w-full flex-col items-center justify-center gap-1 rounded-[22px] border border-dashed border-[#cfe4f4] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,250,255,0.92))] px-5 text-center text-[#2f91d0] transition-all duration-200 ease-out hover:border-[#8fc6e6] hover:bg-white hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UploadCloud className="mb-1.5 h-7 w-7 transition-transform duration-200 ease-out group-hover:-translate-y-0.5" />

              <span className="text-sm font-semibold">
                {uploading
                  ? text.sidebar.uploading
                  : text.sidebar.uploadBackground}
              </span>

              <span className="text-xs font-medium text-slate-500">
                {text.sidebar.uploadFormats}
              </span>
            </button>

            <input
              ref={uploadInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => handleUpload(event.target.files?.[0])}
            />

            {uploadError ? (
              <p className="rounded-2xl border border-rose-200/80 bg-rose-50/90 px-3 py-2 text-xs font-semibold text-rose-700">
                {uploadError}
              </p>
            ) : null}
          </div>
        )}

        {activeTab === "text" && (
          <div className="space-y-3">
            <AddContentRow
              title={text.sidebar.titleText}
              subtitle={text.sidebar.titleTextHint}
              emphasis="title"
              onClick={() => addText("title")}
            />

            <AddContentRow
              title={text.sidebar.bodyText}
              subtitle={text.sidebar.bodyTextHint}
              emphasis="body"
              onClick={() => addText("body")}
            />

            <AddContentRow
              title={text.sidebar.captionText}
              subtitle={text.sidebar.captionTextHint}
              emphasis="caption"
              onClick={() => addText("caption")}
            />
          </div>
        )}

        {activeTab === "assets" && (
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {text.sidebar.accessoriesLabel}
              </p>

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
                  value={effectiveAccessoryCategoryIds}
                  onChange={setActiveAccessoryCategoryIds}
                  searchPlaceholder={text.sidebar.searchAccessories}
                  emptyLabel={text.sidebar.noAccessoryMatches}
                  clearLabel={text.common.remove}
                />
              ) : null}

              {accessoryCategoriesError ? (
                <p className="flex items-start gap-2 text-xs font-semibold leading-relaxed text-amber-700">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{accessoryCategoriesError}</span>
                </p>
              ) : null}

              {isAccessoriesLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[144px] animate-pulse rounded-[20px] bg-[#eef3f8]"
                    />
                  ))}
                </div>
              ) : accessoriesError ? (
                <div className="flex items-start gap-2 rounded-[16px] border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold leading-relaxed text-rose-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{accessoriesError}</span>
                </div>
              ) : filteredAccessories.length === 0 ? (
                <>
                  <EmptyState
                    title={
                      normalizedQuery ||
                      effectiveAccessoryCategoryIds.length > 0
                        ? text.sidebar.noAccessoryMatches
                        : text.sidebar.noAccessories
                    }
                    description={
                      normalizedQuery ||
                      effectiveAccessoryCategoryIds.length > 0
                        ? text.sidebar.noMatchesDescription
                        : text.sidebar.noAccessoriesDescription
                    }
                  />

                  {!normalizedQuery ? (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {quickStickers.map((sticker) => (
                        <button
                          key={sticker.id}
                          type="button"
                          onClick={() => addSticker(sticker)}
                          aria-label={text.sidebar.addNamedItem(sticker.label)}
                          className="grid aspect-square place-items-center rounded-[18px] border border-slate-200/70 bg-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#bddaf0] hover:bg-[#fbfdff] hover:shadow-sm"
                        >
                          <Image
                            src={sticker.imageUrl}
                            alt=""
                            width={48}
                            height={48}
                            aria-hidden="true"
                            className="h-10 w-10 object-contain"
                          />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {visibleAccessories.map((accessory) => {
                    const selectedElement = selectedAccessoryByCatalogId.get(
                      accessory.id,
                    );

                    return (
                      <button
                        key={accessory.id}
                        type="button"
                        aria-pressed={Boolean(selectedElement)}
                        onClick={() => {
                          if (selectedElement) {
                            removeElement(selectedElement.id);
                            return;
                          }

                          const imageUrl =
                            accessory.imageUrl ?? accessory.iconUrl;

                          addElement({
                            type: "accessory",
                            content: accessory.name,
                            ...(imageUrl ? { imageUrl } : {}),
                            x: 140,
                            y: 150,
                            width: 54,
                            height: 54,
                            price: accessory.price,
                            accessoryId: accessory.id,
                          });
                        }}
                        className={`group relative overflow-hidden rounded-[20px] border bg-white text-left transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm ${
                          selectedElement
                            ? "border-[#8fc6e6] ring-2 ring-[#dceeff]"
                            : "border-slate-200/70 hover:border-[#bddaf0]"
                        }`}
                      >
                        <div className="grid aspect-square place-items-center bg-[#f8fbff]">
                          <StudioMediaThumbnail
                            src={
                              accessory.thumbnailUrl ??
                              accessory.imageUrl ??
                              accessory.iconUrl
                            }
                            alt={accessory.name}
                            imageClassName="object-contain p-3 transition-[opacity,transform] duration-200 ease-out group-hover:scale-[1.04]"
                            fallback={
                              <Puzzle className="h-6 w-6 text-slate-300" />
                            }
                          />
                        </div>

                        <div className="p-2.5">
                          <p className="truncate text-[11px] font-semibold text-slate-800">
                            {accessory.name}
                          </p>

                          <p className="mt-0.5 text-[10px] font-semibold text-[#2f91d0]">
                            {formatPrice(accessory.price)}
                          </p>
                        </div>

                        {selectedElement ? (
                          <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-[#2f91d0] text-white">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}

              {visibleAccessories.length < filteredAccessories.length ? (
                <button
                  type="button"
                  onClick={() =>
                    setAccessoryPagination({
                      key: accessoryPaginationKey,
                      count: visibleAccessoryCount + ACCESSORY_PAGE_SIZE,
                    })
                  }
                  className="w-full rounded-2xl border border-[#dbe7f1] bg-white px-4 py-2.5 text-sm font-semibold text-[#247fb9] transition-colors duration-200 hover:border-[#b9d8ed] hover:bg-[#f8fbff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc6e6] focus-visible:ring-offset-2"
                >
                  {text.sidebar.loadMore(
                    visibleAccessories.length,
                    filteredAccessories.length,
                  )}
                </button>
              ) : null}

              {!isAccessoriesLoading ? (
                <div className="flex items-center justify-between rounded-[16px] bg-[#f4faff] px-3 py-2.5 text-xs">
                  <span className="font-semibold text-slate-600">
                    {text.sidebar.selectedCharms(
                      selectedAccessoryElements.length,
                    )}
                  </span>
                  <span className="font-bold text-[#2f91d0]">
                    {formatPrice(selectedAccessoriesTotal)}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {activeTab === "layers" && (
          <div className="space-y-3">
            {elements.length === 0 ? (
              <EmptyState
                title={text.sidebar.noLayers}
                description={text.sidebar.noLayersDescription}
              />
            ) : (
              elements.map((element, index) => {
                const active = selectedId === element.id;
                const type =
                  element.type === "text"
                    ? "text"
                    : element.type === "character"
                      ? "character"
                      : "accessory";

                const label =
                  type === "text"
                    ? text.sidebar.layerTypes.text
                    : type === "character"
                      ? text.sidebar.layerTypes.character
                      : text.sidebar.layerTypes.accessory;

                const previewImage =
                  typeof element === "object" &&
                  element !== null &&
                  "imageUrl" in element
                    ? (element.imageUrl as string | undefined | null)
                    : undefined;

                return (
                  <LayerItemRow
                    key={element.id}
                    active={active}
                    type={type}
                    label={label}
                    content={element.content || ""}
                    index={index}
                    {...(previewImage !== undefined
                      ? { imageUrl: previewImage }
                      : {})}
                    onSelect={() => setSelectedId(element.id)}
                    onRemove={() => removeElement(element.id)}
                    removeLabel={text.sidebar.removeLayer}
                  />
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
