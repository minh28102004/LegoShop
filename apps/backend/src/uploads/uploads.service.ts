import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

export type UploadedImageFile = {
	mimetype: string;
	originalname: string;
	buffer: Buffer;
};

@Injectable()
export class UploadsService {
	private readonly uploadDir = join(process.cwd(), 'public', 'uploads');

	saveImage(file: UploadedImageFile | undefined, baseUrl: string) {
		if (!file) {
			throw new BadRequestException('File is required');
		}

		if (!file.mimetype.startsWith('image/')) {
			throw new BadRequestException('Only image files are allowed');
		}

		if (!existsSync(this.uploadDir)) {
			mkdirSync(this.uploadDir, { recursive: true });
		}

		const extension = extname(file.originalname) || this.guessExtension(file.mimetype);
		const fileName = `${Date.now()}-${randomUUID()}${extension}`;
		const targetPath = join(this.uploadDir, fileName);

		writeFileSync(targetPath, file.buffer);

		return {
			url: `${baseUrl}/uploads/${fileName}`,
			fileName,
			originalName: file.originalname,
		};
	}

	private guessExtension(mimetype: string) {
		switch (mimetype) {
			case 'image/jpeg':
				return '.jpg';
			case 'image/png':
				return '.png';
			case 'image/webp':
				return '.webp';
			case 'image/gif':
				return '.gif';
			case 'image/svg+xml':
				return '.svg';
			default:
				return '.bin';
		}
	}
}
