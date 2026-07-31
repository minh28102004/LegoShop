import { Test, TestingModule } from '@nestjs/testing';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  ProductStatus,
  ShippingStatus,
} from '@prisma/client';
import { normalizeVietnamesePhone } from '@lego-shop/shared';
import { PaymentSettingsService } from '../payment-settings/payment-settings.service';
import { PaymentsService } from '../payments/payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  const findMany = jest.fn();
  const productFindMany = jest.fn<
    Promise<unknown[]>,
    [Prisma.ProductFindManyArgs]
  >();
  const frameOptionFindMany = jest.fn();
  const frameBackgroundFindMany = jest.fn();
  const accessoryFindMany = jest.fn<
    Promise<unknown[]>,
    [Prisma.AccessoryFindManyArgs]
  >();
  const characterPartFindMany = jest.fn();
  const frameSizeFindMany = jest.fn();
  const characterFindMany = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: {
            order: {
              findMany,
            },
            product: {
              findMany: productFindMany,
            },
            frameOption: {
              findMany: frameOptionFindMany,
            },
            frameBackground: {
              findMany: frameBackgroundFindMany,
            },
            accessory: {
              findMany: accessoryFindMany,
            },
            characterPart: {
              findMany: characterPartFindMany,
            },
            frameSize: {
              findMany: frameSizeFindMany,
            },
            character: {
              findMany: characterFindMany,
            },
          },
        },
        {
          provide: PaymentSettingsService,
          useValue: {},
        },
        {
          provide: PaymentsService,
          useValue: {},
        },
        {
          provide: VouchersService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('normalizes Vietnamese local and international phone formats', () => {
    expect(normalizeVietnamesePhone(' 0901 234 567 ')).toBe('0901234567');
    expect(normalizeVietnamesePhone('+84 901 234 567')).toBe('0901234567');
    expect(normalizeVietnamesePhone('12345')).toBe('');
  });

  it('returns matching orders newest first with private details hidden', async () => {
    findMany.mockResolvedValueOnce([
      {
        orderCode: 'LS202607270002',
        customerName: 'Nguyen Van A',
        phone: '0901234567',
        email: 'customer@example.com',
        address: '12 Nguyen Trai, Phuong 1, Ho Chi Minh',
        note: 'Private delivery note',
        receiveDate: null,
        paymentMethod: PaymentMethod.PAYOS,
        paymentStatus: PaymentStatus.pending,
        orderStatus: OrderStatus.pending,
        shippingStatus: ShippingStatus.pending,
        itemsAmount: 100_000,
        shippingMethod: 'nationwide',
        discountAmount: 0,
        voucherCode: null,
        totalAmount: 145_000,
        depositRequired: false,
        depositPercent: 0,
        depositAmount: 0,
        remainingAmount: 145_000,
        payosCheckoutUrl: null,
        expiresAt: null,
        createdAt: new Date('2026-07-27T12:00:00.000Z'),
        updatedAt: new Date('2026-07-27T12:00:00.000Z'),
        items: [],
        statusHistories: [],
      },
    ]);

    const response = await service.trackOrdersByPhone('+84 901 234 567');

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { phone: '0901234567' },
        orderBy: { createdAt: 'desc' },
      }),
    );
    expect(response.orders).toHaveLength(1);
    expect(response.orders[0]).toEqual(
      expect.objectContaining({
        orderCode: 'LS202607270002',
        customerName: null,
        notes: null,
        maskedPhone: '090****567',
        maskedEmail: 'cu***@example.com',
        maskedAddress: '***, Phuong 1, Ho Chi Minh',
      }),
    );
  });

  it('returns an empty order list instead of exposing lookup details', async () => {
    findMany.mockResolvedValueOnce([]);

    await expect(service.trackOrdersByPhone('0901234567')).resolves.toEqual({
      orders: [],
    });
  });

  it('quotes a staged preview product with a virtual configured character', async () => {
    const previousIncludePreview = process.env.INCLUDE_STAGED_SAMPLE_MEDIA;
    const previousSeedTag = process.env.STAGED_SAMPLE_MEDIA_SEED_TAG;
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.INCLUDE_STAGED_SAMPLE_MEDIA = 'true';
    process.env.STAGED_SAMPLE_MEDIA_SEED_TAG = 'preview-seed';
    process.env.NODE_ENV = 'test';

    productFindMany.mockImplementationOnce(
      (args: Prisma.ProductFindManyArgs) => {
        expect(args.where).toEqual({
          id: {
            in: ['product-1'],
          },
          availability: 'available',
          AND: [
            {
              OR: [
                {
                  status: ProductStatus.active,
                  published: true,
                },
                {
                  status: ProductStatus.inactive,
                  componentConfig: {
                    path: ['sampleMedia', 'seedTag'],
                    equals: 'preview-seed',
                  },
                },
              ],
            },
            {
              OR: [{ inventory: null }, { inventory: { gt: 0 } }],
            },
          ],
        });

        return Promise.resolve([
          {
            id: 'product-1',
            name: 'Kết Nối Bền Vững',
            basePrice: 229_000,
            productType: 'finished',
            characterPresetId: null,
            inventory: null,
            componentConfig: {
              sampleMedia: {
                seedTag: 'preview-seed',
              },
              frameSizeIds: ['frame-size-1', 'frame-size-2', 'frame-size-3'],
              characters: [
                {
                  id: 'catalog-default-custom-character',
                  price: 50_000,
                  quantity: 2,
                },
              ],
              accessories: [
                {
                  id: 'accessory-1',
                  maxQuantity: 1,
                },
                {
                  id: 'accessory-2',
                  maxQuantity: 1,
                },
                {
                  id: 'accessory-3',
                  maxQuantity: 1,
                },
              ],
            },
            characterPreset: null,
          },
        ]);
      },
    );
    frameOptionFindMany.mockResolvedValueOnce([]);
    frameBackgroundFindMany.mockResolvedValueOnce([]);
    accessoryFindMany.mockImplementationOnce(
      (args: Prisma.AccessoryFindManyArgs) => {
        expect(args.where).toEqual({
          id: {
            in: ['accessory-1', 'accessory-2', 'accessory-3'],
          },
          AND: [
            {
              OR: [
                {
                  status: ProductStatus.active,
                },
                {
                  status: ProductStatus.inactive,
                  seedTag: 'preview-seed',
                },
              ],
            },
          ],
        });

        return Promise.resolve([
          {
            id: 'accessory-1',
            name: 'Charm 1',
            price: 10_000,
          },
          {
            id: 'accessory-2',
            name: 'Charm 2',
            price: 10_000,
          },
          {
            id: 'accessory-3',
            name: 'Charm 3',
            price: 10_000,
          },
        ]);
      },
    );
    characterPartFindMany.mockResolvedValueOnce([]);
    frameSizeFindMany.mockResolvedValueOnce([
      {
        id: 'frame-size-1',
        price: 150_000,
      },
      {
        id: 'frame-size-2',
        price: 250_000,
      },
      {
        id: 'frame-size-3',
        price: 340_000,
      },
    ]);
    characterFindMany.mockResolvedValueOnce([]);

    try {
      const response = await service.quoteCart({
        items: [
          {
            cartItemId: 'cart-item-1',
            productId: 'product-1',
            productName: 'Kết Nối Bền Vững',
            quantity: 3,
            priceSnapshot: 549_000,
            frameOptionId: 'frame-size-3',
            frameSizeId: 'frame-size-3',
            accessories: [
              {
                id: 'accessory-1',
                name: 'Charm 1',
                price: 10_000,
                quantity: 1,
              },
              {
                id: 'accessory-2',
                name: 'Charm 2',
                price: 10_000,
                quantity: 1,
              },
              {
                id: 'accessory-3',
                name: 'Charm 3',
                price: 10_000,
                quantity: 1,
              },
            ],
            designData: {
              source: 'product-template',
              frameSizeId: 'frame-size-3',
            },
          },
        ],
      });

      expect(response).toEqual(
        expect.objectContaining({
          valid: true,
          subtotal: 1_647_000,
          total: 1_647_000,
          items: [
            expect.objectContaining({
              cartItemId: 'cart-item-1',
              valid: true,
              unitPrice: 549_000,
              lineTotal: 1_647_000,
              warnings: [],
            }),
          ],
        }),
      );
    } finally {
      if (previousIncludePreview === undefined) {
        delete process.env.INCLUDE_STAGED_SAMPLE_MEDIA;
      } else {
        process.env.INCLUDE_STAGED_SAMPLE_MEDIA = previousIncludePreview;
      }
      if (previousSeedTag === undefined) {
        delete process.env.STAGED_SAMPLE_MEDIA_SEED_TAG;
      } else {
        process.env.STAGED_SAMPLE_MEDIA_SEED_TAG = previousSeedTag;
      }
      if (previousNodeEnv === undefined) {
        delete process.env.NODE_ENV;
      } else {
        process.env.NODE_ENV = previousNodeEnv;
      }
    }
  });
});
