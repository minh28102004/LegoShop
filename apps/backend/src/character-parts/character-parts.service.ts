import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class CharacterPartsService {
  private readonly logger = new Logger(CharacterPartsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findPublicCharacterParts(query?: CharacterPartsQueryDto) {
    const type = this.resolveType(query?.type);

    try {
      return await this.prisma.characterPart.findMany({
        where: {
          status: ProductStatus.active,
          ...(type ? { type } : {}),
        },
        orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      });
    } catch (error) {
      if (this.isMissingTableError(error)) {
        this.logger.warn(
          'CharacterPart table is missing in the current database. Returning empty part list.',
        );
        return [];
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

  createCharacterPart(dto: CreateCharacterPartDto) {
    return this.prisma.characterPart.create({
      data: {
        name: dto.name,
        type: dto.type,
        imageUrl: dto.imageUrl,
        priceAdjustment: dto.priceAdjustment,
        sortOrder: dto.sortOrder,
        tags:
          dto.tags === undefined
            ? undefined
            : (dto.tags as Prisma.InputJsonValue),
        status: dto.status,
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
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.priceAdjustment !== undefined)
      data.priceAdjustment = dto.priceAdjustment;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.tags !== undefined) data.tags = dto.tags as Prisma.InputJsonValue;
    if (dto.status !== undefined) data.status = dto.status;

    return this.prisma.characterPart.update({
      where: { id },
      data,
    });
  }

  async deleteCharacterPart(id: string) {
    const existingPart = await this.prisma.characterPart.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingPart) {
      throw new NotFoundException('Character part not found');
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

  private isMissingTableError(
    error: unknown,
  ): error is Prisma.PrismaClientKnownRequestError {
    const modelName =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? error.meta?.modelName
        : undefined;

    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2021' &&
      typeof modelName === 'string' &&
      modelName.includes('CharacterPart')
    );
  }
}
