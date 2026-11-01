// Additive migration with a verified snapshot; no accounts or history are removed.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const { ownerHostEnvironment, requireInstallationLicence } = require('../../packages/types/dist/licensing');
const root = path.resolve(__dirname, '../..');
const ps = path.join(process.env.SystemRoot, 'System32/WindowsPowerShell/v1.0/powershell.exe');
const prisma = path.join(root, 'node_modules/prisma/build/index.js');
const run = (args, env) => execFileSync(process.execPath, args, { cwd: root, env, stdio: 'pipe', windowsHide: true });
async function main() {
  requireInstallationLicence('tenant');
  const env = { ...process.env, ...ownerHostEnvironment('tenant') };
  if (!env.DATABASE_URL?.startsWith('file:')) throw new Error('Private tenant database required');
  const source = path.resolve(env.DATABASE_URL.slice(5));
  if (!fs.existsSync(source) || source.toLowerCase().startsWith(root.toLowerCase()+path.sep)) throw new Error('Expected existing private tenant storage');
  const applied = JSON.parse(run(['-e', "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();db.$queryRawUnsafe('SELECT migration_name,finished_at,rolled_back_at FROM _prisma_migrations').then(r=>process.stdout.write(JSON.stringify(r))).finally(()=>db.$disconnect())"], env).toString());
  if (applied.some(row => !row.finished_at && !row.rolled_back_at)) throw new Error('Resolve unfinished migrations first');
  const complete = new Set(applied.filter(row => row.finished_at && !row.rolled_back_at).map(row => row.migration_name));
  const pending = fs.readdirSync(path.join(root,'packages/database/prisma/migrations'), { withFileTypes: true }).filter(entry => entry.isDirectory() && !complete.has(entry.name)).map(entry => entry.name);
  if (pending.some(name => !['20261101020000_user_lifecycle','20261101030000_account_recovery','20261101040000_external_identities','20261101050000_staff_access','20261101060000_session_policy','20261101070000_user_audit_ledger','20261101080000_helpdesk_workflow','20261101090000_helpdesk_operations'].includes(name))) throw new Error('Unexpected pending tenant migration');
  const backup = path.join(path.dirname(source), `before-user-lifecycle-${randomUUID()}.db`);
  // A separate process releases the Windows engine DLL before generation.
  run([path.join(root,'scripts/release/database.cjs'),'snapshot','tenant',source,backup], env);
  if (!fs.existsSync(backup) || !fs.existsSync(backup+'.json')) throw new Error('Verified backup is missing');
  execFileSync(ps, ['-NoProfile','-NonInteractive','-File',path.join(root,'scripts/security/stop-owner-services.ps1'),'-ProjectRoot',root], { stdio: 'pipe', windowsHide: true });
  try {
    run([prisma,'generate','--schema','packages/database/prisma/schema.prisma'], env);
    run([prisma,'migrate','deploy','--schema','packages/database/prisma/schema.prisma'], env);
    execFileSync(process.execPath, [path.join(root,'node_modules/@nestjs/cli/bin/nest.js'),'build'], { cwd: path.join(root,'apps/api'), env, stdio: 'pipe', windowsHide: true });
    console.log(JSON.stringify({ status: 'User lifecycle migration applied', backup, data: 'Existing accounts and history retained' }));
  } finally {
    run([path.join(root,'scripts/security/owner-host.cjs'),'start'], process.env);
  }
}
main().catch(error => { console.error('Lifecycle upgrade stopped: '+error.message); process.exitCode=1; });

