type Translate = (key: string) => string;

const ERROR_CODE_KEYS: Record<string, string> = {
  UNAUTHORIZED: 'apiErrors.unauthorized',
  FORBIDDEN: 'apiErrors.forbidden',
  NOT_FOUND: 'apiErrors.notFound',
  VALIDATION_ERROR: 'apiErrors.validation',
  CONFLICT: 'apiErrors.conflict',
  RATE_LIMITED: 'apiErrors.rateLimited',
  INTERNAL_SERVER_ERROR: 'apiErrors.server',
  NETWORK_ERROR: 'apiErrors.network',
};

function readRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

export function getApiErrorCode(error: unknown) {
  const root = readRecord(error);
  const body = readRecord(root?.body) ?? readRecord(root?.details);
  const nested = readRecord(body?.error);
  const code = root?.code ?? body?.errorCode ?? body?.code ?? nested?.code;
  return typeof code === 'string' ? code.trim().toUpperCase() : undefined;
}

export function getLocalizedApiError(
  error: unknown,
  t: Translate,
  fallbackKey: string,
) {
  const code = getApiErrorCode(error);
  return t((code && ERROR_CODE_KEYS[code]) || fallbackKey);
}
