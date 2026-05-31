import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccessoryCategoryDto } from './dto/create-accessory-category.dto';
import { UpdateAccessoryCategoryDto } from './dto/update-accessory-category.dto';

@Injectable()
export class AccessoryCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findPublicAccessoryCategories() {
    return this.prisma.accessoryCategory.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            accessories: true,
          },
        },
      },
    });
  }

  findAdminAccessoryCategories() {
    return this.prisma.accessoryCategory.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            accessories: true,
          },
        },
      },
    });
  }

  async findAdminAccessoryCategoryById(id: string) {
    const category = await this.prisma.accessoryCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            accessories: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Accessory category not found');
    }

    return category;
  }

  async createAccessoryCategory(dto: CreateAccessoryCategoryDto) {
    const slug = this.generateSlug(dto.slug ?? dto.name);

    const duplicate = await this.prisma.accessoryCategory.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (duplicate) {
      throw new ConflictException('Accessory category slug already exists');
    }

    return this.prisma.accessoryCategory.create({
      data: {
        name: dto.name,
        slug,
      },
      include: {
        _count: {
          select: {
            accessories: true,
          },
        },
      },
    });
  }

  async updateAccessoryCategory(id: string, dto: UpdateAccessoryCategoryDto) {
    const existing = await this.prisma.accessoryCategory.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Accessory category not found');
    }

    const data: {
      name?: string;
      slug?: string;
    } = {};

    if (dto.name !== undefined) data.name = dto.name;

    if (dto.slug !== undefined) {
      const normalizedSlug = this.generateSlug(dto.slug);
      const duplicate = await this.prisma.accessoryCategory.findUnique({
        where: { slug: normalizedSlug },
        select: { id: true },
      });

      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('Accessory category slug already exists');
      }

      data.slug = normalizedSlug;
    }

    return this.prisma.accessoryCategory.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            accessories: true,
          },
        },
      },
    });
  }

  async deleteAccessoryCategory(id: string) {
    const existing = await this.prisma.accessoryCategory.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: {
            accessories: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Accessory category not found');
    }

    if (existing._count.accessories > 0) {
      throw new ConflictException('Category has accessories');
    }

    await this.prisma.accessoryCategory.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Accessory category deleted successfully',
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
