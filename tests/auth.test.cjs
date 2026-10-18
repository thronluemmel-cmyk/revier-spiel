const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
function storage(){const map=new Map();return {map,getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};}
function client(local=storage(),session=storage()){
 const handlers={};const c=vm.createContext({window:{addEventListener:(n,f)=>handlers[n]=f},localStorage:local,sessionStorage:session,Date,Map,crypto,setTimeout,clearTimeout});
 vm.runInContext(fs.readFileSync('scripts/auth-client.js','utf8'),c);return {c,local,session,handlers};
}
const loginResult=()=>({token:crypto.randomUUID()+crypto.randomUUID(),expiresAt:Date.now()+30*86400000});
test('remembered login survives new browser session and logout removes it',async()=>{
 const a=client(),result=loginResult();assert.equal(await a.c.storeLogin(result,true),true);
 assert.equal(await client(a.local).c.readSavedToken(),result.token);
 assert.equal(a.local.map.size,1);assert.equal(JSON.stringify([...a.local.map.values()]).includes('password'),false);
 await a.c.forgetLogin();assert.equal(await client(a.local).c.readSavedToken(),'');assert.equal(a.session.map.size,0);
});
test('unchecked remember uses session only and clears previous persistent account',async()=>{
 const a=client();await a.c.storeLogin(loginResult(),true);const result=loginResult();await a.c.storeLogin(result,false);
 assert.equal(await a.c.readSavedToken(),result.token);assert.equal(await client(a.local).c.readSavedToken(),'');
});
test('expired, malformed or blocked local storage never restores invalid login',async()=>{
 for(const value of ['not JSON',JSON.stringify({token:'forged',expiresAt:Date.now()+1000}),JSON.stringify({...loginResult(),expiresAt:1})]){
  const a=client();a.local.setItem('fishay-remembered-session',value);assert.equal(await a.c.readSavedToken(),'');
 }
 const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');},removeItem(){throw Error('blocked');}};
 const a=client(blocked,blocked);assert.equal(await a.c.storeLogin(loginResult(),true),false);assert.equal(await a.c.readSavedToken(),'');
});
test('PWA host only serves storage to nonce-bound Google frame, supports clear and expiry',()=>{
 const local=storage(),handlers={},messages=[];const frame={postMessage:(d,o)=>messages.push({d,o})};
 const c=vm.createContext({window:{addEventListener:(n,f)=>handlers[n]=f},crypto,Uint8Array,Array,Date,JSON,localStorage:local});
 vm.runInContext("const appUrl=new URL('https://script.google.com/macros/s/example/exec');let started=true;".replace('new URL', 'new globalURL'),Object.assign(c,{globalURL:URL}));
 vm.runInContext(fs.readFileSync('pwa-public/auth-host.js','utf8'),c);
 const nonce=vm.runInContext('bridgeNonce',c),origin='https://test-script.googleusercontent.com',result=loginResult();
 const event={source:frame,origin,data:{type:'fishay-auth-request',nonce,id:'1',action:'set',value:result}};
 handlers.message({...event,data:{...event.data,nonce:'wrong'}});assert.equal(messages.length,0);
 handlers.message({...event,origin:'https://evil.example'});assert.equal(messages.length,0);
 handlers.message(event);assert.equal(messages.at(-1).d.ok,true);
 handlers.message({...event,data:{...event.data,id:'2',action:'get'}});assert.equal(messages.at(-1).d.value.token,result.token);
 const before=messages.length;handlers.message({...event,source:{postMessage(){throw Error('leak');}}});assert.equal(messages.length,before);
 handlers.message({...event,data:{...event.data,id:'3',action:'clear'}});assert.equal(local.map.size,0);
});
