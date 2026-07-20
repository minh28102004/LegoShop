"use client";

import { useI18n } from "@/lib/i18n/useI18n";
import { BusinessBenefits } from "@/modules/business/components/BusinessBenefits";
import { BusinessFinalCta } from "@/modules/business/components/BusinessFinalCta";
import { BusinessHero } from "@/modules/business/components/BusinessHero";
import { BusinessInquiryForm } from "@/modules/business/components/BusinessInquiryForm";
import { BusinessMetrics } from "@/modules/business/components/BusinessMetrics";
import { BusinessProcess } from "@/modules/business/components/BusinessProcess";
import { BusinessShowcase } from "@/modules/business/components/BusinessShowcase";
import { BusinessUseCases } from "@/modules/business/components/BusinessUseCases";
import { BUSINESS_PAGE_COPY } from "@/modules/business/data/business-page.data";

export function BusinessPage() {
  const { locale } = useI18n();
  const copy = BUSINESS_PAGE_COPY[locale];

  return (
    <main className="overflow-x-clip bg-[#f7f9ff]">
      <BusinessHero copy={copy.hero} />
      <BusinessMetrics items={copy.metrics} />
      <BusinessUseCases copy={copy.useCases} />
      <BusinessBenefits copy={copy.benefits} />
      <BusinessProcess copy={copy.process} />
      <BusinessShowcase copy={copy.showcase} />
      <BusinessInquiryForm copy={copy.form} />
      <BusinessFinalCta copy={copy.finalCta} />
    </main>
  );
}
