"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Search, ArrowRight, Clock } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { publicApiClient } from "@/lib/api/public-client";
import type { TrackOrderResponseContract } from "@lego-shop/shared";

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "Chưa thanh toán",
  pending: "Đang chờ thanh toán",
  deposit_pending: "Đang chờ thanh toán cọc",
  deposit_paid: "Đã thanh toán cọc",
  paid: "Đã thanh toán",
  failed: "Thanh toán thất bại",
  cancelled: "Đã hủy thanh toán",
  refunded: "Đã hoàn tiền",
};

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("orderCode");
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<TrackOrderResponseContract | null>(null);

  useEffect(() => {
    if (orderCode) {
      publicApiClient.orders.trackOrder(orderCode)
        .then(data => setOrder(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderCode]);

  const paymentStatus = order?.paymentStatus as string | undefined;
  const verifiedPaid = paymentStatus === "paid" || paymentStatus === "deposit_paid";

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center min-h-[60vh]">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${verifiedPaid ? "bg-emerald-100" : "bg-amber-100"}`}>
        {verifiedPaid ? (
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        ) : (
          <Clock className="w-12 h-12 text-amber-600" />
        )}
      </div>
      
      <h1 className="text-4xl font-black mb-4">{verifiedPaid ? "Đã ghi nhận thanh toán" : "Đang xác nhận thanh toán"}</h1>
      <p className="text-zinc-600 mb-8 max-w-md">
        Trạng thái thanh toán được cập nhật từ webhook PayOS. Nếu bạn vừa thanh toán xong, vui lòng tra cứu lại sau vài giây.
      </p>

      {loading ? (
        <div className="text-zinc-500 mb-8">Đang tải thông tin đơn hàng...</div>
      ) : order ? (
        <div className="bg-white border border-emerald-200 rounded-2xl p-6 mb-8 w-full max-w-md shadow-sm">
          <p className="text-sm text-zinc-500 mb-2">Mã đơn hàng</p>
          <p className="text-2xl font-bold tracking-widest text-zinc-900 mb-4">{orderCode}</p>
          
          <div className="border-t border-zinc-100 pt-4 space-y-2 text-sm text-left">
            <div className="flex justify-between">
              <span className="text-zinc-500">Trạng thái thanh toán</span>
              <span className={`font-bold ${verifiedPaid ? "text-emerald-600" : "text-amber-600"}`}>
                {PAYMENT_STATUS_LABELS[paymentStatus ?? ""] ?? paymentStatus ?? "Đang kiểm tra"}
              </span>
            </div>
            {order.depositRequired && (
              <div className="flex justify-between">
                <span className="text-zinc-500">Tiền cọc ({order.depositPercent}%)</span>
                <span className="font-bold text-zinc-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.depositAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-zinc-100 pt-2 mt-2">
              <span className="text-zinc-500">Tổng đơn hàng</span>
              <span className="font-bold text-red-500">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 mb-8 w-full max-w-md">
          <p className="text-sm text-zinc-500 mb-2">Mã đơn hàng của bạn</p>
          <p className="text-2xl font-bold tracking-widest text-zinc-900">{orderCode}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href={`/order-tracking${orderCode ? `?code=${orderCode}` : ""}`}
          className="px-8 py-3 bg-red-400 hover:bg-red-500 text-white font-medium rounded-full transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" /> Tra cứu tiến độ đơn
        </Link>
        
        <Link 
          href="/collection"
          className="px-8 py-3 border border-zinc-200 hover:border-zinc-300 text-zinc-700 font-medium rounded-full transition-colors flex items-center justify-center gap-2"
        >
          Tiếp tục mua sắm <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="container mx-auto flex-1 flex flex-col bg-zinc-50">
      <Suspense fallback={<div className="p-20 text-center">Đang tải...</div>}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
