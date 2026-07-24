import { config as loadEnv } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient, ProductStatus } from '@prisma/client';

loadEnv({ path: '.env.local', quiet: true });
loadEnv({ path: '.env', quiet: true });

const DEFAULT_CHARACTER_ID = 'catalog-default-custom-character';
const INCLUDED_PACKAGING = [
  { id: 'gift-box', name: 'Hộp quà', quantity: 1, icon: 'gift' },
  { id: 'gift-bag', name: 'Túi', quantity: 1, icon: 'package' },
  { id: 'greeting-card', name: 'Thiệp', quantity: 1, icon: 'sparkles' },
] as const;

function createPrismaClient() {
  const schema = process.env.DATABASE_SCHEMA?.trim();
  return new PrismaClient({
    adapter: new PrismaPg(
      { connectionString: process.env.DATABASE_URL },
      schema ? { schema } : undefined,
    ),
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readPositiveInteger(value: unknown) {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
    ? value
    : null;
}

function hasValidConfiguredParts(
  value: unknown,
  knownIds: ReadonlySet<string>,
) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => {
      const record = isRecord(item) ? item : null;
      const id = readString(record?.id);
      return Boolean(id && knownIds.has(id));
    })
  );
}

function hasValidConfiguredPart(value: unknown, knownIds: ReadonlySet<string>) {
  const id = readString(isRecord(value) ? value.id : null);
  return Boolean(id && knownIds.has(id));
}

function saleOriginalPrice(basePrice: number, index: number) {
  if (index % 4 !== 0) return undefined;
  return Math.ceil((basePrice * 1.05) / 1_000) * 1_000;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const prisma = createPrismaClient();
  await prisma.$connect();

  try {
    const [
      products,
      characters,
      accessories,
      frameOptions,
      frameSizes,
      backgrounds,
    ] = await Promise.all([
      prisma.product.findMany({
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      }),
      prisma.character.findMany({
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      }),
      prisma.accessory.findMany({
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      }),
      prisma.frameOption.findMany({
        where: { status: ProductStatus.active },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      }),
      prisma.frameSize.findMany({
        where: { status: ProductStatus.active },
        orderBy: [{ price: 'asc' }, { id: 'asc' }],
      }),
      prisma.frameBackground.findMany({
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      }),
    ]);

    const character =
      characters.find((item) => item.id === DEFAULT_CHARACTER_ID) ??
      characters.find((item) => item.status === ProductStatus.active) ??
      (apply
        ? await prisma.character.upsert({
            where: { id: DEFAULT_CHARACTER_ID },
            update: { status: ProductStatus.active },
            create: {
              id: DEFAULT_CHARACTER_ID,
              name: 'Nhân vật LEGO tùy chỉnh',
              price: 50_000,
              sortOrder: 0,
              status: ProductStatus.active,
            },
          })
        : {
            id: DEFAULT_CHARACTER_ID,
            name: 'Nhân vật LEGO tùy chỉnh',
            price: 50_000,
            imageUrl: null,
          });
    const allCharacterIds = new Set([
      ...characters.map((item) => item.id),
      character.id,
    ]);
    const allAccessoryIds = new Set(accessories.map((item) => item.id));
    const allFrameOptionIds = new Set(frameOptions.map((item) => item.id));
    const allBackgroundIds = new Set(backgrounds.map((item) => item.id));
    const sizeOptions = frameOptions.filter((item) => item.type === 'size');
    const colorOptions = frameOptions.filter((item) => item.type === 'color');
    const activeAccessories = accessories.filter(
      (item) => item.status === ProductStatus.active,
    );
    const activeBackgrounds = backgrounds.filter(
      (item) => item.status === ProductStatus.active,
    );
    let changed = 0;

    for (const [index, product] of products.entries()) {
      const existing = isRecord(product.componentConfig)
        ? product.componentConfig
        : {};
      const sampleMedia = isRecord(existing.sampleMedia)
        ? existing.sampleMedia
        : null;
      const seedTag = readString(sampleMedia?.seedTag);
      const sourceOrder =
        readPositiveInteger(sampleMedia?.sortOrder) ?? index + 1;
      const productAccessories = seedTag
        ? accessories.filter((item) => item.seedTag === seedTag)
        : activeAccessories;
      const productBackgrounds = seedTag
        ? backgrounds.filter((item) => item.seedTag === seedTag)
        : activeBackgrounds;
      const accessoryPool =
        productAccessories.length > 0 ? productAccessories : activeAccessories;
      const backgroundPool =
        productBackgrounds.length > 0 ? productBackgrounds : activeBackgrounds;
      const sizeOption =
        sizeOptions[(sourceOrder - 1) % Math.max(1, sizeOptions.length)];
      const colorOption =
        colorOptions[(sourceOrder - 1) % Math.max(1, colorOptions.length)];
      const background =
        backgroundPool[(sourceOrder - 1) % Math.max(1, backgroundPool.length)];
      const characterQuantity = 1 + ((sourceOrder - 1) % 2);
      const accessoryCount = accessoryPool.length
        ? 1 + ((sourceOrder - 1) % Math.min(3, accessoryPool.length))
        : 0;
      const selectedAccessories = Array.from(
        { length: accessoryCount },
        (_, accessoryIndex) =>
          accessoryPool[
            (sourceOrder - 1 + accessoryIndex) % accessoryPool.length
          ],
      );

      const next: Record<string, unknown> = { ...existing };
      if (
        !hasValidConfiguredPart(existing.frame, allFrameOptionIds) &&
        sizeOption
      ) {
        next.frame = {
          id: sizeOption.id,
          type: 'frame',
          name: sizeOption.label ?? sizeOption.name,
          price: sizeOption.price,
          quantity: 1,
          imageUrl: sizeOption.imageUrl,
        };
      }
      if (
        !hasValidConfiguredPart(existing.frameColor, allFrameOptionIds) &&
        colorOption
      ) {
        next.frameColor = {
          id: colorOption.id,
          type: 'frameColor',
          name: colorOption.label ?? colorOption.name,
          price: colorOption.price,
          quantity: 1,
          imageUrl: colorOption.imageUrl,
        };
      }
      if (
        !hasValidConfiguredPart(existing.background, allBackgroundIds) &&
        background
      ) {
        next.background = {
          id: background.id,
          type: 'background',
          name: background.title,
          price: 0,
          quantity: 1,
          imageUrl: background.imageUrl,
        };
      }
      if (!hasValidConfiguredParts(existing.characters, allCharacterIds)) {
        next.characters = [
          {
            id: character.id,
            type: 'character',
            name: character.name,
            price: character.price,
            quantity: characterQuantity,
            imageUrl: character.imageUrl,
          },
        ];
      }
      if (!hasValidConfiguredParts(existing.accessories, allAccessoryIds)) {
        next.accessories = selectedAccessories.map((accessory) => ({
          id: accessory.id,
          type: 'accessory',
          name: accessory.name,
          price: accessory.price,
          quantity: 1,
          imageUrl: accessory.imageUrl,
        }));
      }
      if (
        !Array.isArray(existing.includedItems) ||
        existing.includedItems.length === 0
      ) {
        next.includedItems = INCLUDED_PACKAGING;
      }
      if (
        !Array.isArray(existing.frameSizeIds) ||
        existing.frameSizeIds.length === 0
      ) {
        next.frameSizeIds = frameSizes.map((item) => item.id);
      }
      if (
        !readString(existing.recommendedFrameSizeId) &&
        frameSizes.length > 0
      ) {
        next.recommendedFrameSizeId =
          frameSizes[(sourceOrder - 1) % frameSizes.length].id;
      }
      if (typeof existing.originalPrice !== 'number') {
        const originalPrice = saleOriginalPrice(product.basePrice, index);
        if (originalPrice) next.originalPrice = originalPrice;
      }

      if (JSON.stringify(next) === JSON.stringify(existing)) continue;
      changed += 1;
      if (apply) {
        await prisma.product.update({
          where: { id: product.id },
          data: { componentConfig: next as Prisma.InputJsonValue },
        });
      }
    }

    console.log(
      JSON.stringify(
        {
          mode: apply ? 'apply' : 'dry-run',
          scannedProducts: products.length,
          changedProducts: changed,
          characterId: character.id,
          availableAccessories: accessories.length,
          availableFrameOptions: frameOptions.length,
          availableBackgrounds: backgrounds.length,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
