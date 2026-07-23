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
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublicBanners() {
    const previewSeedTag = stagedSampleMediaSeedTag();
    const banners = await this.prisma.banner.findMany({
      where: previewSeedTag
        ? {
            OR: [
              { status: ProductStatus.active },
              { status: ProductStatus.inactive, seedTag: previewSeedTag },
            ],
          }
        : { status: ProductStatus.active },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        linkUrl: true,
        sortOrder: true,
        naturalWidth: true,
        naturalHeight: true,
        seedTag: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return banners.map(({ seedTag, ...banner }) => ({
      ...banner,
      status: stagedSampleMediaPublicStatus(
        banner.status,
        Boolean(previewSeedTag && seedTag === previewSeedTag),
      ),
    }));
  }

  async findPublicHomepageMedia() {
    const previewSeedTag = stagedSampleMediaSeedTag();
    if (!previewSeedTag) return [];

    const media = await this.prisma.sampleMediaImport.findMany({
      where: {
        seedTag: previewSeedTag,
        kind: 'homepage',
      },
      select: {
        id: true,
        sourceKey: true,
        destinationUrl: true,
        thumbnailUrl: true,
        naturalWidth: true,
        naturalHeight: true,
        metadata: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: 'asc' }, { sourceKey: 'asc' }],
    });

    return media.map(({ destinationUrl, metadata, ...item }, index) => {
      const sourceSortOrder = this.readSourceSortOrder(metadata);

      return {
        id: item.id,
        sourceKey: item.sourceKey,
        imageUrl: destinationUrl,
        thumbnailUrl: item.thumbnailUrl,
        naturalWidth: item.naturalWidth,
        naturalHeight: item.naturalHeight,
        sortOrder: sourceSortOrder ?? index + 1,
      };
    });
  }

  private readSourceSortOrder(value: Prisma.JsonValue | null) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }

    const sortOrder = value.sourceSortOrder;
    return typeof sortOrder === 'number' && Number.isInteger(sortOrder)
      ? sortOrder
      : undefined;
  }

  async findAdminBanners(query?: AdminListQueryDto) {
    if (hasAdminListQuery(query)) {
      const pagination = getAdminPagination(query);
      const { sortBy, sortDir, sortCriteria } = resolveSorts(
        query?.sort_by,
        query?.sort_dir,
        ['title', 'sortOrder', 'status', 'createdAt', 'updatedAt'],
        'createdAt',
      );
      const orderBy = sortCriteria.map(({ field, direction }) => ({
        [field]: direction,
      })) as Prisma.BannerOrderByWithRelationInput[];
      const dateRange = resolveDateRange(
        query,
        ['createdAt', 'updatedAt'],
        'createdAt',
      );
      const where: Prisma.BannerWhereInput = {
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
          ['title', 'linkUrl'],
          ['title', 'linkUrl'],
        );
        where.OR = searchFields.map((field) => ({
          [field]: { contains: query.search, mode: 'insensitive' },
        }));
      }

      const [data, total] = await this.prisma.$transaction([
        this.prisma.banner.findMany({
          where,
          orderBy,
          skip: pagination.skip,
          take: pagination.take,
        }),
        this.prisma.banner.count({ where }),
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
