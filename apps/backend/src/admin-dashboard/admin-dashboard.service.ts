import { Injectable } from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const revenueStart = new Date();
    revenueStart.setUTCHours(0, 0, 0, 0);
    revenueStart.setUTCDate(revenueStart.getUTCDate() - 6);

    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      paidOrders,
      paidRevenue,
      depositRevenue,
      customerPhones,
      orderStatuses,
      recentRevenueOrders,
      recentOrders,
    ] = await this.prisma.$transaction([
      this.prisma.order.count(),
      this.prisma.order.count({
        where: { orderStatus: OrderStatus.pending },
      }),
      this.prisma.order.count({
        where: {
          orderStatus: {
            in: [
              OrderStatus.confirmed,
              OrderStatus.processing,
              OrderStatus.shipping,
            ],
          },
        },
      }),
      this.prisma.order.count({
        where: { paymentStatus: PaymentStatus.paid },
      }),
      this.prisma.order.aggregate({
        where: { paymentStatus: PaymentStatus.paid },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.aggregate({
        where: { paymentStatus: PaymentStatus.deposit_paid },
        _sum: { depositAmount: true },
      }),
      this.prisma.order.findMany({
        where: { orderStatus: { not: OrderStatus.cancelled } },
        distinct: ['phone'],
        select: { phone: true },
      }),
      this.prisma.order.findMany({
        select: { orderStatus: true },
      }),
      this.prisma.order.findMany({
        where: {
          OR: [
            {
              paymentStatus: PaymentStatus.paid,
              paidAt: { gte: revenueStart },
            },
            {
              paymentStatus: PaymentStatus.deposit_paid,
              depositPaidAt: { gte: revenueStart },
            },
          ],
        },
        select: {
          paymentStatus: true,
          totalAmount: true,
          depositAmount: true,
          paidAt: true,
          depositPaidAt: true,
        },
      }),
      this.prisma.order.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
        select: {
          id: true,
          orderCode: true,
          customerName: true,
          totalAmount: true,
          orderStatus: true,
          paymentStatus: true,
          createdAt: true,
        },
      }),
    ]);

    const revenueByDate = new Map<string, number>();
    for (let offset = 0; offset < 7; offset += 1) {
      const date = new Date(revenueStart);
      date.setUTCDate(revenueStart.getUTCDate() + offset);
      revenueByDate.set(date.toISOString().slice(0, 10), 0);
    }

    for (const order of recentRevenueOrders) {
      const occurredAt =
        order.paymentStatus === PaymentStatus.paid
          ? order.paidAt
          : order.depositPaidAt;
      if (!occurredAt) continue;

      const dateKey = occurredAt.toISOString().slice(0, 10);
      const collectedAmount =
        order.paymentStatus === PaymentStatus.paid
          ? order.totalAmount
          : order.depositAmount;
      revenueByDate.set(
        dateKey,
        (revenueByDate.get(dateKey) ?? 0) + collectedAmount,
      );
    }

    const totalRevenue =
      (paidRevenue._sum.totalAmount ?? 0) +
      (depositRevenue._sum.depositAmount ?? 0);

    return {
      totalOrders,
      totalRevenue,
      totalCustomers: customerPhones.length,
      pendingOrders,
      paidOrders,
      processingOrders,
      recentOrders,
      revenueTrend: Array.from(revenueByDate, ([date, amount]) => ({
        date,
        amount,
      })),
      orderStatusDistribution: Array.from(
        orderStatuses.reduce((counts, order) => {
          counts.set(
            order.orderStatus,
            (counts.get(order.orderStatus) ?? 0) + 1,
          );
          return counts;
        }, new Map<OrderStatus, number>()),
        ([status, count]) => ({ status, count }),
      ),
    };
  }
}
