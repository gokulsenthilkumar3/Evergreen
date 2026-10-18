import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { deploy, parseOptions, createEnvironment, readEnvironment, runDocker } from './deploy.mjs';
import { httpClient, readBusiness, seedBusiness } from './smoke-business.mjs';

const stateDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'evergreen-container-smoke-'));
const project = `release-smoke-${randomUUID().slice(0, 8)}`;
const prefix = process.env.EVERGREEN_TEST_IMAGE_PREFIX || 'evergreen-release-test';
const all = process.argv.includes('--all');
process.env.EVERGREEN_IMAGE_PREFIX = prefix;
let installed;
function docker(args) {
  const result = spawnSync('docker', args, { stdio: 'inherit', windowsHide: true });
  if (result.error || result.status !== 0) throw new Error('Disposable Docker test operation failed');
}
async function freePort() {
  const server = net.createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}
try {
  const envFile = path.join(stateDirectory, 'installation.env');
  createEnvironment(envFile);
  const port = await freePort();
  fs.appendFileSync(envFile, `EVERGREEN_PUBLIC_PORT=${port}\nEVERGREEN_PROVIDER_PORT=${await freePort()}\nEVERGREEN_MARKETING_PORT=${await freePort()}\n`);
  const env = readEnvironment(envFile);
  const options = (command, release) => parseOptions([command, '--project', project, '--state', stateDirectory, '--release', release, ...(all ? ['--all'] : [])]);
  installed = await deploy(options('install', 'r1'), (args, state) => {
    if (process.argv.includes('--no-build') && args.includes('build')) return;
    return runDocker(args, state);
  });
  const account = { username: env.BOOTSTRAP_ADMIN_USERNAME, password: env.BOOTSTRAP_ADMIN_PASSWORD };
  const origin = `http://127.0.0.1:${port}`;
  const before = await seedBusiness(httpClient(origin), account);
  const targets = all ? ['tenant-api', 'tenant-web', 'admin-api', 'admin-web', 'marketing-web'] : ['tenant-api', 'tenant-web'];
  for (const target of targets) docker(['image', 'tag', `${prefix}/${target}:r1`, `${prefix}/${target}:r2`]);
  installed = await deploy(options('update', 'r2'), (args, state) => args.includes('build') ? undefined : runDocker(args, state));
  const upgraded = httpClient(origin);
  await upgraded('POST', '/auth/login', account);
  assert.deepEqual(await readBusiness(upgraded), before);
  const broken = path.join(stateDirectory, 'Dockerfile.failed');
  fs.writeFileSync(broken, `FROM ${prefix}/tenant-api:r1\nCMD ["node", "-e", "process.exit(42)"]\n`);
  docker(['build', '--tag', `${prefix}/tenant-api:r3`, '--file', broken, stateDirectory]);
  for (const target of targets.filter(target => target !== 'tenant-api')) docker(['image', 'tag', `${prefix}/${target}:r1`, `${prefix}/${target}:r3`]);
  await assert.rejects(deploy(options('update', 'r3'), (args, state) => {
    if (args.includes('build')) return;
    const bounded = [...args];
    if (state.release === 'r3' && bounded.includes('--wait-timeout')) bounded[bounded.indexOf('--wait-timeout') + 1] = '12';
    return runDocker(bounded, state);
  }), /previous database/i);
  const recovered = httpClient(origin);
  await recovered('POST', '/auth/login', account);
  assert.deepEqual(await readBusiness(recovered), before);
  assert.equal(JSON.parse(fs.readFileSync(path.join(stateDirectory, 'state.json'), 'utf8')).release, 'r2');
  console.log('Container acceptance passed: clean install, persisted stock/invoice/payment, upgrade and failed-update rollback.');
} finally {
  // These volumes contain only records created above; never select an existing installation.
  const state = installed || (fs.existsSync(path.join(stateDirectory, 'state.json')) ? JSON.parse(fs.readFileSync(path.join(stateDirectory, 'state.json'), 'utf8')) :
    fs.existsSync(path.join(stateDirectory, 'pending.json')) ? JSON.parse(fs.readFileSync(path.join(stateDirectory, 'pending.json'), 'utf8')).next : null);
  if (state) {
    assert.ok(state.engineProject.startsWith(project + '-'));
    runDocker(['compose', '--project-name', state.engineProject, '--env-file', path.join(stateDirectory, 'installation.env'), '-f', path.resolve('deploy/docker/compose.yml'), '--profile', 'provider', '--profile', 'marketing', 'down', '--volumes', '--remove-orphans'], state);
  }
  assert.equal(path.dirname(path.resolve(stateDirectory)), path.resolve(os.tmpdir()));
  fs.rmSync(stateDirectory, { recursive: true });
}
