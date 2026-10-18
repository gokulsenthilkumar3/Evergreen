import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { deploy, parseOptions, createEnvironment } from './deploy.mjs';

test('workflow rejects checkout-owned installation state before any Docker operation', () => {
  const result = spawnSync(process.execPath, ['scripts/release/workflow-deploy.mjs'], {
    encoding: 'utf8', windowsHide: true,
    env: { ...process.env, TARGET: 'test', RELEASE_SHA: 'a'.repeat(40), STATE_DIRECTORY: path.resolve('.evergreen/unsafe-workflow-state') },
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /state must be outside the checkout/);
  assert.equal(fs.existsSync('.evergreen/unsafe-workflow-state'), false);
});

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'evergreen-release-'));
  t.after(() => { assert.equal(path.dirname(path.resolve(dir)), path.resolve(os.tmpdir())); fs.rmSync(dir, { recursive: true }); });
  const options = command => parseOptions([command, '--project', 'fixture', '--state', dir, '--release', command === 'install' ? 'revision-1' : 'revision-2']);
  return { dir, options, read: name => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8')) };
}

test('installation secrets survive reruns and the bootstrap password fits login limits', t => {
  const f = fixture(t), file = path.join(f.dir, 'installation.env');
  assert.equal(createEnvironment(file), true);
  const initial = fs.readFileSync(file, 'utf8');
  assert.equal(createEnvironment(file), false);
  assert.equal(fs.readFileSync(file, 'utf8'), initial);
  const password = /^BOOTSTRAP_ADMIN_PASSWORD=(.+)$/m.exec(initial)[1];
  assert.ok(password.length >= 12 && Buffer.byteLength(password) <= 72);
});
test('update snapshots into a distinct database before starting the new API', async t => {
  const f = fixture(t), calls = [];
  await deploy(f.options('install'), async (args, state) => calls.push({ args, state }));
  const previous = f.read('state.json'); calls.length = 0;
  const next = await deploy(f.options('update'), async (args, state) => calls.push({ args, state }));
  assert.notEqual(next.tenantDatabase, previous.tenantDatabase);
  const snapshot = calls.findIndex(call => call.args.includes('snapshot'));
  const start = calls.findIndex(call => call.args.includes('up'));
  assert.ok(snapshot > 0 && start > snapshot);
  assert.ok(calls[snapshot].args.includes(`/data/${previous.tenantDatabase}`));
  assert.ok(calls[snapshot].args.includes(`/data/${next.tenantDatabase}`));
  assert.equal(f.read('state.json').release, 'revision-2');
});
test('failed build leaves the installed version serving without a stop', async t => {
  const f = fixture(t), calls = [];
  await deploy(f.options('install'), async () => {});
  await assert.rejects(deploy(f.options('update'), async args => { calls.push(args); throw new Error('build failed'); }), /build failed/);
  assert.equal(calls.length, 1);
  assert.ok(calls[0].includes('build'));
  assert.equal(f.read('state.json').release, 'revision-1');
});
test('API health failure restores the previous images and database before exposing traffic', async t => {
  const f = fixture(t), calls = [];
  await deploy(f.options('install'), async () => {});
  await assert.rejects(deploy(f.options('update'), async (args, state) => {
    calls.push({ args, state });
    if (state.release === 'revision-2' && args.includes('up')) throw new Error('API failed health');
  }), /previous database/i);
  assert.equal(f.read('state.json').release, 'revision-1');
  assert.equal(fs.existsSync(path.join(f.dir, 'pending.json')), false);
  assert.equal(calls.at(-1).state.release, 'revision-1');
  assert.ok(calls.at(-1).args.includes('up'));
});
test('failure after enabling web traffic retains both generations and blocks blind retries', async t => {
  const f = fixture(t);
  await deploy(f.options('install'), async () => {});
  await assert.rejects(deploy(f.options('update'), async args => {
    if (args.includes('up') && args.at(-1) === 'tenant-web') throw new Error('web health failed');
  }), /reconcile before recovery/);
  assert.equal(f.read('pending.json').phase, 'publishing');
  await assert.rejects(deploy(f.options('update'), async () => assert.fail('must not execute')), /interrupted operation/);
});
test('an operation lock blocks simultaneous updates', async t => {
  const f = fixture(t);
  fs.writeFileSync(path.join(f.dir, 'operation.lock'), 'fixture');
  await assert.rejects(deploy(f.options('install'), async () => assert.fail()), /Another deployment/);
});
test('invalid targets and arguments are rejected before deployment', () => {
  assert.throws(() => parseOptions(['install', '--project', '../other', '--release', '1']), /Project/);
  assert.throws(() => parseOptions(['update', '--release', 'x;command']), /release/);
  assert.throws(() => parseOptions(['update']), /release/);
});
test('separate state directories get distinct Compose projects even when their display slug matches', async t => {
  const first = fixture(t), second = fixture(t);
  const a = await deploy(first.options('install'), async () => {});
  const b = await deploy(second.options('install'), async () => {});
  assert.notEqual(a.engineProject, b.engineProject);
  assert.notEqual(a.tenantDatabase, b.tenantDatabase);
});
