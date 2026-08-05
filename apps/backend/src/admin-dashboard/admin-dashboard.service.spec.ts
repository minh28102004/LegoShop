import { OrderStatus, PaymentStatus } from '@prisma/client';
import { AdminDashboardService } from './admin-dashboard.service';

describe('AdminDashboardService', () => {
  const prisma = {
    order: {
      count: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((queries: Array<Promise<unknown>>) =>
      Promise.all(queries),
    ),
  };
  const service = new AdminDashboardService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses only collected full and deposit payments as revenue', async () => {
    prisma.order.count
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2);
    prisma.order.aggregate
      .mockResolvedValueOnce({ _sum: { totalAmount: 1_100_000 } })
      .mockResolvedValueOnce({ _sum: { depositAmount: 120_000 } });
    prisma.order.findMany
      .mockResolvedValueOnce([{ phone: '0900000001' }, { phone: '0900000002' }])
      .mockResolvedValueOnce([
        { orderStatus: OrderStatus.pending },
        { orderStatus: OrderStatus.pending },
        { orderStatus: OrderStatus.completed },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const stats = await service.getStats();

    expect(stats.totalRevenue).toBe(1_220_000);
    expect(stats.totalCustomers).toBe(2);
    expect(stats.orderStatusDistribution).toEqual(
      expect.arrayContaining([
        { status: OrderStatus.pending, count: 2 },
        { status: OrderStatus.completed, count: 1 },
      ]),
    );
    expect(stats.revenueTrend).toHaveLength(7);
    expect(prisma.order.aggregate).toHaveBeenNthCalledWith(1, {
      where: { paymentStatus: PaymentStatus.paid },
      _sum: { totalAmount: true },
    });
  });
});
