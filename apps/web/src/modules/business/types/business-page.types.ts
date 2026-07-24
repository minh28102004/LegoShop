export type BusinessMetricCopy = {
  title: string;
  description: string;
};

export type BusinessUseCaseCopy = {
  title: string;
  description: string;
  example: string;
};

export type BusinessBenefitCopy = {
  title: string;
  description: string;
};

export type BusinessProcessCopy = {
  title: string;
  description: string;
};

export type BusinessShowcaseCopy = {
  title: string;
  occasion: string;
  description: string;
};

export type BusinessSelectOptionCopy = {
  value: string;
  label: string;
};

export type BusinessEstimateSummary = BusinessQuoteResponseContract;

export type BusinessCompactCopy = {
  hero: {
    eyebrow: string;
    title: string;
    accent: string;
    description: string;
    cta: string;
    imageAlt: string;
  };
  configurator: {
    step: string;
    title: string;
    description: string;
    frameLabel: string;
    frameLoading: string;
    frameError: string;
    characterLabel: string;
    characterUnit: string;
    charmLabel: string;
    charmBasic: string;
    charmUnit: string;
    quantityLabel: string;
    minimumOrder: string;
    customQuantity: string;
    customQuantityPlaceholder: string;
    advancedLabel: string;
    options: Array<{
      key: "brandDesign" | "logoPlacement" | "premiumPackaging" | "documents";
      label: string;
      description: string;
      included?: boolean;
    }>;
    included: string;
  };
  estimator: {
    title: string;
    liveLabel: string;
    retailUnitLabel: string;
    estimatedUnitLabel: string;
    totalLabel: string;
    savingsLabel: string;
    discountLabel: string;
    quantitySummary: string;
    benefits: string[];
    cta: string;
    note: string;
    loading: string;
    loadingSteps: string[];
    error: string;
    retry: string;
  };
  occasions: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  benefits: {
    items: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  modal: {
    eyebrow: string;
    title: string;
    description: string;
    summaryTitle: string;
    summaryFrame: string;
    summaryCharacters: string;
    summaryCharms: string;
    summaryQuantity: string;
    summaryTotal: string;
    close: string;
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    requiredDate: string;
    message: string;
    consent: string;
    consentDescription: string;
    placeholders: {
      companyName: string;
      contactName: string;
      email: string;
      phone: string;
      message: string;
    };
    submit: string;
    submitting: string;
    successTitle: string;
    successDescription: string;
    requestCode: string;
    done: string;
    errors: {
      required: string;
      email: string;
      phone: string;
      consent: string;
      submit: string;
    };
  };
};

export type BusinessBudgetEstimatorCopy = {
  eyebrow: string;
  title: string;
  description: string;
  frameLabel: string;
  characterLabel: string;
  charmLabel: string;
  quantityLabel: string;
  advancedLabel: string;
  brandDesignLabel: string;
  brandDesignDescription: string;
  packagingLabel: string;
  packagingDescription: string;
  includedLabel: string;
  summaryTitle: string;
  retailUnitLabel: string;
  estimatedUnitLabel: string;
  totalLabel: string;
  savingsLabel: string;
  discountLabel: string;
  minimumOrder: string;
  useEstimate: string;
  note: string;
  loading: string;
  error: string;
};

export type BusinessFormCopy = {
  eyebrow: string;
  title: string;
  description: string;
  responseTime: string;
  contactTitle: string;
  emailLabel: string;
  emailValue: string;
  phoneLabel: string;
  phoneValue: string;
  hoursLabel: string;
  hoursValue: string;
  commitments: string[];
  cardEyebrow: string;
  cardTitle: string;
  cardDescription: string;
  estimateTitle: string;
  estimateDescription: string;
  estimateFrame: string;
  estimateUnit: string;
  estimateTotal: string;
  additionalInfo: string;
  fields: {
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    inquiryType: string;
    quantity: string;
    budget: string;
    requiredDate: string;
    preferredContact: string;
    message: string;
    consent: string;
    consentDescription: string;
  };
  placeholders: {
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    select: string;
    message: string;
  };
  inquiryOptions: BusinessSelectOptionCopy[];
  quantityOptions: BusinessSelectOptionCopy[];
  budgetOptions: BusinessSelectOptionCopy[];
  contactOptions: BusinessSelectOptionCopy[];
  submit: string;
  submitting: string;
  successTitle: string;
  successDescription: string;
  requestCodeLabel: string;
  sendAnother: string;
  errors: {
    required: string;
    email: string;
    phone: string;
    consent: string;
    submit: string;
  };
};

export type BusinessPageCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    commitments: string[];
    imageAlts: string[];
    floatingLabel: string;
  };
  metrics: BusinessMetricCopy[];
  useCases: {
    eyebrow: string;
    title: string;
    description: string;
    items: BusinessUseCaseCopy[];
  };
  benefits: {
    eyebrow: string;
    title: string;
    description: string;
    imageAlt: string;
    items: BusinessBenefitCopy[];
  };
  process: {
    eyebrow: string;
    title: string;
    description: string;
    items: BusinessProcessCopy[];
  };
  budgetEstimator: BusinessBudgetEstimatorCopy;
  showcase: {
    eyebrow: string;
    title: string;
    description: string;
    viewCollection: string;
    consult: string;
    viewDetail: string;
    priceFrom: string;
    fallbackItems: BusinessShowcaseCopy[];
  };
  form: BusinessFormCopy;
  finalCta: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };
};

export type BusinessFormValues = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  inquiryType: string;
  quantity: string;
  budget: string;
  requiredDate: string;
  preferredContact: string;
  message: string;
  consent: boolean;
};

export type BusinessFormErrors = Partial<
  Record<keyof BusinessFormValues, string>
>;
import type { BusinessQuoteResponseContract } from "@lego-shop/shared";
