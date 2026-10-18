const { test } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { createUpdater } = require('./updater.cjs');

function fixture(overrides = {}) {
  const calls = [];
  const updater = Object.assign(new EventEmitter(), {
    checkForUpdates: async () => { calls.push('check'); return { isUpdateAvailable: true, updateInfo: { version: '1.0.1' } }; },
    downloadUpdate: async () => { calls.push('download'); },
    quitAndInstall: () => calls.push('install'),
  }, overrides);
  const dialogs = [];
  const dialog = { showMessageBox: async options => { dialogs.push(options); return { response: 0 }; } };
  return { updater, calls, dialogs, dialog };
}

test('download completes and a verified backup precedes installation', async () => {
  const f = fixture();
  const check = createUpdater({ ...f, enabled: true, prepare: async () => f.calls.push('backup') });
  await check();
  assert.deepEqual(f.calls, ['check', 'download', 'backup', 'install']);
  assert.equal(f.updater.autoInstallOnAppQuit, false);
  assert.equal(f.updater.allowDowngrade, false);
});
test('failed download leaves the running service alone', async () => {
  const f = fixture({ downloadUpdate: async () => { throw new Error('https://private.example/credential'); } });
  const check = createUpdater({ ...f, enabled: true, prepare: async () => f.calls.push('backup') });
  await check();
  assert.deepEqual(f.calls, ['check']);
  assert.ok(!JSON.stringify(f.dialogs).includes('private.example'));
});
test('failed backup prevents installation and recovers the service', async () => {
  const f = fixture();
  const check = createUpdater({ ...f, enabled: true,
    prepare: async () => { throw new Error('Snapshot failed'); }, recover: () => f.calls.push('recover') });
  await check();
  assert.deepEqual(f.calls, ['check', 'download', 'recover']);
});
test('disabled feed never makes an update request', async () => {
  const f = fixture();
  await createUpdater({ ...f, enabled: false, prepare: async () => {} })();
  assert.deepEqual(f.calls, []);
});
test('concurrent checks share one pending operation', async () => {
  let complete;
  const f = fixture({ checkForUpdates: () => new Promise(resolve => { complete = resolve; }) });
  const check = createUpdater({ ...f, enabled: true, prepare: async () => {} });
  const first = check();
  await check();
  complete({ isUpdateAvailable: false });
  await first;
  assert.equal(f.dialogs.length, 1);
});
test('deferring an update performs no download or backup', async () => {
  const f = fixture();
  f.dialog.showMessageBox = async () => ({ response: 1 });
  await createUpdater({ ...f, enabled: true, prepare: async () => f.calls.push('backup') })();
  assert.deepEqual(f.calls, ['check']);
});
