"use client";

import type { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { HOT_TOAST_OPTIONS } from "../../../../packages/ui/dist/components/Toast";
import { Toaster } from "react-hot-toast";

export interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <I18nProvider>
      {children}{" "}
      <Toaster position="top-right" toastOptions={HOT_TOAST_OPTIONS} />
    </I18nProvider>
  );
}
