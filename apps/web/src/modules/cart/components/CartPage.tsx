"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  ChevronRight,
  Minus,
  Plus,
  RefreshCw,
  TicketPercent,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";
import type {
  CartQuoteItemResponseContract,
  CartQuoteResponseContract,
} from "@lego-shop/shared";

import { Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ROUTES } from "@/config/routes";
import { useCart } from "@/features/cart/hooks/useCart";
import type { CartItemPartType, SimpleCartItem } from "@/features/cart/store";
import { useCartText } from "@/lib/i18n/useI18n";
import { useCartQuote } from "@/modules/cart/hooks/useCartQuote";
import {
  formatCartCurrency,
  getCartConfiguration,
  sanitizeCartText,
} from "@/modules/cart/lib/cart-display";
import { resolveCartItemImage } from "@/modules/cart/lib/cart-image";
import { publicApiClient } from "@/lib/api/public-client";

const EMOJI_PATH = "/assets/icons/fluent-emoji";

function FluentEmoji({
  name,
  size = 48,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={`${EMOJI_PATH}/${name}-3d.png`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  );
}

function CartSkeleton() {
  const text = useCartText();
  return (
    <div
      aria-busy="true"
      aria-label={text.loadingCart}
      className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]"
    >
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-[20px] border border-[#dbe6ee] bg-white" />
        {[0, 1].map((item) => (
          <div
            key={item}
            className="flex h-[190px] animate-pulse gap-4 rounded-[22px] border border-[#dbe6ee] bg-white p-5"
          >
            <div className="h-24 w-24 shrink-0 rounded-2xl bg-slate-100" />
            <div className="flex-1 space-y-3 pt-1">
              <div className="h-5 w-2/3 rounded bg-slate-100" />
              <div className="h-6 w-28 rounded-full bg-slate-100" />
              <div className="h-8 w-5/6 rounded-xl bg-slate-100" />
              <div className="h-9 w-1/2 rounded-xl bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
      <div className="hidden h-[470px] animate-pulse rounded-[24px] border border-[#dbe6ee] bg-white xl:block" />
    </div>
  );
}

function ProductPreview({ item }: { item: SimpleCartItem }) {
  const image = resolveCartItemImage(item);
  const source = image?.src ?? null;
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const showImage = Boolean(source && source !== failedSource);

  return (
    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-[#dce6ed] bg-[#f7fbfe] sm:h-[132px] sm:w-[132px]">
      <div className="absolute inset-0 grid place-items-center">
        <FluentEmoji name="package" size={46} className="opacity-70" />
      </div>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={source ?? undefined}
          alt={sanitizeCartText(item.productName)}
          className={`absolute inset-0 h-full w-full ${
            image?.fit === "contain" ? "object-contain p-1" : "object-cover"
          }`}
          onError={() => setFailedSource(source)}
        />
      ) : null}
    </div>
  );
}

function QuantityControl({
  quantity,
  disabled,
  onChange,
}: {
  quantity: number;
  disabled?: boolean;
  onChange: (quantity: number) => void;
}) {
  const text = useCartText();
  return (
    <div
      role="group"
      aria-label={text.quantity}
      className="inline-flex h-11 shrink-0 items-center rounded-full bg-[#f1f6fa] p-1 ring-1 ring-inset ring-[#dce8f1]"
    >
      <button
        type="button"
        aria-label={text.decreaseQuantity}
        disabled={disabled || quantity <= 1}
        onClick={() => onChange(Math.max(1, quantity - 1))}
        className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-500 transition-all duration-200 hover:bg-[#e8f4fb] hover:text-[#176fa5] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82c5ec] disabled:cursor-not-allowed disabled:bg-transparent disabled:opacity-35 disabled:shadow-none motion-reduce:transition-none"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span
        aria-live="polite"
        className="min-w-10 px-1 text-center text-sm font-bold tabular-nums text-[#10253f]"
      >
        {quantity}
      </span>
      <button
        type="button"
        aria-label={text.increaseQuantity}
        disabled={disabled || quantity >= 10}
        onClick={() => onChange(Math.min(10, quantity + 1))}
        className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-600 transition-all duration-200 hover:bg-[#ffd33d] hover:text-[#10253f] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a900] disabled:cursor-not-allowed disabled:bg-transparent disabled:opacity-35 disabled:shadow-none motion-reduce:transition-none"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function ConfigurationChips({ item }: { item: SimpleCartItem }) {
  const text = useCartText();
  const configuration = useMemo(() => getCartConfiguration(item), [item]);
  const chips = [
    item.frameSizeLabel || configuration.frame?.name,
    item.frameColorName,
    configuration.background?.name,
    configuration.characterCount > 0
      ? text.characterCount(configuration.characterCount)
      : null,
    configuration.accessoryCount > 0
      ? text.charmCount(configuration.accessoryCount)
      : null,
  ]
    .filter((value): value is string => Boolean(value))
    .map(sanitizeCartText);

  if (chips.length === 0) return null;

  return (
    <div
      className="mt-2 flex flex-wrap gap-1.5"
      aria-label={text.configurationTitle}
    >
      {chips.slice(0, 5).map((chip, index) => (
        <span
          key={`${chip}-${index}`}
          className="inline-flex min-h-7 items-center rounded-full bg-[#edf7fd] px-2.5 py-1 text-[11px] font-semibold leading-4 text-[#247fb8] ring-1 ring-inset ring-[#d7ebf7]"
        >
          {chip}
        </span>
      ))}
    </div>
  );
}

function ConfigurationAccordion({ item }: { item: SimpleCartItem }) {
  const text = useCartText();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const configuration = useMemo(() => getCartConfiguration(item), [item]);
  const rows: Array<{ label: string; value: ReactNode }> = [];
  if (item.frameSizeLabel || configuration.frame?.name) {
    rows.push({
      label: text.frameSize,
      value: sanitizeCartText(
        item.frameSizeLabel || configuration.frame?.name || "—",
      ),
    });
  }
  if (item.frameColorName) {
    rows.push({ label: text.frameColor, value: item.frameColorName });
  }
  if (configuration.background) {
    rows.push({
      label: text.background,
      value: sanitizeCartText(configuration.background.name),
    });
  }
  if (configuration.characters.length > 0) {
    rows.push({
      label: text.characters,
      value: configuration.characters
        .map((part) => sanitizeCartText(part.name))
        .join(", "),
    });
  }
  if (configuration.accessories.length > 0) {
    rows.push({
      label: text.accessories,
      value: configuration.accessories
        .map((part) => sanitizeCartText(part.name))
        .join(", "),
    });
  }
  if (configuration.uploadedImages > 0) {
    rows.push({
      label: text.customerImage,
      value: `${configuration.uploadedImages}`,
    });
  }
  if (configuration.printedText.length > 0) {
    rows.push({
      label: text.textContent,
      value: configuration.printedText.join(" · "),
    });
  }
  const partLabels: Record<CartItemPartType, string> = {
    frame: text.frame,
    background: text.background,
    character: text.characters,
    character_part: text.characterPart,
    accessory: text.accessories,
    product: text.product,
    retail: text.product,
  };
  const productName = sanitizeCartText(item.productName);
  const partRows = configuration.parts
    .filter(
      (part) =>
        !(
          (part.type === "product" || part.type === "retail") &&
          sanitizeCartText(part.name) === productName
        ),
    )
    .map((part, index) => ({
      key: `${part.type}-${part.id ?? part.name}-${index}`,
      label: partLabels[part.type],
      name: sanitizeCartText(part.name),
      quantity: part.quantity,
      totalPrice: part.totalPrice,
      included: part.totalPrice <= 0,
    }));
  const detailRows = [
    ...partRows,
    ...(configuration.uploadedImages > 0
      ? [
          {
            key: "customer-images",
            label: text.customerImage,
            name: text.uploadedImageCount(configuration.uploadedImages),
            quantity: null,
            totalPrice: 0,
            included: true,
          },
        ]
      : []),
    ...(configuration.printedText.length > 0
      ? [
          {
            key: "printed-text",
            label: text.textContent,
            name: configuration.printedText.map(sanitizeCartText).join(" · "),
            quantity: null,
            totalPrice: 0,
            included: true,
          },
        ]
      : []),
  ];
  const visibleDetailRows = showAll ? detailRows : detailRows.slice(0, 4);
  const hiddenDetailCount = Math.max(
    0,
    detailRows.length - visibleDetailRows.length,
  );
  const pricedParts = configuration.parts.filter((part) => part.unitPrice > 0);
  if (pricedParts.length > 1) {
    rows.push({
      label: text.componentPricing,
      value: (
        <span className="grid gap-1">
          {pricedParts.map((part, index) => (
            <span key={`${part.id ?? part.name}-${index}`}>
              {sanitizeCartText(part.name)} ·{" "}
              {formatCartCurrency(part.unitPrice)}
            </span>
          ))}
        </span>
      ),
    });
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-1 text-xs font-bold text-[#258fce] transition-colors hover:text-[#176fa5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#258fce] focus-visible:ring-offset-2"
      >
        {open ? text.collapse : text.viewConfiguration}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          id={panelId}
          className="animate-in overflow-hidden fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none"
        >
          <div className="mt-1 overflow-hidden rounded-[20px] border border-[#dce8f1] bg-[#f8fbfd] shadow-[0_12px_30px_-26px_rgba(15,45,75,0.4)]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e2ebf2] bg-white/80 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#536b89]">
                  {text.configurationTitle}
                </span>
                <span className="inline-flex h-6 items-center rounded-full bg-[#edf7fd] px-2.5 text-[10px] font-semibold text-[#247fb8]">
                  {text.configurationItemCount(detailRows.length)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-bold text-[#258fce] transition-colors hover:bg-[#edf7fd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82c5ec]"
              >
                {text.collapse}
                <ChevronDown
                  className="h-3.5 w-3.5 rotate-180"
                  aria-hidden="true"
                />
              </button>
            </div>

            {detailRows.length > 0 ? (
              <ul className="my-0 list-none divide-y divide-[#e4ecf2] bg-white px-2 sm:px-3">
                {visibleDetailRows.map((row) => (
                  <li
                    key={row.key}
                    className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-xl bg-white px-2 py-3 transition-colors duration-200 hover:bg-[#f8fbfd] sm:grid-cols-[112px_minmax(0,1fr)_auto]"
                  >
                    <span className="col-span-2 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 sm:col-span-1">
                      {row.label}
                    </span>
                    <span className="min-w-0 break-words text-xs font-semibold leading-5 text-[#263b55]">
                      {row.name}
                      {row.quantity ? (
                        <span className="ml-1.5 whitespace-nowrap font-bold text-[#247fb8]">
                          ×{row.quantity}
                        </span>
                      ) : null}
                    </span>
                    {row.included ? (
                      <span className="inline-flex h-7 items-center rounded-full bg-emerald-50 px-2.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                        {text.included}
                      </span>
                    ) : (
                      <span className="whitespace-nowrap text-xs font-bold tabular-nums text-slate-700">
                        {formatCartCurrency(row.totalPrice)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : rows.length > 0 ? (
              <dl className="grid gap-3 px-4 py-4 sm:grid-cols-2">
                {rows.map((row) => (
                  <div key={row.label} className="min-w-0">
                    <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      {row.label}
                    </dt>
                    <dd className="mt-1 break-words text-xs leading-5 text-slate-700">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="px-4 py-4 text-xs text-slate-500">
                {text.noConfiguration}
              </p>
            )}

            {detailRows.length > 4 ? (
              <button
                type="button"
                onClick={() => setShowAll((current) => !current)}
                aria-expanded={showAll}
                className="group flex min-h-11 w-full items-center justify-center gap-1.5 border-t border-[#e2ebf2] bg-white/70 px-3 py-2.5 text-xs font-bold text-[#2588c8] transition-colors hover:bg-[#edf7fd] hover:text-[#176995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#82c5ec]"
              >
                {showAll
                  ? text.collapseOptions
                  : text.showMoreOptions(hiddenDetailCount)}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${showAll ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NoteEditor({
  item,
  onSave,
}: {
  item: SimpleCartItem;
  onSave: (note: string) => void;
}) {
  const text = useCartText();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(item.note ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const savedNote = item.note?.trim() ?? "";

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() =>
      textareaRef.current?.focus(),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  function saveNote() {
    onSave(draft.trim());
    setOpen(false);
    toast.success(text.noteSaved);
  }

  function openEditor() {
    setDraft(item.note ?? "");
    setOpen(true);
  }

  return (
    <div className="mt-1">
      {savedNote && !open ? (
        <div className="flex min-w-0 flex-col gap-1.5 rounded-xl border border-[#e2e9ee] bg-white px-3 py-2 sm:flex-row sm:items-center sm:gap-2">
          <span className="min-w-0 truncate text-xs text-slate-600 sm:flex-1">
            {savedNote}
          </span>
          <span className="flex items-center gap-3 sm:gap-2">
            <button
              type="button"
              onClick={openEditor}
              className="shrink-0 rounded-md text-xs font-semibold text-[#258fce] hover:text-[#176fa5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#258fce] focus-visible:ring-offset-2"
            >
              {text.editNote}
            </button>
            <button
              type="button"
              onClick={() => onSave("")}
              className="shrink-0 rounded-md text-xs font-semibold text-slate-400 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              {text.deleteNote}
            </button>
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={openEditor}
          className="inline-flex min-h-9 items-center rounded-lg px-1 text-xs font-semibold text-slate-500 transition-colors hover:text-[#258fce] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#258fce] focus-visible:ring-offset-2"
        >
          {text.addNote}
        </button>
      )}

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="note-editor"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-2xl border border-[#dce6ed] bg-white p-3">
              <label
                htmlFor={`note-${item.id}`}
                className="mb-2 block text-xs font-semibold text-slate-700"
              >
                {text.noteLabel}
              </label>
              <Textarea
                ref={textareaRef}
                id={`note-${item.id}`}
                value={draft}
                maxLength={500}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={text.notePlaceholder}
                className="min-h-20 max-h-36 overflow-y-auto text-sm leading-5"
                containerClassName="space-y-0"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-9 rounded-lg px-3 text-xs font-semibold text-slate-500 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#258fce] focus-visible:ring-offset-2"
                >
                  {text.collapse}
                </button>
                <button
                  type="button"
                  onClick={saveNote}
                  className="h-9 rounded-lg bg-[#258fce] px-4 text-xs font-semibold text-white transition hover:bg-[#1d7fb8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#258fce] focus-visible:ring-offset-2"
                >
                  {text.saveNote}
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function CartLineItem({
  item,
  quoteItem,
  priceChange,
  quoteLoading,
  onQuantityChange,
  onNoteChange,
  onRemove,
}: {
  item: SimpleCartItem;
  quoteItem?: CartQuoteItemResponseContract | undefined;
  priceChange?: CartQuoteItemResponseContract | undefined;
  quoteLoading: boolean;
  onQuantityChange: (quantity: number) => void;
  onNoteChange: (note: string) => void;
  onRemove: () => void;
}) {
  const text = useCartText();
  const reduceMotion = useReducedMotion();
  const [removing, setRemoving] = useState(false);
  const valid = quoteItem?.valid !== false;
  const unitPrice = quoteItem?.valid ? quoteItem.unitPrice : item.unitPrice;
  const lineTotal = quoteItem?.valid
    ? quoteItem.lineTotal
    : unitPrice * item.quantity;
  const isCustomized = item.designData?.type === "CUSTOM_FRAME";
  const editHref = `${ROUTES.studio}?editCartItemId=${encodeURIComponent(item.id)}`;

  function remove() {
    setRemoving(true);
    window.setTimeout(onRemove, reduceMotion ? 0 : 190);
  }

  return (
    <motion.article
      id={`cart-item-${item.id}`}
      tabIndex={-1}
      layout={!reduceMotion}
      animate={
        removing
          ? { opacity: 0, scale: 0.985, height: 0, marginBottom: 0 }
          : { opacity: 1, scale: 1 }
      }
      {...(reduceMotion || removing
        ? {}
        : {
            whileHover: {
              y: -3,
              scale: 1.001,
              transition: {
                type: "spring",
                stiffness: 280,
                damping: 22,
                mass: 0.62,
              },
            },
          })}
      transition={{ duration: reduceMotion ? 0 : 0.19, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-[24px] border border-[#dce7ee] bg-white p-4 shadow-[0_8px_22px_-20px_rgba(15,45,74,0.24)] outline-none transition-[border-color,box-shadow,background-color] duration-500 ease-[cubic-bezier(0.34,1.42,0.64,1)] after:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_12%_0%,rgba(37,143,206,0.04),transparent_38%)] after:opacity-0 after:transition-opacity after:duration-500 hover:border-[#bfd9e7] hover:bg-[#fefefe] hover:shadow-[0_13px_30px_-24px_rgba(24,112,165,0.28)] hover:after:opacity-100 focus-visible:ring-2 focus-visible:ring-[#82c5ec] focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:after:hidden sm:p-5 lg:p-6"
    >
      <div className="relative z-10 flex min-w-0 gap-3.5 sm:gap-5">
        <ProductPreview item={item} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-2 pr-0.5">
            <div className="min-w-0">
              <h2 className="line-clamp-2 text-[16px] font-bold leading-5 text-[#10253f] sm:text-[20px] sm:leading-7">
                {sanitizeCartText(item.productName)}
              </h2>
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#edf8f2] px-2.5 py-1 text-[10px] font-semibold text-[#267c55] ring-1 ring-inset ring-emerald-100">
                <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                {isCustomized ? text.customized : text.finished}
              </span>
              <ConfigurationChips item={item} />
            </div>
            <button
              type="button"
              title={text.remove}
              aria-label={`${text.remove}: ${sanitizeCartText(item.productName)}`}
              onClick={remove}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              <Trash2 className="h-[17px] w-[17px]" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-3">
        <ConfigurationAccordion item={item} />

        {!valid ? (
          <div
            role="alert"
            className="relative mt-2.5 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-amber-400"
          >
            <p className="flex items-start gap-2 text-xs leading-5 text-amber-900">
              <TriangleAlert
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span>{text.invalidItem}</span>
            </p>
            {isCustomized ? (
              <Link
                href={editHref}
                className="group/inline-cta mt-1.5 inline-flex min-h-9 items-center rounded-lg text-xs font-bold text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
              >
                <span className="relative pb-0.5">
                  {text.updateConfiguration}
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover/inline-cta:scale-x-100 group-focus-visible/inline-cta:scale-x-100" />
                </span>
                <span className="ml-0 grid w-0 -translate-x-1 overflow-hidden opacity-0 transition-[width,margin,opacity,transform] duration-300 ease-out group-hover/inline-cta:ml-1 group-hover/inline-cta:w-3.5 group-hover/inline-cta:translate-x-0 group-hover/inline-cta:opacity-100 group-focus-visible/inline-cta:ml-1 group-focus-visible/inline-cta:w-3.5 group-focus-visible/inline-cta:translate-x-0 group-focus-visible/inline-cta:opacity-100">
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            ) : null}
          </div>
        ) : null}

        {priceChange ? (
          <p role="status" className="mt-2.5 text-xs leading-5 text-[#176fa5]">
            {text.priceUpdated(
              formatCartCurrency(priceChange.previousUnitPrice),
              formatCartCurrency(priceChange.unitPrice),
            )}
          </p>
        ) : null}

        <NoteEditor item={item} onSave={onNoteChange} />

        <div className="mt-2.5 flex flex-wrap items-end justify-between gap-3 border-t border-[#e8eef3] pt-4">
          <QuantityControl
            quantity={item.quantity}
            disabled={quoteLoading}
            onChange={onQuantityChange}
          />
          <div className="ml-auto text-right">
            <p className="text-[11px] text-slate-500">
              {formatCartCurrency(unitPrice)} {text.unitPriceSuffix}
            </p>
            <div className="mt-0.5 flex items-center justify-end gap-2">
              {priceChange ? (
                <span className="text-xs tabular-nums text-slate-400 line-through">
                  {formatCartCurrency(
                    priceChange.previousUnitPrice * item.quantity,
                  )}
                </span>
              ) : null}
              <strong className="text-lg font-bold tabular-nums tracking-[-0.02em] text-[#10253f] sm:text-xl">
                {formatCartCurrency(lineTotal)}
              </strong>
              {quoteLoading ? (
                <RefreshCw
                  className="h-3.5 w-3.5 animate-spin text-[#258fce] motion-reduce:animate-none"
                  aria-label={text.quoteChecking}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function CheckoutAction({
  ready,
  compact = false,
  voucherCode,
}: {
  ready: boolean;
  compact?: boolean;
  voucherCode?: string | null;
}) {
  const text = useCartText();
  const [navigating, setNavigating] = useState(false);
  const label = compact ? text.checkoutShort : text.checkout;

  if (!ready) {
    return (
      <button
        type="button"
        disabled
        title={text.checkoutBlocked}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-200 px-4 text-sm font-bold text-slate-500"
      >
        <FluentEmoji name="high-voltage" size={23} className="grayscale" />
        {label}
      </button>
    );
  }

  return (
    <Link
      href={
        voucherCode
          ? `${ROUTES.checkout}?voucher=${encodeURIComponent(voucherCode)}`
          : ROUTES.checkout
      }
      aria-busy={navigating || undefined}
      onClick={() => setNavigating(true)}
      className="group/checkout relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#258fce] px-4 text-sm font-bold text-white shadow-[0_15px_30px_-20px_rgba(37,143,206,0.9)] transition-all duration-200 before:absolute before:inset-y-0 before:-left-1/2 before:w-1/3 before:-skew-x-12 before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent before:transition-transform before:duration-700 hover:-translate-y-0.5 hover:bg-[#1d7fb8] hover:shadow-[0_18px_34px_-17px_rgba(37,143,206,0.86)] hover:before:translate-x-[470%] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#258fce] focus-visible:ring-offset-2 active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none motion-reduce:before:hidden"
    >
      <FluentEmoji name="high-voltage" size={23} />
      <span className="relative z-10">
        {navigating ? text.quoteChecking : label}
      </span>
      {!compact ? (
        <ArrowRight
          className="relative z-10 h-4 w-4 transition-transform group-hover/checkout:translate-x-0.5 motion-reduce:transition-none"
          aria-hidden="true"
        />
      ) : null}
    </Link>
  );
}

function VoucherAccordion({
  appliedCode,
  loading,
  error,
  onApply,
  onRemove,
}: {
  appliedCode: string | null;
  loading: boolean;
  error: string | null;
  onApply: (code: string) => void;
  onRemove: () => void;
}) {
  const text = useCartText();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedCode = code.trim();
    if (!normalizedCode || loading) return;
    onApply(normalizedCode);
  }

  return (
    <div
      className={`mt-4 border-y border-[#e7edf1] transition-[padding] duration-200 ease-out ${
        open ? "pb-5 pt-3.5" : "py-1.5"
      }`}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-10 w-full items-center justify-between gap-3 rounded-xl px-1 text-left text-sm font-semibold text-[#10253f] transition-colors hover:text-[#258fce] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#258fce] focus-visible:ring-offset-2"
      >
        <span className="flex min-w-0 items-center gap-2">
          <TicketPercent
            className="h-4 w-4 shrink-0 text-[#258fce]"
            aria-hidden="true"
          />
          <span className="truncate">
            {appliedCode ? text.voucherApplied(appliedCode) : text.addVoucher}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            {appliedCode ? (
              <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800">
                <span className="min-w-0 truncate font-semibold">
                  {text.voucherApplied(appliedCode)}
                </span>
                <button
                  type="button"
                  onClick={onRemove}
                  className="shrink-0 rounded-md font-bold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                >
                  {text.removeVoucher}
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-2">
                <label htmlFor={`${panelId}-input`} className="sr-only">
                  {text.voucherLabel}
                </label>
                <div className="flex gap-2">
                  <Input
                    id={`${panelId}-input`}
                    value={code}
                    onChange={(event) =>
                      setCode(event.target.value.toUpperCase())
                    }
                    autoComplete="off"
                    placeholder={text.voucherPlaceholder}
                    className="font-semibold uppercase placeholder:normal-case placeholder:font-normal"
                    containerClassName="min-w-0 flex-1 space-y-0"
                    controlSize="compact"
                  />
                  <button
                    type="submit"
                    disabled={!code.trim() || loading}
                    className="h-10 shrink-0 rounded-xl bg-[#eaf6fc] px-3.5 text-xs font-bold text-[#176fa5] transition hover:bg-[#d9edf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#258fce] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    {loading ? text.applyingVoucher : text.applyVoucher}
                  </button>
                </div>
                {error ? (
                  <p
                    role="alert"
                    className="mt-2 text-xs leading-5 text-red-600"
                  >
                    {error}
                  </p>
                ) : null}
              </form>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function OrderSummary({
  total,
  itemCount,
  invalidCount,
  quote,
  quoteStatus,
  checkoutReady,
  onRetry,
  voucherCode,
  voucherLoading,
  voucherError,
  onApplyVoucher,
  onRemoveVoucher,
  onReviewInvalid,
  hideHeader = false,
  flat = false,
}: {
  total: number;
  itemCount: number;
  invalidCount: number;
  quote: CartQuoteResponseContract | null;
  quoteStatus: "idle" | "loading" | "success" | "error";
  checkoutReady: boolean;
  onRetry: () => void;
  voucherCode: string | null;
  voucherLoading: boolean;
  voucherError: string | null;
  onApplyVoucher: (code: string) => void;
  onRemoveVoucher: () => void;
  onReviewInvalid: () => void;
  hideHeader?: boolean;
  flat?: boolean;
}) {
  const text = useCartText();
  const subtotal = quoteStatus === "success" && quote ? quote.subtotal : total;
  const discount = quoteStatus === "success" ? (quote?.discount ?? 0) : 0;
  const finalTotal = quoteStatus === "success" && quote ? quote.total : total;

  return (
    <section
      aria-labelledby={hideHeader ? undefined : "cart-summary-title"}
      className={`overflow-hidden bg-white ${
        flat
          ? "min-h-full"
          : "rounded-[24px] border border-[#d9e4eb] shadow-[0_24px_55px_-38px_rgba(16,50,78,0.48)]"
      }`}
    >
      <div className={flat ? "p-5" : "p-5 sm:p-6"}>
        {!hideHeader ? (
          <div className="flex items-start gap-3.5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#eef7fd]">
              <FluentEmoji name="receipt" size={36} />
            </div>
            <div className="min-w-0 flex-1">
              <h2
                id="cart-summary-title"
                className="text-lg font-bold tracking-[-0.02em] text-[#10253f]"
              >
                {text.summaryTitle}
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {text.summarySubtitle}
              </p>
            </div>
            <Badge
              variant="highlight"
              className="h-8 shrink-0 px-3 text-[10px] font-bold"
            >
              {text.itemCount(itemCount)}
            </Badge>
          </div>
        ) : null}

        <div className={`${hideHeader ? "" : "mt-5"} space-y-3.5 text-sm`}>
          <div className="flex items-center justify-between gap-5 text-slate-600">
            <span>{text.subtotal}</span>
            <span className="font-semibold tabular-nums text-[#10253f]">
              {formatCartCurrency(subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-5 text-slate-600">
            <span>{text.quantity}</span>
            <span className="font-semibold tabular-nums text-[#10253f]">
              {text.itemCount(itemCount)}
            </span>
          </div>
          {discount > 0 ? (
            <div className="flex items-center justify-between gap-5 text-emerald-700">
              <span>{text.discount}</span>
              <span className="font-semibold tabular-nums">
                −{formatCartCurrency(discount)}
              </span>
            </div>
          ) : null}
          <div className="flex items-start justify-between gap-5 text-slate-600">
            <span>{text.shipping}</span>
            <span className="max-w-[190px] text-right text-xs font-semibold leading-5 text-slate-600">
              {text.shippingValue}
            </span>
          </div>
        </div>

        {quoteStatus === "loading" ? (
          <p
            role="status"
            className="mt-4 flex items-center gap-2 rounded-xl bg-[#eef7fd] px-3 py-2.5 text-xs text-[#176fa5]"
          >
            <RefreshCw
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
            {text.quoteChecking}
          </p>
        ) : null}
        {quoteStatus === "error" ? (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900"
          >
            <p className="flex items-start gap-2 leading-5">
              <TriangleAlert
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              {text.quoteError}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-1.5 rounded-md font-bold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2"
            >
              {text.retry}
            </button>
          </div>
        ) : null}

        {invalidCount > 0 && quoteStatus === "success" ? (
          <div
            role="alert"
            className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-amber-900"
          >
            <p className="flex items-start gap-2 text-xs font-bold leading-5">
              <TriangleAlert
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              {text.invalidItems(invalidCount)}
            </p>
            <p className="mt-1.5 text-[11px] leading-4 text-amber-800">
              {text.subtotalPending}
            </p>
            <button
              type="button"
              onClick={onReviewInvalid}
              className="group/inline-cta mt-2 inline-flex min-h-9 items-center rounded-lg text-xs font-bold text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
            >
              <span className="relative pb-0.5">
                {text.reviewInvalid}
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover/inline-cta:scale-x-100 group-focus-visible/inline-cta:scale-x-100" />
              </span>
              <span className="ml-0 grid w-0 -translate-x-1 overflow-hidden opacity-0 transition-[width,margin,opacity,transform] duration-300 ease-out group-hover/inline-cta:ml-1 group-hover/inline-cta:w-3.5 group-hover/inline-cta:translate-x-0 group-hover/inline-cta:opacity-100 group-focus-visible/inline-cta:ml-1 group-focus-visible/inline-cta:w-3.5 group-focus-visible/inline-cta:translate-x-0 group-focus-visible/inline-cta:opacity-100">
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </button>
          </div>
        ) : null}

        <VoucherAccordion
          appliedCode={voucherCode}
          loading={voucherLoading}
          error={voucherError}
          onApply={onApplyVoucher}
          onRemove={onRemoveVoucher}
        />

        <div className="mb-5 mt-5 flex items-end justify-between gap-5">
          <span className="text-sm font-bold text-[#10253f]">{text.total}</span>
          <strong className="text-[25px] font-bold tabular-nums tracking-[-0.035em] text-[#10253f]">
            {formatCartCurrency(finalTotal)}
          </strong>
        </div>

        <CheckoutAction ready={checkoutReady} voucherCode={voucherCode} />
        {!checkoutReady && quoteStatus === "success" ? (
          <p className="mt-2 text-center text-[11px] leading-4 text-amber-700">
            {text.checkoutBlocked}
          </p>
        ) : null}
        <Link
          href={ROUTES.collection}
          className="group mt-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-slate-600 transition-[background-color,color,transform] duration-200 hover:-translate-y-px hover:bg-[#f4f8fb] hover:text-[#258fce] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#258fce] focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none"
        >
          <ArrowLeft
            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
            aria-hidden="true"
          />
          {text.continueShopping}
        </Link>

      </div>
    </section>
  );
}

function EmptyCart() {
  const text = useCartText();
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex min-h-[470px] max-w-3xl flex-col items-center justify-center rounded-[26px] border border-[#dbe5ec] bg-white px-6 py-12 text-center shadow-[0_22px_55px_-45px_rgba(16,50,78,0.45)]"
    >
      <div className="grid h-28 w-28 place-items-center rounded-[30px] bg-[#eef7fd]">
        <FluentEmoji name="package" size={76} />
      </div>
      <h2 className="mt-6 text-2xl font-bold tracking-[-0.03em] text-[#10253f]">
        {text.emptyTitle}
      </h2>
      <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">
        {text.emptyDescription}
      </p>
      <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
        <Link
          href={ROUTES.collection}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#258fce] px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#1d7fb8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#258fce] focus-visible:ring-offset-2 motion-reduce:transform-none"
        >
          {text.exploreCollection}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link
          href={ROUTES.studio}
          className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#bfd8e7] bg-white px-6 text-sm font-bold text-[#176fa5] transition hover:bg-[#eef7fd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#258fce] focus-visible:ring-offset-2"
        >
          {text.createDesign}
        </Link>
      </div>
    </motion.section>
  );
}

export default function CartPage() {
  const text = useCartText();
  const reduceMotion = useReducedMotion();
  const {
    items,
    itemCount,
    totalAmount,
    isEmpty,
    hasHydrated,
    updateQuantity,
    updateItemNote,
    updateQuotedPrices,
    removeItem,
    restoreItem,
  } = useCart();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [voucherCode, setVoucherCode] = useState<string | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const quoteOptions = useMemo(
    () => (voucherCode ? { voucherCode } : undefined),
    [voucherCode],
  );
  const { quote, status, retry, priceChanges, isCheckoutReady } = useCartQuote(
    items,
    hasHydrated,
    updateQuotedPrices,
    quoteOptions,
  );
  const quoteById = useMemo(
    () => new Map(quote?.items.map((item) => [item.cartItemId, item]) ?? []),
    [quote],
  );
  const invalidItemIds = useMemo(
    () =>
      status === "success"
        ? (quote?.items
            .filter((item) => !item.valid)
            .map((item) => item.cartItemId) ?? [])
        : [],
    [quote, status],
  );

  function handleReviewInvalid() {
    const firstInvalidId = invalidItemIds[0];
    if (!firstInvalidId) return;
    setSummaryOpen(false);
    window.requestAnimationFrame(() => {
      const target = document.getElementById(`cart-item-${firstInvalidId}`);
      if (!target) return;
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
      target.focus({ preventScroll: true });
    });
  }

  function handleRemove(item: SimpleCartItem, index: number) {
    removeItem(item.id);
    toast.custom(
      (toastItem) => (
        <div
          role="status"
          aria-live="polite"
          className="flex max-w-sm items-center gap-3 rounded-2xl border border-[#d9e4eb] bg-white px-4 py-3 text-sm text-[#10253f] shadow-xl"
        >
          <span className="min-w-0 flex-1">{text.removed}</span>
          <button
            type="button"
            onClick={() => {
              restoreItem(item, index);
              toast.dismiss(toastItem.id);
            }}
            className="shrink-0 rounded-lg px-2 py-1 font-bold text-[#258fce] hover:bg-[#eef7fd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#258fce] focus-visible:ring-offset-2"
          >
            {text.undo}
          </button>
        </div>
      ),
      { duration: 5000 },
    );
  }

  async function handleApplyVoucher(code: string) {
    if (voucherLoading) return;
    setVoucherLoading(true);
    setVoucherError(null);
    try {
      const voucher = await publicApiClient.public.applyVoucher({
        code,
        orderAmount: quote?.subtotal ?? totalAmount,
      });
      setVoucherCode(voucher.code);
    } catch {
      setVoucherCode(null);
      setVoucherError(text.voucherError);
    } finally {
      setVoucherLoading(false);
    }
  }

  function handleRemoveVoucher() {
    setVoucherCode(null);
    setVoucherError(null);
  }

  return (
    <div
      className={`min-h-full bg-[#f3f6f8] ${!isEmpty ? "pb-28 xl:pb-12" : "pb-12"}`}
    >
      <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <nav
          aria-label={text.breadcrumbLabel}
          className="flex items-center gap-1.5 text-xs text-slate-500"
        >
          <Link
            href={ROUTES.home}
            className="transition-colors hover:text-[#258fce]"
          >
            {text.breadcrumbHome}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="font-semibold text-slate-700">
            {text.breadcrumbCart}
          </span>
        </nav>

        <header className="mb-6 mt-4 sm:mb-7">
          <div>
            <h1 className="text-[30px] font-bold leading-tight tracking-[-0.04em] text-[#10253f] sm:text-[38px] lg:text-[42px]">
              {text.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {text.subtitle}
            </p>
          </div>
        </header>

        {!hasHydrated ? (
          <CartSkeleton />
        ) : isEmpty ? (
          <EmptyCart />
        ) : (
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-7">
            <section
              aria-label={text.breadcrumbCart}
              className="min-w-0 space-y-3.5"
            >
              <div className="flex items-start gap-3 rounded-[20px] border border-[#cfe2ee] bg-white px-4 py-3.5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white shadow-sm">
                  <FluentEmoji name="delivery-truck" size={30} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#10253f]">
                    {text.shippingTitle}
                  </h2>
                  <p className="mt-0.5 text-xs leading-5 text-slate-600 sm:text-sm">
                    {text.shippingDescription}
                  </p>
                </div>
              </div>

              <AnimatePresence initial={false} mode="popLayout">
                {items.map((item, index) => (
                  <CartLineItem
                    key={item.id}
                    item={item}
                    {...(quoteById.get(item.id)
                      ? { quoteItem: quoteById.get(item.id) }
                      : {})}
                    {...(priceChanges[item.id]
                      ? { priceChange: priceChanges[item.id] }
                      : {})}
                    quoteLoading={status === "loading"}
                    onQuantityChange={(quantity) =>
                      updateQuantity(item.id, quantity)
                    }
                    onNoteChange={(note) => updateItemNote(item.id, note)}
                    onRemove={() => handleRemove(item, index)}
                  />
                ))}
              </AnimatePresence>
            </section>

            <div className="relative hidden min-w-0 self-stretch xl:block">
              <aside className="sticky top-4">
                <OrderSummary
                  total={totalAmount}
                  itemCount={itemCount}
                  invalidCount={invalidItemIds.length}
                  quote={quote}
                  quoteStatus={status}
                  checkoutReady={isCheckoutReady}
                  onRetry={retry}
                  voucherCode={voucherCode}
                  voucherLoading={voucherLoading}
                  voucherError={voucherError}
                  onApplyVoucher={handleApplyVoucher}
                  onRemoveVoucher={handleRemoveVoucher}
                  onReviewInvalid={handleReviewInvalid}
                />
              </aside>
            </div>
          </div>
        )}
      </div>

      {hasHydrated && !isEmpty ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#d7e2e9] bg-white/95 px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-16px_35px_-28px_rgba(16,50,78,0.5)] backdrop-blur-xl xl:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <button
              type="button"
              aria-label={text.openSummary}
              onClick={() => setSummaryOpen(true)}
              className="min-w-0 flex-1 rounded-xl px-1 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#258fce] focus-visible:ring-offset-2"
            >
              <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                {text.total}
              </span>
              <span className="mt-0.5 block text-lg font-bold tabular-nums tracking-[-0.03em] text-[#10253f]">
                {formatCartCurrency(
                  status === "success" && quote ? quote.total : totalAmount,
                )}
              </span>
            </button>
            <div className="w-[min(48vw,210px)]">
              <CheckoutAction
                ready={isCheckoutReady}
                compact
                voucherCode={voucherCode}
              />
            </div>
          </div>
        </div>
      ) : null}

      <Drawer
        isOpen={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        closeLabel={text.closeSummary}
        position="bottom"
        size="lg"
        title={text.summaryTitle}
        showCloseButton
        className="xl:hidden"
        contentClassName="h-full p-0"
      >
        <OrderSummary
          total={totalAmount}
          itemCount={itemCount}
          invalidCount={invalidItemIds.length}
          quote={quote}
          quoteStatus={status}
          checkoutReady={isCheckoutReady}
          onRetry={retry}
          voucherCode={voucherCode}
          voucherLoading={voucherLoading}
          voucherError={voucherError}
          onApplyVoucher={handleApplyVoucher}
          onRemoveVoucher={handleRemoveVoucher}
          onReviewInvalid={handleReviewInvalid}
          hideHeader
          flat
        />
      </Drawer>
    </div>
  );
}
