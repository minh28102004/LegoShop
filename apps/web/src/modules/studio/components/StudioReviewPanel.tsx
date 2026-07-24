"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { formatCurrency as formatPrice } from "@lego-shop/shared";
import {
  AlertCircle,
  ArrowRight,
  Lightbulb,
  ShoppingCart,
  Zap,
} from "lucide-react";

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
  useEffect(() => {
    const interval = setInterval(
      () => setSeconds((current) => Math.max(0, current - 1)),
      1000,
    );
    return () => clearInterval(interval);
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
      return;
    }

    addItem(cartItem);
  };

  const openCartDrawer = () => {
    openCart();
    openModal(UI_MODAL_IDS.CART_DRAWER);
    window.dispatchEvent(new CustomEvent("legoshop:open-cart"));
  };

  const handleAddToCart = () => {
    if (!canCheckout) return;
    persistCartItem();
    openCartDrawer();
  };

  const handleBuyNow = () => {
    if (!canCheckout) return;
    persistCartItem();
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

      <div className="flex flex-col gap-3 pt-2">
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

        <button
          type="button"
          data-flat-button="true"
          onClick={handleBuyNow}
          disabled={!canCheckout}
          className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-[18px] border-0 bg-[#2f91d0] px-4 text-sm font-semibold text-white appearance-none outline-none transition-colors duration-200 hover:bg-[#257fb7] disabled:cursor-not-allowed disabled:border-0 disabled:bg-slate-200 disabled:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2f91d0]/70 focus-visible:ring-offset-2"
        >
          <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
            <div className="relative h-full w-8 bg-white/20" />
          </div>
          <span>{text.panels.buyNow}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canCheckout}
          className="flex h-12 items-center justify-center gap-2 rounded-[18px] border border-[#e4edf5] bg-white px-4 text-sm font-semibold text-slate-950 appearance-none outline-none transition-all duration-200 hover:border-[#bfdcf0] hover:bg-[#fbfdff] hover:text-[#2f91d0] disabled:cursor-not-allowed disabled:border-transparent disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#80c4e9]/70 focus-visible:ring-offset-2"
        >
          <ShoppingCart className="h-4 w-4" />
          {isEditMode ? text.panels.updateCart : text.panels.addToCart}
        </button>
      </div>
    </div>
  );
}
