"use client";

import { useCart } from "@/lib/cart";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { items, isLoaded, updateQuantity, removeItem, totalAmount } = useCart();

  if (!isLoaded) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <div className="container mx-auto px-4 py-12 flex-1 flex flex-col">
      <h1 className="text-3xl font-black mb-8">Giỏ Hàng Của Bạn</h1>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20 bg-white rounded-2xl border border-zinc-200">
          <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-zinc-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Giỏ hàng trống</h2>
          <p className="text-zinc-500 mb-8 max-w-md">Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy thử thiết kế một sản phẩm cá nhân hóa xem sao!</p>
          <Link href="/collection" className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-colors flex items-center gap-2">
            Khám phá sản phẩm <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-6 p-6 bg-white rounded-2xl border border-zinc-200">
                <div className="w-32 h-32 bg-zinc-100 rounded-xl overflow-hidden shrink-0 relative">
                  {item.previewUrl ? (
                    <Image src={item.previewUrl} alt={item.productName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">No Preview</div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-lg">{item.productName}</h3>
                      <button onClick={() => removeItem(item.id)} className="text-zinc-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    {item.designData && <p className="text-sm text-green-600 font-medium">Đã cá nhân hóa</p>}
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 bg-zinc-100 p-1 rounded-lg">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-white rounded shadow-sm">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-white rounded shadow-sm">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <span className="font-black text-red-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 sticky top-24">
            <h3 className="text-xl font-bold mb-6">Tổng đơn hàng</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-zinc-600">
                <span>Tạm tính</span>
                <span className="font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Phí giao hàng</span>
                <span className="font-medium">Chưa tính</span>
              </div>
              <div className="border-t border-zinc-100 pt-4 flex justify-between items-center">
                <span className="font-bold">Tổng cộng</span>
                <span className="text-2xl font-black text-red-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                </span>
              </div>
            </div>
            
            <Link 
              href="/checkout" 
              className="w-full flex items-center justify-center py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-600/20"
            >
              Tiến hành thanh toán
            </Link>
            
            <div className="mt-4 text-center">
              <Link href="/collection" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
