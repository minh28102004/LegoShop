import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { en } from "@/lib/i18n/dictionaries/en";
import { vi } from "@/lib/i18n/dictionaries/vi";

type DeepMutable<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer Item)[]
    ? DeepMutable<Item>[]
    : T extends object
      ? { -readonly [Key in keyof T]: DeepMutable<T[Key]> }
      : T;

export type Dictionary = DeepMutable<typeof vi> | DeepMutable<typeof en>;
export type HomeDictionary = Dictionary["home"];
export type ProductDetailDictionary = Dictionary["productDetail"];
export type CollectionDictionary = Dictionary["collection"];
export type CartDictionary = Dictionary["cart"];
export type CheckoutDictionary = Dictionary["checkout"];
export type OrderTrackingDictionary = Dictionary["orderTracking"];
export type BusinessDictionary = Dictionary["business"];
export type StudioDictionary = Dictionary["studio"];

export const dictionaries = {
  vi,
  en,
} as unknown as Record<Locale, Dictionary>;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}
