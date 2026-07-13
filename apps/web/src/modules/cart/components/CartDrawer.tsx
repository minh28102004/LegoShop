"use client";

// UI VERSION: gray drawer body + red cart count + square quantity control

import * as React from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Minus, Package, Plus, ShoppingBag, Truck, X } from "lucide-react";
import { formatCurrency as formatPrice } from "@lego-shop/shared";
import { ROUTES, UI_MODAL_IDS } from "@/config/routes";
import { useCart } from "@/features/cart/hooks/useCart";
import { getCartItemParts } from "@/features/cart/cart-parts";
import { resolveApiAssetUrl } from "@/lib/api/assets";
import { selectActiveModal, useUIStore } from "@/features/ui/store";
import type { SimpleCartItem } from "@/features/cart/store";

export type CartDrawerProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
>;

type CartPartLike = {
  type: string;
  id?: string | number;
  name: string;
  imageUrl?: string | null;
  quantity: number;
  totalPrice: number;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function CartPreviewImage({
  src,
  alt,
  size = "main",
}: {
  src: string | null;
  alt: string;
  size?: "main" | "part";
}) {
  const [errored, setErrored] = React.useState(false);

  React.useEffect(() => {
    setErrored(false);
  }, [src]);

  const showImage = Boolean(src) && !errored;
  const wrapperClass =
    size === "main"
      ? "h-[72px] w-[72px] rounded-[16px] border-[#dfe8ef] bg-[#f7fafc]"
      : "h-9 w-9 rounded-[12px] border-[#e2eaf1] bg-white";
  const iconClass = size === "main" ? "h-7 w-7" : "h-4 w-4";

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden border",
        wrapperClass,
      )}
    >
      {showImage ? (
        <img
          src={src ?? ""}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
          onError={() => setErrored(true)}
        />
      ) : (
        <Package
          className={cn(iconClass, "text-[#9db3c8]")}
          aria-hidden="true"
        />
      )}
      <span className="sr-only">{alt}</span>
    </div>
  );
}

function CartPartRow({ part }: { part: CartPartLike }) {
  const partImage = resolveApiAssetUrl(part.imageUrl ?? undefined);

  const priceLabel =
    part.totalPrice > 0 ? formatPrice(part.totalPrice) : "Miễn phí";

  return (
    <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-[15px] border border-[#e3eaf0] bg-[#f7f9fb] px-2.5 py-2">
      <CartPreviewImage src={partImage} alt={part.name} size="part" />

      <div className="min-w-0">
        <p
          title={part.name}
          className="truncate text-[12px] font-semibold leading-4 text-slate-900"
        >
          {part.name}
        </p>
        <p className="mt-0.5 text-[10px] leading-3 text-slate-500">
          x{part.quantity}
        </p>
      </div>

      <span
        title={priceLabel}
        className="max-w-[92px] truncate whitespace-nowrap text-right text-[12px] font-bold text-slate-900"
      >
        {priceLabel}
      </span>
    </div>
  );
}

function QuantityStepper({
  quantity,
  onChange,
}: {
  quantity: number;
  onChange: (qty: number) => void;
}) {
  const canDecrease = quantity > 1;
  const resetButtonStyle: React.CSSProperties = {
    appearance: "none",
    WebkitAppearance: "none",
    border: 0,
    boxShadow: "none",
    outline: "none",
  };

  return (
    <div
      className="inline-grid h-9 shrink-0 grid-cols-[32px_42px_32px] items-center rounded-[6px] bg-[#e3e8ed] p-0.5"
      style={{ border: 0, boxShadow: "none", outline: "none" }}
    >
      <button
        type="button"
        aria-label="Giảm số lượng"
        disabled={!canDecrease}
        onClick={() => onChange(Math.max(1, quantity - 1))}
        className="grid h-8 w-8 place-items-center rounded-[4px] bg-transparent text-slate-500 transition-colors hover:bg-white hover:text-[#2f91d0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#86c5eb] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-slate-500"
        style={resetButtonStyle}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <span className="grid h-8 place-items-center rounded-[4px] bg-white text-sm font-black text-[#dc2626]">
        {quantity}
      </span>

      <button
        type="button"
        aria-label="Tăng số lượng"
        onClick={() => onChange(quantity + 1)}
        className="grid h-8 w-8 place-items-center rounded-[4px] bg-transparent text-slate-500 transition-colors hover:bg-white hover:text-[#2f91d0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#86c5eb]"
        style={resetButtonStyle}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function RemoveButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-0 bg-[#edf1f5] text-slate-400 shadow-none outline-none transition-colors hover:bg-rose-50 hover:text-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200"
      style={{ border: 0, boxShadow: "none" }}
    >
      <X className="h-4 w-4" />
    </button>
  );
}

function CartItemRow({
  item,
  onRemove,
  onQuantityChange,
}: {
  item: SimpleCartItem;
  onRemove: () => void;
  onQuantityChange: (qty: number) => void;
}) {
  const previewUrl = resolveApiAssetUrl(item.previewUrl);
  const parts = getCartItemParts(item) as CartPartLike[];

  return (
    <div className="rounded-[22px] border border-[#dde6ed] bg-white p-3.5 transition-colors hover:border-[#bcd8ea] hover:bg-white">
      <div className="flex items-start gap-3">
        <CartPreviewImage src={previewUrl} alt={item.productName} size="main" />

        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <p
              title={item.productName}
              className="min-w-0 flex-1 truncate text-[15px] font-bold leading-5 text-slate-900"
            >
              {item.productName}
            </p>

            <RemoveButton
              label={`Xóa ${item.productName}`}
              onClick={onRemove}
            />
          </div>

          {parts.length > 0 ? (
            <div className="space-y-1.5">
              {parts.map((part, index) => (
                <CartPartRow
                  key={`${part.type}-${part.id ?? index}`}
                  part={part}
                />
              ))}
            </div>
          ) : null}

          {item.note ? (
            <p className="line-clamp-2 text-xs text-slate-500">
              Ghi chú: {item.note}
            </p>
          ) : null}

          <div className="flex items-center justify-between gap-3 pt-0.5">
            <QuantityStepper
              quantity={item.quantity}
              onChange={onQuantityChange}
            />

            <span className="shrink-0 whitespace-nowrap text-[17px] font-bold text-[#2f91d0]">
              {formatPrice(item.totalPrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const CartDrawer = React.forwardRef<HTMLDivElement, CartDrawerProps>(
  ({ className, style, ...props }, forwardedRef) => {
    const activeModal = useUIStore(selectActiveModal);
    const closeModal = useUIStore((state) => state.closeModal);

    const {
      isEmpty,
      items,
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

    const isOpen =
      activeModal === UI_MODAL_IDS.CART_DRAWER || isCartOpen || isEventOpen;

    const totalQuantity = React.useMemo(
      () => items.reduce((sum, item) => sum + Math.max(0, item.quantity), 0),
      [items],
    );

    const handleClose = React.useCallback(() => {
      setIsEventOpen(false);
      closeCart();
      closeModal();
    }, [closeCart, closeModal]);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    React.useEffect(() => {
      const openDrawer = () => {
        setIsEventOpen(true);
      };

      window.addEventListener("legoshop:open-cart", openDrawer);

      return () => {
        window.removeEventListener("legoshop:open-cart", openDrawer);
      };
    }, []);

    React.useEffect(() => {
      let firstFrame = 0;
      let secondFrame = 0;
      let closeTimer: number | undefined;

      if (isOpen) {
        setShouldRender(true);

        firstFrame = window.requestAnimationFrame(() => {
          secondFrame = window.requestAnimationFrame(() => {
            setEntered(true);
          });
        });
      } else {
        setEntered(false);
        closeTimer = window.setTimeout(() => {
          setShouldRender(false);
        }, 220);
      }

      return () => {
        if (firstFrame) window.cancelAnimationFrame(firstFrame);
        if (secondFrame) window.cancelAnimationFrame(secondFrame);
        if (closeTimer) window.clearTimeout(closeTimer);
      };
    }, [isOpen]);

    React.useEffect(() => {
      if (!isOpen) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          handleClose();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
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

    if (!mounted || !shouldRender) {
      return null;
    }

    return createPortal(
      <>
        <div
          data-cart-drawer-backdrop="true"
          aria-hidden="true"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleClose();
            }
          }}
          className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            background: "rgba(2, 6, 23, 0.45)",
            opacity: entered ? 1 : 0,
            transition: "opacity 180ms ease-out",
          }}
        />

        <div
          {...props}
          ref={forwardedRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          data-cart-drawer-panel="true"
          className={cn(
            "fixed right-0 top-0 flex h-dvh w-full max-w-[460px] flex-col overflow-hidden border-l border-[#dbe7f1] bg-white",
            className,
          )}
          style={{
            ...style,
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            zIndex: 1210,
            display: "flex",
            flexDirection: "column",
            width: "min(100vw, 460px)",
            maxWidth: "460px",
            height: "100dvh",
            overflow: "hidden",
            background: "#ffffff",
            borderLeft: "1px solid #dbe7f1",
            boxShadow: "-16px 0 42px -34px rgba(15, 23, 42, 0.28)",
            transform: entered ? "translateX(0)" : "translateX(100%)",
            opacity: entered ? 1 : 0,
            transition:
              "transform 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease-out",
            willChange: "transform, opacity",
          }}
        >
          <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#dbe7f1] px-5">
            <div className="flex items-start">
              <h2 id={titleId} className="text-xl font-bold text-slate-900">
                Giỏ hàng
              </h2>

              {totalQuantity > 0 ? (
                <span
                  aria-label={`${totalQuantity} sản phẩm trong giỏ hàng`}
                  className="ml-1 -translate-y-2 text-[13px] font-black leading-none text-[#dc2626]"
                >
                  {totalQuantity}
                </span>
              ) : null}
            </div>

            <button
              type="button"
              aria-label="Đóng giỏ hàng"
              onClick={handleClose}
              className="grid h-11 w-11 place-items-center rounded-full border border-[#dbe7f1] bg-white text-slate-500 outline-none transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-[#9ed0ef]/60"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="shrink-0 bg-[#eef1f4] px-4 pt-4 sm:px-5">
            <div className="rounded-[14px] bg-[#eaf4fb] px-4 py-3 text-[13px] leading-5 text-slate-600 ring-1 ring-inset ring-[#d5e5f0]">
              <div className="flex items-start gap-2">
                <Truck
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#2f91d0]"
                  aria-hidden="true"
                />
                <span>
                  Phí ship không cộng vào đơn. Shop báo phí trước khi giao,
                  khách trả trực tiếp cho tài xế.
                </span>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#eef1f4] px-4 pb-4 pt-3 sm:px-5">
            {isEmpty ? (
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
                <div className="mb-5 grid h-20 w-20 place-items-center rounded-[24px] bg-[#eef7ff]">
                  <ShoppingBag className="h-9 w-9 text-[#2f91d0]" />
                </div>

                <p className="mb-2 text-lg font-bold text-slate-900">
                  Giỏ hàng trống
                </p>

                <p className="mb-6 max-w-[310px] text-sm leading-6 text-slate-500">
                  Thiết kế khung LEGO cá nhân hóa và thêm vào giỏ hàng ngay!
                </p>

                <Link
                  href={ROUTES.studio}
                  onClick={handleClose}
                  className="rounded-full bg-[#2f91d0] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#257fb7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ed0ef]/60"
                >
                  Bắt đầu thiết kế →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onRemove={() => removeItem(item.id)}
                    onQuantityChange={(qty) => updateQuantity(item.id, qty)}
                  />
                ))}
              </div>
            )}
          </div>

          {!isEmpty ? (
            <div className="shrink-0 border-t border-[#dbe7f1] bg-white px-5 py-4">
              <div className="mb-3 flex items-center justify-between gap-4">
                <span className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Tạm tính
                </span>
                <span className="shrink-0 text-2xl font-bold text-slate-950">
                  {formatPrice(totalAmount)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={ROUTES.cart}
                  onClick={handleClose}
                  className="grid h-12 place-items-center rounded-full border border-[#dbe7f1] bg-white text-center text-sm font-semibold uppercase text-slate-900 outline-none transition-colors hover:border-[#9ed0ef] hover:text-[#2f91d0] focus-visible:ring-2 focus-visible:ring-[#9ed0ef]/60"
                >
                  Xem giỏ hàng
                </Link>

                <Link
                  href={ROUTES.checkout}
                  onClick={handleClose}
                  className="grid h-12 place-items-center rounded-full bg-[#2f91d0] text-center text-sm font-semibold uppercase text-white shadow-sm outline-none transition-colors hover:bg-[#257fb7] focus-visible:ring-2 focus-visible:ring-[#9ed0ef]/60"
                >
                  Thanh toán
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </>,
      document.body,
    );
  },
);

CartDrawer.displayName = "CartDrawer";
