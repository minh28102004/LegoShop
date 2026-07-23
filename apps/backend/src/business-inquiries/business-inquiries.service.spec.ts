import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessInquiriesService } from './business-inquiries.service';

describe('BusinessInquiriesService', () => {
  let service: BusinessInquiriesService;
  const prisma = {
    frameSize: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessInquiriesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<BusinessInquiriesService>(BusinessInquiriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('calculates a business quote from the active frame price', async () => {
    prisma.frameSize.findFirst.mockResolvedValue({
      id: 'frame-20x20',
      label: '20x20 cm',
      price: 150_000,
    });

    const quote = await service.quoteBusinessGift({
      frameId: 'frame-20x20',
      characterCount: 2,
      charmCount: 3,
      quantity: 50,
      brandDesign: true,
      logoPlacement: true,
      premiumPackaging: true,
      documents: true,
    });

    expect(quote).toMatchObject({
      frameLabel: '20x20 cm',
      framePrice: 150_000,
      discountPercent: 10,
      retailUnitPrice: 205_000,
      estimatedUnitPrice: 185_000,
      totalPrice: 9_250_000,
      savings: 1_000_000,
    });
    expect(quote.quotedAt).toEqual(expect.any(String));
  });
});
