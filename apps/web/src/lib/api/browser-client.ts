"use client";

import { createApiClient } from "@lego-shop/api-client";
import { useAuthStore } from "@/stores/authStore";
import { getApiBaseUrl } from "./base-url";

export const browserApiClient = createApiClient({
  baseUrl: getApiBaseUrl(),
  getAccessToken: () => useAuthStore.getState().token ?? undefined,
});
