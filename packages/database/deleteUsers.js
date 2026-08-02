/**
 * deleteUsers.js — Development utility to wipe all users from the database.
 *
 * ⚠️  DANGER: This permanently deletes ALL user records.
 * This script MUST only run in a development environment.
 * It will refuse to execute if NODE_ENV === 'production'.
 *
 * Usage:
 *   node packages/database/deleteUsers.js
 *   # or, to skip the confirmation prompt:
 *   node packages/database/deleteUsers.js --confirm
 */

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

// ─── Safety Guard: Refuse to run in production ────────────────────────────────
if (process.env.NODE_ENV === 'production') {
    console.error('❌ ABORTED: deleteUsers.js must NOT be run in production!');
    process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
    const skipConfirm = process.argv.includes('--confirm');

    if (!skipConfirm) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const answer = await new Promise((resolve) => {
            rl.question(
                '⚠️  This will permanently delete ALL users. Type "yes" to confirm: ',
                resolve
            );
        });
        rl.close();

        if (answer.trim().toLowerCase() !== 'yes') {
            console.log('❎ Aborted. No users were deleted.');
            return;
        }
    }

    const count = await prisma.user.count();
    await prisma.user.deleteMany({});
    console.log(`✅ Deleted ${count} user(s).`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
