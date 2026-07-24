import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma, ProductStatus } from '@prisma/client';
import { PRODUCT_TYPE } from '@lego-shop/shared';
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
import {
  stagedSampleMediaPublicStatus,
  stagedSampleMediaSeedTag,
} from '../common/sample-media-preview';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { PublicProductsQueryDto } from './dto/public-products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';

type CompositionCatalogEntity = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
};

type CompositionCatalog = {
  characters: Map<string, CompositionCatalogEntity>;
  accessories: Map<string, CompositionCatalogEntity>;
  frameOptions: Map<string, CompositionCatalogEntity>;
  backgrounds: Map<string, CompositionCatalogEntity>;
};

type LegacyPublicProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  images: string[];
  productType: string;
  componentConfig: Prisma.JsonValue | null;
  status: ProductStatus;
  featured: boolean;
  collectionId: string | null;
  createdAt: Date;
  updatedAt: Date;
  collectionName: string | null;
  collectionSlug: string | null;
  collectionDescription: string | null;
  collectionImageUrl: string | null;
  collectionSortOrder: number | null;
  collectionNaturalWidth: number | null;
  collectionNaturalHeight: number | null;
  collectionStatus: ProductStatus | null;
  collectionCreatedAt: Date | null;
  collectionUpdatedAt: Date | null;
};

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findPublicProducts(query: PublicProductsQueryDto = {}) {
    const previewSeedTag = stagedSampleMediaSeedTag();
    const filters: Prisma.ProductWhereInput[] = [
      this.publicProductVisibility(previewSeedTag),
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

    if (query.category?.trim()) {
      filters.push({ category: query.category.trim() });
    }
    if (query.availability?.trim()) {
      filters.push({ availability: query.availability.trim() });
    }
    if (query.published !== undefined) {
      filters.push({ published: query.published });
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

    const productTypes = this.expandPublicProductTypes(
      new Set(
        [query.type?.trim(), ...(query.types ?? [])].filter(
          (value): value is string => Boolean(value),
        ),
      ),
    );
    if (productTypes.length > 0) {
      filters.push({ productType: { in: productTypes } });
    }
    if (query.featured !== undefined)
      filters.push({ featured: query.featured });
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

    const products = await this.findPublicProductRecords(
      query,
      filters,
      previewSeedTag,
    );
    const [catalog, orderCounts] = await Promise.all([
      this.loadCompositionCatalog(products),
      this.loadProductOrderCounts(products.map((product) => product.id)),
    ]);
    let items = products.map((product) => {
      const { characterPreset, ...publicProduct } = product;
      const componentConfig = this.asRecord(product.componentConfig);
      const configuredComposition = this.buildComposition(
        componentConfig,
        catalog,
      );
      const presetParts = characterPreset
        ? [
            characterPreset.facePart,
            characterPreset.hairPart,
            characterPreset.torsoPart,
            characterPreset.legsPart,
            characterPreset.hatPart,
          ].filter((part): part is NonNullable<typeof part> => Boolean(part))
        : [];
      const presetAccessories =
        characterPreset?.accessories.map((entry) => entry.part) ?? [];
      const composition = characterPreset
        ? {
            ...configuredComposition,
            characters: [
              {
                id: characterPreset.id,
                type: 'character' as const,
                name: characterPreset.name,
                price: product.basePrice,
                quantity: 1,
                imageUrl:
                  characterPreset.previewImageUrl ?? product.thumbnailUrl,
              },
            ],
            accessories: presetAccessories.map((part) => ({
              id: part.id,
              type: 'accessory' as const,
              name: part.name,
              price: part.priceAdjustment,
              quantity: 1,
              imageUrl: part.imageUrl,
            })),
            characterCount: 1,
            accessoryCount: presetAccessories.length,
          }
        : configuredComposition;

      return {
        ...publicProduct,
        status: stagedSampleMediaPublicStatus(
          product.status,
          this.isSelectedPreviewProduct(componentConfig, previewSeedTag),
        ),
        originalPrice:
          product.compareAtPrice ?? this.readOriginalPrice(componentConfig),
        orderCount: orderCounts.get(product.id) ?? 0,
        characterCount: composition.characterCount,
        accessoryCount: composition.accessoryCount,
        charmCount: composition.accessoryCount,
        componentCount: presetParts.length + presetAccessories.length,
        isBuilderPreset: characterPreset?.isBuilderPreset ?? false,
        includedItemLabels: composition.includedItems.map((item) => item.name),
        composition,
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
        return labels.some(
          (value) => value.toLowerCase() === expectedFrameSize,
        );
      });
    }

    const sort = query.sort ?? 'featured';
    items.sort((left, right) => {
      if (sort === 'price_asc') return left.basePrice - right.basePrice;
      if (sort === 'price_desc') return right.basePrice - left.basePrice;
      if (sort === 'popular') return right.orderCount - left.orderCount;
      if (sort === 'name_asc') return left.name.localeCompare(right.name, 'vi');
      if (sort === 'newest')
        return right.createdAt.getTime() - left.createdAt.getTime();
      return (
        Number(right.featured) - Number(left.featured) ||
        right.createdAt.getTime() - left.createdAt.getTime()
      );
    });

    const shouldPaginate =
      query.page !== undefined || query.pageSize !== undefined;
    if (!shouldPaginate) {
      return query.limit ? items.slice(0, query.limit) : items;
    }

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

  private async findPublicProductRecords(
    query: PublicProductsQueryDto,
    filters: Prisma.ProductWhereInput[],
    previewSeedTag?: string,
  ) {
    try {
      return await this.prisma.product.findMany({
        where: { AND: filters },
        select: this.publicProductSelect(),
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      });
    } catch (error) {
      if (!this.isProductSchemaCompatibilityError(error)) throw error;

      this.logger.warn(
        'Product schema is behind the generated Prisma client. Serving public products through the legacy-compatible reader.',
      );
      return this.findLegacyPublicProductRecords(query, previewSeedTag);
    }
  }

  private async findLegacyPublicProductRecords(
    query: PublicProductsQueryDto,
    previewSeedTag?: string,
  ) {
    const rows = await this.prisma.$queryRaw<
      LegacyPublicProductRow[]
    >(Prisma.sql`
      SELECT
        p."id",
        p."name",
        p."slug",
        p."description",
        p."basePrice",
        p."images",
        p."productType",
        p."componentConfig",
        p."status",
        p."featured",
        p."collectionId",
        p."createdAt",
        p."updatedAt",
        c."name" AS "collectionName",
        c."slug" AS "collectionSlug",
        c."description" AS "collectionDescription",
        c."imageUrl" AS "collectionImageUrl",
        c."sortOrder" AS "collectionSortOrder",
        c."naturalWidth" AS "collectionNaturalWidth",
        c."naturalHeight" AS "collectionNaturalHeight",
        c."status" AS "collectionStatus",
        c."createdAt" AS "collectionCreatedAt",
        c."updatedAt" AS "collectionUpdatedAt"
      FROM "Product" p
      LEFT JOIN "Collection" c ON c."id" = p."collectionId"
      ORDER BY p."featured" DESC, p."createdAt" DESC
    `);

    const search = query.search?.trim().toLocaleLowerCase('vi');
    const collectionValues = new Set(
      [
        query.collection?.trim(),
        ...(query.collections ?? []),
        ...(query.collectionIds ?? []),
      ].filter((value): value is string => Boolean(value)),
    );
    const requestedProductTypes = new Set(
      this.expandPublicProductTypes(
        new Set(
          [query.type?.trim(), ...(query.types ?? [])].filter(
            (value): value is string => Boolean(value),
          ),
        ),
      ),
    );
    const createdAfter = new Date();
    createdAfter.setDate(createdAfter.getDate() - 30);

    return rows
      .filter((row) => {
        const componentConfig = this.asRecord(row.componentConfig);
        const isPreviewProduct = this.isSelectedPreviewProduct(
          componentConfig,
          previewSeedTag,
        );
        if (
          row.status !== ProductStatus.active &&
          !(row.status === ProductStatus.inactive && isPreviewProduct)
        ) {
          return false;
        }
        if (
          query.statuses?.length &&
          !query.statuses.includes(
            stagedSampleMediaPublicStatus(row.status, isPreviewProduct),
          )
        ) {
          return false;
        }
        if (query.published === false) return false;
        if (
          query.availability?.trim() &&
          query.availability.trim() !== 'available'
        ) {
          return false;
        }
        if (
          search &&
          ![
            row.name,
            row.slug,
            row.description,
            row.collectionName,
            row.collectionSlug,
          ].some((value) => value?.toLocaleLowerCase('vi').includes(search))
        ) {
          return false;
        }
        if (
          query.category?.trim() &&
          row.collectionSlug !== query.category.trim()
        ) {
          return false;
        }
        if (
          collectionValues.size > 0 &&
          !(
            (row.collectionId && collectionValues.has(row.collectionId)) ||
            (row.collectionSlug && collectionValues.has(row.collectionSlug))
          )
        ) {
          return false;
        }
        if (
          requestedProductTypes.size > 0 &&
          !requestedProductTypes.has(row.productType)
        ) {
          return false;
        }
        if (query.featured !== undefined && row.featured !== query.featured) {
          return false;
        }
        if (query.minPrice !== undefined && row.basePrice < query.minPrice) {
          return false;
        }
        if (query.maxPrice !== undefined && row.basePrice > query.maxPrice) {
          return false;
        }
        if (query.isNew && row.createdAt < createdAfter) return false;
        return true;
      })
      .map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        shortDescription: row.description,
        basePrice: row.basePrice,
        compareAtPrice: null,
        images: row.images,
        thumbnailUrl: row.images[0] ?? null,
        productType:
          row.productType === PRODUCT_TYPE.FINISHED
            ? PRODUCT_TYPE.FRAME_TEMPLATE
            : row.productType,
        category: row.collectionSlug,
        availability: 'available',
        inventory: null,
        published: true,
        characterPresetId: null,
        characterPreset: null,
        componentConfig: row.componentConfig,
        status: row.status,
        featured: row.featured,
        collectionId: row.collectionId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        collection:
          row.collectionId &&
          row.collectionName &&
          row.collectionSlug &&
          row.collectionStatus &&
          row.collectionCreatedAt &&
          row.collectionUpdatedAt
            ? {
                id: row.collectionId,
                name: row.collectionName,
                slug: row.collectionSlug,
                description: row.collectionDescription,
                imageUrl: row.collectionImageUrl,
                sortOrder: row.collectionSortOrder ?? 0,
                naturalWidth: row.collectionNaturalWidth,
                naturalHeight: row.collectionNaturalHeight,
                status: row.collectionStatus,
                createdAt: row.collectionCreatedAt,
                updatedAt: row.collectionUpdatedAt,
              }
            : null,
      }));
  }

  private expandPublicProductTypes(values: Iterable<string>) {
    const expanded = new Set<string>();
    for (const value of values) {
      expanded.add(value);
      if (value === PRODUCT_TYPE.FRAME_TEMPLATE) {
        expanded.add(PRODUCT_TYPE.FINISHED);
      }
    }
    return [...expanded];
  }

  private isProductSchemaCompatibilityError(
    error: unknown,
  ): error is Prisma.PrismaClientKnownRequestError {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === 'P2021' || error.code === 'P2022')
    );
  }

  async findPublicProductBySlug(slug: string) {
    const previewSeedTag = stagedSampleMediaSeedTag();
    const product = await this.findPublicProductRecordBySlug(
      slug,
      previewSeedTag,
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const baseProduct = product;
    const componentConfig = this.asRecord(product.componentConfig);
    const configuredCharacters = this.readConfiguredParts(
      componentConfig,
      'characters',
    );
    const configuredAccessories = this.readConfiguredParts(
      componentConfig,
      'accessories',
    );
    const configuredFrame = this.readConfiguredSinglePart(
      componentConfig,
      'frame',
    );
    const configuredFrameColor = this.readConfiguredSinglePart(
      componentConfig,
      'frameColor',
    );
    const configuredBackground = this.readConfiguredSinglePart(
      componentConfig,
      'background',
    );
    const configuredFrameSizeIds = this.readStringArray(
      componentConfig?.frameSizeIds,
    );
    const recommendedFrameSizeId = this.readString(
      componentConfig?.recommendedFrameSizeId,
    );

    const [
      frameSizes,
      characters,
      accessories,
      availableAccessories,
      configuredFrameOptions,
      background,
      orderCounts,
    ] = await Promise.all([
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
          ...this.publicAccessoryVisibility(previewSeedTag),
          id: { in: configuredAccessories.map((item) => item.id) },
        },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.accessory.findMany({
        where: this.publicAccessoryVisibility(previewSeedTag),
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        take: 48,
      }),
      this.prisma.frameOption.findMany({
        where: {
          id: {
            in: [configuredFrame?.id, configuredFrameColor?.id].filter(
              (id): id is string => Boolean(id),
            ),
          },
        },
      }),
      configuredBackground?.id
        ? this.prisma.frameBackground.findUnique({
            where: { id: configuredBackground.id },
          })
        : Promise.resolve(null),
      this.loadProductOrderCounts([product.id]),
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
    const resolvedCharacters = configuredCharacters.flatMap((configured) => {
      const entity = characters.find(
        (character) => character.id === configured.id,
      );
      return entity
        ? [
            {
              id: entity.id,
              name: entity.name,
              price: configured.price ?? entity.price,
              imageUrl: entity.imageUrl ?? configured.imageUrl,
              quantity: configured.quantity,
            },
          ]
        : [];
    });
    const resolvedAccessories = configuredAccessories.flatMap((configured) => {
      const entity = accessories.find(
        (accessory) => accessory.id === configured.id,
      );
      return entity ? [this.toTemplateAccessory(entity, configured)] : [];
    });
    const originalPrice =
      product.compareAtPrice ?? this.readOriginalPrice(componentConfig);
    const resolvedFrame = this.resolveSingleCompositionPart(
      configuredFrame,
      configuredFrameOptions.find((item) => item.id === configuredFrame?.id),
      'frame',
    );
    const resolvedFrameColor = this.resolveSingleCompositionPart(
      configuredFrameColor,
      configuredFrameOptions.find(
        (item) => item.id === configuredFrameColor?.id,
      ),
      'frameColor',
    );
    const resolvedBackground = this.resolveSingleCompositionPart(
      configuredBackground,
      background
        ? {
            id: background.id,
            name: background.title,
            price: 0,
            imageUrl: background.imageUrl,
          }
        : undefined,
      'background',
    );
    const composition = {
      frame: resolvedFrame,
      frameColor: resolvedFrameColor,
      background: resolvedBackground,
      characters: resolvedCharacters.map((character) => ({
        ...character,
        type: 'character' as const,
      })),
      accessories: resolvedAccessories.map((accessory) => ({
        id: accessory.id,
        name: accessory.name,
        price: accessory.price,
        quantity: accessory.quantity,
        imageUrl: accessory.imageUrl,
        type: 'accessory' as const,
      })),
      includedItems: this.readIncludedItems(componentConfig),
      characterCount: resolvedCharacters.reduce(
        (total, character) => total + character.quantity,
        0,
      ),
      accessoryCount: resolvedAccessories.reduce(
        (total, accessory) => total + accessory.quantity,
        0,
      ),
    };

    return {
      ...baseProduct,
      status: stagedSampleMediaPublicStatus(
        product.status,
        this.isSelectedPreviewProduct(componentConfig, previewSeedTag),
      ),
      originalPrice,
      orderCount: orderCounts.get(product.id) ?? 0,
      characterCount: composition.characterCount,
      accessoryCount: composition.accessoryCount,
      charmCount: composition.accessoryCount,
      includedItemLabels: composition.includedItems.map((item) => item.name),
      composition,
      preset: product.characterPreset,
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

  private async findPublicProductRecordBySlug(
    slug: string,
    previewSeedTag?: string,
  ) {
    try {
      return await this.prisma.product.findFirst({
        where: {
          slug,
          ...this.publicProductVisibility(previewSeedTag),
        },
        select: this.publicProductSelect(),
      });
    } catch (error) {
      if (!this.isProductSchemaCompatibilityError(error)) throw error;
      const products = await this.findLegacyPublicProductRecords(
        {},
        previewSeedTag,
      );
      return products.find((product) => product.slug === slug) ?? null;
    }
  }

  private async loadProductOrderCounts(productIds: string[]) {
    if (productIds.length === 0) return new Map<string, number>();

    const rows = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        productId: { in: productIds },
        order: { orderStatus: { not: OrderStatus.cancelled } },
      },
      _sum: { quantity: true },
    });

    return new Map(
      rows.flatMap((row) =>
        row.productId ? [[row.productId, row._sum.quantity ?? 0] as const] : [],
      ),
    );
  }

  private async loadCompositionCatalog(
    products: Array<{ componentConfig: Prisma.JsonValue | null }>,
  ): Promise<CompositionCatalog> {
    const characterIds = new Set<string>();
    const accessoryIds = new Set<string>();
    const frameOptionIds = new Set<string>();
    const backgroundIds = new Set<string>();

    for (const product of products) {
      const config = this.asRecord(product.componentConfig);
      for (const part of this.readConfiguredParts(config, 'characters')) {
        characterIds.add(part.id);
      }
      for (const part of this.readConfiguredParts(config, 'accessories')) {
        accessoryIds.add(part.id);
      }
      const frame = this.readConfiguredSinglePart(config, 'frame');
      const frameColor = this.readConfiguredSinglePart(config, 'frameColor');
      const background = this.readConfiguredSinglePart(config, 'background');
      if (frame?.id) frameOptionIds.add(frame.id);
      if (frameColor?.id) frameOptionIds.add(frameColor.id);
      if (background?.id) backgroundIds.add(background.id);
    }

    const [characters, accessories, frameOptions, backgrounds] =
      await Promise.all([
        this.prisma.character.findMany({
          where: { id: { in: [...characterIds] } },
          select: { id: true, name: true, price: true, imageUrl: true },
        }),
        this.prisma.accessory.findMany({
          where: { id: { in: [...accessoryIds] } },
          select: { id: true, name: true, price: true, imageUrl: true },
        }),
        this.prisma.frameOption.findMany({
          where: { id: { in: [...frameOptionIds] } },
          select: { id: true, name: true, price: true, imageUrl: true },
        }),
        this.prisma.frameBackground.findMany({
          where: { id: { in: [...backgroundIds] } },
          select: { id: true, title: true, imageUrl: true },
        }),
      ]);

    return {
      characters: new Map(characters.map((item) => [item.id, item])),
      accessories: new Map(accessories.map((item) => [item.id, item])),
      frameOptions: new Map(frameOptions.map((item) => [item.id, item])),
      backgrounds: new Map(
        backgrounds.map((item) => [
          item.id,
          { id: item.id, name: item.title, price: 0, imageUrl: item.imageUrl },
        ]),
      ),
    };
  }

  private buildComposition(
    config: Record<string, unknown> | null,
    catalog: CompositionCatalog,
  ) {
    const characters = this.resolveCompositionParts(
      this.readConfiguredParts(config, 'characters'),
      catalog.characters,
      'character',
    );
    const accessories = this.resolveCompositionParts(
      this.readConfiguredParts(config, 'accessories'),
      catalog.accessories,
      'accessory',
    );

    return {
      frame: this.resolveSingleCompositionPart(
        this.readConfiguredSinglePart(config, 'frame'),
        catalog.frameOptions.get(
          this.readConfiguredSinglePart(config, 'frame')?.id ?? '',
        ),
        'frame',
      ),
      frameColor: this.resolveSingleCompositionPart(
        this.readConfiguredSinglePart(config, 'frameColor'),
        catalog.frameOptions.get(
          this.readConfiguredSinglePart(config, 'frameColor')?.id ?? '',
        ),
        'frameColor',
      ),
      background: this.resolveSingleCompositionPart(
        this.readConfiguredSinglePart(config, 'background'),
        catalog.backgrounds.get(
          this.readConfiguredSinglePart(config, 'background')?.id ?? '',
        ),
        'background',
      ),
      characters,
      accessories,
      includedItems: this.readIncludedItems(config),
      characterCount: characters.reduce(
        (total, item) => total + (item.quantity ?? 1),
        0,
      ),
      accessoryCount: accessories.reduce(
        (total, item) => total + (item.quantity ?? 1),
        0,
      ),
    };
  }

  private resolveCompositionParts(
    configuredParts: ReturnType<ProductsService['readConfiguredParts']>,
    catalog: Map<string, CompositionCatalogEntity>,
    type: 'character' | 'accessory',
  ) {
    return configuredParts.flatMap((configured) => {
      const entity = catalog.get(configured.id);
      if (!entity) return [];
      return [
        {
          id: entity.id,
          type,
          name: entity.name,
          price: configured.price ?? entity.price,
          quantity: configured.quantity,
          imageUrl: entity.imageUrl ?? configured.imageUrl,
        },
      ];
    });
  }

  private resolveSingleCompositionPart(
    configured: ReturnType<ProductsService['readConfiguredSinglePart']>,
    entity: CompositionCatalogEntity | undefined,
    type: 'frame' | 'frameColor' | 'background',
  ) {
    if (!configured || !entity) return null;
    return {
      id: entity.id,
      type,
      name: entity.name,
      price: configured.price ?? entity.price,
      quantity: configured.quantity,
      imageUrl: entity.imageUrl ?? configured.imageUrl,
    };
  }

  private publicProductVisibility(
    previewSeedTag?: string,
  ): Prisma.ProductWhereInput {
    if (!previewSeedTag)
      return { status: ProductStatus.active, published: true };

    return {
      OR: [
        { status: ProductStatus.active, published: true },
        {
          status: ProductStatus.inactive,
          componentConfig: {
            path: ['sampleMedia', 'seedTag'],
            equals: previewSeedTag,
          },
        },
      ],
    };
  }

  private publicAccessoryVisibility(
    previewSeedTag?: string,
  ): Prisma.AccessoryWhereInput {
    return previewSeedTag
      ? {
          OR: [
            { status: ProductStatus.active },
            { status: ProductStatus.inactive, seedTag: previewSeedTag },
          ],
        }
      : { status: ProductStatus.active };
  }

  private isSelectedPreviewProduct(
    componentConfig: Record<string, unknown> | null,
    previewSeedTag?: string,
  ) {
    if (!previewSeedTag) return false;
    const sampleMedia = this.asRecord(componentConfig?.sampleMedia);
    return sampleMedia?.seedTag === previewSeedTag;
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

    await this.validateComponentConfig(dto.componentConfig, dto.basePrice);
    await this.validateProductCatalogConfiguration({
      productType: dto.productType,
      basePrice: dto.basePrice,
      compareAtPrice: dto.compareAtPrice,
      characterPresetId: dto.characterPresetId,
      thumbnailUrl: dto.thumbnailUrl,
      published: dto.published,
    });

    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        shortDescription: dto.shortDescription,
        basePrice: dto.basePrice,
        compareAtPrice: dto.compareAtPrice,
        images: dto.images,
        thumbnailUrl: dto.thumbnailUrl,
        productType: dto.productType,
        category: dto.category,
        availability: dto.availability,
        inventory: dto.inventory,
        published: dto.published,
        characterPresetId: dto.characterPresetId,
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
      select: {
        id: true,
        productType: true,
        basePrice: true,
        compareAtPrice: true,
        characterPresetId: true,
        componentConfig: true,
        thumbnailUrl: true,
        published: true,
      },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    await this.validateComponentConfig(
      dto.componentConfig ?? existingProduct.componentConfig,
      dto.basePrice ?? existingProduct.basePrice,
    );
    await this.validateProductCatalogConfiguration({
      productType: dto.productType ?? existingProduct.productType,
      basePrice: dto.basePrice ?? existingProduct.basePrice,
      compareAtPrice:
        dto.compareAtPrice !== undefined
          ? dto.compareAtPrice
          : existingProduct.compareAtPrice,
      characterPresetId:
        dto.characterPresetId !== undefined
          ? dto.characterPresetId
          : existingProduct.characterPresetId,
      thumbnailUrl:
        dto.thumbnailUrl !== undefined
          ? dto.thumbnailUrl
          : existingProduct.thumbnailUrl,
      published:
        dto.published !== undefined ? dto.published : existingProduct.published,
    });

    const data: Prisma.ProductUncheckedUpdateInput = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.shortDescription !== undefined)
      data.shortDescription = dto.shortDescription;
    if (dto.basePrice !== undefined) data.basePrice = dto.basePrice;
    if (dto.compareAtPrice !== undefined)
      data.compareAtPrice = dto.compareAtPrice;
    if (dto.images !== undefined) data.images = dto.images;
    if (dto.thumbnailUrl !== undefined) data.thumbnailUrl = dto.thumbnailUrl;
    if (dto.productType !== undefined) data.productType = dto.productType;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.availability !== undefined) data.availability = dto.availability;
    if (dto.inventory !== undefined) data.inventory = dto.inventory;
    if (dto.published !== undefined) data.published = dto.published;
    if (dto.characterPresetId !== undefined)
      data.characterPresetId = dto.characterPresetId || null;
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

  private async validateProductCatalogConfiguration(input: {
    productType?: string | null;
    basePrice: number;
    compareAtPrice?: number | null;
    characterPresetId?: string | null;
    thumbnailUrl?: string | null;
    published?: boolean;
  }) {
    if (input.published && !input.thumbnailUrl?.trim()) {
      throw new BadRequestException(
        'Published products must include a thumbnail',
      );
    }
    if (
      input.compareAtPrice !== null &&
      input.compareAtPrice !== undefined &&
      input.compareAtPrice <= input.basePrice
    ) {
      throw new BadRequestException(
        'Compare-at price must be greater than the current price',
      );
    }

    if (input.productType !== PRODUCT_TYPE.LEGO_CHARACTER) return;
    if (!input.characterPresetId) {
      throw new BadRequestException(
        'LEGO character products must reference a character preset',
      );
    }

    const preset = await this.prisma.characterPreset.findFirst({
      where: {
        id: input.characterPresetId,
        status: ProductStatus.active,
        isSellable: true,
      },
      include: {
        facePart: true,
        hairPart: true,
        torsoPart: true,
        legsPart: true,
        hatPart: true,
        accessories: { include: { part: true } },
      },
    });
    if (!preset) {
      throw new BadRequestException(
        'Character preset must exist, be active, and be marked sellable',
      );
    }

    const requiredParts = [
      preset.facePart,
      preset.hairPart,
      preset.torsoPart,
      preset.legsPart,
    ];
    if (requiredParts.some((part) => !part)) {
      throw new BadRequestException(
        'Character preset must include face, hair, torso, and legs',
      );
    }

    const allParts = [
      ...requiredParts,
      preset.hatPart,
      ...preset.accessories.map((entry) => entry.part),
    ].filter((part) => part !== null);
    if (
      allParts.some(
        (part) =>
          part.status !== ProductStatus.active ||
          !part.isActive ||
          part.availability !== 'available',
      )
    ) {
      throw new BadRequestException(
        'Every character product component must be active and available',
      );
    }
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

  private async validateComponentConfig(value: unknown, basePrice: number) {
    if (value === undefined || value === null) return;
    const config = this.asRecord(value);
    if (!config) {
      throw new BadRequestException(
        'Product componentConfig must be an object',
      );
    }

    const originalPrice = this.readOriginalPrice(config);
    if (originalPrice !== null && originalPrice <= basePrice) {
      throw new BadRequestException(
        'Product originalPrice must be greater than basePrice',
      );
    }

    const readRequiredPartIds = (key: 'characters' | 'accessories') => {
      const raw = config[key];
      if (raw === undefined) return [];
      if (!Array.isArray(raw)) {
        throw new BadRequestException(`Product ${key} must be an array`);
      }

      return raw.map((item, index) => {
        const id = this.readString(this.asRecord(item)?.id);
        if (!id) {
          throw new BadRequestException(
            `Product ${key}[${index}].id is required`,
          );
        }
        return id;
      });
    };

    const characterIds = readRequiredPartIds('characters');
    const accessoryIds = readRequiredPartIds('accessories');
    const frameIds = (['frame', 'frameColor'] as const).flatMap((key) => {
      if (config[key] === undefined) return [];
      const id = this.readString(this.asRecord(config[key])?.id);
      if (!id) {
        throw new BadRequestException(`Product ${key}.id is required`);
      }
      return [id];
    });
    const backgroundId =
      config.background === undefined
        ? null
        : this.readString(this.asRecord(config.background)?.id);
    if (config.background !== undefined && !backgroundId) {
      throw new BadRequestException('Product background.id is required');
    }

    const [characterRows, accessoryRows, frameRows, backgroundRow] =
      await Promise.all([
        this.prisma.character.findMany({
          where: { id: { in: characterIds } },
          select: { id: true },
        }),
        this.prisma.accessory.findMany({
          where: { id: { in: accessoryIds } },
          select: { id: true },
        }),
        this.prisma.frameOption.findMany({
          where: { id: { in: frameIds } },
          select: { id: true },
        }),
        backgroundId
          ? this.prisma.frameBackground.findUnique({
              where: { id: backgroundId },
              select: { id: true },
            })
          : Promise.resolve(null),
      ]);

    this.assertAllReferencesExist('characters', characterIds, characterRows);
    this.assertAllReferencesExist('accessories', accessoryIds, accessoryRows);
    this.assertAllReferencesExist('frame options', frameIds, frameRows);
    if (backgroundId && !backgroundRow) {
      throw new BadRequestException(
        `Product background reference not found: ${backgroundId}`,
      );
    }
  }

  private assertAllReferencesExist(
    label: string,
    requestedIds: string[],
    rows: Array<{ id: string }>,
  ) {
    const existingIds = new Set(rows.map((row) => row.id));
    const missingIds = [...new Set(requestedIds)].filter(
      (id) => !existingIds.has(id),
    );
    if (missingIds.length > 0) {
      throw new BadRequestException(
        `Product ${label} reference(s) not found: ${missingIds.join(', ')}`,
      );
    }
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
      shortDescription: true,
      basePrice: true,
      compareAtPrice: true,
      images: true,
      thumbnailUrl: true,
      productType: true,
      category: true,
      availability: true,
      inventory: true,
      published: true,
      characterPresetId: true,
      characterPreset: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          previewImageUrl: true,
          isBuilderPreset: true,
          isSellable: true,
          facePartId: true,
          hairPartId: true,
          torsoPartId: true,
          legsPartId: true,
          hatPartId: true,
          sortOrder: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          facePart: true,
          hairPart: true,
          torsoPart: true,
          legsPart: true,
          hatPart: true,
          accessories: {
            select: {
              partId: true,
              sortOrder: true,
              quantity: true,
              part: true,
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
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
    } satisfies Prisma.ProductSelect;
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value))
      return null;
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

  private readOriginalPrice(
    config: Record<string, unknown> | null,
  ): number | null {
    return this.readNumber(config?.originalPrice ?? config?.originalPriceVnd);
  }

  private readConfiguredSinglePart(
    config: Record<string, unknown> | null,
    key: 'frame' | 'frameColor' | 'background',
  ) {
    const record = this.asRecord(config?.[key]);
    const id = this.readString(record?.id);
    if (!id) return null;

    return {
      id,
      name: this.readString(record?.name) ?? '',
      price: this.readNumber(record?.price),
      imageUrl: this.readString(record?.imageUrl),
      quantity: Math.max(1, this.readNumber(record?.quantity) ?? 1),
    };
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
      if (!id) return [];

      return [
        {
          id,
          name: this.readString(record?.name) ?? '',
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
      colorVariants: configured?.colorVariants.length
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
            icon === 'package' || icon === 'sparkles'
              ? icon
              : ('gift' as const),
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
