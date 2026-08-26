const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const yarn = await prisma.yarnInventory.findMany();
  console.log(yarn);
}

main().finally(() => prisma.$disconnect());
