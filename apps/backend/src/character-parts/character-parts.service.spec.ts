import { BadRequestException, ConflictException } from '@nestjs/common';
import { CharacterPartType } from '@prisma/client';
import { CharacterPartsService } from './character-parts.service';

describe('CharacterPartsService', () => {
  it('rejects a compare-at price that is not above the selling price', () => {
    const prisma = { characterPart: { create: jest.fn() } };
    const service = new CharacterPartsService(prisma as never);

    expect(() =>
      service.createCharacterPart({
        name: 'Short hair',
        type: CharacterPartType.HAIR,
        imageUrl: '/hair.webp',
        priceAdjustment: 6_000,
        compareAtPrice: 6_000,
      }),
    ).toThrow(BadRequestException);
    expect(prisma.characterPart.create).not.toHaveBeenCalled();
  });

  it('protects a preset from a referenced part becoming unavailable', async () => {
    const prisma = {
      characterPart: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'hair-1',
          type: CharacterPartType.HAIR,
          priceAdjustment: 6_000,
          compareAtPrice: null,
        }),
        update: jest.fn(),
      },
      characterPreset: { count: jest.fn().mockResolvedValue(1) },
    };
    const service = new CharacterPartsService(prisma as never);

    await expect(
      service.updateCharacterPart('hair-1', { availability: 'unavailable' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.characterPart.update).not.toHaveBeenCalled();
  });
});
