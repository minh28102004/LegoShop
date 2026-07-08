import { joinUrl } from './config';
import { createAdminApi } from './endpoints/admin.api';
import { createAuthApi } from './endpoints/auth.api';
import { createCategoriesApi } from './endpoints/categories.api';
import { createInquiriesApi } from './endpoints/inquiries.api';
import { createOrdersApi } from './endpoints/orders.api';
import { createPaymentsApi } from './endpoints/payments.api';
import { createProductsApi } from './endpoints/products.api';
import { createPublicApi } from './endpoints/public.api';
import { createUserDesignsApi } from './endpoints/user-designs.api';
import { ApiClientError, normalizeApiErrorMessage } from './errors';

export type QueryPrimitive = string | number | boolean | null | undefined;
export type QueryValue = QueryPrimitive | Array<Exclude<QueryPrimitive, null | undefined>>;
export type QueryParams = Record<string, QueryValue>;

export type ApiClientOptions = {
  baseUrl: string;
  getAccessToken?: () => string | undefined | Promise<string | undefined>;
  defaultHeaders?: HeadersInit;
  fetchImpl?: typeof fetch;
};

export type ApiRequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  auth?: boolean;
  body?: unknown;
  headers?: HeadersInit;
  query?: QueryParams;
};

export type ApiRequester = <TResponse>(path: string, options?: ApiRequestOptions) => Promise<TResponse>;

export type ApiClient = {
  request: ApiRequester;
  admin: ReturnType<typeof createAdminApi>;
  auth: ReturnType<typeof createAuthApi>;
  categories: ReturnType<typeof createCategoriesApi>;
  inquiries: ReturnType<typeof createInquiriesApi>;
  orders: ReturnType<typeof createOrdersApi>;
  payments: ReturnType<typeof createPaymentsApi>;
  products: ReturnType<typeof createProductsApi>;
  public: ReturnType<typeof createPublicApi>;
  userDesigns: ReturnType<typeof createUserDesignsApi>;
};

export function createApiClient(options: ApiClientOptions): ApiClient {
  const fetcher = options.fetchImpl ?? fetch;

  async function request<TResponse>(path: string, requestOptions: ApiRequestOptions = {}): Promise<TResponse> {
    const { auth = false, body, headers, query, ...fetchOptions } = requestOptions;
    const requestHeaders = new Headers(options.defaultHeaders);

    mergeHeaders(requestHeaders, headers);

    if (auth) {
      const token = await options.getAccessToken?.();

      if (token) {
        requestHeaders.set('Authorization', `Bearer ${token}`);
      }
    }

    const serializedBody = serializeBody(body, requestHeaders);
    const url = appendQuery(joinUrl(options.baseUrl, path), query);
    const response = await fetcher(url, {
      ...fetchOptions,
      body: serializedBody,
      headers: requestHeaders,
    });
    const responseBody = await parseResponseBody(response);

    if (!response.ok) {
      throw new ApiClientError({
        status: response.status,
        message: normalizeApiErrorMessage(responseBody, response.status),
        body: responseBody,
      });
    }

    return responseBody as TResponse;
  }

  return {
    request,
    admin: createAdminApi(request),
    auth: createAuthApi(request),
    categories: createCategoriesApi(request),
    inquiries: createInquiriesApi(request),
    orders: createOrdersApi(request),
    payments: createPaymentsApi(request),
    products: createProductsApi(request),
    public: createPublicApi(request),
    userDesigns: createUserDesignsApi(request),
  };
}

function mergeHeaders(target: Headers, source?: HeadersInit): void {
  if (!source) {
    return;
  }

  new Headers(source).forEach((value, key) => {
    target.set(key, value);
  });
}

function appendQuery(url: string, query?: QueryParams): string {
  if (!query) {
    return url;
  }

  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, String(item)));
      return;
    }

    params.set(key, String(value));
  });

  const queryString = params.toString();

  return queryString ? `${url}${url.includes('?') ? '&' : '?'}${queryString}` : url;
}

function serializeBody(body: unknown, headers: Headers): BodyInit | null | undefined {
  if (body === undefined || body === null) {
    return body;
  }

  if (isBodyInit(body)) {
    return body;
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return JSON.stringify(body);
}

function isBodyInit(body: unknown): body is BodyInit {
  if (typeof body === 'string') {
    return true;
  }

  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
    return true;
  }

  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) {
    return true;
  }

  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return true;
  }

  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    return true;
  }

  return false;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  const contentType = response.headers.get('Content-Type') ?? '';

  if (!contentType.includes('application/json')) {
    return text;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    throw new ApiClientError({
      status: response.status,
      message: 'Failed to parse API JSON response.',
      body: text,
      cause: error,
    });
  }
}
