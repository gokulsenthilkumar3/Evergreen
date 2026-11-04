import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { JSDOM } from 'jsdom';

test('Thread Story demo roles, workflow gaps, markets, arithmetic, brief and navigation work in the DOM', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost:3300/', pretendToBeVisual: true });
  const previous = new Map();
  const assign = (key, value) => { previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key)); Object.defineProperty(globalThis, key, { configurable:true, writable:true, value }); };
  for (const [key,value] of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator,HTMLElement:dom.window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true,matchMedia:()=>({matches:true,addEventListener(){},removeEventListener(){}}),fetch:async()=>{throw Error('Demo attempted network access');}})) assign(key,value);
  dom.window.HTMLDialogElement.prototype.showModal = function(){this.open=true;};
  dom.window.HTMLDialogElement.prototype.close = function(){this.open=false;};
  let downloaded = '';
  const oldCreate = URL.createObjectURL, oldRevoke = URL.revokeObjectURL;
  URL.createObjectURL = blob => { blob.text().then(text=>{downloaded=text;});return 'blob:test'; };
  URL.revokeObjectURL = ()=>{};
  dom.window.HTMLAnchorElement.prototype.click = function(){};
  const require = createRequire(import.meta.url);
  const React = require('react');
  const { createRoot } = require('react-dom/client');
  const source = fs.readFileSync(new URL('../src/UnifiedMarketing.tsx',import.meta.url),'utf8').replaceAll('import.meta.env.VITE_MARKETING_API_URL', 'undefined');
  const code = ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
  const demoModule = {exports:{}};
  const demoCode = ts.transpileModule(fs.readFileSync(new URL('../src/DemoAssistant.tsx',import.meta.url),'utf8'), {compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
  new Function('require','module','exports',demoCode)(name=>name.endsWith('.css')?{}:require(name),demoModule,demoModule.exports);
  const module = {exports:{}};
  // Test the page independently of the existing assistant's network/consent UI.
  new Function('require','module','exports',code)(name=>name.endsWith('.css')?{}:name.includes('DemoAssistant')?demoModule.exports:require(name),module,module.exports);
  const root = createRoot(document.getElementById('root'));
  const click = async el => { assert.ok(el,'control exists');await React.act(async()=>el.dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true}))); };
  const button = text => [...document.querySelectorAll('button')].find(el=>el.textContent.includes(text));
  try {
    await React.act(async()=>{root.render(React.createElement(module.exports.default));});
    assert.equal(document.querySelectorAll('h1').length,1);
    await click(button('Scout'));
    assert.match(document.querySelector('[aria-label="Scout demo preview"]').textContent,/AI is disconnected/);
    const composer = document.getElementById('demo-scout-question');
    await React.act(async()=>{Object.getOwnPropertyDescriptor(dom.window.HTMLTextAreaElement.prototype,'value').set.call(composer,'Explain yarn');composer.dispatchEvent(new dom.window.Event('input',{bubbles:true}));});
    await click(button('Preview interaction'));
    assert.match(document.querySelector('[aria-label="Scout demo preview"]').textContent,/No AI answer was generated/);
    await click(document.querySelector('[aria-label="Close Scout preview"]'));
    assert.equal(document.querySelector('.eg-site').dataset.paused,'true');
    assert.ok(document.querySelector('a[href="mailto:sales@evergreen.com"]'));
    await click(button('Accounts team'));
    assert.match(document.querySelector('.eg-role-content').textContent,/Operator import/);
    await click(button('Buyer'));
    assert.match(document.querySelector('.eg-role-content').textContent,/Check shop/);
    await click(button('Produce'));
    assert.match(document.querySelector('.eg-stage-detail').textContent,/transformation/);
    await click(document.querySelector('input[type="checkbox"]'));
    assert.match(document.querySelector('.eg-stage-detail').textContent,/Receipt missing/);
    for (const market of ['Vietnam','China','Malaysia','Singapore','India']) {
      await click(button(market));
      assert.match(document.querySelector('.eg-market-art').textContent,new RegExp(market));
    }
    const range=document.getElementById('eg-waste');
    await React.act(async()=>{
      Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype,'value').set.call(range,'10');
      range.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
      range.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
    });
    assert.match(document.querySelector('.eg-yield strong').textContent,/900/);
    await click(button('Download your demo brief'));
    assert.match(downloaded,/Perspective: Buyer/);
    assert.match(downloaded,/Workflow: Produce/);
    assert.match(downloaded,/No enquiry has been sent/);
    await React.act(async()=>window.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true})));
    assert.equal(document.querySelector('dialog').open,true);
    await click(document.querySelector('[aria-label="Close quick navigation"]'));
    assert.equal(document.querySelector('dialog').open,false);
    await click(document.querySelector('[aria-label="Toggle navigation"]'));
    assert.equal(document.querySelector('[aria-label="Toggle navigation"]').getAttribute('aria-expanded'),'true');
    for(const link of document.querySelectorAll('a[href^="#"]')) assert.ok(document.querySelector(link.getAttribute('href')),link.getAttribute('href'));
    assert.equal(document.querySelectorAll('.eg-theme-grid a').length,6);
    for(const link of document.querySelectorAll('.eg-theme-grid a')) assert.ok(fs.existsSync(new URL('../public'+link.getAttribute('href')+'index.html',import.meta.url)));
  } finally {
    await React.act(async()=>root.unmount());dom.window.close();URL.createObjectURL=oldCreate;URL.revokeObjectURL=oldRevoke;
    for(const [key,descriptor] of previous) {if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
  }
});

 test('main portal restores former marketing UI and keeps demo navigation and fake AI out', () => {
  const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8');
  const app=fs.readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
  assert.match(main,/from '.\/App'/);
  assert.doesNotMatch(app,/\/demo\/|getBotReply|chat-online/);
  assert.match(app,/id="scout"/);
  assert.match(app,/\/ai\/marketing/);
  const demo=fs.readFileSync(new URL('../src/UnifiedMarketing.tsx',import.meta.url),'utf8');
  assert.doesNotMatch(demo,/fetch\(|AiAssistant|\/ai\/marketing/);
});
