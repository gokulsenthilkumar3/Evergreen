import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { checkBrowserBoundaries } from './check-browser-boundaries.mjs';

test('finds static, dynamic and transitive Node imports while allowing type-only declarations', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'evergreen-browser-boundary-'));
  t.after(() => {
    const resolved = fs.realpathSync(root);
    assert.equal(path.dirname(resolved), fs.realpathSync(os.tmpdir()));
    assert.match(path.basename(resolved), /^evergreen-browser-boundary-/);
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  const directory = path.join(root, 'apps/web/src');
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'entry.ts'), "import type { Stats } from 'node:fs';\nimport './shared';\nimport('@evergreen/types/licensing');");
  fs.writeFileSync(path.join(directory, 'shared.ts'), "export { readFileSync } from 'node:fs';");
  const result = checkBrowserBoundaries(root);
  assert.equal(result.failures.length, 2);
  assert.ok(result.failures.some(value => value.includes('shared.ts')));
  assert.ok(result.failures.some(value => value.includes('licensing')));
});
