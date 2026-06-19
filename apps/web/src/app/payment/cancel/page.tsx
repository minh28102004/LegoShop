"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, RefreshCcw, Search } from "lucide-react";
import { Suspense, useState } from "react";
import { publicApiClient } from "@/lib/api/public-client";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("orderCode");
  const [loading, setLoading] = useState(false);

  const handleRetryPayment = async () => {
    if (!orderCode) return;
    setLoading(true);
    try {
      const data = await publicApiClient.orders.createPaymentLink(orderCode);
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("Không thể tạo lại link thanh toán lúc này.");
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi tạo link thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center min-h-[60vh]">
      <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <XCircle className="w-12 h-12 text-red-500" />
      </div>
      
      <h1 className="text-3xl font-black mb-4">Thanh Toán Đã Hủy</h1>
      <p className="text-zinc-600 mb-8 max-w-md">
        Quá trình thanh toán cho đơn hàng <strong>{orderCode}</strong> đã bị hủy hoặc chưa hoàn tất. Đơn hàng của bạn vẫn được lưu lại.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={handleRetryPayment}
          disabled={loading || !orderCode}
          className="px-8 py-3 bg-red-400 hover:bg-red-500 text-white font-medium rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> 
          {loading ? "Đang tạo lại..." : "Thanh toán lại"}
        </button>
        
        <Link 
          href={`/order-tracking${orderCode ? `?code=${orderCode}` : ""}`}
          className="px-8 py-3 border border-zinc-200 hover:border-zinc-300 text-zinc-700 font-medium rounded-full transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" /> Tra cứu đơn hàng
        </Link>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <div className="container mx-auto flex-1 flex flex-col bg-zinc-50">
      <Suspense fallback={<div className="p-20 text-center">Đang tải...</div>}>
        <PaymentCancelContent />
      </Suspense>
    </div>
  );
}
