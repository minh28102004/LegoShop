"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Package, CheckCircle, Truck, Clock, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { publicApiClient } from "@/lib/api/public-client";
import { formatPrice } from "@/lib/formatters";
import { ROUTES } from "@/constants";
import type { OrderItem, TrackOrderResponseContract } from "@lego-shop/shared";

type TrackingResult = TrackOrderResponseContract | { error: true };

const ORDER_STATUSES: Record<string, { label: string; color: string }> = {
  Pending:    { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
  Confirmed:  { label: "Đã xác nhận",  color: "bg-blue-100 text-blue-700" },
  Processing: { label: "Đang xử lý",   color: "bg-purple-100 text-purple-700" },
  Shipping:   { label: "Đang giao",    color: "bg-orange-100 text-orange-700" },
  Completed:  { label: "Hoàn thành",   color: "bg-emerald-100 text-emerald-700" },
  Cancelled:  { label: "Đã hủy",       color: "bg-red-100 text-red-700" },
};

const PAYMENT_STATUSES: Record<string, { label: string; color: string }> = {
  unpaid:        { label: "Chưa thanh toán", color: "text-yellow-600" },
  deposit_paid:  { label: "Đã đặt cọc",     color: "text-blue-600" },
  paid:          { label: "Đã thanh toán",   color: "text-emerald-600" },
};

const STEPS = [
  { key: "Pending",    label: "Tiếp nhận",   icon: Package },
  { key: "Confirmed",  label: "Xác nhận",    icon: Clock },
  { key: "Processing", label: "Đang làm",    icon: Clock },
  { key: "Shipping",   label: "Đang giao",   icon: Truck },
  { key: "Completed",  label: "Hoàn thành",  icon: CheckCircle },
];

function getStepIndex(status: string) {
  return STEPS.findIndex(s => s.key === status);
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCode = searchParams.get("code") || "";
  const [orderCode, setOrderCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode.trim()) return;
    setLoading(true);
    try {
      const data = await publicApiClient.orders.trackOrder(orderCode.trim());
      setResult(data);
    } catch {
      setResult({ error: true });
    }
    setLoading(false);
    router.push(`${ROUTES.orderTracking}?code=${orderCode.trim()}`);
  };

  const currentStepIdx = result && !("error" in result) ? getStepIndex(result.orderStatus) : -1;

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-8">
          <Link href="/" className="hover:text-primary">Trang chủ</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-text-secondary font-semibold">Tra cứu đơn hàng</span>
        </nav>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-text-primary mb-2">Tra Cứu Đơn Hàng</h1>
          <p className="text-text-secondary">Nhập mã đơn hàng để kiểm tra trạng thái</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto mb-12">
          <input
            type="text" required
            placeholder="Ví dụ: ORD123456"
            value={orderCode}
            onChange={e => setOrderCode(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-surface text-text-primary uppercase font-mono font-bold tracking-widest text-sm"
          />
          <button type="submit" disabled={loading}
            className="px-6 py-3 bg-[hsl(var(--color-cta))] text-white rounded-xl font-bold hover:bg-[hsl(var(--color-cta-hover))] transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
        </form>

        {/* Error */}
        {result && "error" in result && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl flex items-center gap-3 mb-8">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>Không tìm thấy đơn hàng với mã <strong className="font-mono">{orderCode}</strong>. Vui lòng kiểm tra lại.</p>
          </div>
        )}

        {/* Result */}
        {result && !("error" in result) && (
          <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background">
              <div>
                <p className="text-xs text-text-muted mb-1 font-medium uppercase tracking-wide">Đơn hàng</p>
                <h2 className="text-xl font-black tracking-[0.1em] text-text-primary font-mono">{result.orderCode}</h2>
                <p className="text-xs text-text-muted mt-1">Đặt ngày: {new Date(result.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-1.5">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${ORDER_STATUSES[result.orderStatus]?.color ?? 'bg-border text-text-secondary'}`}>
                  {ORDER_STATUSES[result.orderStatus]?.label ?? result.orderStatus}
                </span>
                <span className={`text-sm font-semibold ${PAYMENT_STATUSES[result.paymentStatus]?.color ?? 'text-text-muted'}`}>
                  {PAYMENT_STATUSES[result.paymentStatus]?.label ?? result.paymentStatus}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="px-6 py-6 border-b border-border overflow-x-auto">
              <div className="relative flex justify-between min-w-[320px]">
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-border z-0" />
                <div className="absolute top-5 left-0 h-0.5 bg-primary z-0 transition-all duration-500" style={{ width: `${Math.max(0, currentStepIdx / (STEPS.length - 1)) * 100}%` }} />
                {STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const done = idx <= currentStepIdx;
                  const current = idx === currentStepIdx;
                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${done ? 'bg-primary text-white' : 'bg-border text-text-muted'} ${current ? 'ring-4 ring-primary/20' : ''}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-semibold whitespace-nowrap ${done ? 'text-primary' : 'text-text-muted'}`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info grid */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Shipping info */}
              <div>
                <h3 className="font-bold text-sm text-text-secondary uppercase tracking-wide mb-3">Thông tin giao hàng</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2"><span className="font-semibold text-text-secondary w-24 shrink-0">Người nhận:</span><span className="text-text-primary">{result.customerName}</span></div>
                  <div className="flex gap-2"><span className="font-semibold text-text-secondary w-24 shrink-0">SĐT:</span><span className="text-text-primary">{result.phone}</span></div>
                  {result.email && <div className="flex gap-2"><span className="font-semibold text-text-secondary w-24 shrink-0">Email:</span><span className="text-text-primary">{result.email}</span></div>}
                  <div className="flex gap-2"><span className="font-semibold text-text-secondary w-24 shrink-0">Địa chỉ:</span><span className="text-text-primary">{result.address}</span></div>
                </div>
              </div>

              {/* Payment info */}
              <div>
                <h3 className="font-bold text-sm text-text-secondary uppercase tracking-wide mb-3">Thông tin thanh toán</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-text-secondary">Tổng đơn hàng</span><span className="font-bold text-text-primary">{formatPrice(result.totalAmount)}</span></div>
                  {result.depositRequired && (
                    <>
                      <div className="flex justify-between"><span className="text-text-secondary">Đặt cọc ({result.depositPercent}%)</span><span className="font-bold text-primary">{formatPrice(result.depositAmount)}</span></div>
                      <div className="flex justify-between"><span className="text-text-secondary">Còn lại khi nhận</span><span className="font-bold text-text-primary">{formatPrice(result.remainingAmount)}</span></div>
                    </>
                  )}
                  <div className="flex justify-between"><span className="text-text-secondary">Hình thức</span><span className="font-semibold text-text-primary">{result.paymentMethod}</span></div>
                </div>
              </div>
            </div>

            {/* Items */}
            {result.items?.length > 0 && (
              <div className="px-6 pb-6 border-t border-border pt-5">
                <h3 className="font-bold text-sm text-text-secondary uppercase tracking-wide mb-4">Sản phẩm</h3>
                <div className="space-y-3">
                  {result.items.map((item: OrderItem, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
                      {item.previewUrl && (
                        <img src={item.previewUrl} alt="" className="w-12 h-12 rounded-lg object-cover border border-border shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">{item.productName}</p>
                        <p className="text-xs text-text-muted">×{item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold text-text-primary shrink-0">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
      <TrackingContent />
    </Suspense>
  );
}
