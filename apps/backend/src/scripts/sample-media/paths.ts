import { existsSync, readFileSync } from 'fs';
import { dirname, isAbsolute, join, resolve } from 'path';

function isRepositoryRoot(directory: string): boolean {
  return (
    existsSync(join(directory, 'pnpm-workspace.yaml')) &&
    existsSync(join(directory, 'apps', 'backend', 'package.json'))
  );
}

export function findRepositoryRoot(start = process.cwd()): string {
  let cursor = resolve(start);

  while (true) {
    if (isRepositoryRoot(cursor)) return cursor;

    const parent = dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }

  let moduleCursor = resolve(__dirname);
  while (true) {
    if (isRepositoryRoot(moduleCursor)) return moduleCursor;
    const parent = dirname(moduleCursor);
    if (parent === moduleCursor) break;
    moduleCursor = parent;
  }

  throw new Error('Unable to locate the repository root');
}

export function resolveReadablePath(
  value: string,
  repositoryRoot: string,
): string {
  const candidates = isAbsolute(value)
    ? [resolve(value)]
    : [resolve(process.cwd(), value), resolve(repositoryRoot, value)];

  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error(`File not found: ${value}`);
  }

  return found;
}

export function readJsonFile(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to read JSON file ${path}: ${message}`);
  }
}
