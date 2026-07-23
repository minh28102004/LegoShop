"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Minus,
  Package,
  Plus,
  Sparkles,
  Trash2,
  Truck,
  X,
  ShoppingCart,
  CreditCard,
} from "lucide-react";

import { formatCurrency as formatPrice } from "@lego-shop/shared";
import { Badge } from "@/components/ui/Badge";
import { ROUTES, UI_MODAL_IDS } from "@/config/routes";
import { getCartItemParts } from "@/features/cart/cart-parts";
import { useCart } from "@/features/cart/hooks/useCart";
import type {
  CartItemPart,
  CartItemPartType,
  SimpleCartItem,
} from "@/features/cart/store";
import { selectActiveModal, useUIStore } from "@/features/ui/store";
import { resolveApiAssetUrl } from "@/lib/api/assets";
import { AnimatePresence, motion } from "framer-motion";
import { useCartText } from "@/lib/i18n/useI18n";

export type CartDrawerProps = Omit<
  React.ComponentPropsWithoutRef<typeof motion.div>,
  "children"
>;

const CP1252_BYTES: Record<number, number> = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c,
  0x017d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c,
  0x017e: 0x9e,
  0x0178: 0x9f,
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const subscribeToClient = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsClient() {
  return React.useSyncExternalStore(
    subscribeToClient,
    getClientSnapshot,
    getServerSnapshot,
  );
}

function repairMojibake(value: string) {
  if (!/[ÃÂÄÆ]|áº|á»|â€|â€™|â€œ|â€/.test(value)) return value;

  try {
    const bytes = Array.from(value, (character) => {
      const code = character.charCodeAt(0);
      return code <= 0xff ? code : (CP1252_BYTES[code] ?? -1);
    });

    if (bytes.some((byte) => byte < 0)) return value;

    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(
      Uint8Array.from(bytes),
    );

    return decoded.includes("�") ? value : decoded;
  } catch {
    return value;
  }
}

function safeText(value: string | null | undefined, fallback: string) {
  const normalized = value?.trim();
  return normalized ? repairMojibake(normalized) : fallback;
}

function getPerDesignQuantity(part: CartItemPart, itemQuantity: number) {
  return Math.max(1, Math.round(part.quantity / Math.max(1, itemQuantity)));
}

function getItemSummary(parts: CartItemPart[], itemQuantity: number) {
  return parts.reduce(
    (summary, part) => {
      const quantity = getPerDesignQuantity(part, itemQuantity);

      if (part.type === "character") summary.characters += quantity;
      if (part.type === "accessory") summary.accessories += quantity;

      return summary;
    },
    { characters: 0, accessories: 0 },
  );
}

function CartPreviewImage({ src, alt }: { src: string | null; alt: string }) {
  const [errored, setErrored] = React.useState(false);
  const showImage = Boolean(src) && !errored;

  return (
    <div className="relative aspect-square h-[100px] shrink-0 overflow-hidden rounded-sm border border-[#d9e6f0] bg-white">
      {showImage ? (
        <img
          src={src ?? ""}
          alt={alt}
          className="h-full w-full rounded-none object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035] motion-reduce:transition-none"
          draggable={false}
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-[#f8fbfd]">
          <Package className="h-7 w-7 text-[#8eb8d3]" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

function QuantityStepper({
  quantity,
  onChange,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
}) {
  const text = useCartText();
  const canDecrease = quantity > 1;
  const canIncrease = quantity < 10;

  return (
    <div className="inline-flex h-9 shrink-0 items-center rounded-full bg-[#f1f6fa] p-1 ring-1 ring-inset ring-[#dce8f1]">
      <button
        type="button"
        aria-label={text.decreaseQuantity}
        disabled={!canDecrease}
        onClick={() => onChange(Math.max(1, quantity - 1))}
        className="grid h-7 w-7 place-items-center rounded-full bg-white text-slate-600 transition-all duration-200 hover:bg-[#ffd33d] hover:text-[#10253f] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a900] disabled:cursor-not-allowed disabled:bg-transparent disabled:opacity-35 disabled:shadow-none motion-reduce:transition-none"
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
        aria-label={text.increaseQuantity}
        disabled={!canIncrease}
        onClick={() => onChange(Math.min(10, quantity + 1))}
        className="grid h-7 w-7 place-items-center rounded-full text-slate-600 bg-white transition-all duration-200 hover:bg-amber-300 hover:text-slate-800 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82c5ec] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:shadow-none motion-reduce:transition-none"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

function OptionChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex min-h-6 items-center rounded-full bg-[#edf7fd] px-2.5 py-1 text-[10px] font-semibold leading-none text-[#247fb8] ring-1 ring-inset ring-[#d7ebf7]">
      {children}
    </span>
  );
}

function PartRow({
  part,
  itemQuantity,
}: {
  part: CartItemPart;
  itemQuantity: number;
}) {
  const text = useCartText();
  const partLabels: Record<CartItemPartType, string> = {
    frame: text.frame,
    background: text.background,
    character: text.characters,
    character_part: text.characterPart,
    accessory: text.accessories,
    product: text.product,
    retail: text.product,
  };
  const quantityPerItem = getPerDesignQuantity(part, itemQuantity);
  const totalQuantity = quantityPerItem * itemQuantity;
  const name = safeText(part.name, partLabels[part.type]);
  const isIncluded = part.totalPrice <= 0;

  return (
    <li className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-3 py-2 first:pt-1.5 transition-colors duration-200 hover:bg-[#f8fbfd]">
      <div className="flex min-w-0 items-center gap-2">
        <span className="w-[86px] shrink-0 text-[11px] font-semibold text-slate-400">
          {partLabels[part.type]}
        </span>

        <span
          title={name}
          className="min-w-0 truncate text-[12px] font-semibold text-[#263b55]"
        >
          {name}
        </span>

        <span className="shrink-0 text-[11px] font-medium tabular-nums text-[#247fb8]">
          ×{totalQuantity}
        </span>
      </div>

      {isIncluded ? (
        <span className="inline-flex h-6 items-center rounded-md bg-emerald-50 px-2 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
          {text.included}
        </span>
      ) : (
        <span className="whitespace-nowrap text-[11px] font-bold tabular-nums text-slate-700">
          {formatPrice(part.totalPrice)}
        </span>
      )}
    </li>
  );
}

function CartItemRow({
  item,
  onRemove,
  onQuantityChange,
}: {
  item: SimpleCartItem;
  onRemove: () => void;
  onQuantityChange: (quantity: number) => void;
}) {
  const text = useCartText();
  const [expanded, setExpanded] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const removalTimer = React.useRef<number | null>(null);
  const productName = safeText(item.productName, text.productFallback);
  const previewUrl = resolveApiAssetUrl(item.previewUrl);
  const parts = React.useMemo(() => getCartItemParts(item), [item]);
  const summary = React.useMemo(
    () => getItemSummary(parts, item.quantity),
    [item.quantity, parts],
  );
  const detailParts = parts.filter(
    (part) =>
      !(
        (part.type === "product" || part.type === "retail") &&
        safeText(part.name, "") === productName
      ),
  );
  const visibleParts = expanded ? detailParts : detailParts.slice(0, 3);
  const hiddenPartCount = detailParts.length - visibleParts.length;
  const frameLabel = safeText(item.frameSizeLabel, "");
  const frameColor = safeText(item.frameColorName, "");

  React.useEffect(
    () => () => {
      if (removalTimer.current) window.clearTimeout(removalTimer.current);
    },
    [],
  );

  function handleRemove() {
    setRemoving(true);
    removalTimer.current = window.setTimeout(onRemove, 180);
  }

  return (
    <article
      className={cn(
        "group rounded-[22px] bg-white p-3.5 ring-1 ring-inset ring-[#dfe9f1] shadow-sm transition-all duration-500 ease-[cubic-bezier(0.34,1.42,0.64,1)] hover:-translate-y-0.5 hover:ring-[#bcdcee] hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none",
        removing && "translate-x-4 opacity-0",
      )}
    >
      <div className="flex items-start gap-3">
        <CartPreviewImage src={previewUrl} alt={productName} />

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3
                title={productName}
                className="line-clamp-2 text-[14px] font-semibold leading-[1.35] text-[#10253f] sm:text-[15px]"
              >
                {productName}
              </h3>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {frameLabel ? <OptionChip>{frameLabel}</OptionChip> : null}
                {frameColor ? <OptionChip>{frameColor}</OptionChip> : null}
                {summary.characters > 0 ? (
                  <OptionChip>{text.characterCount(summary.characters)}</OptionChip>
                ) : null}
                {summary.accessories > 0 ? (
                  <OptionChip>{text.charmCount(summary.accessories)}</OptionChip>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              aria-label={text.removeNamed(productName)}
              onClick={handleRemove}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 transition-all duration-200 hover:bg-rose-50 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 motion-reduce:transition-none"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <QuantityStepper
              quantity={item.quantity}
              onChange={onQuantityChange}
            />
            <span className="whitespace-nowrap text-[16px] font-bold tabular-nums text-slate-700">
              {formatPrice(item.totalPrice)}
            </span>
          </div>
        </div>
      </div>

      {detailParts.length > 0 ? (
        <div className="mt-3 overflow-hidden rounded-[18px] border border-[#dce8f1] bg-white shadow-none">
          {/* Tiêu đề */}
          <div className="flex items-center justify-between border-b border-[#e2ebf2] bg-white/80 px-3.5 py-2.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#536b89]">
              {text.configurationTitle}
            </span>

            <span className="inline-flex h-5 items-center rounded-full bg-[#edf7fd] px-2 text-[10px] font-semibold text-[#247fb8]">
              {text.configurationItemCount(detailParts.length)}
            </span>
          </div>

          {/* Danh sách */}
          <ul className="divide-y divide-[#e4ecf2] px-1.5">
            {visibleParts.map((part, index) => (
              <PartRow
                key={`${part.type}-${part.id ?? part.name}-${index}`}
                part={part}
                itemQuantity={item.quantity}
              />
            ))}
          </ul>

          {/* Xem thêm / Thu gọn */}
          {detailParts.length > 3 ? (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              aria-expanded={expanded}
              className="group flex w-full items-center justify-center gap-1.5 border-t border-[#e2ebf2] bg-white/70 px-3 py-2.5 text-[11px] font-bold text-[#2588c8] transition-colors duration-200 hover:bg-[#edf7fd] hover:text-[#176995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#82c5ec]"
            >
              <span>
                {expanded
                  ? text.collapseOptions
                  : text.showMoreOptions(hiddenPartCount)}
              </span>

              {expanded ? (
                <ChevronUp
                  className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              ) : (
                <ChevronDown
                  className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-y-0.5"
                  aria-hidden="true"
                />
              )}
            </button>
          ) : null}
        </div>
      ) : null}

      {item.note ? (
        <p className="mt-2.5 line-clamp-2 rounded-xl bg-[#fff9e7] px-3 py-2 text-[11px] leading-4 text-[#735d22]">
          <span className="font-semibold">{text.notePrefix}</span>{" "}
          {safeText(item.note, "")}
        </p>
      ) : null}
    </article>
  );
}

export const CartDrawer = React.forwardRef<HTMLDivElement, CartDrawerProps>(
  ({ className, style, ...props }, forwardedRef) => {
    const text = useCartText();
    const activeModal = useUIStore(selectActiveModal);
    const closeModal = useUIStore((state) => state.closeModal);
    const {
      isEmpty,
      items,
      itemCount,
      removeItem,
      totalAmount,
      updateQuantity,
      isOpen: isCartOpen,
      closeCart,
    } = useCart();
    const isClient = useIsClient();
    const [isEventOpen, setIsEventOpen] = React.useState(false);
    const titleId = React.useId();
    const closeButtonRef = React.useRef<HTMLButtonElement>(null);
    const previousFocusRef = React.useRef<HTMLElement | null>(null);
    const isOpen =
      activeModal === UI_MODAL_IDS.CART_DRAWER || isCartOpen || isEventOpen;

    const handleClose = React.useCallback(() => {
      setIsEventOpen(false);
      closeCart();
      closeModal();
    }, [closeCart, closeModal]);

    React.useEffect(() => {
      const openDrawer = () => setIsEventOpen(true);
      window.addEventListener("legoshop:open-cart", openDrawer);
      return () => window.removeEventListener("legoshop:open-cart", openDrawer);
    }, []);

    React.useEffect(() => {
      if (!isOpen) return;

      previousFocusRef.current = document.activeElement as HTMLElement | null;
      const focusFrame = window.requestAnimationFrame(() => {
        closeButtonRef.current?.focus({ preventScroll: true });
      });

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") handleClose();
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.cancelAnimationFrame(focusFrame);
        window.removeEventListener("keydown", handleKeyDown);
        previousFocusRef.current?.focus?.({ preventScroll: true });
      };
    }, [handleClose, isOpen]);

    React.useEffect(() => {
      if (!isOpen) return;

      const scrollRoot = document.getElementById("site-scroll-root");
      if (!scrollRoot) return;

      const previousOverflow = scrollRoot.style.overflow;
      scrollRoot.style.overflow = "hidden";

      return () => {
        scrollRoot.style.overflow = previousOverflow;
      };
    }, [isOpen]);

    if (!isClient) return null;

    return createPortal(
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            key="cart-drawer-backdrop"
            aria-hidden="true"
            data-cart-drawer-backdrop="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) handleClose();
            }}
            className="fixed inset-0 z-[1200] bg-[#071a2f]/45 backdrop-blur-[3px]"
          />
        ) : null}

        {isOpen ? (
          <motion.div
            key="cart-drawer-panel"
            {...props}
            ref={forwardedRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-cart-drawer-panel="true"
            initial={{ x: "100%", opacity: 0.92 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.92 }}
            transition={{
              type: "spring",
              stiffness: 360,
              damping: 36,
              mass: 0.85,
            }}
            className={cn(
              "fixed inset-y-0 right-0 z-[1210] flex h-[100dvh] w-full max-w-[520px] flex-col overflow-hidden bg-slate-100 shadow-[-28px_0_80px_-46px_rgba(7,29,58,0.6)] sm:rounded-l-[4px]",
              className,
            )}
            style={style ?? {}}
          >
            <header className="flex min-h-[76px] shrink-0 items-center justify-between border-b border-[#e0eaf1] bg-white/95 px-4 backdrop-blur-xl sm:px-6">
              <div className="flex min-w-0 items-center gap-1.5">
                <div className="grid h-12 w-12 shrink-0 place-items-center">
                  <span
                    aria-hidden="true"
                    className="text-[36px] leading-none"
                  >
                    🛒
                  </span>
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                  <h2
                    id={titleId}
                    className="whitespace-nowrap text-[21px] font-bold tracking-[-0.02em] text-[#0c213b]"
                  >
                    {text.breadcrumbCart}
                  </h2>
                  {itemCount > 0 ? (
                    <Badge
                      variant="highlight"
                      size="sm"
                      className="h-7 min-w-7 justify-center px-2.5 text-xs font-semibold"
                    >
                      {text.itemCount(itemCount)}
                    </Badge>
                  ) : (
                    <p className="text-xs text-slate-500">
                      {text.drawerEmptyLabel}
                    </p>
                  )}
                </div>
              </div>

              <motion.button
                type="button"
                onClick={handleClose}
                aria-label={text.closeDrawer}
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-md bg-transparent p-2 text-slate-800 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffe16a]/45"
              >
                <X className="h-[22px] w-[22px]" aria-hidden="true" />
              </motion.button>
            </header>

            <div className="shrink-0 px-4 py-2 sm:px-6">
              <div className="flex items-center gap-3 rounded-2xl bg-[#eaf5fc] px-3.5 py-2.5 text-[12px] leading-[1.45] text-[#385b73] ring-1 ring-inset ring-[#d2e8f5]">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-[#258fce] shadow-sm">
                  <Truck className="h-4 w-4" aria-hidden="true" />
                </div>
                <p>{text.shippingDescription}</p>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-5 pt-0 sm:px-6">
              {isEmpty ? (
                <div className="flex h-full min-h-[390px] flex-col items-center justify-center px-5 text-center">
                  <div className="relative mb-5 grid h-28 w-28 place-items-center rounded-[32px] bg-gradient-to-br from-[#e8f5fd] via-white to-[#fff7d9] ring-1 ring-inset ring-[#dceaf3] shadow-[0_22px_45px_-35px_rgba(37,143,206,0.7)]">
                    <Image
                      src="/assets/icons/fluent-emoji/package-3d.png"
                      alt=""
                      width={72}
                      height={72}
                      className="h-[72px] w-[72px] object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-bold tracking-[-0.02em] text-[#10253f]">
                    {text.emptyTitle}
                  </h3>
                  <p className="mt-2 max-w-[330px] text-sm leading-6 text-slate-500">
                    {text.emptyDescription}
                  </p>
                  <Link
                    href={ROUTES.collection}
                    onClick={handleClose}
                    className="group mt-6 inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#258fce] px-6 text-sm font-semibold text-white shadow-[0_12px_28px_-18px_rgba(37,143,206,0.9)] transition-all duration-200 hover:-translate-y-px hover:bg-[#1d7fb8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82c5ec] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
                  >
                    {text.exploreCollection}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 py-1">
                  {items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onRemove={() => removeItem(item.id)}
                      onQuantityChange={(quantity) =>
                        updateQuantity(item.id, quantity)
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {!isEmpty ? (
              <footer className="shrink-0 border-t border-[#dce8f1] bg-white/95 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 shadow-[0_-4px_12px_-10px_rgba(7,29,58,0.15)] backdrop-blur-xl sm:px-6">
                <div className="mb-1.5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#536b89]">
                      {text.subtotal}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-black text-[#30465f]">
                      <Sparkles className="h-3.5 w-3.5 text-[#e4b72f]" />
                      {text.shippingValue}
                    </p>
                  </div>
                  <strong className="shrink-0 text-[25px] font-bold tracking-[-0.025em] tabular-nums text-[#0b213b]">
                    {formatPrice(totalAmount)}
                  </strong>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <Link
                    href={ROUTES.cart}
                    onClick={handleClose}
                    className="group flex h-12 items-center justify-center gap-2 rounded-2xl bg-white text-[13px] font-semibold text-[#17334f] ring-1 ring-inset ring-[#cfdde8] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f4faff] hover:text-[#258fce] hover:ring-[#9fcbe5] hover:shadow-[0_12px_25px_-18px_rgba(37,143,206,0.8)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82c5ec] motion-reduce:transform-none"
                  >
                    <ShoppingCart
                      className="h-[17px] w-[17px] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110"
                      aria-hidden="true"
                    />

                    <span>{text.viewCart}</span>
                  </Link>

                  <Link
                    href={ROUTES.checkout}
                    onClick={handleClose}
                    className="group relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#258fce] text-[13px] font-semibold text-white shadow-[0_12px_30px_-20px_rgba(37,143,206,0.95)] transition-all duration-300 before:absolute before:inset-y-0 before:left-[-45%] before:w-1/3 before:-skew-x-12 before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent before:transition-transform before:duration-700 hover:-translate-y-0.5 hover:bg-[#1d7fb8] hover:shadow-[0_16px_30px_-16px_rgba(37,143,206,0.9)] hover:before:translate-x-[430%] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82c5ec] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:before:hidden"
                  >
                    <CreditCard
                      className="relative z-10 h-[17px] w-[17px] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
                      aria-hidden="true"
                    />

                    <span className="relative z-10">
                      {text.checkoutShort}
                    </span>

                    <ArrowRight
                      className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </footer>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>,
      document.body,
    );
  },
);

CartDrawer.displayName = "CartDrawer";
