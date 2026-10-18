import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { renderRoadmap, updateReport } from './roadmap-audit.mjs';
import { listSourceFiles } from './project-audit.mjs';
import { checkKnowledgeLinks } from './check-knowledge-links.mjs';
test('present sources are reported without a release claim', () => {
  const report = renderRoadmap(() => true);
  assert.ok(!report.includes('MISSING'));
  assert.ok(report.includes('certifies no release'));
  assert.ok(report.includes('[source](../../apps/api/src/services/prisma.service.ts)'));
});
test('missing sources remain visible without completion claims', () => {
  const report = renderRoadmap(() => false);
  assert.ok((report.match(/- MISSING:/g) || []).length >= 14);
  assert.ok(report.includes('0/4'));
});
function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'evergreen-audit-'));
  t.after(() => {
    assert.equal(dirname(resolve(dir)), resolve(tmpdir()));
    rmSync(dir, { recursive: true });
  });
  return dir;
}
test('check mode detects drift without changing reports and normalizes CRLF', t => {
  const file = join(fixture(t), 'report.md');
  writeFileSync(file, 'old\r\n');
  assert.equal(updateReport(file, 'old\n', true), true);
  assert.equal(updateReport(file, 'new\n', true), false);
  assert.equal(readFileSync(file, 'utf8'), 'old\r\n');
  assert.equal(updateReport(file, 'new\n'), true);
  assert.equal(readFileSync(file, 'utf8'), 'new\n');
});
test('inventory omits secrets and packaged/generated copies', t => {
  const dir = fixture(t);
  for (const folder of ['src', 'dist', 'node_modules', 'backend']) mkdirSync(join(dir, folder));
  for (const file of ['src/main.ts', 'src/main.test.ts', 'Dockerfile', '.env.json', 'package-lock.json', 'dist/main.js', 'node_modules/index.js', 'backend/index.js']) writeFileSync(join(dir, file), '');
  assert.deepEqual(listSourceFiles(dir), ['Dockerfile', 'src/main.test.ts', 'src/main.ts']);
});

test('link check covers entry guides and workspace READMEs without treating archives as current guides', t => {
  const dir = fixture(t);
  for (const folder of ['docs', 'apps/web', 'backups']) mkdirSync(join(dir, folder), { recursive: true });
  writeFileSync(join(dir, 'README.md'), '[missing license](LICENSE)\n[external](https://example.com)');
  writeFileSync(join(dir, 'apps/web/README.md'), '[missing setup](missing.md)');
  writeFileSync(join(dir, 'docs/guide.md'), '[root](../README.md)\n[bad escape](bad%zz.md)');
  writeFileSync(join(dir, 'backups/old.md'), '[historical](missing.md)');
  const result = checkKnowledgeLinks(dir);
  assert.equal(result.checked, 4);
  assert.equal(result.failures.length, 3);
  assert.ok(result.failures.some(f => f.endsWith('README.md → LICENSE')));
  assert.ok(result.failures.some(f => f.endsWith('guide.md → bad%zz.md')));
});

test('link check handles spaced paths, titles and fenced examples', t => {
  const dir = fixture(t);
  writeFileSync(join(dir, 'Guide with spaces.md'), '# Guide');
  writeFileSync(join(dir, 'README.md'), [
    '[angle](<Guide with spaces.md>)',
    '[encoded](Guide%20with%20spaces.md "Guide")',
    '[section](#setup)',
    '```md\n[example](absent.md)\n```',
    '~~~md\n[example](absent.md)\n~~~',
  ].join('\n'));
  assert.deepEqual(checkKnowledgeLinks(dir), { checked: 2, failures: [] });
});
