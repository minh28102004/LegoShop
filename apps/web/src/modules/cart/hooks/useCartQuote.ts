"use client";

import type {
  CartQuoteItemResponseContract,
  CartQuoteRequestContract,
  CartQuoteResponseContract,
  JsonObject,
} from "@lego-shop/shared";
import { useCallback, useEffect, useRef, useState } from "react";

import type { SimpleCartItem } from "@/features/cart/store";
import { publicApiClient } from "@/lib/api/public-client";

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getFrameOptionId(item: SimpleCartItem) {
  return (
    item.frameOptionId ??
    readString(item.designData?.frameOptionId) ??
    (item.designData?.type === "RETAIL_ITEM"
      ? readString(item.designData.sourceId)
      : undefined)
  );
}

function getBackgroundId(item: SimpleCartItem) {
  return (
    readString(item.designData?.backgroundId) ??
    (item.designData?.type === "RETAIL_ITEM" &&
    item.designData.retailType === "background"
      ? readString(item.designData.sourceId)
      : undefined)
  );
}

export type CartQuoteOptions = Pick<
  CartQuoteRequestContract,
  | "shippingMethod"
  | "paymentMethod"
  | "giftPackage"
  | "polaroidOption"
  | "voucherCode"
>;

const EMPTY_CART_QUOTE_OPTIONS: CartQuoteOptions = {};

export function buildCartQuotePayload(
  items: SimpleCartItem[],
  options: CartQuoteOptions = {},
): CartQuoteRequestContract {
  return {
    ...options,
    items: items.map((item) => {
      const frameOptionId = getFrameOptionId(item);
      const backgroundId = getBackgroundId(item);
      return {
        cartItemId: item.id,
        productName: item.productName,
        quantity: item.quantity,
        priceSnapshot: item.unitPrice,
        ...(item.productId ? { productId: item.productId } : {}),
        ...(frameOptionId ? { frameOptionId } : {}),
        ...(backgroundId ? { backgroundId } : {}),
        ...(item.frameSizeId ? { frameSizeId: item.frameSizeId } : {}),
        ...(item.frameSizeLabel ? { frameSizeLabel: item.frameSizeLabel } : {}),
        ...(item.frameColorName ? { frameColorName: item.frameColorName } : {}),
        ...(item.accessories?.length ? { accessories: item.accessories } : {}),
        designData: item.designData as JsonObject,
        ...(item.previewUrl ? { previewUrl: item.previewUrl } : {}),
      };
    }),
  };
}

type QuoteStatus = "idle" | "loading" | "success" | "error";

export function useCartQuote(
  items: SimpleCartItem[],
  hasHydrated: boolean,
  updateQuotedPrices: (prices: Record<string, number>) => void,
  options?: CartQuoteOptions,
) {
  const resolvedOptions = options ?? EMPTY_CART_QUOTE_OPTIONS;
  const quoteKey = JSON.stringify(
    buildCartQuotePayload(items, resolvedOptions),
  );
  const [status, setStatus] = useState<QuoteStatus>("idle");
  const [quote, setQuote] = useState<CartQuoteResponseContract | null>(null);
  const [quotedKey, setQuotedKey] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const [priceChanges, setPriceChanges] = useState<
    Record<string, CartQuoteItemResponseContract>
  >({});
  const sequence = useRef(0);

  const retry = useCallback(() => {
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (items.length === 0) return;

    const currentSequence = ++sequence.current;
    const currentRequestPayload = JSON.parse(
      quoteKey,
    ) as CartQuoteRequestContract;
    const timer = window.setTimeout(() => {
      setStatus("loading");
      publicApiClient.public
        .quoteCart(currentRequestPayload)
        .then((nextQuote) => {
          if (currentSequence !== sequence.current) return;
          const prices: Record<string, number> = {};
          const changedItems: Record<string, CartQuoteItemResponseContract> =
            {};
          nextQuote.items.forEach((item) => {
            if (item.valid) prices[item.cartItemId] = item.unitPrice;
            if (
              item.warnings.some((warning) => warning.code === "PRICE_CHANGED")
            ) {
              changedItems[item.cartItemId] = item;
            }
          });
          if (Object.keys(changedItems).length > 0) {
            setPriceChanges((current) => ({ ...current, ...changedItems }));
          }
          setQuote(nextQuote);
          setQuotedKey(quoteKey);
          setStatus("success");
          updateQuotedPrices(prices);
        })
        .catch(() => {
          if (currentSequence !== sequence.current) return;
          setQuotedKey(quoteKey);
          setStatus("error");
        });
    }, 260);

    return () => window.clearTimeout(timer);
  }, [hasHydrated, items.length, quoteKey, requestVersion, updateQuotedPrices]);

  const isCurrent = quotedKey === quoteKey;
  const isEmpty = items.length === 0;
  return {
    quote: isEmpty ? null : quote,
    status: isEmpty ? "idle" : isCurrent ? status : "loading",
    retry,
    priceChanges,
    isCheckoutReady:
      !isEmpty && isCurrent && status === "success" && Boolean(quote?.valid),
  };
}
