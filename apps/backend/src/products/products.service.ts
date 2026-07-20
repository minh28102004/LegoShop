import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { CreateProductDto } from './dto/create-product.dto';
import { PublicProductsQueryDto } from './dto/public-products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublicProducts(query: PublicProductsQueryDto = {}) {
    const filters: Prisma.ProductWhereInput[] = [
      { status: ProductStatus.active },
    ];
    const search = query.search?.trim();
    const collectionValues = Array.from(
      new Set(
        [
          query.collection?.trim(),
          ...(query.collections ?? []),
          ...(query.collectionIds ?? []),
        ].filter((value): value is string => Boolean(value)),
      ),
    );

    if (search) {
      filters.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          {
            collection: {
              name: { contains: search, mode: 'insensitive' },
            },
          },
        ],
      });
    }

    if (collectionValues.length > 0) {
      filters.push({
        OR: [
          { collectionId: { in: collectionValues } },
          { collection: { slug: { in: collectionValues } } },
        ],
      });
    }

    if (query.statuses?.length && !query.statuses.includes('active')) {
      filters.push({ id: { in: [] } });
    }

    if (query.type) filters.push({ productType: query.type });
    if (query.featured !== undefined) filters.push({ featured: query.featured });
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filters.push({
        basePrice: {
          ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
          ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
        },
      });
    }
    if (query.isNew) {
      const createdAfter = new Date();
      createdAfter.setDate(createdAfter.getDate() - 30);
      filters.push({ createdAt: { gte: createdAfter } });
    }

    const products = await this.prisma.product.findMany({
      where: { AND: filters },
      select: this.publicProductSelect(),
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      ...(query.page === undefined && query.pageSize === undefined && query.limit
        ? { take: query.limit }
        : {}),
    });
    let items = products.map((product) => {
      const { _count, ...summary } = product;
      const componentConfig = this.asRecord(product.componentConfig);
      const accessoryCount = this.countConfiguredParts(
        componentConfig,
        'accessories',
      );

      return {
        ...summary,
        status: product.status,
        originalPrice: this.readOriginalPrice(componentConfig),
        orderCount: _count.orderItems,
        characterCount: this.countConfiguredParts(componentConfig, 'characters'),
        accessoryCount,
        charmCount: accessoryCount,
        includedItemLabels: this.readIncludedItems(componentConfig).map(
          (item) => item.name,
        ),
      };
    });

    const characterCounts = Array.from(
      new Set([
        ...(query.characterCounts ?? []),
        ...(query.characterCount !== undefined ? [query.characterCount] : []),
      ]),
    );
    if (characterCounts.length > 0) {
      items = items.filter((product) =>
        characterCounts.some((count) =>
          count === 3
            ? product.characterCount >= 3
            : product.characterCount === count,
        ),
      );
    }
    const charmCounts = Array.from(
      new Set([
        ...(query.charmCounts ?? []),
        ...(query.charmCount !== undefined ? [query.charmCount] : []),
      ]),
    );
    if (charmCounts.length > 0) {
      items = items.filter((product) =>
        charmCounts.some((count) =>
          count === 3 ? product.charmCount >= 3 : product.charmCount === count,
        ),
      );
    }
    if (query.includedGift) {
      items = items.filter((product) => product.includedItemLabels.length > 0);
    }
    if (query.frameSize) {
      const expectedFrameSize = query.frameSize.trim().toLowerCase();
      items = items.filter((product) => {
        const config = this.asRecord(product.componentConfig);
        const labels = [
          ...this.readStringArray(config?.frameSizeIds),
          ...this.readStringArray(config?.frameSizeLabels),
          this.readString(config?.frameSizeLabel),
        ].filter((value): value is string => Boolean(value));
        return labels.some((value) => value.toLowerCase() === expectedFrameSize);
      });
    }

    const sort = query.sort ?? 'featured';
    items.sort((left, right) => {
      if (sort === 'price_asc') return left.basePrice - right.basePrice;
      if (sort === 'price_desc') return right.basePrice - left.basePrice;
      if (sort === 'popular') return right.orderCount - left.orderCount;
      if (sort === 'name_asc') return left.name.localeCompare(right.name, 'vi');
      if (sort === 'newest') return right.createdAt.getTime() - left.createdAt.getTime();
      return (
        Number(right.featured) - Number(left.featured) ||
        right.createdAt.getTime() - left.createdAt.getTime()
      );
    });

    const shouldPaginate = query.page !== undefined || query.pageSize !== undefined;
    if (!shouldPaginate) return items;

    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(48, Math.max(1, query.pageSize ?? 12));
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const resolvedPage = Math.min(page, totalPages);
    const start = (resolvedPage - 1) * pageSize;

    return {
      items: items.slice(start, start + pageSize),
      meta: {
        page: resolvedPage,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: resolvedPage < totalPages,
        hasPreviousPage: resolvedPage > 1,
      },
    };
  }

  async findPublicProductBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        status: ProductStatus.active,
      },
      select: this.publicProductSelect(),
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const { _count, ...baseProduct } = product;
    const componentConfig = this.asRecord(product.componentConfig);
    const configuredCharacters = this.readConfiguredParts(
      componentConfig,
      'characters',
    );
    const configuredAccessories = this.readConfiguredParts(
      componentConfig,
      'accessories',
    );
    const configuredFrameSizeIds = this.readStringArray(
      componentConfig?.frameSizeIds,
    );
    const recommendedFrameSizeId = this.readString(
      componentConfig?.recommendedFrameSizeId,
    );

    const [frameSizes, characters, accessories, availableAccessories] =
      await Promise.all([
        this.prisma.frameSize.findMany({
          where: {
            status: ProductStatus.active,
            ...(configuredFrameSizeIds.length > 0
              ? { id: { in: configuredFrameSizeIds } }
              : {}),
          },
          orderBy: [{ popular: 'desc' }, { price: 'asc' }],
        }),
        this.prisma.character.findMany({
          where: {
            status: ProductStatus.active,
            id: { in: configuredCharacters.map((item) => item.id) },
          },
          orderBy: { sortOrder: 'asc' },
        }),
        this.prisma.accessory.findMany({
          where: {
            status: ProductStatus.active,
            id: { in: configuredAccessories.map((item) => item.id) },
          },
          orderBy: { sortOrder: 'asc' },
        }),
        this.prisma.accessory.findMany({
          where: { status: ProductStatus.active },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          take: 48,
        }),
      ]);

    const resolvedRecommendedFrameSizeId =
      frameSizes.find((size) => size.id === recommendedFrameSizeId)?.id ??
      frameSizes.find((size) => size.popular)?.id ??
      frameSizes[0]?.id ??
      null;
    const minimumFramePrice =
      frameSizes.length > 0
        ? Math.min(...frameSizes.map((size) => size.price))
        : 0;
    const resolvedCharacters = configuredCharacters.map((configured) => {
      const entity = characters.find((character) => character.id === configured.id);
      return {
        id: configured.id,
        name: entity?.name ?? configured.name,
        price: configured.price ?? entity?.price ?? 0,
        imageUrl: entity?.imageUrl ?? configured.imageUrl,
        quantity: configured.quantity,
      };
    });
    const resolvedAccessories = configuredAccessories.map((configured) => {
      const entity = accessories.find((accessory) => accessory.id === configured.id);
      return this.toTemplateAccessory(entity, configured);
    });
    const originalPrice = this.readOriginalPrice(componentConfig);

    return {
      ...baseProduct,
      status: product.status,
      originalPrice,
      orderCount: _count.orderItems,
      characterCount: resolvedCharacters.reduce(
        (total, character) => total + character.quantity,
        0,
      ),
      accessoryCount: resolvedAccessories.reduce(
        (total, accessory) => total + accessory.quantity,
        0,
      ),
      requiresNote: componentConfig?.requiresNote === true,
      frameSizes: frameSizes.map((size) => ({
        id: size.id,
        label: size.label,
        price: product.basePrice + Math.max(0, size.price - minimumFramePrice),
        priceAdjustment: Math.max(0, size.price - minimumFramePrice),
        recommended: size.id === resolvedRecommendedFrameSizeId,
      })),
      recommendedFrameSizeId: resolvedRecommendedFrameSizeId,
      characters: resolvedCharacters,
      accessories: resolvedAccessories,
      availableAccessories: availableAccessories.map((accessory) =>
        this.toTemplateAccessory(accessory),
      ),
      includedItems: this.readIncludedItems(componentConfig),
      customizableFields: this.readCustomizableFields(componentConfig),
      pricing: {
        basePrice: product.basePrice,
        originalPrice,
        minimumPrice: product.basePrice,
      },
    };
  }

  async findAdminProducts(query?: AdminListQueryDto) {
    if (hasAdminListQuery(query)) {
      const pagination = getAdminPagination(query);
      const { sortBy, sortDir, sortCriteria } = resolveSorts(
        query?.sort_by,
        query?.sort_dir,
        ['name', 'basePrice', 'status', 'featured', 'createdAt', 'updatedAt'],
        'createdAt',
      );
      const orderBy = sortCriteria.map(({ field, direction }) => ({
        [field]: direction,
      })) as Prisma.ProductOrderByWithRelationInput[];
      const dateRange = resolveDateRange(
        query,
        ['createdAt', 'updatedAt'],
        'createdAt',
      );
      const where: Prisma.ProductWhereInput = {
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
        where.basePrice = {
          ...(query.price_min !== undefined ? { gte: query.price_min } : {}),
          ...(query.price_max !== undefined ? { lte: query.price_max } : {}),
        };
      }

      if (query?.search) {
        const searchFields = getAllowedSearchFields(
          query.search_fields,
          ['name', 'slug', 'description'],
          ['name', 'slug'],
        );
        where.OR = searchFields.map((field) => ({
          [field]: { contains: query.search, mode: 'insensitive' },
        }));
      }

      const [data, total] = await this.prisma.$transaction([
        this.prisma.product.findMany({
          where,
          include: {
            collection: true,
          },
          orderBy,
          skip: pagination.skip,
          take: pagination.take,
        }),
        this.prisma.product.count({ where }),
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

    return this.prisma.product.findMany({
      include: {
        collection: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAdminProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        collection: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async createProduct(dto: CreateProductDto) {
    const slug = this.generateSlug(dto.slug ?? dto.name);

    const existingProduct = await this.prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existingProduct) {
      throw new ConflictException('Product slug already exists');
    }

    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        basePrice: dto.basePrice,
        images: dto.images,
        productType: dto.productType,
        componentConfig:
          dto.componentConfig !== undefined
            ? (dto.componentConfig as Prisma.InputJsonValue)
            : undefined,
        collectionId: dto.collectionId,
        status: dto.status,
        featured: dto.featured,
      },
      include: {
        collection: true,
      },
    });
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    const data: Prisma.ProductUncheckedUpdateInput = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.basePrice !== undefined) data.basePrice = dto.basePrice;
    if (dto.images !== undefined) data.images = dto.images;
    if (dto.productType !== undefined) data.productType = dto.productType;
    if (dto.componentConfig !== undefined) {
      data.componentConfig = dto.componentConfig;
    }
    if (dto.collectionId !== undefined)
      data.collectionId = dto.collectionId || null;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.featured !== undefined) data.featured = dto.featured;

    if (dto.slug !== undefined) {
      const normalizedSlug = this.generateSlug(dto.slug);
      const duplicateSlugProduct = await this.prisma.product.findUnique({
        where: { slug: normalizedSlug },
        select: { id: true },
      });

      if (duplicateSlugProduct && duplicateSlugProduct.id !== id) {
        throw new ConflictException('Product slug already exists');
      }

      data.slug = normalizedSlug;
    }

    return this.prisma.product.update({
      where: { id },
      data,
      include: {
        collection: true,
      },
    });
  }

  async deleteProduct(id: string) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }

  private generateSlug(value: string): string {
    const slug = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\u0111/g, 'd')
      .replace(/\u0110/g, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug) {
      throw new BadRequestException('Slug is invalid');
    }

    return slug;
  }

  private publicProductSelect() {
    return {
      id: true,
      name: true,
      slug: true,
      description: true,
      basePrice: true,
      images: true,
      productType: true,
      componentConfig: true,
      status: true,
      featured: true,
      collectionId: true,
      createdAt: true,
      updatedAt: true,
      collection: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          imageUrl: true,
          sortOrder: true,
          naturalWidth: true,
          naturalHeight: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      _count: {
        select: {
          orderItems: true,
        },
      },
    } satisfies Prisma.ProductSelect;
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
  }

  private readString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }

  private readNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0
      ? Math.round(value)
      : null;
  }

  private readStringArray(value: unknown): string[] {
    return Array.isArray(value)
      ? value.flatMap((item) => {
          const resolved = this.readString(item);
          return resolved ? [resolved] : [];
        })
      : [];
  }

  private readOriginalPrice(config: Record<string, unknown> | null): number | null {
    return this.readNumber(config?.originalPrice ?? config?.originalPriceVnd);
  }

  private readConfiguredParts(
    config: Record<string, unknown> | null,
    key: 'characters' | 'accessories',
  ) {
    const value = config?.[key];
    if (!Array.isArray(value)) return [];

    return value.flatMap((item) => {
      const record = this.asRecord(item);
      const id = this.readString(record?.id);
      const name = this.readString(record?.name);
      if (!id || !name) return [];

      return [
        {
          id,
          name,
          price: this.readNumber(record?.price),
          originalPrice: this.readNumber(
            record?.originalPrice ?? record?.originalPriceVnd,
          ),
          imageUrl: this.readString(record?.imageUrl),
          iconUrl: this.readString(record?.iconUrl),
          quantity: Math.max(1, this.readNumber(record?.quantity) ?? 1),
          maxQuantity: Math.max(1, this.readNumber(record?.maxQuantity) ?? 10),
          colorVariants: this.readColorVariants(record?.colorVariants),
        },
      ];
    });
  }

  private countConfiguredParts(
    config: Record<string, unknown> | null,
    key: 'characters' | 'accessories',
  ) {
    return this.readConfiguredParts(config, key).reduce(
      (total, item) => total + item.quantity,
      0,
    );
  }

  private readColorVariants(value: unknown) {
    if (!Array.isArray(value)) return [];
    return value.flatMap((item) => {
      const record = this.asRecord(item);
      const name = this.readString(record?.name);
      const colorHex = this.readString(record?.colorHex);
      return name && colorHex ? [{ name, colorHex }] : [];
    });
  }

  private toTemplateAccessory(
    entity:
      | {
          id: string;
          name: string;
          price: number;
          imageUrl: string | null;
          iconUrl: string | null;
          metadata: Prisma.JsonValue | null;
        }
      | null
      | undefined,
    configured?: ReturnType<ProductsService['readConfiguredParts']>[number],
  ) {
    const metadata = this.asRecord(entity?.metadata);
    return {
      id: entity?.id ?? configured?.id ?? '',
      name: entity?.name ?? configured?.name ?? '',
      price: configured?.price ?? entity?.price ?? 0,
      originalPrice:
        configured?.originalPrice ??
        this.readNumber(metadata?.originalPrice ?? metadata?.originalPriceVnd),
      imageUrl: entity?.imageUrl ?? configured?.imageUrl ?? null,
      iconUrl: entity?.iconUrl ?? configured?.iconUrl ?? null,
      quantity: configured?.quantity ?? 0,
      maxQuantity: configured?.maxQuantity ?? 10,
      colorVariants:
        configured?.colorVariants.length
          ? configured.colorVariants
          : this.readColorVariants(metadata?.colorVariants),
    };
  }

  private readIncludedItems(config: Record<string, unknown> | null) {
    const value = config?.includedItems;
    if (!Array.isArray(value)) return [];

    return value.flatMap((item, index) => {
      const record = this.asRecord(item);
      const name = this.readString(record?.name);
      if (!name) return [];
      const icon = this.readString(record?.icon);

      return [
        {
          id: this.readString(record?.id) ?? `included-${index + 1}`,
          name,
          quantity: Math.max(1, this.readNumber(record?.quantity) ?? 1),
          icon:
            icon === 'package' || icon === 'sparkles' ? icon : ('gift' as const),
        },
      ];
    });
  }

  private readCustomizableFields(config: Record<string, unknown> | null) {
    const value = config?.customizableFields;
    if (!Array.isArray(value)) return [];

    return value.flatMap((item) => {
      const record = this.asRecord(item);
      const key = this.readString(record?.key);
      const label = this.readString(record?.label);
      if (!key || !label) return [];
      return [{ key, label, required: record?.required === true }];
    });
  }
}
