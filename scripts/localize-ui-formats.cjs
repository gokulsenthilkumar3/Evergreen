const ts = require('typescript'), fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '../apps/web/src');
function walk(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]); }
for (const file of walk(root).filter(f=>f.endsWith('.tsx')&&!/test|ShopPortal|TamilOptions|LanguageSelector/.test(f))) {
 let source=fs.readFileSync(file,'utf8'); const imports=new Set();
 // Separate passes keep enclosing templates and inner formatting edits independent.
 for(const pass of ['formats','templates','currency']) {
  const ast=ts.createSourceFile(file,source,99,true,ts.ScriptKind.TSX),edits=[];
  function display(node) {
   let p=node.parent;
   while(p&&!ts.isJsxExpression(p)&&!ts.isJsxElement(p)&&!ts.isStatement(p))p=p.parent;
   if(!p||!ts.isJsxExpression(p))return false;
   return !ts.isJsxAttribute(p.parent)||['label','title','helperText','aria-label'].includes(p.parent.name.getText(ast));
  }
  function visit(node){
   if(pass==='formats' && ts.isCallExpression(node)&&ts.isPropertyAccessExpression(node.expression)) {
    const method=node.expression.name.text;
    if(['toLocaleString','toLocaleDateString','toLocaleTimeString'].includes(method)) {
     const first=node.arguments[0];
     if(!first||ts.isStringLiteral(first)||first.kind===ts.SyntaxKind.UndefinedKeyword||first.getText(ast)==='undefined') {
      imports.add('uiLocale');
      if(first)edits.push({start:first.getStart(ast),end:first.end,text:'uiLocale()'});
      else edits.push({start:node.end-1,end:node.end-1,text:'uiLocale()'});
     }
    }
    if(method==='toFixed'&&display(node)){
     imports.add('formatUiDecimal');
     // Edit the method name/prefix only; nested numeric expressions remain independently editable.
     edits.push({start:node.getStart(ast),end:node.expression.expression.getStart(ast),text:'formatUiDecimal('});
     edits.push({start:node.expression.expression.end,end:node.expression.end+1,text:node.arguments.length?', ':''});
    }
   }
   if(pass==='templates' && (ts.isTemplateExpression(node)||ts.isNoSubstitutionTemplateLiteral(node))&&display(node)&&!ts.isTaggedTemplateExpression(node.parent)) {
    imports.add('uiTemplate');edits.push({start:node.getStart(ast),end:node.getStart(ast),text:'uiTemplate'});
   }
   if(pass==='currency'&&ts.isJsxText(node)&&node.text.includes('₹')&&!/[A-Za-z]/.test(node.text)){
    imports.add('uiText');edits.push({start:node.getStart(ast),end:node.end,text:`{uiText(${JSON.stringify(node.text.trim())})}`});
   }
   ts.forEachChild(node,visit);
  }
  visit(ast);for(const edit of edits.sort((a,b)=>b.start-a.start))source=source.slice(0,edit.start)+edit.text+source.slice(edit.end);
 }
 if(imports.size){
  const match=source.match(/import \{([^}]+)\} from ["']([^"']*i18n)["'];/);
  if(match){const names=new Set(match[1].split(',').map(s=>s.trim()));imports.forEach(s=>names.add(s));source=source.replace(match[0],`import { ${[...names].join(', ')} } from ${JSON.stringify(match[2])};`);}
  else{let rel=path.relative(path.dirname(file),path.join(root,'i18n')).replaceAll('\\','/');if(!rel.startsWith('.'))rel='./'+rel;source=`import { ${[...imports].join(', ')} } from ${JSON.stringify(rel)};\n`+source;}
  fs.writeFileSync(file,source);
 }
}
