"use client";

import { useI18n } from "@/lib/i18n/useI18n";

export function useStudioI18n() {
  const { dictionary, locale } = useI18n();

  return {
    locale,
    text: dictionary.studio,
  };
}
