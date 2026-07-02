"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle, ChevronRight, Clock, Package, Search, Truck } from "lucide-react";
import type { TrackOrderItemSummaryContract, TrackOrderResponseContract } from "@lego-shop/shared";

import { ROUTES } from "@/constants";
import { resolveApiAssetUrl } from "@/lib/api/assets";
import { publicApiClient } from "@/lib/api/public-client";
import { formatPrice } from "@/lib/formatters";

type TrackingResult = TrackOrderResponseContract | { error: true };

const ORDER_STATUSES: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700" },
  processing: { label: "Đang xử lý", color: "bg-purple-100 text-purple-700" },
  shipping: { label: "Đang giao", color: "bg-orange-100 text-orange-700" },
  completed: { label: "Hoàn thành", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
};

const PAYMENT_STATUSES: Record<string, { label: string; color: string }> = {
  unpaid: { label: "Chưa thanh toán", color: "text-yellow-600" },
  pending: { label: "Đang chờ thanh toán", color: "text-yellow-600" },
  deposit_pending: { label: "Đang chờ đặt cọc", color: "text-yellow-600" },
  deposit_paid: { label: "Đã đặt cọc", color: "text-blue-600" },
  paid: { label: "Đã thanh toán", color: "text-emerald-600" },
  failed: { label: "Thanh toán thất bại", color: "text-red-600" },
  cancelled: { label: "Đã hủy thanh toán", color: "text-red-600" },
  refunded: { label: "Đã hoàn tiền", color: "text-slate-600" },
};

const SHIPPING_METHOD_LABELS: Record<string, string> = {
  shop_support: "Shop hỗ trợ đặt ship",
  standard: "Ship thường",
  fast: "Ship nhanh",
  self: "Tự book ship / Qua lấy",
};

const STEPS = [
  { key: "pending", label: "Tiếp nhận", icon: Package },
  { key: "confirmed", label: "Xác nhận", icon: Clock },
  { key: "processing", label: "Đang làm", icon: Clock },
  { key: "shipping", label: "Đang giao", icon: Truck },
  { key: "completed", label: "Hoàn thành", icon: CheckCircle },
];

function getStepIndex(status: string) {
  return STEPS.findIndex((step) => step.key === status);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCode = searchParams.get("code") || "";
  const [orderCode, setOrderCode] = useState(initialCode);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);

  const loadOrder = async (code: string, phoneValue: string, pushUrl = true) => {
    const normalizedCode = code.trim().toUpperCase();
    const normalizedPhone = phoneValue.trim();
    if (!normalizedCode || !normalizedPhone) return;

    setLoading(true);
    try {
      const data = await publicApiClient.orders.trackOrder({
        orderCode: normalizedCode,
        phone: normalizedPhone,
      });
      setResult(data);
      if (pushUrl) {
        router.push(`${ROUTES.orderTracking}?code=${encodeURIComponent(normalizedCode)}`);
      }
    } catch {
      setResult({ error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOrderCode(initialCode);
  }, [initialCode]);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    await loadOrder(orderCode, phone);
  };

  const currentStepIdx = result && !("error" in result) ? getStepIndex(result.orderStatus) : -1;

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto max-w-3xl px-4">
        <nav className="mb-8 flex items-center gap-1.5 text-xs text-text-muted">
          <Link href="/" className="hover:text-primary">Trang chủ</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-text-secondary">Tra cứu đơn hàng</span>
        </nav>

        <div className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-black text-text-primary">Tra Cứu Đơn Hàng</h1>
          <p className="text-text-secondary">Nhập mã đơn và số điện thoại đặt hàng để kiểm tra trạng thái.</p>
        </div>

        <form onSubmit={handleSearch} className="mx-auto mb-12 grid max-w-xl gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            type="text"
            required
            placeholder="ORD123456"
            value={orderCode}
            onChange={(event) => setOrderCode(event.target.value.toUpperCase())}
            className="rounded-xl border border-border bg-surface px-4 py-3 font-mono text-sm font-bold uppercase tracking-widest text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary"
          />
          <input
            type="tel"
            required
            placeholder="Số điện thoại"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--color-cta))] px-6 py-3 font-bold text-white transition-colors hover:bg-[hsl(var(--color-cta-hover))] disabled:opacity-50"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>
        </form>

        {result && "error" in result ? (
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>Không tìm thấy đơn hàng khớp với mã đơn và số điện thoại đã nhập.</p>
          </div>
        ) : null}

        {result && !("error" in result) ? (
          <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-border bg-background px-6 py-5 sm:flex-row sm:items-center">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">Đơn hàng</p>
                <h2 className="font-mono text-xl font-black tracking-[0.1em] text-text-primary">{result.orderCode}</h2>
                <p className="mt-1 text-xs text-text-muted">Đặt ngày: {formatDate(result.createdAt)}</p>
              </div>
              <div className="flex flex-col items-start gap-1.5 sm:items-end">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${ORDER_STATUSES[result.orderStatus]?.color ?? "bg-border text-text-secondary"}`}>
                  {ORDER_STATUSES[result.orderStatus]?.label ?? result.orderStatus}
                </span>
                <span className={`text-sm font-semibold ${PAYMENT_STATUSES[result.paymentStatus]?.color ?? "text-text-muted"}`}>
                  {PAYMENT_STATUSES[result.paymentStatus]?.label ?? result.paymentStatus}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto border-b border-border px-6 py-6">
              <div className="relative flex min-w-[320px] justify-between">
                <div className="absolute left-0 right-0 top-5 z-0 h-0.5 bg-border" />
                <div
                  className="absolute left-0 top-5 z-0 h-0.5 bg-primary transition-all duration-500"
                  style={{ width: `${Math.max(0, currentStepIdx / (STEPS.length - 1)) * 100}%` }}
                />
                {STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const done = index <= currentStepIdx;
                  const current = index === currentStepIdx;
                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center gap-2">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${done ? "bg-primary text-white" : "bg-border text-text-muted"} ${current ? "ring-4 ring-primary/20" : ""}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`whitespace-nowrap text-xs font-semibold ${done ? "text-primary" : "text-text-muted"}`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-secondary">Thông tin nhận hàng</h3>
                <div className="space-y-2 text-sm">
                  <InfoRow label="SĐT" value={result.maskedPhone ?? "-"} />
                  <InfoRow label="Email" value={result.maskedEmail ?? "-"} />
                  <InfoRow label="Địa chỉ" value={result.maskedAddress ?? "-"} />
                  <InfoRow label="Ngày nhận" value={formatDate(result.receiveDate)} />
                  <InfoRow label="Vận chuyển" value={result.shippingMethod ? SHIPPING_METHOD_LABELS[result.shippingMethod] ?? result.shippingMethod : "-"} />
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-secondary">Thanh toán</h3>
                <div className="space-y-2 text-sm">
                  <MoneyRow label="Tạm tính sản phẩm" value={result.itemsAmount} />
                  {result.discountAmount > 0 ? (
                    <MoneyRow label={`Voucher ${result.voucherCode ?? ""}`} value={-result.discountAmount} />
                  ) : null}
                  <MoneyRow label="Đã thanh toán" value={result.paidAmount} />
                  <MoneyRow label="Tổng đơn hàng" value={result.totalAmount} bold />
                  {result.depositRequired ? (
                    <>
                      <MoneyRow label={`Đặt cọc (${result.depositPercent}%)`} value={result.depositAmount} primary />
                      <MoneyRow label="Còn lại khi nhận" value={result.remainingAmount} />
                    </>
                  ) : null}
                  <InfoRow label="Hình thức" value={result.paymentMethod} />
                  {result.expiresAt ? <InfoRow label="Hạn thanh toán" value={new Date(result.expiresAt).toLocaleString("vi-VN")} /> : null}
                </div>
                {result.checkoutUrl && result.paymentStatus !== "paid" && result.paymentStatus !== "deposit_paid" ? (
                  <a
                    href={result.checkoutUrl}
                    className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90"
                  >
                    Tiếp tục thanh toán
                  </a>
                ) : null}
              </div>
            </div>

            {result.items.length > 0 ? (
              <div className="border-t border-border px-6 pb-6 pt-5">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-text-secondary">Sản phẩm</h3>
                <div className="space-y-3">
                  {result.items.map((item, index) => (
                    <OrderItemRow key={`${item.productName}-${index}`} item={item} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-28 shrink-0 font-semibold text-text-secondary">{label}:</span>
      <span className="text-text-primary">{value}</span>
    </div>
  );
}

function MoneyRow({ label, value, bold = false, primary = false }: { label: string; value: number; bold?: boolean; primary?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-text-secondary">{label}</span>
      <span className={`${bold ? "font-bold" : "font-semibold"} ${primary ? "text-primary" : "text-text-primary"}`}>
        {formatPrice(value)}
      </span>
    </div>
  );
}

type TrackingPart = {
  name: string;
  quantity: number;
  totalPrice?: number;
  imageUrl?: string | null;
  meta?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readQuantity(value: unknown) {
  const numberValue = readNumber(value);
  return numberValue && numberValue > 0 ? Math.round(numberValue) : 1;
}

function readPositionMeta(value: unknown) {
  if (!isRecord(value)) return null;
  const x = readNumber(value.x);
  const y = readNumber(value.y);
  if (x === null || y === null) return null;
  return `Vị trí x${Math.round(x)}, y${Math.round(y)}`;
}

function getTrackingParts(item: TrackOrderItemSummaryContract): TrackingPart[] {
  const designData = isRecord(item.designData) ? item.designData : null;
  if (!designData) return [];

  const configuredParts = Array.isArray(designData.parts)
    ? designData.parts.flatMap((part): TrackingPart[] => {
        if (!isRecord(part)) return [];
        const name = readString(part.name);
        if (!name) return [];
        const quantity = readQuantity(part.quantity);
        const totalPrice = readNumber(part.totalPrice);
        const unitPrice = readNumber(part.unitPrice);
        const imageUrl = readString(part.imageUrl);
        return [{
          name,
          quantity,
          ...(totalPrice !== null ? { totalPrice } : unitPrice !== null ? { totalPrice: unitPrice * quantity } : {}),
          ...(imageUrl ? { imageUrl } : {}),
        }];
      })
    : [];

  if (configuredParts.length > 0) return configuredParts;
  if (designData.type !== "CUSTOM_FRAME") return [];

  const parts: TrackingPart[] = [];
  if (item.frameSizeLabel) {
    parts.push({
      name: [item.frameSizeLabel, item.frameColorName].filter(Boolean).join(" - "),
      quantity: item.quantity,
    });
  }

  const backgroundName = readString(designData.backgroundName);
  if (backgroundName) {
    parts.push({
      name: backgroundName,
      quantity: item.quantity,
      imageUrl: readString(designData.previewUrl),
    });
  }

  if (Array.isArray(designData.characters)) {
    designData.characters.forEach((character, index) => {
      if (!isRecord(character)) return;
      const price = readNumber(character.price);
      const imageUrl = readString(character.imageUrl);
      const meta = readPositionMeta(character.position);
      parts.push({
        name: readString(character.name) ?? `Nhân vật ${index + 1}`,
        quantity: item.quantity,
        ...(price !== null ? { totalPrice: price * item.quantity } : {}),
        ...(imageUrl ? { imageUrl } : {}),
        ...(meta ? { meta } : {}),
      });
    });
  }

  if (Array.isArray(designData.accessories)) {
    designData.accessories.forEach((accessory) => {
      if (!isRecord(accessory)) return;
      const name = readString(accessory.name);
      const meta = readPositionMeta(accessory.position);
      if (!name) return;
      parts.push({
        name,
        quantity: readQuantity(accessory.quantity) * item.quantity,
        ...(meta ? { meta } : {}),
      });
    });
  }

  return parts;
}

function OrderItemRow({ item }: { item: TrackOrderItemSummaryContract }) {
  const previewUrl = resolveApiAssetUrl(item.previewUrl);
  const accessories = item.accessories ?? [];
  const parts = getTrackingParts(item);
  const frameDescription = [item.frameSizeLabel, item.frameColorName]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-border object-cover" />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary">{item.productName}</p>
        <p className="text-xs text-text-muted">
          x{item.quantity}
          {frameDescription ? ` · ${frameDescription}` : ""}
        </p>
        {parts.length > 0 ? (
          <div className="mt-2 space-y-1.5">
            {parts.map((part, index) => {
              const partImage = resolveApiAssetUrl(part.imageUrl);
              return (
                <div key={`${part.name}-${index}`} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5">
                  {partImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={partImage} alt="" className="h-8 w-8 shrink-0 rounded-md object-cover" />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-text-primary">{part.name} x{part.quantity}</p>
                    {part.meta ? <p className="text-[10px] text-text-muted">{part.meta}</p> : null}
                  </div>
                  {typeof part.totalPrice === "number" ? (
                    <span className="shrink-0 text-[11px] font-bold text-text-primary">{formatPrice(part.totalPrice)}</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : accessories.length > 0 ? (
          <p className="truncate text-xs text-text-muted">
            Phụ kiện: {accessories.map((accessory) => `${accessory.name}${accessory.quantity && accessory.quantity > 1 ? ` x${accessory.quantity}` : ""}`).join(", ")}
          </p>
        ) : null}
        {item.note ? <p className="line-clamp-2 text-xs text-text-muted">Ghi chú: {item.note}</p> : null}
      </div>
      <span className="shrink-0 text-sm font-bold text-text-primary">{formatPrice(item.price * item.quantity)}</span>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary" /></div>}>
      <TrackingContent />
    </Suspense>
  );
}
