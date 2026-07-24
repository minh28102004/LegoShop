import { BadRequestException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  const product = {
    id: 'product-1',
    name: 'Wedding 1',
    slug: 'wedding-1',
    description: null,
    basePrice: 340_000,
    images: ['/wedding.webp'],
    productType: 'finished',
    componentConfig: {
      originalPrice: 350_000,
      frame: { id: 'frame-1', name: '30x30', quantity: 1 },
      frameColor: { id: 'color-1', name: 'Đen', quantity: 1 },
      background: { id: 'background-1', name: 'Wedding', quantity: 1 },
      characters: [{ id: 'character-1', name: 'Couple', quantity: 2 }],
      accessories: [
        { id: 'accessory-1', name: 'Heart', quantity: 2 },
        { id: 'accessory-2', name: 'Ring', quantity: 1 },
      ],
      includedItems: [
        { id: 'gift-box', name: 'Hộp quà', quantity: 1, icon: 'gift' },
      ],
    },
    status: ProductStatus.active,
    featured: true,
    collectionId: null,
    collection: null,
    createdAt: new Date('2026-07-20T00:00:00.000Z'),
    updatedAt: new Date('2026-07-20T00:00:00.000Z'),
  };

  function createPrismaMock() {
    return {
      product: {
        findMany: jest.fn().mockResolvedValue([product]),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      },
      orderItem: {
        groupBy: jest
          .fn()
          .mockResolvedValue([
            { productId: product.id, _sum: { quantity: 34 } },
          ]),
      },
      character: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'character-1',
            name: 'Couple',
            price: 50_000,
            imageUrl: null,
          },
        ]),
      },
      accessory: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'accessory-1', name: 'Heart', price: 10_000, imageUrl: null },
          { id: 'accessory-2', name: 'Ring', price: 15_000, imageUrl: null },
        ]),
      },
      frameOption: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'frame-1', name: '30x30', price: 10_000, imageUrl: null },
          { id: 'color-1', name: 'Đen', price: 0, imageUrl: null },
        ]),
      },
      frameBackground: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'background-1',
            title: 'Wedding',
            imageUrl: '/background.webp',
          },
        ]),
      },
    };
  }

  it('returns pricing, real order quantity and composition derived from catalog relations', async () => {
    const prisma = createPrismaMock();
    const service = new ProductsService(prisma as never);

    const response = await service.findPublicProducts();

    expect(response).toHaveLength(1);
    expect(response[0]).toMatchObject({
      originalPrice: 350_000,
      orderCount: 34,
      characterCount: 2,
      accessoryCount: 3,
      charmCount: 3,
      includedItemLabels: ['Hộp quà'],
      composition: {
        characterCount: 2,
        accessoryCount: 3,
      },
    });
  });

  it('rejects an original price that is not greater than the sale price', async () => {
    const prisma = createPrismaMock();
    const service = new ProductsService(prisma as never);

    await expect(
      service.createProduct({
        name: 'Invalid sale',
        basePrice: 100_000,
        componentConfig: { originalPrice: 90_000 },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
