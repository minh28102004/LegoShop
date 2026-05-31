import { Controller, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request } from 'express';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
	constructor(private readonly uploadsService: UploadsService) {}

	@Post('image')
	@UseInterceptors(
		FileInterceptor('file', {
			storage: memoryStorage(),
			limits: {
				fileSize: 10 * 1024 * 1024,
			},
		}),
	)
	uploadImage(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
		const baseUrl = `${req.protocol}://${req.get('host')}`;
		return this.uploadsService.saveImage(file, baseUrl);
	}
}
