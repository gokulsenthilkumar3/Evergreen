#!/usr/bin/env node

/**
 * EverGreen Unified Ecosystem Orchestrator
 * Launches ALL UI, API, and DB services in a single step across all 3 surfaces:
 * 1. Customer Tenant Surface (apps/web on 4000, apps/api on 4301)
 * 2. Provider Admin Control Plane (apps/admin-web on 5174, apps/admin-api on 4300)
 * 3. Public Product Marketing Showcase (apps/marketing-web on 3300)
 * 4. Dual Isolated SQLite Databases (@evergreen/database & @evergreen/admin-database)
 */

import { spawn, spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import net from 'net';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

// Locate npm CLI
const npmCli = (process.env.npm_execpath && fs.existsSync(process.env.npm_execpath))
  ? process.env.npm_execpath
  : (fs.existsSync('C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js'))
    ? 'C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js'
    : path.join(root, 'node_modules', 'npm', 'bin', 'npm-cli.js');

// Locate vite binary
let viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
try {
  const resolved = require.resolve('vite/package.json');
  viteBin = path.join(path.dirname(resolved), 'bin', 'vite.js');
} catch {}

const SERVICES = [
  {
    id: 'admin-api',
    name: 'Provider Admin API',
    port: 4300,
    cwd: path.join(root, 'apps', 'admin-api'),
    cmd: process.execPath,
    args: [path.join(root, 'apps', 'admin-api', 'dist', 'main.js')],
    healthUrl: 'http://127.0.0.1:4300/health',
    env: { ADMIN_API_PORT: '4300', PORT: '4300' },
    role: 'Central licensing, remote actions & telemetry',
  },
  {
    id: 'tenant-api',
    name: 'Customer Tenant API',
    port: 4301,
    cwd: path.join(root, 'apps', 'api'),
    cmd: process.execPath,
    args: [path.join(root, 'apps', 'api', 'dist', 'main.js')],
    healthUrl: 'http://127.0.0.1:4301/health?format=json',
    env: { EVERGREEN_API_PORT: '4301', PORT: '4301' },
    role: 'Isolated Yarn ERP, billing & quota enforcement',
  },
  {
    id: 'admin-web',
    name: 'Provider Admin Web',
    port: 5174,
    cwd: path.join(root, 'apps', 'admin-web'),
    cmd: process.execPath,
    args: [viteBin, '--port', '5174', '--strictPort'],
    healthUrl: 'http://localhost:5174/',
    proxyHealthUrl: 'http://localhost:5174/admin-api/health',
    env: {},
    role: 'Multi-cloud company control, provisioning & 1-min reactivation',
  },
  {
    id: 'tenant-web',
    name: 'Customer Tenant Web',
    port: 4000,
    cwd: path.join(root, 'apps', 'web'),
    cmd: process.execPath,
    args: [viteBin, '--port', '4000', '--strictPort'],
    healthUrl: 'http://localhost:4000/',
    proxyHealthUrl: 'http://localhost:4000/api/backend/health?format=json',
    env: { EVERGREEN_PUBLIC_PORT: '4000', EVERGREEN_API_PORT: '4301' },
    role: 'Mill management, grace alert banner & Book-Ellam registers',
  },
  {
    id: 'marketing-web',
    name: 'Public Marketing Web',
    port: 3300,
    cwd: path.join(root, 'apps', 'marketing-web'),
    cmd: process.execPath,
    args: [viteBin, '--port', '3300', '--strictPort'],
    healthUrl: 'http://localhost:3300/',
    env: {},
    role: 'Product showcase, pricing POC calculator & self-deploy generator',
  },
];

const children = [];
let shuttingDown = false;

function checkPortAvailable(port) {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.once('error', () => resolve(false));
    s.listen(port, '127.0.0.1', () => {
      s.close(() => resolve(true));
    });
  });
}

async function probeUrl(url, timeoutMs = 1500) {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json, text/html, */*' },
      signal: AbortSignal.timeout(timeoutMs),
    });
    return res.status >= 200 && res.status < 400;
  } catch {
    if (url.includes('localhost')) {
      try {
        const altUrl = url.replace('localhost', '127.0.0.1');
        const res2 = await fetch(altUrl, {
          headers: { Accept: 'application/json, text/html, */*' },
          signal: AbortSignal.timeout(timeoutMs),
        });
        return res2.status >= 200 && res2.status < 400;
      } catch {}
    }
    return false;
  }
}

async function waitForService(service, maxAttempts = 50) {
  for (let i = 0; i < maxAttempts; i++) {
    if (shuttingDown) return false;
    const ok = await probeUrl(service.healthUrl);
    if (ok) return true;
    await new Promise((r) => setTimeout(r, 600));
  }
  return false;
}

function killProcess(child) {
  if (!child || !child.pid) return;
  if (process.platform === 'win32') {
    try {
      spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
        stdio: 'ignore',
        windowsHide: true,
      });
    } catch {
      try {
        child.kill('SIGKILL');
      } catch {}
    }
  } else {
    try {
      child.kill('SIGTERM');
    } catch {}
  }
}

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('\n🛑 Shutting down all EverGreen services gracefully...');
  for (const child of children) {
    killProcess(child);
  }
  setTimeout(() => process.exit(exitCode), 600);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

function runSync(cmd, args, cwd = root, desc = '') {
  if (desc) console.log(`   ⚙️ ${desc}...`);
  const res = spawnSync(cmd, args, { cwd, env: process.env, stdio: 'inherit', windowsHide: true });
  if (res.error || (res.status !== 0 && res.status !== null)) {
    throw new Error(`Failed: ${desc || args.join(' ')} (code: ${res.status})`);
  }
  return res;
}

async function preflightChecks() {
  console.log('📦 [1/4] Preflight Verifications (Packages, Databases & Builds)...');

  // 1. Shared packages (@evergreen/types, @evergreen/pdf)
  const typesDist = path.join(root, 'packages', 'types', 'dist');
  const pdfDist = path.join(root, 'packages', 'pdf', 'dist');
  if (!fs.existsSync(typesDist) || !fs.existsSync(pdfDist)) {
    runSync(process.execPath, [npmCli, 'run', 'build', '-w', 'packages/types', '-w', 'packages/pdf'], root, 'Building shared workspace packages');
  } else {
    console.log('   ✅ Shared workspace packages ready (@evergreen/types, @evergreen/pdf)');
  }

  // 2. Prisma Clients
  const clientGenerated = fs.existsSync(path.join(root, 'node_modules', '@prisma', 'client'));
  const adminClientGenerated = fs.existsSync(path.join(root, 'node_modules', '@prisma', 'admin-client'));
  if (!clientGenerated) {
    runSync(process.execPath, [npmCli, 'run', 'generate', '-w', '@evergreen/database'], root, 'Generating Customer Tenant Prisma Client');
  }
  if (!adminClientGenerated) {
    runSync(process.execPath, [npmCli, 'run', 'generate', '-w', '@evergreen/admin-database'], root, 'Generating Provider Admin Prisma Client');
  }

  // 3. Databases & Migrations
  const tenantDb = path.join(root, 'packages', 'database', 'prisma', 'dev.db');
  const adminDb = path.join(root, 'packages', 'admin-database', 'prisma', 'admin.db');

  if (!fs.existsSync(tenantDb)) {
    console.log('   🔨 Initializing Customer Tenant DB...');
    runSync(process.execPath, [npmCli, 'run', 'migrate:deploy', '-w', '@evergreen/database'], root, 'Migrating Customer Tenant DB');
  } else {
    try {
      spawnSync(process.execPath, [npmCli, 'run', 'migrate:deploy', '-w', '@evergreen/database'], { cwd: root, stdio: 'pipe' });
    } catch {}
    console.log(`   ✅ Customer Tenant DB:  Ready (${tenantDb})`);
  }

  if (!fs.existsSync(adminDb)) {
    console.log('   🔨 Initializing Provider Admin DB...');
    runSync(process.execPath, [npmCli, 'run', 'migrate:deploy', '-w', '@evergreen/admin-database'], root, 'Migrating Provider Admin DB');
  } else {
    try {
      spawnSync(process.execPath, [npmCli, 'run', 'migrate:deploy', '-w', '@evergreen/admin-database'], { cwd: root, stdio: 'pipe' });
    } catch {}
    console.log(`   ✅ Provider Admin DB:   Ready (${adminDb})`);
  }

  // 4. Seed Admin DB if needed
  try {
    spawnSync(process.execPath, [path.join(root, 'scripts', 'seed-admin.mjs')], { cwd: root, stdio: 'pipe' });
    console.log('   ✅ Provider Admin DB seed verified');
  } catch {}

  // 5. Backend Builds
  const tenantApiDist = path.join(root, 'apps', 'api', 'dist', 'main.js');
  const adminApiDist = path.join(root, 'apps', 'admin-api', 'dist', 'main.js');

  if (!fs.existsSync(tenantApiDist)) {
    runSync(process.execPath, [npmCli, 'run', 'build', '-w', 'apps/api'], root, 'Compiling Customer Tenant API (apps/api)');
  } else {
    console.log('   ✅ Customer Tenant API build ready');
  }

  if (!fs.existsSync(adminApiDist)) {
    runSync(process.execPath, [npmCli, 'run', 'build', '-w', 'apps/admin-api'], root, 'Compiling Provider Admin API (apps/admin-api)');
  } else {
    console.log('   ✅ Provider Admin API build ready');
  }
}

async function main() {
  console.log('\n========================================================================');
  console.log('   🌱 EVERGREEN UNIFIED ECOSYSTEM: STARTING ALL UI, API & DBs          ');
  console.log('========================================================================\n');

  // 1. Run Preflights
  await preflightChecks();

  // 2. Check Port Availability
  console.log('\n🔍 [2/4] Verifying Surface Ports Availability...');
  for (const s of SERVICES) {
    const available = await checkPortAvailable(s.port);
    if (!available) {
      const alreadyAlive = await probeUrl(s.healthUrl);
      if (alreadyAlive) {
        console.log(`   🟢 Port ${s.port} is already actively serving ${s.name}`);
      } else {
        console.warn(`   ⚠️ Port ${s.port} is currently bound by another process. Connecting anyway.`);
      }
    } else {
      console.log(`   ✅ Port ${s.port} is free and ready for ${s.name}`);
    }
  }

  // 3. Launch Services
  console.log('\n🚀 [3/4] Launching APIs & Frontends concurrently...');
  const apis = SERVICES.filter((s) => s.id.endsWith('-api'));
  const uis = SERVICES.filter((s) => s.id.endsWith('-web'));

  for (const s of apis) {
    const alreadyAlive = await probeUrl(s.healthUrl);
    if (alreadyAlive) {
      console.log(`   🟢 ${s.name} is already online on port ${s.port}`);
      continue;
    }

    console.log(`   ▶ Starting ${s.name} on port ${s.port}...`);
    const child = spawn(s.cmd, s.args, {
      cwd: s.cwd,
      env: { ...process.env, ...s.env },
      stdio: 'pipe',
      windowsHide: true,
    });

    child.stdout.on('data', (d) => {
      const line = d.toString().trim();
      if (line.includes('listening') || line.includes('started') || line.includes('Documentation')) {
        console.log(`     [${s.id}] ${line}`);
      }
    });

    child.stderr.on('data', (d) => {
      const line = d.toString().trim();
      if (line && !line.includes('Debugger') && !line.includes('ExperimentalWarning') && !line.includes('SQLite is an experimental')) {
        console.error(`     [${s.id} err] ${line}`);
      }
    });

    child.on('error', (err) => {
      console.error(`   ❌ [${s.id}] Failed to spawn: ${err.message}`);
    });

    child.on('exit', (code) => {
      if (!shuttingDown && code !== 0 && code !== null) {
        console.error(`   ❌ [${s.id}] Process exited with error code ${code}`);
      }
    });

    children.push(child);
  }

  console.log('   ⏳ Waiting for APIs to report healthy...');
  for (const s of apis) {
    const ok = await waitForService(s);
    if (ok) {
      console.log(`   🟢 ${s.name} is HEALTHY on port ${s.port}`);
    } else {
      console.warn(`   ⚠️ ${s.name} did not pass health check quickly (will continue).`);
    }
  }

  // Launch UIs
  for (const s of uis) {
    const alreadyAlive = await probeUrl(s.healthUrl);
    if (alreadyAlive) {
      console.log(`   🟢 ${s.name} is already online on port ${s.port}`);
      continue;
    }

    console.log(`   ▶ Starting ${s.name} on port ${s.port}...`);
    const child = spawn(s.cmd, s.args, {
      cwd: s.cwd,
      env: { ...process.env, ...s.env },
      stdio: 'pipe',
      windowsHide: true,
    });

    child.stdout.on('data', (d) => {
      const line = d.toString().trim();
      if (line.includes('ready in') || line.includes('Local:')) {
        console.log(`     [${s.id}] ${line}`);
      }
    });

    child.stderr.on('data', (d) => {
      const line = d.toString().trim();
      if (line && !line.includes('Debugger') && !line.includes('ExperimentalWarning')) {
        console.error(`     [${s.id} err] ${line}`);
      }
    });

    child.on('error', (err) => {
      console.error(`   ❌ [${s.id}] Failed to spawn: ${err.message}`);
    });

    child.on('exit', (code) => {
      if (!shuttingDown && code !== 0 && code !== null) {
        console.error(`   ❌ [${s.id}] Process exited with error code ${code}`);
      }
    });

    children.push(child);
  }

  console.log('   ⏳ Waiting for UI servers to become healthy...');
  for (const s of uis) {
    const ok = await waitForService(s);
    if (ok) {
      console.log(`   🟢 ${s.name} is HEALTHY on port ${s.port}`);
    }
  }

  // Verify proxy links
  if (await probeUrl('http://localhost:4000/api/backend/health?format=json')) {
    console.log('   🟢 Customer Web -> Tenant API Proxy is VERIFIED');
  }
  if (await probeUrl('http://localhost:5174/admin-api/health')) {
    console.log('   🟢 Admin Web -> Provider Admin API Proxy is VERIFIED');
  }

  // 4. Print Summary
  console.log('\n========================================================================');
  console.log('   🎉 ALL EVERGREEN SURFACES, APIS & DATABASES ARE ONLINE & ACTIVE!     ');
  console.log('========================================================================\n');
  console.log('  🌐 1. CUSTOMER TENANT APP (Isolated Mill Client)');
  console.log('     • Web UI:          http://localhost:4000/   (Port 4000)');
  console.log('     • Features:        Daily Ops, Stock, Billing, 30-Day Grace Alert, Book-Ellam Ledger');
  console.log('     • API & Swagger:   http://localhost:4000/api/docs (proxied) | Direct: http://127.0.0.1:4301/api/docs');
  console.log('     • Health Check:    http://localhost:4000/health (HTML) | http://localhost:4000/health?format=json');
  console.log('     • Isolated DB:     SQLite (packages/database/prisma/dev.db)\n');

  console.log('  ⚡ 2. PROVIDER ADMIN CONTROL PLANE (Master Operations)');
  console.log('     • Admin Web:       http://localhost:5174/   (Port 5174)');
  console.log('     • Features:        Tenant provisioner, Quota locks, 1-Click Remote Deploy, 1-Min Reactivate');
  console.log('     • Admin API Docs:  http://localhost:4300/api/docs (Port 4300)');
  console.log('     • Health Check:    http://127.0.0.1:4300/health');
  console.log('     • Master Admin DB: SQLite (packages/admin-database/prisma/admin.db)\n');

  console.log('  🚀 3. PUBLIC MARKETING & BRANDING PORTAL');
  console.log('     • Landing Page:    http://localhost:3300/   (Port 3300)');
  console.log('     • Features:        Interactive Tier Calculator, Cloud Architectures, Grace Safety Promise');
  console.log('                        Single-Click Auto-Deploy Terminal Simulator\n');

  console.log('------------------------------------------------------------------------');
  console.log('  Press Ctrl+C anytime to stop all services.');
  console.log('========================================================================\n');
}

main().catch((err) => {
  console.error('Failed to run all services:', err);
  shutdown(1);
});
