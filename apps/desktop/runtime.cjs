const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { randomBytes, randomUUID } = require('node:crypto');
const { fork } = require('node:child_process');

function readJson(file) { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null; }
function writeJson(file, value) {
  const temporary = `${file}.${randomUUID()}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(value, null, 2), { flag: 'wx', mode: 0o600 });
  fs.renameSync(temporary, file);
}
function validateSetup(input) {
  if (!input || !/^[a-zA-Z0-9_.-]{3,80}$/.test(input.username || '') ||
      typeof input.email !== 'string' || input.email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) ||
      typeof input.password !== 'string' || input.password.length < 12 || Buffer.byteLength(input.password) > 72) {
    throw new Error('Use a valid username and email, and a password of 12 or more characters (at most 72 UTF-8 bytes).');
  }
  return { username: input.username, email: input.email, password: input.password };
}
function secretsFor(directory, safeStorage) {
  const file = path.join(directory, 'secrets.json');
  if (!safeStorage.isEncryptionAvailable()) throw new Error('Windows credential protection is unavailable');
  let stored = readJson(file);
  if (!stored) {
    stored = { jwt: safeStorage.encryptString(randomBytes(48).toString('hex')).toString('base64'),
      encryption: safeStorage.encryptString(randomBytes(48).toString('hex')).toString('base64') };
    writeJson(file, stored);
  }
  return { JWT_SECRET: safeStorage.decryptString(Buffer.from(stored.jwt, 'base64')),
    ENCRYPTION_SECRET: safeStorage.decryptString(Buffer.from(stored.encryption, 'base64')) };
}

async function serveWeb(webRoot) {
  let apiPort;
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
  const server = http.createServer((req, res) => {
    const expectedHost = `127.0.0.1:${server.address().port}`;
    if (req.headers.host !== expectedHost) { res.writeHead(403).end(); return; }
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, `http://${expectedHost}`).pathname); }
    catch { res.writeHead(400).end(); return; }
    const apiPath = pathname.startsWith('/api/backend/') ? req.url.slice('/api/backend'.length) : pathname === '/health' ? req.url : null;
    if (apiPath !== null) {
      if (!apiPort) { res.writeHead(503).end(); return; }
      const proxy = http.request({ hostname: '127.0.0.1', port: apiPort, path: apiPath, method: req.method,
        headers: { ...req.headers, host: `127.0.0.1:${apiPort}`, 'x-forwarded-for': '127.0.0.1' } }, response => {
        res.writeHead(response.statusCode, response.headers); response.pipe(res);
      });
      proxy.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end(); });
      req.pipe(proxy); return;
    }
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
    const target = path.resolve(webRoot, '.' + pathname);
    if (!target.startsWith(path.resolve(webRoot) + path.sep) && target !== path.resolve(webRoot)) { res.writeHead(403).end(); return; }
    const file = fs.existsSync(target) && fs.statSync(target).isFile() ? target : path.join(webRoot, 'index.html');
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    if (req.method === 'HEAD') { res.end(); return; }
    const stream = fs.createReadStream(file);
    stream.on('error', () => { if (!res.headersSent) res.writeHead(404); res.end(); }); stream.pipe(res);
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  return { origin: `http://127.0.0.1:${server.address().port}`, setApiPort(value) { apiPort = value; },
    close: () => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }) };
}

function startApi(runtimeRoot, environment, onUnexpectedExit = () => {}) {
  return new Promise((resolve, reject) => {
    const child = fork(path.join(runtimeRoot, 'apps/api/dist/main.js'), [], {
      cwd: runtimeRoot, execPath: path.join(runtimeRoot, 'node.exe'), execArgv: [], windowsHide: true,
      env: { ...process.env, ...environment, ELECTRON_RUN_AS_NODE: '1', NODE_ENV: 'production',
        EVERGREEN_DESKTOP: 'true', EVERGREEN_API_HOST: '127.0.0.1', EVERGREEN_API_PORT: '0',
        AUTO_MIGRATE: 'false', ADMIN_API_URL: '', COMPANY_ID: '', SMTP_HOST: '', DAILY_SUMMARY_EMAIL: '' },
      stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    });
    // Do not forward application logs containing operational data to renderer dialogs.
    child.stdout.resume(); child.stderr.resume();
    let ready = false, stopping = false;
    const timer = setTimeout(() => { child.kill(); reject(new Error('Local API startup timed out')); }, 120_000);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('exit', code => {
      clearTimeout(timer);
      if (!ready) reject(new Error(`Local API failed to start (exit ${code}); the previous database is retained`));
      else if (!stopping) onUnexpectedExit();
    });
    child.on('message', message => {
      if (!ready && message?.type === 'evergreen-ready' && Number.isInteger(message.port) && message.port > 0) {
        ready = true; clearTimeout(timer);
        resolve({ port: message.port, stop: () => new Promise((done, fail) => {
          stopping = true;
          if (child.exitCode !== null) return done();
          const timeout = setTimeout(() => { child.kill(); fail(new Error('Local API shutdown timed out; update was not installed')); }, 15_000);
          child.once('exit', () => { clearTimeout(timeout); done(); });
          child.send({ type: 'evergreen-shutdown' }, error => { if (error) { clearTimeout(timeout); fail(error); } });
        }) });
      }
    });
  });
}

module.exports = { readJson, writeJson, validateSetup, secretsFor, serveWeb, startApi };
