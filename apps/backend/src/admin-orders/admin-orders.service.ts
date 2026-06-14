import { Injectable, NotFoundException } from '@nestjs/common';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  ShippingStatus,
} from '@prisma/client';
import {
  buildAdminListMeta,
  buildDateFilter,
  getAdminPagination,
  getAllowedFilterValues,
  getAllowedSearchFields,
  resolveDateRange,
  resolveSorts,
} from '../common/admin-query/admin-query.util';
import { PrismaService } from '../prisma/prisma.service';
import { GetAdminOrdersQueryDto } from './dto/get-admin-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { UpdateShippingStatusDto } from './dto/update-shipping-status.dto';

@Injectable()
export class AdminOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAdminOrders(query: GetAdminOrdersQueryDto) {
    const pagination = getAdminPagination(query);
    const { sortBy, sortDir, sortCriteria } = resolveSorts(
      query.sort_by,
      query.sort_dir,
      [
        'createdAt',
        'updatedAt',
        'orderCode',
        'customerName',
        'phone',
        'email',
        'totalAmount',
        'orderStatus',
        'paymentStatus',
        'shippingStatus',
        'paidAt',
        'cancelledAt',
        'receiveDate',
      ],
      'createdAt',
    );
    const orderBy = sortCriteria.map(({ field, direction }) => ({
      [field]: direction,
    })) as Prisma.OrderOrderByWithRelationInput[];
    const dateRange = resolveDateRange(
      query,
      ['createdAt', 'updatedAt', 'paidAt', 'cancelledAt', 'receiveDate'],
      'createdAt',
    );

    const where: Prisma.OrderWhereInput = {
      ...buildDateFilter(dateRange),
    };

    if (query.search) {
      const searchFields = getAllowedSearchFields(
        query.search_fields,
        ['orderCode', 'customerName', 'phone', 'email'],
        ['orderCode', 'customerName', 'phone', 'email'],
      );
      where.OR = searchFields.map((field) => ({
        [field]: { contains: query.search, mode: 'insensitive' },
      }));
    }

    const orderStatuses = getAllowedFilterValues(
      query.orderStatus ?? query.status,
      Object.values(OrderStatus),
      'status',
    );
    if (orderStatuses.length > 0) {
      where.orderStatus = { in: orderStatuses };
    }

    const paymentStatuses = getAllowedFilterValues(
      query.paymentStatus ?? query.payment_status,
      Object.values(PaymentStatus),
      'payment_status',
    );
    if (paymentStatuses.length > 0) {
      where.paymentStatus = { in: paymentStatuses };
    }

    const shippingStatuses = getAllowedFilterValues(
      query.shippingStatus ?? query.shipping_status,
      Object.values(ShippingStatus),
      'shipping_status',
    );
    if (shippingStatuses.length > 0) {
      where.shippingStatus = { in: shippingStatuses };
    }

    const paymentMethods = getAllowedFilterValues(
      query.paymentMethod ?? query.payment_method,
      Object.values(PaymentMethod),
      'payment_method',
    );
    if (paymentMethods.length > 0) {
      where.paymentMethod = { in: paymentMethods };
    }

    if (query.amount_min !== undefined || query.amount_max !== undefined) {
      where.totalAmount = {
        ...(query.amount_min !== undefined ? { gte: query.amount_min } : {}),
        ...(query.amount_max !== undefined ? { lte: query.amount_max } : {}),
      };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
        },
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.order.count({ where }),
    ]);

    const [summary] = await this.prisma.$transaction([
      this.prisma.order.aggregate({
        where,
        _sum: {
          totalAmount: true,
        },
        _avg: {
          totalAmount: true,
        },
      }),
    ]);

    return {
      data,
      meta: buildAdminListMeta({
        page: pagination.page,
        limit: pagination.limit,
        total,
        sortBy,
        sortDir,
        filtersApplied: {
          ...(query.search ? { search: query.search } : {}),
          ...(query.search_fields
            ? { search_fields: query.search_fields }
            : {}),
          ...(orderStatuses.length > 0 ? { status: orderStatuses } : {}),
          ...(paymentStatuses.length > 0
            ? { payment_status: paymentStatuses }
            : {}),
          ...(shippingStatuses.length > 0
            ? { shipping_status: shippingStatuses }
            : {}),
          ...(paymentMethods.length > 0
            ? { payment_method: paymentMethods }
            : {}),
          ...(query.amount_min !== undefined
            ? { amount_min: query.amount_min }
            : {}),
          ...(query.amount_max !== undefined
            ? { amount_max: query.amount_max }
            : {}),
          ...(query.date_from ? { date_from: query.date_from } : {}),
          ...(query.date_to ? { date_to: query.date_to } : {}),
          ...(query.preset ? { preset: query.preset } : {}),
          sort_by: sortBy,
          sort_dir: sortDir,
        },
      }),
      summary: {
        total_amount: summary._sum.totalAmount ?? 0,
        average_order_value: Math.round(summary._avg.totalAmount ?? 0),
      },
    };
  }

  async findAdminOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto) {
    await this.ensureOrderExists(id);

    return this.prisma.order.update({
      where: { id },
      data: {
        orderStatus: dto.status,
      },
      include: {
        items: true,
      },
    });
  }

  async updatePaymentStatus(id: string, dto: UpdatePaymentStatusDto) {
    await this.ensureOrderExists(id);

    return this.prisma.order.update({
      where: { id },
      data: {
        paymentStatus: dto.status,
      },
      include: {
        items: true,
      },
    });
  }

  async updateShippingStatus(id: string, dto: UpdateShippingStatusDto) {
    await this.ensureOrderExists(id);

    return this.prisma.order.update({
      where: { id },
      data: {
        shippingStatus: dto.status,
      },
      include: {
        items: true,
      },
    });
  }

  private async ensureOrderExists(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
  }
}
