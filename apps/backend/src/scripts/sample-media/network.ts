import { setTimeout as delay } from 'timers/promises';
import { redactSourceUrl } from './security';

export type DownloadedImage = {
  bytes: Buffer;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  finalUrl: string;
};

export type DownloadOptions = {
  timeoutMs: number;
  maxBytes: number;
  maxRedirects: number;
  maxRetries: number;
};

const ALLOWED_RESPONSE_MIME_TYPES = new Map<
  string,
  DownloadedImage['mimeType']
>([
  ['image/jpeg', 'image/jpeg'],
  ['image/jpg', 'image/jpeg'],
  ['image/png', 'image/png'],
  ['image/webp', 'image/webp'],
]);
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const TRANSIENT_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

class DownloadError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
    readonly retryAfterMs?: number,
  ) {
    super(message);
    this.name = 'DownloadError';
  }
}

export async function downloadImage(
  sourceUrl: string,
  options: DownloadOptions,
): Promise<DownloadedImage> {
  assertHttpsUrl(sourceUrl);

  let lastError: unknown;
  for (let attempt = 0; attempt <= options.maxRetries; attempt += 1) {
    try {
      return await downloadAttempt(sourceUrl, options);
    } catch (error) {
      lastError = error;
      const retryable = error instanceof DownloadError && error.retryable;
      if (!retryable || attempt >= options.maxRetries) throw error;

      const exponentialBackoff = Math.min(5_000, 300 * 2 ** attempt);
      const retryAfter = error.retryAfterMs ?? 0;
      await delay(Math.max(exponentialBackoff, Math.min(retryAfter, 5_000)));
    }
  }

  throw lastError;
}

async function downloadAttempt(
  sourceUrl: string,
  options: DownloadOptions,
): Promise<DownloadedImage> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs);
  let currentUrl = sourceUrl;

  try {
    for (let redirects = 0; redirects <= options.maxRedirects; redirects += 1) {
      let response: Response;
      try {
        response = await fetch(currentUrl, {
          method: 'GET',
          redirect: 'manual',
          signal: controller.signal,
          headers: {
            Accept: 'image/avif,image/webp,image/png,image/jpeg',
            'User-Agent': 'Figure-Lab-Sample-Media-Importer/1.0',
          },
        });
      } catch (error) {
        const timedOut =
          controller.signal.aborted ||
          (error instanceof Error && error.name === 'AbortError');
        throw new DownloadError(
          timedOut
            ? `Download timed out after ${options.timeoutMs}ms for ${redactSourceUrl(currentUrl)}`
            : `Temporary network failure for ${redactSourceUrl(currentUrl)}`,
          true,
        );
      }

      if (REDIRECT_STATUSES.has(response.status)) {
        if (redirects === options.maxRedirects) {
          throw new DownloadError(
            `Redirect limit exceeded for ${redactSourceUrl(sourceUrl)}`,
            false,
          );
        }

        const location = response.headers.get('location');
        if (!location) {
          throw new DownloadError(
            'Redirect response is missing Location',
            false,
          );
        }
        currentUrl = new URL(location, currentUrl).toString();
        assertHttpsUrl(currentUrl);
        continue;
      }

      if (!response.ok) {
        const retryable = TRANSIENT_STATUSES.has(response.status);
        throw new DownloadError(
          `Source responded with HTTP ${response.status} for ${redactSourceUrl(currentUrl)}`,
          retryable,
          parseRetryAfter(response.headers.get('retry-after')),
        );
      }

      const contentTypeHeader = response.headers
        .get('content-type')
        ?.split(';', 1)[0]
        .trim()
        .toLowerCase();
      const declaredMimeType = contentTypeHeader
        ? ALLOWED_RESPONSE_MIME_TYPES.get(contentTypeHeader)
        : undefined;
      if (!declaredMimeType) {
        throw new DownloadError(
          `Source returned unsupported MIME type ${contentTypeHeader ?? '(missing)'}`,
          false,
        );
      }

      const contentLength = parseContentLength(
        response.headers.get('content-length'),
      );
      if (contentLength !== undefined && contentLength > options.maxBytes) {
        throw new DownloadError(
          `Content-Length ${contentLength} exceeds ${options.maxBytes} bytes`,
          false,
        );
      }

      const bytes = await readBodyWithLimit(response, options.maxBytes);
      const detectedMimeType = detectImageMimeType(bytes);
      if (!detectedMimeType) {
        throw new DownloadError(
          'Downloaded content has invalid image magic bytes',
          false,
        );
      }
      if (detectedMimeType !== declaredMimeType) {
        throw new DownloadError(
          `MIME mismatch: header=${declaredMimeType}, bytes=${detectedMimeType}`,
          false,
        );
      }

      return { bytes, mimeType: detectedMimeType, finalUrl: currentUrl };
    }

    throw new DownloadError('Redirect handling failed', false);
  } finally {
    clearTimeout(timeout);
  }
}

async function readBodyWithLimit(
  response: Response,
  maxBytes: number,
): Promise<Buffer> {
  if (!response.body) {
    throw new DownloadError('Source returned an empty body', false);
  }

  const chunks: Buffer[] = [];
  let totalBytes = 0;
  const reader = response.body.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel('Maximum download size exceeded');
        throw new DownloadError(
          `Downloaded body exceeds ${maxBytes} bytes`,
          false,
        );
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }

  if (totalBytes === 0) {
    throw new DownloadError('Source returned an empty body', false);
  }

  return Buffer.concat(chunks, totalBytes);
}

function detectImageMimeType(
  bytes: Buffer,
): DownloadedImage['mimeType'] | undefined {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return 'image/jpeg';
  }

  if (
    bytes.length >= 8 &&
    bytes
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return 'image/png';
  }

  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
    bytes.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }

  return undefined;
}

function parseContentLength(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) return undefined;
  return parsed;
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1_000;

  const date = Date.parse(value);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return undefined;
}

function assertHttpsUrl(value: string): void {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new DownloadError('Source URL is invalid', false);
  }

  if (url.protocol !== 'https:') {
    throw new DownloadError('Source URL and redirects must use HTTPS', false);
  }
  if (url.username || url.password) {
    throw new DownloadError('Source URL credentials are not allowed', false);
  }
}
