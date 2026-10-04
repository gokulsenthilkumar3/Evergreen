// Read-only setup diagnostics: never prints secrets or changes the database.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
let failures = 0;
function check(label, ok, help) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${ok ? '' : ` — ${help}`}`);
  if (!ok) failures++;
}
const [major, minor] = process.versions.node.split('.').map(Number);
check('Node runtime', (major === 20 && minor >= 19) || (major === 22 && minor >= 12) || major > 22, 'Use Node 20.19+ or 22.12+.');
check('Core dependencies installed', ['@nestjs/cli', 'vite', '@prisma/client', 'typescript', 'dotenv'].every(name => fs.existsSync(path.join(root, 'node_modules', name))), 'Run npm install at the repository root.');
const envPath = path.join(root, 'apps', 'api', '.env');
check('API environment file', fs.existsSync(envPath), 'Create apps/api/.env using README.md.');
const dotenvPath = path.join(root, 'node_modules', 'dotenv');
if (fs.existsSync(dotenvPath) && fs.existsSync(envPath)) {
  const { parse } = require(dotenvPath);
  const apiEnv = { ...parse(fs.readFileSync(envPath)), ...process.env };
  check('JWT secret configured', !!apiEnv.JWT_SECRET && apiEnv.JWT_SECRET.length >= 32 && !/replace-with|default-dev-secret/.test(apiEnv.JWT_SECRET), 'Set a unique JWT_SECRET of at least 32 characters.');
  check('Database URL configured', !!apiEnv.DATABASE_URL, 'Set DATABASE_URL consistently for the API and Prisma CLI.');
  const rootEnvPath = path.join(root, '.env');
  if (fs.existsSync(rootEnvPath)) {
    const cliEnv = { ...parse(fs.readFileSync(rootEnvPath)), ...process.env };
    check('API and CLI database URLs agree', cliEnv.DATABASE_URL === apiEnv.DATABASE_URL, 'Align DATABASE_URL in root .env and apps/api/.env.');
  }
}
const ports = [Number(process.env.EVERGREEN_PUBLIC_PORT || 4000), Number(process.env.EVERGREEN_API_PORT || 4301)];
check('Service port configuration', ports.every(port => Number.isInteger(port) && port > 0 && port <= 65535) && ports[0] !== ports[1], 'Choose two distinct ports between 1 and 65535.');
console.log('This checks configuration only. npm run dev checks port availability and API health. It does not initialize or migrate your database.');
process.exitCode = failures ? 1 : 0;
