import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
import { UpdateBusinessInquiryStatusDto } from './dto/update-business-inquiry-status.dto';

@Injectable()
export class AdminBusinessInquiriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAdminBusinessInquiries(query?: AdminListQueryDto) {
    if (hasAdminListQuery(query)) {
      const pagination = getAdminPagination(query);
      const { sortBy, sortDir, sortCriteria } = resolveSorts(
        query?.sort_by,
        query?.sort_dir,
        [
          'companyName',
          'contactName',
          'email',
          'phone',
          'status',
          'createdAt',
          'updatedAt',
        ],
        'createdAt',
      );
      const orderBy = sortCriteria.map(({ field, direction }) => ({
        [field]: direction,
      })) as Prisma.BusinessInquiryOrderByWithRelationInput[];
      const dateRange = resolveDateRange(
        query,
        ['createdAt', 'updatedAt'],
        'createdAt',
      );
      const where: Prisma.BusinessInquiryWhereInput = {
        ...buildDateFilter(dateRange),
      };

      const statuses = getAllowedFilterValues(
        query?.status,
        ['new', 'contacted', 'processing', 'done', 'cancelled'],
        'status',
      );
      if (statuses.length > 0) {
        where.status = { in: statuses };
      }

      if (query?.search) {
        const searchFields = getAllowedSearchFields(
          query.search_fields,
          ['companyName', 'contactName', 'email', 'phone', 'message'],
          ['companyName', 'contactName', 'email', 'phone'],
        );
        where.OR = searchFields.map((field) => ({
          [field]: { contains: query.search, mode: 'insensitive' },
        }));
      }

      const [data, total] = await this.prisma.$transaction([
        this.prisma.businessInquiry.findMany({
          where,
          orderBy,
          skip: pagination.skip,
          take: pagination.take,
        }),
        this.prisma.businessInquiry.count({ where }),
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

    return this.prisma.businessInquiry.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAdminBusinessInquiryById(id: string) {
    const inquiry = await this.prisma.businessInquiry.findUnique({
      where: { id },
    });

    if (!inquiry) {
      throw new NotFoundException('Business inquiry not found');
    }

    return inquiry;
  }

  async updateStatus(id: string, dto: UpdateBusinessInquiryStatusDto) {
    const existingInquiry = await this.prisma.businessInquiry.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingInquiry) {
      throw new NotFoundException('Business inquiry not found');
    }

    return this.prisma.businessInquiry.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });
  }
}
