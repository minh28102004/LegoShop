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

export type BusinessFormErrors = Partial<Record<keyof BusinessFormValues, string>>;
