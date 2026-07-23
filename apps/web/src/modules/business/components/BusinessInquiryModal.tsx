"use client";

import { formatCurrency } from "@lego-shop/shared";
import {
  CheckCircle2,
  LoaderCircle,
  Send,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { z } from "zod";

import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { publicApiClient } from "@/lib/api/public-client";
import type {
  BusinessCompactCopy,
  BusinessEstimateSummary,
} from "@/modules/business/types/business-page.types";

type BusinessInquiryModalProps = {
  open: boolean;
  copy: BusinessCompactCopy["modal"];
  estimate: BusinessEstimateSummary | null;
  onClose: () => void;
};

type FormValues = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  requiredDate: string;
  message: string;
  consent: boolean;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY_FORM: FormValues = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  requiredDate: "",
  message: "",
  consent: false,
};

function buildSchema(copy: BusinessCompactCopy["modal"]) {
  return z.object({
    companyName: z.string().trim().min(1, copy.errors.required).max(160),
    contactName: z.string().trim().min(1, copy.errors.required).max(120),
    email: z
      .string()
      .trim()
      .min(1, copy.errors.required)
      .email(copy.errors.email),
    phone: z
      .string()
      .trim()
      .min(1, copy.errors.required)
      .refine((value) => {
        const digits = value.replace(/\D/g, "");
        return digits.length >= 9 && digits.length <= 12;
      }, copy.errors.phone),
    requiredDate: z.string(),
    message: z.string().trim().min(1, copy.errors.required).max(1500),
    consent: z.boolean().refine(Boolean, copy.errors.consent),
  });
}

export function BusinessInquiryModal({
  open,
  copy,
  estimate,
  onClose,
}: BusinessInquiryModalProps) {
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [requestCode, setRequestCode] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const schema = useMemo(() => buildSchema(copy), [copy]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [loading, onClose, open]);

  if (!open || typeof document === "undefined") return null;

  function updateValue<Key extends keyof FormValues>(
    key: Key,
    value: FormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError("");
  }

  function focusFirstError() {
    window.setTimeout(() => {
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
    }, 0);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FormValues | undefined;
        if (field && !nextErrors[field]) nextErrors[field] = issue.message;
      }
      setErrors(nextErrors);
      focusFirstError();
      return;
    }

    setLoading(true);
    setSubmitError("");

    const estimateLines = estimate
      ? [
          "",
          "[BUDGET ESTIMATE]",
          `Frame: ${estimate.frameLabel} (${estimate.frameId})`,
          `Characters per set: ${estimate.characterCount}`,
          `Charm level: ${estimate.charmCount}`,
          `Quantity: ${estimate.quantity}`,
          `Brand background: ${estimate.brandDesign ? "Yes" : "No"}`,
          `Logo placement: ${estimate.logoPlacement ? "Yes" : "No"}`,
          `Premium packaging: ${estimate.premiumPackaging ? "Yes" : "No"}`,
          `Invoice and contract: ${estimate.documents ? "Yes" : "No"}`,
          `Volume discount: ${estimate.discountPercent}%`,
          `Retail unit price: ${estimate.retailUnitPrice} VND`,
          `Estimated unit price: ${estimate.estimatedUnitPrice} VND`,
          `Estimated total: ${estimate.totalPrice} VND`,
          `Estimated savings: ${estimate.savings} VND`,
          `Quote timestamp: ${estimate.quotedAt}`,
        ]
      : [];

    const structuredMessage = [
      "[FIGURE LAB BUSINESS INQUIRY]",
      `Required date: ${parsed.data.requiredDate || "-"}`,
      ...estimateLines,
      "",
      "[CLIENT REQUIREMENTS]",
      parsed.data.message,
    ].join("\n");

    try {
      const response = await publicApiClient.inquiries.createBusinessInquiry({
        companyName: parsed.data.companyName,
        contactName: parsed.data.contactName,
        contactPerson: parsed.data.contactName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        message: structuredMessage,
      });
      const id = response.data.id.toString();
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

  const modal = (
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-5">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => {
          if (!loading) onClose();
        }}
        className="absolute inset-0 bg-[#071326]/60 backdrop-blur-sm animate-in fade-in duration-200"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="business-inquiry-title"
        data-testid="business-inquiry-modal"
        className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300 sm:h-auto sm:max-h-[calc(100dvh-40px)] sm:max-w-[820px] sm:rounded-[26px] sm:fade-in sm:zoom-in-95"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#e8edf2] bg-white/95 px-5 py-4 backdrop-blur sm:px-7 sm:py-5">
          <div>
            <p className="text-[10px] font-extrabold tracking-[0.18em] text-primary-dark">
              {copy.eyebrow}
            </p>
            <h2
              id="business-inquiry-title"
              className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-navy sm:text-3xl"
            >
              {copy.title}
            </h2>
            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm">
              {copy.description}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label={copy.close}
            disabled={loading}
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-white text-slate-500 transition hover:bg-primary-light/50 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 disabled:opacity-50"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        {requestCode ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-12 text-center">
            <span className="flex size-20 items-center justify-center rounded-full bg-[#eaf8f0] text-emerald-600">
              <CheckCircle2 className="size-10" aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-2xl font-extrabold text-navy">
              {copy.successTitle}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {copy.successDescription}
            </p>
            <div className="mt-6 rounded-2xl bg-primary-light/55 px-7 py-4">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                {copy.requestCode}
              </p>
              <p className="mt-1 text-2xl font-extrabold tracking-[0.08em] text-primary-dark">
                {requestCode}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-7 min-h-12 rounded-2xl bg-primary px-8 text-sm font-extrabold text-white transition hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
            >
              {copy.done}
            </button>
          </div>
        ) : (
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              {estimate ? (
                <div className="rounded-[22px] border border-[#d9e8f2] bg-[#f5faff] p-4 sm:p-5">
                  <p className="inline-flex items-center gap-2 text-sm font-extrabold text-navy">
                    <SlidersHorizontal
                      className="size-4 text-primary-dark"
                      aria-hidden="true"
                    />
                    {copy.summaryTitle}
                  </p>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
                    {[
                      [copy.summaryFrame, estimate.frameLabel],
                      [copy.summaryCharacters, estimate.characterCount],
                      [copy.summaryCharms, estimate.charmCount],
                      [copy.summaryQuantity, estimate.quantity],
                    ].map(([label, value]) => (
                      <div
                        key={String(label)}
                        className="rounded-xl bg-white px-3 py-2.5"
                      >
                        <dt className="font-bold text-slate-400">{label}</dt>
                        <dd className="mt-1 font-extrabold text-navy">
                          {value}
                        </dd>
                      </div>
                    ))}
                    <div className="col-span-2 rounded-xl bg-navy px-3 py-2.5 text-white sm:col-span-1">
                      <dt className="font-bold text-slate-400">
                        {copy.summaryTotal}
                      </dt>
                      <dd className="mt-1 font-extrabold">
                        {formatCurrency(estimate.totalPrice)}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : null}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Input
                  required
                  name="companyName"
                  label={copy.companyName}
                  placeholder={copy.placeholders.companyName}
                  value={values.companyName}
                  {...(errors.companyName ? { error: errors.companyName } : {})}
                  onChange={(event) =>
                    updateValue("companyName", event.target.value)
                  }
                />
                <Input
                  required
                  name="contactName"
                  label={copy.contactName}
                  placeholder={copy.placeholders.contactName}
                  value={values.contactName}
                  {...(errors.contactName ? { error: errors.contactName } : {})}
                  onChange={(event) =>
                    updateValue("contactName", event.target.value)
                  }
                />
                <Input
                  required
                  type="email"
                  name="email"
                  label={copy.email}
                  placeholder={copy.placeholders.email}
                  value={values.email}
                  {...(errors.email ? { error: errors.email } : {})}
                  onChange={(event) => updateValue("email", event.target.value)}
                />
                <Input
                  required
                  type="tel"
                  name="phone"
                  label={copy.phone}
                  placeholder={copy.placeholders.phone}
                  value={values.phone}
                  {...(errors.phone ? { error: errors.phone } : {})}
                  onChange={(event) => updateValue("phone", event.target.value)}
                />
                <Input
                  type="date"
                  name="requiredDate"
                  label={copy.requiredDate}
                  value={values.requiredDate}
                  {...(errors.requiredDate
                    ? { error: errors.requiredDate }
                    : {})}
                  onChange={(event) =>
                    updateValue("requiredDate", event.target.value)
                  }
                  className="sm:col-span-1"
                />
              </div>

              <div className="mt-4">
                <Textarea
                  required
                  name="message"
                  label={copy.message}
                  placeholder={copy.placeholders.message}
                  value={values.message}
                  {...(errors.message ? { error: errors.message } : {})}
                  maxLength={1500}
                  showCount
                  className="min-h-24"
                  onChange={(event) =>
                    updateValue("message", event.target.value)
                  }
                />
              </div>

              <div className="mt-4 rounded-2xl border border-border bg-surface-soft p-4">
                <Checkbox
                  required
                  name="consent"
                  label={copy.consent}
                  description={copy.consentDescription}
                  checked={values.consent}
                  {...(errors.consent ? { error: errors.consent } : {})}
                  onChange={(event) =>
                    updateValue("consent", event.target.checked)
                  }
                />
              </div>

              {submitError ? (
                <p
                  role="alert"
                  className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
                >
                  {submitError}
                </p>
              ) : null}
            </div>

            <footer className="sticky bottom-0 border-t border-[#e8edf2] bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-extrabold tracking-[0.03em] text-white shadow-[0_14px_26px_-18px_rgba(36,136,199,0.8)] transition hover:-translate-y-0.5 hover:bg-primary-dark active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <LoaderCircle
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Send className="size-4" aria-hidden="true" />
                )}
                {loading ? copy.submitting : copy.submit}
              </button>
            </footer>
          </form>
        )}
      </section>
    </div>
  );

  return createPortal(modal, document.body);
}
