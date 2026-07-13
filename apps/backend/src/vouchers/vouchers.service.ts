import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProductStatus, VoucherDiscountType } from '@prisma/client';
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
import { ApplyVoucherDto } from './dto/apply-voucher.dto';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';

const VOUCHER_SORT_FIELDS = [
  'code',
  'discountType',
  'discountValue',
  'minOrderAmount',
  'maxDiscountAmount',
  'usageLimit',
  'usedCount',
  'status',
  'startsAt',
  'expiresAt',
  'createdAt',
  'updatedAt',
] as const;

type VoucherRecord = {
  id: string;
  code: string;
  description: string | null;
  discountType: VoucherDiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startsAt: Date | null;
  expiresAt: Date | null;
  status: ProductStatus;
};

@Injectable()
export class VouchersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAdminVouchers(query?: AdminListQueryDto) {
    if (hasAdminListQuery(query)) {
      const pagination = getAdminPagination(query);
      const { sortBy, sortDir, sortCriteria } = resolveSorts(
        query?.sort_by,
        query?.sort_dir,
        VOUCHER_SORT_FIELDS,
        'createdAt',
      );
      const orderBy = sortCriteria.map(({ field, direction }) => ({
        [field]: direction,
      })) as Prisma.VoucherOrderByWithRelationInput[];
      const dateRange = resolveDateRange(
        query,
        ['createdAt', 'updatedAt', 'startsAt', 'expiresAt'],
        'createdAt',
      );
      const where: Prisma.VoucherWhereInput = {
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
        where.minOrderAmount = {
          ...(query.price_min !== undefined ? { gte: query.price_min } : {}),
          ...(query.price_max !== undefined ? { lte: query.price_max } : {}),
        };
      }

      if (query?.search) {
        const searchFields = getAllowedSearchFields(
          query.search_fields,
          ['code', 'description'],
          ['code', 'description'],
        );
        where.OR = searchFields.map((field) => ({
          [field]: { contains: query.search, mode: 'insensitive' },
        }));
      }

      const [data, total] = await this.prisma.$transaction([
        this.prisma.voucher.findMany({
          where,
          orderBy,
          skip: pagination.skip,
          take: pagination.take,
        }),
        this.prisma.voucher.count({ where }),
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

    return this.prisma.voucher.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findAdminVoucherById(id: string) {
    const voucher = await this.prisma.voucher.findUnique({ where: { id } });

    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }

    return voucher;
  }

  async createVoucher(dto: CreateVoucherDto) {
    this.assertDiscountValue(dto.discountType, dto.discountValue);
    this.assertDateRange(dto.startsAt, dto.expiresAt);

    const code = this.normalizeCode(dto.code);
    const duplicate = await this.prisma.voucher.findUnique({
      where: { code },
      select: { id: true },
    });

    if (duplicate) {
      throw new ConflictException('Voucher code already exists');
    }

    return this.prisma.voucher.create({
      data: {
        code,
        description: dto.description,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minOrderAmount: dto.minOrderAmount ?? 0,
        maxDiscountAmount: dto.maxDiscountAmount ?? null,
        usageLimit: dto.usageLimit ?? null,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        status: dto.status,
      },
    });
  }

  async updateVoucher(id: string, dto: UpdateVoucherDto) {
    const existingVoucher = await this.prisma.voucher.findUnique({
      where: { id },
      select: { id: true, discountType: true, discountValue: true },
    });

    if (!existingVoucher) {
      throw new NotFoundException('Voucher not found');
    }

    const discountType = dto.discountType ?? existingVoucher.discountType;
    const discountValue = dto.discountValue ?? existingVoucher.discountValue;
    this.assertDiscountValue(discountType, discountValue);
    this.assertDateRange(dto.startsAt, dto.expiresAt);

    const data: Prisma.VoucherUpdateInput = {};

    if (dto.description !== undefined) data.description = dto.description;
    if (dto.discountType !== undefined) data.discountType = dto.discountType;
    if (dto.discountValue !== undefined) data.discountValue = dto.discountValue;
    if (dto.minOrderAmount !== undefined) data.minOrderAmount = dto.minOrderAmount;
    if (dto.maxDiscountAmount !== undefined) data.maxDiscountAmount = dto.maxDiscountAmount;
    if (dto.usageLimit !== undefined) data.usageLimit = dto.usageLimit;
    if (dto.startsAt !== undefined) {
      data.startsAt = dto.startsAt ? new Date(dto.startsAt) : null;
    }
    if (dto.expiresAt !== undefined) {
      data.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    }
    if (dto.status !== undefined) data.status = dto.status;

    if (dto.code !== undefined) {
      const code = this.normalizeCode(dto.code);
      const duplicate = await this.prisma.voucher.findUnique({
        where: { code },
        select: { id: true },
      });

      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('Voucher code already exists');
      }

      data.code = code;
    }

    return this.prisma.voucher.update({
      where: { id },
      data,
    });
  }

  async deleteVoucher(id: string) {
    const existingVoucher = await this.prisma.voucher.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingVoucher) {
      throw new NotFoundException('Voucher not found');
    }

    await this.prisma.voucher.delete({ where: { id } });

    return {
      success: true,
      message: 'Voucher deleted successfully',
    };
  }

  async applyVoucher(dto: ApplyVoucherDto) {
    return this.validateVoucherForAmount(dto.code, dto.orderAmount);
  }

  async validateVoucherForAmount(code: string, orderAmount: number) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { code: this.normalizeCode(code) },
    });

    if (!voucher) {
      throw new NotFoundException('Voucher code not found');
    }

    this.assertVoucherUsable(voucher, orderAmount);
    const discountAmount = this.calculateDiscountAmount(voucher, orderAmount);

    return {
      id: voucher.id,
      code: voucher.code,
      description: voucher.description,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      minOrderAmount: voucher.minOrderAmount,
      maxDiscountAmount: voucher.maxDiscountAmount,
      discountAmount,
      orderAmount,
      finalAmount: Math.max(0, orderAmount - discountAmount),
    };
  }

  async markVoucherUsed(
    tx: Prisma.TransactionClient,
    voucherId: string,
  ) {
    const voucher = await tx.voucher.findUnique({
      where: { id: voucherId },
      select: { usageLimit: true, usedCount: true },
    });

    if (!voucher) {
      throw new BadRequestException('Voucher code not found');
    }

    if (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit) {
      throw new BadRequestException('Voucher usage limit has been reached');
    }

    await tx.voucher.update({
      where: { id: voucherId },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });
  }

  private normalizeCode(code: string) {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      throw new BadRequestException('Voucher code is required');
    }
    return normalized;
  }

  private assertDiscountValue(
    discountType: VoucherDiscountType,
    discountValue: number,
  ) {
    if (discountValue <= 0) {
      throw new BadRequestException('Voucher discount value must be greater than 0');
    }

    if (discountType === VoucherDiscountType.percentage && discountValue > 100) {
      throw new BadRequestException('Percentage voucher cannot exceed 100');
    }
  }

  private assertDateRange(startsAt?: string | null, expiresAt?: string | null) {
    if (!startsAt || !expiresAt) return;

    if (new Date(expiresAt).getTime() < new Date(startsAt).getTime()) {
      throw new BadRequestException('Voucher expiry must be after start date');
    }
  }

  private assertVoucherUsable(voucher: VoucherRecord, orderAmount: number) {
    const now = Date.now();

    if (voucher.status !== ProductStatus.active) {
      throw new BadRequestException('Voucher is inactive');
    }

    if (voucher.startsAt && voucher.startsAt.getTime() > now) {
      throw new BadRequestException('Voucher is not active yet');
    }

    if (voucher.expiresAt && voucher.expiresAt.getTime() < now) {
      throw new BadRequestException('Voucher has expired');
    }

    if (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit) {
      throw new BadRequestException('Voucher usage limit has been reached');
    }

    if (orderAmount < voucher.minOrderAmount) {
      throw new BadRequestException(
        `Voucher requires minimum order amount ${voucher.minOrderAmount}`,
      );
    }
  }

  private calculateDiscountAmount(voucher: VoucherRecord, orderAmount: number) {
    const rawDiscount =
      voucher.discountType === VoucherDiscountType.percentage
        ? Math.round((orderAmount * voucher.discountValue) / 100)
        : voucher.discountValue;
    const cappedDiscount =
      voucher.maxDiscountAmount !== null
        ? Math.min(rawDiscount, voucher.maxDiscountAmount)
        : rawDiscount;

    return Math.max(0, Math.min(cappedDiscount, orderAmount));
  }
}
