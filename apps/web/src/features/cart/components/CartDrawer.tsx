"use client";

import { formatCurrency } from "@lego-shop/shared";
import { useCart } from "@/features/cart/hooks/useCart";
import { X, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, removeItem, updateQuantity, totalAmount } = useCart();
  const router = useRouter();

  const getFrameLabel = (item: (typeof items)[number]) => {
    if (item.frameSizeLabel.trim()) {
      return item.frameSizeLabel
    }

    const frameSize = item.designData?.frameSize
    return typeof frameSize === "string" ? frameSize : null
  }

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-cart', handleOpen);
    return () => window.removeEventListener('open-cart', handleOpen);
  }, []);

  if (!isOpen) return null;

  const total = totalAmount;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-50 transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[400px] bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100">
          <h2 className="text-xl font-bold text-zinc-900">Giỏ hàng</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-emerald-50 text-emerald-600 px-4 py-3 text-sm font-bold flex items-center gap-2 border-b border-emerald-100">
          <CheckCircle2 className="w-4 h-4" />
          Phí ship không cộng vào đơn. Shop báo phí trước khi giao.
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center text-zinc-500 py-10">Giỏ hàng trống</div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-4 p-4 border border-zinc-100 rounded-xl bg-zinc-50">
                <div className="w-20 h-20 bg-white rounded-lg border border-zinc-200 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-6 h-6 text-zinc-300" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-zinc-900 text-sm pr-4">{item.productName}</h3>
                      <button onClick={() => removeItem(item.id)} className="text-zinc-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {getFrameLabel(item) && (
                      <p className="text-xs text-zinc-500 mt-1">{getFrameLabel(item)}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-red-500">{formatCurrency(item.unitPrice)}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-zinc-200 rounded-full bg-white">
                        <button 
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-zinc-900"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-zinc-900"
                        >
                          +
                        </button>
                      </div>
                      <button className="text-xs font-bold text-blue-500 uppercase">Sửa</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-white border-t border-zinc-100 shrink-0">
          <div className="flex justify-between items-end mb-6">
            <span className="font-bold text-zinc-500 uppercase tracking-wider text-xs">Tạm tính</span>
            <span className="text-2xl font-black text-zinc-900">{formatCurrency(total)}</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => { setIsOpen(false); router.push('/cart'); }}
              className="flex-1 py-3 bg-zinc-100 text-zinc-700 font-bold rounded-xl hover:bg-zinc-200 transition-colors text-sm"
            >
              XEM GIỎ HÀNG
            </button>
            <button 
              onClick={() => { setIsOpen(false); router.push('/checkout'); }}
              className="flex-1 py-3 bg-red-300 text-white font-bold rounded-xl hover:bg-red-400 transition-colors text-sm"
            >
              THANH TOÁN
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
