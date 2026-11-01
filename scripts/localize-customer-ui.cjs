// Mechanical JSX localization: presentation literals only, never API/data values.
const ts=require('typescript');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'../apps/web/src');const apply=process.argv.includes('--apply');const inventory=new Map();
const decode=s=>s.replace(/&(amp|lt|gt|quot|apos|#39|#x27);/g,(_,key)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",'#39':"'",'#x27':"'"}[key]));
const normalize=s=>decode(s.replace(/\s+/g,' ').trim());
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)])}
for(const file of walk(root).filter(f=>f.endsWith('.tsx')&&!/test|i18n|LanguageSelector|ShopPortal|command-center[\\/]/.test(f))){
 const source=fs.readFileSync(file,'utf8');if(apply && /import \{[^}]*uiText/.test(source))continue;const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const edits=[];let hooks=0;
 const add=(text)=>{const key=normalize(text);if(/[A-Za-z]{2}/.test(key)&&key.length<700)inventory.set(key,(inventory.get(key)||0)+1);return key};
 function visit(node){
  if(ts.isJsxText(node)&&/[A-Za-z]{2}/.test(node.text)&&node.text.trim()){
   const parent=node.parent;if(ts.isJsxElement(parent)&&['script','style','code','pre','option'].includes(parent.openingElement.tagName.getText(ast)))return;
   const key=add(node.text);if(key.length<700){const leading=/^[ \t]/.test(node.text)?' ':'';const trailing=/[ \t]$/.test(node.text)?' ':'';edits.push({start:node.getStart(ast),end:node.end,text:'{uiText('+JSON.stringify(leading+key+trailing)+')}'});}
  }
  if(ts.isJsxAttribute(node)&&['label','placeholder','title','helperText','aria-label','aria-description','alt'].includes(node.name.getText(ast))&&node.initializer&&ts.isStringLiteral(node.initializer)&&/[A-Za-z]{2}/.test(node.initializer.text)){
   add(node.initializer.text);edits.push({start:node.initializer.getStart(ast),end:node.initializer.end,text:'{uiText('+JSON.stringify(decode(node.initializer.text))+')}'});
  }
  if(ts.isStringLiteral(node)&&ts.isJsxExpression(node.parent)&&!ts.isJsxAttribute(node.parent.parent)&&/[A-Za-z]{2}/.test(node.text)) {add(node.text);edits.push({start:node.getStart(ast),end:node.end,text:'uiText('+JSON.stringify(node.text)+')'});}
  // Conditional display copy is UI too; conditions, data keys and payloads are untouched.
  if(ts.isStringLiteral(node) && /[A-Za-z]{2}/.test(node.text)) {
   let branch=node, ancestor=node.parent;
   while(ancestor && ts.isConditionalExpression(ancestor) && (ancestor.whenTrue===branch || ancestor.whenFalse===branch)){branch=ancestor;ancestor=ancestor.parent;}
   if(branch!==node && ancestor && ts.isJsxExpression(ancestor)) {
    const attr=ancestor.parent;
    if(!ts.isJsxAttribute(attr)||['label','title','placeholder','helperText','aria-label'].includes(attr.name.getText(ast))){add(node.text);edits.push({start:node.getStart(ast),end:node.end,text:'uiText('+JSON.stringify(node.text)+')'});}
   }
  }
  let name,body;
  if(ts.isFunctionDeclaration(node)||ts.isFunctionExpression(node)){name=node.name?.text;body=node.body;}
  if(ts.isVariableDeclaration(node)&&node.initializer&&ts.isArrowFunction(node.initializer)&&ts.isBlock(node.initializer.body)){name=node.name.getText(ast);body=node.initializer.body;}
  if(name&&/^[A-Z]/.test(name)&&body&&body.getText(ast).includes('<')){edits.push({start:body.getStart(ast)+1,end:body.getStart(ast)+1,text:'\n  useUiLanguage();'});hooks++;}
  ts.forEachChild(node,visit);
 }
 visit(ast);if(apply&&edits.length){let output=source;for(const edit of edits.sort((a,b)=>b.start-a.start))output=output.slice(0,edit.start)+edit.text+output.slice(edit.end);let relative=path.relative(path.dirname(file),path.join(root,'i18n')).replaceAll('\\','/');if(!relative.startsWith('.'))relative='./'+relative;output='import { uiText'+(hooks?', useUiLanguage':'')+' } from '+JSON.stringify(relative)+';\n'+output;fs.writeFileSync(file,output);}
}
if(!apply)console.log(JSON.stringify([...inventory].sort((a,b)=>b[1]-a[1])));else console.log('Localized JSX presentation literals across customer UI; data/API literals unchanged.');
