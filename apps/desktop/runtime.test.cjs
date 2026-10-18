const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { validateSetup, secretsFor, serveWeb } = require('./runtime.cjs');
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'evergreen-local-web-'));
  t.after(() => { assert.equal(path.dirname(path.resolve(dir)), path.resolve(os.tmpdir())); fs.rmSync(dir, { recursive: true }); });
  return dir;
}
test('setup follows the actual password byte limit and rejects invalid identities', () => {
  assert.equal(validateSetup({ username: 'owner', email: 'owner@example.test', password: 'Long-Password-123' }).username, 'owner');
  assert.throws(() => validateSetup({ username: '../owner', email: 'owner@example.test', password: 'Long-Password-123' }));
  assert.throws(() => validateSetup({ username: 'owner', email: 'owner@example.test', password: '界'.repeat(25) }));
});
test('encrypted installation secrets persist across launches and never store plaintext', t => {
  const directory = fixture(t);
  const safeStorage = { isEncryptionAvailable: () => true, encryptString: text => Buffer.from('encrypted:' + text), decryptString: bytes => bytes.toString().slice(10) };
  const initial = secretsFor(directory, safeStorage);
  assert.deepEqual(secretsFor(directory, safeStorage), initial);
  const saved = fs.readFileSync(path.join(directory, 'secrets.json'), 'utf8');
  assert.ok(!saved.includes(initial.JWT_SECRET) && !saved.includes(initial.ENCRYPTION_SECRET));
});
test('local web serves the SPA and proxies API paths only to the selected loopback API', async t => {
  const dir = fixture(t); fs.writeFileSync(path.join(dir, 'index.html'), '<h1>Local application</h1>');
  const web = await serveWeb(dir);
  const api = http.createServer((req, res) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ path: req.url })); });
  await new Promise(resolve => api.listen(0, '127.0.0.1', resolve));
  try {
    assert.ok((await (await fetch(web.origin + '/inventory')).text()).includes('Local application'));
    assert.equal((await fetch(web.origin + '/health')).status, 503);
    web.setApiPort(api.address().port);
    assert.deepEqual(await (await fetch(web.origin + '/api/backend/auth/me?test=1')).json(), { path: '/auth/me?test=1' });
    const spoofedHostStatus = await new Promise((resolve, reject) => {
      http.get(web.origin + '/health', { headers: { Host: 'other.example' } }, response => { response.resume(); resolve(response.statusCode); }).on('error', reject);
    });
    assert.equal(spoofedHostStatus, 403);
    assert.equal((await fetch(web.origin + '/%2e%2e%5csecrets.json')).status, 403);
  } finally { await web.close(); await new Promise(resolve => api.close(resolve)); }
});
