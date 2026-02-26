const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');

async function testInward() {
    const prisma = new PrismaClient();
    try {
        const data = { batchId: `TEST-${Date.now()}`, date: new Date().toISOString(), supplier: 'Test Supplier', bale: 10, kg: 1500 };
        console.log('Sending data:', data);

        const res = await prisma.$transaction(async (tx) => {
            const batch = await tx.inwardBatch.create({
                data: {
                    batchId: data.batchId,
                    date: new Date(data.date),
                    supplier: data.supplier,
                    bale: data.bale,
                    kg: data.kg,
                    createdBy: data.createdBy,
                }
            });

            const lastEntry = await tx.cottonInventory.findFirst({ orderBy: { id: 'desc' } });
            const currentBalance = lastEntry ? lastEntry.balance : 0;

            await tx.cottonInventory.create({
                data: {
                    date: new Date(data.date),
                    type: 'INWARD',
                    quantity: data.kg,
                    balance: currentBalance + data.kg,
                    reference: data.batchId,
                    batchId: data.batchId,
                    createdBy: data.createdBy
                }
            });

            return batch;
        });
        console.log('Success:', res);
    } catch (e) {
        console.error('Prisma Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

testInward();
