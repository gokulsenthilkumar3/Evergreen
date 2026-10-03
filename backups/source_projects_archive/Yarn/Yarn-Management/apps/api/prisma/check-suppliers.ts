
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.supplier.count();
        console.log(`SUPPLIER_COUNT: ${count}`);

        const suppliers = await prisma.supplier.findMany({ select: { id: true, name: true, supplierCode: true } });
        console.log('SUPPLIERS:', JSON.stringify(suppliers, null, 2));
    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
