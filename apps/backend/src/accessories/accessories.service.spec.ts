import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AccessoriesService } from './accessories.service';

describe('AccessoriesService', () => {
  let service: AccessoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessoriesService],
    })
      .useMocker(() => ({}))
      .compile();

    service = module.get<AccessoriesService>(AccessoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('does not hide catalog items behind the legacy status field', async () => {
    const legacyAccessory = {
      id: 'accessory-1',
      name: 'Heart',
      seedTag: 'legacy-import',
      status: 'inactive',
    };
    const prisma = {
      accessory: {
        findMany: jest.fn().mockResolvedValue([legacyAccessory]),
      },
    };
    const serviceWithPrisma = new AccessoriesService(prisma as never);

    await expect(serviceWithPrisma.findPublicAccessories()).resolves.toEqual([
      {
        id: 'accessory-1',
        name: 'Heart',
        status: 'inactive',
      },
    ]);
    expect(prisma.accessory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });

  it('rejects an unknown category instead of persisting a dangling relation', async () => {
    const prisma = {
      accessoryCategory: { findUnique: jest.fn().mockResolvedValue(null) },
      accessory: { create: jest.fn() },
    };
    const serviceWithPrisma = new AccessoriesService(prisma as never);

    await expect(
      serviceWithPrisma.createAccessory({
        name: 'Heart charm',
        price: 10_000,
        categoryId: 'missing-category',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.accessory.create).not.toHaveBeenCalled();
  });

  it('protects accessories referenced by immutable order snapshots', async () => {
    const prisma = {
      accessory: {
        findUnique: jest.fn().mockResolvedValue({ id: 'accessory-1' }),
        delete: jest.fn(),
      },
      product: { findMany: jest.fn().mockResolvedValue([]) },
      orderItem: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ accessories: [{ id: 'accessory-1' }] }]),
      },
      userDesign: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const serviceWithPrisma = new AccessoriesService(prisma as never);

    await expect(
      serviceWithPrisma.deleteAccessory('accessory-1'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.accessory.delete).not.toHaveBeenCalled();
  });
});
