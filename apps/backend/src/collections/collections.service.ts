import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  findPublicCollections() {
    return this.prisma.collection.findMany({
      where: {
        status: ProductStatus.active,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findPublicCollectionBySlug(slug: string) {
    const collection = await this.prisma.collection.findFirst({
      where: {
        slug,
        status: ProductStatus.active,
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    return collection;
  }

  findAdminCollections() {
    return this.prisma.collection.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAdminCollectionById(id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    return collection;
  }

  async createCollection(dto: CreateCollectionDto) {
    const slug = this.generateSlug(dto.slug ?? dto.name);

    const duplicate = await this.prisma.collection.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (duplicate) {
      throw new ConflictException('Collection slug already exists');
    }

    return this.prisma.collection.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        imageUrl: dto.imageUrl,
        status: dto.status,
      },
    });
  }

  async updateCollection(id: string, dto: UpdateCollectionDto) {
    const existingCollection = await this.prisma.collection.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingCollection) {
      throw new NotFoundException('Collection not found');
    }

    const data: {
      name?: string;
      slug?: string;
      description?: string;
      imageUrl?: string;
      status?: ProductStatus;
    } = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.status !== undefined) data.status = dto.status;

    if (dto.slug !== undefined) {
      const normalizedSlug = this.generateSlug(dto.slug);
      const duplicate = await this.prisma.collection.findUnique({
        where: { slug: normalizedSlug },
        select: { id: true },
      });

      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('Collection slug already exists');
      }

      data.slug = normalizedSlug;
    }

    return this.prisma.collection.update({
      where: { id },
      data,
    });
  }

  async deleteCollection(id: string) {
    const existingCollection = await this.prisma.collection.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingCollection) {
      throw new NotFoundException('Collection not found');
    }

    await this.prisma.collection.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Collection deleted successfully',
    };
  }

  private generateSlug(value: string): string {
    const slug = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\u0111/g, 'd')
      .replace(/\u0110/g, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug) {
      throw new BadRequestException('Slug is invalid');
    }

    return slug;
  }
}
