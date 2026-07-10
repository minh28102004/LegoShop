"use client";

import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Check,
  Layers,
  LayoutTemplate,
  Plus,
  Puzzle,
  Search,
  Settings2,
  Trash2,
  Type,
  UploadCloud,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { formatCurrency as formatPrice } from "@lego-shop/shared";

import { uploadCustomerImage } from "@/lib/api/uploads";
import { useStudio } from "./StudioContext";

type StudioTab = "templates" | "uploads" | "text" | "assets" | "layers";

const TABS: Array<{ id: StudioTab; icon: LucideIcon; label: string }> = [
  { id: "templates", icon: LayoutTemplate, label: "Mẫu thiết kế" },
  { id: "uploads", icon: UploadCloud, label: "Tải ảnh lên" },
  { id: "text", icon: Type, label: "Văn bản" },
  { id: "assets", icon: Puzzle, label: "Phụ kiện" },
  { id: "layers", icon: Layers, label: "Lớp thiết kế" },
];

const TAB_TITLES: Record<StudioTab, string> = {
  templates: "Mẫu thiết kế",
  uploads: "Tải ảnh lên",
  text: "Văn bản",
  assets: "Phụ kiện",
  layers: "Lớp thiết kế",
};

const QUICK_STICKERS = ["🧸", "🎀", "💖", "✨", "🎈", "🎁", "🎉", "👑", "🌺"];

function SidebarTooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="group/tooltip relative flex">
      {children}

      <span
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-sm transition-all delay-150 duration-150 group-hover/tooltip:opacity-100"
      >
        {label}
      </span>
    </div>
  );
}

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

function TemplateCard({
  active,
  imageUrl,
  name,
  onClick,
}: {
  active: boolean;
  imageUrl?: string | null;
  name: string;
  onClick: () => void;
}) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(imageUrl) && !broken;

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
        {showImage ? (
          <img
            src={imageUrl ?? undefined}
            alt={name}
            loading="lazy"
            onError={() => setBroken(true)}
            className="h-full w-full object-contain p-2.5 transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center px-3 text-center">
            <div className="grid place-items-center gap-1.5">
              <LayoutTemplate className="h-6 w-6 text-slate-300" />
              <span className="max-w-[100px] text-[11px] font-semibold leading-4 text-slate-400">
                {name}
              </span>
            </div>
          </div>
        )}

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
}: {
  active: boolean;
  label: string;
  content: string;
  index: number;
  type: "text" | "character" | "accessory";
  imageUrl?: string | null;
  onSelect: () => void;
  onRemove: () => void;
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
            "grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[14px] border transition-all duration-200",
            active
              ? "border-[#d6eafa] bg-white text-[#2f91d0]"
              : "border-[#edf3f8] bg-white text-slate-500 group-hover:border-[#d6eafa] group-hover:text-[#2f91d0]",
          ].join(" ")}
        >
          {showPreview ? (
            <img
              src={imageUrl ?? ""}
              alt={content || label}
              className="h-full w-full object-cover"
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
        aria-label="Xóa lớp"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-0 bg-transparent text-slate-400 outline-none ring-0 transition-all duration-200 hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function StudioSidebar() {
  const [activeTab, setActiveTab] = useState<StudioTab>("templates");
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

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
    accessories,
    elements,
    isLoadingData,
  } = useStudio();

  const normalizedQuery = query.trim().toLowerCase();
  const showSearch = activeTab === "templates" || activeTab === "assets";

  const filteredTemplates = useMemo(() => {
    if (!normalizedQuery) return templates;

    return templates.filter((template) =>
      template.name.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery, templates]);

  const filteredAccessories = useMemo(() => {
    if (!normalizedQuery) return accessories;

    return accessories.filter((accessory) =>
      accessory.name.toLowerCase().includes(normalizedQuery),
    );
  }, [accessories, normalizedQuery]);

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
        error instanceof Error ? error.message : "Không tải được ảnh lên",
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
          ? "BRICKSTUDIO"
          : variant === "caption"
            ? "Custom Edition #001"
            : "Thêm nội dung văn bản",
      x: variant === "title" ? 110 : 120,
      y: variant === "title" ? 285 : 320,
      fontSize: variant === "title" ? 22 : variant === "caption" ? 13 : 16,
      color: variant === "caption" ? "#64748b" : "#0f172a",
    });
  };

  const addSticker = (sticker: string) => {
    addElement({
      type: "accessory",
      content: sticker,
      x: 150,
      y: 150,
      fontSize: 58,
    });
  };

  return (
    <div className="flex h-full min-h-0 bg-white">
      <nav className="flex w-[68px] shrink-0 flex-col items-center gap-3.5 border-r border-[#edf3f8] bg-[#fbfdff] px-2 py-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <SidebarTooltip key={tab.id} label={tab.label}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setQuery("");
                }}
                aria-label={tab.label}
                aria-pressed={active}
                className={[
                  "grid h-11 w-11 place-items-center rounded-2xl border transition-all duration-200 ease-out",
                  active
                    ? "border-[#2f91d0] bg-[#2f91d0] text-white shadow-[0_8px_16px_-13px_rgba(47,145,208,0.52)] ring-1 ring-inset ring-white/30"
                    : "border-transparent bg-[#f8fbff] text-slate-500 hover:border-[#cfe4f4] hover:bg-white hover:text-[#2f91d0]",
                ].join(" ")}
              >
                <Icon className="h-5 w-5" />
                <span className="sr-only">{tab.label}</span>
              </button>
            </SidebarTooltip>
          );
        })}

        <div className="mt-auto grid h-10 w-10 place-items-center rounded-xl text-slate-400">
          <Settings2 className="h-5 w-5" />
        </div>
      </nav>

      <aside className="flex w-[300px] shrink-0 flex-col bg-white xl:w-[320px] 2xl:w-[336px]">
        <div className="border-b border-[#edf3f8] px-5 py-4">
          <p className="text-[24px] font-bold leading-none tracking-[-0.03em] text-slate-950">
            {TAB_TITLES[activeTab]}
          </p>

          {showSearch ? (
            <div className="mt-4 flex h-10 items-center gap-2.5 rounded-full border border-[#dbe7f1] bg-[#fbfdff] px-3.5 transition-all duration-200 focus-within:border-[#9ed0ef] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#dceeff]/70">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={
                  activeTab === "templates"
                    ? "Tìm mẫu thiết kế..."
                    : "Tìm phụ kiện..."
                }
                className="min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-sm font-medium text-slate-700 shadow-none outline-none ring-0 placeholder:text-slate-400 focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                style={{
                  boxShadow: "none",
                  WebkitBoxShadow: "none",
                }}
              />
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
          {activeTab === "templates" && (
            <>
              {isLoadingData ? (
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
                      ? "Không tìm thấy mẫu phù hợp"
                      : "Chưa có mẫu thiết kế nào"
                  }
                  description={
                    normalizedQuery
                      ? "Thử nhập từ khóa khác hoặc xóa nội dung tìm kiếm."
                      : "Khi có mẫu mới, danh sách sẽ hiển thị tại đây."
                  }
                />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {customBackgroundUrl ? (
                    <TemplateCard
                      active={!activeTemplate}
                      imageUrl={customBackgroundUrl}
                      name="Ảnh của bạn"
                      onClick={() => {
                        setActiveTemplate(null);
                        clearContentValues();
                      }}
                    />
                  ) : null}

                  {filteredTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      active={activeTemplate === template.id}
                      imageUrl={template.imageUrl}
                      name={template.name}
                      onClick={() => {
                        setCustomBackgroundUrl(null);
                        setCustomBackgroundOriginalName(null);
                        setActiveTemplate(template.id);
                      }}
                    />
                  ))}
                </div>
              )}
            </>
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
                  {uploading ? "Đang tải ảnh..." : "Tải ảnh nền lên"}
                </span>

                <span className="text-xs font-medium text-slate-500">
                  Hỗ trợ JPG, PNG, WEBP
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
                title="Tiêu đề lớn"
                subtitle="Thêm dòng chữ nổi bật"
                emphasis="title"
                onClick={() => addText("title")}
              />

              <AddContentRow
                title="Đoạn văn bản"
                subtitle="Thêm đoạn mô tả ngắn"
                emphasis="body"
                onClick={() => addText("body")}
              />

              <AddContentRow
                title="Chú thích"
                subtitle="Thêm dòng phụ nhỏ"
                emphasis="caption"
                onClick={() => addText("caption")}
              />
            </div>
          )}

          {activeTab === "assets" && (
            <div className="space-y-5">
              <div>
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Phụ kiện
                </p>

                {filteredAccessories.length === 0 ? (
                  <>
                    <EmptyState
                      title={
                        normalizedQuery
                          ? "Không tìm thấy phụ kiện phù hợp"
                          : "Chưa có phụ kiện nào"
                      }
                      description={
                        normalizedQuery
                          ? "Thử nhập từ khóa khác hoặc xóa nội dung tìm kiếm."
                          : "Bạn có thể dùng sticker nhanh bên dưới trong lúc chờ thêm phụ kiện."
                      }
                    />

                    {!normalizedQuery ? (
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        {QUICK_STICKERS.map((sticker) => (
                          <button
                            key={sticker}
                            type="button"
                            onClick={() => addSticker(sticker)}
                            className="grid aspect-square place-items-center rounded-[18px] border border-slate-200/70 bg-white text-2xl transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#bddaf0] hover:bg-[#fbfdff] hover:shadow-sm"
                          >
                            {sticker}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredAccessories.map((accessory) => (
                      <button
                        key={accessory.id}
                        type="button"
                        onClick={() => {
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
                        className="group overflow-hidden rounded-[20px] border border-slate-200/70 bg-white text-left transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#bddaf0] hover:shadow-sm"
                      >
                        <div className="grid aspect-square place-items-center bg-[#f8fbff]">
                          {accessory.imageUrl || accessory.iconUrl ? (
                            <img
                              src={
                                accessory.imageUrl ?? accessory.iconUrl ?? ""
                              }
                              alt={accessory.name}
                              className="h-full w-full object-contain p-2.5 transition-transform duration-200 ease-out group-hover:scale-[1.04]"
                            />
                          ) : (
                            <Puzzle className="h-6 w-6 text-slate-300" />
                          )}
                        </div>

                        <div className="p-2.5">
                          <p className="truncate text-[11px] font-semibold text-slate-800">
                            {accessory.name}
                          </p>

                          <p className="mt-0.5 text-[10px] font-semibold text-[#2f91d0]">
                            {formatPrice(accessory.price)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "layers" && (
            <div className="space-y-3">
              {elements.length === 0 ? (
                <EmptyState
                  title="Chưa có lớp thiết kế nào"
                  description="Khi bạn thêm chữ, nhân vật hoặc phụ kiện, các lớp sẽ xuất hiện tại đây."
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
                      ? "Văn bản"
                      : type === "character"
                        ? "Nhân vật"
                        : "Phụ kiện";

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
                    />
                  );
                })
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
