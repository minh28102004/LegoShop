import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CharacterPartType, PrismaClient, ProductStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcrypt';

function loadLocalEnv() {
  const envPath = resolve(__dirname, '../.env');

  if (!existsSync(envPath)) {
    return;
  }

  const content = readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex < 0) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    const rawValue = trimmed.slice(eqIndex + 1).trim();
    const value = rawValue.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const adapter = new PrismaPg(
  {
    connectionString: process.env.DATABASE_URL,
  },
  process.env.DATABASE_SCHEMA?.trim()
    ? { schema: process.env.DATABASE_SCHEMA.trim() }
    : undefined,
);

const prisma = new PrismaClient({ adapter });

const TEST_PRODUCT_NAMES = [
  'City Skyline Brick Frame',
  'Botanical Garden Display',
  'Vintage Space Cruiser',
  'Modular Cafe Corner',
  'Technic Rally Car',
  'Castle Gate Mini Diorama',
  'Ocean Explorer Ship',
  'Pixel Art Dragon',
  'Classic Roadster Frame',
  'Mini Street Food Cart',
  'Architecture Museum Set',
  'Retro Arcade Cabinet',
  'Flower Bouquet Shadowbox',
  'Moon Rover Display',
  'Tiny Train Station',
  'Samurai Helmet Stand',
  'Forest Cabin Scene',
  'Desert Buggy Frame',
  'Holiday Village Display',
  'Pirate Cove Mini Frame',
  'Formula Speed Racer',
  'Book Nook Brick Scene',
  'Neon City Alley',
  'Robot Workshop Set',
  'Dinosaur Fossil Frame',
  'Fire Station Classic',
  'Police Pursuit Display',
  'Mountain Bike Technic',
  'Lighthouse Coast Scene',
  'Medieval Market Stall',
  'Jazz Club Miniature',
  'Rocket Launch Pad',
  'Underwater Reef Frame',
  'Grand Piano Brick Art',
  'Zen Garden Display',
  'Cyberpunk Hover Bike',
  'Farmhouse Brick Scene',
  'Dragon Temple Gate',
  'Space Station Module',
  'Vintage Camera Frame',
  'Rainy Street Diorama',
  'Sports Car Wall Frame',
  'Wizard Tower Mini Set',
  'Snow Cabin Shadowbox',
  'Brick Safari Jeep',
  'Train Bridge Display',
  'Modern Villa Frame',
  'Galaxy Explorer Poster',
] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function buildTestProduct(index: number, name: string) {
  const productNumber = String(index + 1).padStart(2, '0');
  const priceStep = index % 8;

  return {
    name,
    slug: `test-paging-${slugify(name)}`,
    description: `Sản phẩm mẫu ${productNumber} dùng để kiểm thử phân trang, tìm kiếm và sắp xếp trong admin.`,
    basePrice: 79000 + priceStep * 50000,
    images: [] as string[],
    status: index % 11 === 0 ? ProductStatus.inactive : ProductStatus.active,
    featured: index % 7 === 0,
  };
}

async function seedCharacterCatalog() {
  const media = [
    '1782982601524-c82dd399-25d7-4788-a1f4-c21fe36f5513.png',
    '1782982615524-606630ad-acc6-417c-a654-52c54e74b20c.png',
    '1783101374574-53f856b5-441d-43af-84ee-8bc5f99f218f.png',
    '1783101418608-adc7cfea-ef64-4230-8c0e-f839f543123e.png',
    '1783101449049-f3820886-c30b-49f9-8b54-0a7de464f20e.png',
    '1783101487762-d10acefe-7f11-4ad3-97f0-74f86e5619da.png',
    '1783947307003-1d0bd84e-8025-42b8-9ddc-3ab18a4297fd.png',
    '1783947337079-25132556-0061-4d28-9cb3-8c699b1731c6.png',
    '1783947355638-39c59998-8744-432c-a129-7495bbcf9c96.png',
    '1783947364137-433880e5-522b-48c8-b023-7ec16d3687cb.png',
    '1783947383009-eb4a4e92-9a72-4057-89ec-0a00d0d08cb2.png',
    '1783947389276-dd778d26-45e2-434a-a122-625deaa0abb8.png',
  ].map((file) => `/uploads/admin/${file}`);
  const partSeeds = [
    ['face-smile-classic', 'Khuôn mặt tươi cười', CharacterPartType.FACE, 0],
    ['face-confident', 'Khuôn mặt tự tin', CharacterPartType.FACE, 3000],
    ['hair-short-black', 'Tóc đen ngắn', CharacterPartType.HAIR, 5000],
    ['hair-long-brown', 'Tóc nâu dài', CharacterPartType.HAIR, 7000],
    ['torso-formal-blue', 'Áo sơ mi xanh', CharacterPartType.TORSO, 10000],
    ['torso-graduation', 'Áo tốt nghiệp', CharacterPartType.TORSO, 15000],
    ['legs-classic-black', 'Chân đen cổ điển', CharacterPartType.LEGS, 0],
    ['legs-denim-blue', 'Chân denim xanh', CharacterPartType.LEGS, 5000],
    ['hat-graduation', 'Mũ tốt nghiệp', CharacterPartType.HAT, 12000],
    ['hat-cap-blue', 'Mũ lưỡi trai xanh', CharacterPartType.HAT, 8000],
    ['accessory-camera', 'Máy ảnh mini', CharacterPartType.ACCESSORY, 12000],
    ['accessory-flower', 'Bó hoa mini', CharacterPartType.ACCESSORY, 10000],
  ] as const;
  const parts = new Map<string, { id: string; imageUrl: string }>();

  for (const [
    index,
    [slug, name, type, priceAdjustment],
  ] of partSeeds.entries()) {
    const part = await prisma.characterPart.upsert({
      where: { slug },
      update: {
        name,
        type,
        imageUrl: media[index],
        priceAdjustment,
        availability: 'available',
        isActive: true,
        status: ProductStatus.active,
        sortOrder: index,
      },
      create: {
        slug,
        name,
        type,
        imageUrl: media[index],
        priceAdjustment,
        category: type.toLowerCase(),
        availability: 'available',
        isActive: true,
        status: ProductStatus.active,
        sortOrder: index,
      },
      select: { id: true, imageUrl: true },
    });
    parts.set(slug, part);
  }

  type CharacterPresetSeed = {
    slug: string;
    name: string;
    description: string;
    face: string;
    hair: string;
    torso: string;
    legs: string;
    hat: string | null;
    accessories: readonly string[];
  };

  const presetSeeds = [
    {
      slug: 'graduation-blue',
      name: 'Cử nhân xanh',
      description: 'Nhân vật tốt nghiệp với áo choàng và máy ảnh.',
      face: 'face-confident',
      hair: 'hair-short-black',
      torso: 'torso-graduation',
      legs: 'legs-classic-black',
      hat: 'hat-graduation',
      accessories: ['accessory-camera'],
    },
    {
      slug: 'creative-florist',
      name: 'Người kể chuyện hoa',
      description: 'Nhân vật trẻ trung với bó hoa mini.',
      face: 'face-smile-classic',
      hair: 'hair-long-brown',
      torso: 'torso-formal-blue',
      legs: 'legs-denim-blue',
      hat: null,
      accessories: ['accessory-flower'],
    },
    {
      slug: 'everyday-explorer',
      name: 'Nhà khám phá nhỏ',
      description: 'Phong cách hằng ngày, sẵn sàng làm quà tặng.',
      face: 'face-smile-classic',
      hair: 'hair-short-black',
      torso: 'torso-formal-blue',
      legs: 'legs-denim-blue',
      hat: 'hat-cap-blue',
      accessories: ['accessory-camera', 'accessory-flower'],
    },
  ] as const satisfies readonly CharacterPresetSeed[];

  for (const [index, presetSeed] of presetSeeds.entries()) {
    const facePartId = parts.get(presetSeed.face)!.id;
    const hairPartId = parts.get(presetSeed.hair)!.id;
    const torsoPartId = parts.get(presetSeed.torso)!.id;
    const legsPartId = parts.get(presetSeed.legs)!.id;
    const hatPartId = presetSeed.hat ? parts.get(presetSeed.hat)!.id : null;
    const accessorySlugs: readonly string[] = presetSeed.accessories;
    const accessoryPartIds = accessorySlugs.map((slug) => parts.get(slug)!.id);
    const preset = await prisma.characterPreset.upsert({
      where: { slug: presetSeed.slug },
      update: {
        name: presetSeed.name,
        description: presetSeed.description,
        previewImageUrl: parts.get(presetSeed.face)!.imageUrl,
        isBuilderPreset: true,
        isSellable: true,
        facePartId,
        hairPartId,
        torsoPartId,
        legsPartId,
        hatPartId,
        sortOrder: index,
        status: ProductStatus.active,
        accessories: {
          deleteMany: {},
          create: accessoryPartIds.map((partId, sortOrder) => ({
            partId,
            sortOrder,
          })),
        },
      },
      create: {
        slug: presetSeed.slug,
        name: presetSeed.name,
        description: presetSeed.description,
        previewImageUrl: parts.get(presetSeed.face)!.imageUrl,
        isBuilderPreset: true,
        isSellable: true,
        facePartId,
        hairPartId,
        torsoPartId,
        legsPartId,
        hatPartId,
        sortOrder: index,
        status: ProductStatus.active,
        accessories: {
          create: accessoryPartIds.map((partId, sortOrder) => ({
            partId,
            sortOrder,
          })),
        },
      },
    });
    const selectedPartIds = [
      facePartId,
      hairPartId,
      torsoPartId,
      legsPartId,
      ...(hatPartId ? [hatPartId] : []),
      ...accessoryPartIds,
    ];
    const basePrice =
      10_000 +
      selectedPartIds.reduce((total, partId) => {
        const seedIndex = partSeeds.findIndex(
          ([slug]) => parts.get(slug)?.id === partId,
        );
        return total + (partSeeds[seedIndex]?.[3] ?? 0);
      }, 0);
    const productSlug = `character-${presetSeed.slug}`;

    await prisma.product.upsert({
      where: { slug: productSlug },
      update: {
        name: presetSeed.name,
        shortDescription: presetSeed.description,
        basePrice,
        compareAtPrice: basePrice + 15000,
        thumbnailUrl: parts.get(presetSeed.face)!.imageUrl,
        images: [parts.get(presetSeed.face)!.imageUrl],
        productType: 'lego_character',
        category: 'character',
        availability: 'available',
        published: true,
        characterPresetId: preset.id,
        status: ProductStatus.active,
        featured: index === 0,
      },
      create: {
        name: presetSeed.name,
        slug: productSlug,
        description: presetSeed.description,
        shortDescription: presetSeed.description,
        basePrice,
        compareAtPrice: basePrice + 15000,
        thumbnailUrl: parts.get(presetSeed.face)!.imageUrl,
        images: [parts.get(presetSeed.face)!.imageUrl],
        productType: 'lego_character',
        category: 'character',
        availability: 'available',
        published: true,
        characterPresetId: preset.id,
        status: ProductStatus.active,
        featured: index === 0,
      },
    });
  }

  for (const [index, [slug, name, type, priceAdjustment]] of partSeeds
    .filter(([, , type]) => type === CharacterPartType.ACCESSORY)
    .entries()) {
    const part = parts.get(slug)!;
    await prisma.product.upsert({
      where: { slug: `part-${slug}` },
      update: {
        name,
        basePrice: priceAdjustment,
        thumbnailUrl: part.imageUrl,
        images: [part.imageUrl],
        productType: 'loose_part',
        category: type.toLowerCase(),
        published: true,
        availability: 'available',
        status: ProductStatus.active,
      },
      create: {
        name,
        slug: `part-${slug}`,
        description: 'Thành phần LEGO lẻ dùng cho thiết kế cá nhân hóa.',
        shortDescription: 'Thành phần LEGO lẻ.',
        basePrice: priceAdjustment,
        thumbnailUrl: part.imageUrl,
        images: [part.imageUrl],
        productType: 'loose_part',
        category: type.toLowerCase(),
        published: true,
        availability: 'available',
        status: ProductStatus.active,
        featured: index === 0,
        componentConfig: {
          parts: [
            {
              id: part.id,
              type: 'product',
              name,
              price: priceAdjustment,
              quantity: 1,
              imageUrl: part.imageUrl,
            },
          ],
        },
      },
    });
  }
}

async function main() {
  await prisma.paymentSetting.upsert({
    where: {
      id: 'default-payment-setting',
    },
    update: {},
    create: {
      id: 'default-payment-setting',
      codEnabled: true,
      payosEnabled: true,
      codDepositEnabled: false,
      codDepositPercent: 0,
    },
  });

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = (process.env.ADMIN_NAME ?? 'Lego Shop Admin').trim();

  if (!adminEmail || !adminPassword) {
    console.warn(
      'Skipping admin seed because ADMIN_EMAIL or ADMIN_PASSWORD is not configured.',
    );
  } else {
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: adminEmail },
      select: { id: true },
    });

    if (!existingAdmin) {
      const passwordHash = await hash(adminPassword, 10);

      await prisma.admin.create({
        data: {
          email: adminEmail,
          passwordHash,
          name: adminName,
          role: 'admin',
        },
      });
    }
  }

  await prisma.product.upsert({
    where: {
      slug: 'classic-brick-set',
    },
    update: {},
    create: {
      name: 'Classic Brick Set',
      slug: 'classic-brick-set',
      description: 'Basic brick set for beginners.',
      basePrice: 199000,
      images: [],
      status: 'active',
      featured: true,
    },
  });

  await prisma.product.upsert({
    where: {
      slug: 'mini-figure-custom',
    },
    update: {},
    create: {
      name: 'Mini Figure Custom',
      slug: 'mini-figure-custom',
      description: 'Customizable mini figure model.',
      basePrice: 99000,
      images: [],
      status: 'active',
      featured: true,
    },
  });

  for (const [index, name] of TEST_PRODUCT_NAMES.entries()) {
    const product = buildTestProduct(index, name);

    await prisma.product.upsert({
      where: {
        slug: product.slug,
      },
      update: {
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        status: product.status,
        featured: product.featured,
      },
      create: product,
    });
  }

  await prisma.collection.upsert({
    where: {
      slug: 'starter-sets',
    },
    update: {},
    create: {
      name: 'Starter Sets',
      slug: 'starter-sets',
      description: 'Brick sets suitable for beginners.',
      imageUrl: null,
      status: 'active',
    },
  });

  await seedCharacterCatalog();

  console.log('Seed completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
