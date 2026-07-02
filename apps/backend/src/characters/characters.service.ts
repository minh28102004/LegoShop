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
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';

@Injectable()
export class CharactersService {
  constructor(private readonly prisma: PrismaService) {}

  findPublicCharacters() {
    return this.prisma.character.findMany({
      where: {
        status: ProductStatus.active,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findPublicCharacterById(id: string) {
    const character = await this.prisma.character.findFirst({
      where: {
        id,
        status: ProductStatus.active,
      },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    return character;
  }

  async findAdminCharacters(query?: AdminListQueryDto) {
    if (hasAdminListQuery(query)) {
      const pagination = getAdminPagination(query);
      const { sortBy, sortDir, sortCriteria } = resolveSorts(
        query?.sort_by,
        query?.sort_dir,
        ['name', 'price', 'sortOrder', 'status', 'createdAt', 'updatedAt'],
        'sortOrder',
      );
      const orderBy = sortCriteria.map(({ field, direction }) => ({
        [field]: direction,
      })) as Prisma.CharacterOrderByWithRelationInput[];
      const dateRange = resolveDateRange(
        query,
        ['createdAt', 'updatedAt'],
        'createdAt',
      );
      const where: Prisma.CharacterWhereInput = {
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

      if (query?.price_min !== undefined || query?.price_max !== undefined) {
        where.price = {
          ...(query.price_min !== undefined ? { gte: query.price_min } : {}),
          ...(query.price_max !== undefined ? { lte: query.price_max } : {}),
        };
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

      const [data, total] = await this.prisma.$transaction([
        this.prisma.character.findMany({
          where,
          orderBy,
          skip: pagination.skip,
          take: pagination.take,
        }),
        this.prisma.character.count({ where }),
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

    return this.prisma.character.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findAdminCharacterById(id: string) {
    const character = await this.prisma.character.findUnique({
      where: { id },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    return character;
  }

  createCharacter(dto: CreateCharacterDto) {
    return this.prisma.character.create({
      data: {
        name: dto.name,
        price: dto.price,
        imageUrl: dto.imageUrl,
        sortOrder: dto.sortOrder,
        status: dto.status,
      },
    });
  }

  async updateCharacter(id: string, dto: UpdateCharacterDto) {
    const existingCharacter = await this.prisma.character.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingCharacter) {
      throw new NotFoundException('Character not found');
    }

    return this.prisma.character.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
    });
  }

  async deleteCharacter(id: string) {
    const existingCharacter = await this.prisma.character.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingCharacter) {
      throw new NotFoundException('Character not found');
    }

    await this.prisma.character.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Character deleted successfully',
    };
  }
}
