import sharp from 'sharp';
import type { ImportKind } from './manifest';

export type ProcessedImage = {
  bytes: Buffer;
  mimeType: 'image/png' | 'image/webp';
  extension: '.png' | '.webp';
  width: number;
  height: number;
};

export type ProcessedImageSet = {
  main: ProcessedImage;
  thumbnail?: ProcessedImage;
  sourceWidth: number;
  sourceHeight: number;
  sourceHasAlpha: boolean;
};

const MAIN_LIMITS: Record<ImportKind, { width: number; height: number }> = {
  homepage: { width: 2_000, height: 2_000 },
  collection: { width: 2_000, height: 2_000 },
  backgrounds: { width: 2_400, height: 2_400 },
  charms: { width: 1_200, height: 1_200 },
};

export async function processImage(
  bytes: Buffer,
  kind: ImportKind,
): Promise<ProcessedImageSet> {
  const metadata = await sharp(bytes, {
    animated: false,
    failOn: 'error',
    limitInputPixels: 100_000_000,
  }).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Image decoder did not return valid dimensions');
  }

  const preservePng = kind === 'charms' || metadata.hasAlpha === true;
  const limits = MAIN_LIMITS[kind];
  const main = await renderImage(bytes, limits, preservePng);
  const thumbnail =
    kind === 'backgrounds'
      ? await renderImage(bytes, { width: 480, height: 480 }, preservePng)
      : undefined;

  return {
    main,
    thumbnail,
    sourceWidth: metadata.width,
    sourceHeight: metadata.height,
    sourceHasAlpha: metadata.hasAlpha === true,
  };
}

async function renderImage(
  bytes: Buffer,
  limits: { width: number; height: number },
  preservePng: boolean,
): Promise<ProcessedImage> {
  let pipeline = sharp(bytes, {
    animated: false,
    failOn: 'error',
    limitInputPixels: 100_000_000,
  })
    .rotate()
    .resize({
      width: limits.width,
      height: limits.height,
      fit: 'inside',
      withoutEnlargement: true,
      fastShrinkOnLoad: true,
    });

  if (preservePng) {
    pipeline = pipeline.png({
      compressionLevel: 9,
      adaptiveFiltering: true,
      palette: false,
    });
  } else {
    pipeline = pipeline.webp({
      quality: 84,
      alphaQuality: 100,
      effort: 5,
      smartSubsample: true,
    });
  }

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  if (!info.width || !info.height) {
    throw new Error('Image encoder did not return valid dimensions');
  }

  return {
    bytes: data,
    mimeType: preservePng ? 'image/png' : 'image/webp',
    extension: preservePng ? '.png' : '.webp',
    width: info.width,
    height: info.height,
  };
}
