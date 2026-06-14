import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.frameSize.createMany({
    data: [
      { id: "15x15cm", label: "15x15cm", price: 210000 },
      { id: "18x24cm", label: "18x24cm", price: 220000 },
      { id: "23x23cm", label: "23x23cm", price: 230000, popular: true },
      { id: "13x18cm", label: "Khung 13x18 (không mica)", price: 180000 }
    ],
    skipDuplicates: true
  });

  await prisma.frameColor.createMany({
    data: [
      { id: "Trắng", name: "Trắng" },
      { id: "Đen", name: "Đen" },
      { id: "Gỗ", name: "Gỗ" }
    ],
    skipDuplicates: true
  });

  console.log("Seeded frames");
}

main().catch(console.error).finally(() => prisma.$disconnect());
