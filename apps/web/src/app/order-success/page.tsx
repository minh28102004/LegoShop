"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Search, ArrowRight } from "lucide-react";
import { Suspense } from "react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("orderCode");

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      
      <h1 className="text-4xl font-black mb-4">Đặt Hàng Thành Công!</h1>
      <p className="text-zinc-600 mb-8 max-w-md">
        Cảm ơn bạn đã mua sắm tại LegoShop. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn.
      </p>

      {orderCode && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 mb-8 w-full max-w-md">
          <p className="text-sm text-zinc-500 mb-2">Mã đơn hàng của bạn</p>
          <p className="text-2xl font-bold tracking-widest text-zinc-900">{orderCode}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href={`/order-tracking${orderCode ? `?code=${orderCode}` : ""}`}
          className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-full transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" /> Tra cứu đơn hàng
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

export default function OrderSuccessPage() {
  return (
    <div className="container mx-auto flex-1 flex flex-col">
      <Suspense fallback={<div className="p-20 text-center">Đang tải...</div>}>
        <OrderSuccessContent />
      </Suspense>
    </div>
  );
}
