import { useI18n } from "./I18nProvider";
import type { CartDictionary } from "./dictionaries";

export { useI18n };

export function useCartText(): CartDictionary {
  return useI18n().dictionary.cart;
}
