"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { formatCurrency as formatPrice } from "@lego-shop/shared";
import {
  AlertCircle,
  ArrowRight,
  CreditCard,
  Lightbulb,
  ShoppingCart,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";

import { ROUTES, UI_MODAL_IDS } from "@/config/routes";
import { useCartStore } from "@/features/cart/store";
import { useUIStore } from "@/features/ui/store";

import { useStudioI18n } from "../hooks/useStudioI18n";
import { isPersistableImageUrl } from "../lib/design-data";
import {
  buildStudioCartItem,
  serializeStudioDesign,
} from "../lib/studio-serialization";
import { useStudio } from "./StudioContext";

export const STUDIO_REVIEW_FOOTER_ID = "studio-review-footer";

export function StudioReviewPanel() {
  const router = useRouter();
  const {
    totalPrice,
    frameSize,
    frameSizes,
    characterCount,
    characterPrice,
    elements,
    printText,
    contentFields,
    contentValues,
    activeTemplate,
    customBackgroundUrl,
    customBackgroundOriginalName,
    templates,
    isEditMode,
    editCartItemId,
    setActiveStep,
    setActiveTool,
    setActivePanelTab,
    setIsContextPanelCollapsed,
    validateStep,
  } = useStudio();
  const { text } = useStudioI18n();
  const addItem = useCartStore((state) => state.addItem);
  const updateItem = useCartStore((state) => state.updateItem);
  const openCart = useCartStore((state) => state.openCart);
  const openModal = useUIStore((state) => state.openModal);

  const [seconds, setSeconds] = useState(15 * 60);
  const [footerRoot, setFooterRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const interval = setInterval(
      () => setSeconds((current) => Math.max(0, current - 1)),
      1000,
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setFooterRoot(document.getElementById(STUDIO_REVIEW_FOOTER_ID));
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const timerMins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const timerSecs = String(seconds % 60).padStart(2, "0");

  const serializedDesign = useMemo(
    () =>
      serializeStudioDesign({
        frameSize,
        frameSizes,
        characterPrice,
        elements,
        printText,
        contentFields,
        contentValues,
        activeTemplate,
        customBackgroundUrl,
        customBackgroundOriginalName,
        templates,
        labels: {
          customBackground: text.panels.customBackground,
          accessoryFallback: text.panels.accessoryFallback,
          characterFallback: text.panels.characterFallback,
        },
      }),
    [
      activeTemplate,
      characterPrice,
      contentFields,
      contentValues,
      customBackgroundOriginalName,
      customBackgroundUrl,
      elements,
      frameSize,
      frameSizes,
      printText,
      templates,
      text.panels.accessoryFallback,
      text.panels.characterFallback,
      text.panels.customBackground,
    ],
  );
  const frame = serializedDesign.frame;
  const accessoryItems = elements.filter(
    (element) => element.type === "accessory",
  );
  const characterItems = elements.filter(
    (element) => element.type === "character",
  );
  const validationResult = validateStep("review");
  const missingRequiredContent =
    Object.keys(validationResult.fieldErrors).length > 0;
  const previewUrl = serializedDesign.previewUrl;
  const hasPersistablePreview = Boolean(
    previewUrl && isPersistableImageUrl(previewUrl),
  );
  const canCheckout = validationResult.isValid && hasPersistablePreview;
  const checkoutBlockMessage =
    validationResult.summaryErrors[0] ??
    (!hasPersistablePreview ? text.validation.previewRequired : null);
  const charactersTotalPrice = characterItems.reduce(
    (sum, character) => sum + (character.price ?? characterPrice),
    0,
  );

  const persistCartItem = () => {
    const cartItem = buildStudioCartItem({
      ...serializedDesign,
      activeTemplate,
      frameSize,
      printText,
      totalPrice,
      productName: text.panels.customProduct,
    });

    if (isEditMode && editCartItemId) {
      updateItem(editCartItemId, cartItem);
      return "updated" as const;
    }

    addItem(cartItem);
    return "added" as const;
  };

  const notifyCartPersisted = (result: "added" | "updated") => {
    toast.success(
      result === "updated" ? text.toast.cartUpdated : text.toast.cartAdded,
      { id: "studio-cart-persisted" },
    );
  };

  const openCartDrawer = () => {
    openCart();
    openModal(UI_MODAL_IDS.CART_DRAWER);
    window.dispatchEvent(new CustomEvent("legoshop:open-cart"));
  };

  const handleAddToCart = () => {
    if (!canCheckout) return;
    notifyCartPersisted(persistCartItem());
    openCartDrawer();
  };

  const handleBuyNow = () => {
    if (!canCheckout) return;
    notifyCartPersisted(persistCartItem());
    router.push(ROUTES.checkout);
  };

  return (
    <div className="space-y-5 pb-6">
      {seconds > 0 && (
        <div className="flex animate-fade-in items-center justify-between rounded-[24px] bg-gradient-to-r from-[#2f91d0] to-[#5aaee3] px-5 py-4 text-white">
          <div>
            <div className="flex items-center gap-1.5 text-[13px] font-semibold tracking-wide">
              <Zap className="h-4 w-4 fill-white" /> {text.panels.promoTitle}
            </div>
            <div className="mt-1 text-[11px] font-medium text-white/90">
              {text.panels.promoDescription}
            </div>
          </div>
          <div className="rounded-2xl bg-white/16 px-2.5 py-1.5 font-mono text-lg font-bold tracking-widest backdrop-blur-sm">
            {timerMins}:{timerSecs}
          </div>
        </div>
      )}

      <div className="rounded-[24px] border border-[#e4edf5] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)]">
        <div className="flex items-center justify-between border-b border-[#e4edf5] bg-transparent px-[18px] py-4">
          <h3 className="text-xs font-semibold tracking-wide text-slate-950 uppercase">
            {text.panels.review}
          </h3>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
            {characterCount} {text.panels.characterUnit}
          </span>
        </div>

        <div className="divide-y divide-[#e4edf5]">
          {frame && (
            <div className="flex items-start justify-between px-[18px] py-4 transition-colors duration-200 hover:bg-slate-50/60">
              <div>
                <p className="text-sm font-bold text-slate-950">
                  {frame.label}
                </p>
                {frame.colorName ? (
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    {text.panels.colorPrefix}: {frame.colorName}
                  </p>
                ) : null}
              </div>
              <span className="text-sm font-bold text-slate-950">
                {formatPrice(frame.price)}
              </span>
            </div>
          )}

          {characterCount > 0 && (
            <div className="flex items-start justify-between px-[18px] py-4 transition-colors duration-200 hover:bg-slate-50/60">
              <div>
                <p className="text-sm font-bold text-slate-950">
                  {text.panels.characters}
                </p>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  {characterCount} × {formatPrice(characterPrice)}
                </p>
              </div>
              <span className="text-sm font-bold text-slate-950">
                {formatPrice(charactersTotalPrice)}
              </span>
            </div>
          )}

          {accessoryItems.map((element) => (
            <div
              key={element.id}
              className="flex items-start justify-between px-[18px] py-4 transition-colors duration-200 hover:bg-slate-50/60"
            >
              <div>
                <p className="text-sm font-bold text-slate-950">
                  {element.content}
                </p>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  {text.panels.quantity}: 1
                </p>
              </div>
              <span className="text-sm font-bold text-slate-950">
                {formatPrice(element.price || 0)}
              </span>
            </div>
          ))}
        </div>

        <div className="mx-5 mb-5 rounded-[22px] border border-[#dbe7f1] bg-[#f8fbff] px-5 py-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-widest text-slate-600">
              {text.panels.total}
            </span>
            <span className="text-2xl font-bold text-[#2f91d0]">
              {formatPrice(totalPrice)}
            </span>
          </div>
          <p className="mt-2 text-right text-xs font-medium text-slate-500">
            {text.panels.shippingNote}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-[24px] border border-[#cfe4f4] bg-[#f4faff] p-5">
        <Lightbulb
          className="mt-0.5 h-5 w-5 shrink-0 text-[#2f91d0]"
          strokeWidth={1.9}
          aria-hidden="true"
        />
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
            {text.panels.earlyBirdTitle}
          </p>
          <p className="text-xs font-medium leading-relaxed text-[#437ea8]">
            {text.panels.earlyBirdDescription}
          </p>
        </div>
      </div>

      {checkoutBlockMessage ? (
        <div
          role="alert"
          className="rounded-[22px] border border-amber-200/80 bg-amber-50/90 px-4 py-4 text-sm font-medium leading-relaxed text-amber-800"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{checkoutBlockMessage}</span>
          </div>
          {missingRequiredContent ? (
            <button
              type="button"
              onClick={() => {
                setActiveStep("content");
                setActiveTool("text");
                setActivePanelTab("information");
                setIsContextPanelCollapsed(false);
              }}
              className="mt-3 inline-flex h-9 items-center justify-center rounded-full border border-amber-300 bg-white px-3 text-xs font-semibold text-amber-900 appearance-none outline-none transition-colors duration-200 hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2"
            >
              {text.panels.completeContent}
            </button>
          ) : null}
        </div>
      ) : null}

      {footerRoot
        ? createPortal(
            <div className="grid grid-cols-2 items-center gap-2.5">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canCheckout}
                className="group flex h-12 min-w-0 items-center justify-center gap-2 rounded-2xl bg-white px-3 text-[13px] font-semibold text-[#17334f] ring-1 ring-inset ring-[#cfdde8] appearance-none outline-none transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f4faff] hover:text-[#258fce] hover:ring-[#9fcbe5] hover:shadow-[0_12px_25px_-18px_rgba(37,143,206,0.8)] active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-100 disabled:text-slate-400 disabled:ring-slate-200 disabled:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#82c5ec] motion-reduce:transform-none"
              >
                <ShoppingCart className="h-[17px] w-[17px] shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110 group-disabled:translate-y-0 group-disabled:scale-100" />
                <span className="truncate">
                  {isEditMode ? text.panels.updateCart : text.panels.addToCart}
                </span>
              </button>

              <button
                type="button"
                data-flat-button="true"
                onClick={handleBuyNow}
                disabled={!canCheckout}
                className="group relative flex h-12 min-w-0 items-center justify-center gap-2 overflow-hidden rounded-2xl border-0 bg-[#258fce] px-3 text-[13px] font-semibold text-white shadow-[0_12px_30px_-20px_rgba(37,143,206,0.95)] appearance-none outline-none transition-all duration-300 before:absolute before:inset-y-0 before:left-[-45%] before:w-1/3 before:-skew-x-12 before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent before:transition-transform before:duration-700 hover:-translate-y-0.5 hover:bg-[#1d7fb8] hover:shadow-[0_16px_30px_-16px_rgba(37,143,206,0.9)] hover:before:translate-x-[430%] active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none disabled:before:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#82c5ec] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:before:hidden"
              >
                <CreditCard className="relative z-10 h-[17px] w-[17px] shrink-0 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 group-disabled:rotate-0 group-disabled:scale-100" />
                <span className="relative z-10 truncate">
                  {text.panels.buyNow}
                </span>
                <ArrowRight className="relative z-10 h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-disabled:translate-x-0" />
              </button>
            </div>,
            footerRoot,
          )
        : null}
    </div>
  );
}
