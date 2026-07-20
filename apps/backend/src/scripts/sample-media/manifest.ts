import { existsSync } from 'fs';
import { resolve } from 'path';
import { z } from 'zod';
import { readJsonFile, resolveReadablePath } from './paths';

const httpsUrlSchema = z
  .string()
  .url()
  .refine((value) => new URL(value).protocol === 'https:', {
    message: 'Source URL must use HTTPS',
  });

const sourceIdentitySchema = z.object({
  sourceKey: z.string().min(1),
  sortOrder: z.number().int().positive(),
  sourceUrl: httpsUrlSchema,
  sourceFileName: z.string().min(1),
  targetStorageFolder: z.string().min(1),
});

const homepageRecordSchema = sourceIdentitySchema
  .extend({
    intendedRole: z.string().min(1).nullable(),
    notes: z.string(),
  })
  .strict();

const collectionRecordSchema = sourceIdentitySchema
  .extend({
    targetEntity: z.literal('product-or-collection-media'),
    notes: z.string(),
  })
  .strict();

const backgroundRecordSchema = sourceIdentitySchema
  .extend({
    name: z.string().min(1),
    slug: z.string().min(1),
    category: z.string().min(1),
    naturalWidth: z.number().int().positive(),
    naturalHeight: z.number().int().positive(),
    targetEntity: z.literal('frame-background-or-template'),
    isActive: z.boolean(),
  })
  .strict();

const charmRecordSchema = sourceIdentitySchema
  .extend({
    rawName: z.string().min(1),
    name: z.string().min(1),
    slug: z.string().min(1),
    category: z.string().min(1),
    priceVnd: z.number().int().nonnegative(),
    originalPriceVnd: z.number().int().nonnegative().nullable(),
    naturalWidth: z.number().int().positive(),
    naturalHeight: z.number().int().positive(),
    targetEntity: z.literal('accessory'),
    isActive: z.boolean(),
  })
  .strict();

export const sampleMediaManifestSchema = z
  .object({
    manifestVersion: z.literal(1),
    generatedFor: z.string().min(1),
    source: z
      .object({
        label: z.string().min(1),
        inputFile: z.string().min(1),
        requiresUsageAuthorization: z.literal(true),
        hotlinkingAllowed: z.literal(false),
        instruction: z.string().min(1),
      })
      .strict(),
    seed: z
      .object({
        seedTag: z.string().min(1),
        defaultMode: z.literal('dry-run'),
        idempotencyKeyField: z.literal('sourceKey'),
        rollbackRequired: z.literal(true),
      })
      .strict(),
    counts: z
      .object({
        homepageRecords: z.number().int().nonnegative(),
        collectionRecords: z.number().int().nonnegative(),
        studioBackgroundRecords: z.number().int().nonnegative(),
        studioCharmRecords: z.number().int().nonnegative(),
        totalRecords: z.number().int().nonnegative(),
        uniqueSourceUrls: z.number().int().nonnegative(),
        homepageCollectionOverlap: z.number().int().nonnegative(),
      })
      .strict(),
    homepage: z.array(homepageRecordSchema),
    collection: z.array(collectionRecordSchema),
    studioBackgrounds: z.array(backgroundRecordSchema),
    studioCharms: z.array(charmRecordSchema),
  })
  .strict()
  .superRefine((manifest, context) => {
    const allRecords = [
      ...manifest.homepage,
      ...manifest.collection,
      ...manifest.studioBackgrounds,
      ...manifest.studioCharms,
    ];
    const expectedCounts = [
      ['homepageRecords', manifest.homepage.length],
      ['collectionRecords', manifest.collection.length],
      ['studioBackgroundRecords', manifest.studioBackgrounds.length],
      ['studioCharmRecords', manifest.studioCharms.length],
      ['totalRecords', allRecords.length],
      [
        'uniqueSourceUrls',
        new Set(allRecords.map((record) => record.sourceUrl)).size,
      ],
    ] as const;

    for (const [field, actual] of expectedCounts) {
      if (manifest.counts[field] !== actual) {
        context.addIssue({
          code: 'custom',
          path: ['counts', field],
          message: `Declared ${manifest.counts[field]} but found ${actual}`,
        });
      }
    }

    const sourceKeys = new Set<string>();
    for (const [index, record] of allRecords.entries()) {
      if (sourceKeys.has(record.sourceKey)) {
        context.addIssue({
          code: 'custom',
          path: ['records', index, 'sourceKey'],
          message: `Duplicate sourceKey: ${record.sourceKey}`,
        });
      }
      sourceKeys.add(record.sourceKey);
    }

    const homepageUrls = new Set(
      manifest.homepage.map((record) => record.sourceUrl),
    );
    const overlap = new Set(
      manifest.collection
        .map((record) => record.sourceUrl)
        .filter((sourceUrl) => homepageUrls.has(sourceUrl)),
    ).size;
    if (manifest.counts.homepageCollectionOverlap !== overlap) {
      context.addIssue({
        code: 'custom',
        path: ['counts', 'homepageCollectionOverlap'],
        message: `Declared ${manifest.counts.homepageCollectionOverlap} but found ${overlap}`,
      });
    }
  });

export type SampleMediaManifest = z.infer<typeof sampleMediaManifestSchema>;
export type HomepageManifestRecord = SampleMediaManifest['homepage'][number];
export type CollectionManifestRecord =
  SampleMediaManifest['collection'][number];
export type BackgroundManifestRecord =
  SampleMediaManifest['studioBackgrounds'][number];
export type CharmManifestRecord = SampleMediaManifest['studioCharms'][number];
export type ImportKind = 'homepage' | 'collection' | 'backgrounds' | 'charms';

export type NormalizedManifestRecord =
  | { kind: 'homepage'; record: HomepageManifestRecord }
  | { kind: 'collection'; record: CollectionManifestRecord }
  | { kind: 'backgrounds'; record: BackgroundManifestRecord }
  | { kind: 'charms'; record: CharmManifestRecord };

const homepageMappingSchema = z
  .object({
    sourceKey: z.string().min(1),
    target: z.literal('banner').default('banner'),
    slot: z.enum([
      'hero',
      'story',
      'friendship',
      'transformation',
      'final-cta',
    ]),
    sortOrder: z.number().int().nonnegative().optional(),
    linkUrl: z.string().min(1).optional(),
  })
  .strict();

const collectionEntityMappingSchema = z
  .object({
    sourceKey: z.string().min(1),
    target: z.literal('collection'),
    slug: z.string().min(1),
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    sortOrder: z.number().int().optional(),
    createIfMissing: z.boolean().default(false),
  })
  .strict();

const productEntityMappingSchema = z
  .object({
    sourceKey: z.string().min(1),
    target: z.literal('product'),
    slug: z.string().min(1),
  })
  .strict();

export const sampleMediaMappingSchema = z
  .object({
    version: z.literal(1).optional(),
    homepage: z.array(homepageMappingSchema).default([]),
    collection: z
      .array(
        z.discriminatedUnion('target', [
          collectionEntityMappingSchema,
          productEntityMappingSchema,
        ]),
      )
      .default([]),
  })
  .strict();

export type SampleMediaMapping = z.infer<typeof sampleMediaMappingSchema>;
export type HomepageMapping = SampleMediaMapping['homepage'][number];
export type CollectionMapping = SampleMediaMapping['collection'][number];

export function parseManifest(value: unknown): SampleMediaManifest {
  return sampleMediaManifestSchema.parse(value);
}

export function normalizeManifest(
  manifest: SampleMediaManifest,
): NormalizedManifestRecord[] {
  return [
    ...manifest.homepage.map(
      (record): NormalizedManifestRecord => ({ kind: 'homepage', record }),
    ),
    ...manifest.collection.map(
      (record): NormalizedManifestRecord => ({ kind: 'collection', record }),
    ),
    ...manifest.studioBackgrounds.map(
      (record): NormalizedManifestRecord => ({ kind: 'backgrounds', record }),
    ),
    ...manifest.studioCharms.map(
      (record): NormalizedManifestRecord => ({ kind: 'charms', record }),
    ),
  ];
}

export function loadCuratedMapping(options: {
  repositoryRoot: string;
  explicitPath?: string;
  manifest: SampleMediaManifest;
}): { mapping: SampleMediaMapping; path?: string } {
  const defaultPath = resolve(
    options.repositoryRoot,
    'data',
    'import',
    'theluvin-media.mapping.json',
  );
  const mappingPath = options.explicitPath
    ? resolveReadablePath(options.explicitPath, options.repositoryRoot)
    : existsSync(defaultPath)
      ? defaultPath
      : undefined;

  if (!mappingPath) {
    return { mapping: { homepage: [], collection: [] } };
  }

  const mapping = sampleMediaMappingSchema.parse(readJsonFile(mappingPath));
  validateMappingReferences(mapping, options.manifest);
  return { mapping, path: mappingPath };
}

function validateMappingReferences(
  mapping: SampleMediaMapping,
  manifest: SampleMediaManifest,
): void {
  const homepageKeys = new Set(
    manifest.homepage.map((record) => record.sourceKey),
  );
  const collectionKeys = new Set(
    manifest.collection.map((record) => record.sourceKey),
  );
  const seenSourceKeys = new Set<string>();
  const seenHomepageSlots = new Set<string>();
  const seenCollectionTargets = new Set<string>();

  for (const item of mapping.homepage) {
    if (!homepageKeys.has(item.sourceKey)) {
      throw new Error(
        `Homepage mapping references unknown sourceKey ${item.sourceKey}`,
      );
    }
    if (seenSourceKeys.has(item.sourceKey)) {
      throw new Error(`Mapping repeats sourceKey ${item.sourceKey}`);
    }
    if (seenHomepageSlots.has(item.slot)) {
      throw new Error(`Homepage mapping repeats slot ${item.slot}`);
    }
    seenSourceKeys.add(item.sourceKey);
    seenHomepageSlots.add(item.slot);
  }

  for (const item of mapping.collection) {
    if (!collectionKeys.has(item.sourceKey)) {
      throw new Error(
        `Collection mapping references unknown sourceKey ${item.sourceKey}`,
      );
    }
    if (seenSourceKeys.has(item.sourceKey)) {
      throw new Error(`Mapping repeats sourceKey ${item.sourceKey}`);
    }

    const targetKey = `${item.target}:${item.slug}`;
    if (item.target === 'collection' && seenCollectionTargets.has(targetKey)) {
      throw new Error(`Collection mapping repeats target ${targetKey}`);
    }

    seenSourceKeys.add(item.sourceKey);
    if (item.target === 'collection') seenCollectionTargets.add(targetKey);
  }
}
