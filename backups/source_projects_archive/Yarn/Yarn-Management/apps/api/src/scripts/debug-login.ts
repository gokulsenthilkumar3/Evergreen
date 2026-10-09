
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'gokulkangeyan@gmail.com';
    const password = 'admin123456!';

    console.log(`--- Debug Login for: ${email} ---`);

    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            passwordHash: true,
            status: true,
            failedLoginAttempts: true,
            lockoutUntil: true
        }
    });

    if (!user) {
        console.error('User NOT FOUND in database!');
        return;
    }

    console.log('User Found:');
    console.log(`- ID: ${user.id}`);
    console.log(`- Status: ${user.status}`);
    console.log(`- Attempts: ${user.failedLoginAttempts}`);
    console.log(`- Locked: ${user.lockoutUntil}`);

    if (!user.passwordHash) {
        console.error('User has NO password hash!');
        return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    console.log('-----------------------------------');
    console.log(`Password 'admin123456!' Match: ${isMatch}`);
    console.log('-----------------------------------');

    if (isMatch) {
        console.log('The password is CORRECT in the DB.');
        console.log('If login still fails, check CLIENT payload.');
    } else {
        console.log('The password is WRONG in the DB.');
        // Attempt fix again
        const newHash = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newHash, failedLoginAttempts: 0, lockoutUntil: null }
        });
        console.log('FIX APPLIED: Password reset to admin123456!');
    }
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
