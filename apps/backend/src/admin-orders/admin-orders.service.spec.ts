import { OrderStatus, PaymentStatus, ShippingStatus } from '@prisma/client';
import { AdminOrdersService } from './admin-orders.service';

describe('AdminOrdersService', () => {
  const tx = {
    orderStatusHistory: { create: jest.fn() },
    order: { update: jest.fn() },
    frameOption: { updateMany: jest.fn() },
  };
  const prisma = {
    order: { findUnique: jest.fn() },
    $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
      callback(tx),
    ),
  };
  const payments = { syncPayosPaymentStatusForOrderId: jest.fn() };
  const service = new AdminOrdersService(prisma as never, payments as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prevents reopening a cancelled order so restored stock cannot drift', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      orderStatus: OrderStatus.cancelled,
      paymentStatus: PaymentStatus.cancelled,
      shippingStatus: ShippingStatus.cancelled,
      items: [],
    });

    await expect(
      service.updateOrderStatus('order-1', { status: OrderStatus.pending }),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        code: 'INVALID_ORDER_STATUS_TRANSITION',
      }),
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('cancels shipping and restores frame stock exactly once', async () => {
    const existing = {
      id: 'order-1',
      orderStatus: OrderStatus.processing,
      paymentStatus: PaymentStatus.unpaid,
      shippingStatus: ShippingStatus.preparing,
      items: [
        {
          productId: null,
          frameSizeId: 'frame-20x20',
          quantity: 2,
        },
      ],
    };
    prisma.order.findUnique.mockResolvedValue(existing);
    tx.order.update.mockResolvedValue({
      ...existing,
      orderStatus: OrderStatus.cancelled,
      shippingStatus: ShippingStatus.cancelled,
    });

    await service.updateOrderStatus(
      'order-1',
      { status: OrderStatus.cancelled },
      'admin-1',
    );

    expect(tx.frameOption.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'frame-20x20' }),
        data: { stock: { increment: 2 } },
      }),
    );
    expect(tx.orderStatusHistory.create).toHaveBeenCalledTimes(2);
    expect(tx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderStatus: OrderStatus.cancelled,
          shippingStatus: ShippingStatus.cancelled,
        }),
      }),
    );
  });
});
