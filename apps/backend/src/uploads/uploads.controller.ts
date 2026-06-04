import { Controller, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { type UploadedImageFile, UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
	constructor(private readonly uploadsService: UploadsService) {}

	@Post('image')
	@UseInterceptors(
		FileInterceptor('file', {
			limits: {
				fileSize: 10 * 1024 * 1024,
			},
		}),
	)
	uploadImage(@Req() req: Request, @UploadedFile() file: UploadedImageFile) {
		const baseUrl = `${req.protocol}://${req.get('host')}`;
		return this.uploadsService.saveImage(file, baseUrl);
	}
}
