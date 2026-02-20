const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany();
        console.log('--- Current Users in Database ---');
        users.forEach(u => {
            console.log(`ID: ${u.id}, Username: "${u.username}", Role: ${u.role}, Password: "${u.password}"`);
        });
        console.log('---------------------------------');
    } catch (e) {
        console.error('Error querying users:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
