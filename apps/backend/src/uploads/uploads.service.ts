import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

export type UploadedImageFile = {
	mimetype: string;
	originalname: string;
	buffer: Buffer;
	size?: number;
};

export type UploadImageScope = 'admin' | 'customer' | 'previews';

const ALLOWED_IMAGE_MIME_TYPES = new Set([
	'image/jpeg',
	'image/png',
	'image/webp',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const CUSTOMER_MAX_BYTES = 5 * 1024 * 1024;
const ADMIN_MAX_BYTES = 10 * 1024 * 1024;

@Injectable()
export class UploadsService {
	private readonly uploadDir = join(process.cwd(), 'public', 'uploads');

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
			url: `${baseUrl}/uploads/${scope}/${fileName}`,
			fileName,
			originalName: file.originalname,
		};
	}

	private assertAllowedImage(file: UploadedImageFile, scope: UploadImageScope) {
		const extension = extname(file.originalname).toLowerCase();
		const maxBytes = scope === 'admin' ? ADMIN_MAX_BYTES : CUSTOMER_MAX_BYTES;

		if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
			throw new BadRequestException('Only JPEG, PNG, or WebP images are allowed');
		}

		if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
			throw new BadRequestException('Image extension must be .jpg, .jpeg, .png, or .webp');
		}

		if (file.size !== undefined && file.size > maxBytes) {
			throw new BadRequestException(`Image must be smaller than ${Math.round(maxBytes / 1024 / 1024)}MB`);
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
