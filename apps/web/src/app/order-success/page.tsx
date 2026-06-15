"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Search, ArrowRight } from "lucide-react";
import { Suspense } from "react";
import { ROUTES } from "@/constants";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("orderCode");

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-16 px-4">
      {/* Success animation */}
      <div className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-emerald-100">
        <CheckCircle className="w-14 h-14 text-emerald-600" />
      </div>

      <h1 className="text-4xl font-black text-text-primary mb-3 text-center">Đặt hàng thành công! 🎉</h1>
      <p className="text-text-secondary text-center max-w-md mb-8 leading-relaxed">
        Cảm ơn bạn đã tin tưởng The Luvin. Đơn hàng của bạn đang được xử lý và Designer sẽ liên hệ sớm nhất.
      </p>

      {orderCode && (
        <div className="bg-surface border border-border rounded-2xl p-6 mb-8 w-full max-w-sm text-center shadow-sm">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Mã đơn hàng</p>
          <p className="text-2xl font-black tracking-[0.15em] text-text-primary">{orderCode}</p>
          <p className="text-xs text-text-muted mt-2">Lưu mã này để tra cứu trạng thái đơn hàng</p>
        </div>
      )}

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg mb-10">
        {[
          { icon: "✅", title: "Đơn đã tiếp nhận", desc: "Chúng tôi đã nhận đơn của bạn" },
          { icon: "🎨", title: "Designer thiết kế", desc: "1-2 ngày, gửi ảnh duyệt trước khi in" },
          { icon: "📦", title: "Giao hàng", desc: "Sau khi bạn xác nhận bản thiết kế" },
        ].map(s => (
          <div key={s.title} className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="text-sm font-bold text-text-primary mb-1">{s.title}</p>
            <p className="text-xs text-text-muted">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Link
          href={`${ROUTES.orderTracking}${orderCode ? `?code=${orderCode}` : ""}`}
          className="flex-1 px-6 py-3.5 bg-[hsl(var(--color-cta))] hover:bg-[hsl(var(--color-cta-hover))] text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Search className="w-4 h-4" /> Tra cứu đơn
        </Link>
        <Link
          href={ROUTES.collection}
          className="flex-1 px-6 py-3.5 border-2 border-border hover:border-primary hover:text-primary text-text-secondary font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
          Tiếp tục mua <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
