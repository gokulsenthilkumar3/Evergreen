#!/usr/bin/env node

/**
 * EverGreen Solo Operator Ops Cockpit
 * Designed for single-handed management of all three platform surfaces:
 * 1. Customer Tenant App (apps/web + apps/api)
 * 2. Provider Admin Control Plane (apps/admin-web + apps/admin-api)
 * 3. Public Product & Marketing Portal (apps/marketing-web)
 */

import { execSync } from 'child_process';
import http from 'http';

const PORTS = {
  TENANT_API: 4301,
  TENANT_WEB: 4000,
  ADMIN_API: 4300,
  ADMIN_WEB: 5174,
  MARKETING_WEB: 3300,
};

function printBanner() {
  console.log('\n================================================================');
  console.log('   🌱 EverGreen Solo Operator Ops Cockpit (All 3 Projects)     ');
  console.log('================================================================\n');
}

async function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, (res) => {
      resolve({ online: true, status: res.statusCode });
    });
    req.on('error', () => {
      resolve({ online: false });
    });
    req.setTimeout(800, () => {
      req.destroy();
      resolve({ online: false });
    });
  });
}

async function showStatus() {
  printBanner();
  console.log('Checking platform surface health...\n');

  const surfaces = [
    { name: '1. Customer Tenant API   ', port: PORTS.TENANT_API, role: 'Business logic & local SQLite DB' },
    { name: '   Customer Tenant Web   ', port: PORTS.TENANT_WEB, role: 'Operations, Billing & Book-Ellam' },
    { name: '2. Provider Admin API    ', port: PORTS.ADMIN_API, role: 'Central licensing & telemetry' },
    { name: '   Provider Admin Web    ', port: PORTS.ADMIN_WEB, role: 'Contract quotas & remote actions' },
    { name: '3. Public Marketing Web  ', port: PORTS.MARKETING_WEB, role: 'Product branding & pricing POC' },
  ];

  for (const s of surfaces) {
    const res = await checkPort(s.port);
    const badge = res.online ? '🟢 ONLINE ' : '⚪ STOPPED';
    console.log(`[${badge}] ${s.name} : Port ${s.port} (${s.role})`);
  }

  console.log('\n----------------------------------------------------------------');
  console.log('Quick Solo Operator Shortcuts:');
  console.log('  node scripts/solo-ops.mjs --status       Check live connectivity');
  console.log('  node scripts/solo-ops.mjs --migrate      Run all DB migrations');
  console.log('  node scripts/solo-ops.mjs --reactivate <id> Instant 1-min reactivation');
  console.log('----------------------------------------------------------------\n');
}

async function reactivateTenant(companyId) {
  printBanner();
  if (!companyId) {
    console.error('❌ Error: Please specify company ID (e.g. node scripts/solo-ops.mjs --reactivate demo-company-1)');
    process.exit(1);
  }

  console.log(`⚡ Sending 1-Minute Reactivation for company: ${companyId}...`);
  try {
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    const payload = JSON.stringify({
      status: 'ACTIVE',
      expiresAt: expiry.toISOString(),
      graceExpiresAt: null,
    });

    const res = await fetch(`http://localhost:4300/companies/${companyId}/license`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });

    if (res.ok) {
      console.log(`✅ Success: Company ${companyId} is now ACTIVE!`);
      console.log(`📅 Valid Until: ${expiry.toLocaleDateString()}`);
      console.log('⚡ Tenant will reflect this on its next hourly sync (or immediate sync trigger).\n');
    } else {
      console.error(`❌ Admin API returned HTTP ${res.status}`);
    }
  } catch (e) {
    console.error('❌ Failed to connect to Admin API at http://localhost:4300. Ensure admin-api is running.');
  }
}

async function runMigrations() {
  printBanner();
  console.log('🔄 Applying schema migrations across both databases...\n');
  try {
    console.log('1/2 Migrating Admin Database (@evergreen/admin-database)...');
    execSync('npx prisma db push --schema=prisma/schema.prisma --accept-data-loss', {
      cwd: 'packages/admin-database',
      stdio: 'inherit',
    });
    console.log('\n2/2 Migrating Customer Tenant Database (@evergreen/database)...');
    execSync('npx prisma db push --schema=prisma/schema.prisma --accept-data-loss', {
      cwd: 'packages/database',
      stdio: 'inherit',
    });
    console.log('\n✅ All schemas and databases are 100% in sync!\n');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  }
}

// CLI Argument router
const args = process.argv.slice(2);
const command = args[0] || '--status';

if (command === '--reactivate') {
  reactivateTenant(args[1]);
} else if (command === '--migrate') {
  runMigrations();
} else {
  showStatus();
}
