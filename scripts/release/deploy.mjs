import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export function parseOptions(args) {
  const options = { command: 'install', project: 'evergreen', state: '', release: '', all: false, pull: false };
  if (args[0] && !args[0].startsWith('--')) options.command = args.shift();
  if (!['install', 'update', 'status'].includes(options.command)) throw new Error('Use install, update or status');
  while (args.length) {
    const key = args.shift();
    if (key === '--all') options.all = true;
    else if (key === '--pull') options.pull = true;
    else if (['--project', '--state', '--release'].includes(key) && args[0] && !args[0].startsWith('--')) options[key.slice(2)] = args.shift();
    else throw new Error(`Unknown or incomplete option: ${key}`);
  }
  if (!/^[a-z][a-z0-9-]{0,50}$/.test(options.project)) throw new Error('Project must be a lowercase installation identifier');
  if (options.command !== 'status' && !/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,100}$/.test(options.release)) throw new Error('Supply --release with an immutable image tag (for example a commit SHA)');
  options.state = path.resolve(options.state || path.join(root, '.evergreen/deploy', options.project));
  return options;
}

export function writeJson(file, value) {
  const temp = `${file}.${randomUUID()}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(value, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  fs.renameSync(temp, file);
}

export function createEnvironment(file) {
  if (fs.existsSync(file)) return false;
  const secret = () => randomBytes(48).toString('hex');
  const env = {
    TENANT_JWT_SECRET: secret(), TENANT_ENCRYPTION_SECRET: secret(),
    PROVIDER_ADMIN_API_KEY: secret(), ADMIN_JWT_SECRET: secret(),
    BOOTSTRAP_ADMIN_USERNAME: 'admin', BOOTSTRAP_ADMIN_EMAIL: 'admin@evergreen.local',
    BOOTSTRAP_ADMIN_PASSWORD: randomBytes(24).toString('hex'),
  };
  fs.writeFileSync(file, Object.entries(env).map(([key, value]) => `${key}=${value}`).join('\n') + '\n', { flag: 'wx', mode: 0o600 });
  return true;
}

export function readEnvironment(file) {
  const environment = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const match = /^([A-Z][A-Z0-9_]*)=(.*)$/.exec(line);
    if (!match) throw new Error('Installation environment contains an invalid line');
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    environment[match[1]] = value;
  }
  return environment;
}

// Dependency injection lets failure/rollback tests exercise the real orchestration without Docker.
export async function deploy(options, execute = runDocker) {
  fs.mkdirSync(options.state, { recursive: true, mode: 0o700 });
  const lockPath = path.join(options.state, 'operation.lock');
  let lock;
  try { lock = fs.openSync(lockPath, 'wx', 0o600); }
  catch { throw new Error('Another deployment is active, or an interrupted run needs recovery; inspect operation.lock and pending.json'); }
  try {
    const stateFile = path.join(options.state, 'state.json');
    const pendingFile = path.join(options.state, 'pending.json');
    const previous = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : null;
    if (previous && previous.project !== options.project) throw new Error('State directory belongs to another installation');
    if (fs.existsSync(pendingFile) && options.command !== 'status') throw new Error('An interrupted operation requires recovery using pending.json before another update');
    const envFile = path.join(options.state, 'installation.env');
    if (options.command === 'status') {
      if (!previous) throw new Error('Installation has not completed');
      return execute(composeArgs(options, envFile, previous, ['ps']), previous);
    }
    if (options.command === 'update' && !previous) throw new Error('Install this project before updating');
    if (options.command === 'install' && previous) throw new Error('Installation already exists; use update');
    if (previous && previous.release === options.release) throw new Error('That release is already installed; use status');
    createEnvironment(envFile);
    const installationEnvironment = readEnvironment(envFile);
    const generation = randomUUID();
    const next = { format: 1, project: options.project, release: options.release, all: previous?.all ?? options.all,
      engineProject: previous?.engineProject || `${options.project}-${createHash('sha256').update(fs.realpathSync(options.state)).digest('hex').slice(0, 8)}`,
      imagePrefix: process.env.EVERGREEN_IMAGE_PREFIX || previous?.imagePrefix || installationEnvironment.EVERGREEN_IMAGE_PREFIX || 'evergreen',
      tenantDatabase: `tenant-${generation}.db`, providerDatabase: `provider-${generation}.db`, updatedAt: new Date().toISOString() };
    const run = (state, args) => execute(composeArgs(options, envFile, state, args), state);
    const apis = next.all ? ['tenant-api', 'admin-api'] : ['tenant-api'];
    const webs = next.all ? ['tenant-web', 'admin-web', 'marketing-web'] : ['tenant-web'];
    // Build/pull can fail while the previous version continues serving.
    await run(next, options.pull ? ['pull', ...apis, ...webs] : ['build', ...apis, ...webs]);
    writeJson(pendingFile, { previous, next, phase: 'prepared' });
    let published = false;
    try {
      if (previous) {
        await run(previous, ['stop', ...webs, ...apis]);
        for (const [service, plane, field] of [['tenant-api', 'tenant', 'tenantDatabase'], ...(next.all ? [['admin-api', 'provider', 'providerDatabase']] : [])]) {
          await run(next, ['run', '--rm', '--no-deps', service, 'node', 'scripts/release/database.cjs', 'snapshot', plane, `/data/${previous[field]}`, `/data/${next[field]}`]);
        }
      }
      writeJson(pendingFile, { previous, next, phase: 'starting' });
      await run(next, ['up', '-d', '--no-build', '--wait', '--wait-timeout', '180', ...apis]);
      // Once web traffic resumes, automatic database rollback could discard new writes.
      // Record that boundary durably BEFORE enabling the web containers.
      writeJson(pendingFile, { previous, next, phase: 'publishing' });
      published = true;
      await run(next, ['up', '-d', '--no-build', '--wait', '--wait-timeout', '90', ...webs]);
      writeJson(stateFile, next);
      if (previous) writeJson(path.join(options.state, `previous-${generation}.json`), previous);
      fs.unlinkSync(pendingFile);
      return next;
    } catch (error) {
      if (!published) {
        await run(next, ['stop', ...webs, ...apis]);
        if (previous) await run(previous, ['up', '-d', '--no-build', '--wait', '--wait-timeout', '180', ...apis, ...webs]);
        fs.unlinkSync(pendingFile);
      }
      throw new Error(`${error.message}. ${published ? 'Traffic may have resumed; pending.json records the candidate. Preserve both databases and reconcile before recovery.' : 'Previous database and images are retained; no candidate was exposed to users.'}`);
    }
  } finally { fs.closeSync(lock); fs.unlinkSync(lockPath); }
}

function composeArgs(options, envFile, state, command) {
  return ['compose', '--project-name', state.engineProject || options.project, '--env-file', envFile, '-f', path.join(root, 'deploy/docker/compose.yml'),
    ...(state.all ? ['--profile', 'provider', '--profile', 'marketing'] : []), ...command];
}

function runDocker(args, state) {
  const envFile = args[args.indexOf('--env-file') + 1];
  const configured = readEnvironment(envFile);
  const result = spawnSync('docker', args, { cwd: root, stdio: 'inherit', windowsHide: true,
    env: { ...process.env, ...configured, EVERGREEN_IMAGE_PREFIX: state.imagePrefix || 'evergreen', EVERGREEN_RELEASE: state.release, TENANT_DATABASE: state.tenantDatabase, PROVIDER_DATABASE: state.providerDatabase } });
  if (result.error || result.status !== 0) throw new Error(`Docker operation failed (${result.error?.code || result.status})`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseOptions(process.argv.slice(2));
    await deploy(options);
    console.log(`${options.command} completed. Installation configuration: ${path.join(options.state, 'installation.env')}`);
    if (options.command === 'install') console.log('Initial administrator credentials are in that protected file. Open http://localhost:4000 and change the password.');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
