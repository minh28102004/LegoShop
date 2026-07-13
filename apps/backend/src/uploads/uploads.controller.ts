import { Controller, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { type UploadedImageFile, UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
	constructor(private readonly uploadsService: UploadsService) {}

	@Post('image')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(
		FileInterceptor('file', {
			limits: {
				fileSize: 10 * 1024 * 1024,
			},
		}),
	)
	uploadImage(@Req() req: Request, @UploadedFile() file: UploadedImageFile) {
		const baseUrl = `${req.protocol}://${req.get('host')}`;
		return this.uploadsService.saveImage(file, baseUrl, 'admin');
	}

	@Post('admin/image')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(
		FileInterceptor('file', {
			limits: {
				fileSize: 10 * 1024 * 1024,
			},
		}),
	)
	uploadAdminImage(@Req() req: Request, @UploadedFile() file: UploadedImageFile) {
		const baseUrl = `${req.protocol}://${req.get('host')}`;
		return this.uploadsService.saveImage(file, baseUrl, 'admin');
	}

	@Post('customer/image')
	@UseInterceptors(
		FileInterceptor('file', {
			limits: {
				fileSize: 5 * 1024 * 1024,
			},
		}),
	)
	uploadCustomerImage(@Req() req: Request, @UploadedFile() file: UploadedImageFile) {
		const baseUrl = `${req.protocol}://${req.get('host')}`;
		return this.uploadsService.saveImage(file, baseUrl, 'customer');
	}

	@Post('previews/image')
	@UseInterceptors(
		FileInterceptor('file', {
			limits: {
				fileSize: 5 * 1024 * 1024,
			},
		}),
	)
	uploadPreviewImage(@Req() req: Request, @UploadedFile() file: UploadedImageFile) {
		const baseUrl = `${req.protocol}://${req.get('host')}`;
		return this.uploadsService.saveImage(file, baseUrl, 'previews');
	}
}
