import { prisma } from './src/prisma/client';

async function check() {
    try {
        console.log('Checking DB connection...');
        const count = await prisma.user.count();
        console.log(`Connection successful. User count: ${count}`);
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err);
        process.exit(1);
    }
}

check();
