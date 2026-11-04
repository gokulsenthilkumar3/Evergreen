import fs from 'node:fs';
import path from 'node:path';
import { builtinModules, createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const ts = require('typescript');
const builtins = new Set(builtinModules.flatMap(name => [name, name.replace(/^node:/, '')]));
const normalize = file => file.replaceAll('\\', '/');

export function checkBrowserBoundaries(root = repository) {
  const failures = [];
  const visited = new Set();
  function inspect(file, options = {}) {
    file = path.resolve(file);
    if (visited.has(file) || !fs.existsSync(file) || /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(file)) return;
    visited.add(file);
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    function dependency(specifier, typeOnly = false) {
      if (typeOnly) return;
      const forbidden = specifier.startsWith('node:') || builtins.has(specifier) ||
        /^@prisma\//.test(specifier) || /^@evergreen\/(?:database|admin-database|email)(?:\/|$)/.test(specifier) ||
        /^@evergreen\/types\/(?:ai-server|licensing(?:-online)?)(?:$|\.)/.test(specifier);
      const resolved = ts.resolveModuleName(specifier, file, options, ts.sys).resolvedModule?.resolvedFileName;
      if (forbidden || (resolved && /\/packages\/types\/(?:ai-server|licensing(?:-online)?)\.[jt]s$/.test(normalize(resolved)))) {
        failures.push(`${normalize(path.relative(root, file))}: server runtime import ${specifier}`);
      } else if (resolved && !normalize(resolved).includes('/node_modules/') && !resolved.endsWith('.d.ts')) inspect(resolved, options);
    }
    function visit(node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        dependency(node.moduleSpecifier.text, node.isTypeOnly || node.importClause?.isTypeOnly);
      }
      if (ts.isCallExpression(node) && node.arguments[0] && ts.isStringLiteral(node.arguments[0]) &&
          (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) dependency(node.arguments[0].text);
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  for (const app of ['web', 'admin-web', 'marketing-web']) {
    const directory = path.join(root, 'apps', app);
    const configFile = ['tsconfig.app.json', 'tsconfig.json'].map(name => path.join(directory, name)).find(fs.existsSync);
    const options = configFile ? ts.parseJsonConfigFileContent(ts.readConfigFile(configFile, ts.sys.readFile).config, ts.sys, directory).options : {};
    const walk = folder => {
      if (!fs.existsSync(folder)) return;
      for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
        const file = path.join(folder, entry.name);
        if (entry.isDirectory() && !['node_modules', 'dist', 'test', '__tests__'].includes(entry.name)) walk(file);
        else if (entry.isFile() && /\.[cm]?[jt]sx?$/.test(entry.name)) inspect(file, options);
      }
    };
    walk(path.join(directory, 'src'));
  }
  const manifest = path.join(root, 'packages/types/package.json');
  if (fs.existsSync(manifest)) {
    const exports = JSON.parse(fs.readFileSync(manifest, 'utf8')).exports;
    for (const name of ['./ai-server', './licensing', './licensing-online']) {
      if (exports?.[name]?.browser !== null) failures.push(`packages/types/package.json: ${name} must have browser: null`);
    }
  }
  return { checked: visited.size, failures };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = checkBrowserBoundaries();
  if (result.failures.length) { console.error(result.failures.join('\n')); process.exitCode = 1; }
  else console.log(`Verified browser/server boundaries across ${result.checked} source files.`);
}
