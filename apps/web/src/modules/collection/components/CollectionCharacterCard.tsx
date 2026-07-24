"use client";

import { formatCurrency, type Product } from "@lego-shop/shared";
import {
  ArrowRight,
  Box,
  PackagePlus,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { ProductImage } from "@/components/shared/ProductImage";
import { Modal } from "@/components/ui/Modal";
import { ROUTES, UI_MODAL_IDS } from "@/config/routes";
import { useCartStore, type CartItemPart } from "@/features/cart/store";
import { useUIStore } from "@/features/ui/store";
import { resolveApiAssetUrl } from "@/lib/api/assets";
import type { CollectionDictionary } from "@/lib/i18n/dictionaries";
import { withProductImageFallback } from "@/lib/product-image-fallback";

type CollectionCharacterCardProps = {
  labels: CollectionDictionary["characterProduct"];
  product: Product;
  productIndex: number;
  selected: boolean;
  onOpen: () => void;
  onClose: () => void;
};

function nonEmptyImageUrl(value: unknown): string | null {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }
  if (!value || typeof value !== "object") return null;
  const image = value as Record<string, unknown>;
  return (
    nonEmptyImageUrl(image.thumbnailUrl) ??
    nonEmptyImageUrl(image.primaryImageUrl) ??
    nonEmptyImageUrl(image.imageUrl) ??
    nonEmptyImageUrl(image.url) ??
    nonEmptyImageUrl(image.src)
  );
}

function characterImage(product: Product, productIndex: number) {
  const imageUrl = resolveApiAssetUrl(
    nonEmptyImageUrl(product.thumbnailUrl) ??
      product.images.map(nonEmptyImageUrl).find(Boolean) ??
      null,
  );
  return withProductImageFallback(imageUrl, product.slug, productIndex);
}

function openCartDrawer() {
  useCartStore.getState().openCart();
  useUIStore.getState().openModal(UI_MODAL_IDS.CART_DRAWER);
  window.dispatchEvent(new CustomEvent("legoshop:open-cart"));
}

function compositionParts(product: Product, imageUrl: string | null) {
  const composition = product.composition;
  const characterParts: CartItemPart[] = (composition?.characters ?? []).map(
    (item) => ({
      ...(item.id ? { id: item.id } : {}),
      type: "character",
      name: item.name,
      quantity: item.quantity ?? 1,
      unitPrice: 0,
      totalPrice: 0,
      imageUrl: item.imageUrl ?? imageUrl,
    }),
  );
  const accessoryParts: CartItemPart[] = (
    composition?.accessories ?? []
  ).map((item) => ({
    ...(item.id ? { id: item.id } : {}),
    type: "accessory",
    name: item.name,
    quantity: item.quantity ?? 1,
    unitPrice: 0,
    totalPrice: 0,
    imageUrl: item.imageUrl ?? null,
  }));
  return [...characterParts, ...accessoryParts];
}

function addStandaloneCharacter(
  product: Product,
  imageUrl: string | null,
  labels: CollectionCharacterCardProps["labels"],
) {
  useCartStore.getState().addItem({
    productId: product.id,
    lineItemType: "standalone_character",
    productType: product.productType,
    productName: product.name,
    quantity: 1,
    unitPrice: Math.max(0, Number(product.basePrice) || 0),
    serverValidatedPrice: Math.max(0, Number(product.basePrice) || 0),
    frameSizeId: `product:${product.id}`,
    frameSizeLabel: labels.typeBadge,
    frameColorName: "",
    parts: compositionParts(product, imageUrl),
    templateId: null,
    designData: {
      type: "RETAIL_ITEM",
      source: "collection-character-product",
      retailType: "product",
      retailItemId: product.id,
      productType: product.productType,
      characterPresetId: product.characterPresetId ?? null,
      componentCount: product.componentCount ?? 0,
      accessoryCount: product.accessoryCount ?? 0,
    },
    previewUrl: imageUrl,
  });
  openCartDrawer();
  toast.success(`${labels.added}: ${product.name}`);
}

export function CollectionCharacterCard({
  labels,
  onClose,
  onOpen,
  product,
  productIndex,
  selected,
}: CollectionCharacterCardProps) {
  const router = useRouter();
  const imageUrl = characterImage(product, productIndex);
  const price = Math.max(0, Number(product.basePrice) || 0);
  const compareAtPrice = Math.max(
    0,
    Number(product.compareAtPrice ?? product.originalPrice) || 0,
  );
  const showCompareAtPrice = compareAtPrice > price;
  const componentCount = Math.max(0, Number(product.componentCount) || 0);
  const accessoryCount = Math.max(0, Number(product.accessoryCount) || 0);
  const description =
    product.shortDescription?.trim() ||
    product.description?.trim() ||
    labels.fallbackDescription;

  const addToCart = () =>
    addStandaloneCharacter(product, imageUrl, labels);
  const customize = () => {
    const query = product.characterPresetId
      ? `?preset=${encodeURIComponent(product.characterPresetId)}`
      : "";
    router.push(`${ROUTES.studioCharacter}${query}`);
  };

  return (
    <>
      <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-border/80 bg-white shadow-[0_10px_28px_-22px_rgba(16,35,63,0.32)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_18px_34px_-26px_rgba(16,35,63,0.34)] motion-reduce:transform-none motion-reduce:transition-none">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 -translate-y-full bg-gradient-to-b from-white/30 to-transparent opacity-0 transition-[transform,opacity] duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:hidden" />
        <ProductImage
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(min-width: 1200px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          wrapperClassName="aspect-[4/3] w-full bg-[#edf3f8]"
          className="object-cover"
        />

        {product.featured ? (
          <span className="absolute left-3 top-3 z-20 inline-flex h-7 items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-2.5 text-[10px] font-extrabold uppercase tracking-[0.06em] text-navy">
            <Sparkles className="h-3.5 w-3.5" />
            {labels.featured}
          </span>
        ) : null}

        <div className="flex flex-1 flex-col p-5">
          <span className="w-fit rounded-full bg-primary-light/70 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.07em] text-primary-dark">
            {labels.typeBadge}
          </span>
          <h2 className="mt-3 line-clamp-2 text-xl font-extrabold leading-snug text-navy">
            {product.name}
          </h2>
          <p className="mt-2 line-clamp-2 min-h-12 text-sm font-medium leading-6 text-text-muted">
            {description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border/80 bg-slate-50 px-2.5 text-xs font-bold text-slate-700">
              <Box className="h-3.5 w-3.5 text-primary" />
              {labels.componentCount(componentCount)}
            </span>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border/80 bg-slate-50 px-2.5 text-xs font-bold text-slate-700">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {labels.accessoryCount(accessoryCount)}
            </span>
          </div>

          <div className="mt-auto flex items-end gap-2 pt-5">
            <span className="text-2xl font-extrabold text-navy">
              {formatCurrency(price)}
            </span>
            {showCompareAtPrice ? (
              <span className="pb-0.5 text-sm font-semibold text-slate-400 line-through">
                {formatCurrency(compareAtPrice)}
              </span>
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
            <button
              type="button"
              className="inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-extrabold text-navy transition-colors duration-200 hover:border-primary/35 hover:bg-primary-light/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
              onClick={onOpen}
            >
              {labels.viewDetails}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={`${labels.addToCart}: ${product.name}`}
              className="inline-flex size-11 items-center justify-center rounded-xl bg-navy text-white transition-[transform,background-color] duration-200 hover:-translate-y-px hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:translate-y-0 motion-reduce:transform-none"
              onClick={addToCart}
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        </div>
      </article>

      <Modal
        isOpen={selected}
        onClose={onClose}
        size="md"
        className="rounded-[28px] border border-border/80 bg-white shadow-[0_24px_70px_-30px_rgba(7,29,58,0.55)]"
        contentClassName="p-0"
      >
        <div className="grid max-h-[calc(100dvh-32px)] overflow-y-auto md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <ProductImage
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            wrapperClassName="min-h-72 bg-[#edf3f8] md:min-h-[520px]"
            className="object-cover"
          />
          <div className="relative flex flex-col p-6 sm:p-8">
            <button
              type="button"
              aria-label={labels.close}
              className="absolute right-4 top-4 inline-flex size-11 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
            <span className="w-fit rounded-full bg-primary-light/70 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.07em] text-primary-dark">
              {labels.typeBadge}
            </span>
            <h2 className="mt-4 pr-10 text-3xl font-extrabold leading-tight text-navy">
              {product.name}
            </h2>
            <p className="mt-3 text-sm font-medium leading-7 text-text-muted">
              {description}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border/80 bg-slate-50 p-4">
                <Box className="h-5 w-5 text-primary" />
                <p className="mt-2 text-sm font-extrabold text-navy">
                  {labels.componentCount(componentCount)}
                </p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-slate-50 p-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <p className="mt-2 text-sm font-extrabold text-navy">
                  {labels.accessoryCount(accessoryCount)}
                </p>
              </div>
            </div>
            <div className="mt-auto pt-8">
              <div className="flex flex-wrap items-end gap-2">
                <span className="text-3xl font-extrabold text-navy">
                  {formatCurrency(price)}
                </span>
                {showCompareAtPrice ? (
                  <span className="pb-1 text-sm font-semibold text-slate-400 line-through">
                    {formatCurrency(compareAtPrice)}
                  </span>
                ) : null}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-extrabold text-navy transition-colors hover:border-primary/35 hover:bg-primary-light/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                  onClick={customize}
                >
                  {labels.customize}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-extrabold text-white transition-[transform,background-color] hover:-translate-y-px hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:translate-y-0 motion-reduce:transform-none"
                  onClick={addToCart}
                >
                  <PackagePlus className="h-4 w-4" />
                  {labels.addToCart}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
