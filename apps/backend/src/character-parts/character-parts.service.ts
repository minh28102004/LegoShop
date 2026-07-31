import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CharacterPartType, Prisma, ProductStatus } from '@prisma/client';
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
import { PrismaService } from '../prisma/prisma.service';
import { CharacterPartsQueryDto } from './dto/character-parts-query.dto';
import { CreateCharacterPartDto } from './dto/create-character-part.dto';
import { UpdateCharacterPartDto } from './dto/update-character-part.dto';

type LegacyCharacterPartRow = {
  id: string;
  name: string;
  type: CharacterPartType;
  imageUrl: string;
  priceAdjustment: number;
  status: ProductStatus;
  sortOrder: number;
  tags: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class CharacterPartsService {
  private static readonly CHARACTER_BASE_PRICE = 10_000;
  private readonly logger = new Logger(CharacterPartsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findPublicCharacterParts(query?: CharacterPartsQueryDto) {
    const type = this.resolveType(query?.type);
    const search = query?.search?.trim();
    const take = Math.min(200, Math.max(1, query?.limit ?? 100));
    const skip = (Math.max(1, query?.page ?? 1) - 1) * take;

    try {
      return await this.prisma.characterPart.findMany({
        where: {
          status: ProductStatus.active,
          isActive: true,
          availability: 'available',
          ...(type ? { type } : {}),
          ...(query?.category_id ? { category: query.category_id.trim() } : {}),
          ...(search
            ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { slug: { contains: search, mode: 'insensitive' } },
                  { category: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip,
        take,
      });
    } catch (error) {
      if (this.isMissingTableError(error)) {
        this.logger.warn(
          'CharacterPart schema is behind the generated Prisma client. Serving the legacy-compatible part list.',
        );
        return this.findLegacyCharacterParts({ type, search, skip, take });
      }
      throw error;
    }
  }

  async findAdminCharacterParts(query?: CharacterPartsQueryDto) {
    if (hasAdminListQuery(query)) {
      const pagination = getAdminPagination(query);
      const { sortBy, sortDir, sortCriteria } = resolveSorts(
        query?.sort_by,
        query?.sort_dir,
        ['name', 'type', 'sortOrder', 'status', 'createdAt', 'updatedAt'],
        'sortOrder',
      );
      const orderBy = sortCriteria.map(({ field, direction }) => ({
        [field]: direction,
      })) as Prisma.CharacterPartOrderByWithRelationInput[];
      const dateRange = resolveDateRange(
        query,
        ['createdAt', 'updatedAt'],
        'createdAt',
      );
      const where: Prisma.CharacterPartWhereInput = {
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

      const types = getAllowedFilterValues(
        query?.type,
        Object.values(CharacterPartType),
        'type',
      );
      if (types.length > 0) {
        where.type = { in: types };
      }

      if (query?.search) {
        const searchFields = getAllowedSearchFields(
          query.search_fields,
          ['name', 'imageUrl'],
          ['name'],
        );
        where.OR = searchFields.map((field) => ({
          [field]: { contains: query.search, mode: 'insensitive' },
        }));
      }

      try {
        const [data, total] = await this.prisma.$transaction([
          this.prisma.characterPart.findMany({
            where,
            orderBy,
            skip: pagination.skip,
            take: pagination.take,
          }),
          this.prisma.characterPart.count({ where }),
        ]);

        return {
          data,
          meta: buildAdminListMeta({
            page: pagination.page,
            limit: pagination.limit,
            total,
            sortBy,
            sortDir,
            filtersApplied: {
              ...buildFiltersApplied(query, sortBy, sortDir),
              ...(query?.type ? { type: query.type } : {}),
            },
          }),
        };
      } catch (error) {
        if (this.isMissingTableError(error)) {
          this.logger.warn(
            'CharacterPart table is missing in the current database. Returning empty admin part list.',
          );
          return {
            data: [],
            meta: buildAdminListMeta({
              page: pagination.page,
              limit: pagination.limit,
              total: 0,
              sortBy,
              sortDir,
              filtersApplied: {
                ...buildFiltersApplied(query, sortBy, sortDir),
                ...(query?.type ? { type: query.type } : {}),
              },
            }),
          };
        }
        throw error;
      }
    }

    try {
      return await this.prisma.characterPart.findMany({
        orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      });
    } catch (error) {
      if (this.isMissingTableError(error)) {
        this.logger.warn(
          'CharacterPart table is missing in the current database. Returning empty admin part list.',
        );
        return [];
      }
      throw error;
    }
  }

  async findAdminCharacterPartById(id: string) {
    const part = await this.prisma.characterPart.findUnique({
      where: { id },
    });

    if (!part) {
      throw new NotFoundException('Character part not found');
    }

    return part;
  }

  async quoteCharacterBuilder(rawPartIds: string[]) {
    const partIds = Array.from(new Set(rawPartIds));
    const parts = await this.findAvailableCharacterParts(partIds);
    if (parts.length !== partIds.length) {
      throw new BadRequestException(
        'One or more character parts are unavailable',
      );
    }

    const requiredTypes = [
      CharacterPartType.FACE,
      CharacterPartType.TORSO,
      CharacterPartType.LEGS,
    ];
    for (const type of requiredTypes) {
      if (parts.filter((part) => part.type === type).length !== 1) {
        throw new BadRequestException(
          `A custom character requires exactly one ${type} part`,
        );
      }
    }
    if (
      parts.filter((part) => part.type === CharacterPartType.HAT).length > 1
    ) {
      throw new BadRequestException(
        'A custom character can contain at most one HAT part',
      );
    }

    const resolvedParts = parts.map((part) => ({
      id: part.id,
      name: part.name,
      type: part.type,
      imageUrl: part.imageUrl,
      priceAdjustment: Math.max(0, part.priceAdjustment),
    }));
    const partsTotal = resolvedParts.reduce(
      (total, part) => total + part.priceAdjustment,
      0,
    );

    return {
      valid: true,
      basePrice: CharacterPartsService.CHARACTER_BASE_PRICE,
      partsTotal,
      totalPrice: CharacterPartsService.CHARACTER_BASE_PRICE + partsTotal,
      resolvedParts,
    };
  }

  private async findAvailableCharacterParts(partIds: string[]) {
    try {
      return await this.prisma.characterPart.findMany({
        where: {
          id: { in: partIds },
          status: ProductStatus.active,
          isActive: true,
          availability: 'available',
        },
        orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
      });
    } catch (error) {
      if (!this.isMissingTableError(error)) throw error;
      return (
        await this.findLegacyCharacterParts({ skip: 0, take: 200 })
      ).filter((part) => partIds.includes(part.id));
    }
  }

  createCharacterPart(dto: CreateCharacterPartDto) {
    const resolvedStatus =
      dto.status ??
      (dto.isActive === false ? ProductStatus.inactive : ProductStatus.active);

    return this.prisma.characterPart.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        type: dto.type,
        imageUrl: dto.imageUrl,
        priceAdjustment: dto.priceAdjustment,
        compareAtPrice: dto.compareAtPrice,
        category: dto.category,
        availability: dto.availability,
        isActive: resolvedStatus === ProductStatus.active,
        compatibility:
          dto.compatibility === undefined
            ? undefined
            : (dto.compatibility as Prisma.InputJsonValue),
        sortOrder: dto.sortOrder,
        tags:
          dto.tags === undefined
            ? undefined
            : (dto.tags as Prisma.InputJsonValue),
        status: resolvedStatus,
      },
    });
  }

  async updateCharacterPart(id: string, dto: UpdateCharacterPartDto) {
    const existingPart = await this.prisma.characterPart.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingPart) {
      throw new NotFoundException('Character part not found');
    }

    const data: Prisma.CharacterPartUpdateInput = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.priceAdjustment !== undefined)
      data.priceAdjustment = dto.priceAdjustment;
    if (dto.compareAtPrice !== undefined)
      data.compareAtPrice = dto.compareAtPrice;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.availability !== undefined) data.availability = dto.availability;
    if (dto.status !== undefined) {
      data.status = dto.status;
      data.isActive = dto.status === ProductStatus.active;
    } else if (dto.isActive !== undefined) {
      data.isActive = dto.isActive;
      data.status = dto.isActive
        ? ProductStatus.active
        : ProductStatus.inactive;
    }
    if (dto.compatibility !== undefined)
      data.compatibility = dto.compatibility as Prisma.InputJsonValue;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.tags !== undefined) data.tags = dto.tags as Prisma.InputJsonValue;
    return this.prisma.characterPart.update({
      where: { id },
      data,
    });
  }

  async deleteCharacterPart(id: string) {
    const existingPart = await this.prisma.characterPart.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: {
            facePresets: true,
            hairPresets: true,
            torsoPresets: true,
            legsPresets: true,
            hatPresets: true,
            presetAccessories: true,
          },
        },
      },
    });

    if (!existingPart) {
      throw new NotFoundException('Character part not found');
    }

    const referenceCount = Object.values(existingPart._count).reduce(
      (total, count) => total + count,
      0,
    );
    if (referenceCount > 0) {
      throw new ConflictException(
        `Character part is used by ${referenceCount} preset relation(s). Disable it instead of deleting it.`,
      );
    }

    await this.prisma.characterPart.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Character part deleted successfully',
    };
  }

  private resolveType(type?: string): CharacterPartType | undefined {
    return Object.values(CharacterPartType).includes(type as CharacterPartType)
      ? (type as CharacterPartType)
      : undefined;
  }

  private async findLegacyCharacterParts({
    type,
    search,
    skip,
    take,
  }: {
    type?: CharacterPartType;
    search?: string;
    skip: number;
    take: number;
  }) {
    const rows = await this.prisma.$queryRaw<
      LegacyCharacterPartRow[]
    >(Prisma.sql`
      SELECT
        "id",
        "name",
        "type",
        "imageUrl",
        "priceAdjustment",
        "status",
        "sortOrder",
        "tags",
        "createdAt",
        "updatedAt"
      FROM "CharacterPart"
      WHERE "status" = 'active'
      ORDER BY "type" ASC, "sortOrder" ASC, "createdAt" DESC
    `);
    const normalizedSearch = search?.trim().toLocaleLowerCase('vi');

    return rows
      .filter((row) => !type || row.type === type)
      .filter(
        (row) =>
          !normalizedSearch ||
          row.name.toLocaleLowerCase('vi').includes(normalizedSearch),
      )
      .slice(skip, skip + take)
      .map((row) => ({
        ...row,
        slug: `legacy-${row.id}`,
        compareAtPrice: null,
        category: null,
        availability: 'available',
        isActive: true,
        compatibility: null,
      }));
  }

  private isMissingTableError(
    error: unknown,
  ): error is Prisma.PrismaClientKnownRequestError {
    const modelName =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? error.meta?.modelName
        : undefined;

    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === 'P2021' || error.code === 'P2022') &&
      typeof modelName === 'string' &&
      modelName.includes('CharacterPart')
    );
  }
}
