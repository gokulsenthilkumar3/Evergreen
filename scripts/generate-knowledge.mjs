import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, 'apps/web/package.json'));
const ts = require('typescript');
const check = process.argv.includes('--check');
const changed = [];
const escape = value => String(value).replaceAll('|', '\\|').replace(/\s+/g, ' ').trim();
const code = value => '`' + escape(value).replaceAll('`', "'") + '`';
// Build output (dist) and dependencies are not source; indexing them makes the docs depend on build order.
const walk = folder => fs.readdirSync(path.join(root, folder), { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? (["dist", "node_modules"].includes(entry.name) ? [] : walk(`${folder}/${entry.name}`)) : [`${folder}/${entry.name}`]).filter(file => /\.tsx?$/.test(file) && !/\.(test|spec)\./.test(file));
const parse = file => ts.createSourceFile(file, fs.readFileSync(path.join(root, file), 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
const visit = (node, fn) => { fn(node); ts.forEachChild(node, child => visit(child, fn)); };
const write = (file, content) => {
  // This page is a maintained operating guide; API/control references remain generated.
  if (file === 'docs/wiki/pages/Integrations.md') return;
  const text = content.join('\n') + '\n';
  if (fs.existsSync(path.join(root, file)) && fs.readFileSync(path.join(root, file), 'utf8') === text) return;
  changed.push(file);
  if (!check) { fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true }); fs.writeFileSync(path.join(root, file), text); }
};
const sourceLink = (file, node, sf, prefix = '../../') => `[${file}:${sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1}](${prefix}${file})`;
const value = node => node && (ts.isStringLiteralLike(node) ? node.text : node.getText());
const props = node => Object.fromEntries(node.properties.filter(ts.isPropertyAssignment).map(prop => [prop.name.getText().replace(/^['"]|['"]$/g, ''), value(prop.initializer)]));

const app = fs.readFileSync(path.join(root, 'apps/web/src/App.tsx'), 'utf8');
const imports = new Map([...app.matchAll(/const (\w+) = lazy\(\(\) => import\('([^']+)'\)\)/g)].map(([, name, file]) => [name, `apps/web/src/${file.replace(/^\.\//, '')}.tsx`]));
const routes = [...app.matchAll(/currentPage === '([^']+)'[\s\S]{0,90}?<(\w+)/g)].filter(([, , component]) => imports.has(component)).map(([, route, component]) => ({ route, component, file: imports.get(component) }));
const pages = walk('apps/web/src/pages').sort();
const wiki = ['# Page-level wiki', '', 'Generated with `npm run docs:generate`. Source-derived controls and API calls are reference evidence, not proof of operational acceptance. Historical page files that are not directly mounted are labelled explicitly.', '', '[Architecture](../ARCHITECTURE.md) · [Operating guide](OPERATING_GUIDE.md) · [Commercial model](../COMMERCIAL_MODEL.md) · [Integration contracts](../INTEGRATIONS.md)', '', '| Page | Direct routes | Knowledge page |', '| --- | --- | --- |'];
const controls = ['# UI controls and tabs', '', 'Generated from every active-source UI file. Labels expressed in code are preserved as expressions; arrays and child components must be read through their source links. This includes retained components that may not currently be mounted.', '', '| Source | Control | Label / expression | Handler |', '| --- | --- | --- | --- |'];
let controlCount = 0;
for (const file of walk('apps/web/src').sort()) {
  const sf = parse(file);
  visit(sf, node => {
    if (!ts.isJsxOpeningElement(node) && !ts.isJsxSelfClosingElement(node)) return;
    const tag = node.tagName.getText(sf);
    if (!['Tab', 'Tabs', 'Button', 'IconButton', 'TextField', 'Select', 'ToggleButton', 'StepLabel'].includes(tag)) return;
    const attrs = Object.fromEntries(node.attributes.properties.filter(ts.isJsxAttribute).map(attr => [attr.name.getText(sf), attr.initializer ? value(attr.initializer) : 'true']));
    const label = attrs.label || attrs['aria-label'] || (ts.isJsxElement(node.parent) ? node.parent.children.map(child => child.getText(sf)).join(' ') : '') || attrs.value || '(container)';
    controls.push(`| ${sourceLink(file, node, sf)} | ${tag} | ${escape(label).slice(0, 400)} | ${code(attrs.onClick || attrs.onChange || '')} |`);
    controlCount++;
  });
}
for (const file of pages) {
  const sf = parse(file), tabs = [], calls = [], dependencies = [], actions = [];
  visit(sf, node => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text.startsWith('.')) {
      const base = path.posix.normalize(path.posix.join(path.posix.dirname(file), node.moduleSpecifier.text));
      const resolved = [base + '.tsx', base + '.ts', base + '/index.ts'].find(p => fs.existsSync(path.join(root, p)));
      if (resolved) dependencies.push(`[${path.posix.basename(resolved)}](../../../${resolved})`);
    }
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.expression.getText(sf) === 'api') {
      const method = node.expression.name.text;
      if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) calls.push(`| ${method.toUpperCase()} | ${code(value(node.arguments[0]))} | ${sourceLink(file, node, sf, '../../../')} |`);
    }
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const tag = node.tagName.getText(sf);
      const attrs = Object.fromEntries(node.attributes.properties.filter(ts.isJsxAttribute).map(attr => [attr.name.getText(sf), value(attr.initializer)]));
      if (tag === 'Tab') tabs.push(`${attrs.label || attrs.value || 'Dynamic tab'} (${sourceLink(file, node, sf, '../../../')})`);
      if (['Button', 'IconButton'].includes(tag)) {
        const label = attrs['aria-label'] || (ts.isJsxElement(node.parent) ? node.parent.children.map(c => c.getText(sf)).join(' ') : '') || 'Icon action';
        actions.push(`| ${escape(label).slice(0, 300)} | ${code(attrs.onClick || 'delegated / form submit')} | ${sourceLink(file, node, sf, '../../../')} |`);
      }
    }
  });
  const name = path.basename(file, '.tsx');
  const slug = file.replace('apps/web/src/pages/', '').replace(/\.tsx?$/, '').replaceAll('/', '-');
  const ownedRoutes = routes.filter(route => route.file === file).map(route => '/' + route.route);
  wiki.push(`| ${name} | ${ownedRoutes.map(code).join(', ') || 'No direct App mount; retained or composed source'} | [Open](pages/${slug}.md) |`);
  write(`docs/wiki/pages/${slug}.md`, [
    `# ${name}`, '', '[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)', '',
    `Source: [${file}](../../../${file}).`, '',
    `Direct routes: ${ownedRoutes.map(code).join(', ') || '**Not directly mounted by App.tsx.** This file may be composed by another page or retained from an earlier implementation; its existence does not establish a supported route.'}`, '',
    '## Before you start', '', 'Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.', '',
    '## Tabs', '', ...(tabs.length ? tabs.map(tab => `- ${tab}`) : ['No literal Tab controls in this file. Check composed components and dynamic navigation below.']), '',
    '## Actions', '', '| Control / label | Handler | Source |', '| --- | --- | --- |', ...actions, '',
    '## API calls', '', 'Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.', '',
    '| Method | Path expression | Source |', '| --- | --- | --- |', ...calls, '',
    '## Composed behavior', '', ...[...new Set(dependencies)].map(dep => `- ${dep}`), '',
    '## Verify the workflow', '', 'Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.', '',
    'For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).',
  ]);
}
write('docs/wiki/README.md', wiki);
write('docs/reference/UI_CONTROLS.md', controls);

const api = ['# API route reference', '', 'Generated from Nest controller decorators. Default global policy: authenticated VIEWER for GET/HEAD, MODIFIER for other non-delete methods, ADMIN for DELETE; explicit @Roles overrides and @Public bypasses apply. Method signatures show DTOs or legacy any payloads. Additional service validation is linked through source.', '', '| Method | Route | Policy | Handler signature | Source |', '| --- | --- | --- | --- | --- |'];
let endpointCount = 0;
const decorators = node => ts.canHaveDecorators(node) ? ts.getDecorators(node) || [] : [];
const decorator = (node, name) => decorators(node).map(d => d.expression).find(e => ts.isCallExpression(e) && e.expression.getText() === name);
for (const file of walk('apps/api/src').filter(file => file.endsWith('.controller.ts')).sort()) {
  const sf = parse(file);
  visit(sf, node => {
    if (!ts.isClassDeclaration(node)) return;
    const controller = decorator(node, 'Controller');
    if (!controller) return;
    const prefix = value(controller.arguments[0]) || '';
    for (const method of node.members.filter(ts.isMethodDeclaration)) {
      for (const verb of ['Get', 'Post', 'Put', 'Patch', 'Delete', 'Head', 'Options']) {
        const route = decorator(method, verb);
        if (!route) continue;
        const roles = decorator(method, 'Roles') || decorator(node, 'Roles');
        const policy = decorator(method, 'Public') || decorator(node, 'Public') ? 'Public (inspect local guards)' : roles ? roles.arguments.map(value).join(', ') : ['Get', 'Head'].includes(verb) ? 'VIEWER' : verb === 'Delete' ? 'ADMIN' : 'MODIFIER';
        api.push(`| ${verb.toUpperCase()} | ${code('/' + [prefix, value(route.arguments[0])].filter(Boolean).join('/'))} | ${policy} | ${code(method.name.getText(sf) + '(' + method.parameters.map(p => p.getText(sf)).join(', ') + ')')} | ${sourceLink(file, method, sf)} |`);
        endpointCount++;
      }
    }
  });
}
write('docs/reference/API.md', api);

const flowFile = 'apps/web/src/pages/WorkflowDesk.tsx';
const flowSource = parse(flowFile);
const flows = ['# Business workflow actions', '', 'Generated from the action catalogue in WorkflowDesk. Execution and all authoritative quantity, period, ownership, tax and idempotency checks live in [WorkflowsService](../../apps/api/src/modules/workflows/workflows.service.ts).', '', '| Action | Group / intent | Inputs | Line mode | Source |', '| --- | --- | --- | --- | --- |'];
let flowCount = 0;
visit(flowSource, node => {
  if (!ts.isObjectLiteralExpression(node)) return;
  const fields = props(node);
  if (!fields.kind || !fields.title || !fields.group) return;
  flows.push(`| ${code(fields.kind)} — ${escape(fields.title)} | ${escape(fields.group)}: ${escape(fields.description)} | ${code(fields.fields)} | ${fields.lines || 'No lines'} | ${sourceLink(flowFile, node, flowSource)} |`);
  flowCount++;
});
write('docs/reference/WORKFLOWS.md', flows);

const symbols = ['# Code ownership and function index', '', 'Generated declarations and methods from active API, web and shared source. Nested callbacks are not separate public contracts. Use this index to locate implementation; acceptance evidence lives in the tests.', '', '| Symbol | Kind | Source |', '| --- | --- | --- |'];
for (const file of [...walk('apps/api/src'), ...walk('apps/web/src'), ...walk('packages/types')].sort()) {
  const sf = parse(file);
  visit(sf, node => {
    if ((ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isMethodDeclaration(node)) && node.name) symbols.push(`| ${code(node.name.getText(sf))} | ${ts.SyntaxKind[node.kind]} | ${sourceLink(file, node, sf)} |`);
    if (ts.isVariableDeclaration(node) && node.initializer && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) symbols.push(`| ${code(node.name.getText(sf))} | Function binding | ${sourceLink(file, node, sf)} |`);
  });
}
write('docs/reference/CODE_INDEX.md', symbols);
const schema = fs.readFileSync(path.join(root, 'packages/database/prisma/schema.prisma'), 'utf8');
const models = [...schema.matchAll(/^model (\w+) \{([\s\S]*?)^\}/gm)];
write('docs/reference/DATA_MODEL.md', ['# Data model', '', 'Generated from [schema.prisma](../../packages/database/prisma/schema.prisma). SQLite is the current datasource. There is no tenant discriminator on operational models; isolate company installations.', '', ...models.flatMap(([, name, body]) => [`## ${name}`, '', '```prisma', `model ${name} {${body}}`, '```', ''])]);
write('docs/reference/COVERAGE.md', ['# Documentation coverage', '', 'Generated source reference coverage (not test coverage or delivery certification).', '', `- ${pages.length} page files with individual wiki entries.`, `- ${routes.length} direct page render expressions.`, `- ${controlCount} UI controls and tab containers.`, `- ${endpointCount} controller HTTP handlers.`, `- ${flowCount} business workflow actions.`, `- ${models.length} database models.`, '', 'Run `npm run docs:check` in CI. It fails when source changes make generated references stale. Generated page actions are technical references; the operating guide explains cross-page handoffs.']);
if (check && changed.length) { console.error('Stale documentation:\n' + changed.join('\n')); process.exitCode = 1; }
else console.log(`${check ? 'Checked' : 'Generated'} knowledge: ${pages.length} pages, ${endpointCount} endpoints, ${flowCount} workflows; ${changed.length} files ${check ? 'stale' : 'updated'}.`);
