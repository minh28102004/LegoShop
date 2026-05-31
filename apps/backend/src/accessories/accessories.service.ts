import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccessoryDto } from './dto/create-accessory.dto';
import { UpdateAccessoryDto } from './dto/update-accessory.dto';

@Injectable()
export class AccessoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findPublicAccessories() {
    return this.prisma.accessory.findMany({
      where: {
        status: ProductStatus.active,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findPublicAccessoryById(id: string) {
    const accessory = await this.prisma.accessory.findFirst({
      where: {
        id,
        status: ProductStatus.active,
      },
    });

    if (!accessory) {
      throw new NotFoundException('Accessory not found');
    }

    return accessory;
  }

  findAdminAccessories() {
    return this.prisma.accessory.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        category: true,
      },
    });
  }

  async findAdminAccessoryById(id: string) {
    const accessory = await this.prisma.accessory.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!accessory) {
      throw new NotFoundException('Accessory not found');
    }

    return accessory;
  }

  createAccessory(dto: CreateAccessoryDto) {
    return this.prisma.accessory.create({
      data: {
        name: dto.name,
        imageUrl: dto.imageUrl,
        iconUrl: dto.iconUrl,
        status: dto.status,
        categoryId: dto.categoryId,
      },
      include: {
        category: true,
      },
    });
  }

  async updateAccessory(id: string, dto: UpdateAccessoryDto) {
    const existingAccessory = await this.prisma.accessory.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingAccessory) {
      throw new NotFoundException('Accessory not found');
    }

    const data: {
      name?: string;
      imageUrl?: string;
      iconUrl?: string;
      status?: ProductStatus;
      categoryId?: string;
    } = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.iconUrl !== undefined) data.iconUrl = dto.iconUrl;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;

    return this.prisma.accessory.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async deleteAccessory(id: string) {
    const existingAccessory = await this.prisma.accessory.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingAccessory) {
      throw new NotFoundException('Accessory not found');
    }

    await this.prisma.accessory.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Accessory deleted successfully',
    };
  }
}
