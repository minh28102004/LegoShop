import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  buildAdminListMeta,
  buildDateFilter,
  buildFiltersApplied,
  getAdminPagination,
  getAllowedSearchFields,
  hasAdminListQuery,
  resolveDateRange,
  resolveSorts,
} from '../common/admin-query/admin-query.util';
import { AdminListQueryDto } from '../common/dto/admin-list-query.dto';
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

  async findAdminAccessoryCategories(query?: AdminListQueryDto) {
    if (hasAdminListQuery(query)) {
      const pagination = getAdminPagination(query);
      const { sortBy, sortDir, sortCriteria } = resolveSorts(
        query?.sort_by,
        query?.sort_dir,
        ['name', 'slug', 'createdAt', 'updatedAt'],
        'createdAt',
      );
      const orderBy = sortCriteria.map(({ field, direction }) => ({
        [field]: direction,
      })) as Prisma.AccessoryCategoryOrderByWithRelationInput[];
      const dateRange = resolveDateRange(
        query,
        ['createdAt', 'updatedAt'],
        'createdAt',
      );
      const where: Prisma.AccessoryCategoryWhereInput = {
        ...buildDateFilter(dateRange),
      };

      if (query?.search) {
        const searchFields = getAllowedSearchFields(
          query.search_fields,
          ['name', 'slug'],
          ['name', 'slug'],
        );
        where.OR = searchFields.map((field) => ({
          [field]: { contains: query.search, mode: 'insensitive' },
        }));
      }

      const [data, total] = await this.prisma.$transaction([
        this.prisma.accessoryCategory.findMany({
          where,
          orderBy,
          include: {
            _count: {
              select: {
                accessories: true,
              },
            },
          },
          skip: pagination.skip,
          take: pagination.take,
        }),
        this.prisma.accessoryCategory.count({ where }),
      ]);

      return {
        data,
        meta: buildAdminListMeta({
          page: pagination.page,
          limit: pagination.limit,
          total,
          sortBy,
          sortDir,
          filtersApplied: buildFiltersApplied(query, sortBy, sortDir),
        }),
      };
    }

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
