"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type Ref,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleAlert,
  ExternalLink,
  LoaderCircle,
  MapPin,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ApiClientError } from "@lego-shop/api";
import {
  formatCurrency,
  type TrackOrderResponseContract,
} from "@lego-shop/shared";

import { Container } from "@/components/layout/Container";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { formControlClassName } from "@/components/ui/form-control";
import { DECORATIVE_ICON_PATHS } from "@/config/icons";
import { ROUTES } from "@/config/routes";
import { LOCALE_FORMATS } from "@/lib/i18n/config";
import type { OrderTrackingDictionary } from "@/lib/i18n/dictionaries";
import { useI18n } from "@/lib/i18n/useI18n";
import { publicApiClient } from "@/lib/api/public-client";

const FLUENT_ICONS = {
  artistPalette: DECORATIVE_ICON_PATHS.artistPalette,
  chartIncreasing: DECORATIVE_ICON_PATHS.chartIncreasing,
  check: DECORATIVE_ICON_PATHS.checkMark,
  envelope: DECORATIVE_ICON_PATHS.envelope,
  framedPicture: DECORATIVE_ICON_PATHS.framedPicture,
  identificationCard: DECORATIVE_ICON_PATHS.identificationCard,
  package: DECORATIVE_ICON_PATHS.package,
  phone: DECORATIVE_ICON_PATHS.telephoneReceiver,
  receipt: DECORATIVE_ICON_PATHS.receipt,
  shield: DECORATIVE_ICON_PATHS.shield,
  truck: DECORATIVE_ICON_PATHS.deliveryTruck,
} as const;

type Feedback = { tone: "error" | "success"; message: string };
type TrackingCopy = OrderTrackingDictionary;

const GUIDE_ICONS = [
  FLUENT_ICONS.identificationCard,
  FLUENT_ICONS.chartIncreasing,
  FLUENT_ICONS.truck,
];
const STATUS_ICONS = [
  FLUENT_ICONS.receipt,
  FLUENT_ICONS.shield,
  FLUENT_ICONS.artistPalette,
  FLUENT_ICONS.framedPicture,
  FLUENT_ICONS.package,
  FLUENT_ICONS.truck,
  FLUENT_ICONS.check,
];
const WHERE_ICONS = [
  FLUENT_ICONS.envelope,
  FLUENT_ICONS.phone,
  FLUENT_ICONS.receipt,
];

function formatDate(
  value: string | null | undefined,
  locale: "vi" | "en",
): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(LOCALE_FORMATS[locale], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function normalizeTrackingResult(
  data: TrackOrderResponseContract,
): TrackOrderResponseContract {
  return {
    ...data,
    items: Array.isArray(data.items) ? data.items : [],
    statusHistory: Array.isArray(data.statusHistory) ? data.statusHistory : [],
  };
}

function getProgressIndex(result: TrackOrderResponseContract): number {
  if (
    result.orderStatus === "cancelled" ||
    result.shippingStatus === "cancelled"
  )
    return -1;
  if (
    result.orderStatus === "completed" ||
    result.shippingStatus === "delivered"
  )
    return 6;
  if (result.orderStatus === "shipping" || result.shippingStatus === "shipping")
    return 5;
  if (result.shippingStatus === "preparing") return 4;
  if (result.orderStatus === "processing") return 3;
  if (result.orderStatus === "confirmed") return 1;
  return 0;
}

function labelFrom(record: object, key: string): string {
  return (record as Record<string, string>)[key] ?? key;
}

function FluentIcon({
  src,
  alt = "",
  className = "h-12 w-12",
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={72}
      height={72}
      className={`${className} object-contain`}
    />
  );
}

function Eyebrow({
  children,
  inverse = false,
}: {
  children: ReactNode;
  inverse?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.2em] ${
        inverse ? "text-sky-200" : "text-[#1687c7]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${inverse ? "bg-[#f6d76b]" : "bg-[#f6c947]"}`}
      />
      {children}
    </span>
  );
}

function TrackingPageContent() {
  const { dictionary, locale } = useI18n();
  const copy = dictionary.orderTracking;
  const searchParams = useSearchParams();
  const router = useRouter();
  const resultRef = useRef<HTMLElement | null>(null);
  const [orderCode, setOrderCode] = useState(
    () => searchParams.get("code") ?? "",
  );
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackOrderResponseContract | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [pendingGuideTarget, setPendingGuideTarget] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!result) return;

    const frame = window.requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [result]);

  useEffect(() => {
    if (!isGuideOpen || !pendingGuideTarget) return;

    const timer = window.setTimeout(() => {
      document.getElementById(pendingGuideTarget)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setPendingGuideTarget(null);
    }, 440);

    return () => window.clearTimeout(timer);
  }, [isGuideOpen, pendingGuideTarget]);

  function openGuideAt(targetId: "where-code" | "support") {
    setPendingGuideTarget(targetId);
    setIsGuideOpen(true);
  }

  async function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedCode = orderCode.trim().toUpperCase();
    const normalizedPhone = phone.replace(/\s+/g, "").trim();

    if (!normalizedCode || !normalizedPhone) {
      setFeedback({ tone: "error", message: copy.lookup.requiredError });
      return;
    }

    if (normalizedPhone.replace(/\D/g, "").length < 8) {
      setFeedback({ tone: "error", message: copy.lookup.phoneError });
      return;
    }

    setLoading(true);
    setFeedback(null);
    setResult(null);
    setPendingGuideTarget(null);
    setIsGuideOpen(false);

    try {
      const response = await publicApiClient.orders.trackOrder({
        orderCode: normalizedCode,
        phone: normalizedPhone,
      });
      setResult(normalizeTrackingResult(response));
      setFeedback({ tone: "success", message: copy.lookup.success });
      router.replace(
        `${ROUTES.orderTracking}?code=${encodeURIComponent(normalizedCode)}`,
        { scroll: false },
      );
    } catch (error: unknown) {
      const notFound = error instanceof ApiClientError && error.status === 404;
      setFeedback({
        tone: "error",
        message: notFound
          ? copy.lookup.notFoundError
          : copy.lookup.networkError,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="overflow-x-clip bg-[#f7faff] text-[#10233f]">
      <section
        id="lookup-form"
        className="relative overflow-hidden pb-10 pt-8 sm:pt-10 lg:pb-12 lg:pt-12"
      >
        <div className="pointer-events-none absolute -left-28 top-4 h-72 w-72 rounded-full bg-[#dceeff]/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-12 h-64 w-64 rounded-full bg-[#fff0b8]/70 blur-3xl" />

        <Container size="default" className="relative">
          <ScrollReveal className="overflow-hidden rounded-[1.75rem] border border-[#d8e9f7] bg-white shadow-[0_20px_55px_-42px_rgba(16,35,63,0.38)]">
            <div className="border-b border-[#e5edf4] px-5 py-5 text-center sm:px-7 sm:py-6 lg:px-9">
              <Eyebrow>
                {copy.hero.eyebrow}
              </Eyebrow>

              <h1 className="mx-auto mt-2 max-w-2xl text-balance text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-[1.12] tracking-[-0.03em] text-[#10233f]">
                {copy.hero.title}
              </h1>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                {copy.lookup.description}
              </p>
            </div>

            <div className="relative px-5 pb-5 pt-6 sm:px-7 lg:px-9 lg:pb-6 lg:pt-8">
              <form
                onSubmit={handleLookup}
                noValidate
                className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-start"
              >
                <div className="block">
                  <label
                    htmlFor="tracking-order-code"
                    className="mb-2 block text-sm font-semibold text-slate-900"
                  >
                    {copy.lookup.orderCodeLabel}
                  </label>

                  <div className="group/field relative">
                    <Search
                      className="pointer-events-none absolute left-4 top-1/2 z-10 h-[22px] w-[22px] -translate-y-1/2 text-slate-400 transition-colors duration-[90ms] ease-out group-focus-within/field:text-[#63afe3]"
                      aria-hidden="true"
                    />
                    <input
                      id="tracking-order-code"
                      value={orderCode}
                      onChange={(event) =>
                        setOrderCode(event.target.value.toUpperCase())
                      }
                      placeholder={copy.lookup.orderCodePlaceholder}
                      autoComplete="off"
                      className={formControlClassName({
                        className: "pl-[52px] pr-12 text-[15px] font-medium",
                      })}
                    />

                    {orderCode ? (
                      <button
                        type="button"
                        onClick={() => {
                          setOrderCode("");
                          setFeedback(null);
                        }}
                        aria-label={copy.lookup.clearOrderCode}
                        className="absolute right-2.5 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9bd2f0]"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>

                  <span className="mt-2 block text-xs leading-5 text-slate-400">
                    {copy.lookup.codeHint}
                  </span>
                </div>

                <div className="block">
                  <label
                    htmlFor="tracking-phone"
                    className="mb-2 block text-sm font-semibold text-slate-900"
                  >
                    {copy.lookup.phoneLabel}
                  </label>

                  <div className="group/field relative">
                    <ShieldCheck
                      className="pointer-events-none absolute left-4 top-1/2 z-10 h-[22px] w-[22px] -translate-y-1/2 text-slate-400 transition-colors duration-[90ms] ease-out group-focus-within/field:text-[#63afe3]"
                      aria-hidden="true"
                    />
                    <input
                      id="tracking-phone"
                      type="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder={copy.lookup.phonePlaceholder}
                      autoComplete="tel"
                      className={formControlClassName({
                        className: "pl-[52px] pr-12 text-[15px] font-medium",
                      })}
                    />

                    {phone ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPhone("");
                          setFeedback(null);
                        }}
                        aria-label={copy.lookup.clearPhone}
                        className="absolute right-2.5 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9bd2f0]"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>

                  <span className="mt-2 block text-xs leading-5 text-slate-400">
                    {copy.lookup.phoneHint}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative inline-flex h-12 min-w-[140px] items-center justify-center gap-1.5 overflow-hidden rounded-[14px] bg-[#168fce] px-6 text-base font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#087ab7] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 disabled:cursor-wait disabled:opacity-70 lg:mt-[29px] motion-reduce:transform-none"
                >
                  {loading ? (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}

                  {loading ? copy.lookup.submitting : copy.lookup.submit}

                  <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-[500%] motion-reduce:hidden" />
                </button>
              </form>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm">
                <a
                  href="#where-code"
                  onClick={(event) => {
                    event.preventDefault();
                    openGuideAt("where-code");
                  }}
                  className="font-semibold text-[#087ab7] transition-colors hover:text-[#075f91] hover:underline"
                >
                  {copy.lookup.forgotCode}
                </a>

                <a
                  href="#support"
                  onClick={(event) => {
                    event.preventDefault();
                    openGuideAt("support");
                  }}
                  className="font-semibold text-slate-500 transition-colors hover:text-[#087ab7]"
                >
                  {copy.lookup.needSupport}
                </a>
              </div>

              <div aria-live="polite" className="mt-3 empty:mt-0">
                {feedback ? (
                  <div
                    className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
                      feedback.tone === "error"
                        ? "bg-red-50 text-red-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {feedback.tone === "error" ? (
                      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    ) : (
                      <Check className="mt-0.5 h-4 w-4 shrink-0" />
                    )}
                    {feedback.message}
                  </div>
                ) : null}
              </div>
            </div>
          </ScrollReveal>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                setPendingGuideTarget(null);
                setIsGuideOpen((current) => !current);
              }}
              aria-expanded={isGuideOpen}
              aria-controls="tracking-guide"
              className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-[#cfe2ef] bg-white px-5 py-4 text-left transition-[transform,border-color,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-[#9dcce7] hover:bg-[#f8fcff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fcbed] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
            >
              <span className="min-w-0">
                <span className="block text-sm font-bold text-[#10233f]">
                  {isGuideOpen ? copy.guide.collapse : copy.guide.expand}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                  {copy.guide.summary}
                </span>
              </span>

              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#d7eaf6] bg-white text-[#168fce] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 motion-reduce:transform-none">
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isGuideOpen ? "rotate-180" : "rotate-0"
                  }`}
                  aria-hidden="true"
                />
              </span>
            </button>
          </div>
        </Container>
      </section>

      <AnimatePresence initial={false}>
        {isGuideOpen ? (
          <motion.div
            id="tracking-guide"
            key="tracking-guide"
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{
              height: {
                duration: 0.42,
                ease: [0.22, 1, 0.36, 1],
              },
              opacity: { duration: 0.28, ease: "easeOut" },
              y: { duration: 0.36, ease: [0.22, 1, 0.36, 1] },
            }}
            className="overflow-hidden"
          >
            <section className="pb-20">
              <Container size="default">
                <SectionHeading
                  eyebrow={copy.guide.eyebrow}
                  title={copy.guide.title}
                  description={copy.guide.description}
                />
                <div className="mt-9 grid gap-5 md:grid-cols-3">
                  {copy.guide.items.map((item, index) => (
                    <ScrollReveal key={item.title} delay={index * 0.06}>
                      <article className="group relative h-full overflow-hidden rounded-3xl border border-[#dbe8f3] bg-white p-6 shadow-[0_12px_35px_-30px_rgba(16,35,63,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-[#add5ed] hover:shadow-[0_18px_42px_-28px_rgba(16,35,63,0.32)] motion-reduce:transform-none">
                        <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-700 group-hover:translate-x-[500%] motion-reduce:hidden" />
                        <div className="flex items-start justify-between gap-4">
                          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef7ff] transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none">
                            <FluentIcon
                              src={GUIDE_ICONS[index] ?? FLUENT_ICONS.receipt}
                              className="h-10 w-10"
                            />
                          </span>
                          <span className="font-mono text-xs font-bold text-[#168fce]">
                            0{index + 1}
                          </span>
                        </div>
                        <h3 className="mt-6 text-lg font-bold text-[#10233f]">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {item.description}
                        </p>
                      </article>
                    </ScrollReveal>
                  ))}
                </div>
              </Container>
            </section>

            <section className="border-y border-[#dfeaf4] bg-[#edf6fd] py-20">
              <Container size="wide">
                <SectionHeading
                  eyebrow={copy.statuses.eyebrow}
                  title={copy.statuses.title}
                  description={copy.statuses.description}
                  centered
                />
                <div className="relative mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-7 lg:gap-3">
                  <div className="absolute left-[7%] right-[7%] top-10 hidden h-px bg-[#a9d5ee] lg:block" />
                  {copy.statuses.items.map((item, index) => (
                    <ScrollReveal
                      key={item.key}
                      delay={index * 0.045}
                      className="relative"
                    >
                      <article className="group relative flex h-full gap-4 overflow-hidden rounded-3xl border border-white/90 bg-white/80 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[#b5d9ee] hover:shadow-sm lg:block lg:bg-transparent lg:p-2 lg:text-center lg:hover:shadow-none motion-reduce:transform-none">
                        <span className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#d6e9f6] bg-white shadow-sm transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none lg:mx-auto">
                          <FluentIcon
                            src={STATUS_ICONS[index] ?? FLUENT_ICONS.package}
                            className="h-9 w-9"
                          />
                          <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#f6cf4b] text-[0.65rem] font-bold text-[#10233f]">
                            {index + 1}
                          </span>
                        </span>
                        <div className="lg:mt-5">
                          <h3 className="text-sm font-bold text-[#10233f]">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {item.description}
                          </p>
                        </div>
                      </article>
                    </ScrollReveal>
                  ))}
                </div>
              </Container>
            </section>

            <section id="where-code" className="scroll-mt-28 py-20">
              <Container
                size="default"
                className="grid items-center gap-10 lg:grid-cols-[1fr_0.85fr]"
              >
                <ScrollReveal variant="slideLeft">
                  <SectionHeading
                    eyebrow={copy.where.eyebrow}
                    title={copy.where.title}
                    description={copy.where.description}
                  />
                  <div className="mt-8 space-y-3">
                    {copy.where.items.map((item, index) => (
                      <div
                        key={item.title}
                        className="flex items-center gap-4 rounded-2xl border border-[#dce8f2] bg-white p-4 transition hover:border-[#b9d9ed] hover:shadow-sm"
                      >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f0f8ff]">
                          <FluentIcon
                            src={WHERE_ICONS[index] ?? FLUENT_ICONS.receipt}
                            className="h-8 w-8"
                          />
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-[#10233f]">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm leading-5 text-slate-500">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollReveal>
                <ScrollReveal variant="slideRight" delay={0.08}>
                  <div className="relative mx-auto max-w-md rounded-[2rem] border border-[#d8e8f4] bg-white p-6 shadow-[0_24px_60px_-44px_rgba(16,35,63,0.45)]">
                    <div className="rounded-3xl bg-[#f2f8fd] p-6">
                      <div className="flex items-center justify-between">
                        <FluentIcon
                          src={FLUENT_ICONS.receipt}
                          className="h-14 w-14"
                        />
                        <span className="rounded-full bg-white px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-[#168fce]">
                          {dictionary.common.brandName}
                        </span>
                      </div>
                      <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        {copy.where.sampleLabel}
                      </p>
                      <p className="mt-2 font-mono text-xl font-bold tracking-[0.13em] text-[#10233f]">
                        {copy.where.sampleCode}
                      </p>
                      <div className="mt-6 space-y-2">
                        <span className="block h-2 w-full rounded-full bg-white" />
                        <span className="block h-2 w-4/5 rounded-full bg-white" />
                        <span className="block h-2 w-2/3 rounded-full bg-white" />
                      </div>
                    </div>
                    <div className="absolute -bottom-4 -right-4 flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-[#f7faff] bg-[#fff1b6] shadow-sm">
                      <Search className="h-6 w-6 text-[#9e7400]" />
                    </div>
                  </div>
                </ScrollReveal>
              </Container>
            </section>

            <section
              id="support"
              className="scroll-mt-28 overflow-hidden border-y border-[#173d67] bg-[#102c4d]"
            >
              <div className="relative">
                <div className="pointer-events-none absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[#1a416c]/60 blur-3xl" />
                <div className="pointer-events-none absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[#f6d76b]/10 blur-3xl" />

                <Container size="wide" className="relative">
                  <ScrollReveal className="py-10 text-white sm:py-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
                    <div className="max-w-3xl">
                      <Eyebrow inverse>{copy.support.eyebrow}</Eyebrow>
                      <h2 className="mt-3 text-balance text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-[1.12] tracking-[-0.03em]">
                        {copy.support.title}
                      </h2>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                        {copy.support.description}
                      </p>
                    </div>

                    <Link
                      href={ROUTES.contact}
                      className="group relative mt-7 inline-flex h-[52px] shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#f6d76b] px-7 text-sm font-bold text-[#10233f] shadow-[0_14px_32px_-22px_rgba(246,215,107,0.9)] transition-[transform,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:translate-x-1 hover:bg-[#ffe38a] hover:shadow-[0_18px_36px_-20px_rgba(246,215,107,0.95)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 lg:mt-0 motion-reduce:transform-none motion-reduce:transition-none"
                    >
                      <span className="relative z-10">
                        {copy.support.button}
                      </span>
                      <ExternalLink className="relative z-10 h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none" />
                      <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[520%] motion-reduce:hidden" />
                    </Link>
                  </ScrollReveal>
                </Container>
              </div>
            </section>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {result ? (
        <TrackingResultSection
          ref={resultRef}
          result={result}
          copy={copy}
          locale={locale}
        />
      ) : null}
    </main>
  );
}

const TrackingResultSection = ({
  result,
  copy,
  locale,
  ref,
}: {
  result: TrackOrderResponseContract;
  copy: TrackingCopy;
  locale: "vi" | "en";
  ref: Ref<HTMLElement>;
}) => {
  const progressIndex = getProgressIndex(result);
  const isCancelled = progressIndex < 0;
  const latestHistory = result.statusHistory?.at(-1);

  return (
    <section
      ref={ref}
      className="scroll-mt-24 border-t border-[#dce8f2] bg-white py-20"
    >
      <Container size="default">
        <ScrollReveal>
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow={copy.result.eyebrow}
              title={copy.result.title}
            />
            <span
              className={`w-fit rounded-full px-4 py-2 text-xs font-bold ${isCancelled ? "bg-red-50 text-red-700" : "bg-[#e9f7ef] text-emerald-700"}`}
            >
              {isCancelled
                ? copy.statuses.cancelled
                : labelFrom(copy.orderStatusLabels, result.orderStatus)}
            </span>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="rounded-[2rem] border border-[#dce8f2] bg-[#f8fbfe] p-6 sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <ResultDatum
                  label={copy.result.orderCode}
                  value={result.orderCode}
                  mono
                />
                <ResultDatum
                  label={copy.result.customer}
                  value={
                    result.customerName ||
                    result.maskedPhone ||
                    copy.result.hiddenCustomer
                  }
                />
                <ResultDatum
                  label={copy.result.orderDate}
                  value={formatDate(result.createdAt, locale)}
                />
                <ResultDatum
                  label={copy.result.total}
                  value={formatCurrency(result.totalAmount, {
                    locale: LOCALE_FORMATS[locale],
                  })}
                  strong
                />
                <ResultDatum
                  label={copy.result.currentStatus}
                  value={labelFrom(copy.orderStatusLabels, result.orderStatus)}
                />
                <ResultDatum
                  label={copy.result.paymentStatus}
                  value={labelFrom(
                    copy.paymentStatusLabels,
                    String(result.paymentStatus),
                  )}
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#dce8f2] bg-white p-6 sm:p-8">
              <h3 className="flex items-center gap-2 text-base font-bold text-[#10233f]">
                <MapPin className="h-5 w-5 text-[#168fce]" />
                {copy.result.delivery}
              </h3>
              <div className="mt-5 space-y-4">
                <ResultDatum
                  label={copy.result.estimatedDelivery}
                  value={formatDate(
                    result.estimatedDelivery || result.receiveDate,
                    locale,
                  )}
                  compact
                />
                <ResultDatum
                  label={copy.result.provider}
                  value={
                    result.shippingProvider
                      ? labelFrom(copy.shippingLabels, result.shippingProvider)
                      : copy.result.noData
                  }
                  compact
                />
                <ResultDatum
                  label={copy.result.trackingCode}
                  value={result.trackingCode || copy.result.noData}
                  compact
                  mono
                />
                <ResultDatum
                  label={copy.result.note}
                  value={result.notes || copy.result.noData}
                  compact
                />
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[2rem] border border-[#dce8f2] bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-bold text-[#10233f]">
                {copy.result.currentStatus}
              </h3>
              {latestHistory ? (
                <span className="text-xs text-slate-400">
                  {formatDate(latestHistory.createdAt, locale)}
                </span>
              ) : null}
            </div>
            <div className="relative mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-7 lg:gap-2">
              <div className="absolute left-[7%] right-[7%] top-6 hidden h-1 rounded-full bg-slate-100 lg:block">
                {!isCancelled ? (
                  <div
                    className="h-full rounded-full bg-[#36a1d8] transition-all duration-700"
                    style={{ width: `${(progressIndex / 6) * 100}%` }}
                  />
                ) : null}
              </div>
              {copy.statuses.items.map((step, index) => {
                const done = !isCancelled && index < progressIndex;
                const current = !isCancelled && index === progressIndex;
                return (
                  <div
                    key={step.key}
                    className="relative z-10 flex items-center gap-3 lg:block lg:text-center"
                  >
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-bold transition-all lg:mx-auto ${done ? "border-[#36a1d8] bg-[#36a1d8] text-white" : current ? "border-[#36a1d8] bg-white text-[#168fce] ring-4 ring-[#dff2ff]" : "border-slate-200 bg-white text-slate-400"}`}
                    >
                      {done ? <Check className="h-5 w-5" /> : index + 1}
                    </span>
                    <span
                      className={`text-xs font-semibold ${done || current ? "text-[#10233f]" : "text-slate-400"} lg:mt-3 lg:block`}
                    >
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
            {latestHistory?.note ? (
              <p className="mt-8 rounded-2xl bg-[#f3f8fc] px-4 py-3 text-sm text-slate-600">
                <strong className="text-[#10233f]">
                  {copy.result.latestUpdate}:{" "}
                </strong>
                {latestHistory.note}
              </p>
            ) : null}
          </div>

          <div className="mt-5 rounded-[2rem] border border-[#dce8f2] bg-white p-6 sm:p-8">
            <h3 className="text-base font-bold text-[#10233f]">
              {copy.result.products}
            </h3>
            <div className="mt-5 divide-y divide-slate-100">
              {result.items.length > 0 ? (
                result.items.map((item, index) => (
                  <div
                    key={`${item.productName}-${index}`}
                    className="flex items-start justify-between gap-5 py-4 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#10233f]">
                        {item.productName}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>
                          {copy.result.quantity}: {item.quantity}
                        </span>
                        {item.frameSizeLabel ? (
                          <span>{item.frameSizeLabel}</span>
                        ) : null}
                        {item.frameColorName ? (
                          <span>{item.frameColorName}</span>
                        ) : null}
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-[#168fce]">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-slate-500">
                  {copy.result.noData}
                </p>
              )}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={ROUTES.contact}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#168fce] px-5 text-sm font-bold text-white hover:bg-[#087ab7]"
            >
              {copy.result.contact}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={ROUTES.collection}
              className="inline-flex h-11 items-center rounded-full border border-[#cfe2ef] bg-white px-5 text-sm font-bold text-[#10233f] hover:border-[#8ec7e7]"
            >
              {copy.result.collection}
            </Link>
            <Link
              href={ROUTES.home}
              className="inline-flex h-11 items-center px-3 text-sm font-semibold text-slate-500 hover:text-[#087ab7]"
            >
              {copy.result.home}
            </Link>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
};

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-3 text-balance text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-[1.12] tracking-[-0.03em] text-[#10233f]">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function ResultDatum({
  label,
  value,
  mono = false,
  strong = false,
  compact = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  strong?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
          : ""
      }
    >
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-slate-400">
        {label}
      </p>
      <p
        className={`${compact ? "max-w-[62%] text-right" : "mt-1.5"} ${mono ? "font-mono" : ""} ${strong ? "text-xl text-[#168fce]" : "text-sm text-[#10233f]"} font-bold`}
      >
        {value}
      </p>
    </div>
  );
}

function TrackingFallback() {
  const { dictionary } = useI18n();

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#f7faff]">
      <LoaderCircle
        className="h-7 w-7 animate-spin text-[#168fce]"
        aria-label={dictionary.common.loading}
      />
    </main>
  );
}

export function LookupPage() {
  return (
    <Suspense fallback={<TrackingFallback />}>
      <TrackingPageContent />
    </Suspense>
  );
}
