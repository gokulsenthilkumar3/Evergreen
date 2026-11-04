// Presentation-only second pass for module cards, tutorials, static options and feedback.
const ts = require('typescript');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../apps/web/src');
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]); }
for (const file of walk(root).filter(f => f.endsWith('.tsx') && !/test|ShopPortal|LanguageSelector/.test(f))) {
  const source = fs.readFileSync(file, 'utf8');
  const ast = ts.createSourceFile(file, source, 99, true, ts.ScriptKind.TSX);
  const edits = [];
  function visit(node) {
    if (ts.isPropertyAssignment(node) && ts.isStringLiteral(node.initializer) && ['title','description','label','short','detail','check','action'].includes(node.name.getText(ast))) {
      let parent = node.parent;
      while (parent && !ts.isVariableDeclaration(parent)) parent = parent.parent;
      // Explicit source-owned UI collections only. Never alter transaction payloads.
      if (parent && /^(TUTORIAL_CHAPTERS|steps|modules|THEME_OPTIONS)$/.test(parent.name.getText(ast))) {
        edits.push({ start: node.getStart(ast), end: node.end, text: `get ${node.name.getText(ast)}() { return uiText(${JSON.stringify(node.initializer.text)}); }` });
      }
    }
    if (ts.isCallExpression(node) && /^toast\.(success|error|info|warning)$/.test(node.expression.getText(ast))) {
      const arg = node.arguments[0];
      if (arg && (ts.isStringLiteral(arg) || ts.isBinaryExpression(arg))) edits.push({start: arg.getStart(ast), end: arg.end, text: `uiText(${arg.getText(ast)})`});
    }
    // Explicit accessibility labels nested in MUI inputProps.
    if (ts.isPropertyAssignment(node) && ts.isStringLiteral(node.name) && node.name.text === 'aria-label' && ts.isStringLiteral(node.initializer)) {
      edits.push({start:node.initializer.getStart(ast),end:node.initializer.end,text:`uiText(${JSON.stringify(node.initializer.text)})`});
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  if (!edits.length) continue;
  let output = source;
  for (const e of edits.sort((a,b) => b.start-a.start)) output = output.slice(0,e.start)+e.text+output.slice(e.end);
  if (!/import \{[^}]*uiText/.test(output)) {
    let rel = path.relative(path.dirname(file), path.join(root,'i18n')).replaceAll('\\','/');
    if (!rel.startsWith('.')) rel = './'+rel;
    output = `import { uiText } from ${JSON.stringify(rel)};\n`+output;
  }
  fs.writeFileSync(file,output);
}
