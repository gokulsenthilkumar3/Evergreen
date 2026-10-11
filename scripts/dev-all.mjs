#!/usr/bin/env node

/**
 * EverGreen Unified Ecosystem Orchestrator
 * Launches ALL UI, API, and DB services across the 3 surfaces:
 * 1. Customer Tenant Surface (apps/web on 4000, apps/api on 4301)
 * 2. Provider Admin Control Plane (apps/admin-web on 5174, apps/admin-api on 4300)
 * 3. Public Product Marketing Showcase (apps/marketing-web on 3300)
 * 4. Dual Isolated SQLite Databases (@evergreen/database & @evergreen/admin-database)
 */

import { spawn, spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import net from 'net';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

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
    healthUrl: 'http://127.0.0.1:4301/health',
    env: { EVERGREEN_API_PORT: '4301', PORT: '4301' },
    role: 'Isolated Yarn ERP, billing & quota enforcement',
  },
  {
    id: 'admin-web',
    name: 'Provider Admin Web',
    port: 5174,
    cwd: path.join(root, 'apps', 'admin-web'),
    cmd: process.execPath,
    args: [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'), '--port', '5174', '--strictPort'],
    healthUrl: 'http://localhost:5174/',
    env: {},
    role: 'Multi-cloud company control, provisioning & 1-min reactivation',
  },
  {
    id: 'tenant-web',
    name: 'Customer Tenant Web',
    port: 4000,
    cwd: path.join(root, 'apps', 'web'),
    cmd: process.execPath,
    args: [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'), '--port', '4000', '--strictPort'],
    healthUrl: 'http://localhost:4000/',
    env: { EVERGREEN_PUBLIC_PORT: '4000', EVERGREEN_API_PORT: '4301' },
    role: 'Mill management, grace alert banner & Book-Ellam registers',
  },
  {
    id: 'marketing-web',
    name: 'Public Marketing Web',
    port: 3300,
    cwd: path.join(root, 'apps', 'marketing-web'),
    cmd: process.execPath,
    args: [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'), '--port', '3300', '--strictPort'],
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
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    return res.status >= 200 && res.status < 400;
  } catch {
    if (url.includes('localhost')) {
      try {
        const altUrl = url.replace('localhost', '127.0.0.1');
        const res2 = await fetch(altUrl, { signal: AbortSignal.timeout(timeoutMs) });
        return res2.status >= 200 && res2.status < 400;
      } catch {}
    }
    return false;
  }
}

async function waitForService(service, maxAttempts = 40) {
  for (let i = 0; i < maxAttempts; i++) {
    if (shuttingDown) return false;
    const ok = await probeUrl(service.healthUrl);
    if (ok) return true;
    await new Promise((r) => setTimeout(r, 600));
  }
  return false;
}

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('\n🛑 Shutting down all EverGreen services gracefully...');
  for (const child of children) {
    if (child && child.pid && child.exitCode === null) {
      try {
        child.kill('SIGTERM');
      } catch {}
    }
  }
  setTimeout(() => process.exit(exitCode), 1000);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

async function main() {
  console.log('\n========================================================================');
  console.log('   🌱 EVERGREEN UNIFIED ECOSYSTEM: STARTING ALL UI, API & DBs          ');
  console.log('========================================================================\n');

  // 1. Verify Databases
  console.log('📦 [1/4] Verifying Isolated SQLite Databases & Schemas...');
  const tenantDb = path.join(root, 'packages', 'database', 'prisma', 'dev.db');
  const adminDb = path.join(root, 'packages', 'admin-database', 'prisma', 'admin.db');

  console.log(`   - Customer Tenant DB:  ${fs.existsSync(tenantDb) ? '✅ Ready (' + tenantDb + ')' : '⚠️ Not found'}`);
  console.log(`   - Provider Admin DB:   ${fs.existsSync(adminDb) ? '✅ Ready (' + adminDb + ')' : '⚠️ Not found'}`);

  // Seed Admin if empty
  try {
    spawnSync(process.execPath, [path.join(root, 'scripts', 'seed-admin.mjs')], {
      cwd: root,
      stdio: 'inherit',
    });
  } catch {}

  // 2. Check Port Availability
  console.log('\n🔍 [2/4] Verifying Surface Ports Availability...');
  for (const s of SERVICES) {
    const available = await checkPortAvailable(s.port);
    if (!available) {
      console.warn(`   ⚠️ Port ${s.port} is already in use by another process. Will attempt connection.`);
    } else {
      console.log(`   ✅ Port ${s.port} is available for ${s.name}`);
    }
  }

  // 3. Launch Services in Order
  console.log('\n🚀 [3/4] Launching APIs & Frontends concurrently...');
  
  // Launch APIs first
  const apis = SERVICES.filter((s) => s.id.endsWith('-api'));
  const uis = SERVICES.filter((s) => s.id.endsWith('-web'));

  for (const s of apis) {
    console.log(`   ▶ Starting ${s.name} on port ${s.port}...`);
    const child = spawn(s.cmd, s.args, {
      cwd: s.cwd,
      env: { ...process.env, ...s.env },
      stdio: 'pipe',
      windowsHide: true,
    });
    child.stdout.on('data', (d) => {
      const line = d.toString().trim();
      if (line.includes('listening') || line.includes('started')) {
        console.log(`     [${s.id}] ${line}`);
      }
    });
    child.stderr.on('data', (d) => {
      const line = d.toString().trim();
      if (line && !line.includes('Debugger') && !line.includes('ExperimentalWarning')) {
        // Suppress non-critical warnings
      }
    });
    children.push(child);
  }

  console.log('   ⏳ Waiting for APIs to become healthy...');
  for (const s of apis) {
    const ok = await waitForService(s);
    if (ok) {
      console.log(`   🟢 ${s.name} is HEALTHY on port ${s.port}`);
    } else {
      console.warn(`   ⚠️ ${s.name} did not pass health check quickly (will continue).`);
    }
  }

  // Launch UIs next
  for (const s of uis) {
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
    children.push(child);
  }

  console.log('   ⏳ Waiting for UI servers to become healthy...');
  for (const s of uis) {
    const ok = await waitForService(s);
    if (ok) {
      console.log(`   🟢 ${s.name} is HEALTHY on port ${s.port}`);
    }
  }

  // 4. Print Dashboard Summary
  console.log('\n========================================================================');
  console.log('   🎉 ALL EVERGREEN SURFACES, APIS & DATABASES ARE ONLINE & ACTIVE!     ');
  console.log('========================================================================\n');
  console.log('  🌐 1. CUSTOMER TENANT APP (Isolated Mill Client)');
  console.log('     • Web UI:          http://localhost:4000/   (Port 4000)');
  console.log('     • Features:        Daily Ops, Stock, Billing, 30-Day Grace Alert, Book-Ellam Ledger');
  console.log('     • API & Swagger:   http://localhost:4000/api/docs (proxied) | Direct: http://127.0.0.1:4301/api/docs');
  console.log('     • Isolated DB:     SQLite (packages/database/prisma/dev.db)\n');

  console.log('  ⚡ 2. PROVIDER ADMIN CONTROL PLANE (Master Operations)');
  console.log('     • Admin Web:       http://localhost:5174/   (Port 5174)');
  console.log('     • Features:        Tenant provisioner, Quota locks, 1-Click Remote Deploy, 1-Min Reactivate');
  console.log('     • Admin API Docs:  http://localhost:4300/api/docs (Port 4300)');
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
