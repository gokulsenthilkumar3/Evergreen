const ts=require('typescript'), fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../apps/web/src');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)])}
for(const file of walk(root).filter(f=>f.endsWith('.tsx')&&!/test|ShopPortal/.test(f))){
 let source=fs.readFileSync(file,'utf8');const ast=ts.createSourceFile(file,source,99,true,ts.ScriptKind.TSX),edits=[],names=new Set();
 function visit(node){
  if(ts.isPropertyAccessExpression(node)&&ts.isJsxExpression(node.parent)){
   const text=node.getText(ast);
   if(/^(kpi|stat|card)\.(label|title|subtitle|description)$/.test(text)){names.add('uiText');edits.push({start:node.getStart(ast),end:node.end,text:`uiText(${text})`});}
   if(/^(kpi|stat|card)\.value$/.test(text)){names.add('uiMetric');edits.push({start:node.getStart(ast),end:node.end,text:`uiMetric(${text})`});}
  }
  if(ts.isJsxAttribute(node)&&node.name.getText(ast)==='name'&&node.initializer&&ts.isStringLiteral(node.initializer)&&/^(Bar|Line|Area|Pie|Radar)$/.test(node.parent.parent.tagName.getText(ast))){names.add('uiText');edits.push({start:node.initializer.getStart(ast),end:node.initializer.end,text:`{uiText(${JSON.stringify(node.initializer.text)})}`});}
  ts.forEachChild(node,visit);
 }
 visit(ast);if(!edits.length)continue;
 for(const e of edits.sort((a,b)=>b.start-a.start))source=source.slice(0,e.start)+e.text+source.slice(e.end);
 const match=source.match(/import \{([^}]+)\} from ["']([^"']*i18n)["'];/);
 if(match){const all=new Set(match[1].split(',').map(s=>s.trim()));names.forEach(s=>all.add(s));source=source.replace(match[0],`import { ${[...all].join(', ')} } from ${JSON.stringify(match[2])};`);}
 else {let rel=path.relative(path.dirname(file),path.join(root,'i18n')).replaceAll('\\','/');if(!rel.startsWith('.'))rel='./'+rel;source=`import { ${[...names].join(', ')} } from ${JSON.stringify(rel)};\n`+source;}
 fs.writeFileSync(file,source);
}
