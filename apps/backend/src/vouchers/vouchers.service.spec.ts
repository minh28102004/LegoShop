import { ProductStatus, VoucherDiscountType } from '@prisma/client';
import { VouchersService } from './vouchers.service';

describe('VouchersService', () => {
  const prisma = {
    voucher: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const service = new VouchersService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates a partial date update against the stored counterpart', async () => {
    prisma.voucher.findUnique.mockResolvedValue({
      id: 'voucher-1',
      discountType: VoucherDiscountType.fixed,
      discountValue: 10_000,
      startsAt: new Date('2026-08-10T00:00:00.000Z'),
      expiresAt: new Date('2026-08-20T00:00:00.000Z'),
    });

    await expect(
      service.updateVoucher('voucher-1', {
        expiresAt: '2026-08-01T00:00:00.000Z',
      }),
    ).rejects.toThrow('Voucher expiry must be after start date');
    expect(prisma.voucher.update).not.toHaveBeenCalled();
  });

  it('increments a limited voucher atomically', async () => {
    const tx = {
      voucher: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ usageLimit: 10, usedCount: 9 }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    await service.markVoucherUsed(tx as never, 'voucher-1');

    expect(tx.voucher.updateMany).toHaveBeenCalledWith({
      where: { id: 'voucher-1', usedCount: { lt: 10 } },
      data: { usedCount: { increment: 1 } },
    });
  });

  it('derives scheduled status instead of trusting the manual flag alone', async () => {
    prisma.voucher.findUnique.mockResolvedValue({
      id: 'voucher-1',
      code: 'NEXT',
      description: null,
      discountType: VoucherDiscountType.fixed,
      discountValue: 10_000,
      minOrderAmount: 0,
      maxDiscountAmount: null,
      usageLimit: null,
      usedCount: 0,
      startsAt: new Date(Date.now() + 86_400_000),
      expiresAt: null,
      status: ProductStatus.active,
    });

    await expect(
      service.findAdminVoucherById('voucher-1'),
    ).resolves.toMatchObject({
      effectiveStatus: 'scheduled',
    });
  });
});
