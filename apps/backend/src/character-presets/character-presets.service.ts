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
import { PrismaService } from '../prisma/prisma.service';
import { CharacterPresetsQueryDto } from './dto/character-presets-query.dto';
import { CreateCharacterPresetDto } from './dto/create-character-preset.dto';
import { UpdateCharacterPresetDto } from './dto/update-character-preset.dto';

@Injectable()
export class CharacterPresetsService {
  constructor(private readonly prisma: PrismaService) {}

  findPublicCharacterPresets(_query?: CharacterPresetsQueryDto) {
    return this.prisma.characterPreset.findMany({
      where: { status: ProductStatus.active },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findAdminCharacterPresets(query?: CharacterPresetsQueryDto) {
    if (hasAdminListQuery(query)) {
      const pagination = getAdminPagination(query);
      const { sortBy, sortDir, sortCriteria } = resolveSorts(
        query?.sort_by,
        query?.sort_dir,
        ['name', 'sortOrder', 'status', 'createdAt', 'updatedAt'],
        'sortOrder',
      );
      const orderBy = sortCriteria.map(({ field, direction }) => ({
        [field]: direction,
      })) as Prisma.CharacterPresetOrderByWithRelationInput[];
      const dateRange = resolveDateRange(query, ['createdAt', 'updatedAt'], 'createdAt');
      const where: Prisma.CharacterPresetWhereInput = {
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
          ['name', 'description'],
          ['name'],
        );
        where.OR = searchFields.map((field) => ({
          [field]: { contains: query.search, mode: 'insensitive' },
        }));
      }

      const [data, total] = await this.prisma.$transaction([
        this.prisma.characterPreset.findMany({
          where,
          orderBy,
          skip: pagination.skip,
          take: pagination.take,
        }),
        this.prisma.characterPreset.count({ where }),
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

    return this.prisma.characterPreset.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findAdminCharacterPresetById(id: string) {
    const preset = await this.prisma.characterPreset.findUnique({ where: { id } });
    if (!preset) throw new NotFoundException('Character preset not found');
    return preset;
  }

  createCharacterPreset(dto: CreateCharacterPresetDto) {
    return this.prisma.characterPreset.create({
      data: {
        name: dto.name,
        description: dto.description,
        faceHint: dto.faceHint,
        hairHint: dto.hairHint,
        torsoHint: dto.torsoHint,
        legsHint: dto.legsHint,
        hatHint: dto.hatHint,
        sortOrder: dto.sortOrder ?? 0,
        status: dto.status,
      },
    });
  }

  async updateCharacterPreset(id: string, dto: UpdateCharacterPresetDto) {
    const existing = await this.prisma.characterPreset.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Character preset not found');

    const data: Prisma.CharacterPresetUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.faceHint !== undefined) data.faceHint = dto.faceHint;
    if (dto.hairHint !== undefined) data.hairHint = dto.hairHint;
    if (dto.torsoHint !== undefined) data.torsoHint = dto.torsoHint;
    if (dto.legsHint !== undefined) data.legsHint = dto.legsHint;
    if (dto.hatHint !== undefined) data.hatHint = dto.hatHint;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.status !== undefined) data.status = dto.status;

    return this.prisma.characterPreset.update({ where: { id }, data });
  }

  async deleteCharacterPreset(id: string) {
    const existing = await this.prisma.characterPreset.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Character preset not found');

    await this.prisma.characterPreset.delete({ where: { id } });
    return { success: true, message: 'Character preset deleted successfully' };
  }
}
