import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { checkCommit, installHooks } from './commit-check.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'evergreen-graphify-test-'));
  t.after(() => {
    const resolved = fs.realpathSync(root);
    assert.equal(path.dirname(resolved), fs.realpathSync(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith('evergreen-graphify-test-'));
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  const git = args => {
    const result = spawnSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout;
  };
  git(['init', '-q']);
  fs.mkdirSync(path.join(root, 'scripts/graphify'), { recursive: true });
  fs.writeFileSync(path.join(root, 'scripts/graphify/requirements.txt'), 'graphifyy[sql]==0.9.102\n');
  fs.writeFileSync(path.join(root, '.gitignore'), '.evergreen/\nsnapshot.txt\n');
  fs.writeFileSync(path.join(root, 'service.ts'), 'export function stagedVersion() {}\n');
  git(['add', '.']);
  const fake = path.join(root, 'fake-graphify.mjs');
  fs.writeFileSync(fake, `
import fs from 'node:fs';
import path from 'node:path';
const [scenario, ...args] = process.argv.slice(2);
if (args[0] === '--version') console.log('graphify ' + (scenario === 'version' ? '0.0.0' : '0.9.102'));
else if (args[0] === 'extract') {
  if (scenario === 'failure') process.exit(7);
  const source = args[1];
  fs.writeFileSync('snapshot.txt', source);
  if (scenario !== 'missing') {
    const output = path.join(source, 'graphify-out');
    fs.mkdirSync(output, {recursive: true});
    const stagedSource = fs.readFileSync(path.join(source, 'service.ts'), 'utf8');
    const nodes = scenario === 'empty' ? [] : [
      {id: 'service', label: stagedSource.trim(), source_file: 'service.ts'},
      {id: 'caller', label: 'caller()', source_file: 'caller.ts'},
    ];
    fs.writeFileSync(path.join(output, 'graph.json'), JSON.stringify({nodes, edges: [{source: 'caller', target: 'service', relation: 'calls'}]}));
    console.log('AST extraction complete');
    if (scenario === 'warning') console.error('warning: fixture parser limitation');
  }
} else if (args[0] === 'query') {
  const graph = JSON.parse(fs.readFileSync(args[args.indexOf('--graph') + 1], 'utf8'));
  console.log('Scoped impact for ' + graph.nodes[0].label);
} else process.exit(9);
`);
  const command = scenario => [process.execPath, fake, scenario];
  return { root, git, command };
}

test('checks staged content, preserves unstaged edits and index, saves impact, cleans its snapshot', t => {
  const { root, git, command } = fixture(t);
  fs.writeFileSync(path.join(root, 'service.ts'), 'export function unstagedVersion() {}\n');
  const before = git(['ls-files', '--stage', '-z']);
  const evidence = checkCommit({ root, graphifyCommand: command('success') });
  assert.match(evidence.queries[0].output, /stagedVersion/);
  assert.doesNotMatch(evidence.queries[0].output, /unstagedVersion/);
  assert.deepEqual(evidence.relatedFiles, ['caller.ts']);
  assert.equal(git(['ls-files', '--stage', '-z']), before);
  assert.match(fs.readFileSync(path.join(root, 'service.ts'), 'utf8'), /unstagedVersion/);
  assert.ok(fs.existsSync(path.join(root, '.evergreen/graphify', evidence.indexSha256 + '.json')));
  assert.equal(fs.existsSync(fs.readFileSync(path.join(root, 'snapshot.txt'), 'utf8')), false);
});

test('fails closed on CLI failure, missing output, empty graph and version mismatch', t => {
  const { root, command } = fixture(t);
  for (const [scenario, error] of [['failure', /failed/], ['missing', /did not produce/],
    ['empty', /empty or invalid/], ['version', /Expected graphify/]]) {
    assert.throws(() => checkCommit({ root, graphifyCommand: command(scenario) }), error);
  }
  assert.equal(fs.existsSync(path.join(root, '.evergreen/graphify')), false);
});

test('refuses evidence when the index changes during extraction', t => {
  const { root, git, command } = fixture(t);
  assert.throws(() => checkCommit({ root, graphifyCommand: command('success'), onExtract() {
    fs.writeFileSync(path.join(root, 'service.ts'), 'export function concurrentChange() {}\n');
    git(['add', 'service.ts']);
  } }), /index changed/);
  assert.equal(fs.existsSync(path.join(root, '.evergreen/graphify')), false);
});

test('retains parser warnings and runs on a documentation-only commit', t => {
  const { root, git, command } = fixture(t);
  git(['-c', 'user.name=Graphify Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'fixture']);
  fs.writeFileSync(path.join(root, 'review.md'), '# Review\n');
  git(['add', 'review.md']);
  const evidence = checkCommit({ root, graphifyCommand: command('warning') });
  assert.deepEqual(evidence.changedFiles, ['review.md']);
  assert.deepEqual(evidence.filesWithoutGraphNodes, ['review.md']);
  assert.equal(evidence.nodes, 2);
  assert.match(evidence.warnings[0], /parser limitation/);
});

test('CI checks a clean commit and rejects dirty or staged modifications', t => {
  const { root, git, command } = fixture(t);
  git(['-c', 'user.name=Graphify Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'fixture']);
  assert.equal(checkCommit({ root, mode: 'ci', graphifyCommand: command('success') }).mode, 'ci');
  fs.writeFileSync(path.join(root, 'service.ts'), 'export const dirty = true;\n');
  assert.throws(() => checkCommit({ root, mode: 'ci', graphifyCommand: command('success') }), /failed/);
  git(['add', 'service.ts']);
  assert.throws(() => checkCommit({ root, mode: 'ci', graphifyCommand: command('success') }), /failed/);
});

test('hook setup is repeatable and preserves existing hook configurations', t => {
  const { root, git } = fixture(t);
  fs.mkdirSync(path.join(root, '.githooks'));
  fs.writeFileSync(path.join(root, '.githooks/pre-commit'), '#!/bin/sh\nexit 0\n');
  fs.writeFileSync(path.join(root, '.git/hooks/pre-commit'), '#!/bin/sh\nexit 0\n');
  assert.throws(() => installHooks(root), /Existing Git hooks/);
  fs.renameSync(path.join(root, '.git/hooks/pre-commit'), path.join(root, '.git/hooks/pre-commit.backup'));
  installHooks(root);
  installHooks(root);
  assert.equal(git(['config', '--local', '--get', 'core.hooksPath']).trim(), '.githooks');
  git(['config', '--local', 'core.hooksPath', '.husky']);
  assert.throws(() => installHooks(root), /Existing core.hooksPath/);
  assert.equal(git(['config', '--local', '--get', 'core.hooksPath']).trim(), '.husky');
});

test('real Graphify builds and queries staged TypeScript while preserving unstaged code', {
  skip: process.env.GRAPHIFY_INTEGRATION !== '1',
}, t => {
  const { root, git } = fixture(t);
  const index = git(['ls-files', '--stage', '-z']);
  fs.writeFileSync(path.join(root, 'service.ts'), 'export function unstagedVersion() {}\n');
  const evidence = checkCommit({ root });
  assert.ok(evidence.nodes > 0);
  assert.match(evidence.queries[0].output, /stagedVersion/);
  assert.doesNotMatch(evidence.queries[0].output, /unstagedVersion/);
  assert.equal(git(['ls-files', '--stage', '-z']), index);
  assert.match(fs.readFileSync(path.join(root, 'service.ts'), 'utf8'), /unstagedVersion/);
});
