"use client";

import { useCart } from "@/features/cart/hooks/useCart";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Pencil, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/formatters";
import { ROUTES } from "@/constants";
import { FREESHIP_THRESHOLD } from "@/components/studio/StudioContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalAmount, isEmpty, itemCount } = useCart();
  const freeshipRemaining = Math.max(0, FREESHIP_THRESHOLD - totalAmount);
  const isFree = freeshipRemaining === 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-7xl py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-text-secondary font-semibold">Giỏ hàng</span>
        </nav>

        <h1 className="text-3xl font-black mb-2 text-text-primary">Giỏ hàng của bạn</h1>
        {itemCount > 0 && <p className="text-sm text-text-muted mb-8">{itemCount} sản phẩm</p>}

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-surface rounded-3xl border border-border">
            <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-black text-text-primary mb-3">Giỏ hàng đang trống</h2>
            <p className="text-text-secondary mb-8 max-w-sm">Hãy thiết kế một sản phẩm LEGO cá nhân hóa thật đặc biệt!</p>
            <Link href={ROUTES.studio}
              className="px-8 py-3.5 bg-[hsl(var(--color-cta))] text-white font-bold rounded-full transition-colors flex items-center gap-2 hover:bg-[hsl(var(--color-cta-hover))] shadow-sm">
              Bắt đầu thiết kế <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Freeship bar */}
              <div className="bg-surface rounded-2xl border border-border p-4">
                {isFree ? (
                  <p className="text-sm font-semibold text-emerald-600 flex items-center gap-2">🎉 Bạn đã được Miễn phí vận chuyển thường!</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-text-secondary">Thêm <strong className="text-text-primary">{formatPrice(freeshipRemaining)}</strong> để được miễn phí vận chuyển</p>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totalAmount / FREESHIP_THRESHOLD) * 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {items.map(item => (
                <div key={item.id} className="flex gap-5 p-5 bg-surface rounded-2xl border border-border hover:border-primary/20 transition-colors">
                  {/* Preview */}
                  <div className="w-28 h-28 bg-background rounded-xl overflow-hidden shrink-0 relative border border-border">
                    {item.previewUrl ? (
                      <Image src={item.previewUrl} alt={item.productName} fill className="object-cover" sizes="112px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-text-muted" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-text-primary truncate">{item.productName}</h3>
                        <p className="text-sm text-text-muted mt-0.5">{item.frameSizeLabel} · {item.frameColorName}</p>
                        {item.accessories?.length ? (
                          <p className="text-xs text-text-muted mt-0.5 truncate">
                            Phu kien: {item.accessories.map(acc => acc.name).join(", ")}
                          </p>
                        ) : null}
                        {item.designData && (
                          <span className="inline-block mt-1 text-xs text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
                            Đã cá nhân hóa
                          </span>
                        )}
                      </div>
                      <button type="button" onClick={() => removeItem(item.id)}
                        className="shrink-0 p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-0 border border-border rounded-xl overflow-hidden">
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-surface-hover transition-colors text-text-secondary">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-text-primary">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-surface-hover transition-colors text-text-secondary">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-primary text-lg">{formatPrice(item.totalPrice)}</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-text-muted">{formatPrice(item.unitPrice)} / cái</p>
                        )}
                      </div>
                    </div>

                    <Link href={ROUTES.studio} className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-text-muted hover:text-primary transition-colors">
                      <Pencil className="w-3 h-3" /> Chỉnh sửa thiết kế
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-surface p-6 rounded-2xl border border-border sticky top-24 space-y-5">
              <h3 className="text-lg font-black text-text-primary">Tổng đơn hàng</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Tạm tính ({itemCount} sản phẩm)</span>
                  <span className="font-semibold text-text-primary">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Phí vận chuyển</span>
                  <span className={`font-semibold ${isFree ? 'text-emerald-600' : 'text-text-muted'}`}>
                    {isFree ? 'Miễn phí' : 'Tính khi thanh toán'}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="font-black text-text-primary">Tổng cộng</span>
                  <span className="text-2xl font-black text-primary">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <Link href={ROUTES.checkout}
                className="w-full flex items-center justify-center py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl transition-colors shadow-sm">
                Tiến hành thanh toán <ArrowRight className="w-4 h-4 ml-2" />
              </Link>

              <Link href={ROUTES.collection} className="w-full text-center block text-sm font-medium text-text-muted hover:text-primary transition-colors">
                ← Tiếp tục mua sắm
              </Link>

              {/* Trust badges */}
              <div className="border-t border-border pt-4 space-y-2">
                {["🛡️ Duyệt thiết kế trước khi in", "🎁 Gói quà miễn phí", "🚚 Giao hàng toàn quốc"].map(t => (
                  <p key={t} className="text-xs text-text-muted flex items-center gap-1.5">{t}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

