import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { gzipSync } from 'node:zlib';
import { JSDOM } from 'jsdom';
import { materialBalance, localGuide, createBrief } from '../public/demo/ThemeGenesisAtelier/model.js';
const base=new URL('../public/demo/ThemeGenesisAtelier/',import.meta.url);
const read=file=>fs.readFileSync(new URL(file,base),'utf8');

test('material scenario conserves quantities across the full supported input space',()=>{
  for(const input of [100,1000,5000])for(const waste of [0,.5,8,20])for(const downtime of [0,.5,2,4]){
    const b=materialBalance(input,waste,downtime);
    assert.ok(Math.abs(b.yarn+b.waste+b.unused-input)<1e-8);
    assert.equal(b.hours,8-downtime);
  }
  assert.deepEqual(materialBalance(1000,8,2),{input:1000,hours:6,processed:750,yarn:690,waste:60,unused:250});
  for(const args of [[NaN,8,0],[0,8,0],[1000,Infinity,0],[1000,21,0],[1000,8,-1],[1000,8,5]])assert.equal(materialBalance(...args),null);
  assert.match(localGuide('my bank account balance'),/Local explanation/);
  assert.match(localGuide('unrelated question'),/no verified explanation/);
  assert.match(createBrief({mill:'Mill',role:'Floor',market:'India',question:'Shift handover'},materialBalance(1000,8,2),8,2),/No enquiry sent/);
});

test('demo ships only local assets, bounded payload and no API transport',()=>{
  const document=new JSDOM(read('index.html')).window.document;
  assert.equal(document.querySelectorAll('h1').length,1);
  assert.match(document.querySelector('meta[http-equiv="Content-Security-Policy"]').content,/connect-src 'none'/);
  for(const el of document.querySelectorAll('script[src],link[href]'))assert.ok(fs.existsSync(new URL(el.getAttribute('src')||el.getAttribute('href'),base)));
  for(const a of document.querySelectorAll('a[href^="#"]'))assert.ok(document.querySelector(a.getAttribute('href')));
  for(const name of ['atelier.js','model.js','scene.js'])assert.doesNotMatch(read(name),/\bfetch\s*\(|XMLHttpRequest|sendBeacon|api\.groq|localStorage|innerHTML/);
  const files=['index.html','atelier.css','atelier.js','scene.js','model.js'];
  assert.ok(files.reduce((sum,file)=>sum+gzipSync(read(file)).length,0)<30000);
  assert.ok(files.reduce((sum,file)=>sum+Buffer.byteLength(read(file)),0)<100000);
});

test('DOM controls reconcile, explain gaps, restore XML mapping, manage local dialogs and download a safe brief',async()=>{
  const dom=new JSDOM(read('index.html'),{url:'http://localhost:3300/demo/ThemeGenesisAtelier/',pretendToBeVisual:true});
  const previous=new Map();
  const assign=(key,value)=>{previous.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});};
  for(const [key,value] of Object.entries({window:dom.window,document:dom.window.document,Element:dom.window.Element,FormData:dom.window.FormData,matchMedia:()=>({matches:true,addEventListener(){}}),IntersectionObserver:class {observe(){}disconnect(){}},fetch:()=>{throw Error('Unexpected network call');}}))assign(key,value);
  dom.window.HTMLCanvasElement.prototype.getContext=()=>null;
  dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new dom.window.Event('close'));};
  dom.window.HTMLAnchorElement.prototype.click=function(){};
  let saved;const oldCreate=URL.createObjectURL,oldRevoke=URL.revokeObjectURL;URL.createObjectURL=blob=>{saved=blob;return 'blob:test'};URL.revokeObjectURL=()=>{};
  const $=selector=>document.querySelector(selector);
  const input=(selector,value)=>{$(selector).value=value;$(selector).dispatchEvent(new dom.window.Event('input',{bubbles:true}));};
  try {
    await import(new URL('../public/demo/ThemeGenesisAtelier/atelier.js?test',import.meta.url));
    assert.equal(document.documentElement.dataset.motion,'off');
    assert.equal($('.scene').classList.contains('canvas-ready'),false,'Canvas fallback remains visible');
    $('#film-start').click();assert.equal($('#story-progress').value,'50');
    input('#downtime','2');assert.equal($('#owner-yarn').textContent,'690');assert.equal($('#ledger-unused').textContent,'250 kg');
    input('#waste-percent','10');assert.equal($('#yield-result').textContent,'675');
    assert.ok(Number($('#gauge-yarn').getAttribute('stroke-dasharray').split(' ')[0])<400);
    $('[data-stage="3"]').click();$('#record-gap').checked=true;$('#record-gap').dispatchEvent(new dom.window.Event('change'));assert.match($('#gap-note').textContent,/issue reference/);
    $('[data-integration="scale"]').click();assert.match($('#xml-code').textContent,/indicator model/);
    $('[data-integration="tally"]').click();$('[data-field="amount"]').click();assert.equal($('[data-code="amount"]').className,'highlight');
    const trigger=$('[data-open="command"]');trigger.focus();trigger.click();input('#command-search','Tally');assert.equal(document.querySelectorAll('#command-results a:not([hidden])').length,1);$('#command [data-close]').click();assert.equal(document.activeElement,trigger);
    $('[data-open="scout"]').click();input('#scout-input','<img src=x onerror=alert(1)>');$('#scout-form').dispatchEvent(new dom.window.Event('submit',{cancelable:true}));assert.match($('#scout-answer').textContent,/no verified explanation/);assert.equal($('#scout-answer img'),null);
    $('#scout [data-close]').click();$('[data-open="brief"]').click();input('#mill-name','Test mill');input('#brief-question','Review shift handover');$('#brief-form').dispatchEvent(new dom.window.Event('submit',{cancelable:true}));assert.match(await saved.text(),/Output: 675 kg/);assert.match(await saved.text(),/Test mill/);assert.match($('#brief-status').textContent,/No enquiry was sent/);
    $('#reset-scenario').click();assert.equal($('#owner-yarn').textContent,'920');
  }finally{dom.window.dispatchEvent(new dom.window.Event('pagehide'));dom.window.close();URL.createObjectURL=oldCreate;URL.revokeObjectURL=oldRevoke;for(const [key,value] of previous){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}}
});
