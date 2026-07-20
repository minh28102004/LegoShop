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
} from '../common/admin-query/admin-query.util';
import { AdminListQueryDto } from '../common/dto/admin-list-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  stagedSampleMediaPublicStatus,
  stagedSampleMediaSeedTag,
} from '../common/sample-media-preview';
import { CreateFrameBackgroundDto } from './dto/create-frame-background.dto';
import { UpdateFrameBackgroundDto } from './dto/update-frame-background.dto';

@Injectable()
export class FrameBackgroundsService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublicBackgrounds(frameOptionId?: string, category?: string) {
    const previewSeedTag = stagedSampleMediaSeedTag();
    const visibility = previewSeedTag
      ? {
          OR: [
            { status: ProductStatus.active },
            { status: ProductStatus.inactive, seedTag: previewSeedTag },
          ],
        }
      : { status: ProductStatus.active };
    const backgrounds = await this.prisma.frameBackground.findMany({
      where: {
        AND: [
          visibility,
          ...(frameOptionId
            ? [
                {
                  OR: [
                    { frameOptionIds: { isEmpty: true } },
                    { frameOptionIds: { has: frameOptionId } },
                  ],
                },
              ]
            : []),
        ],
        ...(category ? { category } : {}),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        description: true,
        instructions: true,
        imageUrl: true,
        thumbnailUrl: true,
        naturalWidth: true,
        naturalHeight: true,
        contentFields: true,
        frameOptionIds: true,
        sortOrder: true,
        seedTag: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return backgrounds.map(({ seedTag, ...background }) => ({
      ...background,
      status: stagedSampleMediaPublicStatus(
        background.status,
        Boolean(previewSeedTag && seedTag === previewSeedTag),
      ),
    }));
  }

  async findAdminBackgrounds(query?: AdminListQueryDto) {
    if (hasAdminListQuery(query)) {
      const pagination = getAdminPagination(query);
      const { sortBy, sortDir, sortCriteria } = resolveSorts(
        query?.sort_by,
        query?.sort_dir,
        ['title', 'sortOrder', 'status', 'createdAt', 'updatedAt'],
        'sortOrder',
      );
      const orderBy = sortCriteria.map(({ field, direction }) => ({
        [field]: direction,
      })) as Prisma.FrameBackgroundOrderByWithRelationInput[];
      const dateRange = resolveDateRange(
        query,
        ['createdAt', 'updatedAt'],
        'createdAt',
      );
      const where: Prisma.FrameBackgroundWhereInput = {
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

      if (query?.search) {
        const searchFields = getAllowedSearchFields(
          query.search_fields,
          ['title', 'description', 'instructions', 'imageUrl'],
          ['title', 'description', 'instructions', 'imageUrl'],
        );
        where.OR = searchFields.map((field) => ({
          [field]: { contains: query.search, mode: 'insensitive' },
        }));
      }

      const [data, total] = await this.prisma.$transaction([
        this.prisma.frameBackground.findMany({
          where,
          orderBy,
          skip: pagination.skip,
          take: pagination.take,
        }),
        this.prisma.frameBackground.count({ where }),
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

    return this.prisma.frameBackground.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findAdminBackgroundById(id: string) {
    const frameBackground = await this.prisma.frameBackground.findUnique({
      where: { id },
    });

    if (!frameBackground) {
      throw new NotFoundException('Frame background not found');
    }

    return frameBackground;
  }

  createBackground(dto: CreateFrameBackgroundDto) {
    return this.prisma.frameBackground.create({
      data: {
        title: dto.title,
        description: dto.description,
        instructions: dto.instructions,
        imageUrl: dto.imageUrl,
        contentFields:
          dto.contentFields !== undefined
            ? (dto.contentFields as Prisma.InputJsonValue)
            : undefined,
        frameOptionIds: dto.frameOptionIds,
        sortOrder: dto.sortOrder,
        status: dto.status,
      },
    });
  }

  async updateBackground(id: string, dto: UpdateFrameBackgroundDto) {
    const existingBackground = await this.prisma.frameBackground.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingBackground) {
      throw new NotFoundException('Frame background not found');
    }

    return this.prisma.frameBackground.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.instructions !== undefined
          ? { instructions: dto.instructions }
          : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
        ...(dto.contentFields !== undefined
          ? { contentFields: dto.contentFields as Prisma.InputJsonValue }
          : {}),
        ...(dto.frameOptionIds !== undefined
          ? { frameOptionIds: dto.frameOptionIds }
          : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
    });
  }

  async deleteBackground(id: string) {
    const existingBackground = await this.prisma.frameBackground.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingBackground) {
      throw new NotFoundException('Frame background not found');
    }

    await this.prisma.frameBackground.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Frame background deleted successfully',
    };
  }
}
