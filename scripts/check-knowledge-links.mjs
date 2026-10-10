import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : entry.name.endsWith('.md') ? [path.join(dir, entry.name)] : []);
const failures = [];
let checked = 0;
for (const file of walk(path.join(root, 'docs'))) {
  const text = fs.readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
  for (const [, href] of text.matchAll(/\]\(([^)]+)\)/g)) {
    if (/^(?:https?:|mailto:|#)/i.test(href)) continue;
    const target = href.split('#')[0];
    if (!target || target.includes('${')) continue;
    checked++;
    if (!fs.existsSync(path.resolve(path.dirname(file), decodeURIComponent(target)))) failures.push(`${path.relative(root, file)} → ${href}`);
  }
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`Verified ${checked} local documentation links.`);
