"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Layers3,
  Minus,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  RotateCcw,
  Search,
  ShoppingCart,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { formatCurrency as formatPrice } from "@lego-shop/shared";
import type {
  CharacterBuilderQuoteResponseContract,
  CharacterPart,
  CharacterPartType,
  CharacterPreset,
} from "@lego-shop/shared";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { ROUTES, UI_MODAL_IDS } from "@/config/routes";
import { useCartStore, type CartItemPart } from "@/features/cart/store";
import { useUIStore } from "@/features/ui/store";
import { resolveApiAssetUrl } from "@/lib/api/assets";
import { publicApiClient } from "@/lib/api/public-client";
import { useI18n } from "@/lib/i18n/useI18n";

const BASE_CHARACTER_PRICE = 10000;
const REQUIRED_TYPES = ["FACE", "HAIR", "TORSO", "LEGS"] as const;
const PART_TABS = [
  "FACE",
  "HAIR",
  "TORSO",
  "LEGS",
  "HAT",
  "ACCESSORY",
] as const;
const LAYER_ORDER = [
  "LEGS",
  "TORSO",
  "FACE",
  "HAIR",
  "HAT",
  "ACCESSORY",
] as const;
const STEP_PART_TYPES: BuilderPartType[][] = [
  [],
  ["FACE"],
  ["HAIR", "HAT"],
  ["TORSO", "LEGS"],
  ["ACCESSORY"],
  [],
];

type BuilderPartType = (typeof PART_TABS)[number];

function getPartPrice(part: CharacterPart) {
  return Math.max(0, Math.round(part.priceAdjustment ?? 0));
}

function toSnapshot(part: CharacterPart) {
  return {
    id: part.id,
    name: part.name,
    type: part.type,
    imageUrl: part.imageUrl,
    priceAdjustment: getPartPrice(part),
  };
}

function openCartDrawer() {
  useCartStore.getState().openCart();
  useUIStore.getState().openModal(UI_MODAL_IDS.CART_DRAWER);
  window.dispatchEvent(new CustomEvent("legoshop:open-cart"));
}

function CharacterLayerPreview({
  emptyLabel,
  parts,
  scale,
}: {
  emptyLabel: string;
  parts: CharacterPart[];
  scale: number;
}) {
  const orderedParts = LAYER_ORDER.flatMap((type) =>
    parts.filter((part) => part.type === type),
  );

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px] overflow-hidden rounded-[24px] bg-[linear-gradient(145deg,#ffffff,#f1f5f9)] ring-1 ring-slate-200">
      <div
        className="absolute inset-0 origin-center transition-transform duration-200 motion-reduce:transition-none"
        style={{ transform: `scale(${scale})` }}
      >
        <Layers3 className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 text-slate-200" />
        {orderedParts.map((part) => {
          const src = resolveApiAssetUrl(part.imageUrl);
          if (!src) return null;

          return (
            <img
              key={part.id}
              src={src}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-contain"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          );
        })}
      </div>
      {orderedParts.length === 0 ? (
        <div className="absolute inset-x-6 bottom-8 text-center text-sm font-semibold text-slate-400">
          {emptyLabel}
        </div>
      ) : null}
    </div>
  );
}

export function CharacterBuilderShop({
  parts,
  presets = [],
  loading,
  standalone = false,
}: {
  parts: CharacterPart[];
  presets?: CharacterPreset[];
  loading: boolean;
  standalone?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dictionary } = useI18n();
  const copy = dictionary.characterBuilder;
  const catalogParts = useMemo(
    () =>
      parts.filter(
        (part) =>
          part.status === "active" &&
          part.isActive !== false,
      ),
    [parts],
  );
  const activeParts = useMemo(
    () =>
      catalogParts.filter(
        (part) =>
          !part.availability || part.availability === "available",
      ),
    [catalogParts],
  );
  const groupedParts = useMemo(() => {
    const groups = new Map<BuilderPartType, CharacterPart[]>();
    PART_TABS.forEach((type) => groups.set(type, []));
    catalogParts.forEach((part) => {
      groups.get(part.type as BuilderPartType)?.push(part);
    });
    return groups;
  }, [catalogParts]);
  const partById = useMemo(
    () => new Map(activeParts.map((part) => [part.id, part])),
    [activeParts],
  );

  const [activeTab, setActiveTab] = useState<BuilderPartType>("FACE");
  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [partSearch, setPartSearch] = useState("");
  const [previewScale, setPreviewScale] = useState(1);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [selectedByType, setSelectedByType] = useState<
    Partial<Record<CharacterPartType, string>>
  >({});
  const [accessoryIds, setAccessoryIds] = useState<string[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [quote, setQuote] =
    useState<CharacterBuilderQuoteResponseContract | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState(false);
  const editItemId = searchParams.get("edit");
  const hasRestoredEditRef = useRef(false);

  const resolvedSelectedByType = useMemo(() => {
    const next = { ...selectedByType };
    REQUIRED_TYPES.forEach((type) => {
      const currentPart = next[type]
        ? partById.get(next[type] as string)
        : null;
      if (!currentPart || currentPart.type !== type) delete next[type];
    });

    if (next.HAT && !partById.has(next.HAT)) {
      delete next.HAT;
    }
    return next;
  }, [partById, selectedByType]);
  const resolvedAccessoryIds = useMemo(
    () => accessoryIds.filter((id) => partById.has(id)),
    [accessoryIds, partById],
  );

  const selectedParts = useMemo(() => {
    const singleParts = LAYER_ORDER.filter((type) => type !== "ACCESSORY")
      .map((type) => {
        const id = resolvedSelectedByType[type];
        return id ? partById.get(id) : null;
      })
      .filter((part): part is CharacterPart => Boolean(part));
    const accessories = resolvedAccessoryIds
      .map((id) => partById.get(id))
      .filter((part): part is CharacterPart => Boolean(part));
    return [...singleParts, ...accessories];
  }, [partById, resolvedAccessoryIds, resolvedSelectedByType]);

  const isReady = REQUIRED_TYPES.every((type) => {
    const id = resolvedSelectedByType[type];
    return Boolean(id && partById.has(id));
  });
  const estimatedTotalPrice =
    BASE_CHARACTER_PRICE +
    selectedParts.reduce((sum, part) => sum + getPartPrice(part), 0);
  const totalPrice =
    (isReady ? quote?.totalPrice : undefined) ?? estimatedTotalPrice;

  useEffect(() => {
    if (!isReady) {
      const frame = window.requestAnimationFrame(() => {
        setQuote(null);
        setQuoteError(false);
        setQuoteLoading(false);
      });
      return () => window.cancelAnimationFrame(frame);
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setQuoteLoading(true);
      publicApiClient.products
        .quoteCharacterBuilder({
          partIds: selectedParts.map((part) => part.id),
        })
        .then((nextQuote) => {
          if (controller.signal.aborted) return;
          setQuote(nextQuote);
          setQuoteError(false);
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          setQuote(null);
          setQuoteError(true);
        })
        .finally(() => {
          if (!controller.signal.aborted) setQuoteLoading(false);
        });
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [isReady, selectedParts]);

  useEffect(() => {
    if (!editItemId || hasRestoredEditRef.current || activeParts.length === 0) {
      return;
    }
    const item = useCartStore
      .getState()
      .items.find((cartItem) => cartItem.id === editItemId);
    if (!item || item.designData.type !== "CUSTOM_CHARACTER") return;

    const character =
      item.designData.character &&
      typeof item.designData.character === "object" &&
      !Array.isArray(item.designData.character)
        ? (item.designData.character as Record<string, unknown>)
        : null;
    if (!character) return;

    const nextSelection: Partial<Record<CharacterPartType, string>> = {};
    for (const type of ["FACE", "HAIR", "TORSO", "LEGS", "HAT"] as const) {
      const field = `${type.toLowerCase()}Id`;
      const value = character[field];
      if (typeof value === "string" && partById.has(value)) {
        nextSelection[type] = value;
      }
    }
    const nextAccessories = Array.isArray(character.accessoryIds)
      ? character.accessoryIds.filter(
          (id): id is string => typeof id === "string" && partById.has(id),
        )
      : [];
    hasRestoredEditRef.current = true;
    const frame = window.requestAnimationFrame(() => {
      setSelectedByType(nextSelection);
      setAccessoryIds(nextAccessories);
      setName(typeof character.name === "string" ? character.name : "");
      setNote(typeof item.note === "string" ? item.note : "");
      setQuantity(Math.min(10, Math.max(1, item.quantity || 1)));
      setActiveStep(5);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      hasRestoredEditRef.current = false;
    };
  }, [activeParts.length, editItemId, partById]);

  const resetBuilder = () => {
    setSelectedByType({});
    setAccessoryIds([]);
    setActivePresetId(null);
    setActiveTab("FACE");
    setActiveStep(0);
    setPartSearch("");
    setPreviewScale(1);
  };

  const applyPreset = useCallback((preset: CharacterPreset) => {
    const next: Partial<Record<CharacterPartType, string>> = {};
    if (preset.facePartId) next.FACE = preset.facePartId;
    if (preset.hairPartId) next.HAIR = preset.hairPartId;
    if (preset.torsoPartId) next.TORSO = preset.torsoPartId;
    if (preset.legsPartId) next.LEGS = preset.legsPartId;
    if (preset.hatPartId) next.HAT = preset.hatPartId;
    setSelectedByType(next);
    setAccessoryIds(
      preset.accessories
        ?.map((accessory) => accessory.partId)
        .filter((id) => partById.has(id)) ?? [],
    );
    setName(preset.name);
    setActivePresetId(preset.id);
    setActiveTab("FACE");
    setActiveStep(1);
  }, [partById]);

  useEffect(() => {
    const presetId = searchParams.get("preset");
    if (!presetId || activeParts.length === 0 || activePresetId === presetId) {
      return;
    }
    const preset = presets.find((candidate) => candidate.id === presetId);
    if (!preset) return;

    const frame = window.requestAnimationFrame(() => applyPreset(preset));
    return () => window.cancelAnimationFrame(frame);
  }, [
    activeParts.length,
    activePresetId,
    applyPreset,
    presets,
    searchParams,
  ]);

  const goToStep = (step: number) => {
    const nextStep = Math.max(0, Math.min(copy.steps.length - 1, step));
    setActiveStep(nextStep);
    const firstType = STEP_PART_TYPES[nextStep]?.[0];
    if (firstType) setActiveTab(firstType);
    setPartSearch("");
  };

  const togglePart = (part: CharacterPart) => {
    if (part.availability && part.availability !== "available") return;
    if (part.type === "ACCESSORY") {
      setAccessoryIds((current) => {
        const validIds = current.filter((id) => partById.has(id));
        return validIds.includes(part.id)
          ? validIds.filter((id) => id !== part.id)
          : [...validIds, part.id];
      });
      return;
    }

    setSelectedByType((current) => {
      const next = { ...current };
      if (next.HAT && !partById.has(next.HAT)) delete next.HAT;

      if (part.type === "HAT" && next.HAT === part.id) {
        delete next.HAT;
        return next;
      }
      return { ...next, [part.type]: part.id };
    });
  };

  const isSelected = (part: CharacterPart) =>
    part.type === "ACCESSORY"
      ? resolvedAccessoryIds.includes(part.id)
      : resolvedSelectedByType[part.type] === part.id;

  const addCharacterToCart = async (buyNow = false) => {
    if (!isReady) return;

    setQuoteLoading(true);
    let verifiedQuote: CharacterBuilderQuoteResponseContract;
    try {
      verifiedQuote = await publicApiClient.products.quoteCharacterBuilder({
        partIds: selectedParts.map((part) => part.id),
      });
      setQuote(verifiedQuote);
      setQuoteError(false);
    } catch {
      setQuoteError(true);
      setQuoteLoading(false);
      return;
    }
    setQuoteLoading(false);

    const displayName = name.trim() || copy.customCharacter;
    const face = partById.get(resolvedSelectedByType.FACE as string);
    const hair = partById.get(resolvedSelectedByType.HAIR as string);
    const torso = partById.get(resolvedSelectedByType.TORSO as string);
    const legs = partById.get(resolvedSelectedByType.LEGS as string);
    if (!face || !hair || !torso || !legs) return;

    const hat = resolvedSelectedByType.HAT
      ? partById.get(resolvedSelectedByType.HAT)
      : undefined;
    const accessories = resolvedAccessoryIds
      .map((id) => partById.get(id))
      .filter((part): part is CharacterPart => Boolean(part));
    const cartParts: CartItemPart[] = [
      {
        type: "character",
        name: copy.characterBody,
        quantity: 1,
        unitPrice: BASE_CHARACTER_PRICE,
        totalPrice: BASE_CHARACTER_PRICE,
        imageUrl: resolveApiAssetUrl(face.imageUrl),
      },
      ...selectedParts.map((part) => ({
        id: part.id,
        type: "character_part" as const,
        name: part.name,
        quantity: 1,
        unitPrice: getPartPrice(part),
        totalPrice: getPartPrice(part),
        imageUrl: resolveApiAssetUrl(part.imageUrl),
      })),
    ];

    const characterParts = {
      FACE: toSnapshot(face),
      HAIR: toSnapshot(hair),
      TORSO: toSnapshot(torso),
      LEGS: toSnapshot(legs),
      ...(hat ? { HAT: toSnapshot(hat) } : {}),
      ACCESSORY: accessories.map(toSnapshot),
    };

    const cartItem = {
      productId: null,
      lineItemType: "custom_character" as const,
      productType: "custom_character",
      customName: displayName,
      productName: displayName,
      quantity,
      unitPrice: verifiedQuote.totalPrice,
      serverValidatedPrice: verifiedQuote.totalPrice,
      frameSizeId: "",
      frameSizeLabel: copy.customFrameLabel,
      frameColorName: "",
      note: note.trim(),
      parts: cartParts,
      designData: {
        type: "CUSTOM_CHARACTER",
        source: "character_builder",
        presetId: activePresetId,
        partIds: selectedParts.map((part) => part.id),
        basePrice: verifiedQuote.basePrice,
        priceQuote: {
          quotedAt: new Date().toISOString(),
          totalPrice: verifiedQuote.totalPrice,
        },
        character: {
          name: displayName,
          faceId: face.id,
          hairId: hair.id,
          torsoId: torso.id,
          legsId: legs.id,
          hatId: hat?.id ?? null,
          accessoryIds: accessories.map((part) => part.id),
          characterParts,
        },
        characters: [
          {
            id: `character-${Date.now()}`,
            name: displayName,
            faceId: face.id,
            hairId: hair.id,
            torsoId: torso.id,
            legsId: legs.id,
            hatId: hat?.id ?? null,
            accessoryIds: accessories.map((part) => part.id),
            characterParts,
            price: verifiedQuote.totalPrice,
          },
        ],
      },
      previewUrl: resolveApiAssetUrl(face.imageUrl),
    };
    if (editItemId) {
      useCartStore.getState().updateItem(editItemId, cartItem);
      toast.success(copy.updateSuccess);
    } else {
      useCartStore.getState().addItem(cartItem);
      toast.success(copy.cartSuccess);
    }
    if (buyNow) {
      router.push(ROUTES.checkout);
    } else {
      openCartDrawer();
    }
  };

  if (loading) {
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(320px,0.9fr)_1.1fr]">
        <div className="aspect-square animate-pulse bg-slate-200" />
        <div className="space-y-4 py-4">
          <div className="h-8 w-52 animate-pulse rounded bg-slate-200" />
          <div className="h-12 animate-pulse rounded bg-slate-200" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square animate-pulse bg-slate-200"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!catalogParts.length) {
    return (
      <div className="border border-slate-200 bg-white px-6 py-16 text-center">
        <Layers3 className="mx-auto mb-4 h-10 w-10 text-slate-300" />
        <p className="font-bold text-slate-900">{copy.emptyTitle}</p>
        <p className="mt-2 text-sm text-slate-500">{copy.emptyDescription}</p>
      </div>
    );
  }

  const visibleParts = (groupedParts.get(activeTab) ?? [])
    .filter((part) => {
      const normalizedSearch = partSearch.trim().toLocaleLowerCase();
      if (!normalizedSearch) return true;
      return `${part.name} ${part.category ?? ""} ${(Array.isArray(part.tags) ? part.tags : []).join(" ")}`
        .toLocaleLowerCase()
        .includes(normalizedSearch);
    })
    .slice(0, 60);
  const currentStepPartTypes = STEP_PART_TYPES[activeStep] ?? [];
  const canContinue =
    activeStep === 0 ||
    (activeStep === 1 && Boolean(resolvedSelectedByType.FACE)) ||
    (activeStep === 2 && Boolean(resolvedSelectedByType.HAIR)) ||
    (activeStep === 3 &&
      Boolean(resolvedSelectedByType.TORSO) &&
      Boolean(resolvedSelectedByType.LEGS)) ||
    activeStep >= 4;

  const getPresetPrice = (preset: CharacterPreset) => {
    const ids = [
      preset.facePartId,
      preset.hairPartId,
      preset.torsoPartId,
      preset.legsPartId,
      preset.hatPartId,
      ...(preset.accessories?.map((accessory) => accessory.partId) ?? []),
    ].filter((id): id is string => Boolean(id));
    return (
      BASE_CHARACTER_PRICE +
      ids.reduce((sum, id) => {
        const part = partById.get(id);
        return sum + (part ? getPartPrice(part) : 0);
      }, 0)
    );
  };

  return (
    <div
      className={`relative grid items-start gap-7 transition-[grid-template-columns] duration-300 motion-reduce:transition-none ${
        standalone && panelCollapsed
          ? "xl:grid-cols-[minmax(0,760px)] xl:justify-center"
          : standalone
            ? "xl:grid-cols-[minmax(380px,1fr)_minmax(420px,480px)] xl:gap-9"
            : "lg:grid-cols-[minmax(340px,0.92fr)_minmax(0,1.08fr)] lg:gap-10"
      }`}
    >
      <section className="min-w-0 lg:sticky lg:top-24">
        <div className="relative">
          <CharacterLayerPreview
            emptyLabel={copy.previewEmpty}
            parts={selectedParts}
            scale={previewScale}
          />
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur">
            <button
              type="button"
              onClick={() =>
                setPreviewScale((current) =>
                  Math.max(0.8, Number((current - 0.1).toFixed(1))),
                )
              }
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary"
              aria-label={copy.zoomOut}
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewScale(1)}
              className="h-10 min-w-14 rounded-full px-2 text-xs font-extrabold text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary"
            >
              {copy.fitPreview}
            </button>
            <button
              type="button"
              onClick={() =>
                setPreviewScale((current) =>
                  Math.min(1.4, Number((current + 0.1).toFixed(1))),
                )
              }
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary"
              aria-label={copy.zoomIn}
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4 rounded-[20px] border border-slate-200 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">
              {copy.price}
            </p>
            <p className="mt-1 text-2xl font-extrabold text-slate-950">
              {formatPrice(totalPrice)}
            </p>
            <p className="mt-1 min-h-5 text-xs font-semibold text-slate-500">
              {quoteLoading
                ? copy.quoting
                : quoteError
                  ? copy.quoteError
                  : quote
                    ? copy.verifiedPrice
                    : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={resetBuilder}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-primary hover:text-primary"
            title={copy.reset}
            aria-label={copy.reset}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </section>

      {panelCollapsed ? (
        <button
          type="button"
          onClick={() => setPanelCollapsed(false)}
          className="absolute right-0 top-8 hidden h-12 w-12 translate-x-1/2 items-center justify-center rounded-full border border-[#cfe1ed] bg-white text-primary shadow-sm transition-transform hover:-translate-y-0.5 xl:inline-flex"
          aria-label={copy.showTools}
          title={copy.showTools}
        >
          <PanelRightOpen className="h-5 w-5" />
        </button>
      ) : (
        <section className="relative min-w-0 overflow-hidden rounded-[26px] border border-[#d6e4ee] bg-white shadow-[0_18px_55px_rgba(15,39,67,0.08)]">
          <button
            type="button"
            onClick={() => setPanelCollapsed(true)}
            className="absolute left-0 top-16 z-10 hidden h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-[#cfe1ed] bg-white text-primary shadow-sm transition-transform hover:-translate-y-0.5 xl:inline-flex"
            aria-label={copy.hideTools}
            title={copy.hideTools}
          >
            <PanelRightClose className="h-5 w-5" />
          </button>

          <header className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                  {copy.eyebrow}
                </p>
                <h2 className="mt-1.5 text-xl font-black text-slate-950 sm:text-2xl">
                  {copy.title}
                </h2>
                <p className="mt-1.5 text-sm leading-5 text-slate-500">
                  {copy.description}
                </p>
              </div>
              <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>

            <ol className="mt-5 grid grid-cols-6 gap-1" aria-label={copy.title}>
              {copy.steps.map((label, index) => {
                const completed = index < activeStep;
                const active = index === activeStep;
                return (
                  <li key={label} className="min-w-0">
                    <button
                      type="button"
                      onClick={() => goToStep(index)}
                      className="group flex w-full flex-col items-center gap-1.5"
                      aria-current={active ? "step" : undefined}
                    >
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-black transition-colors ${
                          completed
                            ? "border-primary bg-primary text-white"
                            : active
                              ? "border-primary bg-[#e8f6fd] text-primary"
                              : "border-slate-200 bg-white text-slate-400 group-hover:border-[#9bcfee]"
                        }`}
                      >
                        {completed ? <Check className="h-4 w-4" /> : index + 1}
                      </span>
                      <span
                        className={`hidden max-w-full truncate text-[10px] font-bold sm:block ${
                          active ? "text-primary" : "text-slate-400"
                        }`}
                      >
                        {label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </header>

          <div className="custom-scrollbar max-h-[min(620px,calc(100vh-280px))] min-h-[390px] overflow-y-auto px-5 py-5 sm:px-6">
            {activeStep === 0 ? (
              <div>
                <h3 className="text-base font-black text-navy">
                  {copy.startTitle}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {copy.startDescription}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={resetBuilder}
                    className={`min-h-[132px] rounded-[18px] border p-4 text-left transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 ${
                      activePresetId === null
                        ? "border-primary bg-[#edf8fe]"
                        : "border-[#d8e5ee] bg-white hover:border-[#9bcfee]"
                    }`}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary ring-1 ring-slate-200">
                      <Layers3 className="h-5 w-5" />
                    </span>
                    <span className="mt-3 block text-sm font-black text-navy">
                      {copy.blankCharacter}
                    </span>
                    <span className="mt-1 block text-xs font-medium text-slate-500">
                      {copy.blankDescription}
                    </span>
                  </button>
                  {presets.map((preset) => {
                    const preview = resolveApiAssetUrl(preset.previewImageUrl);
                    const componentCount =
                      [
                        preset.facePartId,
                        preset.hairPartId,
                        preset.hatPartId,
                        preset.torsoPartId,
                        preset.legsPartId,
                      ].filter(Boolean).length +
                      (preset.accessories?.length ?? 0);
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className={`group min-h-[132px] overflow-hidden rounded-[18px] border text-left transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 ${
                          activePresetId === preset.id
                            ? "border-primary bg-[#edf8fe]"
                            : "border-[#d8e5ee] bg-white hover:border-[#9bcfee]"
                        }`}
                      >
                        <span className="flex gap-3 p-3">
                          <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[14px] bg-slate-50">
                            {preview ? (
                              <img
                                src={preview}
                                alt=""
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <Layers3 className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-slate-300" />
                            )}
                          </span>
                          <span className="min-w-0 pt-1">
                            <span className="block truncate text-sm font-black text-navy">
                              {preset.name}
                            </span>
                            <span className="mt-1 block text-xs font-semibold text-primary">
                              {formatPrice(getPresetPrice(preset))}
                            </span>
                            <span className="mt-1 block text-[11px] font-medium text-slate-500">
                              {componentCount} {copy.components}
                            </span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {activeStep >= 1 && activeStep <= 4 ? (
              <div>
                {currentStepPartTypes.length > 1 ? (
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    {currentStepPartTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setActiveTab(type)}
                        className={`min-h-11 rounded-[13px] border px-3 text-sm font-extrabold transition-colors ${
                          activeTab === type
                            ? "border-primary bg-[#e8f6fd] text-primary"
                            : "border-slate-200 bg-white text-slate-600 hover:border-[#9bcfee]"
                        }`}
                      >
                        {copy.tabs[type]}
                      </button>
                    ))}
                  </div>
                ) : null}

                <label className="relative mb-4 block">
                  <span className="sr-only">{copy.searchParts}</span>
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={partSearch}
                    onChange={(event) => setPartSearch(event.target.value)}
                    placeholder={copy.searchParts}
                    className="form-control form-control--compact pl-11 pr-4 text-sm font-semibold"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {visibleParts.map((part) => {
                    const selected = isSelected(part);
                    const src = resolveApiAssetUrl(part.imageUrl);
                    const unavailable =
                      Boolean(part.availability) &&
                      part.availability !== "available";
                    return (
                      <button
                        key={part.id}
                        type="button"
                        disabled={unavailable}
                        onClick={() => togglePart(part)}
                        className={`group relative min-w-0 rounded-[16px] border bg-white p-3 text-left transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 ${
                          selected
                            ? "border-primary bg-[#f4fbff]"
                            : "border-slate-200 hover:border-[#9bcfee]"
                        }`}
                      >
                        <span className="relative block aspect-square overflow-hidden rounded-[12px] bg-slate-50">
                          {src ? (
                            <img
                              src={src}
                              alt={part.name}
                              className="h-full w-full object-contain"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <Layers3 className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-slate-300" />
                          )}
                        </span>
                        <span className="mt-2 block truncate text-xs font-black text-slate-900">
                          {part.name}
                        </span>
                        <span className="mt-1 block text-[11px] font-bold text-slate-500">
                          {unavailable
                            ? copy.availability.unavailable
                            : getPartPrice(part) > 0
                              ? `+${formatPrice(getPartPrice(part))}`
                              : copy.included}
                        </span>
                        {selected ? (
                          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                  {!visibleParts.length ? (
                    <p className="col-span-full py-12 text-center text-sm font-semibold text-slate-400">
                      {copy.noParts}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {activeStep === 5 ? (
              <div className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-navy">
                    {copy.name}
                  </span>
                  <input
                    value={name}
                    placeholder={copy.defaultName}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={60}
                    className="form-control px-4 text-sm font-semibold"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-navy">
                    {copy.note}
                  </span>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder={copy.notePlaceholder}
                    maxLength={500}
                    rows={4}
                    className="form-control h-auto min-h-28 resize-y px-4 py-3 text-sm font-semibold"
                  />
                </label>
                <div>
                  <span className="mb-2 block text-sm font-extrabold text-navy">
                    {copy.quantity}
                  </span>
                  <div className="inline-flex min-h-12 items-center rounded-full border border-slate-200 bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((current) => Math.max(1, current - 1))
                      }
                      disabled={quantity <= 1}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 transition-colors hover:text-primary disabled:text-slate-300"
                      aria-label="-"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-12 text-center text-sm font-black text-navy">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((current) => Math.min(10, current + 1))
                      }
                      disabled={quantity >= 10}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 transition-colors hover:text-primary disabled:text-slate-300"
                      aria-label="+"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <footer className="border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                  {copy.price}
                </p>
                <p className="mt-0.5 text-xl font-black text-navy">
                  {formatPrice(totalPrice)}
                </p>
              </div>
              <p className="text-right text-xs font-semibold text-slate-500">
                {quoteLoading
                  ? copy.quoting
                  : quoteError
                    ? copy.quoteError
                    : quote
                      ? copy.verifiedPrice
                      : ""}
              </p>
            </div>

            {activeStep < 5 ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={activeStep === 0}
                  onClick={() => goToStep(activeStep - 1)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[15px] border border-[#cfe1ed] bg-white px-4 text-sm font-extrabold text-navy transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {copy.previousStep}
                </button>
                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={() => goToStep(activeStep + 1)}
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-[15px] bg-primary px-4 text-sm font-extrabold text-white transition-[background-color,transform] hover:bg-primary-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {activeStep === 4 ? copy.finishStep : copy.nextStep}
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => goToStep(4)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[15px] border border-[#cfe1ed] bg-white px-4 text-sm font-extrabold text-navy transition-colors hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {copy.previousStep}
                </button>
                <button
                  type="button"
                  disabled={!isReady || quoteLoading}
                  onClick={() => void addCharacterToCart(false)}
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-[15px] bg-primary px-4 text-sm font-extrabold text-white transition-[background-color,transform] hover:bg-primary-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {editItemId ? copy.updateCart : copy.addToCart}
                </button>
                <button
                  type="button"
                  disabled={!isReady || quoteLoading}
                  onClick={() => void addCharacterToCart(true)}
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-[15px] border border-primary bg-white px-4 text-sm font-extrabold text-primary transition-[background-color,transform] hover:bg-[#edf8fe] active:scale-[0.99] disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 sm:col-span-2"
                >
                  {copy.buyNow}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            )}
          </footer>
        </section>
      )}
    </div>
  );
}
