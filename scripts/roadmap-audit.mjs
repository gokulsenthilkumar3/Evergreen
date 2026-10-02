import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const has = (path) => existsSync(join(root, path));
const text = (path) => has(path) ? readFileSync(join(root, path), 'utf8') : '';
const contains = (path, pattern) => pattern.test(text(path));
const containsTree = (path, pattern) => {
  const absolute = join(root, path);
  if (!existsSync(absolute)) return false;
  return readdirSync(absolute, { recursive: true })
    .map((entry) => join(absolute, String(entry)))
    .filter((entry) => statSync(entry).isFile())
    .some((entry) => pattern.test(readFileSync(entry, 'utf8')));
};
const packageHas = (path, dependency) => {
  if (!has(path)) return false;
  const pkg = JSON.parse(text(path));
  return Boolean(pkg.dependencies?.[dependency] || pkg.devDependencies?.[dependency]);
};

const refs = [
  ['Noolstitch', 'noolstitch'],
  ['Weave', 'Weave/weave'],
  ['MSME ERP', 'MSME ERP/msme-micro-erp'],
  ['Invoice Generator', 'Invoice Generator'],
  ['Yarn Management', 'Yarn/Yarn-Management'],
];
const referenceRows = refs.map(([name, path]) => ({ name, path, retained: has(path) }));

const phases = [
  {
    phase: 'Phase 0 — Foundation & Safety',
    status: 'PARTIAL',
    evidence: [
      ['API Jest infrastructure and smoke/security tests', has('apps/api/src/app.controller.spec.ts') && has('apps/api/src/guards/access-control.spec.ts')],
      ['Auth, catalogue, invoice and session smoke tests', has('apps/api/src/connected-modules.smoke.spec.ts')],
      ['Web Vitest component-test infrastructure', packageHas('apps/web/package.json', 'vitest')],
      ['Tracked SQLite backup/snapshot manifest', has('BACKUP_MANIFEST.md')],
      ['Reference projects retained', referenceRows.every((row) => row.retained)],
    ],
    gate: 'Builds pass in CI and connected modules have automated smoke tests; an external backup manifest and approved snapshot tag still need evidence.',
  },
  {
    phase: 'Phase 1 — Core Business Logic',
    status: 'PARTIAL',
    evidence: [
      ['Canonical yarn counts declared', contains('packages/types/index.ts', /YARN_COUNTS\s*=\s*\[["']2["'],\s*["']4["'],\s*["']6["'],\s*["']8["'],\s*["']10["']\]/)],
      ['remainingLog persisted', contains('packages/database/prisma/schema.prisma', /remainingLog\s+Float/)],
      ['Costing rate settings persisted', contains('packages/database/prisma/schema.prisma', /maintenanceRate[\s\S]*ebRate[\s\S]*packageRate/)],
      ["Today's dashboard exists", has('apps/web/src/pages/TodayDashboard.tsx') && has('apps/api/src/modules/dashboard/dashboard.controller.ts')],
      ['End-to-end no-mock inward → dashboard evidence', false],
    ],
    gate: 'The complete live-data walkthrough and reconciliation evidence remain outstanding.',
  },
  {
    phase: 'Phase 2 — Users, RBAC & Sessions',
    status: 'PARTIAL',
    evidence: [
      ['Canonical VIEWER/MODIFIER/ADMIN role hierarchy', contains('apps/api/src/utils/roles.ts', /ADMIN[\s\S]*MODIFIER[\s\S]*VIEWER/)],
      ['Admin user management UI/API', has('apps/web/src/pages/UserManagement.tsx') && has('apps/api/src/modules/users/users.controller.ts')],
      ['Session persistence and revocation', contains('packages/database/prisma/schema.prisma', /model Session/) && has('apps/api/src/modules/sessions/sessions.service.ts')],
      ['Session IP and user-agent capture', contains('apps/api/src/modules/auth/auth.service.ts', /ipAddress[\s\S]*userAgent/)],
      ['IP geolocation integration', containsTree('apps/api/src', /ip-api\.com|ipapi\./)],
    ],
    gate: 'Role tests exist; location enrichment and full browser role-matrix evidence are still pending.',
  },
  {
    phase: 'Phase 3 — Reference Absorption',
    status: 'PARTIAL',
    evidence: [
      ['Invoice totals centralized and duplicate designer hidden', packageHas('apps/api/package.json', '@evergreen/pdf') && !contains('apps/web/src/App.tsx', /page: 'invoicegen'/)],
      ['Tamil/English toggle and customer ledger UI', contains('apps/web/src/App.tsx', /setLanguage/) && has('apps/web/src/pages/MsmeErp.tsx')],
      ['Public Weave shop and checkout API', has('apps/web/src/pages/ShopPortal.tsx') && has('apps/api/src/modules/commerce/storefront.service.ts')],
      ['Noolstitch job-work canonical module', has('apps/api/src/modules/jobwork/jobwork.service.ts')],
      ['Persisted warehouse, machine, QC and HR models', contains('packages/database/prisma/schema.prisma', /model WarehouseLocation/) && contains('packages/database/prisma/schema.prisma', /model Machine/)],
      ['All five parity gates accepted', false],
    ],
    gate: 'Action-level acceptance is incomplete, and missing reference directories must be restored or formally accounted for before parity can be evaluated.',
  },
  {
    phase: 'Phase 4 — Advanced Auth & Notifications',
    status: 'PARTIAL',
    evidence: [
      ['TOTP backend and settings UI', packageHas('apps/api/package.json', 'otplib') && has('apps/web/src/pages/SecuritySettings.tsx')],
      ['WebAuthn backend and browser dependencies', packageHas('apps/api/package.json', '@simplewebauthn/server') && packageHas('apps/web/package.json', '@simplewebauthn/browser')],
      ['Daily-summary template', has('packages/email/src/index.ts')],
      ['Scheduled 23:59 IST email delivery', packageHas('apps/api/package.json', '@nestjs/schedule') && containsTree('apps/api/src', /23:59|59 23/)],
    ],
    gate: 'Authenticator/passkey live-device QA and scheduled email delivery evidence are outstanding.',
  },
  {
    phase: 'Phase 5 — Database & Production Hardening',
    status: 'NOT READY',
    evidence: [
      ['PostgreSQL service defined', contains('docker-compose.yml', /postgres:/)],
      ['Prisma uses PostgreSQL', contains('packages/database/prisma/schema.prisma', /provider\s*=\s*"postgresql"/)],
      ['Public/API production ports documented', contains('.env.production', /EVERGREEN_PUBLIC_PORT=4000/) && contains('.env.production', /EVERGREEN_API_PORT=4301/)],
      ['SQLite → PostgreSQL reconciliation manifest', has('POSTGRES_RECONCILIATION.md')],
    ],
    gate: 'SQLite remains canonical; no production cutover or reconciliation evidence exists.',
  },
  {
    phase: 'Phase 6 — Archive & Cleanup',
    status: 'BLOCKED BY GATES',
    evidence: referenceRows.map((row) => [`${row.name} source retained`, row.retained]),
    gate: 'Blocked: three expected reference directories are absent, and there is no parity evidence or written retirement acceptance.',
  },
];

const icon = (value) => value ? '✅' : '❌';
const lines = [
  '# EverGreen master-plan audit', '',
  'Generated from the current checkout by `npm run audit:roadmap`.', '',
  '> This report records repository evidence, not manual QA or production acceptance. A present page is not considered parity.', '',
  '## Executive status', '',
  '| Phase | Status | Evidence passed |', '| --- | --- | --- |',
  ...phases.map((phase) => `| ${phase.phase} | **${phase.status}** | ${phase.evidence.filter(([, ok]) => ok).length}/${phase.evidence.length} |`),
  '', '## Detailed gates', '',
];
for (const phase of phases) {
  lines.push(`### ${phase.phase}`, '', `**Status: ${phase.status}**`, '');
  for (const [label, ok] of phase.evidence) lines.push(`- ${icon(ok)} ${label}`);
  lines.push('', `**Gate assessment:** ${phase.gate}`, '');
}
lines.push('## Reference-folder safety check', '', '| Reference | Path | Retained |', '| --- | --- | --- |',
  ...referenceRows.map((row) => `| ${row.name} | \`${row.path}/\` | ${row.retained ? 'Yes' : 'NO — investigate'} |`), '',
  '**Archive decision:** No reference folder is eligible for deletion based on current repository evidence.', '');
writeFileSync(join(root, 'MASTER_PLAN_AUDIT.md'), `${lines.join('\n')}\n`);

const incomplete = phases.filter((phase) => phase.status !== 'COMPLETE').length;
console.log(`Roadmap audit written: ${phases.length} phases checked, ${incomplete} incomplete.`);
