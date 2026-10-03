const net = require('node:net');
const { spawn, spawnSync } = require('node:child_process');
const path = require('node:path');

const publicPort = Number(process.env.EVERGREEN_PUBLIC_PORT || 4000);
const apiPort = Number(process.env.EVERGREEN_API_PORT || 4301);
if (![publicPort, apiPort].every(port => Number.isInteger(port) && port > 0 && port <= 65535) || publicPort === apiPort) {
  throw new Error('EverGreen needs two distinct valid ports (public 4000, internal API 4301 by default).');
}

function assertAddressAvailable(port, host) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', error => {
      if (error.code === 'EAFNOSUPPORT' || error.code === 'EADDRNOTAVAIL') return resolve();
      reject(new Error(`Port ${port} (${host}) is already in use; EverGreen did not start or replace that service.`));
    });
    server.listen(port, host, () => server.close(resolve));
  });
}

async function assertAvailable(port) {
  await assertAddressAvailable(port, '127.0.0.1');
  await assertAddressAvailable(port, '::1');
}

async function main() {
  await assertAvailable(publicPort);
  await assertAvailable(apiPort);

  const root = path.resolve(__dirname, '..');
  const apiDir = path.join(root, 'apps', 'api');
  const webDir = path.join(root, 'apps', 'web');
  const fs = require('node:fs');
  const npmCli = (process.env.npm_execpath && fs.existsSync(process.env.npm_execpath))
    ? process.env.npm_execpath
    : (fs.existsSync('C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js'))
      ? 'C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js'
      : path.join(root, 'node_modules', 'npm', 'bin', 'npm-cli.js');
  const sharedBuild = spawnSync(process.execPath, [npmCli, 'run', 'build', '-w', 'packages/types', '-w', 'packages/pdf'], {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
    windowsHide: true,
  });
  if (sharedBuild.error || sharedBuild.status !== 0) {
    throw new Error(`EverGreen shared package compilation failed (${sharedBuild.error?.message || sharedBuild.status}).`);
  }
  const compile = spawnSync(process.execPath, [path.join(root, 'node_modules', '@nestjs', 'cli', 'bin', 'nest.js'), 'build'], {
    cwd: apiDir,
    env: process.env,
    stdio: 'inherit',
    windowsHide: true,
  });
  if (compile.error || compile.status !== 0) {
    throw new Error(`EverGreen API compilation failed (${compile.error?.message || compile.status}).`);
  }

  const env = { ...process.env, EVERGREEN_API_PORT: String(apiPort), EVERGREEN_PUBLIC_PORT: String(publicPort) };
  const api = spawn(process.execPath, [path.join(apiDir, 'dist', 'main.js')], { cwd: apiDir, env, stdio: 'inherit', windowsHide: true });
  const children = [api];
  let stopping = false;

  function stop(exitCode = 0) {
    if (stopping) return;
    stopping = true;
    for (const child of children) {
      if (child.exitCode !== null || !child.pid) continue;
      child.kill('SIGTERM');
    }
    process.exitCode = exitCode;
  }

  process.on('SIGINT', () => stop(0));
  process.on('SIGTERM', () => stop(0));
  function watch(name, child) {
    child.once('error', error => { console.error(`${name} failed to launch: ${error.message}`); stop(1); });
    child.once('exit', code => { if (!stopping) { console.error(`${name} exited (${code ?? 'unknown'}).`); stop(1); } });
  }
  watch('API', api);

  async function waitForHealth(url, label) {
    for (let attempt = 0; attempt < 180 && !stopping; attempt++) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(1500) });
        if (response.ok) {
          const health = await response.json();
          if (health.service === 'evergreen-api' && health.status === 'ok') return true;
          console.error(`${label} reached a service other than EverGreen.`);
          stop(1);
          return false;
        }
      } catch {
        // A connection refusal is expected while the child is starting.
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    if (!stopping) {
      console.error(`${label} did not pass its health check.`);
      stop(1);
    }
    return false;
  }

  if (!await waitForHealth(`http://127.0.0.1:${apiPort}/health`, 'Internal API')) return;
  const web = spawn(process.execPath, [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js')], { cwd: webDir, env, stdio: 'inherit', windowsHide: true });
  children.push(web);
  watch('web', web);
  if (!await waitForHealth(`http://localhost:${publicPort}/api/backend/health`, 'Public port')) return;
  console.log(`EverGreen ready at http://localhost:${publicPort}/ (API via /api/backend).`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
