"use client";

import type {
  ApplyVoucherResponseContract,
  CartQuoteItemResponseContract,
  CheckoutSettingsContract,
  CreateOrderRequestContract,
  JsonObject,
} from "@lego-shop/shared";
import { formatCurrency as formatPrice } from "@lego-shop/shared";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  LoaderCircle,
  PackageCheck,
  Pencil,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  ChangeEvent,
  InputHTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { ROUTES } from "@/config/routes";
import { getCartItemParts } from "@/features/cart/cart-parts";
import { useCart } from "@/features/cart/hooks/useCart";
import type { SimpleCartItem } from "@/features/cart/store";
import { publicApiClient } from "@/lib/api/public-client";
import { useI18n } from "@/lib/i18n/useI18n";
import type { CheckoutDictionary } from "@/lib/i18n/dictionaries";
import {
  getDesignCharacterCount,
  getDesignTemplateName,
  isCustomFrameDesignData,
  isPersistableImageUrl,
} from "@/modules/studio/lib/design-data";
import {
  buildCartQuotePayload,
  useCartQuote,
} from "@/modules/cart/hooks/useCartQuote";
import { sanitizeCartText } from "@/modules/cart/lib/cart-display";
import {
  type CartItemImage,
  resolveCartItemImage,
} from "@/modules/cart/lib/cart-image";
import vietnamAddressData from "../data/vietnam-addresses.json";
import { CheckoutSearchableSelect } from "./CheckoutSearchableSelect";

type VietnamWard = { code: number; name: string };
type VietnamDistrict = { code: number; name: string; wards: VietnamWard[] };
type VietnamProvince = {
  code: number;
  name: string;
  districts: VietnamDistrict[];
};
type ShippingMethod = "shop_support" | "self";
type PolaroidOption = "none" | "2" | "4";
type CheckoutPaymentMethod = "COD" | "PAYOS" | "COD_DEPOSIT";
type SubmitStatus = "idle" | "checking" | "creating" | "redirecting";
type FormData = {
  name: string;
  phone: string;
  email: string;
  zalo: string;
  city: string;
  district: string;
  ward: string;
  address: string;
  receiveDate: string;
  note: string;
};
type FormFieldKey = keyof FormData;
type FormErrorCode = keyof CheckoutDictionary["validation"];
type FormErrors = Partial<Record<FormFieldKey, FormErrorCode>>;

const VIETNAM_ADDRESSES = vietnamAddressData as VietnamProvince[];
const CHECKOUT_DRAFT_KEY = "figure-lab-checkout-draft-v1";
const CHECKOUT_FORM_ID = "figure-lab-checkout-form";
const INITIAL_FORM: FormData = {
  name: "",
  phone: "",
  email: "",
  zalo: "",
  city: "",
  district: "",
  ward: "",
  address: "",
  receiveDate: "",
  note: "",
};

function clearFormErrors(current: FormErrors, keys: FormFieldKey[]) {
  const next = { ...current };
  keys.forEach((key) => delete next[key]);
  return next;
}

const EMOJI_PATHS = {
  recipient: "/assets/icons/fluent-emoji/identification-card-3d.png",
  address: "/assets/icons/fluent-emoji/office-building-3d.png",
  delivery: "/assets/icons/fluent-emoji/delivery-truck-3d.png",
  gift: "/assets/icons/fluent-emoji/wrapped-gift-3d.png",
  note: "/assets/icons/fluent-emoji/receipt-3d.png",
  shield: "/assets/icons/fluent-emoji/shield-3d.png",
  package: "/assets/icons/fluent-emoji/package-3d.png",
  check: "/assets/icons/fluent-emoji/check-mark-3d.png",
  camera: "/assets/icons/fluent-emoji/camera-3d.png",
  calendar: "/assets/icons/fluent-emoji/calendar-3d.png",
} as const;

function FluentEmoji({
  name,
  className = "h-10 w-10",
}: {
  name: keyof typeof EMOJI_PATHS;
  className?: string;
}) {
  return (
    // These tiny local emoji assets are decorative and do not benefit from
    // Next Image's responsive optimization pipeline.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={EMOJI_PATHS[name]}
      alt=""
      aria-hidden="true"
      className={`${className} shrink-0 object-contain`}
    />
  );
}

function normalizeVietnamesePhone(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const hasInternationalPrefix = trimmed.startsWith("+84");
  const digits = trimmed.replace(/\D/g, "");
  const normalized = hasInternationalPrefix
    ? `0${digits.slice(2)}`
    : digits.startsWith("84")
      ? `0${digits.slice(2)}`
      : digits;
  return /^(?:0[35789]\d{8}|02\d{8,9})$/.test(normalized) ? normalized : "";
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getCartItemFrameOptionId(item: SimpleCartItem) {
  const framePartId = getCartItemParts(item).find(
    (part) => part.type === "frame" && part.id,
  )?.id;
  if (framePartId) return framePartId;
  return (
    item.frameOptionId ??
    item.frameSizeId ??
    readString(item.designData?.frameOptionId) ??
    (item.designData?.type === "RETAIL_ITEM" &&
    item.designData.retailType === "frame"
      ? readString(item.designData.sourceId)
      : undefined)
  );
}

function getCartItemBackgroundId(item: SimpleCartItem) {
  return (
    readString(item.designData?.backgroundId) ??
    (item.designData?.type === "RETAIL_ITEM" &&
    item.designData.retailType === "background"
      ? readString(item.designData.sourceId)
      : undefined)
  );
}

function getEditDesignHref(item: SimpleCartItem) {
  const params = new URLSearchParams({ editCartItemId: item.id });
  if (item.frameSizeLabel) params.set("frameLabel", item.frameSizeLabel);
  if (item.frameColorName) params.set("frameColor", item.frameColorName);
  return `${ROUTES.studio}?${params.toString()}`;
}

function hasUnpersistedDesignImage(item: SimpleCartItem) {
  if (!isCustomFrameDesignData(item.designData)) return false;
  const previewUrl = item.previewUrl ?? readString(item.designData.previewUrl);
  if (!isPersistableImageUrl(previewUrl)) return true;
  return item.designData.uploadedImages.some(
    (image) => !isPersistableImageUrl(image.url),
  );
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function handleRadioKeyDown<T extends string>(
  event: ReactKeyboardEvent<HTMLButtonElement>,
  values: readonly T[],
  currentValue: T,
  onChange: (value: T) => void,
) {
  if (values.length === 0) return;
  const key = event.key;
  if (
    ![
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ].includes(key)
  ) {
    return;
  }

  event.preventDefault();
  const currentIndex = Math.max(0, values.indexOf(currentValue));
  const nextIndex =
    key === "Home"
      ? 0
      : key === "End"
        ? values.length - 1
        : key === "ArrowLeft" || key === "ArrowUp"
          ? (currentIndex - 1 + values.length) % values.length
          : (currentIndex + 1) % values.length;
  const nextValue = values[nextIndex];
  if (!nextValue) return;

  const group = event.currentTarget.closest('[role="radiogroup"]');
  onChange(nextValue);
  window.requestAnimationFrame(() => {
    group
      ?.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)')
      [nextIndex]?.focus();
  });
}

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: keyof typeof EMOJI_PATHS;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="scroll-mt-24 rounded-[22px] border border-[#dfe8ef] bg-white p-5 shadow-[0_16px_42px_-34px_rgba(20,49,71,0.28)] transition-[border-color,box-shadow] duration-200 hover:border-[#cfdee9] hover:shadow-[0_20px_46px_-32px_rgba(20,49,71,0.34)] motion-reduce:transition-none sm:p-6 lg:p-7">
      <header className="mb-5 flex items-center gap-3.5 sm:mb-6">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[15px] bg-[#eef8fd] ring-1 ring-[#dceef8]">
          <FluentEmoji name={icon} className="h-8 w-8" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

function InputField({
  id,
  label,
  error,
  hint,
  required,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
}) {
  return (
    <Input
      id={id}
      label={label}
      required={required}
      error={error}
      hint={hint}
      containerClassName={className}
      className="text-[15px]"
      {...props}
    />
  );
}

function TextareaField({
  id,
  label,
  hint,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label?: string | undefined;
  hint?: string | undefined;
}) {
  return (
    <Textarea
      id={id}
      label={label}
      hint={hint}
      className="min-h-24 max-h-[150px] resize-none overflow-y-auto text-[15px] font-medium"
      {...props}
    />
  );
}

function ProductImage({
  image,
  alt,
  onClick,
}: {
  image: CartItemImage | null;
  alt: string;
  onClick?: (() => void) | undefined;
}) {
  const content = (
    <span className="relative block h-16 w-16 overflow-hidden rounded-[14px] border border-[#dde7ee] bg-[#f3f7fa]">
      <PackageCheck className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-slate-300" />
      {image ? (
        // Cart previews may come from data/blob/API URLs and need a native
        // error fallback, so they intentionally bypass next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.src}
          alt={alt}
          className={`absolute inset-0 h-full w-full ${
            image.fit === "contain" ? "object-contain p-1" : "object-cover"
          }`}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : null}
    </span>
  );
  return onClick && image ? (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[#2f91d0] focus-visible:ring-offset-2"
    >
      {content}
    </button>
  ) : (
    <span className="shrink-0">{content}</span>
  );
}

function SummaryRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 text-sm ${
        accent ? "font-semibold text-[#1673ab]" : "text-slate-600"
      }`}
    >
      <span>{label}</span>
      <span className="shrink-0 text-right font-semibold text-slate-950 tabular-nums">
        {value}
      </span>
    </div>
  );
}

export default function ProfessionalCheckoutPage() {
  const {
    items,
    totalAmount,
    itemCount,
    hasHydrated,
    isEmpty,
    clearCart,
    removeItem,
    updateItemNote,
    updateQuotedPrices,
  } = useCart();
  const { dictionary } = useI18n();
  const copy = dictionary.checkout;
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const submitLockRef = useRef(false);
  const checkoutAttemptRef = useRef("");
  const carriedVoucherRef = useRef(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [settings, setSettings] = useState<CheckoutSettingsContract | null>(
    null,
  );
  const [settingsError, setSettingsError] = useState(false);
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod>("shop_support");
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>("PAYOS");
  const [giftPackage, setGiftPackage] = useState(false);
  const [polaroid, setPolaroid] = useState<PolaroidOption>("none");
  const [discountCode, setDiscountCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] =
    useState<ApplyVoucherResponseContract | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<SimpleCartItem | null>(null);
  const [confirmedPriceSignature, setConfirmedPriceSignature] = useState("");
  const [manualPriceChanges, setManualPriceChanges] = useState<
    Record<string, CartQuoteItemResponseContract>
  >({});

  useEffect(() => {
    if (
      carriedVoucherRef.current ||
      !hasHydrated ||
      isEmpty ||
      typeof window === "undefined"
    ) {
      return;
    }

    carriedVoucherRef.current = true;
    const code = new URLSearchParams(window.location.search)
      .get("voucher")
      ?.trim();
    if (!code) return;

    let cancelled = false;
    window.queueMicrotask(() => {
      if (cancelled) return;
      setDiscountCode(code);
      setVoucherLoading(true);
      setVoucherError(null);
      publicApiClient.public
        .applyVoucher({ code, orderAmount: totalAmount })
        .then((voucher) => {
          if (cancelled) return;
          setAppliedVoucher(voucher);
          setDiscountCode(voucher.code);
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          setAppliedVoucher(null);
          setVoucherError(
            error instanceof Error
              ? error.message
              : copy.validation.submitFailed,
          );
        })
        .finally(() => {
          if (!cancelled) setVoucherLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [copy.validation.submitFailed, hasHydrated, isEmpty, totalAmount]);

  useEffect(() => {
    let cancelled = false;
    publicApiClient.public
      .getCheckoutSettings()
      .then((nextSettings) => {
        if (cancelled) return;
        setSettings(nextSettings);
        setSettingsError(false);
        if (nextSettings.payment.codDepositEnabled) {
          setPaymentMethod("COD_DEPOSIT");
        } else if (nextSettings.payment.payosEnabled) {
          setPaymentMethod("PAYOS");
        } else if (nextSettings.payment.codEnabled) {
          setPaymentMethod("COD");
        }
        setShippingMethod((current) =>
          nextSettings.shippingMethods.includes(current)
            ? current
            : (nextSettings.shippingMethods[0] ?? "shop_support"),
        );
      })
      .catch(() => {
        if (!cancelled) setSettingsError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
    window.queueMicrotask(() => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as {
            version?: number;
            formData?: Partial<FormData>;
            shippingMethod?: ShippingMethod;
            paymentMethod?: CheckoutPaymentMethod;
            giftPackage?: boolean;
            polaroid?: PolaroidOption;
            checkoutAttemptId?: string;
          };
          if (parsed.version === 1) {
            setFormData({ ...INITIAL_FORM, ...parsed.formData });
            if (parsed.shippingMethod) setShippingMethod(parsed.shippingMethod);
            if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
            if (typeof parsed.giftPackage === "boolean") {
              setGiftPackage(parsed.giftPackage);
            }
            if (parsed.polaroid) setPolaroid(parsed.polaroid);
            checkoutAttemptRef.current = parsed.checkoutAttemptId ?? "";
          }
        } catch {
          window.sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
        }
      }
      setDraftReady(true);
    });
  }, []);

  useEffect(() => {
    if (!draftReady || typeof window === "undefined") return;
    window.sessionStorage.setItem(
      CHECKOUT_DRAFT_KEY,
      JSON.stringify({
        version: 1,
        formData,
        shippingMethod,
        paymentMethod,
        giftPackage,
        polaroid,
        checkoutAttemptId: checkoutAttemptRef.current,
      }),
    );
  }, [
    draftReady,
    formData,
    giftPackage,
    paymentMethod,
    polaroid,
    shippingMethod,
  ]);

  const backendPaymentMethod: "COD" | "PAYOS" =
    paymentMethod === "PAYOS" ? "PAYOS" : "COD";
  const appliedVoucherCode = appliedVoucher?.code;
  const quoteOptions = useMemo(
    () => ({
      shippingMethod,
      paymentMethod: backendPaymentMethod,
      giftPackage,
      polaroidOption: polaroid,
      ...(appliedVoucherCode ? { voucherCode: appliedVoucherCode } : {}),
    }),
    [
      appliedVoucherCode,
      backendPaymentMethod,
      giftPackage,
      polaroid,
      shippingMethod,
    ],
  );
  const {
    quote,
    status: quoteStatus,
    retry,
    priceChanges,
    isCheckoutReady,
  } = useCartQuote(items, hasHydrated, updateQuotedPrices, quoteOptions);

  const selectedProvince = useMemo(
    () =>
      VIETNAM_ADDRESSES.find((province) => province.name === formData.city) ??
      null,
    [formData.city],
  );
  const districtOptions = useMemo(
    () => selectedProvince?.districts ?? [],
    [selectedProvince],
  );
  const selectedDistrict = useMemo(
    () =>
      districtOptions.find((district) => district.name === formData.district) ??
      null,
    [districtOptions, formData.district],
  );
  const wardOptions = selectedDistrict?.wards ?? [];
  const minimumDate = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + (settings?.minimumReceiveDateDays ?? 0));
    return formatLocalDate(date);
  }, [settings?.minimumReceiveDateDays]);
  const noteLimit = settings?.orderNoteMaxLength ?? 500;

  const activePriceChanges = useMemo(() => {
    const activeIds = new Set(items.map((item) => item.id));
    return Object.fromEntries(
      Object.entries({ ...priceChanges, ...manualPriceChanges }).filter(
        ([id]) => activeIds.has(id),
      ),
    );
  }, [items, manualPriceChanges, priceChanges]);
  const priceChangeSignature = Object.values(activePriceChanges)
    .map(
      (item) =>
        `${item.cartItemId}:${item.previousUnitPrice}:${item.unitPrice}`,
    )
    .sort()
    .join("|");
  const priceConfirmed =
    Boolean(priceChangeSignature) &&
    confirmedPriceSignature === priceChangeSignature;

  const quoteItemById = useMemo(
    () => new Map(quote?.items.map((item) => [item.cartItemId, item]) ?? []),
    [quote?.items],
  );
  // Totals displayed and submitted from this point forward are exclusively
  // based on the latest backend quote. Cart snapshots are never treated as a
  // final checkout price.
  const subtotal = quote?.subtotal ?? 0;
  const giftFee = quote?.giftFee ?? 0;
  const polaroidFee = quote?.polaroidFee ?? 0;
  const discount = quote?.discount ?? 0;
  const finalTotal = quote?.total ?? 0;
  const depositPercent = settings?.payment.codDepositPercent ?? 0;
  const amountToPay =
    paymentMethod === "COD_DEPOSIT"
      ? Math.round(finalTotal * (depositPercent / 100))
      : paymentMethod === "PAYOS"
        ? finalTotal
        : 0;

  const paymentOptions = useMemo(() => {
    if (!settings) return [];
    const options: Array<{
      id: CheckoutPaymentMethod;
      label: string;
      detail: string;
      amount: string;
    }> = [];
    if (settings.payment.codDepositEnabled) {
      options.push({
        id: "COD_DEPOSIT",
        label: `${copy.payment.COD_DEPOSIT.label} ${depositPercent}%`,
        detail: copy.payment.COD_DEPOSIT.detail,
        amount: formatPrice(Math.round(finalTotal * (depositPercent / 100))),
      });
    }
    if (settings.payment.payosEnabled) {
      options.push({
        id: "PAYOS",
        label: copy.payment.PAYOS.label,
        detail: copy.payment.PAYOS.detail,
        amount: formatPrice(finalTotal),
      });
    }
    if (settings.payment.codEnabled && !settings.payment.codDepositEnabled) {
      options.push({
        id: "COD",
        label: copy.payment.COD.label,
        detail: copy.payment.COD.detail,
        amount: copy.onDelivery,
      });
    }
    return options;
  }, [copy.onDelivery, copy.payment, depositPercent, finalTotal, settings]);

  const validateField = (
    key: FormFieldKey,
    data = formData,
  ): FormErrorCode | undefined => {
    const value = data[key].trim();
    if (key === "name" && value.length < 2) return "requiredName";
    if (key === "phone" && !normalizeVietnamesePhone(value)) {
      return "requiredPhone";
    }
    if (key === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "invalidEmail";
    }
    if (key === "city" && !value) return "requiredProvince";
    if (key === "district" && !value) return "requiredDistrict";
    if (key === "ward" && !value) return "requiredWard";
    if (key === "address" && value.length < 4) {
      return "requiredAddress";
    }
    if (key === "receiveDate" && value && value < minimumDate) {
      return "invalidDate";
    }
    return undefined;
  };
  const getErrorMessage = (key: FormFieldKey) => {
    if (!hasSubmitted) return undefined;
    const code = errors[key];
    return code ? copy.validation[code] : undefined;
  };

  const validateForm = () => {
    setHasSubmitted(true);
    const keys: FormFieldKey[] = [
      "name",
      "phone",
      "email",
      "city",
      "district",
      "ward",
      "address",
      "receiveDate",
    ];
    const nextErrors: FormErrors = {};
    keys.forEach((key) => {
      const error = validateField(key);
      if (error) nextErrors[key] = error;
    });
    setErrors(nextErrors);
    const firstInvalid = keys.find((key) => nextErrors[key]);
    if (firstInvalid) {
      window.requestAnimationFrame(() => {
        document.getElementById(`checkout-${firstInvalid}`)?.focus();
      });
    }
    return Object.keys(nextErrors).length === 0;
  };

  const updateField =
    (key: FormFieldKey) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormData((current) => ({ ...current, [key]: value }));
      if (errors[key]) {
        setErrors((current) => clearFormErrors(current, [key]));
      }
    };

  const blurField = (key: FormFieldKey) => {
    if (!hasSubmitted) return;
    const error = validateField(key);
    setErrors((current) =>
      error ? { ...current, [key]: error } : clearFormErrors(current, [key]),
    );
  };

  const changeAddress = (key: "city" | "district" | "ward", value: string) => {
    setFormData((current) => {
      if (key === "city") {
        return { ...current, city: value, district: "", ward: "" };
      }
      if (key === "district") return { ...current, district: value, ward: "" };
      return { ...current, ward: value };
    });
    setErrors((current) =>
      clearFormErrors(
        current,
        key === "city"
          ? ["city", "district", "ward"]
          : key === "district"
            ? ["district", "ward"]
            : ["ward"],
      ),
    );
  };

  const handleApplyVoucher = async () => {
    const code = discountCode.trim();
    if (!code || voucherLoading) return;
    setVoucherLoading(true);
    setVoucherError(null);
    try {
      const voucher = await publicApiClient.public.applyVoucher({
        code,
        orderAmount: subtotal + giftFee + polaroidFee,
      });
      setAppliedVoucher(voucher);
      setDiscountCode(voucher.code);
    } catch (error) {
      setAppliedVoucher(null);
      setVoucherError(
        error instanceof Error ? error.message : copy.validation.submitFailed,
      );
    } finally {
      setVoucherLoading(false);
    }
  };

  const getCheckoutAttemptId = () => {
    if (!checkoutAttemptRef.current) {
      checkoutAttemptRef.current = crypto.randomUUID();
      if (typeof window !== "undefined") {
        const current = window.sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
        try {
          const parsed = current
            ? (JSON.parse(current) as Record<string, unknown>)
            : {};
          window.sessionStorage.setItem(
            CHECKOUT_DRAFT_KEY,
            JSON.stringify({
              ...parsed,
              version: 1,
              checkoutAttemptId: checkoutAttemptRef.current,
            }),
          );
        } catch {
          window.sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
        }
      }
    }
    return checkoutAttemptRef.current;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitLockRef.current || submitStatus !== "idle") return;
    setSubmitError(null);
    if (!validateForm()) return;
    if (items.some(hasUnpersistedDesignImage)) {
      setSubmitError(copy.validation.temporaryImage);
      return;
    }
    if (!isCheckoutReady || !quote?.valid) {
      setSubmitError(copy.quoteError);
      retry();
      return;
    }
    if (priceChangeSignature && !priceConfirmed) {
      setSubmitError(copy.priceChangeDescription);
      document.getElementById("checkout-price-change")?.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
        block: "center",
      });
      return;
    }

    submitLockRef.current = true;
    setSubmitStatus("checking");
    try {
      const revalidated = await publicApiClient.public.quoteCart(
        buildCartQuotePayload(items, quoteOptions),
      );
      if (!revalidated.valid) {
        setSubmitError(copy.invalidItem);
        retry();
        return;
      }
      const changed = Object.fromEntries(
        revalidated.items
          .filter((item) =>
            item.warnings.some((warning) => warning.code === "PRICE_CHANGED"),
          )
          .map((item) => [item.cartItemId, item]),
      );
      if (Object.keys(changed).length > 0) {
        setManualPriceChanges((current) => ({ ...current, ...changed }));
        updateQuotedPrices(
          Object.fromEntries(
            revalidated.items
              .filter((item) => item.valid)
              .map((item) => [item.cartItemId, item.unitPrice]),
          ),
        );
        setConfirmedPriceSignature("");
        setSubmitError(copy.priceChangeDescription);
        retry();
        return;
      }

      setSubmitStatus("creating");
      const phone = normalizeVietnamesePhone(formData.phone);
      const email = formData.email.trim();
      const fullAddress = [
        formData.address,
        formData.ward,
        formData.district,
        formData.city,
      ]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(", ");
      const payload: CreateOrderRequestContract = {
        checkoutAttemptId: getCheckoutAttemptId(),
        customerName: formData.name.trim(),
        phone,
        customerPhone: phone,
        address: fullAddress,
        addressLine: formData.address.trim(),
        province: formData.city,
        city: formData.city,
        district: formData.district,
        ward: formData.ward,
        ...(email ? { email, customerEmail: email } : {}),
        ...(formData.zalo.trim() ? { customerZalo: formData.zalo.trim() } : {}),
        ...(formData.receiveDate ? { receiveDate: formData.receiveDate } : {}),
        ...(formData.note.trim() ? { note: formData.note.trim() } : {}),
        shippingMethod,
        ...(appliedVoucher?.code ? { voucherCode: appliedVoucher.code } : {}),
        giftPackage,
        polaroidOption: polaroid,
        paymentMethod: backendPaymentMethod,
        items: items.map((item) => {
          const frameOptionId = getCartItemFrameOptionId(item);
          const backgroundId = getCartItemBackgroundId(item);
          return {
            productName: item.productName,
            quantity: item.quantity,
            price: item.unitPrice,
            ...(item.productId ? { productId: item.productId } : {}),
            ...(frameOptionId
              ? { frameOptionId, frameSizeId: frameOptionId }
              : {}),
            ...(backgroundId ? { backgroundId } : {}),
            ...(item.frameSizeLabel
              ? { frameSizeLabel: item.frameSizeLabel }
              : {}),
            ...(item.frameColorName
              ? { frameColorName: item.frameColorName }
              : {}),
            ...(item.note?.trim() ? { note: item.note.trim() } : {}),
            ...(item.accessories?.length
              ? { accessories: item.accessories }
              : {}),
            designData: item.designData as JsonObject,
            ...(item.previewUrl ? { previewUrl: item.previewUrl } : {}),
          };
        }),
      };

      const data = await publicApiClient.orders.createOrder(payload);
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
      }
      clearCart();
      const redirectUrl = data.checkoutUrl ?? data.paymentUrl;
      if (redirectUrl) {
        setSubmitStatus("redirecting");
        window.location.assign(redirectUrl);
        return;
      }
      router.push(
        `${ROUTES.checkoutSuccess}?orderCode=${encodeURIComponent(data.orderCode || data.orderId)}`,
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : copy.validation.submitFailed,
      );
    } finally {
      submitLockRef.current = false;
      setSubmitStatus((current) =>
        current === "redirecting" ? current : "idle",
      );
    }
  };

  const toggleDetails = (itemId: string) => {
    setExpandedItems((current) =>
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId],
    );
  };

  const ctaLabel =
    paymentMethod === "PAYOS"
      ? copy.payWithPayos
      : paymentMethod === "COD"
        ? copy.placeOrder
        : copy.createOrder;
  const submitLabel =
    submitStatus === "checking"
      ? copy.checking
      : submitStatus === "creating"
        ? copy.processing
        : submitStatus === "redirecting"
          ? copy.redirecting
          : ctaLabel;
  const hasActivePriceChanges = Boolean(priceChangeSignature);
  const hasInvalidOrderTotal =
    quoteStatus === "success" && (!quote?.valid || finalTotal <= 0);
  const placeOrderDisabled =
    submitStatus !== "idle" ||
    quoteStatus !== "success" ||
    !quote?.valid ||
    paymentOptions.length === 0 ||
    (hasActivePriceChanges && !priceConfirmed) ||
    settingsError;

  const renderOrderItems = () => (
    <div className="divide-y divide-[#e7edf2]">
      {items.map((item) => {
        const image = resolveCartItemImage(item);
        const quoteItem = quoteItemById.get(item.id);
        const priceChange = activePriceChanges[item.id];
        const invalid = quoteItem && !quoteItem.valid;
        const expanded = expandedItems.includes(item.id);
        const parts = getCartItemParts(item);
        const templateName = getDesignTemplateName(item.designData);
        const characterCount = getDesignCharacterCount(item.designData);
        const accessoryCount = item.accessories?.reduce(
          (sum, accessory) => sum + (accessory.quantity ?? 1),
          0,
        );
        const configurationParts = [
          item.frameSizeLabel,
          item.frameColorName,
          templateName,
          characterCount > 0
            ? `${characterCount} ${copy.characterShort}`
            : null,
          accessoryCount
            ? `${accessoryCount} ${copy.accessoriesUnit}`
            : null,
        ].filter((value): value is string => Boolean(value));

        return (
          <article key={item.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex gap-3">
              <ProductImage
                image={image}
                alt={sanitizeCartText(item.productName)}
                {...(image ? { onClick: () => setPreviewItem(item) } : {})}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-950">
                      {sanitizeCartText(item.productName)}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {copy.quantity}: {item.quantity}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {priceChange ? (
                      <span className="block text-xs text-slate-400 line-through">
                        {formatPrice(
                          priceChange.previousUnitPrice * priceChange.quantity,
                        )}
                      </span>
                    ) : null}
                    <span className="block text-sm font-semibold text-slate-950 tabular-nums">
                      {formatPrice(quoteItem?.lineTotal ?? 0)}
                    </span>
                  </div>
                </div>
                {configurationParts.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {configurationParts.map((part, index) => (
                      <span
                        key={`${part}-${index}`}
                        className="max-w-full truncate rounded-full border border-[#dce8f0] bg-[#f7fafc] px-2 py-0.5 text-[11px] font-medium text-slate-600"
                      >
                        {part}
                      </span>
                    ))}
                  </div>
                ) : null}
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => toggleDetails(item.id)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#247eB5] outline-none transition hover:text-[#176b9f] focus-visible:ring-2 focus-visible:ring-[#b9def3]"
                >
                  {expanded ? copy.hideDetails : copy.viewDetails}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            </div>

            {invalid ? (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                <p className="font-semibold">{copy.invalidItem}</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {item.designData?.type === "CUSTOM_FRAME" ? (
                    <Link
                      href={getEditDesignHref(item)}
                      className="inline-flex items-center gap-1 font-semibold text-[#176b9f]"
                    >
                      <Pencil className="h-3.5 w-3.5" /> {copy.editDesign}
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="inline-flex items-center gap-1 font-semibold text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> {copy.removeItem}
                  </button>
                </div>
              </div>
            ) : null}

            <AnimatePresence initial={false}>
              {expanded ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-3 rounded-[14px] bg-[#f6f9fb] p-3">
                    {parts.length > 0 ? (
                      <dl className="space-y-1.5 text-xs">
                        {parts.slice(0, 8).map((part, index) => (
                          <div
                            key={`${part.type}-${part.id ?? index}`}
                            className="flex justify-between gap-3"
                          >
                            <dt className="min-w-0 truncate text-slate-500">
                              {sanitizeCartText(part.name)} × {part.quantity}
                            </dt>
                            <dd className="shrink-0 font-medium text-slate-800 tabular-nums">
                              {formatPrice(part.totalPrice)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                        {copy.itemNote}
                      </span>
                      <Textarea
                        rows={2}
                        value={item.note ?? ""}
                        onChange={(event) =>
                          updateItemNote(item.id, event.target.value)
                        }
                        placeholder={copy.itemNotePlaceholder}
                        className="min-h-16 resize-none px-3 py-2 text-xs leading-5"
                        containerClassName="space-y-0"
                      />
                    </label>
                    {item.designData?.type === "CUSTOM_FRAME" ? (
                      <Link
                        href={getEditDesignHref(item)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#247eB5]"
                      >
                        <Pencil className="h-3.5 w-3.5" /> {copy.editDesign}
                      </Link>
                    ) : null}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </article>
        );
      })}
    </div>
  );

  const renderSubmitButton = (mobile = false) => (
    <button
      type="submit"
      form={CHECKOUT_FORM_ID}
      disabled={placeOrderDisabled}
      onClick={() => {
        if (mobile) setSummaryOpen(false);
      }}
      className="group relative mt-4 flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-[15px] bg-[#2488c7] px-4 text-sm font-semibold text-white shadow-[0_12px_30px_-20px_rgba(37,143,206,0.95)] outline-none transition-all duration-300 before:absolute before:inset-y-0 before:left-[-45%] before:w-1/3 before:-skew-x-12 before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent before:transition-transform before:duration-700 hover:-translate-y-0.5 hover:bg-[#1976ae] hover:shadow-[0_16px_30px_-16px_rgba(37,143,206,0.9)] hover:before:translate-x-[430%] focus-visible:ring-4 focus-visible:ring-[#b9def3] active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300 disabled:shadow-none disabled:before:hidden disabled:hover:bg-slate-300"
    >
      {submitStatus !== "idle" ? (
        <LoaderCircle className="relative z-10 h-4 w-4 animate-spin" />
      ) : (
        <PackageCheck
          className="relative z-10 h-[17px] w-[17px] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 group-disabled:rotate-0 group-disabled:scale-100"
          aria-hidden="true"
        />
      )}
      <span className="relative z-10">{submitLabel}</span>
      <ArrowRight
        className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-disabled:translate-x-0"
        aria-hidden="true"
      />
    </button>
  );

  const renderSummaryFooter = (mobile = false) => (
    <div className="shrink-0 border-t border-[#e2eaf0] bg-white px-5 pb-5 pt-4 sm:px-6">
      <div className="space-y-2.5">
        <SummaryRow label={copy.subtotal} value={formatPrice(subtotal)} />
        {giftFee > 0 ? (
          <SummaryRow label={copy.giftFee} value={`+${formatPrice(giftFee)}`} />
        ) : null}
        {polaroidFee > 0 ? (
          <SummaryRow
            label={copy.polaroidFee}
            value={`+${formatPrice(polaroidFee)}`}
          />
        ) : null}
        {discount > 0 ? (
          <SummaryRow
            label={`${copy.discountCode} ${appliedVoucher?.code ?? ""}`}
            value={`−${formatPrice(discount)}`}
          />
        ) : null}
        <SummaryRow label={copy.shippingFee} value={copy.shippingLater} />
      </div>
      <div className="mt-4 flex items-end justify-between gap-4 border-t border-[#e2eaf0] pt-4">
        <span className="text-sm font-semibold text-slate-700">
          {copy.total}
        </span>
        <span className="text-2xl font-semibold tracking-tight text-[#10253f] tabular-nums">
          {formatPrice(finalTotal)}
        </span>
      </div>
      {hasInvalidOrderTotal ? (
        <div className="mt-3 flex gap-2 rounded-[14px] border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{copy.invalidOrderTotal}</span>
        </div>
      ) : null}
      {paymentMethod === "COD_DEPOSIT" ? (
        <div className="mt-2 flex justify-between gap-4 text-xs text-slate-500">
          <span>
            {copy.payNow} ({depositPercent}%)
          </span>
          <span className="font-semibold text-slate-800 tabular-nums">
            {formatPrice(amountToPay)}
          </span>
        </div>
      ) : null}
      {mobile ? (
        <>
          {submitError ? (
            <p role="alert" className="mt-3 text-xs leading-5 text-red-600">
              {submitError}
            </p>
          ) : null}
          {renderSubmitButton(true)}
          <p className="mt-2 text-center text-[11px] leading-4 text-slate-500">
            {copy.consent}
          </p>
        </>
      ) : (
        <>
          <div className="mt-4 flex items-start gap-2.5 rounded-[14px] bg-[#eef8fd] p-3">
            <FluentEmoji name="shield" className="h-8 w-8" />
            <div>
              <p className="text-xs font-semibold text-slate-800">
                {copy.trustTitle}
              </p>
              <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                {copy.trustDescription}
              </p>
            </div>
          </div>
          {submitError ? (
            <div
              role="alert"
              className="mt-3 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          ) : null}
          {renderSubmitButton()}
          <p className="mt-2 text-center text-[11px] leading-4 text-slate-500">
            {copy.consent}
          </p>
          <Link
            href={ROUTES.cart}
            className="group mt-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-slate-600 transition-[background-color,color,transform] duration-200 hover:-translate-y-px hover:bg-[#f4f8fb] hover:text-[#258fce] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#258fce] focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none"
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
              aria-hidden="true"
            />
            {copy.backToCart}
          </Link>
        </>
      )}
    </div>
  );

  const renderSummaryHeader = (mobile = false) => (
    <div
      className={`shrink-0 border-b border-[#e2eaf0] bg-white px-5 py-4 sm:px-6 ${
        mobile ? "pr-16 sm:pr-16" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FluentEmoji name="package" className="h-8 w-8" />
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">
            {copy.summaryTitle}
          </h2>
        </div>
        <Badge
          variant="highlight"
          size="sm"
          className="h-8 px-3.5 text-xs font-semibold"
        >
          {itemCount} {copy.products}
        </Badge>
      </div>
      {quoteStatus === "loading" ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          {copy.quoteLoading}
        </p>
      ) : quoteStatus === "error" ? (
        <button
          type="button"
          onClick={retry}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600"
        >
          <RefreshCw className="h-3.5 w-3.5" /> {copy.retry}
        </button>
      ) : null}
    </div>
  );
  const previewImage = previewItem ? resolveCartItemImage(previewItem) : null;

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-[#f1f5f8] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-[1380px] animate-pulse">
          <div className="h-7 w-36 rounded-full bg-slate-200" />
          <div className="mt-5 h-11 w-80 max-w-full rounded-xl bg-slate-200" />
          <div className="mt-8 grid gap-7 min-[1120px]:grid-cols-[minmax(0,1.9fr)_minmax(350px,1fr)]">
            <div className="space-y-5">
              {[220, 260, 300].map((height) => (
                <div
                  key={height}
                  style={{ height }}
                  className="rounded-[22px] bg-white shadow-sm"
                />
              ))}
            </div>
            <div className="hidden h-[600px] rounded-[24px] bg-white shadow-sm min-[1120px]:block" />
          </div>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-[#f1f5f8] px-4 py-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl rounded-[24px] border border-[#dfe8ef] bg-white px-6 py-14 text-center shadow-[0_22px_60px_-42px_rgba(20,49,71,0.45)] sm:px-10"
        >
          <FluentEmoji name="package" className="mx-auto h-16 w-16" />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            {copy.emptyTitle}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            {copy.emptyDescription}
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={ROUTES.collection}
              className="inline-flex h-12 items-center justify-center rounded-[14px] border border-[#d8e4ed] bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-[#9bcbe8] hover:text-[#176b9f]"
            >
              {copy.backToCollection}
            </Link>
            <Link
              href={ROUTES.studio}
              className="inline-flex h-12 items-center justify-center rounded-[14px] bg-[#2488c7] px-5 text-sm font-semibold text-white transition hover:bg-[#1976ae]"
            >
              {copy.startDesign}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f8] pb-28 min-[1120px]:pb-14">
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.24 }}
        className="mx-auto w-full max-w-[1380px] px-4 py-7 sm:px-6 sm:py-9 lg:px-8"
      >
        <nav
          aria-label={copy.breadcrumbLabel}
          className="flex items-center gap-1.5 text-xs text-slate-500"
        >
          <Link href="/" className="transition hover:text-[#176b9f]">
            {copy.home}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={ROUTES.cart} className="transition hover:text-[#176b9f]">
            {copy.cart}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-slate-700">{copy.breadcrumb}</span>
        </nav>

        <header className="mt-5 border-b border-[#dbe5ec] pb-7">
          <div className="max-w-2xl">
            <p className="text-[12px] font-semibold tracking-[0.16em] text-[#2488c7] sm:text-[13px]">
              {copy.eyebrow}
            </p>
            <h1 className="mt-2 text-[36px] font-semibold leading-[1.12] tracking-[-0.03em] text-slate-950 sm:text-[42px]">
              {copy.title}
            </h1>
            <p className="mt-2.5 text-[15px] leading-6 text-slate-500 sm:text-base">
              {copy.description}
            </p>
          </div>
        </header>

        {hasActivePriceChanges ? (
          <div
            id="checkout-price-change"
            className="mt-6 flex flex-col gap-4 rounded-[18px] border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-950">
                  {copy.priceChangeTitle}
                </p>
                <p className="mt-1 text-xs leading-5 text-amber-800">
                  {copy.priceChangeDescription}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setConfirmedPriceSignature(priceChangeSignature);
                setSubmitError(null);
              }}
              className={`h-10 shrink-0 rounded-xl border px-4 text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-amber-300 ${
                priceConfirmed
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
              }`}
            >
              {priceConfirmed ? `✓ ${copy.confirmPrice}` : copy.confirmPrice}
            </button>
          </div>
        ) : null}

        <form
          id={CHECKOUT_FORM_ID}
          onSubmit={handleSubmit}
          noValidate
          className="mt-7 grid gap-6 min-[1120px]:grid-cols-[minmax(0,1.9fr)_minmax(350px,1fr)] min-[1120px]:items-start min-[1280px]:gap-7"
        >
          <div className="min-w-0 space-y-5 sm:space-y-6">
            <SectionCard
              icon="recipient"
              title={copy.recipientTitle}
              description={copy.recipientDescription}
            >
              <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                <InputField
                  id="checkout-name"
                  label={copy.name}
                  required
                  placeholder={copy.namePlaceholder}
                  autoComplete="name"
                  value={formData.name}
                  error={getErrorMessage("name")}
                  onChange={updateField("name")}
                  onBlur={() => blurField("name")}
                />
                <InputField
                  id="checkout-phone"
                  label={copy.phone}
                  required
                  type="tel"
                  inputMode="tel"
                  placeholder={copy.phonePlaceholder}
                  autoComplete="tel"
                  value={formData.phone}
                  error={getErrorMessage("phone")}
                  onChange={updateField("phone")}
                  onBlur={() => blurField("phone")}
                />
                <InputField
                  id="checkout-email"
                  label={copy.email}
                  type="email"
                  placeholder={copy.emailPlaceholder}
                  autoComplete="email"
                  value={formData.email}
                  error={getErrorMessage("email")}
                  onChange={updateField("email")}
                  onBlur={() => blurField("email")}
                />
                <InputField
                  id="checkout-zalo"
                  label={copy.zalo}
                  placeholder={copy.zaloPlaceholder}
                  hint={copy.zaloHint}
                  autoComplete="off"
                  value={formData.zalo}
                  onChange={updateField("zalo")}
                />
              </div>
            </SectionCard>

            <SectionCard
              icon="address"
              title={copy.addressTitle}
              description={copy.addressDescription}
            >
              <div className="grid gap-x-4 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
                <CheckoutSearchableSelect
                  id="checkout-city"
                  label={copy.province}
                  placeholder={copy.province}
                  searchPlaceholder={copy.searchPlaceholder}
                  emptyLabel={copy.noOptions}
                  required
                  options={VIETNAM_ADDRESSES.map((province) => ({
                    value: province.name,
                    label: province.name,
                  }))}
                  value={formData.city}
                  error={getErrorMessage("city")}
                  onChange={(value) => changeAddress("city", value)}
                  onBlur={() => blurField("city")}
                />
                <CheckoutSearchableSelect
                  id="checkout-district"
                  label={copy.district}
                  placeholder={copy.district}
                  searchPlaceholder={copy.searchPlaceholder}
                  emptyLabel={copy.noOptions}
                  required
                  disabled={!selectedProvince}
                  options={districtOptions.map((district) => ({
                    value: district.name,
                    label: district.name,
                  }))}
                  value={formData.district}
                  error={getErrorMessage("district")}
                  onChange={(value) => changeAddress("district", value)}
                  onBlur={() => blurField("district")}
                />
                <CheckoutSearchableSelect
                  id="checkout-ward"
                  label={copy.ward}
                  placeholder={copy.ward}
                  searchPlaceholder={copy.searchPlaceholder}
                  emptyLabel={copy.noOptions}
                  required
                  disabled={!selectedDistrict}
                  options={wardOptions.map((ward) => ({
                    value: ward.name,
                    label: ward.name,
                  }))}
                  value={formData.ward}
                  error={getErrorMessage("ward")}
                  onChange={(value) => changeAddress("ward", value)}
                  onBlur={() => blurField("ward")}
                />
              </div>
              <InputField
                id="checkout-address"
                label={copy.address}
                required
                placeholder={copy.addressPlaceholder}
                autoComplete="street-address"
                hint={copy.addressHint}
                value={formData.address}
                error={getErrorMessage("address")}
                onChange={updateField("address")}
                onBlur={() => blurField("address")}
              />
            </SectionCard>

            <SectionCard
              icon="delivery"
              title={copy.deliveryTitle}
              description={copy.deliveryDescription}
            >
              <InputField
                id="checkout-receiveDate"
                label={copy.receiveDate}
                type="date"
                min={minimumDate}
                hint={copy.receiveDateHint(
                  settings?.minimumReceiveDateDays ?? 0,
                )}
                value={formData.receiveDate}
                error={getErrorMessage("receiveDate")}
                onChange={updateField("receiveDate")}
                onBlur={() => blurField("receiveDate")}
              />

              <fieldset className="mt-5 border-t border-[#e4ebf0] pt-5">
                <legend className="mb-3 text-sm font-semibold text-slate-800">
                  {copy.shippingMethod}
                </legend>
                <div
                  role="radiogroup"
                  className="grid auto-rows-fr gap-3 md:grid-cols-2"
                >
                  {(settings?.shippingMethods ?? []).map((id) => {
                    const active = shippingMethod === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setShippingMethod(id)}
                        onKeyDown={(event) =>
                          handleRadioKeyDown(
                            event,
                            settings?.shippingMethods ?? [],
                            id,
                            setShippingMethod,
                          )
                        }
                        className={`flex h-full items-start gap-3 rounded-[16px] border p-4 text-left outline-none transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-[#b9def3] motion-reduce:transform-none motion-reduce:transition-none sm:p-[18px] ${
                          active
                            ? "border-[#2f91d0] bg-[#f0f9fe] shadow-sm"
                            : "border-[#dce6ed] bg-white hover:border-[#9bcbe8]"
                        }`}
                      >
                        <span
                          className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                            active
                              ? "border-[#2f91d0] bg-[#2f91d0] text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {active ? <Check className="h-3 w-3" /> : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-slate-900">
                            {copy.shipping[id].label}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-slate-500">
                            {copy.shipping[id].detail}. {copy.shipping[id].note}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-[#cce7f5] bg-[#eff9fe] p-4">
                <FluentEmoji name="delivery" className="h-9 w-9" />
                <div>
                  <p className="text-sm font-semibold text-[#155f8d]">
                    {copy.shippingNoticeTitle}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#356f91]">
                    {copy.shippingNotice}
                  </p>
                </div>
              </div>

              <fieldset className="mt-5 border-t border-[#e4ebf0] pt-5">
                <legend className="mb-3 text-sm font-semibold text-slate-800">
                  {copy.paymentMethod}
                </legend>
                {settingsError ? (
                  <div className="rounded-[14px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {copy.quoteError}
                  </div>
                ) : paymentOptions.length === 0 ? (
                  <div className="h-24 animate-pulse rounded-[16px] bg-slate-100" />
                ) : (
                  <div
                    role="radiogroup"
                    className="grid auto-rows-fr gap-3 md:grid-cols-2"
                  >
                    {paymentOptions.map((option) => {
                      const active = paymentMethod === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setPaymentMethod(option.id)}
                          onKeyDown={(event) =>
                            handleRadioKeyDown(
                              event,
                              paymentOptions.map((item) => item.id),
                              option.id,
                              setPaymentMethod,
                            )
                          }
                          className={`flex h-full items-start gap-3 rounded-[16px] border p-4 text-left outline-none transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-[#b9def3] motion-reduce:transform-none motion-reduce:transition-none sm:p-[18px] ${
                            active
                              ? "border-[#2f91d0] bg-[#f0f9fe] shadow-sm"
                              : "border-[#dce6ed] bg-white hover:border-[#9bcbe8]"
                          }`}
                        >
                          <span
                            className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                              active
                                ? "border-[#2f91d0] bg-[#2f91d0] text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {active ? <Check className="h-3 w-3" /> : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-slate-900">
                              {option.label}
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-slate-500">
                              {option.detail}
                            </span>
                            <span className="mt-2 block text-xs font-semibold text-[#176b9f]">
                              {option.amount}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </fieldset>
            </SectionCard>

            <SectionCard
              icon="gift"
              title={copy.extrasTitle}
              description={copy.extrasDescription}
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={giftPackage}
                disabled={!settings?.giftPackage.enabled}
                onClick={() => setGiftPackage((current) => !current)}
                className={`flex w-full items-center gap-3 rounded-[16px] border p-4 text-left outline-none transition duration-150 focus-visible:ring-3 focus-visible:ring-[#b9def3] disabled:cursor-not-allowed ${
                  giftPackage
                    ? "border-[#2f91d0] bg-[#f0f9fe]"
                    : "border-[#dce6ed] bg-white hover:border-[#9bcbe8]"
                }`}
              >
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
                    giftPackage
                      ? "border-[#2f91d0] bg-[#2f91d0] text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {giftPackage ? <Check className="h-3.5 w-3.5" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900">
                    {copy.giftWrap}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {copy.giftWrapDescription}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-[#176b9f]">
                  +
                  {formatPrice(
                    (settings?.giftPackage.pricePerItem ?? 0) * itemCount,
                  )}
                </span>
              </button>

              <div className="mt-5 border-t border-[#e4ebf0] pt-5">
                <div className="mb-4 flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[#eef8fd] ring-1 ring-[#dceef8]">
                    <FluentEmoji name="camera" className="h-7 w-7" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {copy.polaroid}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {copy.polaroidDescription}
                    </p>
                  </div>
                </div>
                <div
                  role="radiogroup"
                  className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
                >
                  {(settings?.polaroidOptions ?? []).map((option) => {
                    const active = polaroid === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        disabled={!option.enabled}
                        onClick={() => setPolaroid(option.id)}
                        onKeyDown={(event) =>
                          handleRadioKeyDown(
                            event,
                            (settings?.polaroidOptions ?? [])
                              .filter((item) => item.enabled)
                              .map((item) => item.id),
                            option.id,
                            setPolaroid,
                          )
                        }
                        className={`flex min-h-[68px] items-center justify-between gap-3 rounded-[14px] border px-4 py-3 text-left outline-none transition-[border-color,background-color,box-shadow] duration-200 focus-visible:ring-3 focus-visible:ring-[#b9def3] motion-reduce:transition-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 sm:block sm:px-2 sm:text-center ${
                          active
                            ? "border-[#2f91d0] bg-[#f0f9fe] text-[#176b9f]"
                            : "border-[#dce6ed] bg-white text-slate-700 hover:border-[#9bcbe8]"
                        }`}
                      >
                        <span className="block text-xs font-semibold">
                          {copy.polaroidOptions[option.id]}
                        </span>
                        <span className="mt-1 block text-[11px] tabular-nums">
                          {option.price > 0
                            ? `+${formatPrice(option.price)}`
                            : formatPrice(0)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon="note"
              title={copy.noteTitle}
              description={copy.noteDescription}
            >
              <TextareaField
                id="checkout-note"
                aria-label={copy.noteTitle}
                maxLength={noteLimit}
                value={formData.note}
                onChange={updateField("note")}
                placeholder={copy.notePlaceholder}
                hint={copy.noteCount.replace(
                  "{count}",
                  String(formData.note.length),
                )}
              />
            </SectionCard>
          </div>

          <aside className="sticky top-[calc(var(--site-header-height)_+_16px)] hidden min-w-0 self-start min-[1120px]:block">
            <section className="flex max-h-[calc(100dvh_-_var(--site-header-height)_-_var(--site-header-height)_-_32px)] min-h-[420px] flex-col overflow-hidden rounded-[24px] border border-[#dce6ed] bg-white shadow-[0_26px_70px_-44px_rgba(17,49,72,0.5)]">
              {renderSummaryHeader()}
              {hasActivePriceChanges ? (
                <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-5 py-3 text-xs font-medium leading-5 text-amber-800 sm:px-6">
                  {copy.priceChangeDescription}
                </div>
              ) : null}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 [mask-image:linear-gradient(to_bottom,transparent_0,black_12px,black_calc(100%_-_12px),transparent_100%)] sm:px-6">
                {renderOrderItems()}
              </div>
              <div className="shrink-0 border-t border-[#e2eaf0] px-5 py-4 sm:px-6">
                <label
                  htmlFor="checkout-voucher"
                  className="mb-2 block text-xs font-semibold text-slate-600"
                >
                  {copy.discountCode}
                </label>
                <div className="flex gap-2">
                  <Input
                    id="checkout-voucher"
                    value={discountCode}
                    onChange={(event) => {
                      setDiscountCode(event.target.value.toUpperCase());
                      setAppliedVoucher(null);
                      setVoucherError(null);
                    }}
                    placeholder={copy.discountPlaceholder}
                    className="text-sm font-medium"
                    containerClassName="min-w-0 flex-1 space-y-0"
                    controlSize="compact"
                  />
                  <button
                    type="button"
                    disabled={!discountCode.trim() || voucherLoading}
                    onClick={handleApplyVoucher}
                    className="h-10 rounded-xl bg-[#eaf6fc] px-4 text-xs font-semibold text-[#176b9f] transition hover:bg-[#d9edf8] disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    {voucherLoading ? copy.applying : copy.apply}
                  </button>
                </div>
                {voucherError ? (
                  <p className="mt-1.5 text-xs text-red-600">{voucherError}</p>
                ) : null}
              </div>
              {renderSummaryFooter()}
            </section>
          </aside>
        </form>
      </motion.div>

      <div className="fixed inset-x-0 bottom-0 z-[1090] border-t border-[#d9e4ec] bg-white/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-14px_34px_-26px_rgba(18,45,78,0.5)] backdrop-blur min-[1120px]:hidden">
        {submitError ? (
          <p role="alert" className="mb-2 line-clamp-2 text-xs text-red-600">
            {submitError}
          </p>
        ) : null}
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <button
            type="button"
            onClick={() => setSummaryOpen(true)}
            className="min-w-0 flex-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#b9def3]"
          >
            <span className="block text-[11px] text-slate-500">
              {copy.total}
            </span>
            <span className="block truncate text-lg font-semibold text-[#10253f] tabular-nums">
              {formatPrice(finalTotal)}
            </span>
            <span className="block text-[11px] font-medium text-[#247eb5]">
              {copy.mobileSummary}
            </span>
          </button>
          <button
            type="submit"
            form={CHECKOUT_FORM_ID}
            disabled={placeOrderDisabled}
            className="flex h-12 min-w-[148px] items-center justify-center gap-2 rounded-[14px] bg-[#2488c7] px-4 text-sm font-semibold text-white shadow-sm outline-none transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitStatus !== "idle" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : null}
            {submitLabel}
          </button>
        </div>
      </div>

      <Drawer
        isOpen={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        position="bottom"
        size="xl"
        aria-label={copy.summaryTitle}
        className="h-[calc(100dvh-var(--site-header-height)-16px)] max-h-[calc(100dvh-var(--site-header-height)-16px)] rounded-t-[24px] bg-white"
        contentClassName="h-full p-0"
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="relative">
            {renderSummaryHeader(true)}
            <button
              type="button"
              aria-label={copy.closeSummary}
              onClick={() => setSummaryOpen(false)}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600 outline-none focus-visible:ring-2 focus-visible:ring-[#2f91d0]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {renderOrderItems()}
          </div>
          {renderSummaryFooter(true)}
        </div>
      </Drawer>

      <Modal
        isOpen={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        size="sm"
        {...(previewItem
          ? { title: sanitizeCartText(previewItem.productName) }
          : {})}
        contentClassName="relative bg-[#f3f7fa] p-4"
      >
        <button
          type="button"
          aria-label={copy.lightboxClose}
          onClick={() => setPreviewItem(null)}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-700 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[#2f91d0]"
        >
          <X className="h-4 w-4" />
        </button>
        {previewItem ? (
          <div className="relative mx-auto aspect-square max-h-[70dvh] overflow-hidden rounded-[18px] bg-white">
            {previewImage ? (
              // The lightbox uses the same dynamic cart preview source.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewImage.src}
                alt={sanitizeCartText(previewItem.productName)}
                className="h-full w-full object-contain"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
