import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FrameOptionType, Prisma, ProductStatus } from '@prisma/client';
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
import { CreateFrameOptionDto } from './dto/create-frame-option.dto';
import { FrameOptionsQueryDto } from './dto/frame-options-query.dto';
import { UpdateFrameOptionDto } from './dto/update-frame-option.dto';

const FRAME_OPTION_SORT_FIELDS = [
  'type',
  'name',
  'price',
  'stock',
  'sortOrder',
  'status',
  'createdAt',
  'updatedAt',
] as const;

type FrameOptionResponse = {
  type: FrameOptionType;
  name: string;
  label: string | null;
  widthCm: number | null;
  heightCm: number | null;
};

type FrameColorVariant = {
  name?: string;
  hex?: string;
};

@Injectable()
export class FrameOptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublicOptions(type?: FrameOptionType) {
    if (type && !Object.values(FrameOptionType).includes(type)) {
      throw new BadRequestException('Invalid frame option type');
    }

    const options = await this.prisma.frameOption.findMany({
      where: {
        status: ProductStatus.active,
        ...(type ? { type } : {}),
      },
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return options.map((option) => this.serializeFrameOption(option));
  }

  async findAdminOptions(query?: FrameOptionsQueryDto) {
    if (hasAdminListQuery(query)) {
      const pagination = getAdminPagination(query);
      const { sortBy, sortDir, sortCriteria } = resolveSorts(
        query?.sort_by,
        query?.sort_dir,
        FRAME_OPTION_SORT_FIELDS,
        'sortOrder',
      );
      const orderBy = sortCriteria.map(({ field, direction }) => ({
        [field]: direction,
      })) as Prisma.FrameOptionOrderByWithRelationInput[];
      const dateRange = resolveDateRange(
        query,
        ['createdAt', 'updatedAt'],
        'createdAt',
      );
      const where: Prisma.FrameOptionWhereInput = {
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
        Object.values(FrameOptionType),
        'type',
      );
      where.type =
        types.length > 0 ? { in: types } : FrameOptionType.size;

      if (query?.price_min !== undefined || query?.price_max !== undefined) {
        where.price = {
          ...(query.price_min !== undefined ? { gte: query.price_min } : {}),
          ...(query.price_max !== undefined ? { lte: query.price_max } : {}),
        };
      }

      if (query?.search) {
        const searchFields = getAllowedSearchFields(
          query.search_fields,
          ['name', 'label', 'slug', 'description'],
          ['name', 'label', 'slug'],
        );
        where.OR = searchFields.map((field) => ({
          [field]: { contains: query.search, mode: 'insensitive' },
        }));
      }

      const [data, total] = await this.prisma.$transaction([
        this.prisma.frameOption.findMany({
          where,
          orderBy,
          skip: pagination.skip,
          take: pagination.take,
        }),
        this.prisma.frameOption.count({ where }),
      ]);

      return {
        data: data.map((option) => this.serializeFrameOption(option)),
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
    }

    const options = await this.prisma.frameOption.findMany({
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return options.map((option) => this.serializeFrameOption(option));
  }

  async findAdminOptionById(id: string) {
    const frameOption = await this.prisma.frameOption.findUnique({
      where: { id },
    });

    if (!frameOption) {
      throw new NotFoundException('Frame option not found');
    }

    return this.serializeFrameOption(frameOption);
  }

  async createOption(dto: CreateFrameOptionDto) {
    this.assertQuantityRange(dto.minQuantity, dto.maxQuantity);

    const type = dto.type ?? FrameOptionType.size;
    const generatedLabel = this.buildFrameOptionLabel(dto);
    const name = dto.name ?? generatedLabel;
    const label = dto.label ?? generatedLabel;
    const variants = this.parseFrameColorVariants(dto.colorVariantsText);
    const colorVariants = variants.length > 0
      ? variants
      : [{ hex: dto.colorHex }];
    const createdOptions = await this.prisma.$transaction(async (tx) => {
      const options: Awaited<ReturnType<typeof tx.frameOption.create>>[] = [];

      for (const [index, variant] of colorVariants.entries()) {
        const variantSlugSuffix = variant.name ?? variant.hex ?? '';
        const slugSource =
          index === 0 && dto.slug
            ? dto.slug
            : `${type}-${name}-${variantSlugSuffix}`;
        const slug = slugSource ? this.normalizeSlug(slugSource) : undefined;
        if (slug) {
          await this.assertSlugAvailable(slug);
        }

        options.push(
          await tx.frameOption.create({
            data: {
              type,
              name,
              label,
              slug,
              description: dto.description,
              colorHex: variant.hex ?? dto.colorHex,
              imageUrl: dto.imageUrl,
              widthCm: dto.widthCm,
              heightCm: dto.heightCm,
              price: dto.price,
              stock: dto.stock,
              minQuantity: dto.minQuantity,
              maxQuantity: dto.maxQuantity,
              sortOrder: (dto.sortOrder ?? 0) + index,
              popular: dto.popular,
              metadata: this.buildFrameOptionMetadata(dto.metadata, variant),
              status: dto.status,
            },
          }),
        );
      }

      return options;
    });

    return this.serializeFrameOption(createdOptions[0]);
  }

  async updateOption(id: string, dto: UpdateFrameOptionDto) {
    const existingOption = await this.prisma.frameOption.findUnique({
      where: { id },
      select: { id: true, minQuantity: true, maxQuantity: true },
    });

    if (!existingOption) {
      throw new NotFoundException('Frame option not found');
    }

    this.assertQuantityRange(
      dto.minQuantity ?? existingOption.minQuantity,
      dto.maxQuantity ?? existingOption.maxQuantity,
    );

    const data: Prisma.FrameOptionUpdateInput = {};

    if (dto.type !== undefined) data.type = dto.type;
    const generatedLabel = this.buildFrameOptionLabel(dto);
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.label !== undefined) data.label = dto.label;
    if (dto.name === undefined && generatedLabel !== 'Khung') data.name = generatedLabel;
    if (dto.label === undefined && generatedLabel !== 'Khung') data.label = generatedLabel;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.colorHex !== undefined) data.colorHex = dto.colorHex;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.widthCm !== undefined) data.widthCm = dto.widthCm;
    if (dto.heightCm !== undefined) data.heightCm = dto.heightCm;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.stock !== undefined) data.stock = dto.stock;
    if (dto.minQuantity !== undefined) data.minQuantity = dto.minQuantity;
    if (dto.maxQuantity !== undefined) data.maxQuantity = dto.maxQuantity;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.popular !== undefined) data.popular = dto.popular;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.metadata !== undefined) {
      data.metadata = dto.metadata as Prisma.InputJsonValue;
    }

    if (dto.slug !== undefined) {
      const slug = this.normalizeSlug(dto.slug);
      await this.assertSlugAvailable(slug, id);
      data.slug = slug;
    }

    const option = await this.prisma.frameOption.update({
      where: { id },
      data,
    });

    return this.serializeFrameOption(option);
  }

  async deleteOption(id: string) {
    const existingOption = await this.prisma.frameOption.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingOption) {
      throw new NotFoundException('Frame option not found');
    }

    await this.prisma.frameOption.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Frame option deleted successfully',
    };
  }

  private assertQuantityRange(minQuantity?: number, maxQuantity?: number) {
    if (
      minQuantity !== undefined &&
      maxQuantity !== undefined &&
      maxQuantity < minQuantity
    ) {
      throw new BadRequestException('maxQuantity must be greater than or equal to minQuantity');
    }
  }

  private async assertSlugAvailable(slug: string, currentId?: string) {
    const existingOption = await this.prisma.frameOption.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existingOption && existingOption.id !== currentId) {
      throw new ConflictException('Frame option slug already exists');
    }
  }

  private normalizeSlug(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private parseFrameColorVariants(value?: string): FrameColorVariant[] {
    if (!value) return [];

    return value
      .split(/[\n;,]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .flatMap((item) => {
        const hexMatch = item.match(/#?[0-9a-f]{3}(?:[0-9a-f]{3})?/i);
        const hex = hexMatch ? this.normalizeHex(hexMatch[0]) : undefined;
        const name = item
          .replace(hexMatch?.[0] ?? '', '')
          .replace(/[:\-()]+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (!hex && !name) return [];
        return [{ ...(name ? { name } : {}), ...(hex ? { hex } : {}) }];
      });
  }

  private normalizeHex(value: string) {
    const normalized = value.trim().startsWith('#')
      ? value.trim()
      : `#${value.trim()}`;

    if (/^#[0-9a-f]{3}$/i.test(normalized)) {
      return `#${normalized
        .slice(1)
        .split('')
        .map((char) => `${char}${char}`)
        .join('')}`.toLowerCase();
    }

    if (/^#[0-9a-f]{6}$/i.test(normalized)) {
      return normalized.toLowerCase();
    }

    return undefined;
  }

  private buildFrameOptionMetadata(
    metadata: CreateFrameOptionDto['metadata'],
    variant: FrameColorVariant,
  ): Prisma.InputJsonValue | undefined {
    const base =
      metadata && typeof metadata === 'object' && !Array.isArray(metadata)
        ? { ...metadata }
        : {};

    if (variant.name) {
      return {
        ...base,
        colorName: variant.name,
        frameColorName: variant.name,
      } as Prisma.InputJsonValue;
    }

    return Object.keys(base).length > 0
      ? (base as Prisma.InputJsonValue)
      : undefined;
  }

  private buildFrameOptionLabel(dto: {
    widthCm?: number;
    heightCm?: number;
  }) {
    return dto.widthCm !== undefined && dto.heightCm !== undefined
      ? `${this.formatDimension(dto.widthCm)}x${this.formatDimension(dto.heightCm)}`
      : 'Khung';
  }

  private formatDimension(value: number) {
    return Number.isInteger(value) ? String(value) : String(value).replace(/\.?0+$/, '');
  }

  private serializeFrameOption<T extends FrameOptionResponse>(option: T) {
    const sizeLabel = this.getFrameOptionSizeLabel(option);

    if (!sizeLabel) {
      return option;
    }

    return {
      ...option,
      name: sizeLabel,
      label: sizeLabel,
    };
  }

  private getFrameOptionSizeLabel(option: FrameOptionResponse) {
    if (
      option.type !== FrameOptionType.size ||
      option.widthCm === null ||
      option.heightCm === null
    ) {
      return undefined;
    }

    return `${this.formatDimension(option.widthCm)}x${this.formatDimension(option.heightCm)}`;
  }
}
