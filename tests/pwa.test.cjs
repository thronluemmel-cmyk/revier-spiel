const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
test('PWA manifest works below a repository subpath and all icons exist',()=>{
 const m=JSON.parse(fs.readFileSync('pwa-public/manifest.webmanifest'));
 assert.equal(m.start_url,'./');assert.equal(m.scope,'./');assert.equal(m.display,'standalone');
 for(const i of m.icons){const b=fs.readFileSync('pwa-public/'+i.src);assert.equal(b.subarray(1,4).toString(),'PNG');const [w,h]=i.sizes.split('x').map(Number);assert.equal(b.readUInt32BE(16),w);assert.equal(b.readUInt32BE(20),h);}
 for(const file of ['app.js','sw.js','config.js'])new vm.Script(fs.readFileSync('pwa-public/'+file,'utf8'));
});
test('embedding fails closed without allowed origin; direct mode unchanged',()=>{
 let origin='';const outputs=[];
 const make=()=>{const o={html:'<html><head></head><body>cup</body></html>',setTitle(){return this;},addMetaTag(){return this;},getContent(){return this.html;},setContent(v){this.html=v;return this;},setXFrameOptionsMode(v){this.mode=v;return this;}};outputs.push(o);return o;};
 const ctx=vm.createContext({HtmlService:{createHtmlOutputFromFile:make,createHtmlOutput:make,XFrameOptionsMode:{ALLOWALL:'allow'}},PropertiesService:{getScriptProperties:()=>({getProperty:()=>origin})}});
 vm.runInContext(fs.readFileSync('src/Code.js','utf8'),ctx);
 assert.equal(vm.runInContext('doGet()',ctx).mode,undefined);
 assert.equal(vm.runInContext('doGet({parameter:{embed:"1"}})',ctx).mode,undefined);
 origin='https://thronluemmel-cmyk.github.io';
 const result=vm.runInContext('doGet({parameter:{embed:"1"}})',ctx);assert.equal(result.mode,'allow');
 assert.match(result.html,/visibility:hidden/);assert.match(result.html,/e.source===top&&e.origin===origin/);
 origin='https://attacker.test';assert.equal(vm.runInContext('doGet({parameter:{embed:"1"}})',ctx).mode,undefined);
});
test('install screen remains safe when Google is not configured and offers manual install',async()=>{
 const elements={};const $=id=>elements[id]||(elements[id]={hidden:false,scrollIntoView(){},textContent:''});const listeners={};
 const ctx=vm.createContext({document:{getElementById:$},window:{FISHAY_CONFIG:{webAppUrl:''},addEventListener:(n,f)=>listeners[n]=f},navigator:{onLine:true},URL,matchMedia:()=>({matches:false}),location:{href:'https://example.github.io/fishay-app/'}});
 vm.runInContext(fs.readFileSync('pwa-public/app.js','utf8'),ctx);
 assert.equal($('open').disabled,true);$('open').onclick();assert.equal($('frame').src,undefined);
 await $('install').onclick();assert.equal($('help').open,true);
 let prompted=false;listeners.beforeinstallprompt({preventDefault(){},async prompt(){prompted=true;},userChoice:Promise.resolve({outcome:'accepted'})});
 await $('install').onclick();assert.equal(prompted,true);
});
