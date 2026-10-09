import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const id = 'a547da8f-9c26-46df-9fbf-faa754585b6b';
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    const customer = await prisma.customer.findUnique({ where: { id } });

    console.log('Invoice found:', !!invoice);
    console.log('Customer found:', !!customer);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
