import { env } from '@/config/env';
import { clearAccessToken, getAccessToken } from '@/modules/auth/services/authStorage';

type RequestOptions = RequestInit & {
  auth?: boolean;
};

const API_BASE_URL = env.apiUrl;

export function resolveApiAssetUrl(url?: string | null) {
  const trimmedUrl = url?.trim();
  if (!trimmedUrl) return '';
  if (/^(https?:)?\/\//i.test(trimmedUrl) || trimmedUrl.startsWith('data:')) {
    return trimmedUrl;
  }
  if (trimmedUrl.startsWith('/')) {
    return `${API_BASE_URL}${trimmedUrl}`;
  }
  return trimmedUrl;
}

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { auth = true, headers, body, ...rest } = options;
  const token = auth ? getAccessToken() : null;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}/${path.replace(/^\//, '')}`, {
    ...rest,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401 && auth) {
      clearAccessToken();
    }

    const message =
      typeof payload === 'object' && payload && 'message' in payload
        ? String((payload as { message?: unknown }).message)
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}


