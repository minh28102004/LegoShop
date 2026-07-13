import { Injectable, NotFoundException } from '@nestjs/common';
import {
  OrderStatusHistoryType,
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
import { PaymentsService } from '../payments/payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { GetAdminOrdersQueryDto } from './dto/get-admin-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { UpdateShippingStatusDto } from './dto/update-shipping-status.dto';

type AdminOrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: true;
  };
}>;

type AdminOrderWithItemsAndPayments = Prisma.OrderGetPayload<{
  include: {
    items: true;
    payments: true;
    statusHistories: {
      include: {
        changedByAdmin: {
          select: {
            id: true;
            email: true;
            name: true;
          };
        };
      };
    };
  };
}>;

@Injectable()
export class AdminOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
  ) {}

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
      data: data.map((order) => this.serializeOrder(order)),
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
    await this.paymentsService.syncPayosPaymentStatusForOrderId(id);

    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
        statusHistories: {
          include: {
            changedByAdmin: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.serializeOrderDetail(order);
  }

  async updateOrderStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    changedByAdminId?: string,
  ) {
    const existing = await this.ensureOrderExists(id);

    const order = await this.prisma.$transaction(async (tx) => {
      if (
        existing.orderStatus !== OrderStatus.cancelled &&
        dto.status === OrderStatus.cancelled
      ) {
        await this.restoreFrameStock(tx, existing.items);
      }

      if (existing.orderStatus !== dto.status) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            type: OrderStatusHistoryType.ORDER_STATUS,
            fromValue: existing.orderStatus,
            toValue: dto.status,
            changedByAdminId,
          },
        });
      }

      return tx.order.update({
        where: { id },
        data: {
          orderStatus: dto.status,
          ...(dto.status === OrderStatus.cancelled
            ? {
                cancelledAt: new Date(),
                cancelReason: 'Cancelled by admin',
              }
            : {}),
        },
        include: {
          items: true,
        },
      });
    });

    return this.serializeOrder(order);
  }

  async updatePaymentStatus(
    id: string,
    dto: UpdatePaymentStatusDto,
    changedByAdminId?: string,
  ) {
    const existing = await this.ensureOrderExists(id);

    const order = await this.prisma.$transaction(async (tx) => {
      if (existing.paymentStatus !== dto.status) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            type: OrderStatusHistoryType.PAYMENT_STATUS,
            fromValue: existing.paymentStatus,
            toValue: dto.status,
            changedByAdminId,
          },
        });
      }

      const now = new Date();
      return tx.order.update({
        where: { id },
        data: {
          paymentStatus: dto.status,
          ...(dto.status === PaymentStatus.paid
            ? {
                paidAt: now,
                remainingAmount: 0,
                depositStatus: 'not_required',
              }
            : {}),
          ...(dto.status === PaymentStatus.deposit_paid
            ? {
                depositStatus: 'paid',
                depositPaidAt: now,
                remainingAmount: Math.max(
                  0,
                  existing.totalAmount - existing.depositAmount,
                ),
              }
            : {}),
        },
        include: {
          items: true,
        },
      });
    });

    return this.serializeOrder(order);
  }

  async updateShippingStatus(
    id: string,
    dto: UpdateShippingStatusDto,
    changedByAdminId?: string,
  ) {
    const existing = await this.ensureOrderExists(id);

    const order = await this.prisma.$transaction(async (tx) => {
      if (existing.shippingStatus !== dto.status) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            type: OrderStatusHistoryType.SHIPPING_STATUS,
            fromValue: existing.shippingStatus,
            toValue: dto.status,
            changedByAdminId,
          },
        });
      }

      return tx.order.update({
        where: { id },
        data: {
          shippingStatus: dto.status,
        },
        include: {
          items: true,
        },
      });
    });

    return this.serializeOrder(order);
  }

  private async ensureOrderExists(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  private async restoreFrameStock(
    tx: Prisma.TransactionClient,
    items: Array<{
      productId: string | null;
      frameSizeId: string | null;
      quantity: number;
    }>,
  ) {
    const quantities = items.reduce((map, item) => {
      if (item.productId || !item.frameSizeId) {
        return map;
      }

      map.set(
        item.frameSizeId,
        (map.get(item.frameSizeId) ?? 0) + item.quantity,
      );

      return map;
    }, new Map<string, number>());

    for (const [frameOptionId, quantity] of quantities.entries()) {
      await tx.frameOption.updateMany({
        where: {
          id: frameOptionId,
          stock: {
            not: null,
          },
        },
        data: {
          stock: {
            increment: quantity,
          },
        },
      });
    }
  }

  private serializeOrder(order: AdminOrderWithItems) {
    return {
      ...order,
      payosOrderCode: this.serializeBigInt(order.payosOrderCode),
    };
  }

  private serializeOrderDetail(order: AdminOrderWithItemsAndPayments) {
    return {
      ...this.serializeOrder(order),
      payments: order.payments.map((payment) => ({
        ...payment,
        providerOrderCode: this.serializeBigInt(payment.providerOrderCode),
      })),
    };
  }

  private serializeBigInt(value: bigint | null) {
    return typeof value === 'bigint' ? value.toString() : value;
  }
}
