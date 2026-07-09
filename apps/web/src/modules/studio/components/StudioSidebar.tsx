"use client";

import { useMemo, useRef, useState } from "react";
import {
  Check,
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  Plus,
  Puzzle,
  Search,
  Settings2,
  Type,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";
import { formatCurrency as formatPrice } from "@lego-shop/shared";

import { uploadCustomerImage } from "@/lib/api/uploads";
import { useStudio } from "./StudioContext";

type StudioTab = "templates" | "uploads" | "text" | "assets" | "layers";

const TABS: Array<{ id: StudioTab; icon: LucideIcon; label: string }> = [
  { id: "templates", icon: LayoutTemplate, label: "Templates" },
  { id: "uploads", icon: UploadCloud, label: "Uploads" },
  { id: "text", icon: Type, label: "Text" },
  { id: "assets", icon: Puzzle, label: "Assets" },
  { id: "layers", icon: Layers, label: "Layers" },
];

const QUICK_STICKERS = ["🧸", "🎀", "💖", "✨", "🎈", "🎁", "🎉", "👑", "🌺"];

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
    addCharacter,
    removeElement,
    selectedId,
    setSelectedId,
    templates,
    accessories,
    characters,
    elements,
    isLoadingData,
  } = useStudio();

  const normalizedQuery = query.trim().toLowerCase();

  const filteredTemplates = useMemo(() => {
    if (!normalizedQuery) return templates;
    return templates.filter((template) => template.name.toLowerCase().includes(normalizedQuery));
  }, [normalizedQuery, templates]);

  const filteredAccessories = useMemo(() => {
    if (!normalizedQuery) return accessories;
    return accessories.filter((accessory) => accessory.name.toLowerCase().includes(normalizedQuery));
  }, [accessories, normalizedQuery]);

  const filteredCharacters = useMemo(() => {
    if (!normalizedQuery) return characters;
    return characters.filter((character) => character.name.toLowerCase().includes(normalizedQuery));
  }, [characters, normalizedQuery]);

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
      setUploadError(error instanceof Error ? error.message : "Không tải được ảnh lên");
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
      <nav className="flex w-[68px] shrink-0 flex-col items-center gap-3 border-r border-[#edf3f8] bg-[#fbfdff] px-2 py-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`group grid h-11 w-11 place-items-center rounded-2xl transition-all duration-200 ${
                active
                  ? "bg-[#2f91d0] text-white shadow-[0_14px_24px_-18px_rgba(47,145,208,0.42)]"
                  : "border border-transparent text-slate-500 hover:-translate-y-0.5 hover:bg-white hover:text-slate-900 hover:shadow-[0_10px_22px_-18px_rgba(18,45,78,0.18)]"
              }`}
              title={tab.label}
            >
              <Icon className="h-5 w-5" />
              <span className="sr-only">{tab.label}</span>
            </button>
          );
        })}

        <div className="mt-auto grid h-10 w-10 place-items-center rounded-2xl text-slate-400">
          <Settings2 className="h-5 w-5" />
        </div>
      </nav>

      <aside className="flex w-[248px] shrink-0 flex-col bg-white xl:w-[256px]">
        <div className="border-b border-[#edf3f8] px-5 py-5">
          <p className="text-[28px] font-bold tracking-[-0.03em] text-slate-950">
            {activeTab === "templates"
              ? "Templates"
              : activeTab === "uploads"
                ? "Uploads"
                : activeTab === "text"
                  ? "Text"
                  : activeTab === "layers"
                    ? "Layers"
                    : "Assets"}
          </p>
          {activeTab !== "text" && activeTab !== "layers" ? (
            <div className="mt-4 flex h-11 items-center gap-2 rounded-2xl border border-[#e5eef6]/80 bg-white px-4 shadow-[0_10px_20px_-24px_rgba(18,45,78,0.12)] transition-all focus-within:border-[#c5dff0] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(220,238,255,0.5)]">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search bricks, figs..."
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none ring-0 focus:outline-none focus:ring-0 placeholder:text-slate-400"
              />
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4.5 scrollbar-hide">
          {activeTab === "templates" && (
            <div className="grid grid-cols-2 gap-3">
              {customBackgroundUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTemplate(null);
                    clearContentValues();
                  }}
                  className={`group relative h-[140px] overflow-hidden rounded-2xl border transition-all duration-200 ease-out ${
                    !activeTemplate
                      ? "border-[#79b9e8] bg-[#f2f9ff] shadow-[0_12px_24px_-22px_rgba(47,145,208,0.34)] ring-1 ring-[#d6ebfa]"
                      : "border-[#e4edf5] bg-white hover:-translate-y-0.5 hover:border-[#bfdcf0] hover:shadow-[0_14px_26px_-24px_rgba(18,45,78,0.18)]"
                  }`}
                >
                  <img
                    src={customBackgroundUrl}
                    alt="Ảnh của bạn"
                    className="h-full w-full object-contain bg-white p-2 transition duration-500 group-hover:scale-[1.03]"
                  />
                  {!activeTemplate ? (
                    <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-[#2f91d0] text-white shadow-[0_10px_20px_-14px_rgba(47,145,208,0.45)]">
                      <Check className="h-3 w-3" />
                    </span>
                  ) : null}
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent p-2 pt-8 text-left text-[10px] font-semibold uppercase tracking-wide text-white">
                    Ảnh của bạn
                  </span>
                </button>
              ) : null}

              {isLoadingData
                ? Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="aspect-square animate-pulse rounded-[20px] bg-[#eef3f8]" />
                  ))
                : filteredTemplates.map((template) => {
                    const active = activeTemplate === template.id;

                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => {
                          setCustomBackgroundUrl(null);
                          setCustomBackgroundOriginalName(null);
                          setActiveTemplate(template.id);
                        }}
                        className={`group relative h-[140px] overflow-hidden rounded-2xl border transition-all duration-200 ease-out ${
                          active
                            ? "border-[#79b9e8] bg-[#f2f9ff] shadow-[0_12px_24px_-22px_rgba(47,145,208,0.34)] ring-1 ring-[#d6ebfa]"
                            : "border-[#e4edf5] bg-white hover:-translate-y-0.5 hover:border-[#bfdcf0] hover:shadow-[0_14px_26px_-24px_rgba(18,45,78,0.18)]"
                        }`}
                      >
                        {template.imageUrl ? (
                          <img
                            src={template.imageUrl}
                            alt={template.name}
                            loading="lazy"
                            className="h-full w-full object-contain bg-white p-2 transition duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="grid h-full place-items-center p-3 text-center text-[11px] font-medium leading-4 text-slate-500">
                            {template.name}
                          </div>
                        )}
                        {active ? (
                          <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-[#2f91d0] text-white shadow-[0_10px_20px_-14px_rgba(47,145,208,0.45)]">
                            <Check className="h-3 w-3" />
                          </span>
                        ) : null}
                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent p-2 pt-8 text-left text-[10px] font-semibold uppercase tracking-wide text-white">
                          {template.name}
                        </span>
                      </button>
                    );
                  })}
            </div>
          )}

          {activeTab === "uploads" && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                disabled={uploading}
                className="flex min-h-[154px] w-full flex-col items-center justify-center rounded-[22px] border border-dashed border-[#cfe4f4] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,250,255,0.92))] px-4 text-center text-[#2f91d0] shadow-[0_14px_30px_-28px_rgba(18,45,78,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#a8d0ec] hover:shadow-[0_18px_34px_-28px_rgba(47,145,208,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UploadCloud className="mb-3 h-8 w-8" />
                <span className="text-sm font-semibold">
                  {uploading ? "Đang tải ảnh..." : "Tải ảnh nền lên"}
                </span>
                <span className="mt-1 text-xs font-medium text-slate-500">
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
                <p className="rounded-2xl border border-rose-200/80 bg-rose-50/90 px-3 py-2 text-xs font-semibold text-rose-700 shadow-[0_8px_20px_-22px_rgba(225,29,72,0.24)]">
                  {uploadError}
                </p>
              ) : null}
            </div>
          )}

          {activeTab === "text" && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => addText("title")}
                className="flex w-full items-center justify-between rounded-[22px] border border-[#e4edf5] bg-white p-4 text-left shadow-[0_12px_28px_-26px_rgba(18,45,78,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#bddaf0] hover:bg-[#fbfdff] hover:shadow-[0_18px_36px_-28px_rgba(18,45,78,0.22)]"
              >
                <div>
                  <p className="text-lg font-bold text-slate-950">Title Text</p>
                  <p className="text-xs font-medium text-slate-500">Tiêu đề lớn, nổi bật</p>
                </div>
                <Plus className="h-5 w-5 text-[#2f91d0]" />
              </button>
              <button
                type="button"
                onClick={() => addText("body")}
                className="flex w-full items-center justify-between rounded-[22px] border border-[#e4edf5] bg-white p-4 text-left shadow-[0_12px_28px_-26px_rgba(18,45,78,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#bddaf0] hover:bg-[#fbfdff] hover:shadow-[0_18px_36px_-28px_rgba(18,45,78,0.22)]"
              >
                <div>
                  <p className="text-sm font-bold text-slate-950">Body Text</p>
                  <p className="text-xs font-medium text-slate-500">Đoạn mô tả ngắn</p>
                </div>
                <Plus className="h-5 w-5 text-[#2f91d0]" />
              </button>
              <button
                type="button"
                onClick={() => addText("caption")}
                className="flex w-full items-center justify-between rounded-[22px] border border-[#e4edf5] bg-white p-4 text-left shadow-[0_12px_28px_-26px_rgba(18,45,78,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#bddaf0] hover:bg-[#fbfdff] hover:shadow-[0_18px_36px_-28px_rgba(18,45,78,0.22)]"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-950">Caption</p>
                  <p className="text-xs font-medium text-slate-500">Dòng phụ nhỏ</p>
                </div>
                <Plus className="h-5 w-5 text-[#2f91d0]" />
              </button>
            </div>
          )}

          {activeTab === "assets" && (
            <div className="space-y-5">
              {filteredCharacters.length > 0 ? (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Mini Figures
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {filteredCharacters.map((character) => (
                      <button
                        key={character.id}
                        type="button"
                        onClick={() => addCharacter(character)}
                        className="group overflow-hidden rounded-[20px] border border-[#e4edf5] bg-white text-left shadow-[0_12px_28px_-26px_rgba(18,45,78,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#bddaf0] hover:shadow-[0_18px_34px_-26px_rgba(18,45,78,0.2)]"
                      >
                        <div className="grid aspect-square place-items-center bg-[#f8fbff]">
                          {character.imageUrl ? (
                            <img
                              src={character.imageUrl}
                              alt={character.name}
                              className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-[1.03]"
                            />
                          ) : (
                            <ImageIcon className="h-7 w-7 text-slate-300" />
                          )}
                        </div>
                        <div className="p-2">
                          <p className="truncate text-[11px] font-semibold text-slate-800">{character.name}</p>
                          <p className="text-[10px] font-semibold text-[#2f91d0]">{formatPrice(character.price)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Accessories
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {filteredAccessories.map((accessory) => (
                    <button
                      key={accessory.id}
                      type="button"
                      onClick={() => {
                        const imageUrl = accessory.imageUrl ?? accessory.iconUrl;
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
                      className="group overflow-hidden rounded-[20px] border border-[#e4edf5] bg-white text-left shadow-[0_12px_28px_-26px_rgba(18,45,78,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#bddaf0] hover:shadow-[0_18px_34px_-26px_rgba(18,45,78,0.2)]"
                    >
                      <div className="grid aspect-square place-items-center bg-[#f8fbff]">
                        {accessory.imageUrl || accessory.iconUrl ? (
                          <img
                            src={accessory.imageUrl ?? accessory.iconUrl ?? ""}
                            alt={accessory.name}
                            className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <Puzzle className="h-7 w-7 text-slate-300" />
                        )}
                      </div>
                      <div className="p-2">
                        <p className="truncate text-[11px] font-semibold text-slate-800">{accessory.name}</p>
                        <p className="text-[10px] font-semibold text-[#2f91d0]">{formatPrice(accessory.price)}</p>
                      </div>
                    </button>
                  ))}
                  {filteredAccessories.length === 0 && QUICK_STICKERS.map((sticker) => (
                    <button
                      key={sticker}
                      type="button"
                      onClick={() => addSticker(sticker)}
                      className="grid aspect-square place-items-center rounded-[20px] border border-[#e4edf5] bg-white text-3xl shadow-[0_12px_28px_-26px_rgba(18,45,78,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#bddaf0] hover:bg-[#fbfdff] hover:shadow-[0_18px_34px_-26px_rgba(18,45,78,0.2)]"
                    >
                      {sticker}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "layers" && (
            <div className="space-y-2">
              {elements.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-[#d7e5f1] bg-[#fbfdff] px-4 py-8 text-center text-sm font-medium text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  Chưa có layer nào.
                </div>
              ) : (
                elements.map((element, index) => {
                  const active = selectedId === element.id;
                  return (
                    <button
                      key={element.id}
                      type="button"
                      onClick={() => setSelectedId(element.id)}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                        active
                          ? "border-[#cfe4f4] bg-[#f2f9ff] text-[#2f91d0] shadow-[0_12px_24px_-24px_rgba(47,145,208,0.28)]"
                          : "border-[#e4edf5] bg-white text-slate-700 hover:bg-[#fbfdff]"
                      }`}
                    >
                      <span className="min-w-0 truncate font-bold">
                        {element.type === "text" ? "Text" : element.type === "character" ? "Figure" : "Asset"}: {element.content || `Layer ${index + 1}`}
                      </span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeElement(element.id);
                        }}
                        className="ml-2 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
                        aria-label="Xóa layer"
                      >
                        ×
                      </button>
                    </button>
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
