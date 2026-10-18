const fs=require('node:fs');
const snippet=fs.readFileSync('scripts/auth-client.js','utf8');
for(const file of ['src/Index.html','Vorschau.html']){
 let s=fs.readFileSync(file,'utf8');
 const start='/* AUTH_STORAGE_START */',end='/* AUTH_STORAGE_END */';
 const section=start+'\n'+snippet+'\n'+end;
 if(s.includes(start))s=s.slice(0,s.indexOf(start))+section+s.slice(s.indexOf(end)+end.length);
 else s=s.replace("try{token=sessionStorage.getItem('fishy-session')||'';}catch(e){}",section);
 if(!s.includes('id="rememberLogin"'))s=s.replace('<button class="btn primary" id="loginSubmit">','<label style="display:flex;align-items:center;gap:10px;margin:16px 0"><input id="rememberLogin" type="checkbox" style="width:auto;margin:0"> Auf diesem Gerät angemeldet bleiben (30 Tage)</label><button class="btn primary" id="loginSubmit">');
 s=s.replace('Eine Sitzung gilt höchstens sieben Tage.','Mit „Angemeldet bleiben“ gilt eine Sitzung bis zu 30 Tage, sonst höchstens sieben Tage und nur für die aktuelle Browsersitzung. Auf diesem Gerät wird dafür ein Anmeldeschlüssel gespeichert, nicht das Passwort.');
 s=s.replace(/async function restore\(\)\{[^\n]+/,`async function restore(){if(!token)token=await readSavedToken();if(!token)return;try{person=await rpc('getMe',token);if(!person)throw Error('Deine Anmeldung ist abgelaufen.');updateLogin();}catch(e){person=null;if(/^(Deine Anmeldung|Dieser Zugang|Bitte anmelden)/.test(e.message)){token='';await forgetLogin();}else notify('Anmeldung gerade nicht prüfbar. Bitte bei bestehender Verbindung aktualisieren.');updateLogin();}}`);
 s=s.replace(/\$\('logoutBtn'\)\.onclick=[^\n]+/,`$('logoutBtn').onclick=()=>busy($('logoutBtn'),async()=>{let failed=false;try{await rpc('logout',token);}catch(e){failed=true;}token='';person=null;await forgetLogin();updateLogin();notify(failed?'Auf diesem Gerät abgemeldet. Die Serversitzung konnte wegen eines Verbindungsfehlers nicht beendet werden.':'Du bist abgemeldet.');});`);
 s=s.replace("password:$('password').value});token=result.token;","password:$('password').value,remember:$('rememberLogin').checked});token=result.token;");
 s=s.replace("try{sessionStorage.setItem('fishy-session',token);}catch(e){}$('password').value='';","const remembered=await storeLogin(result,$('rememberLogin').checked);$('password').value='';");
 s=s.replace("notify('Angemeldet als '+person.name+'.');","notify(remembered?'Angemeldet als '+person.name+'.':'Angemeldet. Dein Browser konnte die Anmeldung nicht dauerhaft speichern.');");
 s=s.replace("$('refresh').onclick=load;","$('refresh').onclick=async()=>{await load();if(!person)await restore();};");
 fs.writeFileSync(file,s);
}
