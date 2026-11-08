const { app, BrowserWindow, Menu, dialog, ipcMain, safeStorage, shell, nativeImage } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const { pathToFileURL } = require('node:url');
const { readJson, writeJson, validateSetup, secretsFor, serveWeb, startApi } = require('./runtime.cjs');
const { createUpdater } = require('./updater.cjs');
let mainWindow, startupWindow, api, web, database, closing = false, booting = true;
const isDev = !app.isPackaged && process.env.ELECTRON_IS_DEV === 'true';
const runtimeRoot = path.join(process.resourcesPath, 'runtime');
const icon = path.join(__dirname, 'assets', 'icon.png');

async function showStartupWindow() {
  startupWindow = new BrowserWindow({ width: 420, height: 280, title: 'Starting EverGreen', icon,
    resizable: false, minimizable: false, autoHideMenuBar: true,
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true } });
  startupWindow.on('closed', () => { startupWindow = null; if (booting) app.quit(); });
  startupWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  const logo = nativeImage.createFromPath(icon).resize({ width: 64 }).toDataURL();
  await startupWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`<!doctype html><html lang="en"><head>
    <meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'">
    <title>Starting EverGreen</title><style>body{font:16px system-ui;text-align:center;background:#f3f7f5;color:#153c32;margin:24px}img{width:56px;height:56px}h1{font-size:22px;margin:8px}p{margin:12px}progress{width:240px;accent-color:#08654e}</style></head>
    <body><img src="${logo}" alt="EverGreen"><h1>EverGreen</h1><p id="status" role="status">Checking installation access…</p><progress aria-label="Starting EverGreen"></progress></body></html>`));
}

async function startupStatus(message) {
  if (startupWindow && !startupWindow.isDestroyed()) {
    await startupWindow.webContents.executeJavaScript(`document.getElementById('status').textContent = ${JSON.stringify(message)}`).catch(() => {});
  }
}

async function showAbout() {
  const manifest = readJson(path.join(runtimeRoot, 'release-manifest.json'));
  await dialog.showMessageBox({ type: 'info', title: 'About EverGreen', message: `EverGreen ${app.getVersion()}`, icon,
    detail: manifest ? `Built: ${manifest.builtAt || 'Not recorded'}\nSource: ${manifest.commit}${manifest.dirty ? ' (local changes)' : ''}\nUpdates: ${manifest.updatesEnabled ? 'Configured' : 'Manual installer'}` : 'Local development build.' });
}

async function showLicense() {
  try {
    const licensing = require(path.join(runtimeRoot, 'node_modules/@evergreen/types/dist/licensing.js'));
    const licence = licensing.requireInstallationLicence('tenant');
    await dialog.showMessageBox({ type: 'info', title: 'EverGreen license', message: 'Installation license is valid.', icon,
      detail: `Licensed to: ${licence.owner}\nExpires: ${new Date(licence.expiresAt).toLocaleString()}\nOffline allowance until: ${new Date(licence.offlineUntil).toLocaleString()}\nContact your EverGreen provider for renewal.` });
  } catch {
    await dialog.showMessageBox({ type: 'warning', title: 'EverGreen license', message: 'A valid installation license could not be verified.',
      detail: 'Contact your EverGreen provider to activate or renew this Windows installation.' });
  }
}

function setupAccount() {
  return new Promise((resolve, reject) => {
    const setup = new BrowserWindow({ width: 560, height: 650, resizable: false, icon,
      webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, preload: path.join(__dirname, 'setup-preload.cjs') } });
    const expected = pathToFileURL(path.join(__dirname, 'setup.html')).href;
    let complete = false;
    setup.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    setup.webContents.on('will-navigate', event => event.preventDefault());
    ipcMain.handle('evergreen:setup', (event, input) => {
      if (event.sender !== setup.webContents || event.senderFrame?.url !== expected || complete) return { error: 'Setup is unavailable' };
      try {
        const account = validateSetup(input); complete = true;
        setImmediate(() => { setup.close(); resolve(account); }); return {};
      } catch (error) { return { error: error.message }; }
    });
    setup.once('closed', () => { ipcMain.removeHandler('evergreen:setup'); if (!complete) reject(new Error('Setup cancelled')); });
    setup.loadFile(path.join(__dirname, 'setup.html')).catch(reject);
  });
}

async function start() {
  let origin = 'http://localhost:4000';
  if (!isDev) {
    const licensing = require(path.join(runtimeRoot, 'node_modules/@evergreen/types/dist/licensing.js'));
    const online = require(path.join(runtimeRoot, 'node_modules/@evergreen/types/dist/licensing-online.js'));
    try { await online.refreshInstallationLease('tenant'); } catch { /* Enforce the signed offline window below. */ }
    licensing.requireInstallationLicence('tenant');
    await startupStatus('Preparing your workspace…');
    const directory = app.getPath('userData');
    fs.mkdirSync(path.join(directory, 'databases'), { recursive: true });
    const manifest = readJson(path.join(runtimeRoot, 'release-manifest.json'));
    if (!manifest || manifest.version !== app.getVersion()) throw new Error('The packaged runtime does not match this application');
    const stateFile = path.join(directory, 'installation.json');
    const previous = readJson(stateFile);
    if (!previous && fs.existsSync(path.join(directory, 'database.db'))) throw new Error('A legacy database was found. Keep it intact and ask your administrator to migrate it with its original encryption configuration.');
    const account = previous ? null : await setupAccount();
    const secrets = secretsFor(directory, safeStorage);
    const storage = require(path.join(runtimeRoot, 'scripts/release/database.cjs'));
    const changed = !previous || previous.version !== manifest.version || previous.apiSha256 !== manifest.apiSha256 || previous.schemaSha256 !== manifest.schemaSha256 || previous.lockSha256 !== manifest.lockSha256;
    const filename = changed ? `${randomUUID()}.db` : previous.database;
    if (!/^[a-f0-9-]+\.db$/.test(filename) || (previous && !/^[a-f0-9-]+\.db$/.test(previous.database))) throw new Error('Invalid installation database reference');
    database = path.join(directory, 'databases', filename);
    if (previous && changed) {
      const databaseDirectory = path.join(directory, 'databases');
      const expectedSource = path.join(databaseDirectory, previous.database);
      // An installer/update can preserve installation.json while the database
      // file was moved by an older build. Recover the most likely existing
      // database before refusing to start; never create a blank replacement
      // when customer data may still be present.
      const candidates = [];
      if (fs.existsSync(expectedSource)) candidates.push(expectedSource);
      const legacy = path.join(directory, 'database.db');
      if (fs.existsSync(legacy)) candidates.push(legacy);
      if (fs.existsSync(databaseDirectory)) {
        for (const name of fs.readdirSync(databaseDirectory)) {
          if (/^[a-f0-9-]+\.db$/.test(name)) candidates.push(path.join(databaseDirectory, name));
        }
      }
      const source = [...new Set(candidates)].sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
      if (!source) throw new Error('The saved customer database could not be found. No new database was created; contact your administrator to restore the previous EverGreen data folder.');
      await storage.snapshot(runtimeRoot, source, database);
    }
    if (changed) await storage.migrate(runtimeRoot, database);
    web = await serveWeb(path.join(process.resourcesPath, 'web')); origin = web.origin;
    await startupStatus('Opening your workspace…');
    api = await startApi(runtimeRoot, { ...secrets, DATABASE_URL: storage.databaseUrl(database), FRONTEND_URL: origin,
      BOOTSTRAP_ADMIN_USERNAME: account?.username || '', BOOTSTRAP_ADMIN_EMAIL: account?.email || '', BOOTSTRAP_ADMIN_PASSWORD: account?.password || '' }, () => {
      dialog.showErrorBox('EverGreen stopped', 'The local service stopped. Close and reopen EverGreen. Your saved database is retained.'); app.quit();
    });
    web.setApiPort(api.port);
    const health = await fetch(`${origin}/health`, { signal: AbortSignal.timeout(10_000) });
    if (!health.ok) throw new Error('Local service health check failed; the previous database is retained');
    if (changed) {
      if (previous) writeJson(path.join(directory, `previous-${randomUUID()}.json`), previous);
      writeJson(stateFile, { version: manifest.version, apiSha256: manifest.apiSha256, schemaSha256: manifest.schemaSha256, lockSha256: manifest.lockSha256, database: filename });
    }
  }
  mainWindow = new BrowserWindow({ width: 1280, height: 800, title: 'EverGreen', icon, webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true } });
  mainWindow.webContents.on('will-navigate', (event, url) => { if (new URL(url).origin !== origin) event.preventDefault(); });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) void shell.openExternal(url);
    return { action: 'deny' };
  });
  const config = readJson(path.join(__dirname, 'release-config.json'));
  const check = createUpdater({ updater: require('electron-updater').autoUpdater, dialog,
    enabled: app.isPackaged && config?.enabled === true,
    prepare: async () => {
      if (mainWindow) mainWindow.hide();
      if (web) { await web.close(); web = null; }
      if (api) { await api.stop(); api = null; }
      const storage = require(path.join(runtimeRoot, 'scripts/release/database.cjs'));
      await storage.snapshot(runtimeRoot, database, path.join(app.getPath('userData'), 'backups', `before-update-${randomUUID()}.db`));
      closing = true;
    },
    recover: () => { app.relaunch(); app.quit(); },
  });
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'File', submenu: [{ role: 'quit' }] },
    { label: 'View', submenu: [{ role: 'reload' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'togglefullscreen' }] },
    { label: 'Help', submenu: [
      { label: 'About EverGreen', click: () => void showAbout() },
      { label: 'License status', click: () => void showLicense() },
      { type: 'separator' },
      { label: 'Check for updates', click: () => void check() },
    ] },
  ]));
  await mainWindow.loadURL(origin);
  booting = false;
  if (startupWindow) startupWindow.close();
}

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.show(); mainWindow.focus(); } });
  app.whenReady().then(async () => { if (!isDev) await showStartupWindow(); await start(); }).catch(async error => {
    dialog.showErrorBox('EverGreen could not start', error.message);
    app.quit();
  });
  app.on('window-all-closed', () => { if (!booting) app.quit(); });
  app.on('before-quit', event => {
    if (closing) return;
    event.preventDefault(); closing = true;
    void (async () => { if (web) await web.close(); if (api) await api.stop(); })().finally(() => app.quit());
  });
}
