import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { skills, taxonomy } from './catalog.mjs';
const root = fileURLToPath(new URL('.', import.meta.url));
assert.equal(taxonomy.length, 310);
assert.equal(new Set(taxonomy.map(t => t.id)).size, 310);
for (const t of taxonomy) assert.ok(skills.some(s => s.id === t.skill), `Missing owner for ${t.id}`);
for (const s of skills) {
  const card = await readFile(path.join(root, 'skills', s.id, 'SKILL.md'), 'utf8');
  assert.ok(card.startsWith(`---\nname: evergreen-${s.id}\ndescription:`));
  for (const related of s.related) assert.ok(skills.some(item => item.id === related));
}
async function links(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await links(file);
    else if (entry.name.endsWith('.md')) {
      const content = await readFile(file, 'utf8');
      for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
        if (!/^(https?:|#)/.test(match[1])) await readFile(path.resolve(dir, match[1].split('#')[0]));
      }
    }
  }
}
await links(root);
const contracts = JSON.parse(await readFile(path.join(root, 'tools.json'), 'utf8'));
for (const tool of contracts.functions) {
  assert.equal(tool.parameters.additionalProperties, false);
  for (const field of tool.parameters.required) assert.ok(field in tool.parameters.properties);
}
JSON.parse(await readFile(path.join(root, 'memory.schema.json'), 'utf8'));
const cases = JSON.parse(await readFile(path.join(root, 'evals/scenarios.json'), 'utf8'));
assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
for (const c of cases) for (const id of c.skills) assert.ok(skills.some(s => s.id === id));
console.log(`Validated ${skills.length} cards, ${taxonomy.length} concern mappings, local links, tool-contract structure and ${cases.length} behavioral scenario definitions. Behavioral scenarios have not been executed by this structural check.`);
