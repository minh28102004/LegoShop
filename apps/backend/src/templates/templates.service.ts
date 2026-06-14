import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import {
  buildAdminListMeta,
  buildDateFilter,
  buildFiltersApplied,
  getAdminPagination,
  getAllowedFilterValues,
  getAllowedSearchFields,
  hasAdminListQuery,
  resolveDateRange,
  resolveSorts,
  splitCsv,
} from '../common/admin-query/admin-query.util';
import { AdminListQueryDto } from '../common/dto/admin-list-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  findPublicTemplates() {
    return this.prisma.template.findMany({
      where: {
        status: ProductStatus.active,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findPublicTemplateById(id: string) {
    const template = await this.prisma.template.findFirst({
      where: {
        id,
        status: ProductStatus.active,
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async findAdminTemplates(query?: AdminListQueryDto) {
    if (hasAdminListQuery(query)) {
      const pagination = getAdminPagination(query);
      const { sortBy, sortDir, sortCriteria } = resolveSorts(
        query?.sort_by,
        query?.sort_dir,
        ['name', 'status', 'categoryId', 'createdAt', 'updatedAt'],
        'createdAt',
      );
      const orderBy = sortCriteria.map(({ field, direction }) => ({
        [field]: direction,
      })) as Prisma.TemplateOrderByWithRelationInput[];
      const dateRange = resolveDateRange(
        query,
        ['createdAt', 'updatedAt'],
        'createdAt',
      );
      const where: Prisma.TemplateWhereInput = {
        ...buildDateFilter(dateRange),
      };

      const statuses = getAllowedFilterValues(
        query?.status,
        Object.values(ProductStatus),
        'status',
      );
      if (statuses.length > 0) {
        where.status = { in: statuses };
      }

      const categoryIds = splitCsv(query?.category_id);
      if (categoryIds.length > 0) {
        where.categoryId = { in: categoryIds };
      }

      if (query?.search) {
        const searchFields = getAllowedSearchFields(
          query.search_fields,
          ['name'],
          ['name'],
        );
        where.OR = searchFields.map((field) => ({
          [field]: { contains: query.search, mode: 'insensitive' },
        }));
      }

      const [data, total] = await this.prisma.$transaction([
        this.prisma.template.findMany({
          where,
          orderBy,
          include: {
            category: true,
          },
          skip: pagination.skip,
          take: pagination.take,
        }),
        this.prisma.template.count({ where }),
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

    return this.prisma.template.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        category: true,
      },
    });
  }

  async findAdminTemplateById(id: string) {
    const template = await this.prisma.template.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  createTemplate(dto: CreateTemplateDto) {
    return this.prisma.template.create({
      data: {
        name: dto.name,
        imageUrl: dto.imageUrl,
        configJson:
          dto.configJson !== undefined
            ? (dto.configJson as Prisma.InputJsonValue)
            : undefined,
        status: dto.status,
        categoryId: dto.categoryId,
      },
      include: {
        category: true,
      },
    });
  }

  async updateTemplate(id: string, dto: UpdateTemplateDto) {
    const existingTemplate = await this.prisma.template.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingTemplate) {
      throw new NotFoundException('Template not found');
    }

    const data: {
      name?: string;
      imageUrl?: string;
      configJson?: Prisma.InputJsonValue;
      status?: ProductStatus;
      categoryId?: string;
    } = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;
    if (dto.configJson !== undefined) {
      data.configJson = dto.configJson as Prisma.InputJsonValue;
    }

    return this.prisma.template.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async deleteTemplate(id: string) {
    const existingTemplate = await this.prisma.template.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingTemplate) {
      throw new NotFoundException('Template not found');
    }

    await this.prisma.template.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Template deleted successfully',
    };
  }
}
