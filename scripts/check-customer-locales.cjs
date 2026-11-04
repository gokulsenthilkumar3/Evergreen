const ts = require('typescript');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../apps/web/src');
const ast = (file) => ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
const keys = new Set();
function visit(node, callback) { callback(node); ts.forEachChild(node, child => visit(child, callback)); }
const normalize = text => text.trim().replace(/\s+/g, ' ');
visit(ast(path.join(root, 'locales/ta.ts')), node => { if (ts.isPropertyAssignment(node) && ts.isStringLiteral(node.name)) keys.add(normalize(node.name.text)); });
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]); }
const missing = new Map();
for (const file of walk(root).filter(file => /\.tsx?$/.test(file) && !/\.test\.|[\\/]test[\\/]/.test(file))) {
  visit(ast(file), node => {
    if (ts.isTaggedTemplateExpression(node) && (node.tag.getText() === 'uiTemplate' || (ts.isCallExpression(node.tag) && node.tag.expression.getText() === 'uiScopedTemplate'))) {
      const template = node.template;
      const key = ts.isNoSubstitutionTemplateLiteral(template) ? template.text : template.head.text + template.templateSpans.map((span, index) => `{${index}}${span.literal.text}`).join('');
      if (!keys.has(normalize(key)) && /[a-z]/i.test(key)) missing.set(key, (missing.get(key) || 0) + 1);
    }
    if (!ts.isCallExpression(node) || node.expression.getText() !== 'uiText' || !node.arguments[0]) return;
    visit(node.arguments[0], child => {
      if (!ts.isStringLiteral(child)) return;
      const key = child.text.trim().replace(/\s+/g, ' ');
      if (!keys.has(key) && /[a-z]/i.test(key)) missing.set(key, (missing.get(key) || 0) + 1);
    });
  });
}
console.log(JSON.stringify([...missing].sort((a, b) => b[1] - a[1])));
