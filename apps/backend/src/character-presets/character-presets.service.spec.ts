import { ProductStatus } from '@prisma/client';
import { CharacterPresetsService } from './character-presets.service';

describe('CharacterPresetsService', () => {
  it('hides legacy presets whose referenced part is unavailable', async () => {
    const validPreset = {
      id: 'preset-valid',
      facePart: {
        status: ProductStatus.inactive,
        availability: 'available',
      },
      hairPart: null,
      torsoPart: null,
      legsPart: null,
      hatPart: null,
      accessories: [],
    };
    const invalidPreset = {
      ...validPreset,
      id: 'preset-invalid',
      facePart: {
        status: ProductStatus.active,
        availability: 'unavailable',
      },
    };
    const prisma = {
      characterPreset: {
        findMany: jest.fn().mockResolvedValue([validPreset, invalidPreset]),
      },
    };
    const service = new CharacterPresetsService(prisma as never);

    await expect(service.findPublicCharacterPresets()).resolves.toEqual([
      validPreset,
    ]);
  });
});
