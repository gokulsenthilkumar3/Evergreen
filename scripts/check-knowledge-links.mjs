import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const walk = dir => !fs.existsSync(dir) ? [] : fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  if (entry.isSymbolicLink()) return [];
  if (entry.isDirectory()) return walk(path.join(dir, entry.name));
  return entry.isFile() && entry.name.endsWith('.md') ? [path.join(dir, entry.name)] : [];
});

export function checkKnowledgeLinks(base = root) {
  const rootGuides = fs.readdirSync(base, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
    .map(entry => path.join(base, entry.name));
  const workspaceGuides = ['apps', 'packages'].flatMap(parent => {
    const directory = path.join(base, parent);
    if (!fs.existsSync(directory)) return [];
    return fs.readdirSync(directory, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => path.join(directory, entry.name, 'README.md'))
      .filter(file => fs.existsSync(file));
  });
  const failures = [];
  let checked = 0;
  for (const file of [...rootGuides, ...workspaceGuides, ...walk(path.join(base, 'docs'))]) {
    const text = fs.readFileSync(file, 'utf8').replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, '');
    for (const [, href] of text.matchAll(/\]\(([^)]+)\)/g)) {
      // Support angle-bracket paths (including spaces) and optional link titles.
      const destination = href.startsWith('<') ? href.slice(1, href.indexOf('>')) : href.replace(/\s+["'][\s\S]*$/, '');
      if (/^(?:[a-z][a-z\d+.-]*:|#|\/\/)/i.test(destination)) continue;
      const target = destination.split(/[?#]/)[0];
      if (!target || target.includes('${')) continue;
      checked++;
      try {
        if (fs.existsSync(path.resolve(path.dirname(file), decodeURIComponent(target)))) continue;
      } catch {
        // Malformed URL escapes are broken links, not a reason to skip the rest.
      }
      failures.push(`${path.relative(base, file)} → ${href}`);
    }
  }
  return { checked, failures };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { checked, failures } = checkKnowledgeLinks();
  if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
  else console.log(`Verified ${checked} local documentation links (root guides, workspace READMEs and docs).`);
}
