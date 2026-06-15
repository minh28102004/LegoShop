import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient, ProductStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

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

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Studio data...');

  // 1. Frame Sizes
  let size20 = await prisma.frameSize.findFirst({ where: { label: '20x20' } });
  if (!size20) {
    size20 = await prisma.frameSize.create({
      data: {
        label: '20x20',
        price: 150000,
        popular: true,
        status: 'active',
      },
    });
  }

  let size30 = await prisma.frameSize.findFirst({ where: { label: '30x30' } });
  if (!size30) {
    size30 = await prisma.frameSize.create({
      data: {
        label: '30x30',
        price: 250000,
        popular: false,
        status: 'active',
      },
    });
  }

  console.log('Frame Sizes seeded:', { size20, size30 });

  // 2. Frame Colors
  let colorWhite = await prisma.frameColor.findFirst({ where: { name: 'Trắng' } });
  if (!colorWhite) {
    colorWhite = await prisma.frameColor.create({
      data: {
        name: 'Trắng',
        status: 'active',
      },
    });
  }

  let colorBlack = await prisma.frameColor.findFirst({ where: { name: 'Đen' } });
  if (!colorBlack) {
    colorBlack = await prisma.frameColor.create({
      data: {
        name: 'Đen',
        status: 'active',
      },
    });
  }

  console.log('Frame Colors seeded:', { colorWhite, colorBlack });

  // 3. Template Category
  const catLove = await prisma.templateCategory.upsert({
    where: { slug: 'khung-tinh-yeu' },
    update: {},
    create: {
      name: 'Khung Tình Yêu',
      slug: 'khung-tinh-yeu',
    },
  });

  console.log('Template Category seeded:', catLove);

  // 4. Template
  let sampleTemplate = await prisma.template.findFirst({ where: { name: 'Mẫu Nền Trái Tim' } });
  if (!sampleTemplate) {
    sampleTemplate = await prisma.template.create({
      data: {
        name: 'Mẫu Nền Trái Tim',
        imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&auto=format&fit=crop&q=60',
        configJson: { elements: [] },
        status: ProductStatus.active,
        categoryId: catLove.id,
      },
    });
  }

  console.log('Template seeded:', sampleTemplate);

  // 5. Accessory Category
  const catCharm = await prisma.accessoryCategory.upsert({
    where: { slug: 'charm-sticker' },
    update: {},
    create: {
      name: 'Charm & Sticker',
      slug: 'charm-sticker',
    },
  });

  console.log('Accessory Category seeded:', catCharm);

  // 6. Accessory
  let sampleAccessory = await prisma.accessory.findFirst({ where: { name: 'Charm Trái Tim Đỏ' } });
  if (!sampleAccessory) {
    sampleAccessory = await prisma.accessory.create({
      data: {
        name: 'Charm Trái Tim Đỏ',
        price: 10000,
        imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=100&auto=format&fit=crop&q=60',
        iconUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=50&auto=format&fit=crop&q=60',
        status: ProductStatus.active,
        categoryId: catCharm.id,
      },
    });
  }

  console.log('Accessory seeded:', sampleAccessory);

  console.log('Studio Seeding completed successfully!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
