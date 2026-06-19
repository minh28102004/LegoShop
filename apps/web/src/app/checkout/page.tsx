"use client";

import { useCart } from "@/features/cart/hooks/useCart";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/formatters";
import { ArrowLeft, ChevronRight, Info, Gift, Lightbulb, Camera, Zap, AlertCircle } from "lucide-react";
import { publicApiClient } from "@/lib/api/public-client";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants";
import type { CreateOrderRequestContract, JsonObject, PaymentSettingsContract } from "@lego-shop/shared";

type PaymentSettings = Pick<
  PaymentSettingsContract,
  "codEnabled" | "payosEnabled" | "codDepositEnabled" | "codDepositPercent"
>;

const SHIPPING_OPTIONS = [
  { id: "standard", label: "Ship thường (3-5 ngày)", fee: 0, note: "Miễn phí" },
  { id: "fast", label: "Ship nhanh (1-2 ngày)", fee: 45000, note: null },
  { id: "self", label: "Tự book ship / Qua lấy", fee: 0, note: "Kho: Thư Lôm, Đông Anh, Hà Nội" },
] as const;

const POLAROID_OPTIONS = [
  { id: "none", label: "Không in thêm", price: 0 },
  { id: "2", label: "In 2 ảnh (+15k)", price: 15000 },
  { id: "4", label: "In 4 ảnh (+25k)", price: 25000 },
] as const;

type ShippingMethod = (typeof SHIPPING_OPTIONS)[number]["id"];
type PolaroidOption = (typeof POLAROID_OPTIONS)[number]["id"];
type CheckoutPaymentMethod = "COD" | "PAYOS" | "COD_DEPOSIT";

export default function CheckoutPage() {
  const { items, totalAmount, clearCart, isEmpty, itemCount } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("PAYOS");
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [giftPackage, setGiftPackage] = useState(false);
  const [polaroid, setPolaroid] = useState<PolaroidOption>("none");
  const [discountCode, setDiscountCode] = useState("");
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    publicApiClient.public.getPaymentSettings().then(data => {
      setPaymentSettings(data);
      if (data?.payosEnabled) setPaymentMethod("PAYOS");
      else if (data?.codDepositEnabled) setPaymentMethod("COD_DEPOSIT");
      else if (data?.codEnabled) setPaymentMethod("COD");
    }).catch(() => {
      // Default if API fails
      setPaymentSettings({ codEnabled: true, payosEnabled: true, codDepositEnabled: true, codDepositPercent: 70 });
    });
  }, []);

  const [formData, setFormData] = useState({
    phone: "", name: "", email: "", zalo: "",
    city: "", district: "", ward: "",
    address: "", receiveDate: "", note: ""
  });

  const shippingFee = SHIPPING_OPTIONS.find(s => s.id === shippingMethod)?.fee ?? 0;
  const giftFee = giftPackage ? 30000 * itemCount : 0;
  const polaroidFee = POLAROID_OPTIONS.find(p => p.id === polaroid)?.price ?? 0;
  const subtotal = totalAmount + giftFee + polaroidFee;
  const finalTotal = subtotal + shippingFee;

  const depositPercent = paymentSettings?.codDepositPercent ?? 70;
  const depositAmount = Math.round(finalTotal * (depositPercent / 100));
  // const remainingAmount = finalTotal - depositAmount; // reserved for display

  // const needsPayment = paymentMethod === "PAYOS" || paymentMethod === "COD_DEPOSIT"; // reserved
  const amountToPayNow = paymentMethod === "COD_DEPOSIT" ? depositAmount : paymentMethod === "PAYOS" ? finalTotal : 0;

  const freeshipThreshold = 349000;
  const isFreeShip = totalAmount >= freeshipThreshold;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const payload: CreateOrderRequestContract = {
        customerName: formData.name,
        phone: formData.phone,
        address: `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.city}`,
        paymentMethod: paymentMethod === "COD_DEPOSIT" ? "COD" : paymentMethod,
        items: items.map(i => ({
          productName: i.productName,
          quantity: i.quantity,
          price: i.unitPrice,
          designData: i.designData as JsonObject,
        })),
      };
      if (formData.email) {
        payload.email = formData.email;
      }
      if (formData.receiveDate) {
        payload.receiveDate = formData.receiveDate;
      }
      payload.items.forEach((item, index) => {
        const cartItem = items[index];
        if (!cartItem) return;
        if (cartItem.productId) item.productId = cartItem.productId;
        if (cartItem.previewUrl) item.previewUrl = cartItem.previewUrl;
      });
      const data = await publicApiClient.orders.createOrder(payload);
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.orderCode || data.orderId) {
        clearCart();
        router.push(`/order-success?orderCode=${data.orderCode || data.orderId}`);
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFormData(prev => ({ ...prev, [key]: e.target.value }));

  const inputCls = "w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-surface";

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-6">
          <Link href={ROUTES.cart} className="hover:text-primary flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Giỏ hàng</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-text-secondary font-semibold">Thanh toán</span>
        </nav>

        {isEmpty ? (
          <div className="text-center py-20">
            <p className="text-text-secondary mb-4">Giỏ hàng của bạn đang trống.</p>
            <Link href={ROUTES.studio} className="text-primary font-bold hover:underline">Bắt đầu thiết kế →</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
            {/* ── LEFT: Form ──────────────────────────────── */}
            <div className="flex-1 space-y-6">
              <h1 className="text-2xl font-black text-text-primary">Thông tin giao hàng</h1>

              {/* 1. Người nhận */}
              <section className="bg-surface rounded-2xl p-6 border border-border space-y-4">
                <h2 className="font-bold text-sm uppercase tracking-wider text-text-secondary flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center">1</span>
                  NGƯỜI NHẬN
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input required type="tel" placeholder="Số điện thoại" value={formData.phone} onChange={field("phone")} className={inputCls} />
                  <input required type="text" placeholder="Họ và tên" value={formData.name} onChange={field("name")} className={inputCls} />
                </div>
                <input required type="email" placeholder="Email (Nhận thông báo đơn hàng)" value={formData.email} onChange={field("email")} className={inputCls} />
                <div>
                  <label className="block text-xs text-text-muted mb-1 font-medium">Thông tin liên hệ gửi demo (Zalo/SĐT người đặt)</label>
                  <input type="text" placeholder="Zalo hoặc SĐT để shop gửi demo check trước khi in" value={formData.zalo} onChange={field("zalo")} className={inputCls} />
                  <p className="text-[11px] text-text-muted mt-1">* Dùng để shop gửi demo cho bạn duyệt trước khi in, nhất là khi bạn đặt tặng người khác.</p>
                </div>
              </section>

              {/* 2. Địa chỉ & Vận chuyển */}
              <section className="bg-surface rounded-2xl p-6 border border-border space-y-4">
                <h2 className="font-bold text-sm uppercase tracking-wider text-text-secondary flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center">2</span>
                  ĐỊA CHỈ & VẬN CHUYỂN
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  <select required value={formData.city} onChange={field("city")} className={inputCls}>
                    <option value="">Tỉnh/Thành phố</option>
                    <option>Hà Nội</option>
                    <option>TP. Hồ Chí Minh</option>
                    <option>Đà Nẵng</option>
                    <option>Hải Phòng</option>
                  </select>
                  <select required value={formData.district} onChange={field("district")} className={inputCls}>
                    <option value="">Quận/Huyện</option>
                    <option>Hoàn Kiếm</option>
                    <option>Đống Đa</option>
                    <option>Cầu Giấy</option>
                    <option>Đông Anh</option>
                  </select>
                  <select required value={formData.ward} onChange={field("ward")} className={inputCls}>
                    <option value="">Phường/Xã</option>
                    <option>Thư Lôm</option>
                    <option>Vĩnh Ngọc</option>
                  </select>
                </div>
                <input required type="text" placeholder="Số nhà, tên đường" value={formData.address} onChange={field("address")} className={inputCls} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                  {/* Ngày nhận */}
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wide">
                      NGÀY NHẬN HÀNG MONG MUỐN* <span className="text-text-muted font-normal normal-case">(NGÀY/THÁNG/NĂM)</span>
                    </label>
                    <input type="date" value={formData.receiveDate} onChange={field("receiveDate")}
                      className={inputCls}
                      placeholder="VD: 01/06/2026" />
                    <p className="text-[11px] text-text-muted mt-1">Mẹo: Đặt trước 20 ngày để được giảm ngay 5%.</p>
                  </div>
                  {/* Phương thức vận chuyển */}
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wide">Phương thức vận chuyển</label>
                    <div className="space-y-2">
                      {SHIPPING_OPTIONS.map(opt => (
                        <label key={opt.id} className={`flex items-center justify-between px-3 py-2.5 border-2 rounded-xl cursor-pointer transition-all ${shippingMethod === opt.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                          <div className="flex items-center gap-2.5">
                            <input type="radio" name="shipping" checked={shippingMethod === opt.id} onChange={() => setShippingMethod(opt.id)}
                              className="text-primary focus:ring-primary w-3.5 h-3.5" />
                            <div>
                              <span className="text-sm font-semibold text-text-primary">{opt.label}</span>
                              {opt.note && <span className="block text-[11px] text-text-muted">{opt.note}</span>}
                            </div>
                          </div>
                          <span className={`text-sm font-bold ${opt.fee === 0 && opt.id === 'standard' ? (isFreeShip ? 'text-emerald-600' : 'text-primary') : 'text-text-primary'}`}>
                            {opt.id === 'standard' && isFreeShip ? (
                              <span className="flex items-center gap-1"><s className="text-text-muted text-xs">{formatPrice(25000)}</s> Miễn phí</span>
                            ) : opt.fee === 0 ? '0đ' : formatPrice(opt.fee)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-600 leading-relaxed">
                    <strong>Ghi chú đơn hàng:</strong> Sản phẩm thiết kế thủ công cần 1-2 ngày để hoàn thiện trước khi gửi đi. Thời gian vận chuyển được tính từ khi shop giao hàng.
                  </p>
                </div>
              </section>

              {/* 3. Ghi chú */}
              <section className="bg-surface rounded-2xl p-6 border border-border space-y-4">
                <h2 className="font-bold text-sm uppercase tracking-wider text-text-secondary flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center">3</span>
                  GHI CHÚ ĐƠN HÀNG
                </h2>
                <textarea rows={3} placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến..." value={formData.note} onChange={field("note")}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-surface resize-none" />
              </section>

              {/* Thêm dịch vụ */}
              <section className="space-y-3">
                {/* Gói quà */}
                <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${giftPackage ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/20 bg-surface'}`}>
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-background border border-border flex items-center justify-center">
                    <Gift className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-text-primary">Gói quà (cho từng tranh)</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-primary">+{formatPrice(30000 * itemCount)}</span>
                        <input type="checkbox" checked={giftPackage} onChange={e => setGiftPackage(e.target.checked)} className="w-4 h-4 rounded text-primary focus:ring-primary" />
                      </div>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">({formatPrice(30000)} × {itemCount})</p>
                    <p className="text-xs text-text-secondary mt-1">Hộp quà, túi, thiệp & rơm (Áp dụng cho mỗi tranh trong giỏ hàng).</p>
                  </div>
                </label>

                {/* Thêm đèn (out of stock) */}
                <div className="flex items-start gap-4 p-4 rounded-2xl border-2 border-border bg-surface opacity-70 cursor-not-allowed">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-background border border-border flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-text-muted" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-text-secondary">Thêm Đèn (cho từng tranh)</span>
                        <span className="text-[10px] font-black bg-error/10 text-error px-1.5 py-0.5 rounded">TẠM HẾT</span>
                      </div>
                      <span className="text-sm font-bold text-text-muted">+{formatPrice(50000 * itemCount)}</span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">({formatPrice(50000)} × {itemCount})</p>
                    <p className="text-xs text-text-secondary mt-1">Đèn Spotlight trang trí (Áp dụng cho mỗi tranh LEGO trong giỏ hàng).</p>
                    <p className="text-[11px] text-error/70 mt-1">* Dịch vụ đèn trang trí hiện tạm hết với tư, shop xin sắm xếp nhất sau.</p>
                  </div>
                </div>

                {/* Polaroid */}
                <div className="bg-surface rounded-2xl border border-border p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Camera className="w-5 h-5 text-text-secondary" />
                    <span className="font-bold text-sm text-text-primary">In thêm ảnh Polaroid</span>
                    <span className="text-[11px] text-text-muted">Ảnh nhỏ Polaroid đi kèm trong khung hoặc hộp quà.</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {POLAROID_OPTIONS.map(opt => (
                      <button key={opt.id} type="button" onClick={() => setPolaroid(opt.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all ${polaroid === opt.id ? 'border-primary bg-primary/5 text-primary' : 'border-border text-text-secondary hover:border-primary/30'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* ── RIGHT: Order Summary ───────────────────── */}
            <div className="w-full lg:w-[400px] shrink-0 space-y-4">
              {/* Freeship */}
              {isFreeShip && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-2.5">
                  <span className="text-lg">🎉</span>
                  <p className="text-sm font-semibold text-emerald-700">Chúc mừng! Bạn được Miễn phí giao hàng thường.</p>
                </div>
              )}

              {/* Đơn hàng */}
              <div className="bg-surface rounded-2xl border border-border overflow-hidden sticky top-6">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h3 className="font-black text-sm text-text-primary">Đơn hàng của bạn</h3>
                  <span className="text-xs font-bold text-text-muted bg-background px-2 py-0.5 rounded-full">{itemCount} SẢN PHẨM</span>
                </div>

                {/* Items */}
                <div className="divide-y divide-border max-h-60 overflow-y-auto">
                  {items.map((item, idx) => (
                    <div key={item.id} className="flex items-start gap-3 px-5 py-3">
                      <div className="w-12 h-12 rounded-lg bg-background border border-border shrink-0 overflow-hidden relative">
                        {item.previewUrl ? (
                          <Image src={item.previewUrl} alt={item.productName} fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-text-muted">#{idx + 1}</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-text-primary truncate">{item.productName}</p>
                        <p className="text-[11px] text-text-muted">{item.frameSizeLabel}</p>
                        <p className="text-[11px] text-text-muted">×{item.quantity} NV</p>
                      </div>
                      <span className="text-sm font-bold text-text-primary shrink-0">{formatPrice(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="px-5 py-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Tạm tính</span>
                    <span className="font-semibold">{formatPrice(totalAmount)}</span>
                  </div>
                  {giftPackage && (
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Gói quà</span>
                      <span className="font-semibold">+{formatPrice(giftFee)}</span>
                    </div>
                  )}
                  {polaroid !== "none" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Ảnh Polaroid</span>
                      <span className="font-semibold">+{formatPrice(polaroidFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Phí vận chuyển</span>
                    <span className={`font-semibold ${shippingFee === 0 ? 'text-emerald-600' : ''}`}>
                      {shippingFee === 0 ? 'MIỄN PHÍ' : formatPrice(shippingFee)}
                    </span>
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1 mt-2">Mã giảm giá</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="NHẬP MÃ" value={discountCode} onChange={e => setDiscountCode(e.target.value)}
                        className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-background uppercase" />
                      <button type="button" className="px-4 py-2 bg-text-primary text-white text-xs font-bold rounded-lg hover:bg-text-secondary transition-colors">Áp dụng</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Mã giới thiệu (CTV)</label>
                    <input type="text" placeholder="Nhập mã CTV (nếu có)" value={referralCode} onChange={e => setReferralCode(e.target.value)}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-background" />
                  </div>

                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between text-base font-black">
                      <span>TỔNG CỘNG</span>
                      <span>{formatPrice(finalTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment section */}
                <div className="px-5 pb-5 space-y-4">
                  {/* CẦN THANH TOÁN */}
                  {paymentMethod !== "COD" && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-text-secondary uppercase">CẦN THANH TOÁN</span>
                      <span className="text-2xl font-black text-primary">{formatPrice(amountToPayNow)}</span>
                    </div>
                  )}

                  {/* Payment methods */}
                  <div>
                    <p className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wide">Phương thức thanh toán</p>
                    <div className="space-y-2">
                      {paymentSettings?.codDepositEnabled && (
                        <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD_DEPOSIT' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                          <input type="radio" name="payment" checked={paymentMethod === 'COD_DEPOSIT'} onChange={() => setPaymentMethod('COD_DEPOSIT')}
                            className="text-primary focus:ring-primary w-4 h-4" />
                          <span className="text-sm font-semibold text-text-primary">Chuyển khoản cọc {depositPercent}%</span>
                        </label>
                      )}
                      {paymentSettings?.payosEnabled && (
                        <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'PAYOS' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                          <input type="radio" name="payment" checked={paymentMethod === 'PAYOS'} onChange={() => setPaymentMethod('PAYOS')}
                            className="text-primary focus:ring-primary w-4 h-4" />
                          <span className="text-sm font-semibold text-text-primary">Chuyển khoản toàn bộ</span>
                        </label>
                      )}
                      {paymentSettings?.codEnabled && (
                        <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                          <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')}
                            className="text-primary focus:ring-primary w-4 h-4" />
                          <span className="text-sm font-semibold text-text-primary">Thanh toán khi nhận hàng (COD)</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                    <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-yellow-700 leading-relaxed">
                      Đơn hàng chưa thanh toán sẽ tự động <strong>HỦY sau 48 giờ</strong> để tránh tình trạng giữ hàng (om đơn).
                    </p>
                  </div>

                  {/* Submit */}
                  <button type="submit" disabled={loading}
                    className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black text-lg disabled:opacity-60 transition-colors shadow-sm flex items-center justify-center gap-2">
                    {loading ? "Đang xử lý..." : (
                      <><Zap className="w-5 h-5" /> ĐẶT HÀNG NGAY</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

