"use client";

import type {
  BusinessQuoteRequestContract,
  FrameSize,
} from "@lego-shop/shared";
import { formatCurrency } from "@lego-shop/shared";
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  Check,
  ChevronDown,
  Database,
  FileCheck2,
  LoaderCircle,
  MessageCircle,
  PackageCheck,
  Percent,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { useEffect, useMemo, useState } from "react";

import { Container } from "@/components/layout/Container";
import { publicApiClient } from "@/lib/api/public-client";
import type {
  BusinessCompactCopy,
  BusinessEstimateSummary,
} from "@/modules/business/types/business-page.types";

type EstimatorFrameSize = Pick<
  FrameSize,
  "id" | "label" | "price" | "popular" | "status"
>;

type ConfigOptionKey =
  "brandDesign" | "logoPlacement" | "premiumPackaging" | "documents";

type BusinessBudgetEstimatorProps = {
  copy: Pick<BusinessCompactCopy, "configurator" | "estimator">;
  onEstimateChange: (estimate: BusinessEstimateSummary | null) => void;
  onOpenInquiry: () => void;
};

const CHARACTER_OPTIONS = [1, 2, 3, 4] as const;
const CHARM_OPTIONS = [0, 1, 2, 3, 4, 5] as const;
const QUANTITY_OPTIONS = [10, 30, 50, 100] as const;

function ChoiceButton({
  active,
  children,
  onClick,
  className = "",
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`business-hover-lift min-h-[72px] rounded-2xl border px-3 py-2 text-sm font-extrabold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 ${
        active
          ? "border-primary bg-[#e7f5fd] text-primary-dark shadow-none"
          : "border-border bg-white text-slate-600 hover:border-primary/45 hover:bg-primary-light/35 hover:text-primary-dark"
      } ${className}`}
    >
      {children}
    </button>
  );
}

const ROLLING_DIGIT_SEQUENCES = [
  "018529",
  "274163",
  "509271",
  "831406",
  "462918",
  "195730",
  "726405",
] as const;

function RollingDataAmount({ large = false }: { large?: boolean }) {
  const digitCount = large ? 7 : 6;
  const separatorIndexes = large ? [1, 4] : [3];

  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-baseline font-extrabold tabular-nums tracking-[-0.055em] ${
        large
          ? "text-[clamp(2rem,5vw,2.8rem)] text-white"
          : "text-3xl text-primary-dark"
      }`}
    >
      {Array.from({ length: digitCount }, (_, index) => {
        const sequence = ROLLING_DIGIT_SEQUENCES[index] ?? "018529";
        return (
          <span key={index} className="contents">
            {separatorIndexes.includes(index) ? <span>.</span> : null}
            <span className="business-data-loader__digit">
              <span
                className="business-data-loader__digit-track"
                style={{ animationDelay: `${index * -90}ms` }}
              >
                {sequence.split("").map((digit, digitIndex) => (
                  <span key={`${digit}-${digitIndex}`}>{digit}</span>
                ))}
              </span>
            </span>
          </span>
        );
      })}
      <span className="ml-1">₫</span>
    </span>
  );
}

function QuoteLoadingState({
  copy,
}: {
  copy: BusinessCompactCopy["estimator"];
}) {
  const stepIcons = [Database, Percent, Calculator] as const;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="py-5"
    >
      <div className="business-data-loader__surface relative overflow-hidden rounded-[20px] border border-border-soft bg-white px-4 py-4">
        <span className="business-data-loader__scan" aria-hidden="true" />
        <div className="relative flex items-center justify-between gap-4 text-xs text-slate-500">
          <span className="font-bold">{copy.retailUnitLabel}</span>
          <span className="business-data-loader__soft-value h-3 w-24 rounded-full bg-slate-100" />
        </div>
        <div className="relative mt-4 flex items-end justify-between gap-4 border-t border-border-soft pt-4">
          <span className="pb-1 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
            {copy.estimatedUnitLabel}
          </span>
          <RollingDataAmount />
        </div>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-[26px] bg-navy p-5 text-white sm:p-6">
        <span className="business-data-loader__scan business-data-loader__scan--dark" aria-hidden="true" />
        <p className="relative text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
          {copy.totalLabel}
        </p>
        <p className="relative mt-2 leading-none">
          <RollingDataAmount large />
        </p>

        <ol className="relative mt-6 grid grid-cols-3 gap-2">
          {copy.loadingSteps.map((step, index) => {
            const Icon = stepIcons[index] ?? Calculator;
            return (
              <li
                key={step}
                className="business-data-loader__step flex min-w-0 flex-col items-center gap-1.5 text-center text-[9px] font-bold leading-3 text-slate-300"
                style={{ animationDelay: `${index * 320}ms` }}
              >
                <span className="grid size-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-sky-300">
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
                <span>{step}</span>
              </li>
            );
          })}
        </ol>
      </div>

      <span className="sr-only">{copy.loading}</span>
    </div>
  );
}

export function BusinessBudgetEstimator({
  copy,
  onEstimateChange,
  onOpenInquiry,
}: BusinessBudgetEstimatorProps) {
  const [frameSizes, setFrameSizes] = useState<EstimatorFrameSize[]>([]);
  const [selectedFrameId, setSelectedFrameId] = useState("");
  const [characterCount, setCharacterCount] = useState(1);
  const [charmCount, setCharmCount] = useState(0);
  const [quantityChoice, setQuantityChoice] = useState<number | "custom">(10);
  const [customQuantity, setCustomQuantity] = useState("10");
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(true);
  const [options, setOptions] = useState<Record<ConfigOptionKey, boolean>>({
    brandDesign: true,
    logoPlacement: true,
    premiumPackaging: false,
    documents: true,
  });
  const [frameStatus, setFrameStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [quoteStatus, setQuoteStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [quote, setQuote] = useState<BusinessEstimateSummary | null>(null);
  const [quoteRevision, setQuoteRevision] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadFrameSizes() {
      try {
        const response = await publicApiClient.products.listFrameSizes();
        const available = response
          .filter((item) => item.status === "active" && Number(item.price) > 0)
          .sort((left, right) => Number(left.price) - Number(right.price))
          .slice(0, 5);

        if (!active) return;
        if (available.length === 0) {
          setFrameStatus("error");
          return;
        }

        setFrameSizes(available);
        setSelectedFrameId(available[0]?.id ?? "");
        setFrameStatus("ready");
      } catch (error) {
        console.error(
          "[business-configurator] Failed to load frame sizes",
          error,
        );
        if (active) setFrameStatus("error");
      }
    }

    void loadFrameSizes();
    return () => {
      active = false;
    };
  }, []);

  const effectiveQuantity = useMemo(() => {
    if (quantityChoice !== "custom") return quantityChoice;
    const parsed = Number.parseInt(customQuantity, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [customQuantity, quantityChoice]);

  const quotePayload = useMemo<BusinessQuoteRequestContract | null>(() => {
    if (
      !selectedFrameId ||
      effectiveQuantity < 10 ||
      effectiveQuantity > 5000
    ) {
      return null;
    }

    return {
      frameId: selectedFrameId,
      characterCount,
      charmCount,
      quantity: effectiveQuantity,
      ...options,
    };
  }, [characterCount, charmCount, effectiveQuantity, options, selectedFrameId]);

  useEffect(() => {
    let active = true;
    if (!quotePayload) {
      window.queueMicrotask(() => {
        if (!active) return;
        setQuote(null);
        setQuoteStatus("idle");
        onEstimateChange(null);
      });
      return () => {
        active = false;
      };
    }

    window.queueMicrotask(() => {
      if (!active) return;
      setQuoteStatus("loading");
      setQuote(null);
      onEstimateChange(null);
    });

    const timeout = window.setTimeout(
      () => {
        void publicApiClient.inquiries
          .quoteBusinessGift(quotePayload)
          .then((response) => {
            if (!active) return;
            setQuote(response);
            setQuoteStatus("ready");
            onEstimateChange(response);
          })
          .catch((error) => {
            console.error(
              "[business-configurator] Failed to quote configuration",
              error,
            );
            if (!active) return;
            setQuoteStatus("error");
            onEstimateChange(null);
          });
      },
      quantityChoice === "custom" ? 450 : 260,
    );

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [onEstimateChange, quantityChoice, quotePayload, quoteRevision]);

  function toggleOption(key: ConfigOptionKey) {
    setOptions((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <section
      id="business-configurator"
      className="relative z-10 -mt-5 pb-14 sm:pb-16 lg:-mt-7"
    >
      <Container size="full" className="max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)] xl:gap-7">
          <div className="min-w-0 rounded-[26px] border border-border bg-white p-4 shadow-[0_24px_58px_-40px_rgba(34,43,67,0.36)] sm:p-6 xl:p-8">
            <div className="flex items-start gap-4 border-b border-border-soft pb-5 sm:pb-6">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-[15px] bg-[#fff6de] shadow-sm ring-1 ring-amber-100 sm:size-[52px]">
                <Image
                  src="/assets/icons/fluent-emoji/wrapped-gift-3d.png"
                  alt=""
                  width={42}
                  height={42}
                  className="size-10 object-contain"
                  aria-hidden="true"
                />
              </span>
              <div>
                <h2 className="text-lg font-extrabold tracking-[-0.02em] text-navy sm:text-xl">
                  {copy.configurator.title}
                </h2>
                <p className="mt-1 text-xs font-bold text-slate-500 sm:text-sm">
                  {copy.configurator.description}
                </p>
              </div>
            </div>

            <fieldset className="mt-6 min-w-0">
              <legend className="text-[11px] font-black tracking-[0.16em] text-[#405978]">
                {copy.configurator.frameLabel}
              </legend>
              {frameStatus === "loading" ? (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[0, 1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-[76px] animate-pulse rounded-2xl bg-slate-100"
                    />
                  ))}
                  <p className="col-span-full text-xs text-slate-400">
                    {copy.configurator.frameLoading}
                  </p>
                </div>
              ) : frameStatus === "error" ? (
                <p
                  role="alert"
                  className="mt-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
                >
                  {copy.configurator.frameError}
                </p>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {frameSizes.map((frame) => (
                    <ChoiceButton
                      key={frame.id}
                      active={selectedFrameId === frame.id}
                      onClick={() => setSelectedFrameId(frame.id)}
                    >
                      <span className="block">{frame.label}</span>
                      <span className="mt-1 block text-[11px] font-extrabold opacity-80">
                        {formatCurrency(Number(frame.price))}
                      </span>
                    </ChoiceButton>
                  ))}
                </div>
              )}
            </fieldset>

            <div className="mt-5 border-t border-border-soft pt-5">
              <fieldset className="min-w-0">
                <legend className="text-[11px] font-black tracking-[0.16em] text-[#405978]">
                  {copy.configurator.characterLabel}
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
                  {CHARACTER_OPTIONS.map((count) => (
                    <ChoiceButton
                      key={count}
                      active={characterCount === count}
                      onClick={() => setCharacterCount(count)}
                      className="min-h-[72px] px-3"
                    >
                      <span className="block text-base">{count}</span>
                      <span className="block whitespace-nowrap text-[9px] font-extrabold opacity-75 sm:text-[10px]">
                        {copy.configurator.characterUnit}
                      </span>
                    </ChoiceButton>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-5 min-w-0 border-t border-border-soft pt-5">
                <legend className="text-[11px] font-black tracking-[0.16em] text-[#405978]">
                  {copy.configurator.charmLabel}
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3">
                  {CHARM_OPTIONS.map((count) => (
                    <ChoiceButton
                      key={count}
                      active={charmCount === count}
                      onClick={() => setCharmCount(count)}
                      className="min-h-[72px] min-w-0 px-2 sm:px-3"
                    >
                      <span className="block text-sm">
                        {count === 0 ? copy.configurator.charmBasic : count}
                      </span>
                      {count > 0 ? (
                        <span className="block text-[9px] font-extrabold opacity-75">
                          {copy.configurator.charmUnit}
                        </span>
                      ) : null}
                    </ChoiceButton>
                  ))}
                </div>
              </fieldset>
            </div>

            <fieldset className="mt-5 min-w-0 border-t border-border-soft pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <legend className="text-[11px] font-black tracking-[0.16em] text-[#405978]">
                  {copy.configurator.quantityLabel}
                </legend>
                <Badge
                  variant="highlight"
                  size="sm"
                  className="h-6 min-w-6 justify-center px-2 text-xs font-bold"
                >
                  {copy.configurator.minimumOrder}
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {QUANTITY_OPTIONS.map((count) => (
                  <ChoiceButton
                    key={count}
                    active={quantityChoice === count}
                    onClick={() => setQuantityChoice(count)}
                    className="min-h-[64px]"
                  >
                    {count}
                  </ChoiceButton>
                ))}
                <ChoiceButton
                  active={quantityChoice === "custom"}
                  onClick={() => setQuantityChoice("custom")}
                  className="min-h-[64px]"
                >
                  {copy.configurator.customQuantity}
                </ChoiceButton>
              </div>
              {quantityChoice === "custom" ? (
                <Input
                  type="number"
                  min={10}
                  max={5000}
                  inputMode="numeric"
                  value={customQuantity}
                  onChange={(event) => setCustomQuantity(event.target.value)}
                  placeholder={copy.configurator.customQuantityPlaceholder}
                  aria-label={copy.configurator.customQuantityPlaceholder}
                  aria-invalid={
                    effectiveQuantity < 10 || effectiveQuantity > 5000
                  }
                  className="text-[15px] font-semibold"
                  containerClassName="mt-3 max-w-sm space-y-0"
                />
              ) : null}
            </fieldset>

            <div className="mt-5 rounded-[22px] border border-primary/20 bg-primary-light/30 p-4 sm:p-5">
              <button
                type="button"
                aria-expanded={advancedOptionsOpen}
                aria-controls="business-advanced-options"
                onClick={() => setAdvancedOptionsOpen((open) => !open)}
                className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg text-left text-sm font-extrabold text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f3f9fd]"
              >
                <span className="inline-flex items-center gap-2">
                  <Sparkles
                    className="size-4 text-primary"
                    aria-hidden="true"
                  />
                  {copy.configurator.advancedLabel}
                </span>
                <ChevronDown
                  className={`size-4 transition-transform duration-300 ease-out motion-reduce:transition-none ${
                    advancedOptionsOpen ? "rotate-180" : "rotate-0"
                  }`}
                  aria-hidden="true"
                />
              </button>
              <div
                id="business-advanced-options"
                aria-hidden={!advancedOptionsOpen}
                inert={!advancedOptionsOpen}
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  advancedOptionsOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div
                    className={`grid gap-3 transition-[margin,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:transition-none sm:grid-cols-2 ${
                      advancedOptionsOpen
                        ? "mt-4 translate-y-0"
                        : "mt-0 -translate-y-1"
                    }`}
                  >
                    {copy.configurator.options.map((option) => (
                      <Checkbox
                        key={option.key}
                        label={option.label}
                        description={
                          <>
                            <span className="block text-xs font-medium leading-5 text-slate-600">
                              {option.description}
                            </span>
                            {option.included ? (
                              <span className="mt-2 inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-emerald-800">
                                {copy.configurator.included}
                              </span>
                            ) : null}
                          </>
                        }
                        checked={options[option.key]}
                        onChange={() => toggleOption(option.key)}
                        containerClassName="business-hover-lift rounded-2xl border border-border bg-white p-4 hover:border-primary/45 hover:shadow-[0_14px_26px_-24px_rgba(18,45,78,0.55)]"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative min-w-0 self-stretch">
            <aside className="min-w-0 rounded-[26px] border border-border bg-white p-5 shadow-[0_24px_58px_-40px_rgba(34,43,67,0.42)] sm:p-6 xl:sticky xl:top-4 xl:p-6">
              <div className="flex items-start justify-between gap-4 border-b border-border-soft pb-5">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-[-0.035em] text-navy">
                    {copy.estimator.title}
                  </h2>
                  <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                    {copy.estimator.liveLabel}
                  </p>
                </div>
                {quote ? (
                  <Badge
                    variant="highlight"
                    className="gap-1.5 px-3.5 py-1.5 text-[11px] font-extrabold"
                  >
                    <BadgeCheck className="size-3.5" aria-hidden="true" />-
                    {quote.discountPercent}%
                  </Badge>
                ) : null}
              </div>

              {quoteStatus === "loading" || quoteStatus === "idle" ? (
                <QuoteLoadingState copy={copy.estimator} />
              ) : quoteStatus === "error" ? (
                <div
                  role="alert"
                  className="my-6 rounded-[22px] border border-red-100 bg-red-50 p-5 text-center"
                >
                  <p className="text-sm font-bold text-red-600">
                    {copy.estimator.error}
                  </p>
                  <button
                    type="button"
                    onClick={() => setQuoteRevision((value) => value + 1)}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-red-600 shadow-sm"
                  >
                    <RefreshCcw className="size-3.5" aria-hidden="true" />
                    {copy.estimator.retry}
                  </button>
                </div>
              ) : quote ? (
                <>
                  <dl className="space-y-3 py-5 text-sm">
                    <div className="flex items-center justify-between gap-4 text-slate-500">
                      <dt className="font-bold">
                        {copy.estimator.retailUnitLabel}
                      </dt>
                      <dd className="font-bold line-through">
                        {formatCurrency(quote.retailUnitPrice)}
                      </dd>
                    </div>
                    <div className="flex items-end justify-between gap-4 border-t border-border-soft pt-4">
                      <dt className="pb-1 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                        {copy.estimator.estimatedUnitLabel}
                      </dt>
                      <dd className="text-3xl font-bold tracking-[-0.05em] text-primary-dark">
                        {formatCurrency(quote.estimatedUnitPrice)}
                      </dd>
                    </div>
                  </dl>

                  <div className="rounded-[26px] bg-navy p-5 text-white shadow-[0_22px_38px_-26px_rgba(9,20,38,0.9)] sm:p-6">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                      {copy.estimator.totalLabel} ({quote.quantity}{" "}
                      {copy.estimator.quantitySummary})
                    </p>
                    <p className="mt-2 text-[clamp(2rem,5vw,2.8rem)] font-extrabold leading-none tracking-[-0.055em]">
                      {formatCurrency(quote.totalPrice)}
                    </p>
                    <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/15 p-4 text-center">
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-sky-300">
                        {copy.estimator.savingsLabel}
                      </p>
                      <p className="mt-1 text-xl font-extrabold text-sky-200">
                        {formatCurrency(quote.savings)}
                      </p>
                    </div>
                    <ul className="mt-5 space-y-2.5 text-[11px] font-extrabold text-slate-200">
                      {copy.estimator.benefits.map((benefit, index) => (
                        <li key={benefit} className="flex items-center gap-2">
                          {index === 1 ? (
                            <PackageCheck
                              className="size-3.5 text-sky-300"
                              aria-hidden="true"
                            />
                          ) : index === 2 ? (
                            <FileCheck2
                              className="size-3.5 text-sky-300"
                              aria-hidden="true"
                            />
                          ) : (
                            <Check
                              className="size-3.5 text-sky-300"
                              aria-hidden="true"
                            />
                          )}
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : null}

              <button
                type="button"
                data-testid="business-estimator-consultation"
                disabled={!quote || quoteStatus !== "ready"}
                onClick={onOpenInquiry}
                className="group relative mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary px-5 text-center text-sm font-extrabold tracking-[0.04em] text-white transition-all duration-300 before:absolute before:inset-y-0 before:left-[-45%] before:w-1/3 before:-skew-x-12 before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent before:transition-transform before:duration-700 hover:-translate-y-0.5 hover:bg-primary-dark hover:before:translate-x-[430%] active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:before:hidden disabled:cursor-not-allowed disabled:opacity-45"
              >
                {quoteStatus === "loading" ? (
                  <LoaderCircle
                    className="relative z-10 size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <MessageCircle
                    className="relative z-10 size-[17px] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{copy.estimator.cta}</span>
                <ArrowRight
                  className="relative z-10 size-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </button>
              <p className="mt-3 text-center text-[10px] font-bold leading-4 text-slate-500">
                {copy.estimator.note}
              </p>
            </aside>
          </div>
        </div>
      </Container>
    </section>
  );
}
