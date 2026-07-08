"use client";

import { createApiClient } from "@lego-shop/api";
import { useAuthStore } from "@/features/auth/store";
import { getApiBaseUrl } from "./base-url";

export const browserApiClient = createApiClient({
  baseUrl: getApiBaseUrl(),
  getAccessToken: () => useAuthStore.getState().token ?? undefined,
});
