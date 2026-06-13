"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Package, CheckCircle, Truck, Clock, AlertCircle } from "lucide-react";

import { fetchApi } from "@/lib/api";

function TrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialCode = searchParams.get("code") || "";
  const [orderCode, setOrderCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode.trim()) return;
    
    setLoading(true);
    
    try {
      const data = await fetchApi(`/orders/track/${orderCode}`);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setResult({ error: true });
    }
    
    setLoading(false);
    router.push(`/order-tracking?code=${orderCode}`);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-black mb-2 text-center">Tra Cứu Đơn Hàng</h1>
      <p className="text-zinc-500 text-center mb-10">Nhập mã đơn hàng của bạn để kiểm tra trạng thái</p>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto mb-16">
        <input 
          type="text" 
          required
          placeholder="Ví dụ: ORD123456" 
          value={orderCode}
          onChange={e => setOrderCode(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg border border-zinc-300 focus:ring-red-500 focus:border-red-500 uppercase"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="px-6 py-3 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          {loading ? "Đang tìm..." : <Search className="w-5 h-5" />}
        </button>
      </form>

      {result?.error && (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center gap-4">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <p>Không tìm thấy đơn hàng nào với mã <strong>{orderCode}</strong>. Vui lòng kiểm tra lại.</p>
        </div>
      )}

      {result && !result.error && (
        <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
          {/* Order Header */}
          <div className="bg-zinc-50 p-6 md:p-8 border-b border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-500 mb-1">Đơn hàng</p>
              <h2 className="text-2xl font-bold tracking-widest">{result.orderCode}</h2>
            </div>
            <div className="flex flex-col md:items-end gap-1">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                Đang xử lý
              </span>
              <span className="text-sm text-zinc-500">
                Ngày đặt: {new Date(result.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="p-6 md:p-8 border-b border-zinc-200">
            <div className="relative flex justify-between">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-100 -translate-y-1/2 z-0" />
              <div className="absolute top-1/2 left-0 w-1/3 h-1 bg-green-500 -translate-y-1/2 z-0" />
              
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-green-600">Đã tiếp nhận</span>
              </div>
              
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/30">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-green-600">Đang xử lý</span>
              </div>
              
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-zinc-200 text-zinc-400 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-zinc-400">Đang giao</span>
              </div>
              
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-zinc-200 text-zinc-400 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-zinc-400">Hoàn thành</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Thông tin giao hàng</h3>
              <div className="space-y-2 text-zinc-600 text-sm">
                <p><span className="font-medium text-zinc-900">Người nhận:</span> {result.customerName}</p>
                <p><span className="font-medium text-zinc-900">Địa chỉ:</span> {result.address}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Tóm tắt đơn hàng</h3>
              <div className="space-y-3 mb-4">
                {result.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-zinc-600">
                      {item.quantity}x {item.name} 
                      {item.personalized && <span className="ml-2 text-xs text-green-600 font-medium">(Đã thiết kế)</span>}
                    </span>
                    <span className="font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-zinc-100 flex justify-between items-center">
                <span className="font-bold">Tổng cộng</span>
                <span className="text-xl font-black text-red-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(result.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Đang tải...</div>}>
      <TrackingContent />
    </Suspense>
  );
}
