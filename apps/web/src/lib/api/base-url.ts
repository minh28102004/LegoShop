const DEFAULT_API_BASE_URL = "http://localhost:3000";

export function getApiBaseUrl(): string {
  return normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL);
}

function normalizeApiBaseUrl(baseUrl: string): string {
  const normalized = baseUrl.trim().replace(/\/+$/, "");

  if (!normalized) {
    return DEFAULT_API_BASE_URL;
  }

  return normalized;
}
