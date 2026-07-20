"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Check, CheckCircle2, LoaderCircle, Send } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { DECORATIVE_ICON_PATHS } from "@/config/icons";
import { publicApiClient } from "@/lib/api/public-client";
import type {
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
};

function findOptionLabel(options: BusinessFormCopy["inquiryOptions"], value: string) {
  return options.find((option) => option.value === value)?.label || value || "-";
}

export function BusinessInquiryForm({ copy }: BusinessInquiryFormProps) {
  const [values, setValues] = useState<BusinessFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<BusinessFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [requestCode, setRequestCode] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const message = new URLSearchParams(window.location.search).get("message")?.trim();
    if (!message) return;

    setValues((current) => ({ ...current, message }));
  }, []);

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
      "quantity",
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

    const structuredMessage = [
      "[FIGURE LAB BUSINESS BRIEF]",
      `Inquiry type: ${findOptionLabel(copy.inquiryOptions, values.inquiryType)}`,
      `Estimated quantity: ${findOptionLabel(copy.quantityOptions, values.quantity)}`,
      `Budget: ${findOptionLabel(copy.budgetOptions, values.budget)}`,
      `Required date: ${values.requiredDate || "-"}`,
      `Preferred contact: ${findOptionLabel(copy.contactOptions, values.preferredContact)}`,
      "",
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
    <section id="business-consultation" className="bg-[#eef5ff] py-14 sm:py-16 lg:py-20">
      <Container size="wide">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:gap-12">
          <ScrollReveal variant="slideLeft" className="lg:sticky lg:top-28">
            <p className="text-xs font-bold tracking-[0.2em] text-[#1989c9] sm:text-sm">{copy.eyebrow}</p>
            <h2 className="mt-3 max-w-xl text-balance text-3xl font-bold tracking-[-0.035em] text-[#071d3a] sm:text-4xl lg:text-5xl">
              {copy.title}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">{copy.description}</p>

            <div className="mt-7 inline-flex items-center gap-3 rounded-2xl border border-[#cfe3f2] bg-white px-4 py-3 shadow-sm">
              <Image src={DECORATIVE_ICON_PATHS.telephoneReceiver} alt="" width={40} height={40} className="size-10 object-contain" />
              <p className="text-sm font-bold text-[#071d3a]">{copy.responseTime}</p>
            </div>

            <div className="mt-8 rounded-[24px] border border-white/80 bg-white/75 p-5 backdrop-blur">
              <h3 className="font-bold text-[#071d3a]">{copy.contactTitle}</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4 border-b border-[#e5edf5] pb-3">
                  <dt className="text-slate-500">{copy.emailLabel}</dt>
                  <dd className="font-semibold text-[#147fbd]">{copy.emailValue}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-[#e5edf5] pb-3">
                  <dt className="text-slate-500">{copy.phoneLabel}</dt>
                  <dd className="font-semibold text-[#071d3a]">{copy.phoneValue}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-slate-500">{copy.hoursLabel}</dt>
                  <dd className="max-w-[210px] text-right font-semibold text-[#071d3a]">{copy.hoursValue}</dd>
                </div>
              </dl>
            </div>

            <ul className="mt-6 space-y-3">
              {copy.commitments.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                  <span className="flex size-6 items-center justify-center rounded-full bg-white text-[#1989c9]">
                    <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal variant="slideRight" delay={0.06}>
            <div className="rounded-[28px] border border-[#dbe8f4] bg-white p-5 shadow-[0_24px_60px_-42px_rgba(7,29,58,0.5)] sm:p-7 lg:p-8">
              {requestCode ? (
                <div className="flex min-h-[540px] flex-col items-center justify-center text-center">
                  <div className="flex size-20 items-center justify-center rounded-full bg-[#e8f7ee] text-emerald-600">
                    <CheckCircle2 className="size-10" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-[#071d3a] sm:text-3xl">{copy.successTitle}</h3>
                  <p className="mt-3 max-w-md leading-7 text-slate-600">{copy.successDescription}</p>
                  <div className="mt-7 rounded-2xl bg-[#eef5ff] px-6 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{copy.requestCodeLabel}</p>
                    <p className="mt-1 text-2xl font-bold tracking-[0.08em] text-[#147fbd]">{requestCode}</p>
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
                  <p className="text-xs font-bold tracking-[0.18em] text-[#1989c9]">{copy.cardEyebrow}</p>
                  <h3 className="mt-2 text-2xl font-bold text-[#071d3a] sm:text-3xl">{copy.cardTitle}</h3>
                  <p className="mt-2 text-sm text-slate-500">{copy.cardDescription}</p>

                  <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Input required label={copy.fields.companyName} placeholder={copy.placeholders.companyName} value={values.companyName} {...(errors.companyName ? { error: errors.companyName } : {})} onChange={(event) => updateValue("companyName", event.target.value)} />
                      <Input required label={copy.fields.contactName} placeholder={copy.placeholders.contactName} value={values.contactName} {...(errors.contactName ? { error: errors.contactName } : {})} onChange={(event) => updateValue("contactName", event.target.value)} />
                      <Input required type="email" label={copy.fields.email} placeholder={copy.placeholders.email} value={values.email} {...(errors.email ? { error: errors.email } : {})} onChange={(event) => updateValue("email", event.target.value)} />
                      <Input required type="tel" label={copy.fields.phone} placeholder={copy.placeholders.phone} value={values.phone} {...(errors.phone ? { error: errors.phone } : {})} onChange={(event) => updateValue("phone", event.target.value)} />
                      <Select required label={copy.fields.inquiryType} placeholder={copy.placeholders.select} options={copy.inquiryOptions} value={values.inquiryType} {...(errors.inquiryType ? { error: errors.inquiryType } : {})} onValueChange={(value) => updateValue("inquiryType", value)} />
                      <Select required label={copy.fields.quantity} placeholder={copy.placeholders.select} options={copy.quantityOptions} value={values.quantity} {...(errors.quantity ? { error: errors.quantity } : {})} onValueChange={(value) => updateValue("quantity", value)} />
                      <Select label={copy.fields.budget} placeholder={copy.placeholders.select} options={copy.budgetOptions} value={values.budget} onValueChange={(value) => updateValue("budget", value)} />
                      <Input type="date" label={copy.fields.requiredDate} value={values.requiredDate} min={new Date().toISOString().slice(0, 10)} onChange={(event) => updateValue("requiredDate", event.target.value)} />
                    </div>

                    <Select label={copy.fields.preferredContact} placeholder={copy.placeholders.select} options={copy.contactOptions} value={values.preferredContact} onValueChange={(value) => updateValue("preferredContact", value)} />
                    <Textarea required label={copy.fields.message} placeholder={copy.placeholders.message} value={values.message} {...(errors.message ? { error: errors.message } : {})} maxLength={1500} showCount onChange={(event) => updateValue("message", event.target.value)} />
                    <Checkbox required label={copy.fields.consent} description={copy.fields.consentDescription} checked={values.consent} {...(errors.consent ? { error: errors.consent } : {})} onChange={(event) => updateValue("consent", event.target.checked)} />

                    {submitError ? (
                      <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {submitError}
                      </p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#147fbd] px-6 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-px hover:bg-[#006da8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#52aee0] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
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
