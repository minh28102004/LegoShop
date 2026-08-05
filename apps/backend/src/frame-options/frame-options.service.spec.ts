import { FrameOptionType, ProductStatus } from '@prisma/client';
import { FrameOptionsService } from './frame-options.service';

describe('FrameOptionsService', () => {
  it('serves size options regardless of the legacy status field', async () => {
    const frame = {
      id: 'frame-20x20',
      type: FrameOptionType.size,
      name: '20x20',
      label: '20x20',
      description: null,
      widthCm: 20,
      heightCm: 20,
      colorHex: null,
      imageUrl: '/frame.webp',
      price: 179_000,
      stock: 5,
      minQuantity: null,
      maxQuantity: null,
      popular: false,
      metadata: null,
      sortOrder: 0,
      status: ProductStatus.inactive,
      createdAt: new Date('2026-07-31T00:00:00.000Z'),
      updatedAt: new Date('2026-07-31T00:00:00.000Z'),
    };
    const prisma = {
      frameOption: { findMany: jest.fn().mockResolvedValue([frame]) },
    };
    const service = new FrameOptionsService(prisma as never);

    await expect(
      service.findPublicOptions(FrameOptionType.size),
    ).resolves.toEqual([expect.objectContaining({ id: frame.id })]);
    expect(prisma.frameOption.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { type: FrameOptionType.size } }),
    );
  });
});
