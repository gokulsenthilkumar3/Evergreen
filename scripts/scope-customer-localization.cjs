// Assign presentation categories so each Tamil preference controls actual rendered UI.
const ts=require('typescript'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../apps/web/src');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)])}
for(const file of walk(root).filter(f=>f.endsWith('.tsx')&&!/test|TamilOptions|LanguageSelector|ShopPortal/.test(f))){
 let source=fs.readFileSync(file,'utf8');const ast=ts.createSourceFile(file,source,99,true,ts.ScriptKind.TSX),edits=[],imports=new Set();
 function scope(node){
  if(/WorkspaceNavigation|Breadcrumbs/.test(file))return 'navigation';
  if(/Tutorial|BusinessFlowGuide/.test(file))return 'help';
  if(/ConfirmDialog/.test(file))return 'feedback';
  let parent=node.parent;
  while(parent&&!ts.isStatement(parent)){
   if(ts.isCallExpression(parent)&&/^toast\./.test(parent.expression.getText(ast)))return 'feedback';
   if(ts.isJsxAttribute(parent)){
    const tag=parent.parent.parent.tagName.getText(ast),attr=parent.name.getText(ast);
    if(tag==='Tab')return 'tabs';
    if(['Bar','Line','Area','Pie','Radar'].includes(tag)&&attr==='name')return 'charts';
    if(['TextField','GlassDatePicker','FormControlLabel','InputLabel','Select','MenuItem'].includes(tag))return 'forms';
   }
   if(ts.isJsxElement(parent)){
    const tag=parent.openingElement.tagName.getText(ast);
    if(tag==='TableCell'||tag==='TableHead')return 'tables';
    if(tag==='MenuItem'||tag==='InputLabel')return 'forms';
   }
   parent=parent.parent;
  }
  if(/\b(kpi|stat|card)\.(label|title|subtitle|subValue)/.test(node.getText(ast)))return 'metrics';
 }
 function visit(node){
  if(ts.isCallExpression(node)&&node.expression.getText(ast)==='uiText'&&node.arguments.length===1){const s=scope(node);if(s)edits.push({start:node.end-1,end:node.end-1,text:`, '${s}'`});}
  if(ts.isTaggedTemplateExpression(node)&&node.tag.getText(ast)==='uiTemplate'){const s=scope(node);if(s){imports.add('uiScopedTemplate');edits.push({start:node.tag.getStart(ast),end:node.tag.end,text:`uiScopedTemplate('${s}')`});}}
  if(ts.isPropertyAccessExpression(node)&&ts.isJsxExpression(node.parent)&&/^(opt|option)\.label$/.test(node.getText(ast))){
   const p=node.parent.parent;if(!ts.isJsxAttribute(p)||p.name.getText(ast)!=='key'){imports.add('uiText');edits.push({start:node.getStart(ast),end:node.end,text:`uiText(${node.getText(ast)}, 'forms')`});}
  }
  if(ts.isIdentifier(node)&&node.text==='label'&&ts.isJsxExpression(node.parent)){
   const p=node.parent.parent;
   if(!ts.isJsxAttribute(p)||p.name.getText(ast)==='label'){imports.add('uiText');edits.push({start:node.getStart(ast),end:node.end,text:`uiText(label, '${scope(node)||'forms'}')`});}
  }
  if(ts.isCallExpression(node)&&ts.isPropertyAccessExpression(node.expression)&&['toLocaleDateString','toLocaleTimeString'].includes(node.expression.name.text)&&node.arguments[0]?.getText(ast)==='uiLocale()'){
   imports.add('uiDateLocale');edits.push({start:node.arguments[0].getStart(ast),end:node.arguments[0].end,text:'uiDateLocale()'});
  }
  if(ts.isCallExpression(node)&&/^(React\.)?useMemo$/.test(node.expression.getText(ast))&&node.arguments.length===2&&ts.isArrayLiteralExpression(node.arguments[1])&&/ui(Text|Locale|Template|Metric)|formatUi/.test(node.arguments[0].getText(ast))){
   const deps=node.arguments[1];if(!deps.getText(ast).includes('getUiRevision')){imports.add('getUiRevision');edits.push({start:deps.end-1,end:deps.end-1,text:`${deps.elements.length?', ':''}getUiRevision()`});}
  }
  ts.forEachChild(node,visit);
 }
 visit(ast);if(!edits.length)continue;
 for(const e of edits.sort((a,b)=>b.start-a.start))source=source.slice(0,e.start)+e.text+source.slice(e.end);
 // Keys must stay stable when the display language changes.
 source=source.replace(/key=\{uiText\(([^,()]+)(?:, '[a-z]+')?\)\}/g,'key={$1}');
 const match=source.match(/import \{([^}]+)\} from ["']([^"']*i18n)["'];/);
 if(match){const all=new Set(match[1].split(',').map(s=>s.trim()));imports.forEach(s=>all.add(s));source=source.replace(match[0],`import { ${[...all].join(', ')} } from ${JSON.stringify(match[2])};`);}
 else{let rel=path.relative(path.dirname(file),path.join(root,'i18n')).replaceAll('\\','/');if(!rel.startsWith('.'))rel='./'+rel;source=`import { ${[...imports].join(', ')} } from ${JSON.stringify(rel)};\n`+source;}
 fs.writeFileSync(file,source);
}
