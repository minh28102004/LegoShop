"use client";

import { useMemo, useState } from "react";
import { Check, Layers3, RotateCcw, ShoppingCart } from "lucide-react";
import { formatCurrency as formatPrice } from "@lego-shop/shared";
import type { CharacterPart, CharacterPartType } from "@lego-shop/shared";

import { UI_MODAL_IDS } from "@/config/routes";
import { useCartStore, type CartItemPart } from "@/features/cart/store";
import { useUIStore } from "@/features/ui/store";
import { resolveApiAssetUrl } from "@/lib/api/assets";
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
}: {
  emptyLabel: string;
  parts: CharacterPart[];
}) {
  const orderedParts = LAYER_ORDER.flatMap((type) =>
    parts.filter((part) => part.type === type),
  );

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px] overflow-hidden bg-[linear-gradient(145deg,#ffffff,#f1f5f9)] ring-1 ring-slate-200">
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
  loading,
}: {
  parts: CharacterPart[];
  loading: boolean;
}) {
  const { dictionary } = useI18n();
  const copy = dictionary.characterBuilder;
  const activeParts = useMemo(
    () => parts.filter((part) => part.status === "active"),
    [parts],
  );
  const groupedParts = useMemo(() => {
    const groups = new Map<BuilderPartType, CharacterPart[]>();
    PART_TABS.forEach((type) => groups.set(type, []));
    activeParts.forEach((part) => {
      groups.get(part.type as BuilderPartType)?.push(part);
    });
    return groups;
  }, [activeParts]);
  const partById = useMemo(
    () => new Map(activeParts.map((part) => [part.id, part])),
    [activeParts],
  );

  const [activeTab, setActiveTab] = useState<BuilderPartType>("FACE");
  const [name, setName] = useState("");
  const [selectedByType, setSelectedByType] = useState<
    Partial<Record<CharacterPartType, string>>
  >({});
  const [accessoryIds, setAccessoryIds] = useState<string[]>([]);

  const resolvedSelectedByType = useMemo(() => {
    const next = { ...selectedByType };
    REQUIRED_TYPES.forEach((type) => {
      const currentPart = next[type]
        ? partById.get(next[type] as string)
        : null;
      if (!currentPart || currentPart.type !== type) {
        const first = groupedParts.get(type)?.[0];
        if (first) next[type] = first.id;
      }
    });

    if (next.HAT && !partById.has(next.HAT)) {
      delete next.HAT;
    }
    return next;
  }, [groupedParts, partById, selectedByType]);
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
  const totalPrice =
    BASE_CHARACTER_PRICE +
    selectedParts.reduce((sum, part) => sum + getPartPrice(part), 0);

  const resetBuilder = () => {
    const defaults: Partial<Record<CharacterPartType, string>> = {};
    REQUIRED_TYPES.forEach((type) => {
      const first = groupedParts.get(type)?.[0];
      if (first) defaults[type] = first.id;
    });
    setSelectedByType(defaults);
    setAccessoryIds([]);
    setActiveTab("FACE");
  };

  const togglePart = (part: CharacterPart) => {
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
      REQUIRED_TYPES.forEach((type) => {
        const currentPart = next[type]
          ? partById.get(next[type] as string)
          : null;
        if (!currentPart || currentPart.type !== type) {
          const first = groupedParts.get(type)?.[0];
          if (first) next[type] = first.id;
        }
      });
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

  const addCharacterToCart = () => {
    if (!isReady) return;

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

    useCartStore.getState().addItem({
      productId: null,
      productName: displayName,
      quantity: 1,
      unitPrice: totalPrice,
      frameSizeId: "",
      frameSizeLabel: copy.customFrameLabel,
      frameColorName: "",
      parts: cartParts,
      designData: {
        type: "CUSTOM_CHARACTER",
        source: "character_builder",
        partIds: selectedParts.map((part) => part.id),
        basePrice: BASE_CHARACTER_PRICE,
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
            price: totalPrice,
          },
        ],
      },
      previewUrl: resolveApiAssetUrl(face.imageUrl),
    });
    openCartDrawer();
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

  if (!activeParts.length) {
    return (
      <div className="border border-slate-200 bg-white px-6 py-16 text-center">
        <Layers3 className="mx-auto mb-4 h-10 w-10 text-slate-300" />
        <p className="font-bold text-slate-900">{copy.emptyTitle}</p>
        <p className="mt-2 text-sm text-slate-500">{copy.emptyDescription}</p>
      </div>
    );
  }

  const visibleParts = groupedParts.get(activeTab) ?? [];

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(340px,0.92fr)_1.08fr] lg:gap-12">
      <div className="lg:sticky lg:top-24">
        <CharacterLayerPreview
          emptyLabel={copy.previewEmpty}
          parts={selectedParts}
        />
        <div className="mt-5 flex items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">
              {copy.price}
            </p>
            <p className="mt-1 text-2xl font-extrabold text-slate-950">
              {formatPrice(totalPrice)}
            </p>
          </div>
          <button
            type="button"
            onClick={resetBuilder}
            className="inline-flex h-10 w-10 items-center justify-center border border-slate-200 bg-white text-slate-600 transition hover:border-primary hover:text-primary"
            title={copy.reset}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="min-w-0">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase text-primary">
            {copy.eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-950 sm:text-3xl">
            {copy.title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {copy.description}
          </p>
        </div>

        <label className="mb-6 block">
          <span className="mb-2 block text-xs font-bold uppercase text-slate-500">
            {copy.name}
          </span>
          <input
            value={name}
            placeholder={copy.defaultName}
            onChange={(event) => setName(event.target.value)}
            maxLength={60}
            className="form-control form-control--compact px-3 text-sm font-semibold"
          />
        </label>

        <div className="mb-5 flex gap-1 overflow-x-auto border-b border-slate-200">
          {PART_TABS.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setActiveTab(type)}
              className={`shrink-0 border-b-2 px-3 py-3 text-xs font-bold transition ${
                activeTab === type
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {copy.tabs[type]}
              {type === "ACCESSORY" && resolvedAccessoryIds.length
                ? ` (${resolvedAccessoryIds.length})`
                : null}
            </button>
          ))}
        </div>

        <div className="grid min-h-[260px] grid-cols-2 gap-3 sm:grid-cols-3">
          {visibleParts.map((part) => {
            const selected = isSelected(part);
            const src = resolveApiAssetUrl(part.imageUrl);

            return (
              <button
                key={part.id}
                type="button"
                onClick={() => togglePart(part)}
                className={`group relative min-w-0 border bg-white p-3 text-left transition ${
                  selected
                    ? "border-primary ring-2 ring-primary/10"
                    : "border-slate-200 hover:border-slate-400"
                }`}
              >
                <div className="relative aspect-square overflow-hidden bg-slate-50">
                  {src ? (
                    <img
                      src={src}
                      alt={part.name}
                      className="h-full w-full object-contain transition group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <p className="mt-2 truncate text-xs font-bold text-slate-900">
                  {part.name}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">
                  {getPartPrice(part) > 0
                    ? `+${formatPrice(getPartPrice(part))}`
                    : copy.included}
                </p>
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

        <button
          type="button"
          disabled={!isReady}
          onClick={addCharacterToCart}
          className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <ShoppingCart className="h-4 w-4" />
          {copy.addToCart} · {formatPrice(totalPrice)}
        </button>
      </div>
    </div>
  );
}
