
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Deleting dependent data...');
        // Delete in reverse order of dependencies
        await prisma.wastageLog.deleteMany({});
        await prisma.finishedGood.deleteMany({});
        await prisma.productionBatch.deleteMany({});
        await prisma.rawMaterial.deleteMany({});

        // Now safe to delete suppliers
        const { count } = await prisma.supplier.deleteMany({});
        console.log(`Deleted ${count} suppliers.`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
