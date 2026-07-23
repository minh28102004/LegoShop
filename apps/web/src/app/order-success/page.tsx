"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Search, ArrowRight } from "lucide-react";
import { Suspense } from "react";
import { ROUTES } from "@/config/routes";
import { useI18n } from "@/lib/i18n/useI18n";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("orderCode");
  const { dictionary } = useI18n();
  const copy = dictionary.orderSuccess;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-16 px-4">
      {/* Success animation */}
      <div className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-emerald-100">
        <CheckCircle className="w-14 h-14 text-emerald-600" />
      </div>

      <h1 className="text-4xl font-black text-text-primary mb-3 text-center">{copy.title}</h1>
      <p className="text-text-secondary text-center max-w-md mb-8 leading-relaxed">
        {copy.description}
      </p>

      {orderCode && (
        <div className="bg-surface border border-border rounded-2xl p-6 mb-8 w-full max-w-sm text-center shadow-sm">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{copy.orderCode}</p>
          <p className="text-2xl font-black tracking-[0.15em] text-text-primary">{orderCode}</p>
          <p className="text-xs text-text-muted mt-2">{copy.saveCode}</p>
        </div>
      )}

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg mb-10">
        {copy.steps.map((step) => (
          <div key={step.title} className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">{step.icon}</div>
            <p className="text-sm font-bold text-text-primary mb-1">{step.title}</p>
            <p className="text-xs text-text-muted">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Link
          href={`${ROUTES.orderTracking}${orderCode ? `?code=${orderCode}` : ""}`}
          className="flex-1 px-6 py-3.5 bg-[hsl(var(--color-cta))] hover:bg-[hsl(var(--color-cta-hover))] text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Search className="w-4 h-4" /> {copy.trackOrder}
        </Link>
        <Link
          href={ROUTES.collection}
          className="flex-1 px-6 py-3.5 border-2 border-border hover:border-primary hover:text-primary text-text-secondary font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
          {copy.continueShopping} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
