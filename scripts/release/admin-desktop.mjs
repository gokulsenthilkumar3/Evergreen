import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { randomUUID, createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { copyDependencies } from './desktop.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(import.meta.url);
const json = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const digest = value => createHash('sha256').update(value).digest('hex');
function run(args, env = {}) {
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit', windowsHide: true, env: { ...process.env, ...env } });
  if (result.status !== 0) throw new Error(`Release command failed (${result.status})`);
}

async function prepare() {
  if (process.platform !== 'win32') throw new Error('Prepare the Windows admin runtime on Windows.');
  const npmCli = process.env.npm_execpath || path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
  // The generated admin Prisma client is part of the workspace install. Avoid
  // replacing its native query engine while another local service is running.
  run([npmCli, 'run', 'build', '-w', 'apps/admin-api', '--ignore-scripts']);
  run([npmCli, 'run', 'build', '-w', 'apps/admin-web']);
  const stage = path.join(root, '.evergreen/releases', `admin-desktop-${randomUUID()}`);
  const app = path.join(stage, 'app');
  const runtime = path.join(stage, 'runtime');
  fs.mkdirSync(app, { recursive: true });
  fs.mkdirSync(runtime, { recursive: true });
  fs.copyFileSync(process.execPath, path.join(runtime, 'node.exe'));
  const desktop = json(path.join(root, 'apps/admin-desktop/package.json'));
  const api = json(path.join(root, 'apps/admin-api/package.json'));
  const rootManifest = json(path.join(root, 'package.json'));
  copyDependencies({ ...rootManifest.dependencies, ...api.dependencies }, path.join(root, 'apps/admin-api'), runtime);
  fs.cpSync(path.join(root, 'node_modules/.prisma'), path.join(runtime, 'node_modules/.prisma'), { recursive: true });
  fs.cpSync(path.join(root, 'node_modules/@prisma/admin-client'), path.join(runtime, 'node_modules/@prisma/admin-client'), { recursive: true });
  for (const file of ['apps/admin-api/dist', 'packages/admin-database/prisma', 'scripts/release/database.cjs']) {
    fs.cpSync(path.join(root, file), path.join(runtime, file), { recursive: true });
  }
  fs.cpSync(path.join(root, 'apps/admin-desktop/main.cjs'), path.join(app, 'main.cjs'));
  fs.copyFileSync(path.join(root, 'apps/desktop/assets/icon.ico'), path.join(app, 'icon.ico'));
  fs.copyFileSync(path.join(root, 'apps/desktop/assets/icon.png'), path.join(app, 'icon.png'));
  fs.cpSync(path.join(root, 'apps/admin-web/dist'), path.join(stage, 'web'), { recursive: true });
  fs.writeFileSync(path.join(runtime, 'release-manifest.json'), JSON.stringify({
    kind: 'admin', version: desktop.version, builtAt: new Date().toISOString(),
    apiSha256: digest(JSON.stringify(fs.statSync(path.join(runtime, 'apps/admin-api/dist')))),
    webSha256: digest(JSON.stringify(fs.statSync(path.join(stage, 'web')))),
  }, null, 2));
  fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify({ name: desktop.name, productName: 'EverGreen Provider Admin', version: desktop.version, main: 'main.cjs', dependencies: desktop.dependencies }, null, 2));
  return { stage, app, runtime, desktop };
}

async function packageAdmin(prepared) {
  const { build, Platform } = require('electron-builder');
  return build({ projectDir: prepared.app, targets: Platform.WINDOWS.createTarget('nsis'), publish: 'never', config: {
    appId: 'com.evergreen.provider-admin', productName: 'EverGreen Provider Admin', electronVersion: prepared.desktop.devDependencies.electron,
    directories: { output: path.join(root, 'apps/admin-desktop/dist') }, npmRebuild: false, files: ['**/*'],
    extraResources: [
      { from: prepared.runtime, to: 'runtime' },
      { from: path.join(prepared.runtime, 'node_modules'), to: 'runtime/node_modules' },
      { from: path.join(prepared.stage, 'web'), to: 'web' },
    ],
    nsis: { oneClick: true, perMachine: false, createDesktopShortcut: true, runAfterFinish: true, deleteAppDataOnUninstall: false },
    win: { icon: path.join(prepared.app, 'icon.ico'), artifactName: 'EverGreen-Provider-Admin-${version}-win.${ext}' },
  } });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const prepared = await prepare();
    if (process.argv.includes('--prepare-only')) console.log(JSON.stringify({ stage: prepared.stage }, null, 2));
    else { await packageAdmin(prepared); console.log('EverGreen Provider Admin desktop artifact prepared.'); }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
