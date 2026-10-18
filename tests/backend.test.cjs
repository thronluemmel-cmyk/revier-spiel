const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
class Sheet {
 constructor(rows=[]){this.rows=structuredClone(rows);this.images=[];}
 getLastRow(){return this.rows.length;}getLastColumn(){return Math.max(1,...this.rows.map(x=>x.length));}
 getRange(row,col,h=1,w=1){const self=this;return {getValues(){return Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>self.rows[row+y-1]?.[col+x-1]??''));},setValues(values){for(let y=0;y<h;y++){self.rows[row+y-1]??=[];for(let x=0;x<w;x++)self.rows[row+y-1][col+x-1]=values[y][x];}return this;},setValue(value){return this.setValues([[value]]);},setBackground(){return this;},setFontColor(){return this;},setFontWeight(){return this;},clearContent(){return this.setValues(Array.from({length:h},()=>Array(w).fill('')));}};}
 appendRow(row){this.rows.push([...row]);}deleteRow(n){this.rows.splice(n-1,1);}setFrozenRows(){}setColumnWidth(){}autoResizeColumns(){}getImages(){return [];}setRowHeight(){}insertImage(){return {getWidth:()=>100,getHeight:()=>60,setWidth(){return this;},setHeight(){return this;}};}
}
function env(){
 const sheets=new Map(),auth=new Map(),props=new Map([['AUTH_SECRET','secret'],['AUTH_BOOK_ID','private'],['PHOTO_FOLDER_ID','photos']]),mails=[],files=new Map();let locked=false;
 const book={getSheetByName:n=>sheets.get(n),insertSheet:n=>{const s=new Sheet();sheets.set(n,s);return s;}};
 const ab={getSheetByName:n=>auth.get(n)};
 const c=vm.createContext({console,Date,Map,Set,SpreadsheetApp:{openById:id=>id==='private'?ab:book},PropertiesService:{getScriptProperties:()=>({getProperty:k=>props.get(k)||null,setProperty:(k,v)=>props.set(k,v)})},LockService:{getScriptLock:()=>({waitLock(){assert.equal(locked,false);locked=true;},releaseLock(){locked=false;}})},Utilities:{getUuid:()=>crypto.randomUUID(),DigestAlgorithm:{SHA_256:'sha256'},computeDigest:(_,s)=>Array.from(crypto.createHash('sha256').update(s).digest()),formatDate:(_,tz,f)=>f==='yyyy'?'2027':f==='yyyy-MM-dd'?'2027-01-02':'2027-01-02',base64Decode:s=>Array.from(Buffer.from(s,'base64')),base64Encode:a=>Buffer.from(a).toString('base64'),newBlob:(bytes,type,name)=>({bytes,getBytes(){return bytes;},getDataAsString(){return Buffer.from(bytes).toString('utf8');},setName(){return this;}})},MailApp:{getRemainingDailyQuota:()=>100,sendEmail:m=>mails.push(m)},DriveApp:{getFolderById:()=>({createFile(blob){const id=crypto.randomUUID();const f={getId:()=>id,getUrl:()=>`https://drive.google.com/file/d/${id}/view`,getBlob:()=>blob};files.set(id,f);return f;}}),getFileById:id=>{assert.ok(files.has(id));return files.get(id);}}});
 vm.runInContext(fs.readFileSync('src/Model.js','utf8')+'\n'+fs.readFileSync('src/Code.js','utf8'),c);
 c.sheet_(book,'App_Teilnehmer',['Saison','Teilnehmer-ID','Name','Zugangsname','Erster Fang am','Tabellenreiter']);
 c.sheet_(book,'App_Faenge',['Fang-ID','Saison','Teilnehmer-ID','Name','Fischart','Laenge cm','Fangdatum','Foto-Datei-ID','Foto-Link','Eingereicht am','Status','Anfrage-ID','Foto synchronisiert']);
 const rules=c.sheet_(book,'App_Regeln',['Saison','Fischart','Faktor','Max. Fänge']);[['Hecht',1,3],['Zander',1.3,3],['Barsch',2,3],['Meerforelle',1.5,3],['Rapfen',1,1]].forEach(r=>rules.appendRow([2027,...r]));
 auth.set('PasswordSessions',new Sheet([['Hash','Zugangsname','Gueltig bis','Zugangsversion']]));
 const readAccounts=c.accounts_;const access={source:'Chris | A-long-test-password\nDaniel | Other-test-password'};c.accounts_=()=>c.parseAccounts_(access.source);return {c,sheets,auth,mails,files,access,props,readAccounts};
}
function login(e,name='Chris',password='A-long-test-password'){return e.c.login({name,password});}
function catchData(){return {year:2027,species:'Hecht',length:75,date:'2027-01-01',requestId:crypto.randomUUID(),photo:'data:image/jpeg;base64,'+Buffer.from([255,216,255,0,255,217]).toString('base64')};}
test('Remembered sessions last 30 days; ordinary sessions remain 7 days; expiry and revocation apply',()=>{
 const e=env(),start=Date.now();
 const remembered=e.c.login({name:'Chris',password:'A-long-test-password',remember:true});
 assert.ok(remembered.expiresAt>=start+30*86400000&&remembered.expiresAt<=Date.now()+30*86400000);
 const ordinary=login(e);assert.ok(ordinary.expiresAt>=start+7*86400000&&ordinary.expiresAt<=Date.now()+7*86400000);
 e.auth.get('PasswordSessions').rows[1][2]=1;assert.throws(()=>e.c.getMe(remembered.token),/abgelaufen/);
 e.c.logout(ordinary.token);assert.throws(()=>e.c.getMe(ordinary.token),/abgelaufen/);
});
test('Login creates no participant or personal tab, sends no email',()=>{const e=env(),r=login(e);assert.equal(e.sheets.get('App_Teilnehmer').rows.length,1);assert.equal(e.c.getMe(r.token).name,'Chris');assert.equal(e.c.getBoard(2027).rankings.length,0);assert.equal(e.mails.length,0);assert.notEqual(e.auth.get('PasswordSessions').rows[1][0],r.token);assert.ok(!JSON.stringify(r).includes('A-long'));});
test('Only listed nonempty credentials work; no registration API',()=>{const e=env();assert.throws(()=>login(e,'Unknown'));assert.throws(()=>login(e,'Chris','wrong'));e.access.source='Chris |';assert.throws(()=>login(e));assert.equal(typeof e.c.requestCode,'undefined');assert.equal(typeof e.c.verifyCode,'undefined');});
test('Ten failed password attempts lock account for hour',()=>{const e=env();for(let i=0;i<10;i++)assert.throws(()=>login(e,'Chris','wrong'));assert.throws(()=>login(e),/Versuche/);});
test('Removal and password changes invalidate existing sessions',()=>{const e=env(),r=login(e);e.access.source='';assert.throws(()=>e.c.getMe(r.token),/entfernt/);e.access.source='Chris | Changed-test-password';assert.throws(()=>e.c.submitCatch(r.token,catchData()),/entfernt/);assert.ok(login(e,'Chris','Changed-test-password').token);});
test('First catch creates participant, personal photo tab and ranking',()=>{const e=env(),r=login(e),input=catchData();const a=e.c.submitCatch(r.token,{...input,participantId:'forged'});assert.equal(e.sheets.get('App_Teilnehmer').rows.length,2);assert.equal(e.c.getBoard(2027).rankings[0].name,'Chris');assert.equal(e.c.getBoard(2027).rankings[0].points,75);assert.ok(e.c.getPhoto(a.id).startsWith('data:image/jpeg;base64,'));assert.ok(!JSON.stringify(e.sheets.get('App_Teilnehmer').rows).includes('password'));});
test('Repeated request is idempotent, another account cannot reuse it',()=>{const e=env(),a=login(e),b=login(e,'Daniel','Other-test-password'),input=catchData();const first=e.c.submitCatch(a.token,input);assert.equal(e.c.submitCatch(a.token,input).id,first.id);assert.equal(e.files.size,1);assert.equal(e.sheets.get('App_Teilnehmer').rows.length,2);assert.throws(()=>e.c.submitCatch(b.token,input),/Anfrage/);});
test('Malformed photo creates neither participant nor catch',()=>{const e=env(),r=login(e);assert.throws(()=>e.c.submitCatch(r.token,{...catchData(),photo:'data:image/svg+xml;base64,xxxx'}));assert.equal(e.sheets.get('App_Teilnehmer').rows.length,1);assert.equal(e.sheets.get('App_Faenge').rows.length,1);});
test('Six accounts can join; next season starts empty with retained login',()=>{const e=env();e.access.source=Array.from({length:6},(_,i)=>`Angler${i} | A-long-test-password`).join('\n');let first;for(let i=0;i<6;i++){const r=login(e,'Angler'+i);first??=r;e.c.submitCatch(r.token,catchData());}assert.equal(e.c.getBoard(2027).rankings.length,6);e.c.activeYear_=()=>2028;e.c.today_=()=> '2028-01-02';assert.equal(e.c.getBoard(2028).rankings.length,0);assert.equal(e.c.getMe(first.token).name,'Angler0');e.c.submitCatch(first.token,{...catchData(),year:2028,date:'2028-01-01'});assert.equal(e.c.getBoard(2028).rankings.length,1);assert.equal(e.c.getBoard(2027).rankings.length,6);});
test('Deleting access does not delete historical catches',()=>{const e=env(),r=login(e);e.c.submitCatch(r.token,catchData());e.access.source='';assert.equal(e.c.getBoard(2027).rankings.length,1);assert.equal(e.c.getBoard(2027).catches.length,1);});
test('Logged out session cannot submit and arbitrary photos cannot be read',()=>{const e=env(),r=login(e);e.c.logout(r.token);assert.throws(()=>e.c.submitCatch(r.token,catchData()));assert.throws(()=>e.c.getPhoto(crypto.randomUUID()));});
test('Partial personal-view failure keeps catch and can be repaired',()=>{const e=env(),r=login(e),orig=e.c.syncPersonalCatch_;e.c.syncPersonalCatch_=()=>{throw Error('Quota');};const result=e.c.submitCatch(r.token,catchData());assert.ok(result.warning);assert.equal(e.c.getBoard(2027).catches.length,1);e.c.syncPersonalCatch_=orig;e.c.syncPhotos_();assert.equal(e.sheets.get('App_Faenge').rows[1][12],'ja');});
test('Participant-write failure recovers on retry without duplicate photo',()=>{const e=env(),r=login(e),s=e.sheets.get('App_Teilnehmer'),orig=s.appendRow,input=catchData();s.appendRow=()=>{throw Error('Quota');};assert.throws(()=>e.c.submitCatch(r.token,input));assert.equal(e.sheets.get('App_Faenge').rows.length,2);s.appendRow=orig;e.c.submitCatch(r.token,input);assert.equal(e.sheets.get('App_Teilnehmer').rows.length,2);assert.equal(e.files.size,1);});
function season2026(){
 const e=env();e.c.activeYear_=()=>2026;e.c.today_=()=> '2026-10-18';
 const rows=JSON.parse(fs.readFileSync('tests/legacy-fixture.json','utf8'));
 const sheet=new Sheet(rows),range=sheet.getRange.bind(sheet);
 sheet.getRange=(...args)=>typeof args[0]==='string'?{getDisplayValues:()=>structuredClone(sheet.rows)}:range(...args);
 e.sheets.set('Turnier',sheet);return e;
}
test('2026 combines baseline and photo uploads under one angler, counts best three and retry once',()=>{
 const e=season2026(),before=e.c.getBoard(2026),baseline=JSON.stringify(e.sheets.get('Turnier').rows),r=login(e);
 const input={...catchData(),year:2026,species:'Barsch',length:45,date:'2026-10-18'};
 const saved=e.c.submitCatch(r.token,input);assert.equal(saved.warning,'');
 e.c.submitCatch(r.token,input);
 const after=e.c.getBoard(2026);assert.equal(after.rankings.length,4);assert.equal(after.catches.length,before.catches.length+1);
 assert.equal(after.rankings.filter(p=>p.name==='Chris').length,1);
 assert.equal(after.rankings.find(p=>p.name==='Chris').points,before.rankings.find(p=>p.name==='Chris').points+90);
 assert.equal(after.records.find(p=>p.species==='Barsch').length,45);
 assert.ok(e.c.getPhoto(saved.id).startsWith('data:image/jpeg;base64,'));assert.equal(e.files.size,1);
 assert.equal(JSON.stringify(e.sheets.get('Turnier').rows),baseline);
 e.c.submitCatch(r.token,{...input,length:50,requestId:crypto.randomUUID()});
 const final=e.c.getBoard(2026),fish=final.catches.filter(c=>c.name==='Chris'&&c.species==='Barsch');
 assert.equal(fish.filter(c=>c.counted).length,3);assert.equal(fish.filter(c=>c.counted).reduce((n,c)=>n+c.length,0),126);
 assert.ok(e.sheets.get('App_Liveboard_2026'));
 e.c.activeYear_=()=>2027;e.c.today_=()=> '2027-01-02';assert.equal(e.c.getBoard(2027).rankings.length,0);
 assert.throws(()=>e.c.submitCatch(r.token,input),/laufende Saison/);
});
test('2026 new angler joins on first catch; deactivated catch leaves baseline intact',()=>{
 const e=season2026();e.access.source+='\nAlex | A-long-test-password';const r=login(e,'Alex');
 assert.equal(e.c.getBoard(2026).rankings.length,4);
 e.c.submitCatch(r.token,{...catchData(),year:2026,date:'2026-10-18'});
 assert.equal(e.c.getBoard(2026).rankings.length,5);
 e.sheets.get('App_Faenge').rows[1][10]='inaktiv';
 const result=e.c.getBoard(2026);assert.equal(result.rankings.find(p=>p.name==='Alex').points,0);
 assert.equal(result.catches.some(c=>c.name==='Alex'),false);
});
test('Account text validates duplicates, blank passwords and malformed lines',()=>{const e=env();assert.equal(e.c.parseAccounts_('# comment\nChris |\nDaniel | Test-password-long').length,1);for(const s of ['Chris | x','Chris | Test-password-long\nchris | Other-password-long','Name | a | b','<img> | Test-password-long'])assert.throws(()=>e.c.parseAccounts_(s));});

test('GitHub file is decoded server-side; public repositories and failed requests rejected',()=>{
 const e=env();e.props.set('GITHUB_TOKEN','private-test-token');const seen=[];
 e.c.UrlFetchApp={fetch(url,options){seen.push({url,options});return {getResponseCode:()=>200,getContentText:()=>JSON.stringify(url.includes('/contents/')?{type:'file',encoding:'base64',size:50,content:Buffer.from('Chris | A-long-test-password').toString('base64')}:{private:true})};}};
 assert.equal(e.readAccounts()[0].name,'Chris');assert.equal(seen.length,2);assert.ok(seen[1].url.endsWith('/contents/ANGLER.txt?ref=main'));assert.equal(seen[0].options.followRedirects,false);
 e.c.UrlFetchApp.fetch=()=>({getResponseCode:()=>200,getContentText:()=>JSON.stringify({private:false})});assert.throws(()=>e.readAccounts(),/privat/);
 e.c.UrlFetchApp.fetch=()=>({getResponseCode:()=>403,getContentText:()=> 'secret upstream detail'});assert.throws(()=>e.readAccounts(),/nicht erreichbar/);
});

test('Five-digit example passwords authenticate without registering a participant',()=>{const e=env();e.access.source='Chris | 48271\nDaniel | 63924';const result=login(e,'Chris','48271');assert.equal(e.c.getMe(result.token).name,'Chris');assert.equal(e.sheets.get('App_Teilnehmer').rows.length,1);assert.throws(()=>login(e,'Chris','48270'));assert.throws(()=>e.c.parseAccounts_('Chris | 1234'));});
