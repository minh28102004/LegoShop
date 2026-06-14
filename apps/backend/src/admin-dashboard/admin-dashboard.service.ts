import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
	constructor(private readonly prisma: PrismaService) {}

	async getStats() {
		const [
			totalOrders,
			pendingOrders,
			processingOrders,
			paidOrders,
			allOrders,
			recentOrders,
			orderItems,
		] = await this.prisma.$transaction([
			this.prisma.order.count(),
			this.prisma.order.count({
				where: { orderStatus: 'pending' },
			}),
			this.prisma.order.count({
				where: {
					orderStatus: {
						in: ['confirmed', 'processing', 'shipping'],
					},
				},
			}),
			this.prisma.order.count({
				where: { paymentStatus: 'paid' },
			}),
			this.prisma.order.findMany({
				select: {
					totalAmount: true,
					phone: true,
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
			this.prisma.orderItem.findMany({
				select: {
					productName: true,
					quantity: true,
					price: true,
				},
			}),
		]);

		const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
		const totalCustomers = new Set(allOrders.map((order) => order.phone)).size;

		const productSummary = new Map<
			string,
			{
				productName: string;
				quantity: number;
				revenue: number;
			}
		>();

		for (const item of orderItems) {
			const key = item.productName;
			const existing = productSummary.get(key) ?? {
				productName: item.productName,
				quantity: 0,
				revenue: 0,
			};

			existing.quantity += item.quantity;
			existing.revenue += item.price * item.quantity;
			productSummary.set(key, existing);
		}

		const topProducts = Array.from(productSummary.values())
			.sort((a, b) => b.quantity - a.quantity)
			.slice(0, 5);

		return {
			totalOrders,
			totalRevenue,
			totalCustomers,
			pendingOrders,
			paidOrders,
			processingOrders,
			recentOrders,
			topProducts,
		};
	}
}
