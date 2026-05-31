import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateCategoryDto } from './dto/create-template-category.dto';
import { UpdateTemplateCategoryDto } from './dto/update-template-category.dto';

@Injectable()
export class TemplateCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findPublicTemplateCategories() {
    return this.prisma.templateCategory.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            templates: true,
          },
        },
      },
    });
  }

  findAdminTemplateCategories() {
    return this.prisma.templateCategory.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            templates: true,
          },
        },
      },
    });
  }

  async findAdminTemplateCategoryById(id: string) {
    const category = await this.prisma.templateCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            templates: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Template category not found');
    }

    return category;
  }

  async createTemplateCategory(dto: CreateTemplateCategoryDto) {
    const slug = this.generateSlug(dto.slug ?? dto.name);

    const duplicate = await this.prisma.templateCategory.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (duplicate) {
      throw new ConflictException('Template category slug already exists');
    }

    return this.prisma.templateCategory.create({
      data: {
        name: dto.name,
        slug,
      },
      include: {
        _count: {
          select: {
            templates: true,
          },
        },
      },
    });
  }

  async updateTemplateCategory(id: string, dto: UpdateTemplateCategoryDto) {
    const existing = await this.prisma.templateCategory.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Template category not found');
    }

    const data: {
      name?: string;
      slug?: string;
    } = {};

    if (dto.name !== undefined) data.name = dto.name;

    if (dto.slug !== undefined) {
      const normalizedSlug = this.generateSlug(dto.slug);
      const duplicate = await this.prisma.templateCategory.findUnique({
        where: { slug: normalizedSlug },
        select: { id: true },
      });

      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('Template category slug already exists');
      }

      data.slug = normalizedSlug;
    }

    return this.prisma.templateCategory.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            templates: true,
          },
        },
      },
    });
  }

  async deleteTemplateCategory(id: string) {
    const existing = await this.prisma.templateCategory.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: {
            templates: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Template category not found');
    }

    if (existing._count.templates > 0) {
      throw new ConflictException('Category has templates');
    }

    await this.prisma.templateCategory.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Template category deleted successfully',
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
