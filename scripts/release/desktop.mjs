import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(import.meta.url);
const json = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const digest = value => createHash('sha256').update(value).digest('hex');
function treeDigest(directory) {
  const hash = createHash('sha256');
  const visit = (folder, relative = '') => {
    for (const name of fs.readdirSync(folder).sort()) {
      const file = path.join(folder, name), key = path.posix.join(relative, name);
      if (fs.statSync(file).isDirectory()) visit(file, key);
      else hash.update(key).update('\0').update(fs.readFileSync(file)).update('\0');
    }
  };
  visit(directory); return hash.digest('hex');
}

export function updateConfiguration(env) {
  const url = env.EVERGREEN_UPDATE_URL?.trim();
  const publisher = env.EVERGREEN_WINDOWS_PUBLISHER?.trim();
  if (!url && !publisher) return { enabled: false };
  const parsed = new URL(url);
  if (!publisher || parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error('Updates require a public HTTPS feed without credentials/query/fragment and EVERGREEN_WINDOWS_PUBLISHER');
  }
  return { enabled: true, url: parsed.href, publisher };
}

// Copy the exact installed dependency graph, retaining nested version conflicts.
// Workspace symlinks are materialized; no dependency points outside the artifact.
export function copyDependencies(dependencies, from, output) {
  fs.mkdirSync(path.join(output, 'node_modules'), { recursive: true });
  const copied = new Set();
  function copy(name, parent, nestedBase = output, optional = false) {
    const resolver = createRequire(path.join(parent, 'package.json'));
    const source = resolver.resolve.paths(name)?.map(base => path.join(base, name)).find(candidate => fs.existsSync(path.join(candidate, 'package.json')));
    if (!source) { if (optional) return; throw new Error(`Missing installed release dependency: ${name}`); }
    const realSource = fs.realpathSync(source);
    const manifest = json(path.join(realSource, 'package.json'));
    let target = path.join(output, 'node_modules', name);
    if (fs.existsSync(path.join(target, 'package.json')) && json(path.join(target, 'package.json')).version !== manifest.version) target = path.join(nestedBase, 'node_modules', name);
    if (copied.has(target)) return;
    copied.add(target);
    const workspace = realSource.startsWith(path.join(root, 'packages') + path.sep);
    fs.cpSync(realSource, target, { recursive: true, dereference: true, filter: sourceFile => {
      if (sourceFile === realSource) return true;
      const name = path.basename(sourceFile);
      if (workspace && !['package.json', 'dist'].includes(path.relative(realSource, sourceFile).split(path.sep)[0])) return false;
      return !['node_modules', '.git', 'backups'].includes(name) && !name.startsWith('.env') && !/\.(db(?:-.*)?|sqlite.*|log|pfx|pem|key)$/.test(name);
    } });
    for (const child of Object.keys(manifest.dependencies || {})) copy(child, realSource, target, child in (manifest.optionalDependencies || {}));
    for (const child of Object.keys(manifest.optionalDependencies || {})) copy(child, realSource, target, true);
    // Runtime peer dependencies (Nest, React, etc.) also need their installed implementation.
    for (const child of Object.keys(manifest.peerDependencies || {})) copy(child, realSource, target, manifest.peerDependenciesMeta?.[child]?.optional === true);
  }
  for (const name of Object.keys(dependencies)) copy(name, from);
}

function runNode(args, env = {}) {
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit', windowsHide: true, env: { ...process.env, ...env } });
  if (result.error || result.status !== 0) throw new Error(`Release command failed (${result.error?.code || result.status})`);
}

export async function prepareDesktop({ build = true } = {}) {
  if (process.platform !== 'win32') throw new Error('Prepare the Windows runtime on Windows so Prisma and native dependencies match');
  const npmCli = process.env.npm_execpath || path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
  if (build) {
    runNode([npmCli, 'run', 'build', '-w', 'apps/api']);
    runNode([npmCli, 'run', 'build', '-w', 'apps/web'], { VITE_API_URL: '/api/backend' });
  }
  const stage = path.join(root, '.evergreen/releases', `desktop-${randomUUID()}`);
  const app = path.join(stage, 'app');
  const runtime = path.join(stage, 'runtime');
  fs.mkdirSync(app, { recursive: true }); fs.mkdirSync(runtime, { recursive: true });
  fs.copyFileSync(process.execPath, path.join(runtime, 'node.exe'));
  const desktop = json(path.join(root, 'apps/desktop/package.json'));
  const api = json(path.join(root, 'apps/api/package.json'));
  const rootManifest = json(path.join(root, 'package.json'));
  copyDependencies({ ...rootManifest.dependencies, ...api.dependencies }, path.join(root, 'apps/api'), runtime);
  fs.cpSync(path.join(root, 'node_modules/.prisma'), path.join(runtime, 'node_modules/.prisma'), { recursive: true });
  for (const file of ['apps/api/dist', 'packages/database/prisma/schema.prisma', 'packages/database/prisma/migrations', 'scripts/release/database.cjs']) {
    fs.cpSync(path.join(root, file), path.join(runtime, file), { recursive: true });
  }
  fs.writeFileSync(path.join(runtime, 'package.json'), JSON.stringify({ name: 'evergreen-local-runtime', private: true, version: desktop.version }));
  copyDependencies(desktop.dependencies, path.join(root, 'apps/desktop'), app);
  for (const file of ['main.js', 'launcher.cjs', 'runtime.cjs', 'updater.cjs', 'setup.html', 'setup.js', 'setup-preload.cjs', 'assets']) fs.cpSync(path.join(root, 'apps/desktop', file), path.join(app, file), { recursive: true });
  fs.cpSync(path.join(root, 'apps/web/dist'), path.join(stage, 'web'), { recursive: true });
  const config = updateConfiguration(process.env);
  fs.writeFileSync(path.join(app, 'release-config.json'), JSON.stringify(config));
  fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify({ name: desktop.name, productName: 'EverGreen', version: desktop.version,
    description: desktop.description, author: desktop.author, license: 'UNLICENSED', main: 'main.js', dependencies: desktop.dependencies }, null, 2));
  const git = spawnSync('git', ['-c', `safe.directory=${root.replaceAll('\\', '/')}`, 'rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', windowsHide: true });
  const status = spawnSync('git', ['-c', `safe.directory=${root.replaceAll('\\', '/')}`, 'status', '--porcelain'], { cwd: root, encoding: 'utf8', windowsHide: true });
  const dirty = status.status !== 0 || status.stdout.trim().length > 0;
  if (config.enabled && dirty) throw new Error('Signed update releases require a clean committed source tree');
  const manifest = { format: 1, version: desktop.version, commit: git.status === 0 ? git.stdout.trim() : 'unknown',
    dirty,
    lockSha256: digest(fs.readFileSync(path.join(root, 'package-lock.json'))),
    apiSha256: digest(treeDigest(path.join(runtime, 'apps/api/dist')) + treeDigest(path.join(runtime, 'node_modules/@evergreen'))),
    webSha256: treeDigest(path.join(stage, 'web')),
    schemaSha256: treeDigest(path.join(runtime, 'packages/database/prisma')),
    nodeVersion: process.versions.node,
    platform: process.platform, arch: process.arch, updatesEnabled: config.enabled };
  fs.writeFileSync(path.join(runtime, 'release-manifest.json'), JSON.stringify(manifest, null, 2));
  return { stage, app, runtime, manifest, config, desktop };
}

export async function packageDesktop(prepared, { directory = false } = {}) {
      const { build, Platform } = require('electron-builder');
      const artifacts = await build({ projectDir: prepared.app, targets: Platform.WINDOWS.createTarget(directory ? 'dir' : 'nsis'), publish: 'never', config: {
        appId: 'com.evergreen.yarnsms', productName: 'EverGreen', electronVersion: prepared.desktop.devDependencies.electron,
        directories: { output: path.join(root, 'apps/desktop/dist') }, npmRebuild: false,
        files: ['**/*'], extraResources: [{ from: prepared.runtime, to: 'runtime' }, { from: path.join(prepared.stage, 'web'), to: 'web' }],
        win: { artifactName: 'EverGreen-${version}-win.${ext}', ...(prepared.config.enabled ? { publisherName: prepared.config.publisher } : {}) },
        nsis: { oneClick: true, perMachine: false, createDesktopShortcut: true, runAfterFinish: true, deleteAppDataOnUninstall: false },
        forceCodeSigning: prepared.config.enabled,
        publish: prepared.config.enabled ? { provider: 'generic', url: prepared.config.url } : null,
      } });
      // Inspect the actual ASAR, including the packager's dependency collection.
      const entries = require('@electron/asar').listPackage(path.join(root, 'apps/desktop/dist/win-unpacked/resources/app.asar'));
      if (!entries.some(file => /node_modules[\\/]electron-updater[\\/]package.json$/.test(file)) || entries.some(file =>
        /(?:^|[\\/])(?:backend|web-dist|@evergreen|@nestjs)(?:[\\/]|$)/.test(file) ||
        /(?:^|[\\/])\.env(?:\.|$)|\.(?:db(?:-.*)?|sqlite(?:3)?(?:-.*)?|pfx|pem|key)$/.test(file))) {
        throw new Error('Desktop artifact contains an unexpected application dependency, database or secret, or lacks its updater');
      }
      if (!directory) {
        const output = path.join(root, 'apps/desktop/dist');
        const manifestFile = path.join(output, 'release-manifest.json');
        fs.writeFileSync(manifestFile, JSON.stringify(prepared.manifest, null, 2));
        const files = [...new Set([...artifacts, manifestFile,
          path.join(output, `EverGreen-${prepared.manifest.version}-win.exe.blockmap`),
          ...(prepared.config.enabled ? [path.join(output, 'latest.yml')] : []),
        ])].filter(file => fs.existsSync(file) && fs.statSync(file).isFile());
        const checksums = files.map(file => `${digest(fs.readFileSync(file))}  ${path.basename(file)}`).join('\n');
        fs.writeFileSync(path.join(output, 'SHA256SUMS'), checksums + '\n');
      }
      return artifacts;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const prepared = await prepareDesktop();
    runNode(['scripts/release/smoke-desktop.mjs', prepared.stage]);
    if (process.argv.includes('--prepare-only')) console.log(JSON.stringify({ stage: prepared.stage, ...prepared.manifest }, null, 2));
    else {
      await packageDesktop(prepared, { directory: process.argv.includes('--dir') });
      console.log('Desktop artifacts prepared. Publishing is a separate release action.');
    }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
