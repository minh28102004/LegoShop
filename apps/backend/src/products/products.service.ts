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
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findPublicProducts() {
    return this.prisma.product.findMany({
      where: {
        status: ProductStatus.active,
      },
      include: {
        collection: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findPublicProductBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        status: ProductStatus.active,
      },
      include: {
        collection: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
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
      data.componentConfig = dto.componentConfig as Prisma.InputJsonValue;
    }
    if (dto.collectionId !== undefined) data.collectionId = dto.collectionId || null;
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
}
