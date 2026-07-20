import { mkdir, writeFile } from 'fs/promises';
import { join, relative } from 'path';
import { sanitizeReportText } from './security';

export type ReportRecordStatus =
  | 'planned'
  | 'inserted'
  | 'updated'
  | 'asset-only'
  | 'resumed'
  | 'skipped'
  | 'rolled-back'
  | 'conflict'
  | 'error';

export type ReportRecord = {
  sourceKey: string;
  kind: string;
  sourceUrl?: string;
  sourceHash?: string;
  destinationUrl?: string;
  storagePath?: string;
  thumbnailUrl?: string;
  targetEntity?: string;
  targetRecordId?: string;
  status: ReportRecordStatus;
  duplicateOfSourceKey?: string;
  message?: string;
};

export type ImportReport = {
  seedTag: string;
  mode: 'dry-run' | 'apply' | 'rollback-dry-run' | 'rollback-apply';
  manifestPath?: string;
  mappingPath?: string;
  startedAt: string;
  finishedAt?: string;
  runtimeMs?: number;
  configuration: {
    only: string[];
    concurrency: number;
    timeoutMs: number;
    maxBytes: number;
    maxRedirects: number;
    maxRetries: number;
    resume: boolean;
  };
  counts: {
    total: number;
    selected: number;
    read: number;
    downloaded: number;
    processed: number;
    uploaded: number;
    inserted: number;
    updated: number;
    assetOnly: number;
    skipped: number;
    rolledBack: number;
    conflicts: number;
    errors: number;
  };
  duplicateHashes: Array<{
    sourceHash: string;
    sourceKeys: string[];
  }>;
  records: ReportRecord[];
  rollbackCommand: string;
};

export function createEmptyCounts(): ImportReport['counts'] {
  return {
    total: 0,
    selected: 0,
    read: 0,
    downloaded: 0,
    processed: 0,
    uploaded: 0,
    inserted: 0,
    updated: 0,
    assetOnly: 0,
    skipped: 0,
    rolledBack: 0,
    conflicts: 0,
    errors: 0,
  };
}

export async function writeImportReport(options: {
  report: ImportReport;
  repositoryRoot: string;
  baseName?: string;
}): Promise<{ jsonPath: string; markdownPath: string }> {
  const report = sanitizeValue(options.report) as ImportReport;
  const baseName = sanitizeFileName(options.baseName ?? report.seedTag);
  const jsonDirectory = join(
    options.repositoryRoot,
    'data',
    'import',
    'reports',
  );
  const markdownDirectory = join(
    options.repositoryRoot,
    'docs',
    'import-reports',
  );
  const jsonPath = join(jsonDirectory, `${baseName}.json`);
  const markdownPath = join(markdownDirectory, `${baseName}.md`);

  await Promise.all([
    mkdir(jsonDirectory, { recursive: true }),
    mkdir(markdownDirectory, { recursive: true }),
  ]);
  await Promise.all([
    writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8'),
    writeFile(markdownPath, renderMarkdown(report), 'utf8'),
  ]);

  return {
    jsonPath: relative(options.repositoryRoot, jsonPath).replace(/\\/g, '/'),
    markdownPath: relative(options.repositoryRoot, markdownPath).replace(
      /\\/g,
      '/',
    ),
  };
}

function renderMarkdown(report: ImportReport): string {
  const countRows = Object.entries(report.counts)
    .map(([key, value]) => `| ${escapeMarkdown(key)} | ${value} |`)
    .join('\n');
  const recordRows = report.records
    .map(
      (record) =>
        `| ${escapeMarkdown(record.sourceKey)} | ${escapeMarkdown(record.kind)} | ${escapeMarkdown(record.status)} | ${escapeMarkdown(record.targetEntity ?? '')} | ${escapeMarkdown(record.destinationUrl ?? '')} | ${escapeMarkdown(record.message ?? '')} |`,
    )
    .join('\n');

  return `# Sample media import report: ${escapeMarkdown(report.seedTag)}

- Mode: \`${report.mode}\`
- Started: ${report.startedAt}
- Finished: ${report.finishedAt ?? 'n/a'}
- Runtime: ${report.runtimeMs ?? 0} ms
- Manifest: ${escapeMarkdown(report.manifestPath ?? 'n/a')}
- Mapping: ${escapeMarkdown(report.mappingPath ?? 'none')}

## Counts

| Metric | Count |
| --- | ---: |
${countRows}

## Duplicate hashes

${
  report.duplicateHashes.length === 0
    ? 'None detected.'
    : report.duplicateHashes
        .map(
          (item) =>
            `- \`${item.sourceHash}\`: ${item.sourceKeys.map((key) => `\`${escapeMarkdown(key)}\``).join(', ')}`,
        )
        .join('\n')
}

## Records

| Source key | Kind | Status | Target | Destination | Message |
| --- | --- | --- | --- | --- | --- |
${recordRows || '| — | — | — | — | — | No records |'}

## Rollback

\`${escapeMarkdown(report.rollbackCommand)}\`
`;
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') return sanitizeReportText(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitizeValue(item)]),
    );
  }
  return value;
}

function sanitizeFileName(value: string): string {
  const sanitized = value
    .replace(/[^a-z0-9._-]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  return sanitized || 'sample-media-report';
}

function escapeMarkdown(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
