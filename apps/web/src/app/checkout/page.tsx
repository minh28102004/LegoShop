"use client";

import { useCart } from "@/lib/cart";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, Info } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("deposit");

  const [formData, setFormData] = useState({
    phone: "",
    name: "",
    email: "",
    zalo: "",
    city: "",
    district: "",
    ward: "",
    address: "",
    receiveDate: "",
    note: ""
  });

  const total = totalAmount;
  const shippingFee = shippingMethod === "fast" ? 45000 : 0;
  const finalTotal = total + shippingFee;
  const paymentAmount = paymentMethod === "deposit" ? finalTotal * 0.7 : finalTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Map checkout data to backend DTO
    const addressWithNotes = `${formData.address}${formData.note ? ` (Ghi chú: ${formData.note})` : ''} - Giao: ${shippingMethod === 'fast' ? 'Nhanh' : shippingMethod === 'self' ? 'Tự lấy' : 'Thường'} - TT: ${paymentMethod === 'deposit' ? 'Cọc 70%' : 'Toàn bộ'}`;

    try {
      const data = await fetchApi("/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: addressWithNotes,
          receiveDate: formData.receiveDate || new Date().toISOString(), // Optional fallback
          paymentMethod: "PAYOS", // Always map to PAYOS for banking
          items: items.map(i => ({
            productId: i.productId || undefined, // Must be undefined, not a string that doesn't exist
            productName: i.productName,
            quantity: i.quantity,
            price: i.price,
            designData: i.designData
          })),
        })
      });

      if (data.orderCode || data.id) {
        clearCart();
        router.push(`/order-tracking?code=${data.orderCode || data.id}`);
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pt-10 pb-20">
      <div className="container mx-auto max-w-6xl px-4">
        <h1 className="text-3xl font-bold text-zinc-900 mb-8 text-center">Thông tin thanh toán</h1>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Shipping Form */}
          <div className="flex-1 space-y-8">
            <h2 className="text-xl font-bold text-zinc-900">Thông tin giao hàng</h2>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">1. Người nhận</h3>
              <div className="grid grid-cols-2 gap-4">
                <input required type="tel" placeholder="Số điện thoại" className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-red-400 outline-none" onChange={e => setFormData({...formData, phone: e.target.value})} />
                <input required type="text" placeholder="Họ và tên" className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-red-400 outline-none" onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <input required type="email" placeholder="Email (Nhận thông báo đơn hàng)" className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-red-400 outline-none" onChange={e => setFormData({...formData, email: e.target.value})} />
              
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1">Thông tin liên hệ gửi demo (Zalo/SĐT người đặt)</label>
                <input type="text" placeholder="Zalo hoặc SĐT để shop gửi demo check trước khi in" className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-red-400 outline-none" onChange={e => setFormData({...formData, zalo: e.target.value})} />
                <p className="text-[10px] text-zinc-400 mt-1 italic">* Dùng để shop gửi demo cho bạn duyệt trước khi in, nhất là khi bạn đặt tặng người khác.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">2. Địa chỉ & vận chuyển</h3>
              <div className="grid grid-cols-3 gap-4">
                <select className="w-full border border-zinc-200 rounded-lg p-3 text-sm outline-none bg-white">
                  <option>Tỉnh/Thành phố</option>
                  <option>Hà Nội</option>
                  <option>TP. Hồ Chí Minh</option>
                </select>
                <select className="w-full border border-zinc-200 rounded-lg p-3 text-sm outline-none bg-white">
                  <option>Quận/Huyện</option>
                </select>
                <select className="w-full border border-zinc-200 rounded-lg p-3 text-sm outline-none bg-white">
                  <option>Phường/Xã</option>
                </select>
              </div>
              <input required type="text" placeholder="Số nhà, tên đường" className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-red-400 outline-none" onChange={e => setFormData({...formData, address: e.target.value})} />

              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">Ngày nhận hàng mong muốn <span className="text-red-500">*</span></label>
                  <input required type="date" className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-red-400 outline-none text-zinc-500" onChange={e => setFormData({...formData, receiveDate: e.target.value})} />
                  <p className="text-xs text-zinc-500 mt-2">Mẹo: Đặt trước 20 ngày sẽ được giảm ngay 5%.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">Phương thức vận chuyển</label>
                  <div className="space-y-2">
                    <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${shippingMethod === 'standard' ? 'border-emerald-500 bg-emerald-50' : 'border-zinc-200'}`}>
                      <div className="flex items-center gap-2">
                        <input type="radio" name="shipping" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} className="text-emerald-500 focus:ring-emerald-500" />
                        <span className="text-sm font-medium">Ship thường (3-5 ngày)</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-600"><span className="line-through text-zinc-400 font-normal mr-1">25.000 đ</span> Miễn phí</span>
                    </label>
                    <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${shippingMethod === 'fast' ? 'border-red-500 bg-red-50' : 'border-zinc-200'}`}>
                      <div className="flex items-center gap-2">
                        <input type="radio" name="shipping" checked={shippingMethod === 'fast'} onChange={() => setShippingMethod('fast')} className="text-red-500 focus:ring-red-500" />
                        <span className="text-sm font-medium">Ship nhanh (1-2 ngày)</span>
                      </div>
                      <span className="text-sm font-bold text-zinc-800">45.000 đ</span>
                    </label>
                    <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${shippingMethod === 'self' ? 'border-blue-500 bg-blue-50' : 'border-zinc-200'}`}>
                      <div className="flex items-center gap-2">
                        <input type="radio" name="shipping" checked={shippingMethod === 'self'} onChange={() => setShippingMethod('self')} className="text-blue-500 focus:ring-blue-500" />
                        <div>
                          <div className="text-sm font-medium">Tự book ship / Qua lấy</div>
                          <div className="text-[10px] text-zinc-500">Kho: Thượng Lâm, Đông Anh, HN</div>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-zinc-800">0đ</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-sm text-blue-800">
                <Info className="w-5 h-5 shrink-0 text-blue-500 mt-0.5" />
                <p><strong>Ghi chú đơn hàng:</strong> Sản phẩm thiết kế thủ công cần 1-2 ngày để hoàn thiện trước khi gửi đi. Thời gian vận chuyển được tính từ khi shop giao hàng.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">3. Ghi chú đơn hàng</h3>
              <textarea placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến..." rows={3} className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-red-400 outline-none resize-none" onChange={e => setFormData({...formData, note: e.target.value})}></textarea>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[450px] shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden sticky top-24">
              <div className="bg-emerald-50 px-6 py-4 flex items-center gap-2 text-emerald-700 font-bold text-sm border-b border-emerald-100">
                <CheckCircle2 className="w-5 h-5" />
                Chúc mừng! Bạn được Miễn phí giao hàng thường.
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-zinc-900">Đơn hàng của bạn</h3>
                  <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full">{items.length} cart.items</span>
                </div>

                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <div key={item.id} className="flex gap-4 p-4 border border-zinc-100 rounded-xl">
                      <div className="w-16 h-16 bg-zinc-100 rounded flex items-center justify-center text-xs text-zinc-400 shrink-0">Ảnh</div>
                      <div className="flex-1 flex flex-col justify-between text-sm">
                        <div className="flex justify-between items-start">
                          <div className="font-bold text-zinc-800 uppercase text-xs">#{idx+1} {item.productName}</div>
                          <div className="font-bold">{formatCurrency(item.price)}</div>
                        </div>
                        {item.designData && (
                          <div className="text-zinc-500 text-xs">{item.designData.frameSize}</div>
                        )}
                        <div className="flex gap-2 mt-2">
                          <span className="bg-red-50 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded">x{item.quantity}</span>
                          <span className="text-zinc-500 text-[10px] font-bold px-1.5 py-0.5 border rounded">1 NV</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-zinc-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Tạm tính</span>
                    <span className="font-medium">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Phí vận chuyển</span>
                    <span className="font-bold text-emerald-600">{shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</span>
                  </div>
                </div>

                <div className="space-y-3 border-t border-zinc-100 pt-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 mb-1">Mã giảm giá</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="NHẬP MÃ" className="flex-1 border border-zinc-200 rounded-lg p-2 text-sm outline-none" />
                      <button type="button" className="bg-zinc-500 text-white px-4 py-2 rounded-lg text-sm font-bold">Áp dụng</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 mb-1">Mã giới thiệu (CTV)</label>
                    <input type="text" placeholder="Nhập mã CTV (nếu có)" className="w-full border border-zinc-200 rounded-lg p-2 text-sm outline-none" />
                  </div>
                </div>

                <div className="border-t border-b border-zinc-100 py-4 space-y-2">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-zinc-900">Tổng cộng</span>
                    <span className="text-zinc-900">{formatCurrency(finalTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-red-400">
                    <span>Cần thanh toán</span>
                    <span>{formatCurrency(paymentAmount)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-zinc-800">Phương thức thanh toán</h3>
                  <div className="space-y-2">
                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${paymentMethod === 'deposit' ? 'border-red-300 bg-red-50' : 'border-zinc-200'}`}>
                      <input type="radio" name="payment" checked={paymentMethod === 'deposit'} onChange={() => setPaymentMethod('deposit')} className="text-red-500 focus:ring-red-500" />
                      <span className="text-sm font-medium">Chuyển khoản cọc 70%</span>
                    </label>
                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${paymentMethod === 'full' ? 'border-red-300 bg-red-50' : 'border-zinc-200'}`}>
                      <input type="radio" name="payment" checked={paymentMethod === 'full'} onChange={() => setPaymentMethod('full')} className="text-red-500 focus:ring-red-500" />
                      <span className="text-sm font-medium">Chuyển khoản toàn bộ</span>
                    </label>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || items.length === 0}
                  className="w-full py-4 bg-red-400 hover:bg-red-500 text-white rounded-xl font-bold text-lg disabled:opacity-50 transition-colors"
                >
                  {loading ? "Đang xử lý..." : "ĐẶT HÀNG"}
                </button>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
