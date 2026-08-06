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
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  findPublicFeedback() {
    return this.prisma.feedback.findMany({
      where: { status: ProductStatus.active },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findAdminFeedback(query?: AdminListQueryDto) {
    if (!hasAdminListQuery(query)) {
      return this.prisma.feedback.findMany({
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      });
    }

    const pagination = getAdminPagination(query);
    const { sortBy, sortDir, sortCriteria } = resolveSorts(
      query?.sort_by,
      query?.sort_dir,
      [
        'customerName',
        'productType',
        'rating',
        'sortOrder',
        'status',
        'createdAt',
        'updatedAt',
      ],
      'createdAt',
    );
    const dateRange = resolveDateRange(
      query,
      ['createdAt', 'updatedAt'],
      'createdAt',
    );
    const where: Prisma.FeedbackWhereInput = {
      ...buildDateFilter(dateRange),
    };
    const statuses = getAllowedFilterValues(
      query?.status,
      Object.values(ProductStatus),
      'status',
    );
    if (statuses.length > 0) where.status = { in: statuses };

    if (query?.search) {
      const fields = getAllowedSearchFields(
        query.search_fields,
        ['customerName', 'productType', 'quote'],
        ['customerName', 'productType', 'quote'],
      );
      where.OR = fields.map((field) => ({
        [field]: { contains: query.search, mode: 'insensitive' },
      }));
    }

    const orderBy = sortCriteria.map(({ field, direction }) => ({
      [field]: direction,
    })) as Prisma.FeedbackOrderByWithRelationInput[];
    const [data, total] = await this.prisma.$transaction([
      this.prisma.feedback.findMany({
        where,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.feedback.count({ where }),
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

  async findAdminFeedbackById(id: string) {
    const feedback = await this.prisma.feedback.findUnique({ where: { id } });
    if (!feedback) throw new NotFoundException('Feedback not found');
    return feedback;
  }

  createFeedback(dto: CreateFeedbackDto) {
    return this.prisma.feedback.create({
      data: {
        customerName: dto.customerName,
        productType: dto.productType,
        quote: dto.quote,
        rating: dto.rating,
        images: dto.images,
        sortOrder: dto.sortOrder,
        status: dto.status,
      },
    });
  }

  async updateFeedback(id: string, dto: UpdateFeedbackDto) {
    await this.findAdminFeedbackById(id);
    return this.prisma.feedback.update({ where: { id }, data: dto });
  }

  async deleteFeedback(id: string) {
    await this.findAdminFeedbackById(id);
    await this.prisma.feedback.delete({ where: { id } });
    return { success: true, message: 'Feedback deleted successfully' };
  }
}
