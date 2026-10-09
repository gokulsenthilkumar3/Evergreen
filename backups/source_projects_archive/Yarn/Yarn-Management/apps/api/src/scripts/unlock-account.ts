
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'gokulkangeyan@gmail.com';
    console.log(`Unlocking account for ${email}...`);

    await prisma.user.update({
        where: { email },
        data: {
            failedLoginAttempts: 0,
            lockoutUntil: null
        }
    });

    console.log('Account unlocked successfully.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
