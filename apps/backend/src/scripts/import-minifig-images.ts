import { PrismaPg } from '@prisma/adapter-pg';
import {
  CharacterPartType,
  Prisma,
  PrismaClient,
  ProductStatus,
} from '@prisma/client';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';
import { config as loadEnv } from 'dotenv';
import { accessSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';

type CatalogItem = {
  id: string;
  title: string;
  handle: string | null;
  category: string;
  categorySlug: string;
  mainImage: string | null;
  mainImageAlt: string | null;
  reverseImage: string | null;
  availableForSale: boolean;
  totalInventory: number | null;
  price: {
    min: string | null;
    max: string | null;
    currency: string | null;
  };
  subcategories: string[];
  warning: string | null;
};

type CatalogCategory = {
  items: CatalogItem[];
};

type MinifigsCatalog = {
  meta: {
    uniqueProducts: number;
  };
  categories: Record<string, CatalogCategory>;
};

type ImportTarget = {
  item: CatalogItem;
  sourceCategorySlug: string;
  type: CharacterPartType;
  sortOrder: number;
};

type ExistingCatalogMetadata = {
  source?: unknown;
  sourceHash?: unknown;
  mainStoragePath?: unknown;
  reverseStoragePath?: unknown;
  reverseImageUrl?: unknown;
  sourcePriceMin?: unknown;
  sourcePriceMax?: unknown;
  sourcePriceCurrency?: unknown;
  pricingStrategy?: unknown;
  compositionMode?: unknown;
};

type StoredCatalogImage = {
  publicUrl: string;
  storagePath: string;
  uploaded: boolean;
};

type ImportReport = {
  mode: 'apply' | 'dry-run';
  startedAt: string;
  finishedAt?: string;
  catalogPath: string;
  bucket: string;
  pricing: {
    strategy: 'project-tier-v1';
    roundingUnit: number;
    rules: Partial<
      Record<
        CharacterPartType,
        { multiplier: number; minimum: number; maximum: number }
      >
    >;
  };
  sourceProducts: number;
  targetParts: number;
  targetPartsWithMainImage: number;
  targetReverseImages: number;
  skipped: {
    giftDisplay: number;
    noMainImage: number;
    noSelectionAction: number;
  };
  images: {
    planned: number;
    uploaded: number;
    reused: number;
    failed: number;
  };
  records: {
    created: number;
    updated: number;
    reused: number;
    failed: number;
  };
  partsByType: Partial<Record<CharacterPartType, number>>;
  publicUrlSamples: string[];
  errors: Array<{
    id: string;
    title: string;
    message: string;
  }>;
};

const CATALOG_SOURCE = 'minifigs-catalog';
const IMPORT_SCHEMA_VERSION = 1;
const DEFAULT_CONCURRENCY = 4;
const DEFAULT_RETRIES = 2;
const PRICE_ROUNDING_UNIT = 1_000;
const PRICING_STRATEGY = 'project-tier-v1';
const PROJECT_PRICE_RULES: Partial<
  Record<
    CharacterPartType,
    { multiplier: number; minimum: number; maximum: number }
  >
> = {
  [CharacterPartType.HAIR]: {
    multiplier: 3_000,
    minimum: 5_000,
    maximum: 15_000,
  },
  [CharacterPartType.HAT]: {
    multiplier: 4_000,
    minimum: 8_000,
    maximum: 18_000,
  },
  [CharacterPartType.TORSO]: {
    multiplier: 2_500,
    minimum: 10_000,
    maximum: 50_000,
  },
  [CharacterPartType.LEGS]: {
    multiplier: 2_000,
    minimum: 5_000,
    maximum: 30_000,
  },
  [CharacterPartType.ACCESSORY]: {
    multiplier: 5_000,
    minimum: 5_000,
    maximum: 25_000,
  },
};
const MAX_CONCURRENCY = 8;
const NO_HAT_OR_HAIR = 'no hat or hair';
const HAT_SUBCATEGORIES = new Set([
  'hats, helmets & headwear',
  'hats',
  'helmets',
  'caps',
  'crowns',
  'tiaras',
  'headwear',
]);
const HAT_TITLE_PATTERN = /\b(hat|helmet|cap|crown|tiara|beanie|hood)\b/i;
const CONTENT_TYPE_EXTENSIONS = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

function parseIntegerArgument(name: string, fallback: number): number {
  const prefix = `--${name}=`;
  const rawValue = process.argv.find((argument) => argument.startsWith(prefix));
  if (!rawValue) return fallback;

  const parsed = Number(rawValue.slice(prefix.length));
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`--${name} must be a positive integer`);
  }

  return parsed;
}

function hasArgument(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function getCatalogPriceAdjustment(
  item: CatalogItem,
  type: CharacterPartType,
): number {
  const rawPrice = item.price.min;
  if (!rawPrice) return 0;

  const sourcePrice = Number(rawPrice);
  if (!Number.isFinite(sourcePrice) || sourcePrice < 0) {
    throw new Error(`Invalid catalog price "${rawPrice}" for ${item.title}`);
  }
  const currency = item.price.currency?.trim().toLocaleUpperCase('en');
  if (currency !== 'GBP') {
    throw new Error(
      `Unsupported catalog currency "${currency || 'unknown'}" for ${item.title}`,
    );
  }
  const rule = PROJECT_PRICE_RULES[type];
  if (!rule) return 0;

  const scaledPrice =
    Math.round((sourcePrice * rule.multiplier) / PRICE_ROUNDING_UNIT) *
    PRICE_ROUNDING_UNIT;
  return Math.min(rule.maximum, Math.max(rule.minimum, scaledPrice));
}

function findRepositoryRoot(startDirectory: string): string {
  let cursor = resolve(startDirectory);

  while (true) {
    const candidate = join(cursor, 'data', 'minifigs-catalog-clean.json');
    try {
      accessSync(candidate);
      return cursor;
    } catch {
      const parent = resolve(cursor, '..');
      if (parent === cursor) {
        throw new Error(
          'Could not find data/minifigs-catalog-clean.json from the current directory',
        );
      }
      cursor = parent;
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function assertCatalog(value: unknown): asserts value is MinifigsCatalog {
  if (
    !isRecord(value) ||
    !isRecord(value.meta) ||
    !isRecord(value.categories)
  ) {
    throw new Error('Catalog root is invalid');
  }

  for (const slug of [
    'hair-hats',
    'bodies',
    'legs',
    'gift-display',
    'accessories',
  ]) {
    const category = value.categories[slug];
    if (!isRecord(category) || !Array.isArray(category.items)) {
      throw new Error(`Catalog category "${slug}" is missing or invalid`);
    }
  }
}

function normalizeSubcategory(value: string): string {
  return value.trim().toLocaleLowerCase('en');
}

export function isHatCatalogItem(item: CatalogItem): boolean {
  const hasExplicitHatSubcategory = item.subcategories.some((subcategory) =>
    HAT_SUBCATEGORIES.has(normalizeSubcategory(subcategory)),
  );
  if (hasExplicitHatSubcategory) return true;

  // Rich hair collections such as "Hairs Compatible with Tiaras" must not be
  // classified as hats merely because they contain a headwear keyword.
  if (item.subcategories.length > 0) return false;

  return HAT_TITLE_PATTERN.test(item.title);
}

function buildImportTargets(catalog: MinifigsCatalog): {
  targets: ImportTarget[];
  noSelectionActionCount: number;
} {
  const targets: ImportTarget[] = [];
  const sortOrders = new Map<CharacterPartType, number>();
  let noSelectionActionCount = 0;

  const pushTarget = (
    item: CatalogItem,
    sourceCategorySlug: string,
    type: CharacterPartType,
  ) => {
    const sortOrder = sortOrders.get(type) ?? 0;
    targets.push({ item, sourceCategorySlug, type, sortOrder });
    sortOrders.set(type, sortOrder + 1);
  };

  for (const item of catalog.categories['hair-hats']?.items ?? []) {
    if (item.title.trim().toLocaleLowerCase('en') === NO_HAT_OR_HAIR) {
      noSelectionActionCount += 1;
      continue;
    }
    pushTarget(
      item,
      'hair-hats',
      isHatCatalogItem(item) ? CharacterPartType.HAT : CharacterPartType.HAIR,
    );
  }

  for (const item of catalog.categories.bodies?.items ?? []) {
    pushTarget(item, 'bodies', CharacterPartType.TORSO);
  }

  for (const item of catalog.categories.legs?.items ?? []) {
    pushTarget(item, 'legs', CharacterPartType.LEGS);
  }

  for (const item of catalog.categories.accessories?.items ?? []) {
    pushTarget(item, 'accessories', CharacterPartType.ACCESSORY);
  }

  return { targets, noSelectionActionCount };
}

function safeSourceId(sourceId: string): string {
  const normalized = sourceId
    .replace(/^gid:\/\/shopify\/Product\//, '')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72);
  const suffix = createHash('sha256')
    .update(sourceId)
    .digest('hex')
    .slice(0, 10);
  return `${normalized || 'product'}-${suffix}`.toLocaleLowerCase('en');
}

function buildSourceHash(target: ImportTarget): string {
  return createHash('sha256')
    .update(
      JSON.stringify({
        version: IMPORT_SCHEMA_VERSION,
        type: target.type,
        id: target.item.id,
        title: target.item.title,
        mainImage: target.item.mainImage,
        mainImageAlt: target.item.mainImageAlt,
        reverseImage: target.item.reverseImage,
        availableForSale: target.item.availableForSale,
        totalInventory: target.item.totalInventory,
        subcategories: target.item.subcategories,
        warning: target.item.warning,
      }),
    )
    .digest('hex');
}

function readCatalogMetadata(value: Prisma.JsonValue | null) {
  if (!isRecord(value)) return null;
  return value as ExistingCatalogMetadata;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function normalizeSupabaseProjectUrl(rawValue: string): string {
  const parsed = new URL(rawValue.trim());
  if (parsed.protocol !== 'https:') {
    throw new Error('SUPABASE_URL must use HTTPS');
  }

  // Older project env files use the PostgREST endpoint. Supabase JS requires
  // the project origin for Storage requests.
  return parsed.origin;
}

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function resolveSupabaseKey(): string {
  const key =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error(
      'A backend-only SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY is required',
    );
  }
  return key;
}

function normalizeStoragePublicBaseUrl(rawValue: string, bucket: string) {
  const normalized = rawValue.trim().replace(/\/+$/, '');
  const parsed = new URL(normalized);
  if (parsed.protocol !== 'https:') {
    throw new Error('STORAGE_PUBLIC_BASE_URL must use HTTPS');
  }
  if (!parsed.pathname.endsWith(`/storage/v1/object/public/${bucket}`)) {
    throw new Error(
      'STORAGE_PUBLIC_BASE_URL must point to the configured public Supabase bucket',
    );
  }
  return normalized;
}

function sleep(durationMs: number) {
  return new Promise<void>((resolvePromise) => {
    setTimeout(resolvePromise, durationMs);
  });
}

async function downloadImage(
  url: string,
  retries: number,
): Promise<{ buffer: Buffer; contentType: string; extension: string }> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8',
          'User-Agent': 'FigureLabCatalogImporter/1.0',
        },
        signal: AbortSignal.timeout(25_000),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const contentType = (response.headers.get('content-type') ?? '')
        .split(';')[0]
        ?.trim()
        .toLocaleLowerCase('en');
      const extensionFromType = CONTENT_TYPE_EXTENSIONS.get(contentType);
      const extensionFromUrl = extname(new URL(url).pathname)
        .replace(/^\./, '')
        .toLocaleLowerCase('en');
      const extension =
        extensionFromType ||
        (['jpg', 'jpeg', 'png', 'webp'].includes(extensionFromUrl)
          ? extensionFromUrl.replace('jpeg', 'jpg')
          : null);
      if (!extension) {
        throw new Error(`Unsupported image content type "${contentType}"`);
      }

      const normalizedContentType =
        contentType ||
        (extension === 'jpg' ? 'image/jpeg' : `image/${extension}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      if (!buffer.byteLength) throw new Error('Downloaded image is empty');

      return { buffer, contentType: normalizedContentType, extension };
    } catch (error) {
      lastError = error;
      if (attempt < retries) await sleep(350 * 3 ** attempt);
    }
  }

  throw new Error(
    `Image download failed after ${retries + 1} attempts: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}

async function publicImageExists(url: string | null): Promise<boolean> {
  if (!url) return false;

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function storeCatalogImage(input: {
  supabase: SupabaseClient;
  bucket: string;
  storagePublicBaseUrl: string;
  target: ImportTarget;
  side: 'front' | 'back';
  sourceUrl: string;
  retries: number;
}): Promise<StoredCatalogImage> {
  const downloaded = await downloadImage(input.sourceUrl, input.retries);
  const sourceId = safeSourceId(input.target.item.id);
  const objectPath = [
    'uploads',
    'minifig-parts',
    input.target.type.toLocaleLowerCase('en'),
    sourceId,
    `${input.side}.${downloaded.extension}`,
  ].join('/');
  const { error } = await input.supabase.storage
    .from(input.bucket)
    .upload(objectPath, downloaded.buffer, {
      cacheControl: '31536000',
      contentType: downloaded.contentType,
      upsert: true,
    });
  if (error) {
    throw new Error(
      `Supabase upload failed for ${objectPath}: ${error.message}`,
    );
  }

  const publicUrl = input.supabase.storage
    .from(input.bucket)
    .getPublicUrl(objectPath).data.publicUrl;
  if (!publicUrl.startsWith(`${input.storagePublicBaseUrl}/`)) {
    throw new Error(
      `Generated public URL does not use STORAGE_PUBLIC_BASE_URL: ${publicUrl}`,
    );
  }

  return {
    publicUrl,
    storagePath: `/${objectPath}`,
    uploaded: true,
  };
}

async function mapWithConcurrency<T>(
  items: T[],
  concurrency: number,
  callback: (item: T, index: number) => Promise<void>,
) {
  let cursor = 0;

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        const item = items[index];
        if (item) await callback(item, index);
      }
    }),
  );
}

function buildCompatibility(input: {
  target: ImportTarget;
  sourceHash: string;
  mainImage: StoredCatalogImage;
  reverseImage: StoredCatalogImage | null;
}): Prisma.InputJsonObject {
  const pricingRule = PROJECT_PRICE_RULES[input.target.type];

  return {
    source: CATALOG_SOURCE,
    sourceProductId: input.target.item.id,
    sourceHandle: input.target.item.handle,
    sourceCatalogCategory: input.target.sourceCategorySlug,
    sourceHash: input.sourceHash,
    mainStoragePath: input.mainImage.storagePath,
    reverseStoragePath: input.reverseImage?.storagePath ?? null,
    reverseImageUrl: input.reverseImage?.publicUrl ?? null,
    imageAlt: input.target.item.mainImageAlt,
    subcategories: input.target.item.subcategories,
    warning: input.target.item.warning,
    availableForSale: input.target.item.availableForSale,
    totalInventory: input.target.item.totalInventory,
    sourcePriceMin: input.target.item.price.min,
    sourcePriceMax: input.target.item.price.max,
    sourcePriceCurrency: input.target.item.price.currency,
    pricingStrategy: PRICING_STRATEGY,
    pricingMultiplier: pricingRule?.multiplier ?? null,
    pricingMinimum: pricingRule?.minimum ?? null,
    pricingMaximum: pricingRule?.maximum ?? null,
    pricingRoundingUnit: PRICE_ROUNDING_UNIT,
    compositionMode: 'slot',
    layerCompatible: false,
  };
}

async function importTarget(input: {
  prisma: PrismaClient;
  supabase: SupabaseClient;
  bucket: string;
  storagePublicBaseUrl: string;
  target: ImportTarget;
  retries: number;
  report: ImportReport;
}) {
  const { item } = input.target;
  if (!item.mainImage) {
    input.report.skipped.noMainImage += 1;
    return;
  }

  const sourceId = safeSourceId(item.id);
  const slug = `minifigs-${sourceId}`;
  const sourceHash = buildSourceHash(input.target);
  const existing = await input.prisma.characterPart.findUnique({
    where: { slug },
  });
  const existingMetadata = readCatalogMetadata(existing?.compatibility ?? null);
  const existingMainPath = readString(existingMetadata?.mainStoragePath);
  const existingReversePath = readString(existingMetadata?.reverseStoragePath);
  const existingReverseUrl = readString(existingMetadata?.reverseImageUrl);
  const priceAdjustment = getCatalogPriceAdjustment(item, input.target.type);
  const isUnchanged =
    existingMetadata?.source === CATALOG_SOURCE &&
    existingMetadata.sourceHash === sourceHash;

  if (
    existing &&
    isUnchanged &&
    existingMainPath &&
    (await publicImageExists(existing.imageUrl)) &&
    (!item.reverseImage ||
      (existingReversePath && (await publicImageExists(existingReverseUrl))))
  ) {
    input.report.images.reused += item.reverseImage ? 2 : 1;
    const pricingMetadataChanged =
      readString(existingMetadata?.sourcePriceMin) !== item.price.min ||
      readString(existingMetadata?.sourcePriceMax) !== item.price.max ||
      readString(existingMetadata?.sourcePriceCurrency) !==
        item.price.currency ||
      existingMetadata?.pricingStrategy !== PRICING_STRATEGY ||
      existingMetadata?.compositionMode !== 'slot';

    if (
      existing.priceAdjustment !== priceAdjustment ||
      pricingMetadataChanged
    ) {
      const compatibility = buildCompatibility({
        target: input.target,
        sourceHash,
        mainImage: {
          publicUrl: existing.imageUrl,
          storagePath: existingMainPath,
          uploaded: false,
        },
        reverseImage:
          item.reverseImage && existingReversePath && existingReverseUrl
            ? {
                publicUrl: existingReverseUrl,
                storagePath: existingReversePath,
                uploaded: false,
              }
            : null,
      });
      await input.prisma.characterPart.update({
        where: { id: existing.id },
        data: {
          priceAdjustment,
          compatibility,
        },
      });
      input.report.records.updated += 1;
    } else {
      input.report.records.reused += 1;
    }
    if (input.report.publicUrlSamples.length < 5) {
      input.report.publicUrlSamples.push(existing.imageUrl);
    }
    return;
  }

  const mainImage = await storeCatalogImage({
    supabase: input.supabase,
    bucket: input.bucket,
    storagePublicBaseUrl: input.storagePublicBaseUrl,
    target: input.target,
    side: 'front',
    sourceUrl: item.mainImage,
    retries: input.retries,
  });
  input.report.images.uploaded += 1;

  let reverseImage: StoredCatalogImage | null = null;
  if (item.reverseImage) {
    reverseImage = await storeCatalogImage({
      supabase: input.supabase,
      bucket: input.bucket,
      storagePublicBaseUrl: input.storagePublicBaseUrl,
      target: input.target,
      side: 'back',
      sourceUrl: item.reverseImage,
      retries: input.retries,
    });
    input.report.images.uploaded += 1;
  }

  const availability =
    item.availableForSale && item.totalInventory !== 0
      ? 'available'
      : 'unavailable';
  const uniqueTags = Array.from(
    new Set(
      [item.category, ...item.subcategories]
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
  const primaryCategory =
    item.subcategories.find((subcategory) => subcategory.trim())?.trim() ??
    item.category.trim() ??
    null;
  const compatibility = buildCompatibility({
    target: input.target,
    sourceHash,
    mainImage,
    reverseImage,
  });

  await input.prisma.characterPart.upsert({
    where: { slug },
    create: {
      name: item.title,
      slug,
      type: input.target.type,
      imageUrl: mainImage.publicUrl,
      priceAdjustment,
      category: primaryCategory,
      availability,
      isActive: true,
      compatibility,
      status: ProductStatus.active,
      sortOrder: input.target.sortOrder,
      tags: uniqueTags,
    },
    update: {
      name: item.title,
      type: input.target.type,
      imageUrl: mainImage.publicUrl,
      priceAdjustment,
      category: primaryCategory,
      availability,
      isActive: true,
      compatibility,
      status: ProductStatus.active,
      sortOrder: input.target.sortOrder,
      tags: uniqueTags,
    },
  });

  if (existing) {
    input.report.records.updated += 1;
  } else {
    input.report.records.created += 1;
  }
  if (input.report.publicUrlSamples.length < 5) {
    input.report.publicUrlSamples.push(mainImage.publicUrl);
  }
}

async function main() {
  const repositoryRoot = findRepositoryRoot(process.cwd());
  const backendRoot = join(repositoryRoot, 'apps', 'backend');
  loadEnv({ path: join(backendRoot, '.env.local'), quiet: true });
  loadEnv({ path: join(backendRoot, '.env'), quiet: true });

  const apply = hasArgument('apply');
  const dryRun = hasArgument('dry-run') || !apply;
  if (apply && hasArgument('dry-run')) {
    throw new Error('Use either --apply or --dry-run, not both');
  }
  if (apply && process.env.IMPORT_MINIFIG_ASSETS !== 'true') {
    throw new Error(
      'Set IMPORT_MINIFIG_ASSETS=true for the import process before using --apply',
    );
  }

  const concurrency = Math.min(
    MAX_CONCURRENCY,
    parseIntegerArgument(
      'concurrency',
      Number(process.env.IMPORT_CONCURRENCY) || DEFAULT_CONCURRENCY,
    ),
  );
  const retries = parseIntegerArgument(
    'retries',
    Number(process.env.IMPORT_DOWNLOAD_RETRIES) || DEFAULT_RETRIES,
  );
  const hasLimitArgument = process.argv.some((argument) =>
    argument.startsWith('--limit='),
  );
  const limit = hasLimitArgument ? parseIntegerArgument('limit', 1) : undefined;
  const catalogPath = join(
    repositoryRoot,
    'data',
    'minifigs-catalog-clean.json',
  );
  const catalogValue: unknown = JSON.parse(await readFile(catalogPath, 'utf8'));
  assertCatalog(catalogValue);
  const catalog = catalogValue;
  const { targets: allTargets, noSelectionActionCount } =
    buildImportTargets(catalog);
  const targets = limit ? allTargets.slice(0, limit) : allTargets;
  const bucket = requiredEnvironment('SUPABASE_STORAGE_BUCKET');
  const storagePublicBaseUrl = normalizeStoragePublicBaseUrl(
    requiredEnvironment('STORAGE_PUBLIC_BASE_URL'),
    bucket,
  );
  const supabaseUrl = normalizeSupabaseProjectUrl(
    requiredEnvironment('SUPABASE_URL'),
  );
  const supabase = createClient(supabaseUrl, resolveSupabaseKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const databaseUrl = requiredEnvironment('DATABASE_URL');
  const databaseSchema = process.env.DATABASE_SCHEMA?.trim();
  const prisma = new PrismaClient({
    adapter: new PrismaPg(
      { connectionString: databaseUrl },
      databaseSchema ? { schema: databaseSchema } : undefined,
    ),
  });

  const report: ImportReport = {
    mode: dryRun ? 'dry-run' : 'apply',
    startedAt: new Date().toISOString(),
    catalogPath,
    bucket,
    pricing: {
      strategy: PRICING_STRATEGY,
      roundingUnit: PRICE_ROUNDING_UNIT,
      rules: PROJECT_PRICE_RULES,
    },
    sourceProducts: catalog.meta.uniqueProducts,
    targetParts: targets.length,
    targetPartsWithMainImage: targets.filter((target) => target.item.mainImage)
      .length,
    targetReverseImages: targets.filter((target) => target.item.reverseImage)
      .length,
    skipped: {
      giftDisplay: catalog.categories['gift-display']?.items.length ?? 0,
      noMainImage: 0,
      noSelectionAction: noSelectionActionCount,
    },
    images: {
      planned: targets.reduce(
        (total, target) =>
          total +
          (target.item.mainImage ? 1 : 0) +
          (target.item.reverseImage ? 1 : 0),
        0,
      ),
      uploaded: 0,
      reused: 0,
      failed: 0,
    },
    records: {
      created: 0,
      updated: 0,
      reused: 0,
      failed: 0,
    },
    partsByType: targets.reduce<Partial<Record<CharacterPartType, number>>>(
      (counts, target) => {
        counts[target.type] = (counts[target.type] ?? 0) + 1;
        return counts;
      },
      {},
    ),
    publicUrlSamples: [],
    errors: [],
  };

  const { data: buckets, error: bucketError } =
    await supabase.storage.listBuckets();
  if (bucketError) {
    throw new Error(
      `Could not inspect Supabase buckets: ${bucketError.message}`,
    );
  }
  const configuredBucket = buckets.find(
    (candidate) => candidate.name === bucket,
  );
  if (!configuredBucket) {
    throw new Error(`Supabase bucket "${bucket}" does not exist`);
  }
  if (!configuredBucket.public) {
    throw new Error(`Supabase bucket "${bucket}" must remain public/read-only`);
  }

  console.log(
    `[minifigs] ${report.mode}: ${report.targetParts} parts, ${report.images.planned} images, concurrency ${concurrency}`,
  );

  if (!dryRun) {
    await prisma.$connect();
    let completed = 0;
    await mapWithConcurrency(targets, concurrency, async (target) => {
      try {
        await importTarget({
          prisma,
          supabase,
          bucket,
          storagePublicBaseUrl,
          target,
          retries,
          report,
        });
      } catch (error) {
        const imageCount =
          (target.item.mainImage ? 1 : 0) + (target.item.reverseImage ? 1 : 0);
        report.images.failed += imageCount;
        report.records.failed += 1;
        report.errors.push({
          id: target.item.id,
          title: target.item.title,
          message: error instanceof Error ? error.message : String(error),
        });
        console.error(
          `[minifigs] failed: ${target.item.title}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      } finally {
        completed += 1;
        if (completed % 25 === 0 || completed === targets.length) {
          console.log(
            `[minifigs] ${completed}/${targets.length} parts; ${report.images.uploaded} uploaded; ${report.images.reused} reused; ${report.records.failed} failed`,
          );
        }
      }
    });
  } else {
    report.skipped.noMainImage = targets.filter(
      (target) => !target.item.mainImage,
    ).length;
  }

  report.finishedAt = new Date().toISOString();
  const timestamp = report.finishedAt.replace(/[:.]/g, '-');
  const reportPath = join(
    repositoryRoot,
    'data',
    'import',
    'reports',
    `minifigs-catalog-${report.mode}-${timestamp}.json`,
  );
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await prisma.$disconnect();

  console.log(
    JSON.stringify(
      {
        report: resolve(reportPath),
        sourceProducts: report.sourceProducts,
        targetParts: report.targetParts,
        pricing: report.pricing,
        images: report.images,
        records: report.records,
        skipped: report.skipped,
        publicUrlSamples: report.publicUrlSamples,
      },
      null,
      2,
    ),
  );

  if (report.errors.length > 0) process.exitCode = 1;
}

void main().catch((error) => {
  console.error(
    `[minifigs] import aborted: ${
      error instanceof Error ? error.stack || error.message : String(error)
    }`,
  );
  process.exitCode = 1;
});
