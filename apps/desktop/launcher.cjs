const { app, BrowserWindow, Menu, dialog, ipcMain, safeStorage, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const { pathToFileURL } = require('node:url');
const { readJson, writeJson, validateSetup, secretsFor, serveWeb, startApi } = require('./runtime.cjs');
const { createUpdater } = require('./updater.cjs');
let mainWindow, api, web, database, closing = false, booting = true;
const isDev = !app.isPackaged && process.env.ELECTRON_IS_DEV === 'true';
const runtimeRoot = path.join(process.resourcesPath, 'runtime');

function setupAccount() {
  return new Promise((resolve, reject) => {
    const setup = new BrowserWindow({ width: 560, height: 650, resizable: false,
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
    if (previous && changed) await storage.snapshot(runtimeRoot, path.join(directory, 'databases', previous.database), database);
    if (changed) await storage.migrate(runtimeRoot, database);
    web = await serveWeb(path.join(process.resourcesPath, 'web')); origin = web.origin;
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
  mainWindow = new BrowserWindow({ width: 1280, height: 800, title: 'EverGreen', webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true } });
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
    { label: 'Help', submenu: [{ label: 'Check for updates', click: () => void check() }] },
  ]));
  await mainWindow.loadURL(origin);
  booting = false;
}

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.show(); mainWindow.focus(); } });
  app.whenReady().then(start).catch(async error => {
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
