import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
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

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

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

  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@example.com')
    .trim()
    .toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@123456';
  const adminName = (process.env.ADMIN_NAME ?? 'Lego Shop Admin').trim();

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
