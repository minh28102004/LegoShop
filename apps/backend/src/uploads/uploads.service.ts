import { BadRequestException, Injectable } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createHash, randomUUID } from 'crypto';
import {
  constants as fsConstants,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { access, mkdir, unlink, writeFile } from 'fs/promises';
import { extname, isAbsolute, join, relative, resolve, sep } from 'path';

export type UploadedImageFile = {
  mimetype: string;
  originalname: string;
  buffer: Buffer;
  size?: number;
};

export type UploadImageScope = 'admin' | 'customer' | 'previews';

export type StoreProcessedImageInput = {
  buffer: Buffer;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  folder: string;
  fileName: string;
  publicBaseUrl: string;
};

export type StoredImage = {
  url: string;
  storagePath: string;
  absolutePath?: string;
  fileName: string;
  byteSize: number;
  created: boolean;
};

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const SAFE_PATH_SEGMENT = /^[a-z0-9][a-z0-9_-]*$/i;
const SAFE_FILE_NAME = /^[a-z0-9][a-z0-9._-]*$/i;
const CUSTOMER_MAX_BYTES = 5 * 1024 * 1024;
const ADMIN_MAX_BYTES = 10 * 1024 * 1024;
type SampleMediaStorageProvider = 'filesystem' | 'supabase';

function findBackendRoot(start: string): string | undefined {
  let cursor = resolve(start);

  while (true) {
    const packagePath = join(cursor, 'package.json');
    if (existsSync(packagePath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packagePath, 'utf8')) as {
          name?: unknown;
        };
        if (packageJson.name === 'backend') return cursor;
      } catch {
        // Keep walking. A malformed unrelated package file is not our root.
      }
    }

    const parent = resolve(cursor, '..');
    if (parent === cursor) return undefined;
    cursor = parent;
  }
}

function resolveUploadDirectory(): string {
  const configured = process.env.UPLOAD_ROOT_DIR?.trim();
  if (configured) {
    return resolve(configured, 'uploads');
  }

  const backendRoot =
    findBackendRoot(process.cwd()) ??
    findBackendRoot(__dirname) ??
    process.cwd();
  return join(backendRoot, 'public', 'uploads');
}

function normalizePublicBaseUrl(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, '');
  let parsed: URL;

  try {
    parsed = new URL(trimmed);
  } catch {
    throw new BadRequestException('A valid public asset base URL is required');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new BadRequestException(
      'Public asset base URL must use HTTP or HTTPS',
    );
  }

  return trimmed;
}

function normalizeRelativePath(value: string, label: string): string {
  const normalized = value.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  const segments = normalized.split('/').filter(Boolean);

  if (
    segments.length === 0 ||
    segments.some((segment) => !SAFE_PATH_SEGMENT.test(segment))
  ) {
    throw new BadRequestException(`${label} contains an unsafe path segment`);
  }

  return segments.join('/');
}

@Injectable()
export class UploadsService {
  private readonly uploadDir = resolveUploadDirectory();
  private supabaseClient?: SupabaseClient;

  saveImage(
    file: UploadedImageFile | undefined,
    baseUrl: string,
    scope: UploadImageScope = 'customer',
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    this.assertAllowedImage(file, scope);

    const scopedDir = join(this.uploadDir, scope);
    if (!existsSync(scopedDir)) {
      mkdirSync(scopedDir, { recursive: true });
    }

    const extension = this.guessExtension(file.mimetype);
    const fileName = `${Date.now()}-${randomUUID()}${extension}`;
    const targetPath = join(scopedDir, fileName);

    writeFileSync(targetPath, file.buffer);

    return {
      url: `${normalizePublicBaseUrl(baseUrl)}/uploads/${scope}/${fileName}`,
      fileName,
      originalName: file.originalname,
    };
  }

  async storeProcessedImage(
    input: StoreProcessedImageInput,
  ): Promise<StoredImage> {
    if (!ALLOWED_IMAGE_MIME_TYPES.has(input.mimeType)) {
      throw new BadRequestException('Unsupported processed image MIME type');
    }

    const folder = normalizeRelativePath(input.folder, 'Storage folder');
    const fileName = input.fileName.trim();
    if (!SAFE_FILE_NAME.test(fileName)) {
      throw new BadRequestException(
        'Storage file name contains unsafe characters',
      );
    }

    const expectedExtension = this.guessExtension(input.mimeType);
    const actualExtension = extname(fileName).toLowerCase();
    if (
      actualExtension !== expectedExtension &&
      !(input.mimeType === 'image/jpeg' && actualExtension === '.jpeg')
    ) {
      throw new BadRequestException(
        'Storage file extension does not match MIME type',
      );
    }

    if (this.sampleMediaStorageProvider() === 'supabase') {
      return this.storeProcessedImageInSupabase({ ...input, folder, fileName });
    }

    const absoluteFolder = this.resolveInsideUploadRoot(folder);
    const absolutePath = this.resolveInsideUploadRoot(`${folder}/${fileName}`);
    await mkdir(absoluteFolder, { recursive: true });

    let created = true;
    try {
      await writeFile(absolutePath, input.buffer, { flag: 'wx' });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;

      created = false;
      const expectedHash = createHash('sha256')
        .update(input.buffer)
        .digest('hex');
      const existingHash = createHash('sha256')
        .update(readFileSync(absolutePath))
        .digest('hex');
      if (existingHash !== expectedHash) {
        throw new Error(`Storage collision detected for ${folder}/${fileName}`);
      }
    }

    const storagePath = `/uploads/${folder}/${fileName}`;
    return {
      url: `${normalizePublicBaseUrl(input.publicBaseUrl)}${storagePath}`,
      storagePath,
      absolutePath,
      fileName,
      byteSize: input.buffer.byteLength,
      created,
    };
  }

  async storedFileExists(storagePath: string): Promise<boolean> {
    if (this.sampleMediaStorageProvider() === 'supabase') {
      const objectPath = this.storagePathToObjectPath(storagePath);
      const slash = objectPath.lastIndexOf('/');
      const folder = slash >= 0 ? objectPath.slice(0, slash) : '';
      const fileName = slash >= 0 ? objectPath.slice(slash + 1) : objectPath;
      const { data, error } = await this.supabaseBucket().list(folder, {
        limit: 100,
        search: fileName,
      });
      if (error)
        throw new Error(`Supabase storage lookup failed: ${error.message}`);
      return data.some((entry) => entry.name === fileName);
    }

    try {
      await access(this.resolveStoragePath(storagePath), fsConstants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  async deleteStoredFile(storagePath: string): Promise<boolean> {
    if (this.sampleMediaStorageProvider() === 'supabase') {
      const objectPath = this.storagePathToObjectPath(storagePath);
      const existed = await this.storedFileExists(storagePath);
      if (!existed) return false;
      const { error } = await this.supabaseBucket().remove([objectPath]);
      if (error)
        throw new Error(`Supabase storage delete failed: ${error.message}`);
      return true;
    }

    const absolutePath = this.resolveStoragePath(storagePath);
    try {
      await unlink(absolutePath);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
      throw error;
    }
  }

  private resolveStoragePath(storagePath: string): string {
    const normalized = storagePath.replace(/\\/g, '/');
    if (!normalized.startsWith('/uploads/')) {
      throw new BadRequestException('Storage path must begin with /uploads/');
    }

    return this.resolveInsideUploadRoot(normalized.slice('/uploads/'.length));
  }

  private async storeProcessedImageInSupabase(
    input: StoreProcessedImageInput & { folder: string; fileName: string },
  ): Promise<StoredImage> {
    const objectPath = `uploads/${input.folder}/${input.fileName}`;
    const storagePath = `/${objectPath}`;
    const bucket = this.supabaseBucket();
    const upload = await bucket.upload(objectPath, input.buffer, {
      cacheControl: '31536000',
      contentType: input.mimeType,
      upsert: false,
    });

    let created = !upload.error;
    if (upload.error) {
      const existing = await bucket.download(objectPath);
      if (existing.error || !existing.data) {
        throw new Error(
          `Supabase storage upload failed: ${upload.error.message}`,
        );
      }
      const existingBytes = Buffer.from(await existing.data.arrayBuffer());
      const expectedHash = createHash('sha256')
        .update(input.buffer)
        .digest('hex');
      const existingHash = createHash('sha256')
        .update(existingBytes)
        .digest('hex');
      if (expectedHash !== existingHash) {
        throw new Error(`Storage collision detected for ${objectPath}`);
      }
      created = false;
    }

    const publicUrl = bucket.getPublicUrl(objectPath).data.publicUrl;
    const configuredBaseUrl = normalizePublicBaseUrl(input.publicBaseUrl);
    if (!publicUrl.startsWith(`${configuredBaseUrl}/`)) {
      throw new Error(
        'STORAGE_PUBLIC_BASE_URL does not match the configured Supabase bucket',
      );
    }

    return {
      url: publicUrl,
      storagePath,
      fileName: input.fileName,
      byteSize: input.buffer.byteLength,
      created,
    };
  }

  private sampleMediaStorageProvider(): SampleMediaStorageProvider {
    const value = (process.env.SAMPLE_MEDIA_STORAGE_PROVIDER ?? 'filesystem')
      .trim()
      .toLowerCase();
    if (value === 'filesystem' || value === 'supabase') return value;
    throw new Error(
      'SAMPLE_MEDIA_STORAGE_PROVIDER must be filesystem or supabase',
    );
  }

  private supabaseBucket() {
    return this.getSupabaseClient().storage.from(this.requireSupabaseBucket());
  }

  private getSupabaseClient(): SupabaseClient {
    if (this.supabaseClient) return this.supabaseClient;
    const url = process.env.SUPABASE_URL?.trim();
    const key =
      process.env.SUPABASE_SECRET_KEY?.trim() ||
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!url || !key) {
      throw new Error(
        'SUPABASE_URL and a backend-only SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY are required',
      );
    }
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      throw new Error('SUPABASE_URL must use HTTPS');
    }
    this.supabaseClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return this.supabaseClient;
  }

  private requireSupabaseBucket(): string {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim();
    if (!bucket || !SAFE_PATH_SEGMENT.test(bucket)) {
      throw new Error(
        'SUPABASE_STORAGE_BUCKET is required and must be a safe name',
      );
    }
    return bucket;
  }

  private storagePathToObjectPath(storagePath: string): string {
    const normalized = storagePath.replace(/\\/g, '/');
    if (!normalized.startsWith('/uploads/')) {
      throw new BadRequestException('Storage path must begin with /uploads/');
    }
    const segments = normalized.slice(1).split('/').filter(Boolean);
    const fileName = segments.pop();
    if (
      !fileName ||
      !SAFE_FILE_NAME.test(fileName) ||
      segments.length === 0 ||
      segments.some((segment) => !SAFE_PATH_SEGMENT.test(segment))
    ) {
      throw new BadRequestException('Storage path is unsafe');
    }
    return [...segments, fileName].join('/');
  }

  private resolveInsideUploadRoot(relativePath: string): string {
    if (isAbsolute(relativePath)) {
      throw new BadRequestException('Absolute storage paths are not allowed');
    }

    const target = resolve(this.uploadDir, relativePath);
    const relativeTarget = relative(this.uploadDir, target);
    if (
      !relativeTarget ||
      relativeTarget === '..' ||
      relativeTarget.startsWith(`..${sep}`) ||
      isAbsolute(relativeTarget)
    ) {
      throw new BadRequestException('Storage path escapes the upload root');
    }

    return target;
  }

  private assertAllowedImage(file: UploadedImageFile, scope: UploadImageScope) {
    const extension = extname(file.originalname).toLowerCase();
    const maxBytes = scope === 'admin' ? ADMIN_MAX_BYTES : CUSTOMER_MAX_BYTES;

    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        'Only JPEG, PNG, or WebP images are allowed',
      );
    }

    if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
      throw new BadRequestException(
        'Image extension must be .jpg, .jpeg, .png, or .webp',
      );
    }

    if (file.size !== undefined && file.size > maxBytes) {
      throw new BadRequestException(
        `Image must be smaller than ${Math.round(maxBytes / 1024 / 1024)}MB`,
      );
    }
  }

  private guessExtension(mimetype: string) {
    switch (mimetype) {
      case 'image/jpeg':
        return '.jpg';
      case 'image/png':
        return '.png';
      case 'image/webp':
        return '.webp';
      default:
        return '.bin';
    }
  }
}
