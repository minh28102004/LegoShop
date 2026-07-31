"use client";

import type {
  ProductDetail,
  ProductTemplateAccessory,
} from "@lego-shop/shared";
import { formatCurrency } from "@lego-shop/shared";
import { cn } from "@lego-shop/ui";
import { motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Minus,
  Plus,
  RotateCcw,
  Search,
  ShoppingBag,
  X,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";

import { FeatureIcon } from "@/components/shared/FeatureIcon";
import { ProductImage } from "@/components/shared/ProductImage";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { DECORATIVE_ICON_PATHS } from "@/config/icons";
import { ROUTES } from "@/config/routes";
import { useCartStore, type CartItemPart } from "@/features/cart/store";
import { resolveApiAssetUrl } from "@/lib/api/assets";
import { publicApiClient } from "@/lib/api/public-client";
import type { ProductDetailDictionary } from "@/lib/i18n/dictionaries";

type ProductTemplateDetailModalProps = {
  isOpen: boolean;
  labels: ProductDetailDictionary;
  onClose: () => void;
  slug: string | null;
};

const detailCache = new Map<string, ProductDetail>();

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function records(value: unknown): UnknownRecord[] {
  return Array.isArray(value)
    ? value.flatMap((item) => {
        const record = asRecord(item);
        return record ? [record] : [];
      })
    : [];
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function nullableString(value: unknown): string | null {
  return nonEmptyString(value);
}

function nonNegativeNumber(value: unknown, fallback = 0): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim().length > 0
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
}

function positiveInteger(value: unknown, fallback = 1): number {
  return Math.max(1, Math.trunc(nonNegativeNumber(value, fallback)));
}

function normalizeAccessory(
  value: UnknownRecord,
): ProductTemplateAccessory | null {
  const id = nonEmptyString(value.id);
  const name = nonEmptyString(value.name);
  if (!id || !name) return null;

  const quantity = Math.trunc(nonNegativeNumber(value.quantity));
  const maxQuantity = Math.max(
    1,
    positiveInteger(value.maxQuantity, Math.max(1, quantity)),
  );

  return {
    id,
    name,
    price: nonNegativeNumber(value.price),
    originalPrice:
      value.originalPrice === null || value.originalPrice === undefined
        ? null
        : nonNegativeNumber(value.originalPrice),
    imageUrl: nullableString(value.imageUrl),
    iconUrl: nullableString(value.iconUrl),
    quantity: Math.min(quantity, maxQuantity),
    maxQuantity,
    colorVariants: records(value.colorVariants).flatMap((color) => {
      const colorName = nonEmptyString(color.name);
      const colorHex = nonEmptyString(color.colorHex);
      return colorName && colorHex ? [{ name: colorName, colorHex }] : [];
    }),
  };
}

function normalizeProductDetail(value: unknown): ProductDetail {
  const product = asRecord(value);
  const id = nonEmptyString(product?.id);
  const name = nonEmptyString(product?.name);
  const slug = nonEmptyString(product?.slug);

  if (!product || !id || !name || !slug) {
    throw new Error("Invalid product detail response");
  }

  const basePrice = nonNegativeNumber(product.basePrice);
  const pricingSource = asRecord(product.pricing);
  const originalPriceSource =
    pricingSource?.originalPrice ?? product.originalPrice;
  const originalPrice =
    originalPriceSource === null || originalPriceSource === undefined
      ? null
      : nonNegativeNumber(originalPriceSource);

  const frameSizes = records(product.frameSizes).flatMap((size) => {
    const frameId = nonEmptyString(size.id);
    const label = nonEmptyString(size.label);
    if (!frameId || !label) return [];

    const priceAdjustment = nonNegativeNumber(size.priceAdjustment);
    return [
      {
        id: frameId,
        label,
        price: nonNegativeNumber(size.price, basePrice + priceAdjustment),
        priceAdjustment,
        recommended: size.recommended === true,
      },
    ];
  });
  const characters = records(product.characters).flatMap((character) => {
    const characterId = nonEmptyString(character.id);
    const characterName = nonEmptyString(character.name);
    if (!characterId || !characterName) return [];

    return [
      {
        id: characterId,
        name: characterName,
        price: nonNegativeNumber(character.price),
        imageUrl: nullableString(character.imageUrl),
        quantity: positiveInteger(character.quantity),
      },
    ];
  });
  const accessories = records(product.accessories).flatMap((accessory) => {
    const normalized = normalizeAccessory(accessory);
    return normalized ? [normalized] : [];
  });
  const availableAccessories = records(product.availableAccessories).flatMap(
    (accessory) => {
      const normalized = normalizeAccessory(accessory);
      return normalized ? [normalized] : [];
    },
  );
  const includedItems = records(product.includedItems).flatMap((item) => {
    const itemId = nonEmptyString(item.id);
    const itemName = nonEmptyString(item.name);
    if (!itemId || !itemName) return [];

    const icon: "gift" | "package" | "sparkles" =
      item.icon === "package" ||
      item.icon === "sparkles" ||
      item.icon === "gift"
        ? item.icon
        : "gift";
    return [
      {
        id: itemId,
        name: itemName,
        quantity: positiveInteger(item.quantity),
        icon,
      },
    ];
  });
  const customizableFields = records(product.customizableFields).flatMap(
    (field) => {
      const key = nonEmptyString(field.key);
      const label = nonEmptyString(field.label);
      return key && label
        ? [{ key, label, required: field.required === true }]
        : [];
    },
  );
  const recommendedFrameSizeId = nonEmptyString(product.recommendedFrameSizeId);

  return {
    ...(product as ProductDetail),
    id,
    name,
    slug,
    description: nullableString(product.description),
    basePrice,
    images: Array.isArray(product.images)
      ? product.images.flatMap((image) => {
          const imageUrl = nonEmptyString(image);
          return imageUrl ? [imageUrl] : [];
        })
      : [],
    originalPrice,
    orderCount: Math.trunc(nonNegativeNumber(product.orderCount)),
    characterCount: Math.trunc(
      nonNegativeNumber(product.characterCount, characters.length),
    ),
    accessoryCount: Math.trunc(
      nonNegativeNumber(product.accessoryCount, accessories.length),
    ),
    frameSizes,
    characters,
    accessories,
    availableAccessories,
    includedItems,
    customizableFields,
    includedItemLabels: Array.isArray(product.includedItemLabels)
      ? product.includedItemLabels.flatMap((label) => {
          const normalizedLabel = nonEmptyString(label);
          return normalizedLabel ? [normalizedLabel] : [];
        })
      : [],
    pricing: {
      basePrice: nonNegativeNumber(pricingSource?.basePrice, basePrice),
      minimumPrice: nonNegativeNumber(
        pricingSource?.minimumPrice,
        frameSizes[0]?.price ?? basePrice,
      ),
      originalPrice,
    },
    recommendedFrameSizeId:
      recommendedFrameSizeId &&
      frameSizes.some((size) => size.id === recommendedFrameSizeId)
        ? recommendedFrameSizeId
        : null,
    requiresNote: product.requiresNote === true,
  };
}

function getInitialFrameSizeId(detail: ProductDetail): string {
  return (
    detail.recommendedFrameSizeId ??
    detail.frameSizes.find((size) => size.recommended)?.id ??
    detail.frameSizes[0]?.id ??
    ""
  );
}

function accessoryImage(accessory: ProductTemplateAccessory) {
  return resolveApiAssetUrl(accessory.imageUrl ?? accessory.iconUrl);
}

function normalizeAccessorySearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLocaleLowerCase();
}

function buildQuantityMap(detail: ProductDetail) {
  return Object.fromEntries(
    detail.accessories.map((accessory) => [accessory.id, accessory.quantity]),
  );
}

export function ProductTemplateDetailModal({
  isOpen,
  labels,
  onClose,
  slug,
}: ProductTemplateDetailModalProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestKey, setRequestKey] = useState(0);
  const [selectedFrameSizeId, setSelectedFrameSizeId] = useState("");
  const [accessoryQuantities, setAccessoryQuantities] = useState<
    Record<string, number>
  >({});
  const [note, setNote] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [accessorySearch, setAccessorySearch] = useState("");
  const [contentReady, setContentReady] = useState(false);
  const [accessoryCatalogReady, setAccessoryCatalogReady] = useState(false);
  const accessoryCatalogRef = useRef<HTMLDivElement | null>(null);

  const closeModal = useCallback(() => {
    setContentReady(false);
    setAccessoryCatalogReady(false);
    setActiveImageIndex(0);
    setAccessorySearch("");
    setNote("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const revealTimer = window.setTimeout(() => {
      startTransition(() => setContentReady(true));
    }, 220);

    return () => window.clearTimeout(revealTimer);
  }, [isOpen, slug]);

  useEffect(() => {
    const requestedSlug = slug?.trim() ?? "";
    if (!isOpen || !requestedSlug) return;

    let cancelled = false;

    function applyLoadedDetail(product: ProductDetail) {
      setDetail(product);
      setSelectedFrameSizeId(getInitialFrameSizeId(product));
      setAccessoryQuantities(buildQuantityMap(product));
      setActiveImageIndex(0);
      setAccessorySearch("");
      setNote("");
      setError(null);
      setIsLoading(false);
    }

    async function loadDetail() {
      try {
        const cached = detailCache.get(requestedSlug);
        if (cached) {
          const normalizedCached = normalizeProductDetail(cached);
          detailCache.set(requestedSlug, normalizedCached);
          startTransition(() => applyLoadedDetail(normalizedCached));
          return;
        }

        setIsLoading(true);
        setError(null);
        setDetail(null);
        setSelectedFrameSizeId("");
        setAccessoryQuantities({});
        setActiveImageIndex(0);
        setAccessorySearch("");
        setAccessoryCatalogReady(false);
        setNote("");

        const product =
          await publicApiClient.products.getProductBySlug(requestedSlug);
        if (cancelled) return;
        const normalizedProduct = normalizeProductDetail(product);
        detailCache.set(requestedSlug, normalizedProduct);
        startTransition(() => applyLoadedDetail(normalizedProduct));
      } catch (loadError: unknown) {
        if (cancelled) return;
        console.error("[product-detail] Failed to load product", loadError);
        setDetail(null);
        setError(labels.loadError);
        toast.error(labels.loadError, {
          id: `product-detail-load-${requestedSlug}`,
        });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadDetail();

    return () => {
      cancelled = true;
    };
  }, [isOpen, labels.loadError, requestKey, slug]);

  const selectedFrameSize = detail?.frameSizes.find(
    (size) => size.id === selectedFrameSizeId,
  );
  const selectedAccessories = useMemo(() => {
    if (!detail) return [];
    const byId = new Map(
      [...detail.accessories, ...detail.availableAccessories].map((item) => [
        item.id,
        item,
      ]),
    );
    return Object.entries(accessoryQuantities).flatMap(([id, quantity]) => {
      const accessory = byId.get(id);
      return accessory && quantity > 0 ? [{ accessory, quantity }] : [];
    });
  }, [accessoryQuantities, detail]);
  const hasAvailableAccessories = Boolean(
    detail?.availableAccessories.some(
      (item) => (accessoryQuantities[item.id] ?? 0) === 0,
    ),
  );
  const availableAccessories = useMemo(() => {
    if (!detail) return [];
    const query = normalizeAccessorySearch(accessorySearch);

    return detail.availableAccessories.filter((item) => {
      if ((accessoryQuantities[item.id] ?? 0) > 0) return false;
      return !query || normalizeAccessorySearch(item.name).includes(query);
    });
  }, [accessoryQuantities, accessorySearch, detail]);

  useEffect(() => {
    if (!isOpen || !contentReady || !detail || !hasAvailableAccessories) {
      return undefined;
    }

    const catalog = accessoryCatalogRef.current;
    if (!catalog) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        startTransition(() => setAccessoryCatalogReady(true));
        observer.disconnect();
      },
      { rootMargin: "280px 0px" },
    );

    observer.observe(catalog);
    return () => observer.disconnect();
  }, [contentReady, detail, hasAvailableAccessories, isOpen]);

  const charactersTotal =
    detail?.characters.reduce(
      (total, character) => total + character.price * character.quantity,
      0,
    ) ?? 0;
  const accessoriesTotal = selectedAccessories.reduce(
    (total, item) => total + item.accessory.price * item.quantity,
    0,
  );
  const selectedAccessoryCount = selectedAccessories.reduce(
    (count, item) => count + item.quantity,
    0,
  );
  const total =
    (selectedFrameSize?.price ?? detail?.pricing.minimumPrice ?? 0) +
    charactersTotal +
    accessoriesTotal;
  const images = detail?.images.map(resolveApiAssetUrl).filter(Boolean) ?? [];
  const activeImage = images[activeImageIndex] ?? null;

  function updateAccessoryQuantity(
    accessory: ProductTemplateAccessory,
    nextQuantity: number,
  ) {
    setAccessoryQuantities((current) => ({
      ...current,
      [accessory.id]: Math.max(
        0,
        Math.min(accessory.maxQuantity, nextQuantity),
      ),
    }));
  }

  function validateSelection() {
    if (!detail) return false;
    if (detail.frameSizes.length > 0 && !selectedFrameSize) {
      toast.error(labels.noFrameSize);
      return false;
    }
    if (detail.requiresNote && !note.trim()) {
      toast.error(labels.noteRequired);
      return false;
    }
    return true;
  }

  function addConfiguredItem() {
    if (!detail || !validateSelection()) return false;

    const parts: CartItemPart[] = [
      {
        ...(selectedFrameSize ? { id: selectedFrameSize.id } : {}),
        type: "frame",
        name: selectedFrameSize?.label ?? detail.name,
        quantity: 1,
        unitPrice: selectedFrameSize?.price ?? detail.pricing.minimumPrice,
        totalPrice: selectedFrameSize?.price ?? detail.pricing.minimumPrice,
        imageUrl: activeImage,
      },
      ...detail.characters.map((character) => ({
        id: character.id,
        type: "character" as const,
        name: character.name,
        quantity: character.quantity,
        unitPrice: character.price,
        totalPrice: character.price * character.quantity,
        imageUrl: character.imageUrl,
      })),
      ...selectedAccessories.map(({ accessory, quantity }) => ({
        id: accessory.id,
        type: "accessory" as const,
        name: accessory.name,
        quantity,
        unitPrice: accessory.price,
        totalPrice: accessory.price * quantity,
        imageUrl: accessory.imageUrl,
      })),
    ];

    addItem({
      productId: detail.id,
      productName: detail.name,
      quantity: 1,
      unitPrice: total,
      note: note.trim(),
      ...(selectedFrameSize ? { frameOptionId: selectedFrameSize.id } : {}),
      frameSizeId: selectedFrameSize?.id ?? "product-template",
      frameSizeLabel: selectedFrameSize?.label ?? labels.basePrice,
      frameColorName: labels.frameColorTemplate,
      accessories: selectedAccessories.map(({ accessory, quantity }) => ({
        id: accessory.id,
        name: accessory.name,
        price: accessory.price,
        quantity,
      })),
      parts,
      templateId: detail.id,
      designData: {
        source: "product-template",
        productSlug: detail.slug,
        frameSizeId: selectedFrameSize?.id ?? null,
        characterIds: detail.characters.map((character) => character.id),
        accessories: selectedAccessories.map(({ accessory, quantity }) => ({
          id: accessory.id,
          quantity,
        })),
        note: note.trim(),
      },
      previewUrl: activeImage,
    });
    return true;
  }

  function handleAddToCart() {
    if (!addConfiguredItem()) return;
    toast.success(labels.addedToCart);
    closeModal();
    openCart();
  }

  function handleBuyNow() {
    if (!addConfiguredItem()) return;
    closeModal();
    router.push(ROUTES.checkout);
  }

  function handleConsultation() {
    if (!detail) return;
    const params = new URLSearchParams({
      product: detail.name,
      productId: detail.id,
      message: labels.consultationMessage(detail.name),
    });
    closeModal();
    router.push(`${ROUTES.business}?${params.toString()}`);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      size="full"
      className="h-[calc(100dvh-16px)] max-h-[920px] max-w-[1320px] rounded-[28px] border border-white/70 bg-white shadow-[0_32px_90px_-35px_rgba(3,18,38,0.5)] sm:h-[calc(100dvh-32px)]"
      contentClassName="h-full overflow-hidden p-0"
    >
      {!contentReady ||
      isLoading ||
      (isOpen && slug && !detail && !error) ? (
        <div className="grid h-full place-items-center bg-white px-6 text-center">
          <div>
            <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary motion-reduce:animate-none" />
            <p className="mt-4 text-sm font-medium text-text-secondary">
              {labels.loading}
            </p>
          </div>
        </div>
      ) : error || !detail ? (
        <div className="grid h-full place-items-center bg-white px-6 text-center">
          <div className="max-w-sm">
            <RotateCcw className="mx-auto h-9 w-9 text-primary" />
            <p className="mt-4 font-semibold text-navy">
              {error ?? labels.loadError}
            </p>
            <button
              type="button"
              className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white"
              onClick={() => setRequestKey((key) => key + 1)}
            >
              {labels.retry}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid h-full min-h-0 bg-white lg:grid-cols-[48%_52%]">
          <div className="relative hidden min-h-0 border-r border-border/70 bg-[#f7f9fc] p-8 lg:flex lg:flex-col xl:p-10">
            <div className="sticky top-0 flex min-h-0 flex-1 items-center justify-center">
              <ProductImage
                src={activeImage}
                alt={detail.name}
                fill
                sizes="(min-width: 1024px) 46vw, 100vw"
                wrapperClassName="aspect-[4/5] max-h-full w-full max-w-[560px] rounded-[24px] bg-white"
                className="object-cover"
                priority
              />
              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label={labels.previousImage}
                    className="absolute left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy shadow-sm backdrop-blur transition hover:bg-white"
                    onClick={() =>
                      setActiveImageIndex((index) =>
                        index === 0 ? images.length - 1 : index - 1,
                      )
                    }
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    aria-label={labels.nextImage}
                    className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy shadow-sm backdrop-blur transition hover:bg-white"
                    onClick={() =>
                      setActiveImageIndex(
                        (index) => (index + 1) % images.length,
                      )
                    }
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex min-h-0 flex-col">
            <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-border/70 bg-white px-5 sm:px-7">
              <div className="min-w-0 pr-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  {labels.customBadge}
                </span>
                <h2 className="truncate text-lg font-bold text-navy sm:text-xl">
                  {detail.name}
                </h2>
              </div>
              <motion.button
                type="button"
                aria-label={labels.close}
                onClick={closeModal}
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.96 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 18,
                }}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-transparent p-2 text-slate-800 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffe16a]/45"
              >
                <X className="h-[22px] w-[22px]" aria-hidden="true" />
              </motion.button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              <ProductImage
                src={activeImage}
                alt={detail.name}
                fill
                sizes="(max-width: 1023px) calc(100vw - 40px), 1px"
                wrapperClassName="mb-5 aspect-[4/3] w-full rounded-[20px] bg-surface-soft lg:hidden"
                className="object-cover"
                priority
              />

              <section>
                <SectionTitle>{labels.chooseSize}</SectionTitle>
                {detail.frameSizes.length > 0 ? (
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {detail.frameSizes.map((size) => {
                      const selected = size.id === selectedFrameSizeId;
                      return (
                        <button
                          key={size.id}
                          type="button"
                          className={cn(
                            "relative min-h-[82px] rounded-[18px] border px-4 py-3 text-left transition-all duration-200",
                            selected
                              ? "border-primary bg-primary-light/55 ring-1 ring-primary/20"
                              : "border-border bg-white hover:border-primary/30 hover:shadow-sm",
                          )}
                          onClick={() => setSelectedFrameSizeId(size.id)}
                        >
                          {size.recommended ? (
                            <span className="absolute -top-2.5 right-3 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase text-accent-foreground">
                              {labels.recommended}
                            </span>
                          ) : null}
                          <span className="block text-sm font-bold text-navy">
                            {size.label}
                          </span>
                          <span className="mt-1 block text-sm font-semibold text-primary-dark">
                            {formatCurrency(size.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-3 rounded-[16px] bg-surface-soft px-4 py-3 text-sm text-text-secondary">
                    {labels.noFrameSize}
                  </p>
                )}
                <p className="mt-3 text-xs italic leading-5 text-text-muted">
                  {labels.framePriceNote}
                </p>
              </section>

              <section className="mt-7 rounded-[20px] bg-primary-light/35 p-4 sm:p-5">
                <SectionTitle>{labels.included}</SectionTitle>
                {detail.includedItems.length > 0 ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {detail.includedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-[15px] bg-white px-3 py-2.5 shadow-sm"
                      >
                        <FeatureIcon
                          decorative
                          size="sm"
                          src={
                            item.icon === "package"
                              ? DECORATIVE_ICON_PATHS.package
                              : item.icon === "sparkles"
                                ? DECORATIVE_ICON_PATHS.sparkles
                                : DECORATIVE_ICON_PATHS.wrappedGift
                          }
                        />
                        <span className="text-sm font-semibold text-navy">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    {labels.includedEmpty}
                  </p>
                )}
              </section>

              <section className="mt-7">
                <SectionTitle>{labels.customizable}</SectionTitle>
                {detail.customizableFields.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {detail.customizableFields.map((field) => (
                      <span
                        key={field.key}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-white px-3 py-1.5 text-xs font-semibold text-primary-dark"
                      >
                        <Check className="h-3.5 w-3.5" />
                        {field.label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    {labels.customizableEmpty}
                  </p>
                )}
              </section>

              <section className="mt-7">
                <SectionTitle>
                  {labels.characterSection} ({detail.characterCount ?? 0})
                </SectionTitle>
                {detail.characters.length > 0 ? (
                  <div className="mt-3 space-y-2.5">
                    {detail.characters.map((character) => (
                      <div
                        key={character.id}
                        className="flex items-center gap-3 rounded-[17px] border border-border/80 bg-white p-3"
                      >
                        <ProductImage
                          src={resolveApiAssetUrl(character.imageUrl)}
                          alt={character.name}
                          fill
                          sizes="56px"
                          compactFallback
                          wrapperClassName="h-14 w-14 shrink-0 rounded-[12px] bg-surface-soft"
                          className="object-contain p-1"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-navy">
                            {character.name}
                          </p>
                          <p className="mt-0.5 text-xs text-text-muted">
                            x{character.quantity}
                            {character.price > 0
                              ? ` · ${formatCurrency(character.price)}`
                              : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 rounded-[16px] border border-dashed border-border bg-surface-soft/60 px-4 py-4 text-sm leading-6 text-text-secondary">
                    {labels.characterEmpty}
                  </p>
                )}
              </section>

              <section className="mt-7">
                <SectionTitle>
                  {labels.accessorySection} ({selectedAccessoryCount})
                </SectionTitle>
                {selectedAccessories.length > 0 ? (
                  <div className="mt-3 space-y-2.5">
                    {selectedAccessories.map(({ accessory, quantity }) => (
                      <AccessoryRow
                        key={accessory.id}
                        accessory={accessory}
                        labels={labels}
                        quantity={quantity}
                        onChange={(nextQuantity) =>
                          updateAccessoryQuantity(accessory, nextQuantity)
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-text-secondary">
                    {labels.accessoryEmpty}
                  </p>
                )}

                {hasAvailableAccessories ? (
                  <div ref={accessoryCatalogRef} className="mt-4">
                    <div className="mb-2.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                        {labels.otherAccessories}
                      </p>
                      <label className="relative block w-full sm:w-[270px]">
                        <Search
                          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                          aria-hidden="true"
                        />
                        <input
                          type="search"
                          value={accessorySearch}
                          onChange={(event) =>
                            setAccessorySearch(event.target.value)
                          }
                          placeholder={labels.searchAccessories}
                          aria-label={labels.searchAccessories}
                          className="form-control form-control--compact pl-10 pr-4 text-sm font-medium"
                        />
                      </label>
                    </div>
                    {!accessoryCatalogReady ? (
                      <div
                        aria-hidden="true"
                        className="h-[152px] animate-pulse rounded-[14px] bg-surface-soft motion-reduce:animate-none"
                      />
                    ) : availableAccessories.length > 0 ? (
                      <div className="custom-scrollbar max-h-[316px] overflow-y-auto overscroll-contain pr-1">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {availableAccessories.map((accessory) => (
                            <button
                              key={accessory.id}
                              type="button"
                              className="group flex min-w-0 items-center gap-2 rounded-[14px] border border-border/80 bg-white p-2 text-left transition hover:border-primary/30 hover:shadow-sm"
                              onClick={() =>
                                updateAccessoryQuantity(accessory, 1)
                              }
                            >
                              <ProductImage
                                src={accessoryImage(accessory)}
                                alt={accessory.name}
                                fill
                                sizes="40px"
                                compactFallback
                                wrapperClassName="h-10 w-10 shrink-0 rounded-[10px] bg-surface-soft"
                                className="object-contain p-1"
                              />
                              <span className="min-w-0">
                                <span className="block truncate text-xs font-semibold text-navy">
                                  {accessory.name}
                                </span>
                                <span className="text-[11px] text-primary-dark">
                                  +{formatCurrency(accessory.price)}
                                </span>
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="rounded-[14px] border border-dashed border-border bg-surface-soft/60 px-4 py-5 text-center text-sm text-text-secondary">
                        {labels.noAccessoryMatches}
                      </p>
                    )}
                  </div>
                ) : null}
              </section>

              <section className="mt-7 pb-2">
                <label
                  htmlFor="product-template-note"
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-navy"
                >
                  {labels.orderNote}
                  {detail.requiresNote ? (
                    <span className="ml-1 text-red-500">*</span>
                  ) : null}
                </label>
                <Textarea
                  id="product-template-note"
                  value={note}
                  rows={4}
                  placeholder={labels.notePlaceholder}
                  className="min-h-28 resize-none"
                  containerClassName="mt-2 space-y-0"
                  onChange={(event) => setNote(event.target.value)}
                />
              </section>
            </div>

            <footer className="shrink-0 border-t border-border/70 bg-white px-5 py-4 shadow-[0_-14px_28px_-26px_rgba(15,23,42,0.35)] sm:px-7">
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                    {labels.total}
                  </p>
                  <p className="mt-0.5 text-2xl font-bold text-navy">
                    {formatCurrency(total)}
                  </p>
                </div>
                {detail.originalPrice && detail.originalPrice > total ? (
                  <span className="text-sm text-text-muted line-through">
                    {formatCurrency(detail.originalPrice)}
                  </span>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[15px] bg-surface-soft px-3 text-sm font-semibold text-navy transition hover:bg-primary-light"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="h-4 w-4" />
                  {labels.addToCart}
                </button>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[15px] bg-navy px-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
                  onClick={handleBuyNow}
                >
                  <Zap className="h-4 w-4 text-accent" />
                  {labels.buyNow}
                </button>
                <button
                  type="button"
                  className="col-span-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-[14px] border border-primary/15 bg-primary-light/45 px-3 text-sm font-semibold text-primary-dark transition hover:bg-primary-light"
                  onClick={handleConsultation}
                >
                  <MessageCircle className="h-4 w-4" />
                  {labels.consultation}
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </Modal>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-navy before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary">
      {children}
    </h3>
  );
}

function AccessoryRow({
  accessory,
  labels,
  onChange,
  quantity,
}: {
  accessory: ProductTemplateAccessory;
  labels: ProductDetailDictionary;
  onChange: (quantity: number) => void;
  quantity: number;
}) {
  return (
    <div className="rounded-[17px] border border-primary/20 bg-white p-3">
      <div className="flex items-center gap-3">
        <ProductImage
          src={accessoryImage(accessory)}
          alt={accessory.name}
          fill
          sizes="52px"
          compactFallback
          wrapperClassName="h-[52px] w-[52px] shrink-0 rounded-[12px] bg-surface-soft"
          className="object-contain p-1"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-navy">
            {accessory.name}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-primary-dark">
            {formatCurrency(accessory.price)}
            {accessory.originalPrice &&
            accessory.originalPrice > accessory.price ? (
              <span className="ml-2 font-normal text-text-muted line-through">
                {formatCurrency(accessory.originalPrice)}
              </span>
            ) : null}
          </p>
        </div>
        <div
          className="inline-flex h-9 shrink-0 items-center rounded-full bg-[#f1f6fa] p-1 ring-1 ring-inset ring-[#dce8f1]"
          aria-label={`${labels.quantity}: ${quantity}`}
        >
          <button
            type="button"
            aria-label={labels.removeAccessory}
            className="grid h-7 w-7 place-items-center rounded-full bg-white text-slate-600 transition-all duration-200 hover:bg-[#ffd33d] hover:text-[#10253f] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a900] motion-reduce:transition-none"
            onClick={() => onChange(quantity - 1)}
          >
            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <output
            aria-live="polite"
            className="min-w-8 px-1 text-center text-[13px] font-semibold tabular-nums text-slate-900"
          >
            {quantity}
          </output>
          <button
            type="button"
            aria-label={labels.addAccessory}
            disabled={quantity >= accessory.maxQuantity}
            className="grid h-7 w-7 place-items-center rounded-full bg-white text-slate-600 transition-all duration-200 hover:bg-amber-300 hover:text-slate-800 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82c5ec] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:shadow-none motion-reduce:transition-none"
            onClick={() => onChange(quantity + 1)}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
      {accessory.colorVariants.length > 0 ? (
        <div className="mt-2 flex gap-2 border-t border-border/60 pt-2">
          {accessory.colorVariants.map((color) => (
            <span
              key={`${accessory.id}-${color.name}`}
              title={color.name}
              className="h-5 w-5 rounded-full border-2 border-white ring-1 ring-border"
              style={{ backgroundColor: color.colorHex }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
