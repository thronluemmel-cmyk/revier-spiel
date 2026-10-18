/* Google Apps Script backend. Only the named API functions without _ are callable from the UI. */
const CUP = Object.freeze({
  spreadsheetId:'193S7gwLq-GnZFmR0VhwowAwRdjP0v05bZ8vFz-AcTjc',
  participants:'App_Teilnehmer', catches:'App_Faenge', rules:'App_Regeln',
  timezone:'Europe/Berlin', maxPhotoBytes:1000000
});
const HEADERS = {
  participants:['Saison','Teilnehmer-ID','Name','Zugangsname','Erster Fang am','Tabellenreiter'],
  catches:['Fang-ID','Saison','Teilnehmer-ID','Name','Fischart','Laenge cm','Fangdatum','Foto-Datei-ID','Foto-Link','Eingereicht am','Status','Anfrage-ID','Foto synchronisiert'],
  rules:['Saison','Fischart','Faktor','Max. Fänge']
};
function doGet(e) {
  const output=HtmlService.createHtmlOutputFromFile('Index').setTitle('Fishay Predator Cup').addMetaTag('viewport','width=device-width, initial-scale=1');
  if(e && e.parameter && e.parameter.embed==='1') {
    const origin=String(props_().getProperty('PWA_ORIGIN') || '');
    if(!/^https:\/\/[a-z0-9-]+\.github\.io$/.test(origin)) return HtmlService.createHtmlOutput('PWA_ORIGIN in den Skripteigenschaften einrichten.');
    // Only reveal the embedded UI after the configured top-level host responds.
    const bridge=String(e.parameter.bridge||'');
    const safeBridge=/^[a-f0-9]{64}$/.test(bridge)?bridge:'';
    const guard='<style id="embed-guard">html{visibility:hidden!important}</style><script>window.FISHAY_HOST={origin:'+JSON.stringify(origin)+',nonce:'+JSON.stringify(safeBridge)+'};(function(){const origin=window.FISHAY_HOST.origin;window.addEventListener("message",function(e){if(e.source===top&&e.origin===origin&&e.data==="fishay-host-ready"){const guard=document.getElementById("embed-guard");if(guard)guard.remove();}});top.postMessage("fishay-frame-ready",origin);})();</script>';
    output.setContent(output.getContent().replace('<head>','<head>'+guard));
    output.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  return output;
}
function props_() { return PropertiesService.getScriptProperties(); }
function book_() { return SpreadsheetApp.openById(CUP.spreadsheetId); }
function activeYear_() { return Number(Utilities.formatDate(new Date(), CUP.timezone, 'yyyy')); }
function today_() { return Utilities.formatDate(new Date(), CUP.timezone, 'yyyy-MM-dd'); }
function lock_(fn) { const l=LockService.getScriptLock(); l.waitLock(30000); try { return fn(); } finally { l.releaseLock(); } }
function uuid_() { return Utilities.getUuid(); }
function hash_(s) { return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(s)).map(b=>(b & 255).toString(16).padStart(2,'0')).join(''); }
function secret_() { const s=props_().getProperty('AUTH_SECRET'); check_(s,'Bitte zuerst setup_ im Apps-Script-Editor ausführen.'); return s; }
function rows_(sheet) { return sheet && sheet.getLastRow()>1 ? sheet.getRange(2,1,sheet.getLastRow()-1,sheet.getLastColumn()).getValues() : []; }
function sheet_(book, title, headers) {
  let s=book.getSheetByName(title);
  if(!s) { s=book.insertSheet(title); s.getRange(1,1,1,headers.length).setValues([headers]).setBackground('#123f3d').setFontColor('#ffffff').setFontWeight('bold'); s.setFrozenRows(1); }
  check_(JSON.stringify(s.getRange(1,1,1,headers.length).getValues()[0])===JSON.stringify(headers),'Spaltenstruktur prüfen: '+title);
  return s;
}
function authBook_() { const id=props_().getProperty('AUTH_BOOK_ID'); check_(id,'Einrichtung fehlt: setup_ ausführen.'); return SpreadsheetApp.openById(id); }
function safeCell_(s) { return /^[=+\-@]/.test(String(s)) ? "'"+s : s; }
/* Run manually in the editor once. Never exposed to google.script.run. Idempotent. */
function setup_() {
  return lock_(() => {
    const p=props_(), book=book_();
    const legacy=legacy_(book.getSheetByName('Turnier').getRange('A1:H42').getDisplayValues());
    sheet_(book,CUP.participants,HEADERS.participants); sheet_(book,CUP.catches,HEADERS.catches);
    const rules=sheet_(book,CUP.rules,HEADERS.rules);
    if(!rows_(rules).length) rules.getRange(2,1,5,4).setValues(legacy.rules.map(r=>[2027,r.species,r.factor,r.limit]));
    if(!p.getProperty('AUTH_SECRET')) p.setProperty('AUTH_SECRET',uuid_()+uuid_());
    if(!p.getProperty('AUTH_BOOK_ID')) {
      const auth=SpreadsheetApp.create('Fishay Cup – private Anmeldung (nicht teilen)');
      p.setProperty('AUTH_BOOK_ID',auth.getId());
    }
    const auth=authBook_();
    sheet_(auth,'PasswordSessions',['Hash','Zugangsname','Gueltig bis','Zugangsversion']);
    if(!p.getProperty('PHOTO_FOLDER_ID')) p.setProperty('PHOTO_FOLDER_ID',DriveApp.createFolder('Fishay Predator Cup – Fangfotos').getId());
    if (!ScriptApp.getProjectTriggers().some(t=>t.getHandlerFunction()==='onCupEdit_')) ScriptApp.newTrigger('onCupEdit_').forSpreadsheet(book).onEdit().create();
    // 2026 remains in the existing Turnier tab; no copies that can become stale.
    return 'Einrichtung abgeschlossen. Bestehende Turnierdaten bleiben unverändert.';
  });
}
function rules_(year, persist) {
  if(year===LEGACY_YEAR) return legacy_(book_().getSheetByName('Turnier').getRange('A1:H42').getDisplayValues()).rules;
  const s=book_().getSheetByName(CUP.rules), data=rows_(s);
  const years=[...new Set(data.map(r=>Number(r[0])))].filter(y=>y<=year).sort((a,b)=>b-a);
  const source=years[0]; check_(source,'Wertungsregeln fehlen. Bitte setup_ ausführen.');
  const rules=data.filter(r=>Number(r[0])===source).map(r=>({species:r[1],factor:number_(r[2]),limit:number_(r[3])}));
  validateRules_(rules);
  if(persist && source!==year) s.getRange(s.getLastRow()+1,1,5,4).setValues(rules.map(r=>[year,r.species,r.factor,r.limit]));
  return rules;
}
function people_(year) {
  return rows_(book_().getSheetByName(CUP.participants)).filter(r=>Number(r[0])===year)
    .map(r=>({id:String(r[1]),name:String(r[2]),key:String(r[3]).toLocaleLowerCase('de-DE'),tab:String(r[5])}));
}
function catches_(year) {
  const people=people_(year), byId=new Map(people.map(p=>[p.id,p]));
  return rows_(book_().getSheetByName(CUP.catches)).filter(r=>Number(r[1])===year && r[10]==='aktiv' && byId.has(String(r[2])))
    .map(r=>({id:String(r[0]),participantId:String(r[2]),name:byId.get(String(r[2])).name,species:String(r[4]),length:number_(r[5]),date:r[6] instanceof Date?Utilities.formatDate(r[6],CUP.timezone,'yyyy-MM-dd'):String(r[6]),photo:Boolean(r[7]),source:'App'}))
    .filter(c=>SPECIES.includes(c.species)&&Number.isFinite(c.length)&&c.length>0);
}
function getBoard(year) {
  const active=activeYear_(); year=year_(year,active);
  let data;
  if(year===LEGACY_YEAR) {
    data=legacy_(book_().getSheetByName('Turnier').getRange('A1:H42').getDisplayValues());
    const ids=new Map();
    people_(year).forEach(p=>{
      const existing=data.participants.find(x=>x.name.toLocaleLowerCase('de-DE')===p.key);
      ids.set(p.id,existing?existing.id:p.id);
      if(!existing)data.participants.push({id:p.id,name:p.name});
    });
    // Baseline stays in Turnier; new catches live only in App_Faenge.
    data.catches.push(...catches_(year).map(c=>({...c,participantId:ids.get(c.participantId)||c.participantId})));
  }
  else data={participants:people_(year).map(p=>({id:p.id,name:p.name})),catches:catches_(year),rules:rules_(year,false)};
  return {year,activeYear:active,today:today_(),updatedAt:new Date().toISOString(),rules:data.rules,...score_(data.participants,data.catches,data.rules)};
}
function githubJson_(path) {
  const token=props_().getProperty('GITHUB_TOKEN');
  check_(token,'Die GitHub-Zugangsliste ist noch nicht eingerichtet.');
  const response=UrlFetchApp.fetch('https://api.github.com'+path,{
    headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},
    muteHttpExceptions:true,followRedirects:false
  });
  check_(response.getResponseCode()===200,'Die Zugangsliste ist momentan nicht erreichbar. Bitte den Veranstalter informieren.');
  return JSON.parse(response.getContentText());
}
function accounts_() {
  const repo=props_().getProperty('GITHUB_REPOSITORY')||'thronluemmel-cmyk/fishy-predator-cup';
  check_(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo),'Ungültiger Repositoryname.');
  // Never deliver passwords from a public repository or expose them through browser RPC.
  check_(githubJson_('/repos/'+repo).private===true,'Das Repository mit den Passwörtern muss privat sein.');
  const branch=props_().getProperty('GITHUB_BRANCH')||'main';
  const file=githubJson_('/repos/'+repo+'/contents/ANGLER.txt?ref='+encodeURIComponent(branch));
  check_(file.type==='file'&&file.encoding==='base64'&&file.size<=50000,'ANGLER.txt fehlt oder ist zu groß.');
  const source=Utilities.newBlob(Utilities.base64Decode(file.content.replace(/\s/g,''))).getDataAsString('UTF-8');
  return parseAccounts_(source);
}
function credentialVersion_(account) { return hash_(secret_()+JSON.stringify([account.key,account.password])); }
function login(input) {
  return lock_(()=>{
    const key=String(input&&input.name||'').trim().toLocaleLowerCase('de-DE');
    const password=String(input&&input.password||'');
    check_(key.length<=40&&password.length<=128,'Name oder Passwort ist falsch.');
    // A global hourly cap plus per-known-account cap bounds guessing without unlimited property keys.
    const p=props_(), hour=Math.floor(Date.now()/3600000);
    let budget=JSON.parse(p.getProperty('LOGIN_BUDGET')||'{}');
    if(budget.hour!==hour)budget={hour,total:0,accounts:{}};
    check_(budget.total<200,'Zu viele Anmeldeversuche. Bitte später erneut versuchen.');
    budget.total++;p.setProperty('LOGIN_BUDGET',JSON.stringify(budget));
    const account=accounts_().find(a=>a.key===key);
    check_(account,'Name oder Passwort ist falsch.');
    const accountKey=hash_(key), used=budget.accounts[accountKey]||0;
    check_(used<10,'Zu viele Versuche für diesen Namen. Bitte in der nächsten Stunde erneut versuchen.');
    budget.accounts[accountKey]=used+1;p.setProperty('LOGIN_BUDGET',JSON.stringify(budget));
    check_(hash_(password)===hash_(account.password),'Name oder Passwort ist falsch.');
    budget.accounts[accountKey]=0;p.setProperty('LOGIN_BUDGET',JSON.stringify(budget));
    const token=uuid_()+uuid_(), sessions=authBook_().getSheetByName('PasswordSessions');
    const existing=rows_(sessions);for(let i=existing.length-1;i>=0;i--)if(Number(existing[i][2])<Date.now())sessions.deleteRow(i+2);
    const expiresAt=Date.now()+(input.remember===true?30:7)*24*60*60*1000;
    sessions.appendRow([hash_(token),account.key,expiresAt,credentialVersion_(account)]);
    // Logging in never creates a participant or a personal sheet.
    return {token,expiresAt,person:{name:account.name},year:activeYear_()};
  });
}
function session_(token) {
  check_(typeof token==='string'&&token.length===72,'Bitte anmelden.');
  const row=rows_(authBook_().getSheetByName('PasswordSessions')).find(r=>r[0]===hash_(token)&&Number(r[2])>Date.now());
  check_(row,'Deine Anmeldung ist abgelaufen. Bitte erneut anmelden.');
  const account=accounts_().find(a=>a.key===row[1]);
  check_(account&&credentialVersion_(account)===row[3],'Dieser Zugang wurde geändert oder entfernt. Bitte erneut anmelden.');
  return account;
}
function getMe(token) { const account=session_(token);return {name:account.name,year:activeYear_()}; }
function logout(token) {
  return lock_(()=>{const s=authBook_().getSheetByName('PasswordSessions'),data=rows_(s),hash=hash_(String(token));for(let i=data.length-1;i>=0;i--)if(data[i][0]===hash)s.deleteRow(i+2);return {ok:true};});
}
function participantFor_(account,year) {
  return people_(year).find(p=>p.key===account.key)||{id:year+'-'+hash_(account.key).slice(0,24),name:account.name,key:account.key,tab:year+' '+account.name.slice(0,25)+' '+hash_(account.key).slice(0,6)};
}
function ensureParticipant_(person,year) {
  const ps=book_().getSheetByName(CUP.participants);
  const personal=sheet_(book_(),person.tab,['Fang-ID','Datum','Fischart','Laenge cm','Foto-Link','Foto']);
  personal.setColumnWidth(6,180);
  if(!people_(year).some(p=>p.id===person.id))ps.appendRow([year,person.id,safeCell_(person.name),safeCell_(person.key),new Date().toISOString(),person.tab]);
}
function photoBlob_(data) {
  check_(typeof data==='string' && data.length<=1400000 && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(data),'Bitte ein JPEG-Foto bis 1 MB hochladen.');
  const bytes=Utilities.base64Decode(data.split(',')[1]);
  check_(bytes.length>4&&bytes.length<=CUP.maxPhotoBytes&&(bytes[0]&255)===255&&(bytes[1]&255)===216&&(bytes[2]&255)===255&&(bytes[bytes.length-2]&255)===255&&(bytes[bytes.length-1]&255)===217,'Ungültiges JPEG-Foto.');
  return Utilities.newBlob(bytes,'image/jpeg','fang.jpg');
}
function submitCatch(token,input) {
  return lock_(()=>{
    const account=session_(token), year=activeYear_(), c=catchInput_(input,year,today_());
    const person=participantFor_(account,year);
    const s=book_().getSheetByName(CUP.catches), data=rows_(s);
    const prior=data.find(r=>r[11]===c.requestId);
    if(prior) {check_(prior[2]===person.id,'Ungültige Anfrage-ID.');ensureParticipant_(person,year);return {ok:true,id:prior[0],duplicate:true,warning:prior[12]==='ja'?'':'Fang ist gespeichert; Tabellen-Fotovorschau noch ausstehend.'};}
    check_(data.filter(r=>r[2]===person.id && Utilities.formatDate(new Date(String(r[9])),CUP.timezone,'yyyy-MM-dd')===today_()).length<30,'Maximal 30 Fangmeldungen pro Tag.');
    const blob=photoBlob_(input.photo), id=uuid_();
    rules_(year,true);
    const file=DriveApp.getFolderById(props_().getProperty('PHOTO_FOLDER_ID')).createFile(blob.setName(`${year}-${id}.jpg`));
    const values=[id,year,person.id,safeCell_(person.name),c.species,c.length,c.date,file.getId(),file.getUrl(),new Date().toISOString(),'aktiv',c.requestId,'offen'];
    // Catch row is the commit point. A partial failure never deletes a possibly committed photo.
    const row=s.getLastRow()+1; s.getRange(row,1,1,values.length).setValues([values]);
    // Only after a stored catch: create the season participant and personal view.
    ensureParticipant_(person,year);
    let warning='';
    try { syncPersonalCatch_(values,person); s.getRange(row,13).setValue('ja'); }
    catch(e) { warning='Fang und Foto sind gespeichert. Die Bildvorschau im persönlichen Tabellenreiter muss noch synchronisiert werden.'; }
    try { updateYearBoard_(year); } catch(e) { warning += ' Das Tabellen-Liveboard muss noch synchronisiert werden.'; }
    return {ok:true,id,warning};
  });
}
function syncPersonalCatch_(r,person) {
  const s=book_().getSheetByName(person.tab); check_(s,'Persönlicher Tabellenreiter fehlt.');
  const existing=rows_(s).findIndex(x=>x[0]===r[0]), row=existing<0?s.getLastRow()+1:existing+2;
  s.getRange(row,1,1,5).setValues([[r[0],r[6],r[4],r[5],r[8]]]);
  s.getImages().filter(img=>img.getAnchorCell().getRow()===row).forEach(img=>img.remove());
  const image=s.insertImage(DriveApp.getFileById(r[7]).getBlob(),6,row);
  const width=image.getWidth(), height=image.getHeight(), scale=Math.min(160/width,100/height);
  image.setWidth(Math.round(width*scale)).setHeight(Math.round(height*scale)); s.setRowHeight(row,110);
}
/* Owner-only repair in editor; also propagates manual length/status corrections to personal views. */
function syncPhotos_() {
  return lock_(()=>{
    const s=book_().getSheetByName(CUP.catches), data=rows_(s);
    data.forEach((r,i)=>{
      const p=people_(Number(r[1])).find(p=>p.id===r[2]);
      if(!p)return;
      if(r[10]==='aktiv') {syncPersonalCatch_(r,p);s.getRange(i+2,13).setValue('ja');}
      else {const tab=book_().getSheetByName(p.tab), idx=rows_(tab).findIndex(x=>x[0]===r[0]);if(idx>=0){tab.getImages().filter(img=>img.getAnchorCell().getRow()===idx+2).forEach(img=>img.remove());tab.deleteRow(idx+2);}}
    });return 'Synchronisiert';
  });
}
function getPhoto(catchId) {
  check_(/^[a-f0-9-]{36}$/.test(String(catchId)),'Ungültige Fang-ID.');
  const r=rows_(book_().getSheetByName(CUP.catches)).find(r=>r[0]===catchId && r[10]==='aktiv');
  check_(r && r[7],'Foto nicht verfügbar.');
  // Only files referenced by an active catch are served; never arbitrary Drive IDs.
  return 'data:image/jpeg;base64,'+Utilities.base64Encode(DriveApp.getFileById(r[7]).getBlob().getBytes());
}

/* Summary sheets are derived views, not editable input. */
function updateYearBoard_(year) {
  if(year<LEGACY_YEAR)return;
  const data=getBoard(year);
  const title='App_Liveboard_'+year, book=book_();
  const s=sheet_(book,title,['Platz','Angler','Punkte','Gewertete Fänge','','Fischart','Rekordhalter','Laenge cm']);
  if(s.getLastRow()>1)s.getRange(2,1,s.getLastRow()-1,8).clearContent();
  const values=Array.from({length:Math.max(data.rankings.length,5)},(_,i)=>{
    const p=data.rankings[i],r=data.records[i];
    return [p?p.rank:'',p?safeCell_(p.name):'',p?p.points:'',p?p.count:'','',r?r.species:'',r?safeCell_(r.holders.join(' & ')):'',r?r.length:''];
  });s.getRange(2,1,values.length,8).setValues(values);s.autoResizeColumns(1,8);
}
function onCupEdit_(event) {
  if(!event || !event.range)return;
  const title=event.range.getSheet().getName();
  if(![CUP.catches,CUP.participants,CUP.rules,'Turnier'].includes(title))return;
  lock_(()=>{
    const years=[...new Set([LEGACY_YEAR,...rows_(book_().getSheetByName(CUP.participants)).map(r=>Number(r[0]))])];
    years.forEach(updateYearBoard_);
  });
}
function refreshBoards_() { return lock_(()=>{[...new Set(rows_(book_().getSheetByName(CUP.participants)).map(r=>Number(r[0])))].forEach(updateYearBoard_);return 'Liveboards aktualisiert';}); }
