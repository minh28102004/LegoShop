import { BadRequestException, ConflictException } from '@nestjs/common';
import { FrameOptionType } from '@prisma/client';
import { FrameBackgroundsService } from './frame-backgrounds.service';

describe('FrameBackgroundsService', () => {
  it('rejects duplicate supported-frame relations', async () => {
    const prisma = {
      frameOption: { findMany: jest.fn() },
      frameBackground: { create: jest.fn() },
    };
    const service = new FrameBackgroundsService(prisma as never);

    await expect(
      service.createBackground({
        title: 'Graduation',
        imageUrl: '/graduation.webp',
        frameOptionIds: ['frame-1', 'frame-1'],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.frameBackground.create).not.toHaveBeenCalled();
  });

  it('only accepts size frame options for background compatibility', async () => {
    const prisma = {
      frameOption: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'color-1', type: FrameOptionType.color },
        ]),
      },
      frameBackground: { create: jest.fn() },
    };
    const service = new FrameBackgroundsService(prisma as never);

    await expect(
      service.createBackground({
        title: 'Graduation',
        imageUrl: '/graduation.webp',
        frameOptionIds: ['color-1'],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('protects backgrounds referenced by a product composition', async () => {
    const prisma = {
      frameBackground: {
        findUnique: jest.fn().mockResolvedValue({ id: 'background-1' }),
        delete: jest.fn(),
      },
      orderItem: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
      },
      product: {
        findMany: jest.fn().mockResolvedValue([
          { componentConfig: { background: { id: 'background-1' } } },
        ]),
      },
      userDesign: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const service = new FrameBackgroundsService(prisma as never);

    await expect(
      service.deleteBackground('background-1'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.frameBackground.delete).not.toHaveBeenCalled();
  });
});
