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
import { CharacterPresetsQueryDto } from './dto/character-presets-query.dto';
import { CreateCharacterPresetDto } from './dto/create-character-preset.dto';
import { UpdateCharacterPresetDto } from './dto/update-character-preset.dto';

type LegacyCharacterPresetRow = {
  id: string;
  name: string;
  description: string | null;
  faceHint: string | null;
  hairHint: string | null;
  torsoHint: string | null;
  legsHint: string | null;
  hatHint: string | null;
  sortOrder: number;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class CharacterPresetsService {
  private readonly logger = new Logger(CharacterPresetsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findPublicCharacterPresets(query?: CharacterPresetsQueryDto) {
    const search = query?.search?.trim();
    const take = Math.min(40, Math.max(1, query?.limit ?? 24));

    try {
      return await this.prisma.characterPreset.findMany({
        where: {
          status: ProductStatus.active,
          isBuilderPreset: true,
          ...(search
            ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { slug: { contains: search, mode: 'insensitive' } },
                  { description: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        include: this.presetCompositionInclude(),
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        take,
      });
    } catch (error) {
      if (this.isMissingTableError(error)) {
        this.logger.warn(
          'CharacterPreset schema is behind the generated Prisma client. Serving the legacy-compatible preset list.',
        );
        return this.findLegacyCharacterPresets({ search, take });
      }
      throw error;
    }
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
      const dateRange = resolveDateRange(
        query,
        ['createdAt', 'updatedAt'],
        'createdAt',
      );
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

      try {
        const [data, total] = await this.prisma.$transaction([
          this.prisma.characterPreset.findMany({
            where,
            include: this.presetCompositionInclude(),
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
      } catch (error) {
        if (this.isMissingTableError(error)) {
          this.logger.warn(
            'CharacterPreset table is missing in the current database. Returning empty admin preset list.',
          );
          return {
            data: [],
            meta: buildAdminListMeta({
              page: pagination.page,
              limit: pagination.limit,
              total: 0,
              sortBy,
              sortDir,
              filtersApplied: buildFiltersApplied(query, sortBy, sortDir),
            }),
          };
        }
        throw error;
      }
    }

    try {
      return await this.prisma.characterPreset.findMany({
        include: this.presetCompositionInclude(),
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      });
    } catch (error) {
      if (this.isMissingTableError(error)) {
        this.logger.warn(
          'CharacterPreset table is missing in the current database. Returning empty admin preset list.',
        );
        return [];
      }
      throw error;
    }
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
      modelName.includes('CharacterPreset')
    );
  }

  private async findLegacyCharacterPresets({
    search,
    take,
  }: {
    search?: string;
    take: number;
  }) {
    const rows = await this.prisma.$queryRaw<LegacyCharacterPresetRow[]>(
      Prisma.sql`
        SELECT
          "id",
          "name",
          "description",
          "faceHint",
          "hairHint",
          "torsoHint",
          "legsHint",
          "hatHint",
          "sortOrder",
          "status",
          "createdAt",
          "updatedAt"
        FROM "CharacterPreset"
        WHERE "status" = 'active'
        ORDER BY "sortOrder" ASC, "createdAt" ASC
      `,
    );
    const normalizedSearch = search?.trim().toLocaleLowerCase('vi');

    return rows
      .filter(
        (row) =>
          !normalizedSearch ||
          [row.name, row.description].some((value) =>
            value?.toLocaleLowerCase('vi').includes(normalizedSearch),
          ),
      )
      .slice(0, take)
      .map((row) => ({
        ...row,
        slug: `legacy-${row.id}`,
        previewImageUrl: null,
        isBuilderPreset: true,
        isSellable: false,
        facePartId: null,
        hairPartId: null,
        torsoPartId: null,
        legsPartId: null,
        hatPartId: null,
        facePart: null,
        hairPart: null,
        torsoPart: null,
        legsPart: null,
        hatPart: null,
        accessories: [],
      }));
  }

  async findAdminCharacterPresetById(id: string) {
    const preset = await this.prisma.characterPreset.findUnique({
      where: { id },
      include: this.presetCompositionInclude(),
    });
    if (!preset) throw new NotFoundException('Character preset not found');
    return preset;
  }

  async createCharacterPreset(dto: CreateCharacterPresetDto) {
    await this.validateComposition(dto);

    return this.prisma.characterPreset.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        previewImageUrl: dto.previewImageUrl,
        isBuilderPreset: dto.isBuilderPreset,
        isSellable: dto.isSellable,
        faceHint: dto.faceHint,
        hairHint: dto.hairHint,
        torsoHint: dto.torsoHint,
        legsHint: dto.legsHint,
        hatHint: dto.hatHint,
        facePartId: dto.facePartId,
        hairPartId: dto.hairPartId,
        torsoPartId: dto.torsoPartId,
        legsPartId: dto.legsPartId,
        hatPartId: dto.hatPartId,
        accessories: dto.accessoryPartIds?.length
          ? {
              create: dto.accessoryPartIds.map((partId, sortOrder) => ({
                partId,
                sortOrder,
              })),
            }
          : undefined,
        sortOrder: dto.sortOrder ?? 0,
        status: dto.status,
      },
      include: this.presetCompositionInclude(),
    });
  }

  async updateCharacterPreset(id: string, dto: UpdateCharacterPresetDto) {
    const existing = await this.prisma.characterPreset.findUnique({
      where: { id },
      select: {
        id: true,
        facePartId: true,
        hairPartId: true,
        torsoPartId: true,
        legsPartId: true,
        hatPartId: true,
        accessories: { select: { partId: true } },
      },
    });
    if (!existing) throw new NotFoundException('Character preset not found');

    await this.validateComposition({
      ...dto,
      facePartId: dto.facePartId ?? existing.facePartId,
      hairPartId: dto.hairPartId ?? existing.hairPartId,
      torsoPartId: dto.torsoPartId ?? existing.torsoPartId,
      legsPartId: dto.legsPartId ?? existing.legsPartId,
      hatPartId: dto.hatPartId ?? existing.hatPartId,
      accessoryPartIds:
        dto.accessoryPartIds ??
        existing.accessories.map((accessory) => accessory.partId),
    });

    const data: Prisma.CharacterPresetUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.previewImageUrl !== undefined)
      data.previewImageUrl = dto.previewImageUrl;
    if (dto.isBuilderPreset !== undefined)
      data.isBuilderPreset = dto.isBuilderPreset;
    if (dto.isSellable !== undefined) data.isSellable = dto.isSellable;
    if (dto.faceHint !== undefined) data.faceHint = dto.faceHint;
    if (dto.hairHint !== undefined) data.hairHint = dto.hairHint;
    if (dto.torsoHint !== undefined) data.torsoHint = dto.torsoHint;
    if (dto.legsHint !== undefined) data.legsHint = dto.legsHint;
    if (dto.hatHint !== undefined) data.hatHint = dto.hatHint;
    if (dto.facePartId !== undefined)
      data.facePart = dto.facePartId
        ? { connect: { id: dto.facePartId } }
        : { disconnect: true };
    if (dto.hairPartId !== undefined)
      data.hairPart = dto.hairPartId
        ? { connect: { id: dto.hairPartId } }
        : { disconnect: true };
    if (dto.torsoPartId !== undefined)
      data.torsoPart = dto.torsoPartId
        ? { connect: { id: dto.torsoPartId } }
        : { disconnect: true };
    if (dto.legsPartId !== undefined)
      data.legsPart = dto.legsPartId
        ? { connect: { id: dto.legsPartId } }
        : { disconnect: true };
    if (dto.hatPartId !== undefined)
      data.hatPart = dto.hatPartId
        ? { connect: { id: dto.hatPartId } }
        : { disconnect: true };
    if (dto.accessoryPartIds !== undefined) {
      data.accessories = {
        deleteMany: {},
        create: dto.accessoryPartIds.map((partId, sortOrder) => ({
          partId,
          sortOrder,
        })),
      };
    }
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.status !== undefined) data.status = dto.status;

    return this.prisma.characterPreset.update({
      where: { id },
      data,
      include: this.presetCompositionInclude(),
    });
  }

  async deleteCharacterPreset(id: string) {
    const existing = await this.prisma.characterPreset.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
    if (!existing) throw new NotFoundException('Character preset not found');
    if (existing._count.products > 0) {
      throw new ConflictException(
        `Character preset is used by ${existing._count.products} product(s). Disable it instead of deleting it.`,
      );
    }

    await this.prisma.characterPreset.delete({ where: { id } });
    return { success: true, message: 'Character preset deleted successfully' };
  }

  private presetCompositionInclude() {
    return {
      facePart: true,
      hairPart: true,
      torsoPart: true,
      legsPart: true,
      hatPart: true,
      accessories: {
        include: { part: true },
        orderBy: { sortOrder: 'asc' as const },
      },
    } satisfies Prisma.CharacterPresetInclude;
  }

  private async validateComposition(
    dto: Pick<
      CreateCharacterPresetDto,
      | 'facePartId'
      | 'hairPartId'
      | 'torsoPartId'
      | 'legsPartId'
      | 'hatPartId'
      | 'accessoryPartIds'
    >,
  ) {
    const expected = new Map<string, CharacterPartType>([
      ...(dto.facePartId
        ? ([[dto.facePartId, CharacterPartType.FACE]] as const)
        : []),
      ...(dto.hairPartId
        ? ([[dto.hairPartId, CharacterPartType.HAIR]] as const)
        : []),
      ...(dto.torsoPartId
        ? ([[dto.torsoPartId, CharacterPartType.TORSO]] as const)
        : []),
      ...(dto.legsPartId
        ? ([[dto.legsPartId, CharacterPartType.LEGS]] as const)
        : []),
      ...(dto.hatPartId
        ? ([[dto.hatPartId, CharacterPartType.HAT]] as const)
        : []),
      ...(dto.accessoryPartIds ?? []).map(
        (id) => [id, CharacterPartType.ACCESSORY] as const,
      ),
    ]);
    if (expected.size === 0) return;

    const parts = await this.prisma.characterPart.findMany({
      where: {
        id: { in: [...expected.keys()] },
        status: ProductStatus.active,
        isActive: true,
      },
      select: { id: true, type: true },
    });
    if (parts.length !== expected.size) {
      throw new BadRequestException(
        'Every preset component must exist and be active',
      );
    }
    for (const part of parts) {
      if (expected.get(part.id) !== part.type) {
        throw new BadRequestException(
          `Character part ${part.id} does not match its preset slot`,
        );
      }
    }
  }
}
