"use client";

import { formatCurrency } from "@lego-shop/shared";
import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  LoaderCircle,
  Mail,
  Phone,
  Send,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Container } from "@/components/layout/Container";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { publicApiClient } from "@/lib/api/public-client";
import type {
  BusinessEstimateSummary,
  BusinessFormCopy,
  BusinessFormErrors,
  BusinessFormValues,
} from "@/modules/business/types/business-page.types";

const EMPTY_FORM: BusinessFormValues = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  inquiryType: "",
  quantity: "",
  budget: "",
  requiredDate: "",
  preferredContact: "",
  message: "",
  consent: false,
};

type BusinessInquiryFormProps = {
  copy: BusinessFormCopy;
  estimate: BusinessEstimateSummary | null;
};

function findOptionLabel(options: BusinessFormCopy["inquiryOptions"], value: string) {
  return options.find((option) => option.value === value)?.label || value || "-";
}

function yesNo(value: boolean) {
  return value ? "Yes" : "No";
}

export function BusinessInquiryForm({ copy, estimate }: BusinessInquiryFormProps) {
  const [values, setValues] = useState<BusinessFormValues>(() => ({
    ...EMPTY_FORM,
    message:
      typeof window === "undefined"
        ? ""
        : new URLSearchParams(window.location.search).get("message")?.trim() || "",
  }));
  const [errors, setErrors] = useState<BusinessFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [requestCode, setRequestCode] = useState("");
  const [submitError, setSubmitError] = useState("");

  function updateValue<Key extends keyof BusinessFormValues>(
    key: Key,
    value: BusinessFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError("");
  }

  function validate() {
    const nextErrors: BusinessFormErrors = {};
    const requiredFields: Array<keyof BusinessFormValues> = [
      "companyName",
      "contactName",
      "email",
      "phone",
      "inquiryType",
      "message",
    ];

    for (const field of requiredFields) {
      if (typeof values[field] === "string" && !values[field].trim()) {
        nextErrors[field] = copy.errors.required;
      }
    }

    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      nextErrors.email = copy.errors.email;
    }

    const phoneDigits = values.phone.replace(/\D/g, "");
    if (values.phone && (phoneDigits.length < 9 || phoneDigits.length > 12)) {
      nextErrors.phone = copy.errors.phone;
    }

    if (!values.consent) nextErrors.consent = copy.errors.consent;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSubmitError("");

    const estimateLines = estimate
      ? [
          "",
          "[BUDGET ESTIMATE]",
          `Frame: ${estimate.frameLabel}`,
          `Characters per set: ${estimate.characterCount}`,
          `Accessory level: ${estimate.charmCount}`,
          `Quantity: ${estimate.quantity}`,
          `On-brand background design: ${yesNo(estimate.brandDesign)}`,
          `Premium packaging: ${yesNo(estimate.premiumPackaging)}`,
          `Volume discount: ${estimate.discountPercent}%`,
          `Estimated unit price: ${estimate.estimatedUnitPrice} VND`,
          `Estimated total: ${estimate.totalPrice} VND`,
        ]
      : [];

    const structuredMessage = [
      "[FIGURE LAB BUSINESS BRIEF]",
      `Inquiry type: ${findOptionLabel(copy.inquiryOptions, values.inquiryType)}`,
      `Required date: ${values.requiredDate || "-"}`,
      `Preferred contact: ${findOptionLabel(copy.contactOptions, values.preferredContact)}`,
      ...estimateLines,
      "",
      "[CLIENT NOTES]",
      values.message.trim(),
    ].join("\n");

    try {
      const response = await publicApiClient.inquiries.createBusinessInquiry({
        companyName: values.companyName.trim(),
        contactName: values.contactName.trim(),
        contactPerson: values.contactName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        message: structuredMessage,
      });
      const id = response.data?.id?.toString() || Date.now().toString(36);
      setRequestCode(`FL-${id.slice(0, 8).toUpperCase()}`);
      toast.success(copy.successTitle);
    } catch (error) {
      console.error("[business-inquiry] Submission failed", error);
      setSubmitError(copy.errors.submit);
      toast.error(copy.errors.submit);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="business-consultation" className="bg-[#eef5fb] py-14 sm:py-16 lg:py-20">
      <Container size="wide">
        <div className="grid gap-8 lg:grid-cols-[0.76fr_1.24fr] lg:items-start lg:gap-12">
          <ScrollReveal variant="slideLeft" className="lg:sticky lg:top-24">
            <p className="text-xs font-bold tracking-[0.2em] text-[#1989c9] sm:text-sm">
              {copy.eyebrow}
            </p>
            <h2 className="mt-3 max-w-xl text-balance text-3xl font-bold tracking-[-0.04em] text-[#071d3a] sm:text-4xl lg:text-[44px]">
              {copy.title}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              {copy.description}
            </p>

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#cfe3f2] bg-white/85 px-4 py-3 shadow-sm">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf6fd] text-[#147fbd]">
                <Clock3 className="size-5" aria-hidden="true" />
              </span>
              <p className="text-sm font-bold text-[#071d3a]">{copy.responseTime}</p>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/80 bg-white/75 p-5 backdrop-blur">
              <h3 className="text-sm font-bold text-[#071d3a]">{copy.contactTitle}</h3>
              <div className="mt-4 grid gap-3 text-sm">
                <a
                  href={`mailto:${copy.emailValue}`}
                  className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-[#147fbd]"
                >
                  <Mail className="size-4" aria-hidden="true" />
                  <span className="font-semibold">{copy.emailValue}</span>
                </a>
                <a
                  href={`tel:${copy.phoneValue.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-[#071d3a]"
                >
                  <Phone className="size-4 text-[#147fbd]" aria-hidden="true" />
                  <span className="font-semibold">{copy.phoneValue}</span>
                </a>
                <div className="flex items-start gap-3 px-3 py-2 text-slate-500">
                  <Clock3 className="mt-0.5 size-4 shrink-0 text-[#147fbd]" aria-hidden="true" />
                  <span>{copy.hoursValue}</span>
                </div>
              </div>
            </div>

            <ul className="mt-5 grid gap-2.5">
              {copy.commitments.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                  <span className="flex size-6 items-center justify-center rounded-full bg-white text-[#1989c9]">
                    <ShieldCheck className="size-3.5" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal variant="slideRight" delay={0.06}>
            <div className="rounded-[28px] border border-[#dbe8f4] bg-white p-5 shadow-[0_24px_60px_-42px_rgba(7,29,58,0.5)] sm:p-7 lg:p-8">
              {requestCode ? (
                <div className="flex min-h-[460px] flex-col items-center justify-center text-center">
                  <div className="flex size-20 items-center justify-center rounded-full bg-[#e8f7ee] text-emerald-600">
                    <CheckCircle2 className="size-10" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-[#071d3a] sm:text-3xl">
                    {copy.successTitle}
                  </h3>
                  <p className="mt-3 max-w-md leading-7 text-slate-600">{copy.successDescription}</p>
                  <div className="mt-7 rounded-2xl bg-[#eef5ff] px-6 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      {copy.requestCodeLabel}
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-[0.08em] text-[#147fbd]">
                      {requestCode}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRequestCode("");
                      setValues(EMPTY_FORM);
                      setErrors({});
                    }}
                    className="mt-7 rounded-full border border-[#b9d8ed] px-6 py-3 text-sm font-bold text-[#147fbd] transition-colors hover:bg-[#eef5ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#52aee0]"
                  >
                    {copy.sendAnother}
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold tracking-[0.18em] text-[#1989c9]">
                    {copy.cardEyebrow}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-[#071d3a] sm:text-3xl">
                    {copy.cardTitle}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">{copy.cardDescription}</p>

                  {estimate ? (
                    <div className="mt-6 rounded-[22px] border border-[#d6e7f3] bg-[#f5faff] p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="inline-flex items-center gap-2 text-sm font-bold text-[#071d3a]">
                            <SlidersHorizontal className="size-4 text-[#147fbd]" aria-hidden="true" />
                            {copy.estimateTitle}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">{copy.estimateDescription}</p>
                        </div>
                        <a
                          href="#business-estimator"
                          className="text-xs font-bold text-[#147fbd] hover:text-[#006da8]"
                        >
                          {copy.fields.budget}
                        </a>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <div className="rounded-xl bg-white px-3 py-2.5">
                          <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            {copy.fields.quantity}
                          </span>
                          <strong className="mt-1 block text-sm text-[#071d3a]">{estimate.quantity}</strong>
                        </div>
                        <div className="rounded-xl bg-white px-3 py-2.5">
                          <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            {copy.estimateFrame}
                          </span>
                          <strong className="mt-1 block text-sm text-[#071d3a]">{estimate.frameLabel}</strong>
                        </div>
                        <div className="rounded-xl bg-white px-3 py-2.5">
                          <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            {copy.estimateUnit}
                          </span>
                          <strong className="mt-1 block text-sm text-[#147fbd]">
                            {formatCurrency(estimate.estimatedUnitPrice)}
                          </strong>
                        </div>
                        <div className="rounded-xl bg-[#0b1a31] px-3 py-2.5 text-white">
                          <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            {copy.estimateTotal}
                          </span>
                          <strong className="mt-1 block text-sm">
                            {formatCurrency(estimate.totalPrice)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Input
                        required
                        label={copy.fields.companyName}
                        placeholder={copy.placeholders.companyName}
                        value={values.companyName}
                        {...(errors.companyName ? { error: errors.companyName } : {})}
                        onChange={(event) => updateValue("companyName", event.target.value)}
                      />
                      <Input
                        required
                        label={copy.fields.contactName}
                        placeholder={copy.placeholders.contactName}
                        value={values.contactName}
                        {...(errors.contactName ? { error: errors.contactName } : {})}
                        onChange={(event) => updateValue("contactName", event.target.value)}
                      />
                      <Input
                        required
                        type="email"
                        label={copy.fields.email}
                        placeholder={copy.placeholders.email}
                        value={values.email}
                        {...(errors.email ? { error: errors.email } : {})}
                        onChange={(event) => updateValue("email", event.target.value)}
                      />
                      <Input
                        required
                        type="tel"
                        label={copy.fields.phone}
                        placeholder={copy.placeholders.phone}
                        value={values.phone}
                        {...(errors.phone ? { error: errors.phone } : {})}
                        onChange={(event) => updateValue("phone", event.target.value)}
                      />
                    </div>

                    <Select
                      required
                      label={copy.fields.inquiryType}
                      placeholder={copy.placeholders.select}
                      options={copy.inquiryOptions}
                      value={values.inquiryType}
                      {...(errors.inquiryType ? { error: errors.inquiryType } : {})}
                      onValueChange={(value) => updateValue("inquiryType", value)}
                    />

                    <Textarea
                      required
                      label={copy.fields.message}
                      placeholder={copy.placeholders.message}
                      value={values.message}
                      {...(errors.message ? { error: errors.message } : {})}
                      maxLength={1500}
                      showCount
                      onChange={(event) => updateValue("message", event.target.value)}
                    />

                    <details className="group rounded-[18px] border border-[#dce8f1] bg-[#f9fcff] p-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-[#071d3a] marker:hidden">
                        {copy.additionalInfo}
                        <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                      </summary>
                      <div className="mt-4 grid gap-5 sm:grid-cols-2">
                        <Input
                          type="date"
                          label={copy.fields.requiredDate}
                          value={values.requiredDate}
                          onChange={(event) => updateValue("requiredDate", event.target.value)}
                        />
                        <Select
                          label={copy.fields.preferredContact}
                          placeholder={copy.placeholders.select}
                          options={copy.contactOptions}
                          value={values.preferredContact}
                          onValueChange={(value) => updateValue("preferredContact", value)}
                        />
                      </div>
                    </details>

                    <Checkbox
                      required
                      label={copy.fields.consent}
                      description={copy.fields.consentDescription}
                      checked={values.consent}
                      {...(errors.consent ? { error: errors.consent } : {})}
                      onChange={(event) => updateValue("consent", event.target.checked)}
                    />

                    {submitError ? (
                      <p
                        role="alert"
                        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                      >
                        {submitError}
                      </p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#147fbd] px-6 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-px hover:bg-[#006da8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#52aee0] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Send className="size-4" aria-hidden="true" />
                      )}
                      {loading ? copy.submitting : copy.submit}
                    </button>
                  </form>
                </>
              )}
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
