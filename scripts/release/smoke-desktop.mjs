import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { randomBytes } from 'node:crypto';
import { httpClient, readBusiness, seedBusiness } from './smoke-business.mjs';

const stage = path.resolve(process.argv[2] || '');
if (!fs.existsSync(path.join(stage, 'runtime/release-manifest.json'))) throw new Error('Pass the prepared desktop stage directory');
const require = createRequire(import.meta.url);
const runtimeRoot = path.join(stage, 'runtime');
const { migrate, snapshot, databaseUrl } = require(path.join(runtimeRoot, 'scripts/release/database.cjs'));
const { serveWeb, startApi } = require(path.join(stage, 'app/runtime.cjs'));
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'evergreen-desktop-smoke-'));
let api, web;
try {
  const original = path.join(directory, 'original.db'), candidate = path.join(directory, 'candidate.db');
  const account = { username: 'release-smoke', password: randomBytes(24).toString('hex') };
  const secrets = { JWT_SECRET: randomBytes(48).toString('hex'), ENCRYPTION_SECRET: randomBytes(48).toString('hex') };
  await migrate(runtimeRoot, original);
  web = await serveWeb(path.join(stage, 'web'));
  api = await startApi(runtimeRoot, { ...secrets, FRONTEND_URL: web.origin, DATABASE_URL: databaseUrl(original),
    BOOTSTRAP_ADMIN_USERNAME: account.username, BOOTSTRAP_ADMIN_EMAIL: 'release-smoke@example.test', BOOTSTRAP_ADMIN_PASSWORD: account.password });
  web.setApiPort(api.port);
  const request = httpClient(web.origin);
  const before = await seedBusiness(request, account);
  await api.stop(); api = null;
  await snapshot(runtimeRoot, original, candidate);
  await migrate(runtimeRoot, candidate);
  api = await startApi(runtimeRoot, { ...secrets, FRONTEND_URL: web.origin, DATABASE_URL: databaseUrl(candidate),
    BOOTSTRAP_ADMIN_USERNAME: '', BOOTSTRAP_ADMIN_EMAIL: '', BOOTSTRAP_ADMIN_PASSWORD: '' });
  web.setApiPort(api.port);
  const upgraded = httpClient(web.origin);
  await upgraded('POST', '/auth/login', account);
  assert.deepEqual(await readBusiness(upgraded), before);
  console.log('Packaged runtime: clean migration, login, stock, invoice, partial payment, snapshot and upgrade read-back passed.');
} finally {
  if (api) await api.stop();
  if (web) await web.close();
  assert.equal(path.dirname(path.resolve(directory)), path.resolve(os.tmpdir()));
  fs.rmSync(directory, { recursive: true });
}
