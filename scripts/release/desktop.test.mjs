import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { copyDependencies, updateConfiguration, desktopResources, verifyDesktopResources } from './desktop.mjs';

test('release updates require HTTPS, a publisher and a feed without embedded credentials', () => {
  assert.deepEqual(updateConfiguration({}), { enabled: false });
  for (const url of ['http://example.test/', 'https://user:secret@example.test/', 'https://example.test/?token=secret']) {
    assert.throws(() => updateConfiguration({ EVERGREEN_UPDATE_URL: url, EVERGREEN_WINDOWS_PUBLISHER: 'Example Publisher' }));
  }
  assert.throws(() => updateConfiguration({ EVERGREEN_UPDATE_URL: 'https://example.test/releases/' }));
  assert.equal(updateConfiguration({ EVERGREEN_UPDATE_URL: 'https://example.test/releases/', EVERGREEN_WINDOWS_PUBLISHER: 'Example Publisher' }).enabled, true);
});
test('runtime copying preserves nested package versions and excludes local secrets', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'evergreen-package-'));
  t.after(() => { assert.equal(path.dirname(path.resolve(directory)), path.resolve(os.tmpdir())); fs.rmSync(directory, { recursive: true }); });
  const source = path.join(directory, 'source'), output = path.join(directory, 'artifact');
  const pkg = (location, name, version, dependencies = {}) => {
    fs.mkdirSync(location, { recursive: true });
    fs.writeFileSync(path.join(location, 'package.json'), JSON.stringify({ name, version, main: 'index.js', dependencies }));
    fs.writeFileSync(path.join(location, 'index.js'), `module.exports = '${version}'`);
  };
  pkg(source, 'fixture', '1.0.0');
  pkg(path.join(source, 'node_modules/first'), 'first', '1.0.0', { shared: '*' });
  pkg(path.join(source, 'node_modules/second'), 'second', '1.0.0', { shared: '*' });
  pkg(path.join(source, 'node_modules/shared'), 'shared', '1.0.0');
  pkg(path.join(source, 'node_modules/second/node_modules/shared'), 'shared', '2.0.0');
  fs.writeFileSync(path.join(source, 'node_modules/first/.env'), 'SECRET=fixture');
  fs.writeFileSync(path.join(source, 'node_modules/first/test.db-wal'), 'fixture');
  for (const file of ['index.d.ts', 'index.js.map', 'README.md', 'LICENSE.md', 'NOTICE', 'schema.prisma']) {
    fs.writeFileSync(path.join(source, 'node_modules/first', file), 'fixture');
  }
  copyDependencies({ first: '*', second: '*' }, source, output);
  const firstRequire = createRequire(path.join(output, 'node_modules/first/package.json'));
  const secondRequire = createRequire(path.join(output, 'node_modules/second/package.json'));
  assert.equal(firstRequire('shared'), '1.0.0');
  assert.equal(secondRequire('shared'), '2.0.0');
  assert.equal(fs.existsSync(path.join(output, 'node_modules/first/.env')), false);
  assert.equal(fs.existsSync(path.join(output, 'node_modules/first/test.db-wal')), false);
  for (const file of ['index.d.ts', 'index.js.map', 'README.md']) assert.equal(fs.existsSync(path.join(output, 'node_modules/first', file)), false);
  for (const file of ['LICENSE.md', 'NOTICE', 'schema.prisma']) assert.equal(fs.existsSync(path.join(output, 'node_modules/first', file)), true);
});

test('Electron Builder preserves runtime dependencies in final resources and rejects omissions', async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'evergreen-resources-'));
  t.after(() => { assert.equal(path.dirname(path.resolve(directory)), path.resolve(os.tmpdir())); fs.rmSync(directory, { recursive: true }); });
  const prepared = { stage: path.join(directory, 'stage'), runtime: path.join(directory, 'stage/runtime') };
  const resources = path.join(directory, 'resources');
  for (const [file, data] of Object.entries({
    'runtime/package.json': '{}',
    'runtime/node_modules/@evergreen/types/dist/licensing.js': 'exports.licensed = true;',
    'runtime/node_modules/.prisma/client/query-engine.node': 'fixture-native-engine',
    'runtime/node_modules/first/node_modules/shared/index.js': 'fixture-nested-dependency',
    'web/index.html': '<h1>EverGreen</h1>',
  })) {
    const target = path.join(prepared.stage, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, data);
  }
  const require = createRequire(import.meta.url);
  const { getFileMatchers, copyFiles } = require('app-builder-lib/out/fileMatcher.js');
  const copy = mappings => copyFiles(getFileMatchers({ extraResources: mappings }, 'extraResources', resources, {
    defaultSrc: prepared.stage, globalOutDir: resources, customBuildOptions: {}, macroExpander: value => value,
  }));
  // Reproduce the original missing-module failure with the actual builder copier.
  const mappings = desktopResources(prepared);
  await copy(mappings.filter(mapping => mapping.to !== 'runtime/node_modules'));
  assert.throws(() => verifyDesktopResources(prepared, resources), /does not match/);
  await copy(mappings);
  assert.doesNotThrow(() => verifyDesktopResources(prepared, resources));
  const packagedRequire = createRequire(path.join(resources, 'runtime/package.json'));
  assert.equal(packagedRequire('@evergreen/types/dist/licensing.js').licensed, true);
});
