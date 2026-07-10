"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Gift,
  Minus,
  Package,
  Pencil,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";

import { formatCurrency as formatPrice } from "@lego-shop/shared";
import { ROUTES } from "@/config/routes";
import { getCartItemParts } from "@/features/cart/cart-parts";
import { useCart } from "@/features/cart/hooks/useCart";
import { resolveApiAssetUrl } from "@/lib/api/assets";
import {
  getDesignCharacterCount,
  getDesignTemplateName,
} from "@/modules/studio/lib/design-data";

const RESET_BUTTON_STYLE: CSSProperties = {
  appearance: "none",
  WebkitAppearance: "none",
  border: 0,
  boxShadow: "none",
  outline: "none",
};

function CartPreview({
  src,
  alt,
}: {
  src: string | null;
  alt: string;
}) {
  return (
    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-[#dce4eb] bg-[#f5f7f9] sm:h-28 sm:w-28">
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 96px, 112px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Package className="h-8 w-8 text-slate-300" />
        </div>
      )}
    </div>
  );
}

function QuantityControl({
  quantity,
  onDecrease,
  onIncrease,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div
      className="inline-grid h-11 shrink-0 grid-cols-[38px_48px_38px] items-center gap-1 rounded-xl bg-[#e6ebef] p-1"
      style={{ border: 0, boxShadow: "none" }}
    >
      <button
        type="button"
        aria-label="Giảm số lượng"
        disabled={quantity <= 1}
        onClick={onDecrease}
        className="grid h-9 w-[38px] place-items-center rounded-lg bg-transparent text-slate-500 transition-colors hover:bg-white hover:text-[#2f91d0] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-slate-500"
        style={RESET_BUTTON_STYLE}
      >
        <Minus className="h-4 w-4" />
      </button>

      <span className="grid h-9 w-12 place-items-center rounded-lg bg-[#f4d35e] text-sm font-semibold text-slate-950">
        {quantity}
      </span>

      <button
        type="button"
        aria-label="Tăng số lượng"
        onClick={onIncrease}
        className="grid h-9 w-[38px] place-items-center rounded-lg bg-transparent text-slate-500 transition-colors hover:bg-white hover:text-[#2f91d0]"
        style={RESET_BUTTON_STYLE}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function CartPage() {
  const {
    items,
    updateQuantity,
    updateItemNote,
    removeItem,
    totalAmount,
    isEmpty,
    itemCount,
  } = useCart();

  return (
    <main className="min-h-screen bg-[#f2f4f7]">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-1.5 text-xs text-slate-500"
        >
          <Link
            href="/"
            className="transition-colors hover:text-[#2f91d0]"
          >
            Trang chủ
          </Link>

          <ChevronRight className="h-3.5 w-3.5" />

          <span className="font-medium text-slate-700">Giỏ hàng</span>
        </nav>

        <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Giỏ hàng của bạn
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Kiểm tra lại sản phẩm, số lượng và nội dung trước khi thanh toán.
            </p>
          </div>

          {itemCount > 0 ? (
            <div className="rounded-full border border-[#dce4eb] bg-white px-4 py-2 text-sm text-slate-600">
              Số lượng:{" "}
              <span className="font-semibold text-[#2f91d0]">{itemCount}</span>
            </div>
          ) : null}
        </header>

        {isEmpty ? (
          <section className="flex min-h-[480px] flex-col items-center justify-center rounded-[28px] border border-[#dce4eb] bg-white px-6 text-center">
            <div className="mb-6 grid h-24 w-24 place-items-center rounded-3xl bg-[#eef7ff]">
              <ShoppingBag className="h-11 w-11 text-[#2f91d0]" />
            </div>

            <h2 className="text-2xl font-semibold text-slate-950">
              Giỏ hàng đang trống
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
              Hãy thiết kế một sản phẩm LEGO cá nhân hóa thật đặc biệt và thêm
              vào giỏ hàng.
            </p>

            <Link
              href={ROUTES.studio}
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#2f91d0] px-7 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#257fb7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8cc9ed]"
            >
              Bắt đầu thiết kế
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        ) : (
          <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="min-w-0 space-y-4">
              <div className="rounded-2xl border border-[#cfe2ef] bg-[#eaf5fc] p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#2f91d0]">
                    <Truck className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Phí vận chuyển chưa cộng vào đơn
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Shop sẽ báo phí trước khi giao; khách thanh toán phí ship
                      trực tiếp cho tài xế.
                    </p>
                  </div>
                </div>
              </div>

              {items.map((item) => {
                const previewUrl = resolveApiAssetUrl(item.previewUrl);
                const templateName = getDesignTemplateName(item.designData);
                const characterCount = getDesignCharacterCount(item.designData);
                const parts = getCartItemParts(item);
                const canEditDesign =
                  item.designData?.type === "CUSTOM_FRAME";

                return (
                  <article
                    key={item.id}
                    className="group rounded-[24px] border border-[#dce4eb] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#bdd8ea] sm:p-5"
                  >
                    <div className="flex gap-4 sm:gap-5">
                      <CartPreview
                        src={previewUrl}
                        alt={item.productName}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2
                              title={item.productName}
                              className="truncate text-base font-semibold text-slate-950 sm:text-lg"
                            >
                              {item.productName}
                            </h2>

                            {item.designData ? (
                              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#edf8f1] px-2.5 py-1 text-[11px] font-medium text-[#27865a]">
                                <BadgeCheck className="h-3.5 w-3.5" />
                                Đã cá nhân hóa
                              </span>
                            ) : null}
                          </div>

                          <button
                            type="button"
                            aria-label={`Xóa ${item.productName}`}
                            onClick={() => removeItem(item.id)}
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-0 bg-[#f1f3f5] text-slate-400 shadow-none transition-colors hover:bg-rose-50 hover:text-rose-500"
                            style={RESET_BUTTON_STYLE}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {parts.length > 0 ? (
                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {parts.map((part, index) => {
                              const partImage = resolveApiAssetUrl(
                                part.imageUrl,
                              );
                              const partPrice =
                                part.totalPrice > 0
                                  ? formatPrice(part.totalPrice)
                                  : "Miễn phí";

                              return (
                                <div
                                  key={`${part.type}-${part.id ?? index}`}
                                  className="grid min-w-0 grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-[#f5f7f9] p-2.5"
                                >
                                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-[#dfe7ed] bg-white">
                                    {partImage ? (
                                      <img
                                        src={partImage}
                                        alt={part.name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <Package className="h-4 w-4 text-slate-300" />
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <p
                                      title={part.name}
                                      className="truncate text-xs font-medium text-slate-900"
                                    >
                                      {part.name}
                                    </p>

                                    <p className="mt-0.5 text-[11px] text-slate-500">
                                      x{part.quantity}
                                    </p>
                                  </div>

                                  <span
                                    title={partPrice}
                                    className="max-w-[94px] truncate whitespace-nowrap text-right text-xs font-semibold text-slate-900"
                                  >
                                    {partPrice}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : null}

                        <div className="hidden" aria-hidden="true">
                          <p>
                            {[item.frameSizeLabel, item.frameColorName]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>

                          {item.accessories?.length ? (
                            <p>
                              Phụ kiện:{" "}
                              {item.accessories
                                .map((accessory) => accessory.name)
                                .join(", ")}
                            </p>
                          ) : null}

                          {templateName ? <p>Nền: {templateName}</p> : null}

                          {characterCount > 0 ? (
                            <p>{characterCount} nhân vật</p>
                          ) : null}
                        </div>

                        <label className="mt-4 block">
                          <span className="mb-1.5 block text-xs font-medium text-slate-600">
                            Ghi chú nội dung cho sản phẩm
                          </span>

                          <textarea
                            rows={2}
                            value={item.note ?? ""}
                            onChange={(event) =>
                              updateItemNote(item.id, event.target.value)
                            }
                            placeholder="VD: in tên, lời chúc, nội dung cần shop thay vào mẫu..."
                            className="w-full resize-none rounded-xl border border-[#dce4eb] bg-[#f8fafb] px-3.5 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#7fc1e8] focus:bg-white focus:ring-2 focus:ring-[#9ed0ef]/30"
                          />
                        </label>

                        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                          <QuantityControl
                            quantity={item.quantity}
                            onDecrease={() =>
                              updateQuantity(
                                item.id,
                                Math.max(1, item.quantity - 1),
                              )
                            }
                            onIncrease={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          />

                          <div className="ml-auto text-right">
                            <p className="text-lg font-semibold text-[#2f91d0] sm:text-xl">
                              {formatPrice(item.totalPrice)}
                            </p>

                            {item.quantity > 1 ? (
                              <p className="mt-0.5 text-xs text-slate-500">
                                {formatPrice(item.unitPrice)} / cái
                              </p>
                            ) : null}
                          </div>
                        </div>

                        {canEditDesign ? (
                          <Link
                            href={`${ROUTES.studio}?editCartItemId=${encodeURIComponent(
                              item.id,
                            )}`}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-xs font-medium text-slate-500 transition-colors hover:text-[#2f91d0]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Chỉnh sửa thiết kế
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="self-start lg:sticky lg:top-6">
              <div className="max-h-[calc(100vh-3rem)] overflow-y-auto rounded-[24px] border border-[#dce4eb] bg-white">
                <div className="border-b border-[#e2e8ee] px-6 py-5">
                  <h2 className="text-xl font-semibold text-slate-950">
                    Tổng đơn hàng
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Kiểm tra lại thông tin trước khi thanh toán.
                  </p>
                </div>

                <div className="space-y-4 px-6 py-5">
                  <div className="flex items-start justify-between gap-4 text-sm">
                    <span className="text-slate-600">
                      Tạm tính ({itemCount} sản phẩm)
                    </span>

                    <span className="shrink-0 font-medium text-slate-900">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4 text-sm">
                    <span className="text-slate-600">Phí vận chuyển</span>

                    <span className="max-w-[160px] text-right text-xs font-medium leading-5 text-slate-500">
                      Shop báo trước khi giao
                    </span>
                  </div>

                  <div className="border-t border-[#e2e8ee] pt-4">
                    <div className="flex items-end justify-between gap-4">
                      <span className="font-semibold text-slate-950">
                        Tổng cộng
                      </span>

                      <span className="shrink-0 text-2xl font-semibold text-[#2f91d0]">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={ROUTES.checkout}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2f91d0] px-5 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#257fb7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8cc9ed]"
                  >
                    Tiến hành thanh toán
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href={ROUTES.collection}
                    className="block w-full rounded-xl py-2 text-center text-sm font-medium text-slate-500 transition-colors hover:text-[#2f91d0]"
                  >
                    ← Tiếp tục mua sắm
                  </Link>
                </div>

                <div className="space-y-3 border-t border-[#e2e8ee] bg-[#f7f9fb] px-6 py-5">
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-[#2f91d0]" />
                    Duyệt thiết kế trước khi in
                  </div>

                  <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                    <Gift className="h-4 w-4 shrink-0 text-[#2f91d0]" />
                    Gói quà miễn phí
                  </div>

                  <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                    <Truck className="h-4 w-4 shrink-0 text-[#2f91d0]" />
                    Giao hàng toàn quốc
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
