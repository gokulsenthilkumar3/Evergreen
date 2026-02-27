const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
    try {
        console.log('Cleaning database...');

        await prisma.payment.deleteMany({});
        await prisma.invoiceItem.deleteMany({});
        await prisma.invoice.deleteMany({});

        await prisma.outwardItem.deleteMany({});
        await prisma.outward.deleteMany({});

        await prisma.costingEntry.deleteMany({});
        await prisma.activityLog.deleteMany({});
        await prisma.systemSettings.deleteMany({});

        await prisma.cottonInventory.deleteMany({});
        await prisma.yarnInventory.deleteMany({});
        await prisma.wasteInventory.deleteMany({});

        await prisma.productionConsumption.deleteMany({});
        await prisma.productionOutput.deleteMany({});
        await prisma.production.deleteMany({});

        await prisma.inwardBatch.deleteMany({});

        await prisma.session.deleteMany({});
        await prisma.user.deleteMany({});

        console.log('Database cleaned successfully.');
    } catch (e) {
        console.error('Error cleaning database:', e);
    } finally {
        await prisma.$disconnect();
    }
}

clean();
