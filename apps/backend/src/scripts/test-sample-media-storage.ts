import { randomUUID } from 'crypto';
import { config as loadEnv } from 'dotenv';
import { UploadsService } from '../uploads/uploads.service';

loadEnv({ path: '.env.local', quiet: true });
loadEnv({ path: '.env', quiet: true });

const ONE_PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+3MxZ5wAAAABJRU5ErkJggg==',
  'base64',
);

async function main() {
  const publicBaseUrl = process.env.STORAGE_PUBLIC_BASE_URL?.trim();
  if (!publicBaseUrl) throw new Error('STORAGE_PUBLIC_BASE_URL is required');
  const parsedBaseUrl = new URL(publicBaseUrl);
  if (
    parsedBaseUrl.protocol !== 'https:' ||
    ['localhost', '127.0.0.1', '::1'].includes(parsedBaseUrl.hostname)
  ) {
    throw new Error('Persistence test requires non-loopback HTTPS storage');
  }
  if (
    process.env.SAMPLE_MEDIA_STORAGE_PROVIDER?.trim().toLowerCase() !==
    'supabase'
  ) {
    throw new Error('Persistence test requires Supabase storage provider');
  }

  const uploads = new UploadsService();
  const fileName = `phase3-persistence-${Date.now()}-${randomUUID()}.png`;
  let storagePath: string | undefined;
  let verification: Record<string, unknown> | undefined;
  let failure: unknown;
  let testObjectDeleted = false;
  let testObjectAbsentAfterDelete = false;
  try {
    const stored = await uploads.storeProcessedImage({
      buffer: ONE_PIXEL_PNG,
      mimeType: 'image/png',
      folder: 'healthchecks',
      fileName,
      publicBaseUrl,
    });
    storagePath = stored.storagePath;

    const existsThroughStorageApi = await uploads.storedFileExists(storagePath);
    if (!existsThroughStorageApi) {
      throw new Error('Object is missing from independent storage lookup');
    }
    const response = await fetch(stored.url, {
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(20_000),
    });
    const bytes = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') ?? '';
    if (!response.ok)
      throw new Error(`Public GET returned HTTP ${response.status}`);
    if (!contentType.toLowerCase().startsWith('image/')) {
      throw new Error(
        `Public GET returned non-image Content-Type ${contentType}`,
      );
    }
    if (bytes.byteLength === 0)
      throw new Error('Public GET returned zero bytes');

    verification = {
      provider: 'supabase',
      url: stored.url,
      storagePath,
      uploadCreated: stored.created,
      storageApiExists: existsThroughStorageApi,
      httpStatus: response.status,
      contentType,
      byteSize: bytes.byteLength,
      nonLoopbackHttps: true,
    };
  } catch (error) {
    failure = error;
  } finally {
    if (storagePath) {
      try {
        testObjectDeleted = await uploads.deleteStoredFile(storagePath);
        testObjectAbsentAfterDelete =
          !(await uploads.storedFileExists(storagePath));
        if ((!testObjectDeleted || !testObjectAbsentAfterDelete) && !failure) {
          failure = new Error(
            'Persistence test object deletion could not be confirmed',
          );
        }
      } catch (error) {
        failure ??= error;
      }
    }
  }

  if (failure) {
    throw failure instanceof Error
      ? failure
      : new Error('Storage persistence test failed with a non-Error value');
  }
  if (!verification) throw new Error('Persistence test produced no result');
  console.log(
    JSON.stringify(
      {
        ...verification,
        testObjectDeleted,
        testObjectAbsentAfterDelete,
        passed: true,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(
    `Storage persistence test failed: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  process.exit(1);
});
