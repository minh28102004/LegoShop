import { config as loadEnv } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type SampleMediaImport } from '@prisma/client';
import { createHash } from 'crypto';
import { relative } from 'path';
import { UploadsService } from '../uploads/uploads.service';
import {
  deleteUnusedSeedCategories,
  evaluateRollback,
  persistImportedRecord,
  rollbackJournalRecord,
  storagePathHasReferences,
  type PersistedAsset,
  type TargetMapping,
} from './sample-media/database';
import { processImage } from './sample-media/image';
import {
  loadCuratedMapping,
  normalizeManifest,
  parseManifest,
  type ImportKind,
  type NormalizedManifestRecord,
  type SampleMediaMapping,
} from './sample-media/manifest';
import {
  downloadImage,
  type DownloadedImage,
  type DownloadOptions,
} from './sample-media/network';
import {
  findRepositoryRoot,
  readJsonFile,
  resolveReadablePath,
} from './sample-media/paths';
import {
  createEmptyCounts,
  writeImportReport,
  type ImportReport,
  type ReportRecord,
} from './sample-media/report';
import { redactSourceUrl, safeErrorMessage } from './sample-media/security';

loadEnv({ path: '.env.local', quiet: true });
loadEnv({ path: '.env', quiet: true });

type CliOptions = {
  manifestPath: string;
  mappingPath?: string;
  apply: boolean;
  dryRun: boolean;
  rollback: boolean;
  rollbackSeedTag?: string;
  only: Set<ImportKind>;
  concurrency: number;
  resume: boolean;
};

type RuntimeOptions = CliOptions &
  DownloadOptions & {
    repositoryRoot: string;
    publicAssetBaseUrl?: string;
  };

type AssetResult = {
  asset: PersistedAsset;
  uploadsCreated: number;
};

const ALL_KINDS: ImportKind[] = [
  'homepage',
  'collection',
  'backgrounds',
  'charms',
];
const DEFAULT_MANIFEST = 'data/import/theluvin-source.normalized.json';

async function main(): Promise<void> {
  const cli = parseCli(process.argv.slice(2));
  if (process.argv.slice(2).includes('--help')) {
    printHelp();
    return;
  }

  const repositoryRoot = findRepositoryRoot();
  const options: RuntimeOptions = {
    ...cli,
    repositoryRoot,
    publicAssetBaseUrl: process.env.STORAGE_PUBLIC_BASE_URL?.trim(),
    timeoutMs: readPositiveInteger('IMPORT_DOWNLOAD_TIMEOUT_MS', 20_000),
    maxBytes: readPositiveInteger('IMPORT_MAX_FILE_BYTES', 25_000_000),
    maxRedirects: readNonNegativeInteger('IMPORT_MAX_REDIRECTS', 5),
    maxRetries: readNonNegativeInteger('IMPORT_DOWNLOAD_RETRIES', 2),
  };

  if (options.apply) assertApplyEnvironment(options);

  const resolvedManifestPath = resolveReadablePath(
    options.manifestPath,
    repositoryRoot,
  );
  const manifest = parseManifest(readJsonFile(resolvedManifestPath));
  const curated = loadCuratedMapping({
    repositoryRoot,
    explicitPath: options.mappingPath,
    manifest,
  });
  const configuredSeedTag = process.env.IMPORT_SEED_TAG?.trim();
  const seedTag = configuredSeedTag || manifest.seed.seedTag;

  if (options.rollback) {
    const rollbackSeedTag = options.rollbackSeedTag ?? seedTag;
    await runRollback({
      options,
      seedTag: rollbackSeedTag,
      manifestPath: resolvedManifestPath,
      mappingPath: curated.path,
    });
    return;
  }

  await runImport({
    options,
    manifest,
    seedTag,
    mapping: curated.mapping,
    manifestPath: resolvedManifestPath,
    mappingPath: curated.path,
  });
}

async function runImport(input: {
  options: RuntimeOptions;
  manifest: ReturnType<typeof parseManifest>;
  seedTag: string;
  mapping: SampleMediaMapping;
  manifestPath: string;
  mappingPath?: string;
}): Promise<void> {
  const startedAt = Date.now();
  const selected = normalizeManifest(input.manifest)
    .filter((item) => input.options.only.has(item.kind))
    .sort((left, right) => {
      const leftMapping = mappingForItem(input.mapping, left);
      const rightMapping = mappingForItem(input.mapping, right);
      const leftPriority =
        left.kind === 'collection' && leftMapping?.target === 'collection'
          ? 0
          : 1;
      const rightPriority =
        right.kind === 'collection' && rightMapping?.target === 'collection'
          ? 0
          : 1;
      return leftPriority - rightPriority;
    });
  const report = createReport({
    seedTag: input.seedTag,
    mode: input.options.apply ? 'apply' : 'dry-run',
    options: input.options,
    manifestPath: input.manifestPath,
    mappingPath: input.mappingPath,
  });
  report.counts.total = input.manifest.counts.totalRecords;
  report.counts.selected = selected.length;

  const uploads = new UploadsService();
  const prisma = input.options.apply ? createPrismaClient() : undefined;
  const downloadPromises = new Map<string, Promise<DownloadedImage>>();
  const assetPromises = new Map<string, Promise<AssetResult>>();
  const backgroundThumbnailPromises = new Map<string, Promise<AssetResult>>();
  const firstSourceKeyByHash = new Map<string, string>();
  const sourceKeysByHash = new Map<string, string[]>();
  const results = new Array<ReportRecord>(selected.length);

  try {
    await prisma?.$connect();

    const getDownloaded = (sourceUrl: string): Promise<DownloadedImage> => {
      const existing = downloadPromises.get(sourceUrl);
      if (existing) return existing;

      const promise = downloadImage(sourceUrl, input.options).then(
        (downloaded) => {
          report.counts.downloaded += 1;
          return downloaded;
        },
      );
      downloadPromises.set(sourceUrl, promise);
      return promise;
    };

    let nextIndex = 0;
    const worker = async () => {
      while (true) {
        const index = nextIndex;
        nextIndex += 1;
        if (index >= selected.length) return;

        const item = selected[index];
        report.counts.read += 1;
        results[index] = await processRecord({
          item,
          options: input.options,
          seedTag: input.seedTag,
          mapping: mappingForItem(input.mapping, item),
          prisma,
          uploads,
          report,
          getDownloaded,
          assetPromises,
          backgroundThumbnailPromises,
          firstSourceKeyByHash,
          sourceKeysByHash,
        });
      }
    };

    await Promise.all(
      Array.from(
        { length: Math.min(input.options.concurrency, selected.length || 1) },
        worker,
      ),
    );
  } finally {
    await prisma?.$disconnect();
  }

  report.records = results.filter(Boolean);
  report.duplicateHashes = [...sourceKeysByHash.entries()]
    .filter(([, sourceKeys]) => sourceKeys.length > 1)
    .map(([sourceHash, sourceKeys]) => ({ sourceHash, sourceKeys }));
  report.finishedAt = new Date().toISOString();
  report.runtimeMs = Date.now() - startedAt;
  const reportBaseName = input.options.resume
    ? `${report.seedTag}-resume`
    : input.options.apply
      ? report.seedTag
      : `${report.seedTag}-dry-run`;
  const paths = await writeImportReport({
    report,
    repositoryRoot: input.options.repositoryRoot,
    baseName: reportBaseName,
  });

  console.log(
    `Sample media ${report.mode} finished: ${report.counts.errors} error(s), ${report.counts.uploaded} upload(s), ${report.counts.inserted} insert(s), ${report.counts.updated} update(s).`,
  );
  console.log(`Reports: ${paths.jsonPath}, ${paths.markdownPath}`);
  if (report.counts.errors > 0) process.exitCode = 1;
}

async function processRecord(input: {
  item: NormalizedManifestRecord;
  options: RuntimeOptions;
  seedTag: string;
  mapping: TargetMapping;
  prisma?: PrismaClient;
  uploads: UploadsService;
  report: ImportReport;
  getDownloaded: (sourceUrl: string) => Promise<DownloadedImage>;
  assetPromises: Map<string, Promise<AssetResult>>;
  backgroundThumbnailPromises: Map<string, Promise<AssetResult>>;
  firstSourceKeyByHash: Map<string, string>;
  sourceKeysByHash: Map<string, string[]>;
}): Promise<ReportRecord> {
  const { record } = input.item;
  const base: Omit<ReportRecord, 'status'> = {
    sourceKey: record.sourceKey,
    kind: input.item.kind,
    sourceUrl: redactSourceUrl(record.sourceUrl),
  };

  try {
    const existingJournal = input.prisma
      ? await input.prisma.sampleMediaImport.findUnique({
          where: {
            seedTag_sourceKey: {
              seedTag: input.seedTag,
              sourceKey: record.sourceKey,
            },
          },
        })
      : undefined;

    if (
      input.prisma &&
      existingJournal &&
      (await journalFilesExist(input.uploads, existingJournal))
    ) {
      const mappingTarget = expectedTargetEntity(input.mapping, input.item);
      if (!existingJournal.targetEntity && input.mapping) {
        const mutation = await persistImportedRecord({
          prisma: input.prisma,
          item: input.item,
          asset: assetFromJournal(existingJournal),
          seedTag: input.seedTag,
          mapping: input.mapping,
          existingJournal,
        });
        incrementMutationCounts(input.report, mutation.operation);
        return {
          ...base,
          sourceHash: existingJournal.sourceHash,
          destinationUrl: existingJournal.destinationUrl,
          storagePath: existingJournal.storagePath,
          thumbnailUrl: existingJournal.thumbnailUrl ?? undefined,
          targetEntity: mutation.targetEntity,
          targetRecordId: mutation.targetRecordId,
          status: mutation.operation === 'created' ? 'inserted' : 'updated',
          message: 'Applied newly curated mapping using the existing asset',
        };
      }

      if (
        mappingTarget &&
        existingJournal.targetEntity &&
        mappingTarget !== existingJournal.targetEntity
      ) {
        throw new Error(
          `Curated mapping now targets ${mappingTarget}, but journal already targets ${existingJournal.targetEntity}; rollback this seed before retargeting`,
        );
      }

      input.report.counts.skipped += 1;
      return {
        ...base,
        sourceHash: existingJournal.sourceHash,
        destinationUrl: existingJournal.destinationUrl,
        storagePath: existingJournal.storagePath,
        thumbnailUrl: existingJournal.thumbnailUrl ?? undefined,
        targetEntity: existingJournal.targetEntity ?? undefined,
        targetRecordId: existingJournal.targetRecordId ?? undefined,
        status: input.options.resume ? 'resumed' : 'skipped',
        message: input.options.resume
          ? 'Resumed from completed journal entry'
          : 'Idempotent journal entry already exists',
      };
    }

    const downloaded = await input.getDownloaded(record.sourceUrl);
    const sourceHash = createHash('sha256')
      .update(downloaded.bytes)
      .digest('hex');
    const hashKeys = input.sourceKeysByHash.get(sourceHash) ?? [];
    hashKeys.push(record.sourceKey);
    input.sourceKeysByHash.set(sourceHash, hashKeys);
    const duplicateOfSourceKey = input.firstSourceKeyByHash.get(sourceHash);
    if (!duplicateOfSourceKey) {
      input.firstSourceKeyByHash.set(sourceHash, record.sourceKey);
    }

    let assetPromise = input.assetPromises.get(sourceHash);
    if (!assetPromise) {
      assetPromise = createAsset({
        item: input.item,
        downloaded,
        sourceHash,
        options: input.options,
        prisma: input.prisma,
        uploads: input.uploads,
        report: input.report,
      });
      input.assetPromises.set(sourceHash, assetPromise);
    }
    let assetResult = await assetPromise;

    if (input.item.kind === 'backgrounds' && !assetResult.asset.thumbnailUrl) {
      let thumbnailPromise = input.backgroundThumbnailPromises.get(sourceHash);
      if (!thumbnailPromise) {
        thumbnailPromise = ensureBackgroundThumbnail({
          assetResult,
          downloaded,
          sourceHash,
          options: input.options,
          uploads: input.uploads,
          report: input.report,
        });
        input.backgroundThumbnailPromises.set(sourceHash, thumbnailPromise);
      }
      assetResult = await thumbnailPromise;
    }
    if (!input.options.apply) {
      return {
        ...base,
        sourceHash,
        destinationUrl: assetResult.asset.destinationUrl,
        storagePath: assetResult.asset.storagePath,
        thumbnailUrl: assetResult.asset.thumbnailUrl,
        status: 'planned',
        duplicateOfSourceKey,
        targetEntity: expectedTargetEntity(input.mapping, input.item),
        message: input.mapping
          ? 'Validated and processed; curated target would be applied'
          : input.item.kind === 'homepage' || input.item.kind === 'collection'
            ? 'Validated and processed; no curated mapping, so target remains ledger-only'
            : 'Validated and processed; target would be upserted',
      };
    }

    if (!input.prisma)
      throw new Error('Database client is unavailable in apply mode');
    const mutation = await persistImportedRecord({
      prisma: input.prisma,
      item: input.item,
      asset: assetResult.asset,
      seedTag: input.seedTag,
      mapping: input.mapping,
      existingJournal: existingJournal ?? undefined,
    });
    incrementMutationCounts(input.report, mutation.operation);

    return {
      ...base,
      sourceHash,
      destinationUrl: assetResult.asset.destinationUrl,
      storagePath: assetResult.asset.storagePath,
      thumbnailUrl: assetResult.asset.thumbnailUrl,
      targetEntity: mutation.targetEntity,
      targetRecordId: mutation.targetRecordId,
      status:
        mutation.operation === 'created'
          ? 'inserted'
          : mutation.operation === 'updated'
            ? 'updated'
            : 'asset-only',
      duplicateOfSourceKey,
    };
  } catch (error) {
    input.report.counts.errors += 1;
    return {
      ...base,
      status: 'error',
      message: safeErrorMessage(error),
    };
  }
}

async function createAsset(input: {
  item: NormalizedManifestRecord;
  downloaded: DownloadedImage;
  sourceHash: string;
  options: RuntimeOptions;
  prisma?: PrismaClient;
  uploads: UploadsService;
  report: ImportReport;
}): Promise<AssetResult> {
  if (input.prisma) {
    const reusable = await input.prisma.sampleMediaImport.findFirst({
      where: { sourceHash: input.sourceHash },
      orderBy: { createdAt: 'asc' },
    });
    if (
      reusable &&
      (await input.uploads.storedFileExists(reusable.storagePath))
    ) {
      const asset = assetFromJournal(reusable);
      if (
        reusable.thumbnailStoragePath &&
        !(await input.uploads.storedFileExists(reusable.thumbnailStoragePath))
      ) {
        asset.thumbnailUrl = undefined;
        asset.thumbnailStoragePath = undefined;
      }
      return { asset, uploadsCreated: 0 };
    }
  }

  const processed = await processImage(input.downloaded.bytes, input.item.kind);
  input.report.counts.processed += 1;
  if (!input.options.apply) {
    const storagePath = `/uploads/${input.item.record.targetStorageFolder}/${input.sourceHash}${processed.main.extension}`;
    return {
      asset: {
        sourceHash: input.sourceHash,
        destinationUrl: `https://dry-run.invalid${storagePath}`,
        storagePath,
        mimeType: processed.main.mimeType,
        byteSize: processed.main.bytes.byteLength,
        naturalWidth: processed.main.width,
        naturalHeight: processed.main.height,
        sourceWidth: processed.sourceWidth,
        sourceHeight: processed.sourceHeight,
        sourceHasAlpha: processed.sourceHasAlpha,
      },
      uploadsCreated: 0,
    };
  }

  const publicBaseUrl = requirePublicAssetBaseUrl(input.options);
  const stored = await input.uploads.storeProcessedImage({
    buffer: processed.main.bytes,
    mimeType: processed.main.mimeType,
    folder: input.item.record.targetStorageFolder,
    fileName: `${input.sourceHash}${processed.main.extension}`,
    publicBaseUrl,
  });
  let thumbnail:
    | { url: string; storagePath: string; created: boolean }
    | undefined;
  if (processed.thumbnail) {
    thumbnail = await input.uploads.storeProcessedImage({
      buffer: processed.thumbnail.bytes,
      mimeType: processed.thumbnail.mimeType,
      folder: input.item.record.targetStorageFolder,
      fileName: `${input.sourceHash}-thumb${processed.thumbnail.extension}`,
      publicBaseUrl,
    });
  }

  const uploadsCreated =
    Number(stored.created) + Number(thumbnail?.created ?? false);
  input.report.counts.uploaded += uploadsCreated;

  return {
    asset: {
      sourceHash: input.sourceHash,
      destinationUrl: stored.url,
      storagePath: stored.storagePath,
      thumbnailUrl: thumbnail?.url,
      thumbnailStoragePath: thumbnail?.storagePath,
      mimeType: processed.main.mimeType,
      byteSize: processed.main.bytes.byteLength,
      naturalWidth: processed.main.width,
      naturalHeight: processed.main.height,
      sourceWidth: processed.sourceWidth,
      sourceHeight: processed.sourceHeight,
      sourceHasAlpha: processed.sourceHasAlpha,
    },
    uploadsCreated,
  };
}

async function ensureBackgroundThumbnail(input: {
  assetResult: AssetResult;
  downloaded: DownloadedImage;
  sourceHash: string;
  options: RuntimeOptions;
  uploads: UploadsService;
  report: ImportReport;
}): Promise<AssetResult> {
  const processed = await processImage(input.downloaded.bytes, 'backgrounds');
  if (!processed.thumbnail) return input.assetResult;

  const folder = storageFolder(input.assetResult.asset.storagePath);
  if (!input.options.apply) {
    return {
      asset: {
        ...input.assetResult.asset,
        thumbnailUrl: `https://dry-run.invalid/uploads/${folder}/${input.sourceHash}-thumb${processed.thumbnail.extension}`,
        thumbnailStoragePath: `/uploads/${folder}/${input.sourceHash}-thumb${processed.thumbnail.extension}`,
      },
      uploadsCreated: input.assetResult.uploadsCreated,
    };
  }

  const stored = await input.uploads.storeProcessedImage({
    buffer: processed.thumbnail.bytes,
    mimeType: processed.thumbnail.mimeType,
    folder,
    fileName: `${input.sourceHash}-thumb${processed.thumbnail.extension}`,
    publicBaseUrl: requirePublicAssetBaseUrl(input.options),
  });
  if (stored.created) input.report.counts.uploaded += 1;
  return {
    asset: {
      ...input.assetResult.asset,
      thumbnailUrl: stored.url,
      thumbnailStoragePath: stored.storagePath,
    },
    uploadsCreated: input.assetResult.uploadsCreated + Number(stored.created),
  };
}

async function runRollback(input: {
  options: RuntimeOptions;
  seedTag: string;
  manifestPath: string;
  mappingPath?: string;
}): Promise<void> {
  const startedAt = Date.now();
  const applyRollback = input.options.apply;
  const report = createReport({
    seedTag: input.seedTag,
    mode: applyRollback ? 'rollback-apply' : 'rollback-dry-run',
    options: input.options,
    manifestPath: input.manifestPath,
    mappingPath: input.mappingPath,
  });
  const prisma = createPrismaClient();
  const uploads = new UploadsService();

  try {
    await prisma.$connect();
    const journals = await prisma.sampleMediaImport.findMany({
      where: {
        seedTag: input.seedTag,
        ...(input.options.only.size < ALL_KINDS.length
          ? { kind: { in: [...input.options.only] } }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    report.counts.total = journals.length;
    report.counts.selected = journals.length;
    const storageCandidates = new Map<string, { path: string; url: string }>();

    for (const journal of journals) {
      report.counts.read += 1;
      if (journal.storagePath) {
        storageCandidates.set(journal.storagePath, {
          path: journal.storagePath,
          url: journal.destinationUrl,
        });
      }
      if (journal.thumbnailStoragePath && journal.thumbnailUrl) {
        storageCandidates.set(journal.thumbnailStoragePath, {
          path: journal.thumbnailStoragePath,
          url: journal.thumbnailUrl,
        });
      }

      try {
        const evaluation = applyRollback
          ? await rollbackJournalRecord(prisma, journal)
          : await evaluateRollback(prisma, journal);
        if (!evaluation.canRollback) {
          report.counts.conflicts += 1;
          report.records.push({
            sourceKey: journal.sourceKey,
            kind: journal.kind,
            sourceHash: journal.sourceHash,
            destinationUrl: journal.destinationUrl,
            targetEntity: journal.targetEntity ?? undefined,
            targetRecordId: journal.targetRecordId ?? undefined,
            status: 'conflict',
            message: evaluation.message,
          });
          continue;
        }

        if (applyRollback) report.counts.rolledBack += 1;
        report.records.push({
          sourceKey: journal.sourceKey,
          kind: journal.kind,
          sourceHash: journal.sourceHash,
          destinationUrl: journal.destinationUrl,
          targetEntity: journal.targetEntity ?? undefined,
          targetRecordId: journal.targetRecordId ?? undefined,
          status: applyRollback ? 'rolled-back' : 'planned',
          message: evaluation.message,
        });
      } catch (error) {
        report.counts.errors += 1;
        report.records.push({
          sourceKey: journal.sourceKey,
          kind: journal.kind,
          status: 'error',
          message: safeErrorMessage(error),
        });
      }
    }

    const unusedCategories = await deleteUnusedSeedCategories(
      prisma,
      input.seedTag,
      !applyRollback,
    );
    if (unusedCategories.length > 0) {
      console.log(
        `${applyRollback ? 'Deleted' : 'Would delete'} ${unusedCategories.length} unused seeded accessory category/categories.`,
      );
    }

    if (applyRollback) {
      for (const candidate of storageCandidates.values()) {
        if (
          !(await storagePathHasReferences(
            prisma,
            candidate.path,
            candidate.url,
          ))
        ) {
          await uploads.deleteStoredFile(candidate.path);
        }
      }
    }
  } finally {
    await prisma.$disconnect();
  }

  report.finishedAt = new Date().toISOString();
  report.runtimeMs = Date.now() - startedAt;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const paths = await writeImportReport({
    report,
    repositoryRoot: input.options.repositoryRoot,
    baseName: `${input.seedTag}-rollback-${timestamp}`,
  });
  console.log(
    `Rollback ${applyRollback ? 'apply' : 'dry-run'} finished: ${report.counts.rolledBack} reverted, ${report.counts.conflicts} conflict(s), ${report.counts.errors} error(s).`,
  );
  console.log(`Reports: ${paths.jsonPath}, ${paths.markdownPath}`);
  if (report.counts.errors > 0 || report.counts.conflicts > 0)
    process.exitCode = 1;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) throw new Error('DATABASE_URL is required');
  const schema = process.env.DATABASE_SCHEMA?.trim();
  return new PrismaClient({
    adapter: new PrismaPg(
      { connectionString },
      schema ? { schema } : undefined,
    ),
  });
}

function createReport(input: {
  seedTag: string;
  mode: ImportReport['mode'];
  options: RuntimeOptions;
  manifestPath: string;
  mappingPath?: string;
}): ImportReport {
  return {
    seedTag: input.seedTag,
    mode: input.mode,
    manifestPath: relative(
      input.options.repositoryRoot,
      input.manifestPath,
    ).replace(/\\/g, '/'),
    mappingPath: input.mappingPath
      ? relative(input.options.repositoryRoot, input.mappingPath).replace(
          /\\/g,
          '/',
        )
      : undefined,
    startedAt: new Date().toISOString(),
    configuration: {
      only: [...input.options.only],
      concurrency: input.options.concurrency,
      timeoutMs: input.options.timeoutMs,
      maxBytes: input.options.maxBytes,
      maxRedirects: input.options.maxRedirects,
      maxRetries: input.options.maxRetries,
      resume: input.options.resume,
    },
    counts: createEmptyCounts(),
    duplicateHashes: [],
    records: [],
    rollbackCommand: `pnpm --filter backend import:sample-media:rollback -- ${input.seedTag}`,
  };
}

function parseCli(args: string[]): CliOptions {
  let manifestPath = process.env.IMPORT_SOURCE_MANIFEST ?? DEFAULT_MANIFEST;
  let mappingPath: string | undefined;
  let apply = false;
  let explicitDryRun = false;
  let rollback = false;
  let rollbackSeedTag: string | undefined;
  let concurrency = readPositiveInteger('IMPORT_CONCURRENCY', 4);
  let resume = false;
  const only = new Set<ImportKind>();

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    switch (argument) {
      case '--':
        break;
      case '--help':
        break;
      case '--manifest':
        manifestPath = requireArgument(args, ++index, '--manifest');
        break;
      case '--mapping':
        mappingPath = requireArgument(args, ++index, '--mapping');
        break;
      case '--dry-run':
        explicitDryRun = true;
        break;
      case '--apply':
        apply = true;
        break;
      case '--rollback':
        rollback = true;
        if (args[index + 1] && !args[index + 1].startsWith('--')) {
          rollbackSeedTag = args[++index];
        }
        break;
      case '--only': {
        const values = requireArgument(args, ++index, '--only').split(',');
        for (const value of values) only.add(parseKind(value));
        break;
      }
      case '--concurrency':
        concurrency = parseBoundedInteger(
          requireArgument(args, ++index, '--concurrency'),
          '--concurrency',
          1,
          16,
        );
        break;
      case '--resume':
        resume = true;
        break;
      default:
        if (rollback && !rollbackSeedTag && !argument.startsWith('--')) {
          rollbackSeedTag = argument;
          break;
        }
        throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (apply && explicitDryRun) {
    throw new Error('--apply and --dry-run are mutually exclusive');
  }
  if (only.size === 0) ALL_KINDS.forEach((kind) => only.add(kind));

  return {
    manifestPath,
    mappingPath,
    apply,
    dryRun: !apply,
    rollback,
    rollbackSeedTag,
    only,
    concurrency,
    resume,
  };
}

function mappingForItem(
  mapping: SampleMediaMapping,
  item: NormalizedManifestRecord,
): TargetMapping {
  if (item.kind === 'homepage') {
    return mapping.homepage.find(
      (candidate) => candidate.sourceKey === item.record.sourceKey,
    );
  }
  if (item.kind === 'collection') {
    return mapping.collection.find(
      (candidate) => candidate.sourceKey === item.record.sourceKey,
    );
  }
  return undefined;
}

function expectedTargetEntity(
  mapping: TargetMapping,
  item: NormalizedManifestRecord,
): string | undefined {
  switch (mapping?.target) {
    case 'banner':
      return 'Banner';
    case 'collection':
      return 'Collection';
    case 'product':
      return 'Product';
    default:
      if (item.kind === 'backgrounds') return 'FrameBackground';
      if (item.kind === 'charms') return 'Accessory';
      if (item.kind === 'collection') return 'Product';
      return undefined;
  }
}

function assetFromJournal(journal: SampleMediaImport): PersistedAsset {
  const metadata = isRecord(journal.metadata) ? journal.metadata : {};
  return {
    sourceHash: journal.sourceHash,
    destinationUrl: journal.destinationUrl,
    storagePath: journal.storagePath,
    thumbnailUrl: journal.thumbnailUrl ?? undefined,
    thumbnailStoragePath: journal.thumbnailStoragePath ?? undefined,
    mimeType: journal.mimeType,
    byteSize: journal.byteSize,
    naturalWidth: journal.naturalWidth,
    naturalHeight: journal.naturalHeight,
    sourceWidth: readMetadataNumber(metadata.sourceWidth, journal.naturalWidth),
    sourceHeight: readMetadataNumber(
      metadata.sourceHeight,
      journal.naturalHeight,
    ),
    sourceHasAlpha: metadata.sourceHasAlpha === true,
  };
}

async function journalFilesExist(
  uploads: UploadsService,
  journal: SampleMediaImport,
): Promise<boolean> {
  if (!(await uploads.storedFileExists(journal.storagePath))) return false;
  if (
    journal.thumbnailStoragePath &&
    !(await uploads.storedFileExists(journal.thumbnailStoragePath))
  ) {
    return false;
  }
  return true;
}

function incrementMutationCounts(
  report: ImportReport,
  operation: 'created' | 'updated' | 'asset-only',
): void {
  if (operation === 'created') report.counts.inserted += 1;
  if (operation === 'updated') report.counts.updated += 1;
  if (operation === 'asset-only') report.counts.assetOnly += 1;
}

function storageFolder(storagePath: string): string {
  const normalized = storagePath.replace(/\\/g, '/');
  const match = normalized.match(/^\/uploads\/(.+)\/[^/]+$/);
  if (!match) throw new Error(`Invalid journal storage path ${storagePath}`);
  return match[1];
}

function requirePublicAssetBaseUrl(options: RuntimeOptions): string {
  if (!options.publicAssetBaseUrl) {
    throw new Error('STORAGE_PUBLIC_BASE_URL is required in apply mode');
  }
  return options.publicAssetBaseUrl;
}

function assertApplyEnvironment(options: RuntimeOptions): void {
  if (process.env.IMPORT_SAMPLE_ASSETS?.trim().toLowerCase() !== 'true') {
    throw new Error(
      'Set IMPORT_SAMPLE_ASSETS=true to authorize apply/rollback writes',
    );
  }
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error('DATABASE_URL is required in apply/rollback mode');
  }
  const publicAssetBaseUrl = requirePublicAssetBaseUrl(options);
  const publicUrl = new URL(publicAssetBaseUrl);
  const loopback = ['localhost', '127.0.0.1', '::1'].includes(
    publicUrl.hostname,
  );
  if (publicUrl.protocol !== 'https:' && !loopback) {
    throw new Error(
      'STORAGE_PUBLIC_BASE_URL must use HTTPS unless it is loopback',
    );
  }

  const databaseSchema = process.env.DATABASE_SCHEMA?.trim();
  if (!databaseSchema) {
    throw new Error(
      'DATABASE_SCHEMA must be explicitly set for apply/rollback writes',
    );
  }
  if (databaseSchema === 'public') {
    if (process.env.NODE_ENV?.trim().toLowerCase() === 'production') {
      throw new Error(
        'Sample-media writes are forbidden in NODE_ENV=production',
      );
    }
    if (process.env.IMPORT_PREVIEW_MODE?.trim().toLowerCase() !== 'true') {
      throw new Error('Set IMPORT_PREVIEW_MODE=true for public staged imports');
    }
    if (options.concurrency !== 1) {
      throw new Error(
        'Public staged import requires --concurrency 1 so collections exist before products',
      );
    }
    if (
      process.env.SAMPLE_MEDIA_STORAGE_PROVIDER?.trim().toLowerCase() !==
      'supabase'
    ) {
      throw new Error(
        'Public staged import requires SAMPLE_MEDIA_STORAGE_PROVIDER=supabase',
      );
    }
    if (loopback || publicUrl.protocol !== 'https:') {
      throw new Error(
        'Public staged import requires a non-loopback HTTPS storage URL',
      );
    }
    if (
      !process.env.SUPABASE_URL?.trim() ||
      !(
        process.env.SUPABASE_SECRET_KEY?.trim() ||
        process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
      ) ||
      !process.env.SUPABASE_STORAGE_BUCKET?.trim()
    ) {
      throw new Error(
        'Supabase URL, backend secret/service key, and storage bucket are required',
      );
    }
  }
}

function requireArgument(args: string[], index: number, flag: string): string {
  const value = args[index];
  if (!value || value.startsWith('--')) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function parseKind(value: string): ImportKind {
  if (ALL_KINDS.includes(value as ImportKind)) return value as ImportKind;
  throw new Error(`--only must be one of ${ALL_KINDS.join(', ')}`);
}

function parseBoundedInteger(
  value: string,
  label: string,
  minimum: number,
  maximum: number,
): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(
      `${label} must be an integer from ${minimum} to ${maximum}`,
    );
  }
  return parsed;
}

function readPositiveInteger(name: string, fallback: number): number {
  const value = process.env[name];
  return value
    ? parseBoundedInteger(value, name, 1, Number.MAX_SAFE_INTEGER)
    : fallback;
}

function readNonNegativeInteger(name: string, fallback: number): number {
  const value = process.env[name];
  return value
    ? parseBoundedInteger(value, name, 0, Number.MAX_SAFE_INTEGER)
    : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readMetadataNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function printHelp(): void {
  console.log(`Figure Lab sample media importer

Usage:
  pnpm --filter backend import:sample-media:dry -- [options]
  pnpm --filter backend import:sample-media -- [options]
  pnpm --filter backend import:sample-media:rollback -- [seedTag] [--apply]

Options:
  --manifest <path>       Manifest JSON (default: ${DEFAULT_MANIFEST})
  --mapping <path>        Curated mapping JSON (default if present: data/import/theluvin-media.mapping.json)
  --dry-run               Download, validate, and process without storage/DB writes (default)
  --apply                 Enable storage/DB writes (requires IMPORT_SAMPLE_ASSETS=true)
  --rollback [seedTag]    Dry-run rollback, or execute it together with --apply
  --only <kinds>          Comma-separated homepage,collection,backgrounds,charms
  --concurrency <number>  Worker count from 1 to 16 (default: 4)
  --resume                Reuse completed journal entries
  --help                  Show this help
`);
}

main().catch((error) => {
  console.error(`Sample media import failed: ${safeErrorMessage(error)}`);
  process.exitCode = 1;
});
