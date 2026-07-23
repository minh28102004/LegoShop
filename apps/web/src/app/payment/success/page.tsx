"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Search, ArrowRight, Clock } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { publicApiClient } from "@/lib/api/public-client";
import type { TrackOrderResponseContract } from "@lego-shop/shared";
import { LOCALE_FORMATS } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/useI18n";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("orderCode");
  const [loading, setLoading] = useState(() => Boolean(orderCode));
  const [order, setOrder] = useState<TrackOrderResponseContract | null>(null);
  const { dictionary, locale } = useI18n();
  const copy = dictionary.payment.success;
  const statusLabels: Record<string, string> = copy.status;

  useEffect(() => {
    if (!orderCode) return;

    publicApiClient.orders.trackOrderByCode(orderCode)
      .then(data => setOrder(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [orderCode]);

  const paymentStatus = order?.paymentStatus as string | undefined;
  const verifiedPaid = paymentStatus === "paid" || paymentStatus === "deposit_paid";
  const displayOrderCode = order?.orderCode ?? orderCode;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center min-h-[60vh]">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${verifiedPaid ? "bg-emerald-100" : "bg-amber-100"}`}>
        {verifiedPaid ? (
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        ) : (
          <Clock className="w-12 h-12 text-amber-600" />
        )}
      </div>
      
      <h1 className="text-4xl font-black mb-4">{verifiedPaid ? copy.paidTitle : copy.pendingTitle}</h1>
      <p className="text-zinc-600 mb-8 max-w-md">
        {copy.description}
      </p>

      {loading ? (
        <div className="text-zinc-500 mb-8">{copy.loadingOrder}</div>
      ) : order ? (
        <div className="bg-white border border-emerald-200 rounded-2xl p-6 mb-8 w-full max-w-md shadow-sm">
          <p className="text-sm text-zinc-500 mb-2">{copy.orderCode}</p>
          <p className="text-2xl font-bold tracking-widest text-zinc-900 mb-4">{displayOrderCode}</p>
          
          <div className="border-t border-zinc-100 pt-4 space-y-2 text-sm text-left">
            <div className="flex justify-between">
              <span className="text-zinc-500">{copy.paymentStatus}</span>
              <span className={`font-bold ${verifiedPaid ? "text-emerald-600" : "text-amber-600"}`}>
                {statusLabels[paymentStatus ?? ""] ?? paymentStatus ?? copy.checking}
              </span>
            </div>
            {order.depositRequired && (
              <div className="flex justify-between">
                <span className="text-zinc-500">{copy.deposit} ({order.depositPercent}%)</span>
                <span className="font-bold text-zinc-900">{new Intl.NumberFormat(LOCALE_FORMATS[locale], { style: 'currency', currency: 'VND' }).format(order.depositAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-zinc-100 pt-2 mt-2">
              <span className="text-zinc-500">{copy.orderTotal}</span>
              <span className="font-bold text-red-500">{new Intl.NumberFormat(LOCALE_FORMATS[locale], { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 mb-8 w-full max-w-md">
          <p className="text-sm text-zinc-500 mb-2">{copy.yourOrderCode}</p>
          <p className="text-2xl font-bold tracking-widest text-zinc-900">{displayOrderCode}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href={`/order-tracking${displayOrderCode ? `?code=${displayOrderCode}` : ""}`}
          className="px-8 py-3 bg-red-400 hover:bg-red-500 text-white font-medium rounded-full transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" /> {copy.trackProgress}
        </Link>
        
        <Link 
          href="/collection"
          className="px-8 py-3 border border-zinc-200 hover:border-zinc-300 text-zinc-700 font-medium rounded-full transition-colors flex items-center justify-center gap-2"
        >
          {copy.continueShopping} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  const { dictionary } = useI18n();

  return (
    <div className="container mx-auto flex-1 flex flex-col bg-zinc-50">
      <Suspense fallback={<div className="p-20 text-center">{dictionary.payment.loading}</div>}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
