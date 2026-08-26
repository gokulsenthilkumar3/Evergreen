const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  console.log('Starting cleanup of orphan yarnInventory records...');
  
  // Find all OUTWARD entries in yarnInventory
  const outwardYarn = await prisma.yarnInventory.findMany({
    where: { type: 'OUTWARD' }
  });

  let deletedCount = 0;
  for (const item of outwardYarn) {
    if (item.reference && item.reference.startsWith('O-')) {
      const outwardId = parseInt(item.reference.split('-')[1]);
      const exists = await prisma.outward.findUnique({ where: { id: outwardId } });
      
      if (!exists) {
        console.log(`Deleting orphan yarnInventory id: ${item.id} (ref: ${item.reference})`);
        await prisma.yarnInventory.delete({ where: { id: item.id } });
        deletedCount++;
      }
    }
  }

  console.log(`Deleted ${deletedCount} orphan records.`);
  
  // Recalculate balances for all counts
  console.log('Recalculating yarn balances...');
  const counts = await prisma.yarnInventory.findMany({
    select: { count: true },
    distinct: ['count']
  });

  for (const { count } of counts) {
    const movements = await prisma.yarnInventory.findMany({
      where: { count },
      orderBy: [{ date: 'asc' }, { id: 'asc' }]
    });

    let running = 0;
    for (const mov of movements) {
      running += mov.quantity;
      if (Math.abs(mov.balance - running) > 0.001) {
        await prisma.yarnInventory.update({
          where: { id: mov.id },
          data: { balance: running }
        });
      }
    }
    console.log(`Recalculated count: ${count}`);
  }

  console.log('Cleanup complete!');
}

cleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
