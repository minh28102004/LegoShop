"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, RefreshCcw, Search } from "lucide-react";
import { Suspense, useState } from "react";
import { publicApiClient } from "@/lib/api/public-client";
import { useI18n } from "@/lib/i18n/useI18n";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("orderCode");
  const [loading, setLoading] = useState(false);
  const { dictionary } = useI18n();
  const copy = dictionary.payment;

  const handleRetryPayment = async () => {
    if (!orderCode) return;
    setLoading(true);
    try {
      const data = await publicApiClient.orders.createPaymentLink(orderCode);
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
      } else {
        alert(copy.cancel.retryUnavailable);
      }
    } catch (err) {
      console.error(err);
      alert(copy.cancel.retryError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center min-h-[60vh]">
      <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <XCircle className="w-12 h-12 text-red-500" />
      </div>
      
      <h1 className="text-3xl font-black mb-4">{copy.cancel.title}</h1>
      <p className="text-zinc-600 mb-8 max-w-md">
        {copy.cancel.description.replace("{orderCode}", orderCode ?? "")}
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={handleRetryPayment}
          disabled={loading || !orderCode}
          className="px-8 py-3 bg-red-400 hover:bg-red-500 text-white font-medium rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> 
          {loading ? copy.cancel.retrying : copy.cancel.retry}
        </button>
        
        <Link 
          href={`/order-tracking${orderCode ? `?code=${orderCode}` : ""}`}
          className="px-8 py-3 border border-zinc-200 hover:border-zinc-300 text-zinc-700 font-medium rounded-full transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" /> {copy.cancel.trackOrder}
        </Link>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  const { dictionary } = useI18n();

  return (
    <div className="container mx-auto flex-1 flex flex-col bg-zinc-50">
      <Suspense fallback={<div className="p-20 text-center">{dictionary.payment.loading}</div>}>
        <PaymentCancelContent />
      </Suspense>
    </div>
  );
}
