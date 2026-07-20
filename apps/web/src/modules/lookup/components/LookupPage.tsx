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
  Clock3,
  ExternalLink,
  LoaderCircle,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import { ApiClientError } from "@lego-shop/api";
import {
  formatCurrency,
  type TrackOrderResponseContract,
} from "@lego-shop/shared";

import { Container } from "@/components/layout/Container";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { ROUTES } from "@/config/routes";
import { useI18n } from "@/lib/i18n/useI18n";
import { publicApiClient } from "@/lib/api/public-client";
import { ORDER_TRACKING_COPY } from "@/modules/lookup/data/order-tracking.translations";

const FLUENT_ICONS = {
  package: "/assets/icons/fluent-emoji/package-3d.png",
  receipt: "/assets/icons/fluent-emoji/receipt-3d.png",
  search: "/assets/icons/fluent-emoji/receipt-3d.png",
  truck: "/assets/icons/fluent-emoji/delivery-truck-3d.png",
  check: "/assets/icons/fluent-emoji/check-mark-3d.png",
  envelope: "/assets/icons/fluent-emoji/envelope-3d.png",
  phone: "/assets/icons/fluent-emoji/telephone-receiver-3d.png",
  gift: "/assets/icons/fluent-emoji/wrapped-gift-3d.png",
  calendar: "/assets/icons/fluent-emoji/calendar-3d.png",
  shield: "/assets/icons/fluent-emoji/shield-3d.png",
} as const;

type Feedback = { tone: "error" | "success"; message: string };
type TrackingCopy =
  (typeof ORDER_TRACKING_COPY)[keyof typeof ORDER_TRACKING_COPY];

const GUIDE_ICONS = [
  FLUENT_ICONS.search,
  FLUENT_ICONS.receipt,
  FLUENT_ICONS.truck,
];
const STATUS_ICONS = [
  FLUENT_ICONS.receipt,
  FLUENT_ICONS.shield,
  FLUENT_ICONS.search,
  FLUENT_ICONS.gift,
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

  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
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
  const { locale } = useI18n();
  const copy = ORDER_TRACKING_COPY[locale];
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

  useEffect(() => {
    if (!result) return;

    const frame = window.requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [result]);

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
      <section className="relative overflow-hidden pb-14 pt-10 lg:pb-16 lg:pt-14">
        <div className="pointer-events-none absolute -left-28 top-8 h-80 w-80 rounded-full bg-[#dceeff]/70 blur-2xl" />
        <div className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-[#fff0b8]/70 blur-2xl" />
        <Container
          size="wide"
          className="relative grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14"
        >
          <ScrollReveal variant="slideLeft" className="max-w-2xl">
            <Eyebrow>{copy.hero.eyebrow}</Eyebrow>
            <h1 className="mt-5 max-w-[13ch] text-balance text-[clamp(2.75rem,5.4vw,5.3rem)] font-bold leading-[0.98] tracking-[-0.055em] text-[#0c213d]">
              {copy.hero.title}
            </h1>
            <p className="mt-6 max-w-xl text-[1.02rem] leading-8 text-slate-600 sm:text-lg">
              {copy.hero.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3">
              {copy.hero.trust.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fff2bd] text-[#9f7100]">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </span>
                  {item}
                </span>
              ))}
            </div>
            <a
              href="#lookup-form"
              className="group mt-8 inline-flex h-12 items-center gap-3 rounded-full bg-[#168fce] px-6 text-sm font-bold text-white shadow-[0_12px_28px_-18px_rgba(0,119,182,0.85)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#087ab7] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 motion-reduce:transform-none"
            >
              {copy.lookup.submit}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none" />
            </a>
          </ScrollReveal>

          <ScrollReveal variant="slideRight" delay={0.08}>
            <div className="relative mx-auto max-w-[650px] rounded-[2.2rem] border border-white/80 bg-white/72 p-4 shadow-[0_28px_70px_-42px_rgba(16,35,63,0.42)] backdrop-blur sm:p-6">
              <div className="relative min-h-[390px] overflow-hidden rounded-[1.75rem] bg-[linear-gradient(145deg,#eaf6ff_0%,#f8fbff_54%,#fff7d8_100%)] p-5 sm:min-h-[430px] sm:p-8">
                <div className="absolute right-5 top-5 rotate-6 rounded-2xl border border-white bg-white/90 p-3 shadow-sm motion-safe:animate-[float_5s_ease-in-out_infinite]">
                  <FluentIcon
                    src={FLUENT_ICONS.package}
                    className="h-14 w-14"
                  />
                </div>
                <div className="absolute bottom-8 left-6 -rotate-6 rounded-2xl border border-white bg-white/90 p-3 shadow-sm motion-safe:animate-[float_6s_ease-in-out_infinite_reverse]">
                  <FluentIcon src={FLUENT_ICONS.truck} className="h-12 w-12" />
                </div>

                <div className="relative mx-auto mt-10 max-w-[410px] rounded-[1.75rem] border border-[#d8e9f7] bg-white p-5 shadow-[0_22px_55px_-38px_rgba(16,35,63,0.5)] sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-400">
                        {copy.result.orderCode}
                      </span>
                      <p className="mt-1 font-mono text-sm font-bold tracking-[0.12em] text-[#10233f] sm:text-base">
                        {copy.hero.visualCode}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#e8f7ef] px-3 py-1.5 text-xs font-bold text-emerald-700">
                      04 / 07
                    </span>
                  </div>
                  <div className="mt-8 flex justify-between">
                    {[
                      FLUENT_ICONS.receipt,
                      FLUENT_ICONS.search,
                      FLUENT_ICONS.gift,
                      FLUENT_ICONS.truck,
                    ].map((icon, index) => (
                      <div
                        key={icon}
                        className="relative z-10 flex flex-col items-center"
                      >
                        <span
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${index <= 2 ? "border-[#b9dcf2] bg-[#eef8ff]" : "border-slate-200 bg-white"}`}
                        >
                          <FluentIcon src={icon} className="h-7 w-7" />
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="relative -mt-6 h-px bg-slate-200">
                    <div className="h-full w-[68%] bg-[#2f9bd4]" />
                  </div>
                  <div className="mt-9 rounded-2xl bg-[#f5f9fd] p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                        <Clock3 className="h-5 w-5 text-[#168fce]" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[#10233f]">
                          {copy.hero.visualStatus}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {copy.hero.visualHint}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      <section id="lookup-form" className="scroll-mt-28 pb-20">
        <Container size="default">
          <ScrollReveal className="relative overflow-hidden rounded-[2rem] border border-[#d8e9f7] bg-white p-6 shadow-[0_24px_60px_-42px_rgba(16,35,63,0.42)] sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-[#fff4c7]/70" />
            <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <Eyebrow>{copy.lookup.eyebrow}</Eyebrow>
                <h2 className="mt-3 text-2xl font-bold tracking-[-0.035em] text-[#10233f] sm:text-3xl">
                  {copy.lookup.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                  {copy.lookup.description}
                </p>
              </div>
              <ShieldCheck className="hidden h-9 w-9 text-[#168fce] lg:block" />
            </div>

            <form
              onSubmit={handleLookup}
              noValidate
              className="relative mt-7 grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end"
            >
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  {copy.lookup.orderCodeLabel}
                </span>
                <span className="flex h-[52px] items-center rounded-2xl border border-[#d8e5f0] bg-[#fbfdff] px-4 transition focus-within:border-[#5fb5e4] focus-within:ring-4 focus-within:ring-[#dff2ff]">
                  <Search className="mr-3 h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    value={orderCode}
                    onChange={(event) =>
                      setOrderCode(event.target.value.toUpperCase())
                    }
                    placeholder={copy.lookup.orderCodePlaceholder}
                    autoComplete="off"
                    className="h-[52px] min-w-0 flex-1 bg-transparent font-mono text-sm font-semibold uppercase tracking-wide text-[#10233f] outline-none placeholder:font-sans placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400"
                  />
                </span>
                <span className="mt-2 block text-xs leading-5 text-slate-400">
                  {copy.lookup.codeHint}
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  {copy.lookup.phoneLabel}
                </span>
                <span className="flex h-[52px] items-center rounded-2xl border border-[#d8e5f0] bg-[#fbfdff] px-4 transition focus-within:border-[#5fb5e4] focus-within:ring-4 focus-within:ring-[#dff2ff]">
                  <ShieldCheck className="mr-3 h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder={copy.lookup.phonePlaceholder}
                    autoComplete="tel"
                    className="h-[52px] min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#10233f] outline-none placeholder:font-normal placeholder:text-slate-400"
                  />
                </span>
                <span className="mt-2 block text-xs leading-5 text-slate-400">
                  {copy.lookup.phoneHint}
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="group relative mb-7 inline-flex h-[52px] min-w-[180px] items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#168fce] px-6 text-sm font-bold text-white shadow-[0_14px_28px_-20px_rgba(0,119,182,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#087ab7] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 disabled:cursor-wait disabled:opacity-70 motion-reduce:transform-none"
              >
                {loading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {loading ? copy.lookup.submitting : copy.lookup.submit}
                <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-[500%] motion-reduce:hidden" />
              </button>
            </form>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 text-sm">
              <a
                href="#where-code"
                className="font-semibold text-[#087ab7] hover:underline"
              >
                {copy.lookup.forgotCode}
              </a>
              <a
                href="#support"
                className="font-semibold text-slate-500 hover:text-[#087ab7]"
              >
                {copy.lookup.needSupport}
              </a>
            </div>
            <div aria-live="polite" className="mt-4 min-h-6">
              {feedback ? (
                <div
                  className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-medium ${feedback.tone === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}
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
          </ScrollReveal>
        </Container>
      </section>

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
                    Figure Lab
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

      <section className="pb-20">
        <Container size="default">
          <SectionHeading eyebrow={copy.faq.eyebrow} title={copy.faq.title} />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {copy.faq.items.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-[#dce8f2] bg-white p-5 open:border-[#a9d3eb] open:shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-[#10233f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
                  {item.question}
                  <ChevronDown className="h-4 w-4 shrink-0 text-[#168fce] transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-6 text-slate-500">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>

          <ScrollReveal
            id="support"
            className="mt-10 scroll-mt-28 overflow-hidden rounded-[2rem] bg-[#102c4d] px-6 py-9 text-white sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-12"
          >
            <div className="max-w-2xl">
              <Eyebrow inverse>{copy.support.eyebrow}</Eyebrow>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
                {copy.support.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                {copy.support.description}
              </p>
            </div>
            <Link
              href={ROUTES.contact}
              className="group mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#f6d76b] px-6 text-sm font-bold text-[#10233f] transition hover:-translate-y-0.5 hover:bg-[#ffe38a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 lg:mt-0 motion-reduce:transform-none"
            >
              {copy.support.button}
              <ExternalLink className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" />
            </Link>
          </ScrollReveal>
        </Container>
      </section>

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
                    locale: locale === "vi" ? "vi-VN" : "en-US",
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
      <h2 className="mt-3 text-balance text-[clamp(1.8rem,3.4vw,3.1rem)] font-bold leading-[1.08] tracking-[-0.04em] text-[#10233f]">
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
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#f7faff]">
      <LoaderCircle
        className="h-7 w-7 animate-spin text-[#168fce]"
        aria-label="Loading"
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
