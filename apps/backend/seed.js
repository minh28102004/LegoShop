const { PrismaClient } = require('@prisma/client');
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
      { id: "Trắng", name: "Trắng", colorHex: "#FFFFFF" },
      { id: "Đen", name: "Đen", colorHex: "#000000" },
      { id: "Gỗ", name: "Gỗ", colorHex: "#D2B48C" }
    ],
    skipDuplicates: true
  });
  console.log("Seeded successfully");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
