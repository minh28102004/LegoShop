type Translate = (key: string, replacements?: Record<string, string>) => string;

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

export function getLocalizedApiError(
  error: unknown,
  t: Translate,
  fallbackKey: string,
) {
  const root = readRecord(error);
  const body = readRecord(root?.body) ?? readRecord(root?.details);
  const nested = readRecord(body?.error);
  const code = root?.code ?? body?.errorCode ?? body?.code ?? nested?.code;
  const normalized =
    typeof code === 'string' ? code.trim().toUpperCase() : undefined;
  return t((normalized && ERROR_CODE_KEYS[normalized]) || fallbackKey);
}
