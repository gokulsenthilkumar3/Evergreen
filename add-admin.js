const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const username = 'admin';
        const password = 'password123';

        // Upsert user
        const user = await prisma.user.upsert({
            where: { username },
            update: { password, role: 'ADMIN' },
            create: {
                username,
                password,
                role: 'ADMIN',
                email: 'admin@evergreen.local',
                name: 'Administrator'
            }
        });

        console.log(`✅ User "${username}" verified/updated with password: "${password}"`);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
