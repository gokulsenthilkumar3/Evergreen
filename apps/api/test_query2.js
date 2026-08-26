const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const outward = await prisma.outward.findMany();
  console.log(outward);
}

main().finally(() => prisma.$disconnect());
