import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient, ProductStatus } from '@prisma/client';
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
