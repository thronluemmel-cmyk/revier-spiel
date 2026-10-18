// Embedded in Index.html by scripts/build-auth.cjs. No extra Apps Script file needed.
const AUTH_KEY='fishay-remembered-session';
const authRequests=new Map();
window.addEventListener('message',e=>{
 const host=window.FISHAY_HOST,d=e.data;
 if(!host||e.source!==top||e.origin!==host.origin||!d||d.type!=='fishay-auth-response'||d.nonce!==host.nonce)return;
 const pending=authRequests.get(d.id);if(!pending)return;
 authRequests.delete(d.id);clearTimeout(pending.timer);
 if(d.ok)pending.resolve(d.value);else pending.reject(Error('Speicherung nicht verfügbar.'));
});
function hostAuth(action,value){
 const host=window.FISHAY_HOST;
 if(!host?.nonce)return Promise.reject(Error('Keine Handy-Speicherverbindung.'));
 return new Promise((resolve,reject)=>{
  const id=crypto.randomUUID();
  const timer=setTimeout(()=>{authRequests.delete(id);reject(Error('Handy-Speicher nicht erreichbar.'));},2500);
  authRequests.set(id,{resolve,reject,timer});
  top.postMessage({type:'fishay-auth-request',nonce:host.nonce,id,action,value},host.origin);
 });
}
function validSavedSession(value){return value && /^[a-f0-9-]{72}$/.test(value.token) && Number.isFinite(value.expiresAt) && value.expiresAt>Date.now();}
async function readSavedToken(){
 let saved=null;
 // In the installed app the top-level storage is authoritative across launches.
 try{saved=await hostAuth('get');if(validSavedSession(saved))return saved.token;}catch(_){}
 try{saved=JSON.parse(localStorage.getItem(AUTH_KEY)||'null');if(validSavedSession(saved))return saved.token;localStorage.removeItem(AUTH_KEY);}catch(_){}
 try{return sessionStorage.getItem('fishy-session')||'';}catch(_){return '';}
}
async function storeLogin(result,remember){
 try{sessionStorage.setItem('fishy-session',result.token);}catch(_){}
 if(!remember){try{localStorage.removeItem(AUTH_KEY);}catch(_){}try{await hostAuth('clear');}catch(_){}return true;}
 const saved={token:result.token,expiresAt:result.expiresAt||Date.now()+7*86400000};
 let stored=false;
 try{localStorage.setItem(AUTH_KEY,JSON.stringify(saved));stored=true;}catch(_){}
 try{await hostAuth('set',saved);stored=true;}catch(_){}
 return stored;
}
async function forgetLogin(){
 try{sessionStorage.removeItem('fishy-session');}catch(_){}
 try{localStorage.removeItem(AUTH_KEY);}catch(_){}
 try{await hostAuth('clear');}catch(_){}
}
