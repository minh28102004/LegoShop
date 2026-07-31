"use client";

import { formatCurrency as formatPrice } from "@lego-shop/shared";
import type {
  CharacterBuilderQuoteResponseContract,
  CharacterPart,
  CharacterPartType,
  CharacterPreset,
} from "@lego-shop/shared";
import { motion } from "framer-motion";
import {
  Crown,
  CircleOff,
  Footprints,
  LayoutTemplate,
  Minus,
  PackageOpen,
  Plus,
  RotateCcw,
  Search,
  Shirt,
  ShoppingCart,
  Smile,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import { Select } from "@/components/ui/Select";
import { ROUTES, UI_MODAL_IDS } from "@/config/routes";
import { useCartStore, type CartItemPart } from "@/features/cart/store";
import { useUIStore } from "@/features/ui/store";
import { resolveApiAssetUrl } from "@/lib/api/assets";
import { publicApiClient } from "@/lib/api/public-client";
import { useI18n } from "@/lib/i18n/useI18n";

import {
  CharacterEmptyState,
  CharacterPartGrid,
  CharacterPartSkeleton,
} from "./CharacterPartGrid";
import { CharacterPreview } from "./CharacterPreview";
import {
  BUILDER_PART_TYPES,
  CHARACTER_LAYER_ORDER,
  getPartPrice,
  HEADWEAR_PART_TYPES,
  PROGRESS_PART_TYPES,
  REQUIRED_PART_TYPES,
  toPartSnapshot,
  type BuilderCategory,
  type CharacterSelection,
} from "./types";

function openCartDrawer() {
  useCartStore.getState().openCart();
  useUIStore.getState().openModal(UI_MODAL_IDS.CART_DRAWER);
  window.dispatchEvent(new CustomEvent("legoshop:open-cart"));
}

function randomItem<T>(items: readonly T[]) {
  if (!items.length) return null;
  return items[Math.floor(Math.random() * items.length)] ?? null;
}

function delay(duration: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

const CHARACTER_BASE_PRICE = 10_000;

function AnimatedPriceValue({ amount }: { amount: number }) {
  const formattedAmount = formatPrice(amount);

  return (
    <span
      data-character-price-value="true"
      className="relative inline-grid overflow-hidden tabular-nums"
    >
      <motion.span
        key={amount}
        initial={{ opacity: 0.55, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="col-start-1 row-start-1"
      >
        {formattedAmount}
      </motion.span>
    </span>
  );
}

export function CharacterBuilderShop({
  error = false,
  loading,
  onRetry,
  parts,
  presets = [],
}: {
  error?: boolean;
  loading: boolean;
  onRetry?: () => void;
  parts: CharacterPart[];
  presets?: CharacterPreset[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dictionary } = useI18n();
  const copy = dictionary.characterBuilder;

  const catalogParts = useMemo(
    () =>
      parts.filter(
        (part) => part.status === "active" && part.isActive !== false,
      ),
    [parts],
  );
  const activeParts = useMemo(
    () =>
      catalogParts.filter(
        (part) => !part.availability || part.availability === "available",
      ),
    [catalogParts],
  );
  const groupedParts = useMemo(() => {
    const groups = new Map<CharacterPartType, CharacterPart[]>();
    BUILDER_PART_TYPES.forEach((type) => groups.set(type, []));
    catalogParts.forEach((part) => {
      groups.get(part.type)?.push(part);
    });
    return groups;
  }, [catalogParts]);
  const activeGroupedParts = useMemo(() => {
    const groups = new Map<CharacterPartType, CharacterPart[]>();
    BUILDER_PART_TYPES.forEach((type) => groups.set(type, []));
    activeParts.forEach((part) => {
      groups.get(part.type)?.push(part);
    });
    return groups;
  }, [activeParts]);
  const partById = useMemo(
    () => new Map(activeParts.map((part) => [part.id, part])),
    [activeParts],
  );
  const availablePresets = useMemo(
    () =>
      presets.filter(
        (preset) =>
          preset.status === "active" && preset.isBuilderPreset !== false,
      ),
    [presets],
  );

  const [activeCategory, setActiveCategory] =
    useState<BuilderCategory>("PRESET");
  const [activeSubcategory, setActiveSubcategory] = useState("ALL");
  const [partSearch, setPartSearch] = useState("");
  const [name, setName] = useState("NV 1");
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [flipped, setFlipped] = useState(false);
  const [selectedByType, setSelectedByType] = useState<CharacterSelection>({});
  const [accessoryIds, setAccessoryIds] = useState<string[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [randomizing, setRandomizing] = useState(false);
  const [resetArmed, setResetArmed] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [quote, setQuote] =
    useState<CharacterBuilderQuoteResponseContract | null>(null);
  const [quoteSelectionKey, setQuoteSelectionKey] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState(false);

  const editItemId = searchParams.get("edit");
  const hasRestoredEditRef = useRef(false);
  const resetTimerRef = useRef<number | null>(null);

  const resolvedSelectedByType = useMemo(() => {
    const next: CharacterSelection = {};
    for (const type of BUILDER_PART_TYPES) {
      if (type === "ACCESSORY") continue;
      const id = selectedByType[type];
      const part = id ? partById.get(id) : null;
      if (part?.type === type) next[type] = part.id;
    }
    return next;
  }, [partById, selectedByType]);
  const resolvedAccessoryIds = useMemo(
    () => accessoryIds.filter((id) => partById.get(id)?.type === "ACCESSORY"),
    [accessoryIds, partById],
  );
  const selectedParts = useMemo(() => {
    const singleParts = CHARACTER_LAYER_ORDER.filter(
      (type) => type !== "ACCESSORY",
    )
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
  const selectedIds = useMemo(
    () => new Set(selectedParts.map((part) => part.id)),
    [selectedParts],
  );
  const selectedPartIds = useMemo(
    () => selectedParts.map((part) => part.id),
    [selectedParts],
  );
  const selectionKey = selectedPartIds.join("|");
  const progress = useMemo(() => {
    const completed = new Set<CharacterPartType>();
    for (const type of BUILDER_PART_TYPES) {
      if (type === "HAIR") {
        if (resolvedSelectedByType.HAIR || resolvedSelectedByType.HAT) {
          completed.add("HAIR");
        }
        continue;
      }
      if (type === "HAT") continue;
      if (type === "ACCESSORY") {
        if (resolvedAccessoryIds.length) completed.add(type);
      } else if (resolvedSelectedByType[type]) {
        completed.add(type);
      }
    }
    return completed;
  }, [resolvedAccessoryIds.length, resolvedSelectedByType]);
  const missingRequiredTypes = REQUIRED_PART_TYPES.filter(
    (type) => !resolvedSelectedByType[type],
  );
  const isReady = missingRequiredTypes.length === 0;
  const partsEstimate =
    CHARACTER_BASE_PRICE +
    selectedParts.reduce((sum, part) => sum + getPartPrice(part), 0);
  const totalPrice =
    quote && quoteSelectionKey === selectionKey
      ? quote.totalPrice
      : partsEstimate;

  useEffect(() => {
    if (!isReady) {
      const frame = window.requestAnimationFrame(() => {
        setQuote(null);
        setQuoteSelectionKey("");
        setQuoteError(false);
        setQuoteLoading(false);
      });
      return () => window.cancelAnimationFrame(frame);
    }

    const controller = new AbortController();
    const resetFrame = window.requestAnimationFrame(() => {
      setQuoteError(false);
      setQuoteLoading(true);
    });
    const timeout = window.setTimeout(() => {
      publicApiClient.products
        .quoteCharacterBuilder({
          partIds: selectedPartIds,
        })
        .then((nextQuote) => {
          if (controller.signal.aborted) return;
          setQuote(nextQuote);
          setQuoteSelectionKey(selectionKey);
          setQuoteError(false);
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          setQuoteSelectionKey("");
          setQuoteError(true);
        })
        .finally(() => {
          if (!controller.signal.aborted) setQuoteLoading(false);
        });
    }, 180);

    return () => {
      controller.abort();
      window.cancelAnimationFrame(resetFrame);
      window.clearTimeout(timeout);
    };
  }, [isReady, selectedPartIds, selectionKey]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedByType({});
    setAccessoryIds([]);
    setActivePresetId(null);
    setActiveCategory("PRESET");
    setActiveSubcategory("ALL");
    setPartSearch("");
    setName("NV 1");
    setQuantity(1);
    setNote("");
    setFlipped(false);
    setValidationAttempted(false);
    setResetArmed(false);
    setAnimationKey((current) => current + 1);
  }, []);

  const applyPreset = useCallback(
    (preset: CharacterPreset) => {
      const next: CharacterSelection = {};
      const candidates: Array<[CharacterPartType, string | null | undefined]> =
        [
          ["FACE", preset.facePartId],
          ["TORSO", preset.torsoPartId],
          ["LEGS", preset.legsPartId],
        ];
      candidates.forEach(([type, id]) => {
        if (id && partById.get(id)?.type === type) next[type] = id;
      });
      if (preset.hatPartId && partById.get(preset.hatPartId)?.type === "HAT") {
        next.HAT = preset.hatPartId;
      } else if (
        preset.hairPartId &&
        partById.get(preset.hairPartId)?.type === "HAIR"
      ) {
        next.HAIR = preset.hairPartId;
      }
      setSelectedByType(next);
      setAccessoryIds(
        preset.accessories
          ?.map((accessory) => accessory.partId)
          .filter((id) => partById.get(id)?.type === "ACCESSORY")
          .slice(0, 1) ?? [],
      );
      setName(preset.name || "NV 1");
      setActivePresetId(preset.id);
      setValidationAttempted(false);
      setAnimationKey((current) => current + 1);
    },
    [partById],
  );

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

    const nextSelection: CharacterSelection = {};
    for (const type of ["FACE", "TORSO", "LEGS"] as const) {
      const value = character[`${type.toLowerCase()}Id`];
      if (typeof value === "string" && partById.get(value)?.type === type) {
        nextSelection[type] = value;
      }
    }
    const restoredHatId = character.hatId;
    const restoredHairId = character.hairId;
    if (
      typeof restoredHatId === "string" &&
      partById.get(restoredHatId)?.type === "HAT"
    ) {
      nextSelection.HAT = restoredHatId;
    } else if (
      typeof restoredHairId === "string" &&
      partById.get(restoredHairId)?.type === "HAIR"
    ) {
      nextSelection.HAIR = restoredHairId;
    }
    const nextAccessories = Array.isArray(character.accessoryIds)
      ? character.accessoryIds.filter(
          (id): id is string =>
            typeof id === "string" && partById.get(id)?.type === "ACCESSORY",
        )
      : [];

    hasRestoredEditRef.current = true;
    const frame = window.requestAnimationFrame(() => {
      setSelectedByType(nextSelection);
      setAccessoryIds(nextAccessories);
      setName(
        typeof character.name === "string" && character.name.trim()
          ? character.name
          : "NV 1",
      );
      setNote(typeof item.note === "string" ? item.note : "");
      setQuantity(Math.min(10, Math.max(1, item.quantity || 1)));
      setActiveCategory("FACE");
      setAnimationKey((current) => current + 1);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeParts.length, editItemId, partById]);

  useEffect(() => {
    const presetId = searchParams.get("preset");
    if (!presetId || activeParts.length === 0 || activePresetId === presetId) {
      return;
    }
    const preset = availablePresets.find(
      (candidate) => candidate.id === presetId,
    );
    if (!preset) return;
    const frame = window.requestAnimationFrame(() => applyPreset(preset));
    return () => window.cancelAnimationFrame(frame);
  }, [
    activeParts.length,
    activePresetId,
    applyPreset,
    availablePresets,
    searchParams,
  ]);

  const selectCategory = (category: BuilderCategory) => {
    setActiveCategory(category);
    setActiveSubcategory("ALL");
    setPartSearch("");
  };

  const togglePart = (part: CharacterPart) => {
    if (part.availability && part.availability !== "available") return;
    setActivePresetId(null);
    setValidationAttempted(false);
    if (part.type === "ACCESSORY") {
      setAccessoryIds((current) =>
        current.includes(part.id) ? [] : [part.id],
      );
    } else {
      setSelectedByType((current) => {
        if (part.type === "HAIR" || part.type === "HAT") {
          const alreadySelected = current[part.type] === part.id;
          const next = { ...current };
          delete next.HAIR;
          delete next.HAT;
          if (!alreadySelected) next[part.type] = part.id;
          return next;
        }
        return { ...current, [part.type]: part.id };
      });
    }
    setAnimationKey((current) => current + 1);
  };

  const clearActivePart = () => {
    setActivePresetId(null);
    setValidationAttempted(false);
    if (activeCategory === "ACCESSORY") {
      setAccessoryIds([]);
    } else if (activeCategory === "HEADWEAR") {
      setSelectedByType((current) => {
        const next = { ...current };
        delete next.HAIR;
        delete next.HAT;
        return next;
      });
    }
    setAnimationKey((current) => current + 1);
  };

  const randomizeCharacter = async () => {
    if (randomizing || activeParts.length === 0) return;
    setRandomizing(true);
    setActivePresetId(null);
    setValidationAttempted(false);

    for (const type of ["FACE", "TORSO", "LEGS"] as const) {
      const part = randomItem(activeGroupedParts.get(type) ?? []);
      if (part) {
        setSelectedByType((current) => ({ ...current, [type]: part.id }));
        setAnimationKey((current) => current + 1);
      }
      await delay(65);
    }

    const headwear = randomItem(
      HEADWEAR_PART_TYPES.flatMap((type) => activeGroupedParts.get(type) ?? []),
    );
    setSelectedByType((current) => {
      const next = { ...current };
      delete next.HAIR;
      delete next.HAT;
      if (headwear) next[headwear.type] = headwear.id;
      return next;
    });
    setAnimationKey((current) => current + 1);
    await delay(65);

    const accessory = randomItem(activeGroupedParts.get("ACCESSORY") ?? []);
    setAccessoryIds(accessory ? [accessory.id] : []);
    setAnimationKey((current) => current + 1);
    await delay(80);
    setRandomizing(false);
  };

  const handleReset = () => {
    if (selectedParts.length < 3 || resetArmed) {
      clearSelection();
      return;
    }
    setResetArmed(true);
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = window.setTimeout(() => {
      setResetArmed(false);
      resetTimerRef.current = null;
    }, 3200);
  };

  const addCharacterToCart = async () => {
    if (!isReady) {
      setValidationAttempted(true);
      const firstMissing = missingRequiredTypes[0];
      if (firstMissing) selectCategory(firstMissing);
      toast.error(copy.missingParts);
      return;
    }

    setQuoteLoading(true);
    let verifiedQuote: CharacterBuilderQuoteResponseContract;
    try {
      verifiedQuote = await publicApiClient.products.quoteCharacterBuilder({
        partIds: selectedParts.map((part) => part.id),
      });
      if (!verifiedQuote.valid) throw new Error("Invalid character quote");
      setQuote(verifiedQuote);
      setQuoteError(false);
    } catch {
      setQuoteError(true);
      setQuoteLoading(false);
      return;
    }
    setQuoteLoading(false);

    const face = partById.get(resolvedSelectedByType.FACE as string);
    const hair = resolvedSelectedByType.HAIR
      ? partById.get(resolvedSelectedByType.HAIR)
      : undefined;
    const torso = partById.get(resolvedSelectedByType.TORSO as string);
    const legs = partById.get(resolvedSelectedByType.LEGS as string);
    if (!face || !torso || !legs) return;
    const hat = resolvedSelectedByType.HAT
      ? partById.get(resolvedSelectedByType.HAT)
      : undefined;
    const accessories = resolvedAccessoryIds
      .map((id) => partById.get(id))
      .filter((part): part is CharacterPart => Boolean(part));
    const displayName = name.trim() || copy.defaultName;

    const cartParts: CartItemPart[] = [
      {
        type: "character",
        name: copy.characterBody,
        quantity: 1,
        unitPrice: verifiedQuote.basePrice,
        totalPrice: verifiedQuote.basePrice,
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
      FACE: toPartSnapshot(face),
      ...(hair ? { HAIR: toPartSnapshot(hair) } : {}),
      TORSO: toPartSnapshot(torso),
      LEGS: toPartSnapshot(legs),
      ...(hat ? { HAT: toPartSnapshot(hat) } : {}),
      ACCESSORY: accessories.map(toPartSnapshot),
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
          hairId: hair?.id ?? null,
          torsoId: torso.id,
          legsId: legs.id,
          hatId: hat?.id ?? null,
          accessoryIds: accessories.map((part) => part.id),
          characterParts,
        },
        characters: [
          {
            id: `character-${face.id}-${hair?.id ?? "none"}-${torso.id}-${legs.id}`,
            name: displayName,
            faceId: face.id,
            hairId: hair?.id ?? null,
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
      router.replace(ROUTES.studioCharacter, { scroll: false });
    } else {
      useCartStore.getState().addItem(cartItem);
      toast.success(copy.cartSuccess);
    }
    openCartDrawer();
  };

  const categoryTabs = [
    {
      id: "PRESET" as const,
      label: copy.presetsTab,
      icon: LayoutTemplate,
    },
    { id: "FACE" as const, label: copy.tabs.FACE, icon: Smile },
    { id: "HEADWEAR" as const, label: copy.tabs.HAIR, icon: Crown },
    { id: "TORSO" as const, label: copy.tabs.TORSO, icon: Shirt },
    { id: "LEGS" as const, label: copy.tabs.LEGS, icon: Footprints },
    {
      id: "ACCESSORY" as const,
      label: copy.tabs.ACCESSORY,
      icon: PackageOpen,
    },
  ];
  const categoryParts =
    activeCategory === "PRESET"
      ? []
      : activeCategory === "HEADWEAR"
        ? HEADWEAR_PART_TYPES.flatMap((type) => groupedParts.get(type) ?? [])
        : (groupedParts.get(activeCategory) ?? []);
  const subcategories = Array.from(
    new Set(
      categoryParts
        .map((part) => part.category?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  );
  const normalizedSearch = partSearch.trim().toLocaleLowerCase();
  const visibleParts = categoryParts
    .filter(
      (part) =>
        activeSubcategory === "ALL" ||
        part.category?.trim() === activeSubcategory,
    )
    .filter((part) => {
      if (!normalizedSearch) return true;
      const tags = Array.isArray(part.tags)
        ? part.tags.filter((tag): tag is string => typeof tag === "string")
        : [];
      return `${part.name} ${part.category ?? ""} ${tags.join(" ")}`
        .toLocaleLowerCase()
        .includes(normalizedSearch);
    });

  const getPresetAdjustment = (preset: CharacterPreset) => {
    const headwearId =
      preset.hatPartId && partById.get(preset.hatPartId)?.type === "HAT"
        ? preset.hatPartId
        : preset.hairPartId;
    const ids = [
      preset.facePartId,
      headwearId,
      preset.torsoPartId,
      preset.legsPartId,
      ...(preset.accessories?.map((accessory) => accessory.partId) ?? []),
    ].filter((id): id is string => Boolean(id));
    return ids.reduce((sum, id) => {
      const part = partById.get(id);
      return sum + (part ? getPartPrice(part) : 0);
    }, 0);
  };
  const completedCount = PROGRESS_PART_TYPES.filter((type) =>
    progress.has(type),
  ).length;

  return (
    <div
      data-character-builder="true"
      className="relative mx-auto grid h-auto min-h-0 w-full max-w-[1400px] grid-rows-[auto_auto_auto] overflow-visible rounded-[20px] border border-[#cfe1ec] bg-white shadow-[0_24px_65px_-50px_rgba(18,45,78,0.5)] lg:h-full lg:grid-rows-[auto_minmax(0,1fr)_auto] lg:overflow-hidden"
    >
      <header
        data-character-toolbar="true"
        className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[#dce8ef] bg-white px-4 py-2 sm:px-5 lg:px-6"
      >
        <div className="min-w-0">
          <h1 className="truncate text-base font-black text-navy sm:text-lg">
            {dictionary.studio.characterShell.title}
          </h1>
          <p className="hidden truncate text-[11px] font-semibold text-slate-500 sm:block">
            {copy.previewTitle}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-full border border-[#cfe4f1] bg-[#f4fbff] px-3 py-1.5 text-xs font-extrabold text-primary sm:inline-flex">
            {copy.progressSummary(completedCount)}
          </span>
          <button
            type="button"
            onClick={handleReset}
            className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-[11px] border px-3 text-xs font-extrabold transition-colors ${
              resetArmed
                ? "border-amber-300 bg-amber-50 text-amber-800"
                : "border-[#d7e5ed] bg-white text-slate-600 hover:bg-slate-50 hover:text-navy"
            }`}
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">
              {resetArmed ? copy.resetConfirm : copy.reset}
            </span>
          </button>
          <button
            type="button"
            onClick={() => void randomizeCharacter()}
            disabled={randomizing || activeParts.length === 0}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[11px] border border-[#b9ddec] bg-[#edf9fe] px-3 text-xs font-extrabold text-primary transition-colors hover:bg-[#dff3fc] disabled:cursor-wait disabled:opacity-60"
          >
            <WandSparkles className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">
              {randomizing ? copy.randomizing : copy.randomize}
            </span>
          </button>
        </div>
      </header>

      <div
        data-character-main="true"
        className="min-h-0 overflow-visible lg:grid lg:grid-cols-[minmax(312px,336px)_minmax(0,1fr)] lg:overflow-hidden xl:grid-cols-[minmax(340px,380px)_minmax(0,1fr)]"
      >
        <aside
          data-character-preview-panel="true"
          className="h-[min(520px,58dvh)] min-h-[420px] min-w-0 border-b border-[#dce8ef] bg-[#f8fcfe] p-3 sm:p-4 lg:h-auto lg:min-h-0 lg:border-b-0 lg:border-r"
        >
          <CharacterPreview
            animationKey={animationKey}
            copy={copy}
            flipped={flipped}
            name={name}
            onFlippedChange={setFlipped}
            onNameChange={setName}
            progress={progress}
            selectedParts={selectedParts}
          />
        </aside>

        <section
          data-character-library-panel="true"
          className="grid min-h-[520px] min-w-0 grid-rows-[auto_auto_minmax(0,1fr)] overflow-visible bg-white lg:min-h-0 lg:overflow-hidden"
        >
          <div
            data-character-category-bar="true"
            className="min-w-0 border-b border-[#e2ecf2] bg-white px-3 py-2 sm:px-4"
          >
            <nav
              className="flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label={copy.categoryNavigation}
            >
              {categoryTabs.map(({ icon: Icon, id, label }) => {
                const active = activeCategory === id;
                const invalid =
                  validationAttempted &&
                  id !== "PRESET" &&
                  missingRequiredTypes.some((type) => type === id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => selectCategory(id)}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-3.5 text-xs font-extrabold transition-[border-color,background-color,color,transform] duration-[170ms] active:scale-[0.98] ${
                      invalid
                        ? "border-red-300 bg-red-50 text-red-700"
                        : active
                          ? "border-primary bg-[#eaf7fd] text-primary"
                          : "border-[#dbe7ee] bg-white text-slate-600 hover:border-[#8fc9e8] hover:text-primary"
                    }`}
                  >
                    <Icon className="size-[18px]" aria-hidden="true" />
                    {label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div
            data-character-filter-bar="true"
            className="flex min-h-12 min-w-0 items-center gap-2 border-b border-[#e2ecf2] bg-[#fbfdff] px-3 py-2 sm:px-4"
          >
            {activeCategory === "PRESET" ? (
              <p className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-500">
                {copy.startDescription}
              </p>
            ) : (
              <>
                {activeCategory === "HEADWEAR" ||
                activeCategory === "ACCESSORY" ? (
                  <button
                    type="button"
                    onClick={clearActivePart}
                    aria-pressed={
                      activeCategory === "ACCESSORY"
                        ? resolvedAccessoryIds.length === 0
                        : !resolvedSelectedByType.HAIR &&
                          !resolvedSelectedByType.HAT
                    }
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-[#dce8ef] bg-white px-2.5 text-[10px] font-extrabold text-slate-600 transition-colors hover:border-[#8fc9e8] hover:text-primary"
                  >
                    <CircleOff className="size-3.5" aria-hidden="true" />
                    {copy.noSelection}
                  </button>
                ) : null}

                <Select
                  id="character-part-category-filter"
                  aria-label={copy.filterLabel}
                  controlSize="compact"
                  value={activeSubcategory}
                  onValueChange={setActiveSubcategory}
                  options={[
                    { value: "ALL", label: copy.subcategoryAll },
                    ...subcategories.map((subcategory) => ({
                      value: subcategory,
                      label: subcategory,
                    })),
                  ]}
                  containerClassName="w-[180px] flex-none space-y-0 sm:w-[220px]"
                  contentClassName="p-1.5"
                  optionsClassName="custom-scrollbar max-h-[224px] overflow-y-auto overscroll-contain pr-0.5 sm:max-h-[240px]"
                  className="h-8 rounded-full bg-white px-3 text-[11px] font-extrabold"
                  itemClassName="text-xs"
                />

                <label className="relative ml-auto block w-32 shrink-0 sm:w-[200px] lg:w-[210px]">
                  <span className="sr-only">{copy.searchParts}</span>
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={partSearch}
                    onChange={(event) => setPartSearch(event.target.value)}
                    placeholder={copy.searchParts}
                    className="form-control form-control--compact h-8 bg-white pl-8 pr-2 text-[11px] font-semibold"
                  />
                </label>
              </>
            )}
          </div>

          <div
            data-character-parts-scroll="true"
            className="min-h-0 p-3 sm:p-4 lg:overflow-y-auto lg:overscroll-contain [scrollbar-gutter:stable]"
          >
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="min-h-full"
            >
              {error ? (
                <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-[18px] border border-dashed border-red-200 bg-red-50/60 px-6 text-center">
                  <PackageOpen
                    className="size-7 text-red-400"
                    aria-hidden="true"
                  />
                  <p className="mt-3 text-sm font-black text-navy">
                    {copy.loadError}
                  </p>
                  {onRetry ? (
                    <button
                      type="button"
                      onClick={onRetry}
                      className="mt-4 inline-flex h-9 items-center justify-center rounded-[11px] border border-primary bg-white px-4 text-xs font-extrabold text-primary hover:bg-[#edf8fe]"
                    >
                      {copy.retry}
                    </button>
                  ) : null}
                </div>
              ) : loading ? (
                <CharacterPartSkeleton />
              ) : activeCategory === "PRESET" ? (
                <div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                    <button
                      type="button"
                      onClick={clearSelection}
                      className={`min-h-[160px] rounded-[16px] border p-3.5 text-left transition-[border-color,background-color,transform] duration-[170ms] hover:-translate-y-0.5 active:scale-[0.98] ${
                        activePresetId === null && selectedParts.length === 0
                          ? "border-primary bg-[#edf9fe]"
                          : "border-[#dce8ef] bg-white hover:border-[#85c5e7]"
                      }`}
                    >
                      <span className="flex size-11 items-center justify-center rounded-[13px] bg-white text-primary ring-1 ring-[#dce8ef]">
                        <Sparkles className="size-5" aria-hidden="true" />
                      </span>
                      <span className="mt-3.5 block text-sm font-black leading-5 text-navy">
                        {copy.blankCharacter}
                      </span>
                      <span className="mt-1.5 block text-[11px] font-semibold leading-[18px] text-slate-500">
                        {copy.blankDescription}
                      </span>
                    </button>

                    {availablePresets.map((preset, index) => {
                      const preview = resolveApiAssetUrl(
                        preset.previewImageUrl,
                      );
                      const adjustment = getPresetAdjustment(preset);
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => applyPreset(preset)}
                          className={`group min-h-[160px] overflow-hidden rounded-[16px] border p-3 text-left transition-[border-color,background-color,transform] duration-[170ms] hover:-translate-y-0.5 active:scale-[0.98] ${
                            activePresetId === preset.id
                              ? "border-primary bg-[#edf9fe]"
                              : "border-[#dce8ef] bg-white hover:border-[#85c5e7]"
                          }`}
                        >
                          <span className="relative block aspect-[4/3] overflow-hidden rounded-[11px] bg-[linear-gradient(145deg,#f8fbfd,#edf5f9)]">
                            {preview ? (
                              <Image
                                src={preview}
                                alt=""
                                fill
                                unoptimized
                                sizes="(max-width: 640px) 80vw, (max-width: 1280px) 40vw, 240px"
                                loading={index < 2 ? "eager" : "lazy"}
                                className="object-contain"
                              />
                            ) : (
                              <LayoutTemplate className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-slate-300" />
                            )}
                          </span>
                          <span className="mt-2 flex items-start justify-between gap-2">
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-black leading-5 text-navy">
                                {preset.name}
                              </span>
                              <span className="mt-1 block truncate text-[11px] font-bold text-slate-500">
                                {preset.description || copy.presetDescription}
                              </span>
                            </span>
                            {adjustment > 0 ? (
                              <span className="shrink-0 text-xs font-extrabold text-primary">
                                +{formatPrice(adjustment)}
                              </span>
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <CharacterPartGrid
                  copy={copy}
                  onBack={() => selectCategory("PRESET")}
                  onSelect={togglePart}
                  parts={visibleParts}
                  selectedIds={selectedIds}
                />
              )}
            </motion.div>

            {!loading &&
            !error &&
            !catalogParts.length &&
            activeCategory === "PRESET" ? (
              <div className="mt-3">
                <CharacterEmptyState
                  copy={copy}
                  onBack={() => selectCategory("PRESET")}
                />
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <footer
        data-character-footer="true"
        className="relative z-30 min-h-[72px] shrink-0 border-t border-[#d7e6ef] bg-white px-3 py-2 sm:px-5"
      >
        {validationAttempted && missingRequiredTypes.length ? (
          <p
            className="absolute inset-x-3 bottom-[calc(100%+6px)] z-40 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 shadow-sm sm:inset-x-auto sm:right-5"
            role="alert"
          >
            {copy.missingParts}
          </p>
        ) : null}
        <div className="flex h-full items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4 sm:gap-6">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                {copy.selectedParts}
              </p>
              <p className="mt-0.5 whitespace-nowrap text-sm font-black text-navy sm:text-base">
                {copy.selectedCount(selectedParts.length)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                {quote ? copy.finalTotal : copy.partsEstimate}
              </p>
              <p
                className="mt-0.5 whitespace-nowrap text-xl font-black text-navy sm:text-[22px]"
                aria-live="polite"
                aria-busy={quoteLoading}
              >
                <AnimatedPriceValue amount={totalPrice} />
              </p>
              <p className="sr-only">
                {quoteLoading
                  ? copy.quoting
                  : quoteError
                    ? copy.quoteError
                    : quote
                      ? copy.verifiedPrice
                      : copy.priceCompletesWhenReady}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div
              role="group"
              aria-label={copy.quantity}
              className="hidden h-11 shrink-0 items-center rounded-full bg-[#f1f6fa] p-1 ring-1 ring-inset ring-[#dce8f1] sm:inline-flex"
            >
              <button
                type="button"
                onClick={() =>
                  setQuantity((current) => Math.max(1, current - 1))
                }
                disabled={quantity <= 1}
                className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-500 transition-all duration-200 hover:bg-[#ffd33d] hover:text-[#10253f] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a900] disabled:cursor-not-allowed disabled:bg-transparent disabled:opacity-35 disabled:shadow-none motion-reduce:transition-none"
                aria-label={copy.decreaseQuantity}
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <output
                aria-live="polite"
                className="min-w-10 px-1 text-center text-sm font-bold tabular-nums text-[#10253f]"
              >
                {quantity}
              </output>
              <button
                type="button"
                onClick={() =>
                  setQuantity((current) => Math.min(10, current + 1))
                }
                disabled={quantity >= 10}
                className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-600 transition-all duration-200 hover:bg-[#ffd33d] hover:text-[#10253f] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a900] disabled:cursor-not-allowed disabled:bg-transparent disabled:opacity-35 disabled:shadow-none motion-reduce:transition-none"
                aria-label={copy.increaseQuantity}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <button
              type="button"
              disabled={quoteLoading}
              onClick={() => void addCharacterToCart()}
              className="group relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-[12px] bg-primary px-4 text-sm font-extrabold text-white shadow-[0_12px_24px_-16px_rgba(18,139,203,0.85)] transition-all duration-300 before:absolute before:inset-y-0 before:left-[-45%] before:w-1/3 before:-skew-x-12 before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent before:transition-transform before:duration-700 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-[0_16px_30px_-16px_rgba(37,143,206,0.9)] hover:before:translate-x-[430%] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82c5ec] focus-visible:ring-offset-2 disabled:cursor-wait disabled:translate-y-0 disabled:bg-slate-300 disabled:shadow-none disabled:before:hidden motion-reduce:transform-none motion-reduce:before:hidden sm:w-[230px]"
            >
              <ShoppingCart
                className="relative z-10 size-4 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 group-disabled:rotate-0 group-disabled:scale-100"
                aria-hidden="true"
              />
              <span className="relative z-10 hidden sm:inline">
                {editItemId ? copy.updateCart : copy.addToCart}
              </span>
              <span className="relative z-10 sm:hidden">
                {copy.addToCartShort}
              </span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
