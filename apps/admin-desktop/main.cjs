const { app, BrowserWindow, dialog, Menu } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { fork } = require('node:child_process');

let api;
let web;
let startupWindow;
let closing = false;

function readJson(file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
}

function readProviderKey(runtimeRoot) {
  const directory = process.env.EVERGREEN_OWNER_KEY_DIRECTORY ||
    path.join(process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || '', 'AppData', 'Local'), 'EverGreen', 'owner-keys');
  const file = path.join(directory, 'provider-access-key.dpapi');
  if (!fs.existsSync(file)) throw new Error('Owner provider access is not provisioned for this Windows account.');
  try {
    const { unprotectOwnerData } = require(path.join(runtimeRoot, 'node_modules/@evergreen/types/dist/licensing.js'));
    const key = unprotectOwnerData(fs.readFileSync(file).toString('base64')).toString('utf8').trim();
    if (key.length < 32) throw new Error('The provider access key is invalid.');
    return key;
  } catch (error) {
    throw new Error(`The provider access key could not be opened for this Windows account: ${error.message}`);
  }
}

async function showStartupWindow() {
  startupWindow = new BrowserWindow({ width: 460, height: 300, title: 'Starting EverGreen Provider Admin', icon: path.join(__dirname, 'icon.png'), resizable: false, minimizable: false, autoHideMenuBar: true, webPreferences: { contextIsolation: true, sandbox: true } });
  await startupWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'file: data:; style-src 'unsafe-inline'"><style>body{font:16px system-ui;text-align:center;background:#08131f;color:#f8fafc;margin:30px}h1{font-size:22px;color:#34d399}p{margin:18px;color:#cbd5e1}progress{width:280px;accent-color:#34d399}</style></head><body><h1>EverGreen Provider Admin</h1><p id="status">Preparing the provider workspace…</p><progress aria-label="Starting provider admin"></progress></body></html>`));
}

async function startupStatus(message) {
  if (startupWindow && !startupWindow.isDestroyed()) await startupWindow.webContents.executeJavaScript(`document.getElementById('status').textContent = ${JSON.stringify(message)}`).catch(() => {});
}

async function serveWeb(webRoot) {
  let apiPort;
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
  const server = http.createServer((req, res) => {
    const host = `127.0.0.1:${server.address().port}`;
    if (req.headers.host !== host) return res.writeHead(403).end();
    const pathname = decodeURIComponent(new URL(req.url, `http://${host}`).pathname);
    if (pathname.startsWith('/admin-api/')) {
      if (!apiPort) return res.writeHead(503).end();
      const proxy = http.request({ hostname: '127.0.0.1', port: apiPort, path: req.url.slice('/admin-api'.length), method: req.method, headers: { ...req.headers, host: `127.0.0.1:${apiPort}`, 'x-forwarded-for': '127.0.0.1' } }, response => {
        res.writeHead(response.statusCode, response.headers); response.pipe(res);
      });
      proxy.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end(); });
      req.pipe(proxy); return;
    }
    if (!['GET', 'HEAD'].includes(req.method)) return res.writeHead(405).end();
    if (/[\\\0]/.test(pathname)) return res.writeHead(403).end();
    const target = path.resolve(webRoot, '.' + pathname);
    if (!target.startsWith(path.resolve(webRoot) + path.sep) && target !== path.resolve(webRoot)) return res.writeHead(403).end();
    const file = fs.existsSync(target) && fs.statSync(target).isFile() ? target : path.join(webRoot, 'index.html');
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).on('error', () => res.writeHead(404).end()).pipe(res);
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  return { origin: `http://127.0.0.1:${server.address().port}`, setApiPort: value => { apiPort = value; }, close: () => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }) };
}

function startApi(runtimeRoot, database, key, origin) {
  return new Promise((resolve, reject) => {
    const child = fork(path.join(runtimeRoot, 'apps/admin-api/dist/main.js'), [], {
      cwd: runtimeRoot, execPath: path.join(runtimeRoot, 'node.exe'), execArgv: [], windowsHide: true,
      env: { ...process.env, NODE_ENV: 'production', ELECTRON_RUN_AS_NODE: '1', EVERGREEN_DESKTOP: 'true', EVERGREEN_ADMIN_HOSTED: 'true', EVERGREEN_API_HOST: '127.0.0.1', ADMIN_API_PORT: '0', ADMIN_DATABASE_URL: `file:${database.replaceAll('\\', '/')}`, ADMIN_API_KEY: key, ADMIN_CORS_ORIGIN: origin },
      stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    });
    child.stdout.resume(); child.stderr.resume();
    const timer = setTimeout(() => { child.kill(); reject(new Error('Provider API startup timed out.')); }, 120000);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('exit', code => { if (code !== 0) reject(new Error(`Provider API failed to start (exit ${code}).`)); });
    child.on('message', message => {
      if (message?.type === 'evergreen-ready' && Number.isInteger(message.port) && message.port > 0) {
        clearTimeout(timer);
        resolve({ port: message.port, stop: () => new Promise(done => { child.once('exit', done); child.send({ type: 'evergreen-shutdown' }); }) });
      }
    });
  });
}

async function start() {
  if (!app.isPackaged) {
    const window = new BrowserWindow({ width: 1440, height: 900, title: 'EverGreen Provider Admin', icon: path.join(__dirname, 'icon.png'), webPreferences: { contextIsolation: true, sandbox: true } });
    await window.loadURL(process.env.EVERGREEN_ADMIN_URL || 'http://localhost:5174');
    return;
  }
  const runtimeRoot = path.join(process.resourcesPath, 'runtime');
  const manifest = readJson(path.join(runtimeRoot, 'release-manifest.json'));
  if (!manifest || manifest.kind !== 'admin') throw new Error('The packaged provider runtime is incomplete.');
  await startupStatus('Opening owner access…');
  const key = readProviderKey(runtimeRoot);
  const directory = path.join(app.getPath('userData'), 'databases');
  fs.mkdirSync(directory, { recursive: true });
  const database = path.join(directory, 'provider.db');
  const storage = require(path.join(runtimeRoot, 'scripts/release/database.cjs'));
  if (!fs.existsSync(database)) {
    await startupStatus('Preparing the provider database…');
    await storage.migrate(runtimeRoot, database, 'provider');
  }
  await startupStatus('Starting the provider API…');
  web = await serveWeb(path.join(process.resourcesPath, 'web'));
  api = await startApi(runtimeRoot, database, key, web.origin);
  web.setApiPort(api.port);
  const health = await fetch(`${web.origin}/admin-api/health`, { signal: AbortSignal.timeout(10000) });
  if (!health.ok) throw new Error('Provider API health check failed.');
  const window = new BrowserWindow({ width: 1440, height: 900, title: 'EverGreen Provider Admin', icon: path.join(__dirname, 'icon.png'), webPreferences: { contextIsolation: true, sandbox: true } });
  window.webContents.on('will-navigate', (event, url) => { if (new URL(url).origin !== web.origin) event.preventDefault(); });
  await window.loadURL(web.origin);
  if (startupWindow && !startupWindow.isDestroyed()) startupWindow.close();
  Menu.setApplicationMenu(Menu.buildFromTemplate([{ label: 'File', submenu: [{ role: 'quit' }] }, { label: 'View', submenu: [{ role: 'reload' }, { role: 'togglefullscreen' }] }]));
}

if (!app.requestSingleInstanceLock()) app.quit();
else app.whenReady().then(async () => { if (app.isPackaged) await showStartupWindow(); await start(); }).catch(error => { if (startupWindow && !startupWindow.isDestroyed()) startupWindow.close(); dialog.showErrorBox('EverGreen Provider Admin could not start', error.message); app.quit(); });
app.on('before-quit', event => {
  if (closing) return;
  event.preventDefault(); closing = true;
  void (async () => { if (web) await web.close(); if (api) await api.stop(); })().finally(() => app.quit());
});
