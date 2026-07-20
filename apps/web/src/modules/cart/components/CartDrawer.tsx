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
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  X,
} from "lucide-react";

import { formatCurrency as formatPrice } from "@lego-shop/shared";
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

export type CartDrawerProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
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

const PART_LABELS: Record<CartItemPartType, string> = {
  frame: "Khung",
  background: "Nền thiết kế",
  character: "Nhân vật",
  character_part: "Chi tiết nhân vật",
  accessory: "Phụ kiện",
  product: "Sản phẩm",
  retail: "Sản phẩm bán lẻ",
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
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

function CartPreviewImage({
  src,
  alt,
}: {
  src: string | null;
  alt: string;
}) {
  const [errored, setErrored] = React.useState(false);
  const showImage = Boolean(src) && !errored;

  return (
    <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#edf7fd] to-white ring-1 ring-inset ring-[#dbeaf4] sm:h-[84px] sm:w-[84px]">
      {showImage ? (
        <img
          src={src ?? ""}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035] motion-reduce:transition-none"
          draggable={false}
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="grid h-full w-full place-items-center">
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
  const canDecrease = quantity > 1;
  const canIncrease = quantity < 10;

  return (
    <div className="inline-flex h-9 shrink-0 items-center rounded-full bg-[#f1f6fa] p-1 ring-1 ring-inset ring-[#dce8f1]">
      <button
        type="button"
        aria-label="Giảm số lượng"
        disabled={!canDecrease}
        onClick={() => onChange(Math.max(1, quantity - 1))}
        className="grid h-7 w-7 place-items-center rounded-full text-slate-500 transition-all duration-200 hover:bg-white hover:text-[#2588c8] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82c5ec] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:shadow-none motion-reduce:transition-none"
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
        aria-label="Tăng số lượng"
        disabled={!canIncrease}
        onClick={() => onChange(Math.min(10, quantity + 1))}
        className="grid h-7 w-7 place-items-center rounded-full text-slate-500 transition-all duration-200 hover:bg-white hover:text-[#2588c8] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82c5ec] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:shadow-none motion-reduce:transition-none"
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
  const quantity = getPerDesignQuantity(part, itemQuantity);
  const name = safeText(part.name, PART_LABELS[part.type]);
  const price = part.totalPrice > 0 ? formatPrice(part.totalPrice) : "Đã gồm";

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-1.5 text-[11px] leading-4 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <span className="text-slate-400">{PART_LABELS[part.type]}:</span>{" "}
        <span className="font-medium text-slate-700">{name}</span>
        {quantity > 1 ? (
          <span className="ml-1 text-slate-400">×{quantity}</span>
        ) : null}
      </div>
      <span className="whitespace-nowrap font-semibold tabular-nums text-slate-500">
        {price}
      </span>
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
  const [expanded, setExpanded] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const removalTimer = React.useRef<number | null>(null);
  const productName = safeText(item.productName, "Sản phẩm Figure Lab");
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
        "group rounded-[22px] bg-white p-3.5 ring-1 ring-inset ring-[#dfe9f1] transition-all duration-200 ease-out hover:-translate-y-px hover:ring-[#bcdcee] hover:shadow-[0_14px_34px_-28px_rgba(15,45,75,0.42)] motion-reduce:transform-none motion-reduce:transition-none",
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
                  <OptionChip>{summary.characters} NV</OptionChip>
                ) : null}
                {summary.accessories > 0 ? (
                  <OptionChip>{summary.accessories} charm</OptionChip>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              aria-label={`Xóa ${productName}`}
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
            <span className="whitespace-nowrap text-[16px] font-bold tabular-nums text-[#258fce]">
              {formatPrice(item.totalPrice)}
            </span>
          </div>
        </div>
      </div>

      {detailParts.length > 0 ? (
        <div className="mt-3 rounded-2xl bg-[#f7fafc] px-3 py-2.5 ring-1 ring-inset ring-[#e5edf3]">
          <ul className="divide-y divide-[#e5edf3]">
            {visibleParts.map((part, index) => (
              <PartRow
                key={`${part.type}-${part.id ?? part.name}-${index}`}
                part={part}
                itemQuantity={item.quantity}
              />
            ))}
          </ul>

          {detailParts.length > 3 ? (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#2588c8] transition-colors hover:text-[#176995] focus-visible:outline-none focus-visible:underline"
            >
              {expanded ? "Thu gọn tùy chọn" : `Xem thêm ${hiddenPartCount} tùy chọn`}
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          ) : null}
        </div>
      ) : null}

      {item.note ? (
        <p className="mt-2.5 line-clamp-2 rounded-xl bg-[#fff9e7] px-3 py-2 text-[11px] leading-4 text-[#735d22]">
          <span className="font-semibold">Ghi chú:</span>{" "}
          {safeText(item.note, "")}
        </p>
      ) : null}
    </article>
  );
}

export const CartDrawer = React.forwardRef<HTMLDivElement, CartDrawerProps>(
  ({ className, style, ...props }, forwardedRef) => {
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
    const [mounted, setMounted] = React.useState(false);
    const [isEventOpen, setIsEventOpen] = React.useState(false);
    const [shouldRender, setShouldRender] = React.useState(false);
    const [entered, setEntered] = React.useState(false);
    const titleId = React.useId();
    const closeButtonRef = React.useRef<HTMLButtonElement>(null);
    const previousFocusRef = React.useRef<HTMLElement | null>(null);
    const isOpen =
      activeModal === UI_MODAL_IDS.CART_DRAWER || isCartOpen || isEventOpen;

    React.useEffect(() => {
      setMounted(true);
    }, []);

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
      let firstFrame = 0;
      let secondFrame = 0;
      let closeTimer: number | undefined;

      if (isOpen) {
        firstFrame = window.requestAnimationFrame(() => {
          setShouldRender(true);
          secondFrame = window.requestAnimationFrame(() => setEntered(true));
        });
      } else {
        firstFrame = window.requestAnimationFrame(() => {
          setEntered(false);
          closeTimer = window.setTimeout(() => setShouldRender(false), 280);
        });
      }

      return () => {
        if (firstFrame) window.cancelAnimationFrame(firstFrame);
        if (secondFrame) window.cancelAnimationFrame(secondFrame);
        if (closeTimer) window.clearTimeout(closeTimer);
      };
    }, [isOpen]);

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

      const previousOverflow = document.body.style.overflow;
      const previousPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        document.body.style.overflow = previousOverflow;
        document.body.style.paddingRight = previousPaddingRight;
      };
    }, [isOpen]);

    if (!mounted || !shouldRender) return null;

    return createPortal(
      <>
        <div
          aria-hidden="true"
          data-cart-drawer-backdrop="true"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) handleClose();
          }}
          className={cn(
            "fixed inset-0 z-[1200] bg-[#071a2f]/45 backdrop-blur-[3px] transition-opacity duration-300 ease-out motion-reduce:transition-none",
            entered ? "opacity-100" : "opacity-0",
          )}
        />

        <div
          {...props}
          ref={forwardedRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          data-cart-drawer-panel="true"
          className={cn(
            "fixed inset-y-0 right-0 z-[1210] flex h-[100dvh] w-full max-w-[520px] flex-col overflow-hidden bg-[#f6f9fb] shadow-[-28px_0_80px_-46px_rgba(7,29,58,0.6)] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:rounded-l-[28px]",
            entered ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
            className,
          )}
          style={style}
        >
          <header className="flex min-h-[76px] shrink-0 items-center justify-between border-b border-[#e0eaf1] bg-white/95 px-4 backdrop-blur-xl sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#edf7fd] text-[#258fce] ring-1 ring-inset ring-[#d7ebf7]">
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2
                  id={titleId}
                  className="text-[21px] font-bold tracking-[-0.02em] text-[#0c213b]"
                >
                  Giỏ hàng
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {itemCount > 0 ? `${itemCount} sản phẩm` : "Chưa có sản phẩm"}
                </p>
              </div>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Đóng giỏ hàng"
              onClick={handleClose}
              className="grid h-10 w-10 place-items-center rounded-full bg-[#f4f7f9] text-slate-500 ring-1 ring-inset ring-[#e0e8ef] transition-all duration-200 hover:rotate-3 hover:bg-white hover:text-slate-900 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82c5ec] motion-reduce:transform-none motion-reduce:transition-none"
            >
              <X className="h-[19px] w-[19px]" aria-hidden="true" />
            </button>
          </header>

          <div className="shrink-0 px-4 pb-2 pt-4 sm:px-6">
            <div className="flex items-center gap-3 rounded-2xl bg-[#eaf5fc] px-3.5 py-2.5 text-[12px] leading-[1.45] text-[#385b73] ring-1 ring-inset ring-[#d2e8f5]">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-[#258fce] shadow-sm">
                <Truck className="h-4 w-4" aria-hidden="true" />
              </div>
              <p>
                Phí giao hàng được xác nhận trước khi giao và thanh toán trực
                tiếp cho đơn vị vận chuyển.
              </p>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-5 pt-2 [scrollbar-gutter:stable] sm:px-6">
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
                  Giỏ hàng đang chờ món quà đầu tiên
                </h3>
                <p className="mt-2 max-w-[330px] text-sm leading-6 text-slate-500">
                  Chọn một thiết kế có sẵn hoặc bắt đầu sáng tạo món quà mang
                  câu chuyện riêng của bạn.
                </p>
                <Link
                  href={ROUTES.collection}
                  onClick={handleClose}
                  className="group mt-6 inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#258fce] px-6 text-sm font-semibold text-white shadow-[0_12px_28px_-18px_rgba(37,143,206,0.9)] transition-all duration-200 hover:-translate-y-px hover:bg-[#1d7fb8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82c5ec] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
                >
                  Khám phá bộ sưu tập
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
            <footer className="shrink-0 border-t border-[#dce8f1] bg-white/95 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 shadow-[0_-18px_45px_-38px_rgba(7,29,58,0.65)] backdrop-blur-xl sm:px-6">
              <div className="mb-1.5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Tạm tính
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <Sparkles className="h-3.5 w-3.5 text-[#e4b72f]" />
                    Phí giao hàng sẽ được báo riêng
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
                  className="grid h-12 place-items-center rounded-2xl bg-white text-center text-[13px] font-semibold text-[#17334f] ring-1 ring-inset ring-[#cfdde8] transition-all duration-200 hover:-translate-y-px hover:bg-[#f8fbfd] hover:ring-[#9fcbe5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82c5ec] motion-reduce:transform-none motion-reduce:transition-none"
                >
                  Xem giỏ hàng
                </Link>

                <Link
                  href={ROUTES.checkout}
                  onClick={handleClose}
                  className="group relative grid h-12 overflow-hidden place-items-center rounded-2xl bg-[#258fce] text-center text-[13px] font-semibold text-white shadow-[0_12px_30px_-20px_rgba(37,143,206,0.95)] transition-all duration-200 before:absolute before:inset-y-0 before:left-[-45%] before:w-1/3 before:-skew-x-12 before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent before:transition-transform before:duration-700 hover:-translate-y-px hover:bg-[#1d7fb8] hover:before:translate-x-[430%] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82c5ec] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:before:hidden"
                >
                  <span className="relative z-10">Thanh toán</span>
                </Link>
              </div>
            </footer>
          ) : null}
        </div>
      </>,
      document.body,
    );
  },
);

CartDrawer.displayName = "CartDrawer";
