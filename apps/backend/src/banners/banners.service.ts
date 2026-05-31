import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  findPublicBanners() {
    return this.prisma.banner.findMany({
      where: {
        status: ProductStatus.active,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  findAdminBanners() {
    return this.prisma.banner.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findAdminBannerById(id: string) {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    return banner;
  }

  createBanner(dto: CreateBannerDto) {
    return this.prisma.banner.create({
      data: {
        title: dto.title,
        imageUrl: dto.imageUrl,
        linkUrl: dto.linkUrl,
        sortOrder: dto.sortOrder,
        status: dto.status,
      },
    });
  }

  async updateBanner(id: string, dto: UpdateBannerDto) {
    const existingBanner = await this.prisma.banner.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingBanner) {
      throw new NotFoundException('Banner not found');
    }

    const data: {
      title?: string;
      imageUrl?: string;
      linkUrl?: string;
      sortOrder?: number;
      status?: ProductStatus;
    } = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.linkUrl !== undefined) data.linkUrl = dto.linkUrl;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.status !== undefined) data.status = dto.status;

    return this.prisma.banner.update({
      where: { id },
      data,
    });
  }

  async deleteBanner(id: string) {
    const existingBanner = await this.prisma.banner.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingBanner) {
      throw new NotFoundException('Banner not found');
    }

    await this.prisma.banner.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Banner deleted successfully',
    };
  }
}
