import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetAdminOrdersQueryDto } from './dto/get-admin-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { UpdateShippingStatusDto } from './dto/update-shipping-status.dto';

@Injectable()
export class AdminOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAdminOrders(query: GetAdminOrdersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.OrderWhereInput = {};

    if (query.search) {
      where.OR = [
        { orderCode: { contains: query.search, mode: 'insensitive' } },
        { customerName: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.orderStatus) where.orderStatus = query.orderStatus;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
    if (query.shippingStatus) where.shippingStatus = query.shippingStatus;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
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
