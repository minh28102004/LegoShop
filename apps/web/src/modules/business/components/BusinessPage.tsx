"use client";

import { useCallback, useState } from "react";

import { useI18n } from "@/lib/i18n/useI18n";
import { BusinessBenefitsStrip } from "@/modules/business/components/BusinessBenefitsStrip";
import { BusinessBudgetEstimator } from "@/modules/business/components/BusinessBudgetEstimator";
import { BusinessHero } from "@/modules/business/components/BusinessHero";
import { BusinessInquiryModal } from "@/modules/business/components/BusinessInquiryModal";
import { BusinessOccasions } from "@/modules/business/components/BusinessOccasions";
import type { BusinessEstimateSummary } from "@/modules/business/types/business-page.types";

export function BusinessPage() {
  const { dictionary } = useI18n();
  const copy = dictionary.business;
  const [estimate, setEstimate] = useState<BusinessEstimateSummary | null>(
    null,
  );
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const openInquiry = useCallback(() => setInquiryOpen(true), []);
  const closeInquiry = useCallback(() => setInquiryOpen(false), []);

  return (
    <main className="overflow-x-clip bg-white">
      <BusinessHero copy={copy.hero} />
      <BusinessBudgetEstimator
        copy={{ configurator: copy.configurator, estimator: copy.estimator }}
        onEstimateChange={setEstimate}
        onOpenInquiry={openInquiry}
      />
      <BusinessOccasions copy={copy.occasions} />
      <BusinessBenefitsStrip copy={copy.benefits} />
      <BusinessInquiryModal
        open={inquiryOpen}
        copy={copy.modal}
        estimate={estimate}
        onClose={closeInquiry}
      />
    </main>
  );
}
