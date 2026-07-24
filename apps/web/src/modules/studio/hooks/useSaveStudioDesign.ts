"use client";

import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useAuthStore } from "@/features/auth/store";
import { browserApiClient } from "@/lib/api/browser-client";
import type { JsonObject, URLString } from "@lego-shop/shared";
import { useStudioI18n } from "./useStudioI18n";
import { prepareStudioPreview } from "../lib/studio-preview";
import type { StudioSaveStatus } from "../state/studio.types";

type SaveStudioDesignInput = {
  name?: string;
  designData: JsonObject;
  previewSourceUrl: string | null;
};

export function useSaveStudioDesign() {
  const { text } = useStudioI18n();
  const token = useAuthStore((state) => state.token);
  const [status, setStatus] = useState<StudioSaveStatus>("idle");
  const submittingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const saveDesign = useCallback(
    async ({ name, designData, previewSourceUrl }: SaveStudioDesignInput) => {
      if (submittingRef.current) return null;
      if (!token) {
        setStatus("auth-required");
        toast.error(text.toast.authRequired);
        return null;
      }

      submittingRef.current = true;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        setStatus("preparing-preview");
        const previewUrl = await prepareStudioPreview(
          previewSourceUrl,
          controller.signal,
        );
        setStatus("saving");
        const result = await browserApiClient.userDesigns.createUserDesign({
          ...(name?.trim() ? { name: name.trim() } : {}),
          designData,
          ...(previewUrl ? { previewUrl: previewUrl as URLString } : {}),
        });
        setStatus("success");
        toast.success(text.toast.saveSuccess);
        return result;
      } catch (error) {
        if (controller.signal.aborted) return null;
        console.error("Failed to save Studio design:", error);
        setStatus("error");
        toast.error(text.toast.saveError);
        return null;
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        submittingRef.current = false;
      }
    },
    [
      text.toast.authRequired,
      text.toast.saveError,
      text.toast.saveSuccess,
      token,
    ],
  );

  return {
    saveDesign,
    saveStatus: status,
    isSaving: status === "saving" || status === "preparing-preview",
    cancelSave: () => abortRef.current?.abort(),
  };
}
