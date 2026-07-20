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
import {
  stagedSampleMediaPublicStatus,
  stagedSampleMediaSeedTag,
} from '../common/sample-media-preview';
import { CreateAccessoryDto } from './dto/create-accessory.dto';
import { UpdateAccessoryDto } from './dto/update-accessory.dto';

@Injectable()
export class AccessoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublicAccessories(categoryId?: string) {
    const previewSeedTag = stagedSampleMediaSeedTag();
    const accessories = await this.prisma.accessory.findMany({
      where: {
        ...(previewSeedTag
          ? {
              OR: [
                { status: ProductStatus.active },
                { status: ProductStatus.inactive, seedTag: previewSeedTag },
              ],
            }
          : { status: ProductStatus.active }),
        ...(categoryId ? { categoryId } : {}),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        imageUrl: true,
        iconUrl: true,
        sortOrder: true,
        naturalWidth: true,
        naturalHeight: true,
        seedTag: true,
        status: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return accessories.map(({ seedTag, ...accessory }) => ({
      ...accessory,
      status: stagedSampleMediaPublicStatus(
        accessory.status,
        Boolean(previewSeedTag && seedTag === previewSeedTag),
      ),
    }));
  }

  async findPublicAccessoryById(id: string) {
    const previewSeedTag = stagedSampleMediaSeedTag();
    const accessory = await this.prisma.accessory.findFirst({
      where: {
        id,
        ...(previewSeedTag
          ? {
              OR: [
                { status: ProductStatus.active },
                { status: ProductStatus.inactive, seedTag: previewSeedTag },
              ],
            }
          : { status: ProductStatus.active }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        imageUrl: true,
        iconUrl: true,
        sortOrder: true,
        naturalWidth: true,
        naturalHeight: true,
        seedTag: true,
        status: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!accessory) {
      throw new NotFoundException('Accessory not found');
    }

    const { seedTag, ...publicAccessory } = accessory;
    return {
      ...publicAccessory,
      status: stagedSampleMediaPublicStatus(
        publicAccessory.status,
        Boolean(previewSeedTag && seedTag === previewSeedTag),
      ),
    };
  }

  async findAdminAccessories(query?: AdminListQueryDto) {
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
      })) as Prisma.AccessoryOrderByWithRelationInput[];
      const dateRange = resolveDateRange(
        query,
        ['createdAt', 'updatedAt'],
        'createdAt',
      );
      const where: Prisma.AccessoryWhereInput = {
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
        this.prisma.accessory.findMany({
          where,
          orderBy,
          include: {
            category: true,
          },
          skip: pagination.skip,
          take: pagination.take,
        }),
        this.prisma.accessory.count({ where }),
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
        price: dto.price,
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
      price?: number;
      imageUrl?: string;
      iconUrl?: string;
      status?: ProductStatus;
      categoryId?: string;
    } = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.price !== undefined) data.price = dto.price;
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
