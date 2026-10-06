// Read-only source inventory; this does not execute source applications or import business data.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const base = path.join(root, 'backups/source_projects_archive');
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', '.next', '.turbo'].includes(entry.name)) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(absolute); else files.push(absolute);
  }
}
walk(base);
const owners = [
  [/procurement|suppliers|raw-materials|\bgrn\b|\bpo\b/, 'Inward + Business flows: purchases, supplier settlement'],
  [/manufacturing|production|finished-goods/, 'Production + Business flows: WIP and transformation'],
  [/warehouse|inventory|reconciliation/, 'Inventory + Warehouse + lot ledger'],
  [/quality/, 'Quality inspections + stock holds'],
  [/customers|customer-portal|\bar\b|sales|billing|invoice|products|payment/, 'Business Desk + shop + returns and credit allocation'],
  [/\bap\b|budget/, 'Business flows: payable journals; budget planning needs separate acceptance'],
  [/hr/, 'Staff, shifts, payroll + accounting projection'],
  [/auth|users|admin|session|settings/, 'EverGreen auth, users, sessions and settings'],
  [/report|dashboard|forecast/, 'EverGreen reports; compare source-specific calculations'],
];
const rows = [], models = [], databases = [];
for (const file of files) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  if (/\.(db|sqlite|sqlite3)$/i.test(file)) databases.push(relative);
  if (path.basename(file) === 'schema.prisma') for (const m of fs.readFileSync(file, 'utf8').matchAll(/^model\s+(\w+)/gm)) models.push({ file: relative, model: m[1] });
  if (!/\.(ts|tsx|js|jsx)$/i.test(file) || !/(routes?|App|page)\.(ts|tsx|js|jsx)$/i.test(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  const owner = owners.find(([pattern]) => pattern.test(relative))?.[1] || 'Source-specific function: retain and review; no merger parity claim';
  for (const match of text.matchAll(/\b(?:router|app|fastify|server|\w+Router)\.(get|post|put|patch|delete)\(\s*['"]([^'"]+)['"]/g)) rows.push({ file: relative, method: match[1].toUpperCase(), route: match[2], owner });
  for (const match of text.matchAll(/<Route\s+path=["']([^"']+)["']/g)) rows.push({ file: relative, method: 'SCREEN', route: match[1], owner });
  if (/\/app\/.*\/(page|route)\.tsx?$/.test(relative)) {
    const localRoute = '/' + relative.split('/app/').pop().replace(/\/(page|route)\.tsx?$/, '').replace(/\([^/]+\)\//g, '').replace(/\[([^\]]+)\]/g, ':$1');
    if (/\/page\.tsx?$/.test(relative)) rows.push({ file: relative, method: 'SCREEN', route: localRoute, owner });
    for (const match of text.matchAll(/export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)\b/g)) rows.push({ file: relative, method: match[1], route: localRoute, owner });
  }
}
const escape = text => text.replaceAll('|', '\\|').replaceAll('\n', ' ');
const output = ['# Source function inventory', '', 'Generated from retained reference code. Each row is a discovered route/screen and a destination for review, not proof of equivalent behavior. Mount prefixes, external services and source-specific policies still require comparison. No source application was executed and no business data was imported.', '', `Discovered ${rows.length} routes/screens, ${models.length} Prisma models and ${databases.length} SQLite snapshots. External PostgreSQL/hosted databases and browser storage are outside this local file inventory.`, '', '## Routes and screens', '', '| Source file | Action | Local route | Canonical destination / review |', '| --- | --- | --- | --- |', ...rows.map(r => `| ${escape(r.file)} | ${r.method} | ${escape(r.route)} | ${r.owner} |`), '', '## Data contracts', '', '| Source schema | Model |', '| --- | --- |', ...models.map(r => `| ${r.file} | ${r.model} |`), '', '## Local database snapshots', '', ...(databases.length ? databases.map(d => `- ${d}`) : ['No SQLite snapshot was found in the retained reference-project folders. Supply real source exports before reconciling external business data.']), '', 'Reference folders are preserved. Removal and release acceptance are separate from implementation.'];
fs.writeFileSync(path.join(root, 'docs/SOURCE_FUNCTION_INVENTORY.md'), output.join('\n') + '\n');
console.log(JSON.stringify({ routeCount: rows.length, modelCount: models.length, localDatabaseSnapshots: databases.length, report: 'docs/SOURCE_FUNCTION_INVENTORY.md' }));
