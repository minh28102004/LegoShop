"use client";

import { useCart } from "@/features/cart/hooks/useCart";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  Camera,
  CreditCard,
  Gift,
  Info,
  PackageCheck,
  Zap,
} from "lucide-react";
import { formatCurrency as formatPrice } from "@lego-shop/shared";
import type {
  ApplyVoucherResponseContract,
  CreateOrderRequestContract,
  JsonObject,
  PaymentSettingsContract,
} from "@lego-shop/shared";

import { ROUTES } from "@/config/routes";
import { getCartItemParts } from "@/features/cart/cart-parts";
import { resolveApiAssetUrl } from "@/lib/api/assets";
import { publicApiClient } from "@/lib/api/public-client";
import {
  getDesignCharacterCount,
  getDesignTemplateName,
  isCustomFrameDesignData,
  isPersistableImageUrl,
} from "@/modules/studio/lib/design-data";
import type { SimpleCartItem } from "@/features/cart/store";

type PaymentSettings = Pick<
  PaymentSettingsContract,
  "codEnabled" | "payosEnabled" | "codDepositEnabled" | "codDepositPercent"
>;

const SHIPPING_OPTIONS = [
  {
    id: "shop_support",
    label: "Shop hỗ trợ đặt ship",
    detail: "Shop báo phí trước khi giao",
    note: "Khách trả phí ship trực tiếp cho tài xế",
  },
  {
    id: "self",
    label: "Tự book ship / Qua lấy",
    detail: "Kho: Thư Lâm, Đông Anh, HN",
    note: "Shop xác nhận trước khi lấy",
  },
] as const;

const POLAROID_OPTIONS = [
  { id: "none", label: "Không in thêm", price: 0 },
  { id: "2", label: "In 2 ảnh", price: 15000 },
  { id: "4", label: "In 4 ảnh", price: 25000 },
] as const;

type ShippingMethod = (typeof SHIPPING_OPTIONS)[number]["id"];
type PolaroidOption = (typeof POLAROID_OPTIONS)[number]["id"];
type CheckoutPaymentMethod = "COD" | "PAYOS" | "COD_DEPOSIT";

function readDesignText(item: SimpleCartItem, key: string) {
  const value = item.designData?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readCharacterCount(item: SimpleCartItem) {
  return getDesignCharacterCount(item.designData);
}

function readDesignString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getCartItemFrameOptionId(item: SimpleCartItem) {
  if (isCustomFrameDesignData(item.designData)) {
    return item.designData.frameOptionId;
  }

  if (item.designData?.type === "RETAIL_ITEM") {
    return item.designData.retailType === "frame"
      ? item.frameOptionId ?? readDesignString(item.designData.sourceId)
      : undefined;
  }

  return item.frameOptionId;
}

function getCartItemBackgroundId(item: SimpleCartItem) {
  if (isCustomFrameDesignData(item.designData)) {
    return item.designData.backgroundId ?? undefined;
  }

  if (item.designData?.type === "RETAIL_ITEM" && item.designData.retailType === "background") {
    return readDesignString(item.designData.sourceId);
  }

  return readDesignString(item.designData?.backgroundId);
}

function hasUnpersistedDesignImage(item: SimpleCartItem) {
  if (!isPersistableImageUrl(item.previewUrl)) {
    return true;
  }

  if (!isCustomFrameDesignData(item.designData)) {
    return false;
  }

  return item.designData.uploadedImages.some((image) => !isPersistableImageUrl(image.url));
}

function calculateVoucherDiscount(voucher: ApplyVoucherResponseContract | null, amount: number) {
  if (!voucher || amount < voucher.minOrderAmount) return 0;
  const rawDiscount =
    voucher.discountType === "percentage"
      ? Math.round(amount * (voucher.discountValue / 100))
      : voucher.discountValue;
  const cappedDiscount =
    typeof voucher.maxDiscountAmount === "number"
      ? Math.min(rawDiscount, voucher.maxDiscountAmount)
      : rawDiscount;

  return Math.max(0, Math.min(cappedDiscount, amount));
}

export default function CheckoutPage() {
  const { items, totalAmount, clearCart, isEmpty, itemCount, updateItemNote } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("shop_support");
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("PAYOS");
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [giftPackage, setGiftPackage] = useState(false);
  const [polaroid, setPolaroid] = useState<PolaroidOption>("none");
  const [discountCode, setDiscountCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<ApplyVoucherResponseContract | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState("");

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
    note: "",
  });

  useEffect(() => {
    publicApiClient.public
      .getPaymentSettings()
      .then((data) => {
        setPaymentSettings(data);
        if (data?.codDepositEnabled) setPaymentMethod("COD_DEPOSIT");
        else if (data?.payosEnabled) setPaymentMethod("PAYOS");
        else if (data?.codEnabled) setPaymentMethod("COD");
      })
      .catch(() => {
        setPaymentSettings({
          codEnabled: true,
          payosEnabled: true,
          codDepositEnabled: true,
          codDepositPercent: 70,
        });
        setPaymentMethod("COD_DEPOSIT");
      });
  }, []);

  const shippingFee = 0;
  const giftFee = giftPackage ? 30000 * itemCount : 0;
  const polaroidFee = POLAROID_OPTIONS.find((p) => p.id === polaroid)?.price ?? 0;
  const subtotal = totalAmount + giftFee + polaroidFee;
  const discountAmount = calculateVoucherDiscount(appliedVoucher, subtotal);
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);
  const depositPercent = paymentSettings?.codDepositPercent ?? 70;
  const depositAmount = Math.round(finalTotal * (depositPercent / 100));
  const amountToPayNow = paymentMethod === "COD_DEPOSIT" ? depositAmount : paymentMethod === "PAYOS" ? finalTotal : 0;

  const paymentOptions = useMemo(() => {
    const options: Array<{
      id: CheckoutPaymentMethod;
      label: string;
      detail: string;
      amountLabel: string;
    }> = [];

    if (paymentSettings?.codDepositEnabled) {
      options.push({
        id: "COD_DEPOSIT",
        label: `Chuyển khoản cọc ${depositPercent}%`,
        detail: "Phần còn lại thanh toán khi nhận hàng",
        amountLabel: formatPrice(depositAmount),
      });
    }

    if (paymentSettings?.payosEnabled) {
      options.push({
        id: "PAYOS",
        label: "Chuyển khoản toàn bộ",
        detail: "Tạo link thanh toán ngay sau khi đặt hàng",
        amountLabel: formatPrice(finalTotal),
      });
    }

    if (!paymentSettings?.codDepositEnabled && paymentSettings?.codEnabled) {
      options.push({
        id: "COD",
        label: "Thanh toán khi nhận hàng",
        detail: "Shop xác nhận đơn trước khi sản xuất",
        amountLabel: "0 đ",
      });
    }

    return options;
  }, [depositAmount, depositPercent, finalTotal, paymentSettings]);

  const field =
    (key: keyof typeof formData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setFormData((prev) => ({ ...prev, [key]: event.target.value }));

  const handleApplyVoucher = async () => {
    const code = discountCode.trim();
    if (!code || voucherLoading) return;

    setVoucherLoading(true);
    setVoucherError(null);
    try {
      const voucher = await publicApiClient.public.applyVoucher({
        code,
        orderAmount: subtotal,
      });
      setAppliedVoucher(voucher);
      setDiscountCode(voucher.code);
    } catch (error) {
      setAppliedVoucher(null);
      setVoucherError(error instanceof Error ? error.message : "Mã giảm giá không hợp lệ.");
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    const phone = formData.phone.replace(/\s/g, "");
    const email = formData.email.trim();
    const fullAddress = [formData.address, formData.ward, formData.district, formData.city]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(", ");

    if (!formData.name.trim() || !phone || !fullAddress) {
      alert("Vui lòng nhập đầy đủ tên, số điện thoại và địa chỉ nhận hàng.");
      return;
    }

    if (!/^(0|\+84)\d{8,10}$/.test(phone)) {
      alert("Số điện thoại chưa đúng định dạng.");
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Email chưa đúng định dạng.");
      return;
    }

    if (items.some(hasUnpersistedDesignImage)) {
      alert("Thiết kế vẫn còn ảnh tạm trong trình duyệt. Vui lòng mở Studio và tải lại ảnh trước khi đặt hàng.");
      return;
    }

    setLoading(true);
    try {
      const orderNote = formData.note.trim();
      const payload: CreateOrderRequestContract = {
        customerName: formData.name.trim(),
        phone,
        customerPhone: phone,
        address: fullAddress,
        addressLine: formData.address.trim(),
        province: formData.city,
        city: formData.city,
        district: formData.district,
        ward: formData.ward,
        ...(email ? { email, customerEmail: email } : {}),
        ...(formData.zalo.trim() ? { customerZalo: formData.zalo.trim() } : {}),
        ...(formData.receiveDate ? { receiveDate: formData.receiveDate } : {}),
        ...(orderNote ? { note: orderNote } : {}),
        shippingMethod,
        ...(appliedVoucher && discountAmount > 0 ? { voucherCode: appliedVoucher.code } : {}),
        giftPackage,
        polaroidOption: polaroid,
        paymentMethod: paymentMethod === "COD_DEPOSIT" ? "COD" : paymentMethod,
        items: items.map((item) => {
          const frameOptionId = getCartItemFrameOptionId(item);
          const backgroundId = getCartItemBackgroundId(item);

          return {
            productName: item.productName,
            quantity: item.quantity,
            price: item.unitPrice,
            ...(item.productId ? { productId: item.productId } : {}),
            ...(frameOptionId ? { frameOptionId, frameSizeId: frameOptionId } : {}),
            ...(backgroundId ? { backgroundId } : {}),
            ...(item.frameSizeLabel ? { frameSizeLabel: item.frameSizeLabel } : {}),
            ...(item.frameColorName ? { frameColorName: item.frameColorName } : {}),
            ...(item.note?.trim() ? { note: item.note.trim() } : {}),
            ...(item.accessories?.length ? { accessories: item.accessories } : {}),
            designData: item.designData as JsonObject,
            ...(item.previewUrl ? { previewUrl: item.previewUrl } : {}),
          };
        }),
      };

      const data = await publicApiClient.orders.createOrder(payload);
      const redirectUrl = data.checkoutUrl ?? data.paymentUrl;
      if (redirectUrl) {
        clearCart();
        window.location.href = redirectUrl;
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

  const inputClass =
    "h-12 w-full rounded-[10px] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2f91d0] focus:ring-4 focus:ring-[#dceeff]";
  const panelClass = "rounded-[10px] border border-slate-200 bg-white p-6 shadow-sm";

  return (
    <main className="min-h-screen bg-[#fafafa] pb-14">
      <div className="mx-auto max-w-[1180px] px-4 pt-8 sm:px-6">
        <h1 className="mb-6 text-center text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Thông tin thanh toán
        </h1>

        {isEmpty ? (
          <div className="rounded-[10px] border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <PackageCheck className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <p className="mb-5 text-base font-semibold text-slate-600">Giỏ hàng của bạn đang trống.</p>
            <Link
              href={ROUTES.studio}
              className="inline-flex rounded-[10px] bg-[#2f91d0] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#257fb7]"
            >
              Bắt đầu thiết kế
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,640px)_440px] lg:items-start">
            <div className="space-y-5">
              <section className={panelClass}>
                <h2 className="text-xl font-bold text-slate-950">Thông tin giao hàng</h2>

                <div className="mt-4 border-t border-slate-200 pt-5">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.1em] text-slate-500">1. Người nhận</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input required type="tel" placeholder="Số điện thoại" value={formData.phone} onChange={field("phone")} className={inputClass} />
                    <input required type="text" placeholder="Họ và tên" value={formData.name} onChange={field("name")} className={inputClass} />
                    <input required type="email" placeholder="Email (Nhận thông báo đơn hàng)" value={formData.email} onChange={field("email")} className={`${inputClass} sm:col-span-2`} />
                    <label className="sm:col-span-2">
                      <span className="mb-2 block text-xs font-bold text-slate-600">Thông tin liên hệ gửi demo (Zalo/SĐT người đặt)</span>
                      <input
                        type="text"
                        placeholder="Zalo hoặc SĐT để shop gửi demo check trước khi in"
                        value={formData.zalo}
                        onChange={field("zalo")}
                        className={inputClass}
                      />
                      <span className="mt-2 block text-[11px] italic text-slate-400">
                        Dùng để shop gửi demo cho bạn duyệt trước khi in, nhất là khi bạn đặt tặng người khác.
                      </span>
                    </label>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-200 pt-5">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.1em] text-slate-500">2. Địa chỉ & vận chuyển</h3>
                  <div className="grid gap-3 md:grid-cols-3">
                    <select required value={formData.city} onChange={field("city")} className={inputClass}>
                      <option value="">Tỉnh/Thành phố</option>
                      <option>Hà Nội</option>
                      <option>TP. Hồ Chí Minh</option>
                      <option>Đà Nẵng</option>
                      <option>Hải Phòng</option>
                    </select>
                    <select required value={formData.district} onChange={field("district")} className={inputClass}>
                      <option value="">Quận/Huyện</option>
                      <option>Hoàn Kiếm</option>
                      <option>Đống Đa</option>
                      <option>Cầu Giấy</option>
                      <option>Đông Anh</option>
                    </select>
                    <select required value={formData.ward} onChange={field("ward")} className={inputClass}>
                      <option value="">Phường/Xã</option>
                      <option>Thư Lâm</option>
                      <option>Vĩnh Ngọc</option>
                    </select>
                    <input required type="text" placeholder="Số nhà, tên đường" value={formData.address} onChange={field("address")} className={`${inputClass} md:col-span-3`} />
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <label>
                      <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-700">
                        Ngày nhận hàng mong muốn <span className="text-[#2f91d0]">*</span>
                        <span className="text-[10px] font-bold text-slate-400">(ngày/tháng/năm)</span>
                      </span>
                      <div className="relative">
                        <input type="date" value={formData.receiveDate} onChange={field("receiveDate")} className={`${inputClass} pr-11`} />
                        <CalendarDays className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>
                      <span className="mt-2 block text-xs font-medium text-slate-500">
                        Mẹo: Đặt trước 20 ngày để được giảm ngay 5%.
                      </span>
                    </label>

                    <div>
                      <h4 className="mb-2 text-base font-bold text-slate-900">Phương thức vận chuyển</h4>
                      <div className="space-y-2">
                        {SHIPPING_OPTIONS.map((option) => {
                          const active = shippingMethod === option.id;

                          return (
                            <label
                              key={option.id}
                              className={`flex cursor-pointer items-center gap-3 rounded-[10px] border px-3 py-3 transition ${
                                active ? "border-[#2f91d0] bg-[#f4faff]" : "border-slate-200 bg-white hover:border-[#2f91d0]/60"
                              }`}
                            >
                              <input
                                type="radio"
                                name="shipping"
                                checked={active}
                                onChange={() => setShippingMethod(option.id)}
                                className="h-4 w-4 accent-[#2f91d0]"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-bold text-slate-800">
                                  {option.label} ({option.detail})
                                </span>
                                <span className="block text-[11px] font-semibold text-slate-500">{option.note}</span>
                              </span>
                              <span className="text-right text-xs font-bold text-slate-600">Shop báo sau</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-start gap-3 rounded-[10px] border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-700">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                      <strong>Ghi chú vận chuyển:</strong> Phí ship chưa cộng vào tổng đơn hàng. Shop sẽ báo phí trước khi giao,
                      khách thanh toán phí vận chuyển trực tiếp cho tài xế.
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-200 pt-5">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.1em] text-slate-500">3. Ghi chú đơn hàng</h3>
                  <textarea
                    rows={4}
                    placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến..."
                    value={formData.note}
                    onChange={field("note")}
                    className="w-full resize-none rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2f91d0] focus:ring-4 focus:ring-[#dceeff]"
                  />
                </div>
              </section>

              <section className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm">
                <label className="flex cursor-pointer items-center gap-4 rounded-[10px] border border-slate-100 bg-white p-3 transition hover:border-[#2f91d0]/60">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-[#f4faff] text-[#2f91d0]">
                    <Gift className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-slate-900">Gói quà (cho từng tranh)</span>
                    <span className="mt-0.5 block text-xs font-semibold text-slate-500">Hộp quà, túi, thiệp và rơm trang trí.</span>
                  </span>
                  <span className="text-right text-sm font-bold text-[#2f91d0]">+{formatPrice(30000 * itemCount)}</span>
                  <input type="checkbox" checked={giftPackage} onChange={(event) => setGiftPackage(event.target.checked)} className="h-5 w-5 accent-[#2f91d0]" />
                </label>
              </section>

              <section className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-4 rounded-[10px] border border-slate-100 bg-white p-3 opacity-75">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-slate-100 text-slate-500">
                    <Zap className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-slate-800">Thêm Đèn (cho từng tranh)</span>
                    <span className="mt-0.5 block text-xs font-semibold text-slate-500">Đèn spotlight trang trí, shop sẽ bổ sung sau.</span>
                  </span>
                  <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold uppercase text-red-600">Tạm hết</span>
                </div>
              </section>

              <section className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Camera className="h-4 w-4 text-[#2f91d0]" />
                  <h2 className="font-black text-slate-900">In thêm ảnh Polaroid</h2>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {POLAROID_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPolaroid(option.id)}
                      className={`h-11 rounded-[10px] border px-3 text-xs font-bold uppercase transition ${
                        polaroid === option.id ? "border-[#2f91d0] bg-[#2f91d0] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-[#2f91d0]/60"
                      }`}
                    >
                      {option.label}
                      {option.price ? ` (+${formatPrice(option.price)})` : ""}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <aside className="lg:sticky lg:top-20 lg:self-start">
              <section className="overflow-hidden rounded-[10px] border border-slate-200 bg-[#f6f6f7] shadow-sm">
                <div className="px-5 py-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-950">Đơn hàng của bạn</h2>
                    <span className="rounded-full bg-[#f4faff] px-3 py-1 text-[11px] font-bold uppercase text-[#2f91d0]">
                      {itemCount} sản phẩm
                    </span>
                  </div>

                  <div className="space-y-3">
                    {items.map((item, index) => {
                      const previewUrl = resolveApiAssetUrl(item.previewUrl);
                      const templateName = getDesignTemplateName(item.designData) ?? readDesignText(item, "templateName");
                      const characterCount = readCharacterCount(item);
                      const accessoryNames = item.accessories?.map((accessory) => accessory.name).filter(Boolean) ?? [];
                      const parts = getCartItemParts(item);

                      return (
                        <div key={item.id} className="flex gap-4 rounded-[16px] bg-white p-4 shadow-sm">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[10px] border border-slate-100 bg-slate-50">
                            {previewUrl ? (
                              <Image src={previewUrl} alt={item.productName} fill className="object-cover" sizes="64px" />
                            ) : (
                              <PackageCheck className="m-5 h-6 w-6 text-slate-300" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-950">#{index + 1} {item.productName}</p>
                                <p className="hidden">
                                  {[item.frameSizeLabel, item.frameColorName].filter(Boolean).join(" · ")}
                                </p>
                              </div>
                              <span className="shrink-0 text-base font-bold text-slate-950">{formatPrice(item.totalPrice)}</span>
                            </div>
                            <div className="mt-3 space-y-2">
                              {parts.map((part, partIndex) => {
                                const partImage = resolveApiAssetUrl(part.imageUrl);
                                return (
                                  <div key={`${part.type}-${part.id ?? partIndex}`} className="flex items-center gap-2 rounded-[10px] border border-slate-100 bg-slate-50 px-2 py-2">
                                    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-slate-200 bg-white">
                                      {partImage ? (
                                        <Image src={partImage} alt={part.name} fill className="object-cover" sizes="36px" />
                                      ) : (
                                        <PackageCheck className="h-4 w-4 text-slate-300" />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-[11px] font-bold text-slate-800">{part.name}</p>
                                      <p className="text-[10px] font-semibold text-slate-500">x{part.quantity}</p>
                                    </div>
                                    <span className="shrink-0 text-[11px] font-bold text-slate-800">{formatPrice(part.totalPrice)}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="hidden mt-2 flex flex-wrap gap-2 text-[11px] font-bold text-slate-500">
                              <span className="rounded-full bg-[#f4faff] px-2 py-1 text-[#2f91d0]">x{item.quantity}</span>
                              {characterCount > 0 ? <span>{characterCount} NV</span> : null}
                              {templateName ? <span className="truncate">Nền: {templateName}</span> : null}
                              {accessoryNames.length ? <span className="truncate">Phụ kiện: {accessoryNames.join(", ")}</span> : null}
                            </div>
                            <label className="mt-3 block">
                              <span className="mb-1 block text-[11px] font-bold text-slate-500">Ghi chú nội dung</span>
                              <textarea
                                rows={2}
                                value={item.note ?? ""}
                                onChange={(event) => updateItemNote(item.id, event.target.value)}
                                placeholder="Tên, lời chúc hoặc nội dung cần shop điền..."
                                className="w-full resize-none rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2f91d0] focus:ring-2 focus:ring-[#dceeff]"
                              />
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
                    <SummaryRow label="Tạm tính" value={formatPrice(totalAmount)} />
                    {giftPackage ? <SummaryRow label="Gói quà" value={`+${formatPrice(giftFee)}`} /> : null}
                    {polaroid !== "none" ? <SummaryRow label="Ảnh Polaroid" value={`+${formatPrice(polaroidFee)}`} /> : null}
                    {discountAmount > 0 ? <SummaryRow label={`Voucher ${appliedVoucher?.code ?? ""}`} value={`-${formatPrice(discountAmount)}`} /> : null}
                    <SummaryRow label="Phí vận chuyển" value="Shop báo sau" />
                  </div>

                  <div className="mt-5 space-y-3 border-t border-slate-200 pt-4">
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold text-slate-600">Mã giảm giá</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="NHẬP MÃ"
                          value={discountCode}
                          onChange={(event) => {
                            setDiscountCode(event.target.value);
                            setAppliedVoucher(null);
                            setVoucherError(null);
                          }}
                          className={`${inputClass} flex-1`}
                        />
                        <button
                          type="button"
                          onClick={handleApplyVoucher}
                          disabled={!discountCode.trim() || voucherLoading}
                          className="rounded-[10px] bg-[#2f91d0] px-4 text-sm font-bold text-white transition hover:bg-[#257fb7] disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {voucherLoading ? "Đang áp..." : "Áp dụng"}
                        </button>
                      </div>
                      {appliedVoucher && discountAmount > 0 ? (
                        <p className="mt-2 text-xs font-semibold text-emerald-600">
                          Đã áp dụng {appliedVoucher.code}, giảm {formatPrice(discountAmount)}.
                        </p>
                      ) : null}
                      {appliedVoucher && discountAmount === 0 ? (
                        <p className="mt-2 text-xs font-semibold text-amber-600">
                          Đơn hàng chưa đủ điều kiện tối thiểu cho mã {appliedVoucher.code}.
                        </p>
                      ) : null}
                      {voucherError ? (
                        <p className="mt-2 text-xs font-semibold text-red-600">{voucherError}</p>
                      ) : null}
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold text-slate-600">Mã giới thiệu (CTV)</span>
                      <input
                        type="text"
                        placeholder="Nhập mã CTV (nếu có)"
                        value={referralCode}
                        onChange={(event) => setReferralCode(event.target.value)}
                        className={inputClass}
                      />
                    </label>
                  </div>

                  <div className="mt-5 space-y-4 border-t border-slate-200 pt-5">
                    <div className="flex items-end justify-between">
                      <span className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">Tổng cộng</span>
                      <span className="text-2xl font-bold text-slate-950">{formatPrice(finalTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                      <span className="text-sm font-bold uppercase tracking-[0.12em] text-[#2f91d0]">Cần thanh toán</span>
                      <span className="text-3xl font-bold text-[#2f91d0]">{formatPrice(amountToPayNow)}</span>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <div className="mb-4 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-[#2f91d0]" />
                      <h2 className="text-lg font-bold text-slate-950">Phương thức thanh toán</h2>
                    </div>
                    <div className="space-y-3">
                      {paymentOptions.map((option) => {
                        const active = paymentMethod === option.id;
                        return (
                          <label
                            key={option.id}
                            className={`flex cursor-pointer items-center gap-3 rounded-[10px] border px-4 py-3 transition ${
                              active ? "border-[#2f91d0] bg-[#f4faff]" : "border-slate-200 bg-white hover:border-[#2f91d0]/60"
                            }`}
                          >
                            <input
                              type="radio"
                              name="payment"
                              checked={active}
                              onChange={() => setPaymentMethod(option.id)}
                              className="h-4 w-4 accent-[#2f91d0]"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-bold text-slate-800">{option.label}</span>
                              <span className="block text-[11px] font-semibold text-slate-500">{option.detail}</span>
                            </span>
                            <span className="text-sm font-bold text-[#2f91d0]">{option.amountLabel}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-5 flex items-start gap-3 rounded-[10px] border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold leading-5 text-red-600">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>Đơn hàng chưa thanh toán sẽ tự động huỷ sau 48 giờ để tránh tình trạng giữ hàng.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || paymentOptions.length === 0}
                    className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-[10px] bg-[#2f91d0] text-base font-bold uppercase tracking-wide text-white shadow-[0_12px_26px_rgba(47,145,208,0.22)] transition hover:bg-[#257fb7] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                  >
                    {loading ? "Đang xử lý..." : "Đặt hàng ngay"}
                  </button>
                </div>
              </section>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
      <span>{label}</span>
      <span className="font-bold text-slate-950">{value}</span>
    </div>
  );
}
