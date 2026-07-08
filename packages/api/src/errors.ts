type ErrorRecord = Record<string, unknown>;

export type ApiClientErrorInput = {
  status: number;
  message?: string;
  body?: unknown;
  cause?: unknown;
};

export class ApiClientError extends Error {
  readonly status: number;
  readonly body: unknown;
  readonly details: unknown;
  readonly cause?: unknown;

  constructor(input: ApiClientErrorInput) {
    super(input.message ?? normalizeApiErrorMessage(input.body, input.status));
    this.name = 'ApiClientError';
    this.status = input.status;
    this.body = input.body;
    this.details = getErrorDetails(input.body);

    if (input.cause !== undefined) {
      this.cause = input.cause;
    }
  }
}

export function normalizeApiErrorMessage(body: unknown, status: number): string {
  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  if (isRecord(body)) {
    const nestedError = body.error;

    if (isRecord(nestedError)) {
      const nestedMessage = nestedError.message;

      if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
        return nestedMessage;
      }
    }

    const message = body.message;

    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    if (Array.isArray(message)) {
      const messages = message.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);

      if (messages.length > 0) {
        return messages.join(', ');
      }
    }
  }

  return `Request failed with status ${status}`;
}

function getErrorDetails(body: unknown): unknown {
  if (!isRecord(body)) {
    return body;
  }

  if ('details' in body) {
    return body.details;
  }

  if ('errors' in body) {
    return body.errors;
  }

  if (isRecord(body.error) && 'details' in body.error) {
    return body.error.details;
  }

  return body;
}

function isRecord(value: unknown): value is ErrorRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
