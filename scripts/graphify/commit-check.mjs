import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const normalize = value => value.replaceAll('\\', '/');

function run(command, args, cwd, options = {}) {
  const { captureDiagnostics = false, ...spawnOptions } = options;
  const result = spawnSync(command, args, {
    cwd, encoding: 'utf8', windowsHide: true, maxBuffer: 32 * 1024 * 1024,
    ...spawnOptions,
  });
  if (result.error || result.status !== 0) {
    throw new Error(`${command} ${args[0] ?? ''} failed: ${result.error?.message || result.stderr || result.stdout || `exit ${result.status}`}`);
  }
  return captureDiagnostics ? result.stdout + result.stderr : result.stdout;
}

function git(root, args) {
  return run('git', args, root);
}

function indexHash(root) {
  return createHash('sha256').update(git(root, ['ls-files', '--stage', '-z'])).digest('hex');
}

function cleanTemporaryDirectory(directory) {
  // Only remove the unique scratch directory created by this process.
  const resolved = fs.realpathSync(directory);
  const temporaryRoot = fs.realpathSync(os.tmpdir());
  if (path.dirname(resolved) !== temporaryRoot || !path.basename(resolved).startsWith('evergreen-graphify-')) {
    throw new Error(`Refusing to remove unexpected scratch directory: ${resolved}`);
  }
  fs.rmSync(resolved, { recursive: true, force: true });
}

export function installHooks(root = repository) {
  const configured = spawnSync('git', ['config', '--local', '--get', 'core.hooksPath'], {
    cwd: root, encoding: 'utf8', windowsHide: true,
  });
  if (configured.error || ![0, 1].includes(configured.status)) {
    throw new Error(configured.error?.message || configured.stderr || 'Could not read Git hook configuration');
  }
  const current = configured.stdout.trim();
  if (current && normalize(current) !== '.githooks') {
    throw new Error(`Existing core.hooksPath=${current}. Integrate the Graphify pre-commit command with that hook instead of replacing it.`);
  }
  if (!current) {
    const hooks = git(root, ['rev-parse', '--git-path', 'hooks']).trim();
    const active = ['applypatch-msg', 'pre-applypatch', 'post-applypatch', 'pre-commit', 'pre-merge-commit',
      'prepare-commit-msg', 'commit-msg', 'post-commit', 'pre-rebase', 'post-checkout', 'post-merge', 'pre-push', 'post-rewrite'];
    const existing = active.filter(name => fs.existsSync(path.resolve(root, hooks, name)));
    if (existing.length) throw new Error(`Existing Git hooks: ${existing.join(', ')}. Integrate them before changing core.hooksPath.`);
  }
  const hook = path.join(root, '.githooks/pre-commit');
  if (!fs.existsSync(hook)) throw new Error(`Missing tracked hook: ${hook}`);
  fs.chmodSync(hook, 0o755);
  git(root, ['config', '--local', 'core.hooksPath', '.githooks']);
  console.log('Graphify pre-commit gate enabled through .githooks.');
}

export function checkCommit({ root = repository, mode = 'staged', graphifyCommand, onExtract } = {}) {
  if (!['staged', 'ci'].includes(mode)) throw new Error(`Unknown Graphify check mode: ${mode}`);
  const executable = graphifyCommand || [process.env.GRAPHIFY_BIN || (process.platform === 'win32' ? 'graphify.exe' : 'graphify')];
  const graphify = args => run(executable[0], [...executable.slice(1), ...args], root, {
    timeout: 300_000, captureDiagnostics: args[0] === 'extract',
  });
  const requirements = fs.readFileSync(path.join(root, 'scripts/graphify/requirements.txt'), 'utf8');
  const expectedVersion = requirements.match(/^graphifyy\[sql\]==(\S+)$/m)?.[1];
  if (!expectedVersion) throw new Error('No pinned Graphify version in scripts/graphify/requirements.txt');
  const installedVersion = graphify(['--version']).trim();
  if (installedVersion !== `graphify ${expectedVersion}`) {
    throw new Error(`Expected graphify ${expectedVersion}; got ${installedVersion}. Install scripts/graphify/requirements.txt with uv or an isolated venv.`);
  }

  const fingerprint = indexHash(root);
  let changedFiles;
  if (mode === 'ci') {
    // CI checks the clean commit, never silently accepts a dirty or partially staged checkout.
    git(root, ['diff', '--exit-code']);
    git(root, ['diff', '--cached', '--exit-code']);
    const parent = spawnSync('git', ['rev-parse', '--verify', 'HEAD^'], { cwd: root, encoding: 'utf8', windowsHide: true });
    changedFiles = git(root, parent.status === 0
      ? ['diff', '--name-only', '-z', 'HEAD^', 'HEAD']
      : ['ls-files', '-z']);
  } else {
    changedFiles = git(root, ['diff', '--cached', '--name-only', '-z']);
  }
  changedFiles = changedFiles.split('\0').filter(Boolean).map(normalize);

  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'evergreen-graphify-'));
  try {
    const source = path.join(scratch, 'source');
    fs.mkdirSync(source);
    // checkout-index reads the actual commit index (including GIT_INDEX_FILE for `git commit -a`).
    // It never stashes, stages or edits the developer's working files.
    git(root, ['checkout-index', '--all', `--prefix=${normalize(source)}/`]);
    console.log(`[graphify] Checking ${mode === 'ci' ? 'committed' : 'staged'} snapshot (${changedFiles.length} changed files).`);
    const extraction = graphify(['extract', source, '--code-only', '--no-cluster', '--max-workers', '2']);
    process.stdout.write(extraction);
    onExtract?.();
    const graphPath = path.join(source, 'graphify-out/graph.json');
    if (!fs.existsSync(graphPath)) throw new Error('Graphify did not produce graph.json');
    const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
    const edges = graph.links || graph.edges;
    if (!Array.isArray(graph.nodes) || graph.nodes.length === 0 || !Array.isArray(edges)) {
      throw new Error('Graphify produced an empty or invalid graph');
    }
    const sourceFile = node => {
      const file = node.source_file || '';
      return normalize(path.isAbsolute(file) ? path.relative(source, file) : file);
    };
    const changed = new Set(changedFiles);
    const touchedNodes = graph.nodes.filter(node => changed.has(sourceFile(node)));
    const touchedIds = new Set(touchedNodes.map(node => node.id));
    const adjacent = new Set();
    for (const edge of edges) {
      if (touchedIds.has(edge.source)) adjacent.add(edge.target);
      if (touchedIds.has(edge.target)) adjacent.add(edge.source);
    }
    const relatedFiles = [...new Set(graph.nodes.filter(node => adjacent.has(node.id))
      .map(sourceFile).filter(file => file && !changed.has(file)))].sort();
    // Save scoped query evidence as well as the structural impact across ALL changed files.
    // Bound CLI calls so large changes do not start one Python process per symbol.
    const seeds = [...new Set(touchedNodes.map(sourceFile))].slice(0, 3).map(file =>
      touchedNodes.find(node => sourceFile(node) === file).id);
    const queries = seeds.map(seed => ({
      seed,
      output: graphify(['query', 'commit impact', '--seed', seed, '--budget', '800', '--graph', graphPath]),
    }));
    if (indexHash(root) !== fingerprint) {
      throw new Error('The Git index changed during Graphify analysis. Retry the commit against the new staged files.');
    }
    const evidence = {
      checkedAt: new Date().toISOString(), mode, indexSha256: fingerprint,
      graphifyVersion: expectedVersion, codeOnly: true,
      nodes: graph.nodes.length, edges: edges.length,
      changedFiles, changedNodes: touchedNodes.length, relatedFiles,
      filesWithoutGraphNodes: changedFiles.filter(file => !touchedNodes.some(node => sourceFile(node) === file)),
      warnings: extraction.split(/\r?\n/).filter(line => /warning:|syntax error|failed/i.test(line)),
      queries,
    };
    const evidenceDirectory = path.join(root, '.evergreen/graphify');
    fs.mkdirSync(evidenceDirectory, { recursive: true });
    const evidencePath = path.join(evidenceDirectory, `${fingerprint}.json`);
    fs.writeFileSync(evidencePath, JSON.stringify(evidence, null, 2) + '\n');
    console.log(`[graphify] ${evidence.nodes} nodes, ${evidence.edges} edges; ${touchedNodes.length} changed nodes, ${relatedFiles.length} related files.`);
    if (relatedFiles.length) console.log(`[graphify] Review related files: ${relatedFiles.slice(0, 12).join(', ')}${relatedFiles.length > 12 ? ' …' : ''}`);
    console.log(`[graphify] Evidence: ${path.relative(root, evidencePath)}. Graph extraction is not business, security or test approval.`);
    return evidence;
  } finally {
    cleanTemporaryDirectory(scratch);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv[2] === 'install-hooks') installHooks();
    else checkCommit({ mode: process.argv[2] || 'staged' });
  } catch (error) {
    console.error(`[graphify] COMMIT CHECK FAILED: ${error.message}`);
    console.error('[graphify] See docs/GRAPHIFY.md for setup and recovery.');
    process.exitCode = 1;
  }
}
