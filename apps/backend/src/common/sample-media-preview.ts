import { ProductStatus } from '@prisma/client';

export function stagedSampleMediaSeedTag(): string | undefined {
  const enabled =
    process.env.INCLUDE_STAGED_SAMPLE_MEDIA?.trim().toLowerCase() === 'true';
  if (!enabled) return undefined;

  if (process.env.NODE_ENV?.trim().toLowerCase() === 'production') {
    throw new Error(
      'INCLUDE_STAGED_SAMPLE_MEDIA cannot be enabled in NODE_ENV=production',
    );
  }

  const seedTag = process.env.STAGED_SAMPLE_MEDIA_SEED_TAG?.trim();
  if (!seedTag) {
    throw new Error(
      'STAGED_SAMPLE_MEDIA_SEED_TAG is required when staged media is enabled',
    );
  }
  return seedTag;
}

export function stagedSampleMediaPublicStatus(
  status: ProductStatus,
  isSelectedPreviewRecord: boolean,
): ProductStatus {
  return isSelectedPreviewRecord ? ProductStatus.active : status;
}
