"use client";

import { useMemo } from "react";
import { useI18n } from "@/lib/i18n/useI18n";
import { getStudioTranslations } from "../data/studio-translations";

export function useStudioI18n() {
  const { locale } = useI18n();

  return {
    locale,
    text: useMemo(() => getStudioTranslations(locale), [locale]),
  };
}
