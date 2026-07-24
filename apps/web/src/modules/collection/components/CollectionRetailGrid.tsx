"use client";

import { formatCurrency } from "@lego-shop/shared";
import { ArrowRight, PackagePlus } from "lucide-react";
import toast from "react-hot-toast";

import { ProductImage } from "@/components/shared/ProductImage";
import { UI_MODAL_IDS } from "@/config/routes";
import { useCartStore, type CartItemPartType } from "@/features/cart/store";
import { useUIStore } from "@/features/ui/store";
import type { CollectionDictionary } from "@/lib/i18n/dictionaries";
import type { CollectionRetailItem } from "@/modules/collection/types/collection.types";

type CollectionRetailGridProps = {
  items: CollectionRetailItem[];
  labels: CollectionDictionary;
};

function cartPartType(type: CollectionRetailItem["type"]): CartItemPartType {
  return type === "frame" ? "frame" : type;
}

function openCartDrawer() {
  useCartStore.getState().openCart();
  useUIStore.getState().openModal(UI_MODAL_IDS.CART_DRAWER);
  window.dispatchEvent(new CustomEvent("legoshop:open-cart"));
}

export function CollectionRetailGrid({
  items,
  labels,
}: CollectionRetailGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-border bg-white px-6 py-16 text-center">
        <PackagePlus className="mx-auto h-10 w-10 text-primary/55" />
        <h2 className="mt-4 text-xl font-bold text-navy">
          {labels.retail.emptyTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-text-muted">
          {labels.retail.emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 min-[1200px]:grid-cols-4 xl:grid-cols-4 xl:gap-6">
      {items.map((item) => (
        <article
          key={`${item.type}:${item.id}`}
          className="group flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-border/80 bg-white shadow-[0_8px_24px_-16px_rgba(16,35,63,0.28)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_20px_45px_-32px_rgba(16,35,63,0.38)] motion-reduce:transform-none"
        >
          <ProductImage
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(min-width: 1200px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            wrapperClassName="aspect-[4/3] w-full bg-[#edf3f8]"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035] motion-reduce:transform-none"
          />

          <div className="flex flex-1 flex-col p-5">
            <span className="w-fit rounded-full bg-primary-light/65 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-primary-dark">
              {labels.retail[item.type]}
            </span>
            <h2 className="mt-3 line-clamp-2 text-lg font-bold leading-snug text-navy">
              {item.name}
            </h2>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-muted">
              {item.description || labels.retail.fallback}
            </p>

            <div className="mt-auto flex items-end justify-between gap-3 pt-5">
              <span className="text-xl font-bold text-primary-dark">
                {formatCurrency(item.price)}
              </span>
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-navy px-3.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition-all duration-200 hover:-translate-y-px hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 active:translate-y-0 motion-reduce:transform-none"
                onClick={() => {
                  const type = cartPartType(item.type);
                  useCartStore.getState().addItem({
                    productId: null,
                    productName: item.name,
                    quantity: 1,
                    unitPrice: item.price,
                    frameSizeId: `${item.type}:${item.id}`,
                    frameSizeLabel: item.name,
                    frameColorName: "",
                    parts: [
                      {
                        id: item.id,
                        type,
                        name: item.name,
                        quantity: 1,
                        unitPrice: item.price,
                        totalPrice: item.price,
                        imageUrl: item.imageUrl,
                      },
                    ],
                    designData: {
                      source: "collection-retail",
                      retailType: item.type,
                      retailItemId: item.id,
                    },
                    previewUrl: item.imageUrl,
                  });
                  openCartDrawer();
                  toast.success(`${labels.retail.added}: ${item.name}`);
                }}
              >
                {labels.retail.add}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
