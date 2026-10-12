import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const excluded = new Set(['node_modules', '.git', '.pnpm-store', 'dist', 'build', 'coverage', '.next', '.turbo']);
const files = [];
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory() && !excluded.has(entry.name)) walk(path);
    else if (entry.isFile() && /\.md$/i.test(entry.name)) files.push(path);
  }
}
walk(root);
const documents = files.sort().map(path => {
  const source = readFileSync(path);
  const lines = source.toString('utf8').split(/\r?\n/);
  const name = relative(root, path).replaceAll('\\', '/');
  const select = pattern => lines.flatMap((text, index) => pattern.test(text) ? [{ line: index + 1, text: text.trim() }] : []);
  return {
    path: name,
    category: name.startsWith('backups/') ? 'archived reference' : name.startsWith('docs/audits/') ? 'dated audit' : name.startsWith('docs/reference/') || name.startsWith('docs/wiki/pages/') ? 'source reference' : 'project guidance',
    bytes: source.length,
    sha256: createHash('sha256').update(source).digest('hex'),
    lines: lines.length,
    headings: select(/^#{1,3}\s/),
    uncheckedTasks: select(/^\s*[-*]\s+\[ \]/),
    // These are claims to review, never automatic proof of implementation.
    statusClaims: select(/\b(unverified|not implemented|remaining|pending|blocked|not ready|fully implemented|production.ready|still open|not complete)\b/i),
  };
});
const output = process.argv[2];
if (output) writeFileSync(resolve(output), JSON.stringify({ excludedDirectories: [...excluded], documents }, null, 2) + '\n');
const categoryCounts = Object.fromEntries([...new Set(documents.map(row => row.category))].map(category => [category, documents.filter(row => row.category === category).length]));
console.log(JSON.stringify({ files: documents.length, bytes: documents.reduce((sum, row) => sum + row.bytes, 0), categoryCounts, output: output || null }, null, 2));
for (const row of documents) console.log(`${row.path} | ${row.lines} lines | ${row.uncheckedTasks.length} unchecked | ${row.statusClaims.length} status claims | ${row.headings.slice(0, 3).map(h => h.text.replace(/^#+\s*/, '')).join(' / ')}`);
