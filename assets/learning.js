/* Local-first card library and editor. User content is rendered only as text. */
(()=>{'use strict';
const KEY='revier-cards-v08', defaults=window.REVIER_CARDS;
const catalog=new Map(defaults.map(c=>[c.id,c]));
const fresh=()=>({version:1,cardsEnabled:true,quizEnabled:true,overrides:{}});
let prefs=fresh(),storageWarning='',activeId='reh',editId='reh',dirty=false,api=null;
const $=id=>document.getElementById(id);
function safeURL(s){if(s==='')return true;try{return ['https:','http:'].includes(new URL(s).protocol)}catch{return false}}
function valid(data){
 if(!data||typeof data!=='object'||data.version!==1||typeof data.cardsEnabled!=='boolean'||typeof data.quizEnabled!=='boolean'||!data.overrides||typeof data.overrides!=='object'||Array.isArray(data.overrides))return false;
 for(const [id,c] of Object.entries(data.overrides)){
 if(!catalog.has(id)||!c||typeof c!=='object'||Array.isArray(c))return false;
 if(Object.keys(c).some(k=>!['name','latin','text','source','enabled'].includes(k)))return false;
 for(const [k,max] of [['name',150],['latin',150],['text',16000],['source',2000]])if(typeof c[k]!=='string'||c[k].length>max)return false;
 if(!c.name.trim()||!c.text.trim()||!safeURL(c.source)||typeof c.enabled!=='boolean')return false;
 }
 return true;
}
try{const raw=localStorage.getItem(KEY);if(raw){const p=JSON.parse(raw);if(!valid(p))throw Error();prefs=p}}catch{storageWarning='Gespeicherte Lernkarteneinstellungen konnten nicht gelesen werden. Die Standardkarten bleiben verfügbar.'}
const card=id=>{const d=catalog.get(id);return d?{...d,enabled:true,...prefs.overrides[id]}:null};
const changed=id=>{const c=card(id),d=catalog.get(id);return !!d&&['name','latin','text','source'].some(k=>c[k]!==d[k])};
function save(next){try{localStorage.setItem(KEY,JSON.stringify(next));prefs=next;return true}catch{status('Speichern nicht möglich. Änderungen sind noch nicht gespeichert. Prüfe den Browserspeicher.');return false}}
function status(s){$('cards-status').textContent=s}
function discard(){return !dirty||confirm('Ungespeicherte Änderungen verwerfen?')}
function node(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e}
function filtered(search,group,enabledOnly){const q=search.trim().toLocaleLowerCase('de');return defaults.map(d=>card(d.id)).filter(c=>(!enabledOnly||c.enabled)&&(!group||c.group===group)&&(!q||(c.name+' '+c.latin).toLocaleLowerCase('de').includes(q)))}
function options(select,all){select.replaceChildren(new Option(all,''));for(const g of new Set(defaults.map(c=>c.group)))select.add(new Option(g,g))}
function sync(){
 $('cards-global').checked=prefs.cardsEnabled;$('quiz-global').checked=prefs.quizEnabled;
 $('cards-mode-note').textContent=prefs.cardsEnabled?'Lernkarten eingeschaltet':'Lernkarten ausgeschaltet';
 const enabled=defaults.filter(d=>card(d.id).enabled).length;
 $('cards-count').textContent=enabled+' von '+defaults.length+' Karten aktiv';
 $('card-library').hidden=!api.isLearning()||!prefs.cardsEnabled;
 if(!api.isLearning()||!prefs.quizEnabled)$('quiz').replaceChildren();
 renderPicker();show(activeId);renderList();
}
function renderPicker(){
 const result=filtered($('card-search').value,$('card-group').value,true);
 const select=$('card-pick');select.replaceChildren();
 for(const c of result)select.add(new Option(c.name,c.id));
 if(result.some(c=>c.id===activeId))select.value=activeId;else activeId=result[0]?.id||'';
 $('card-results').textContent=result.length+' aktive Karten in dieser Auswahl';
 if(!result.length)select.add(new Option('Keine passende aktive Karte',''));
 select.disabled=!result.length;
}
function show(id){
 const box=$('species');box.replaceChildren();
 if(!api||!api.isLearning()||!prefs.cardsEnabled)return;
 const c=card(id);
 if(!c||!c.enabled){box.append(node('p',c?'Diese Lernkarte ist deaktiviert. Wähle eine andere Karte oder aktiviere sie in den Einstellungen.':'Keine aktive Lernkarte in dieser Auswahl.','hint'));return}
 activeId=id;
 if(Array.from($('card-pick').options).some(o=>o.value===id))$('card-pick').value=id;
 const article=node('article',undefined,'species-card');
 article.append(node('small',c.group,'card-category'),node('h3',c.icon+' '+c.name),node('i',c.latin));
 if(changed(id))article.append(node('span','Eigener Text','custom-badge'));
 article.append(node('p',c.text,'card-body'));
 if(c.source&&safeURL(c.source)){const a=node('a','Weiterführende Fachquelle / Artenübersicht ↗');a.href=c.source;a.target='_blank';a.rel='noopener noreferrer';article.append(a)}
 const b=node('button','Diese Karte bearbeiten','edit-card-link');b.type='button';b.onclick=()=>open(id);article.append(b);box.append(article);
}
function renderList(){
 const result=filtered($('edit-search').value,$('edit-group').value,false);const list=$('card-editor-list');list.replaceChildren();
 $('editor-results').textContent=result.length+' Karten gefunden';
 for(const c of result){const b=node('button',c.name+' · '+(c.enabled?'aktiv':'aus')+(changed(c.id)?' · geändert':''));b.type='button';b.dataset.cardId=c.id;b.classList.toggle('selected',c.id===editId);b.setAttribute('aria-pressed',String(c.id===editId));b.onclick=()=>{if(discard()){loadEditor(c.id);renderList()}};list.append(b)}
 if(!result.length)list.append(node('p','Keine passende Karte.','hint'));
}
function loadEditor(id){editId=id;dirty=false;const c=card(id);$('edit-title').textContent=c.name;$('edit-name').value=c.name;$('edit-latin').value=c.latin;$('edit-text').value=c.text;$('edit-source').value=c.source;$('edit-enabled').checked=c.enabled;$('edit-category').textContent=c.group;$('edit-dirty').textContent='Gespeicherter Stand';$('edit-reset').disabled=!prefs.overrides[id]}
function open(id){if($('card-settings').open&&!discard())return;loadEditor(catalog.has(id)?id:editId);$('edit-search').value='';$('edit-group').value='';status(storageWarning||'');sync();if(!$('card-settings').open)$('card-settings').showModal()}
function close(){if(discard()){dirty=false;$('card-settings').close()}}
function download(){const blob=new Blob([JSON.stringify(prefs,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='revier-lernkarten-einstellungen.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function init(callbacks){
 api=callbacks;
 options($('card-group'),'Alle Kategorien');options($('edit-group'),'Alle Kategorien');
 $('card-search').oninput=$('card-group').onchange=()=>{renderPicker();show(activeId)};
 $('card-pick').onchange=()=>show($('card-pick').value);
 $('cards-settings-open').onclick=()=>open(activeId||'reh');
 $('cards-settings-close').onclick=close;
 $('card-settings').addEventListener('cancel',e=>{e.preventDefault();close()});
 $('edit-search').oninput=$('edit-group').onchange=renderList;
 for(const id of ['edit-name','edit-latin','edit-text','edit-source','edit-enabled'])$(id).addEventListener('input',()=>{dirty=true;$('edit-dirty').textContent='Ungespeicherte Änderungen'});
 $('edit-form').onsubmit=e=>{
 e.preventDefault();const value={name:$('edit-name').value.trim(),latin:$('edit-latin').value.trim(),text:$('edit-text').value.trim(),source:$('edit-source').value.trim(),enabled:$('edit-enabled').checked};
 const next={...prefs,overrides:{...prefs.overrides,[editId]:value}};
 if(!valid(next)){status('Bitte Namen und Lerntext ausfüllen. Quellen müssen eine gültige http(s)-Adresse sein oder leer bleiben.');return}
 if(save(next)){loadEditor(editId);$('quiz').replaceChildren();sync();status('Lernkarte gespeichert. Deine Änderungen gelten auf diesem Gerät.');}
 };
 $('edit-reset').onclick=()=>{if(!confirm('Diese Karte auf den mitgelieferten Text zurücksetzen und aktivieren?'))return;const overrides={...prefs.overrides};delete overrides[editId];if(save({...prefs,overrides})){loadEditor(editId);sync();status('Originalkarte wiederhergestellt.')}};
 for(const [id,key] of [['cards-global','cardsEnabled'],['quiz-global','quizEnabled']])$(id).onchange=()=>{const value=$(id).checked;if(save({...prefs,[key]:value})){sync();status(value?'Eingeschaltet.':'Ausgeschaltet.')}else $(id).checked=prefs[key]};
 for(const [id,enabled] of [['enable-all',true],['disable-all',false]])$(id).onclick=()=>{
 if(!discard())return;if(!confirm('Alle 136 Lernkarten '+(enabled?'aktivieren':'deaktivieren')+'? Eigene Texte bleiben erhalten.'))return;
 const overrides={...prefs.overrides};for(const d of defaults){const c=card(d.id);overrides[d.id]={name:c.name,latin:c.latin,text:c.text,source:c.source,enabled}}
 if(save({...prefs,overrides})){loadEditor(editId);$('quiz').replaceChildren();sync();status('Alle Karten '+(enabled?'aktiviert.':'deaktiviert.'))}
 };
 $('cards-export').onclick=()=>{if(dirty){status('Bitte die bearbeitete Karte zuerst speichern.');return}download();status('Export erstellt: Texte und Einstellungen sind enthalten.')};
 $('cards-import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{
 if(!discard())return;if(file.size>3000000)throw Error('Die Datei ist zu groß.');const next=JSON.parse(await file.text());if(!valid(next))throw Error('Ungültige Lernkartendatei.');
 if(!confirm('Lernkarteneinstellungen und eigene Texte durch diese Sicherung ersetzen?'))return;
 if(save(next)){loadEditor(editId);$('quiz').replaceChildren();sync();status('Lernkartensicherung importiert.')}
 }catch(err){status('Import fehlgeschlagen: '+(err instanceof SyntaxError?'Keine gültige JSON-Datei.':err.message))}finally{e.target.value=''}};
 window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});
 // Apply updates from another tab only when no editor draft is at risk.
 window.addEventListener('storage',e=>{if(e.key!==KEY)return;if(dirty){status('In einem anderen Tab wurden Einstellungen geändert. Exportiere bei Bedarf deine Version, bevor du neu lädst.');return}try{const p=e.newValue?JSON.parse(e.newValue):fresh();if(valid(p)){prefs=p;loadEditor(editId);sync()}}catch{}});
 loadEditor(editId);sync();
 if(storageWarning)api.notify(storageWarning);
}
window.RevierLearning={init,show,sync,open,isEnabled:id=>!!card(id)?.enabled,quizAllowed:id=>prefs.quizEnabled&&!!card(id)?.enabled&&!changed(id),get cardsEnabled(){return prefs.cardsEnabled}};
})();
