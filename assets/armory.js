/* REVIER 0.28. Niedersachsen rules checked 25 October 2026.
 * Educational selection, not a ballistics/shot-distance simulation.
 * Factory E100 figures refer only to the named example load, not an entire calibre.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id),sources={federal:'https://www.gesetze-im-internet.de/bjagdg/__19.html',state:'https://www.ml.niedersachsen.de/download/137418/Konsolidierte_Fassung_des_Niedersaechsischen_Jagdgesetzes_ab_1._April_2025_.pdf',exam:'https://www.ml.niedersachsen.de/download/164712/Fachgebiet_2_Jagdwaffen_und_Fanggeraete_nicht_vollstaendig_barrierefrei_.pdf',steel:'https://rottweil-ammunition.com/fileadmin/user_upload/rottweil/Service/Downloads/RUAG_Katalog/RUAG-Ammotec-catalogue-hunting-and-target-shooting-2020-21.pdf'};
const weapons=[
 {id:'hornet',name:'Kipplaufbüchse · .22 Hornet',short:'.22 Hornet',chamber:'.22 Hornet',description:'Ein gezogener Lauf. Kleine Büchsenpatrone für den Fuchs; die hier angebotene Laborierung genügt nicht für Rehwild.'},
 {id:'rifle308',name:'Repetierbüchse · .308 Win.',short:'.308 Win.',chamber:'.308 Win.',description:'Gezogener Lauf mit Repetierverschluss. Beide angebotenen Jagdlaborierungen erfüllen die regulären Büchsen-Mindestwerte für das Schalenwild im Spiel.'},
 {id:'shotgun12',name:'Bockdoppelflinte · 12/70',short:'Flinte 12/70',chamber:'12/70',steelProof:true,description:'Zwei übereinanderliegende glatte Läufe. Das Spielmodell besitzt die für die angebotenen Weicheisenschrotpatronen erforderliche Zulassung einschließlich Stahlschrotbeschuss. Kein Flintenlaufgeschoss in dieser Auswahl.'}
];
const loads=[
 {id:'hornet-hit',chamber:'.22 Hornet',name:'HIT 2,6 g · Deformation',short:'HIT 2,6 g',type:'bullet',diameter:5.7,e100:359,leadFree:true,construction:'Deformationsgeschoss aus Kupfer',source:'https://rws-ammunition.com/en/products/centerfire-rifle-cartridges/rws-22-hornet-hit-2-6g'},
 {id:'308-hit',chamber:'.308 Win.',name:'HIT 10,7 g · Deformation',short:'HIT 10,7 g',type:'bullet',diameter:7.82,e100:3009,leadFree:true,construction:'Kupfer-Deformationsgeschoss',source:'https://rws-ammunition.com/en/products/centerfire-rifle-cartridges/rws-308-win-hit-10-7g'},
 {id:'308-green',chamber:'.308 Win.',name:'EVO GREEN 9,0 g · Teilzerlegung',short:'EVO GREEN 9,0 g',type:'bullet',diameter:7.82,e100:2801,leadFree:true,construction:'Bleifreies Teilzerlegungsgeschoss',source:'https://rws-ammunition.com/en/products/centerfire-rifle-cartridges/rws-308-win-evo-green-9-0g'},
 {id:'steel325',chamber:'12/70',name:'Weicheisenschrot · 3,25 mm',short:'Stahlschrot 3,25 mm',type:'shot',shotSize:3.25,leadFree:true,steelProof:true,construction:'Weicheisenschrot, Lernprofil für Fasan und Stockente',source:sources.steel},
 {id:'steel375',chamber:'12/70',name:'Weicheisenschrot · 3,75 mm',short:'Stahlschrot 3,75 mm',type:'shot',shotSize:3.75,leadFree:true,steelProof:true,construction:'Gröberes Weicheisenschrot, Lernprofil für Feldhase und Fuchs',source:sources.steel}
];
const byWeapon=Object.fromEntries(weapons.map(w=>[w.id,w])),byLoad=Object.fromEntries(loads.map(a=>[a.id,a])),protectedKinds=new Set(['eichhornchen','biber','fischotter','graureiher']),ungulates=new Set(['deer','boar','rotwild','damwild']);let api;
function compatible(w,a){return !!w&&!!a&&typeof w.chamber==='string'&&typeof a.chamber==='string'&&a.chamber===w.chamber&&(!a.steelProof||w.steelProof===true);}
function ensure(s){const raw=s.armory;if(!raw||typeof raw!=='object'||Array.isArray(raw)||!Object.hasOwn(byWeapon,raw.weapon))s.armory={weapon:'rifle308',ammo:'308-hit'};const chosen=s.armory,w=byWeapon[chosen.weapon];if(!compatible(w,byLoad[chosen.ammo]))chosen.ammo=loads.find(a=>compatible(w,a)).id;return chosen;}
function current(s){const d=ensure(s);return {weapon:byWeapon[d.weapon],ammo:byLoad[d.ammo]};}
function choose(s,weaponId,ammoId){const w=Object.hasOwn(byWeapon,weaponId)?byWeapon[weaponId]:null,a=Object.hasOwn(byLoad,ammoId)?byLoad[ammoId]:null;if(!compatible(w,a))return false;s.armory={weapon:w.id,ammo:a.id};return true;}
function recommendation(kind){if(protectedKinds.has(kind))return 'Keine Munition macht die reguläre Bejagung dieser Art zulässig. Im Spiel wird keine Ausnahmegenehmigung angenommen.';
 if(kind==='deer')return 'Hier passt zum Beispiel .308 Win. mit HIT oder EVO GREEN. Bei Büchsenmunition verlangt § 19 BJagdG für Rehwild mindestens E100 = 1.000 J.';
 if(ungulates.has(kind))return 'Hier passt zum Beispiel .308 Win. mit HIT oder EVO GREEN. Regulär erforderlich bei Büchsenpatronen: mindestens 6,5 mm und E100 = 2.000 J. Schrot ist verboten.';
 if(['fasan','stockente'].includes(kind))return 'Das Spiel empfiehlt die Flinte 12/70 mit bleifreiem 3,25-mm-Weicheisenschrot. Die konkrete Eignung hängt auch von Entfernung und Deckung ab.';
 if(kind==='hare')return 'Als Lernprofil ist hier die Flinte 12/70 mit 3,75-mm-Weicheisenschrot vorgesehen. Das ist eine Spielzuordnung, keine gesetzliche Kaliberliste.';
 if(kind==='fox')return 'Im Lernprofil passen .22 Hornet HIT oder die Flinte mit 3,75-mm-Weicheisenschrot. Auch eine geeignete .308-Win.-Jagdlaborierung ist nicht allein wegen ihrer Stärke verboten.';
 return 'Im konservativen Lernprofil für Dachs und Waschbär ist hier die .308-Win.-Büchse mit HIT oder EVO GREEN vorgesehen; das ist kein gesetzliches Mindestkaliber für diese Arten.';
}
function assess(kind,weapon,ammo){
 const result=(level,text)=>({level,warning:level!=='ok',text,recommendation:recommendation(kind)});
 if(!compatible(weapon,ammo))return result('invalid','Waffe und Munition passen nicht zusammen. Die Schussabgabe ist gesperrt.');
 if(protectedKinds.has(kind))return result('protected','Artenschutz geht vor Munitionswahl: Diese Art ist im Spiel nicht regulär bejagbar.');
 if(!ammo.leadFree&&ammo.type==='bullet')return result('law','In Niedersachsen sind bleihaltige Büchsengeschosse bei der Jagd verboten (§ 24 NJagdG).');
 if(ungulates.has(kind)){
  if(ammo.type==='shot')return result('law','Achtung: falsche Munition! Schrot darf auch auf Jungtiere dieser Schalenwildart nicht verwendet werden (§ 19 Abs. 1 Nr. 1 BJagdG).');
  if(kind==='deer'&&ammo.e100<1000)return result('law','Achtung: Munition zu schwach! Diese konkrete Laborierung liefert E100 = '+ammo.e100+' J und unterschreitet die regulären 1.000 J für Rehwild. Maßgeblich ist die Energie auf 100 m, nicht E0 an der Mündung.');
  if(kind!=='deer'&&(ammo.diameter<6.5||ammo.e100<2000))return result('law','Achtung: unzulässige Büchsenmunition! Diese Laborierung erreicht nicht beide Mindestwerte für übriges Schalenwild: mindestens 6,5 mm und E100 = 2.000 J. Das gilt auch für Frischlinge und Kälber.');
  return result('ok','Die gewählte bleifreie Jagdlaborierung erfüllt die regulären Büchsen-Mindestwerte für diese Schalenwildart.');
 }
 if(ammo.type==='bullet'){
  if(['hare','fasan','stockente'].includes(kind))return result('advice','Achtung: Im Lernprofil ungeeignete Auswahl. Ein einzelnes Büchsengeschoss ist hier nicht die vorgesehene Wahl; bei kleinen Arten kann insbesondere die große .308 Win. unnötig viel Wildbret zerstören. Das ist kein pauschales gesetzliches Verbot wegen „zu viel Joule“. Auf fliegendes Wild wird im Spiel kein Kugelschuss geübt.');
  if(['dachs','waschbaer'].includes(kind)&&weapon.id==='hornet')return result('advice','Achtung: Im konservativen Lernprofil ist die kleine Hornet-Laborierung für diese Art zu schwach gewählt. Dafür gibt es hier keine gesetzliche 1.000-/2.000-J-Grenze; die Meldung ist eine Eignungsempfehlung des Spiels.');
  return result('ok','Die Kombination ist im Lernprofil für diese Wildart vorgesehen. Eine höhere Energie allein begründet für diese Art kein allgemeines Verbot.');
 }
 if(['fasan','stockente'].includes(kind))return result('ok','Bleifreies Weicheisenschrot ist das vorgesehene Lernprofil für dieses Federwild. Auch gröberes Schrot ist nicht automatisch rechtswidrig; Wirkung und Deckung müssen zusammenpassen.');
 if(['hare','fox'].includes(kind)&&ammo.shotSize>=3.75)return result('ok','Die gröbere Weicheisenschrot-Variante ist das vorgesehene Lernprofil für diese Art.');
 return result('advice','Achtung: Im Lernprofil ist diese Schrotvariante für die Art nicht vorgesehen. Zu feines Schrot oder eine unzureichende Deckung können eine ungenügende Wirkung verursachen. Es handelt sich nicht um ein pauschales gesetzliches Verbot dieser Schrotgröße.');
}
function check(s,kind){const {weapon,ammo}=current(s);return {...assess(kind,weapon,ammo),weapon,ammo};}
function render(s){const {weapon,ammo}=current(s),button=$('armory-open');button.title=weapon.name+' · '+ammo.short;button.setAttribute('aria-label','Waffe und Munition auswählen: '+weapon.name+', '+ammo.short);$('armory-current').textContent=weapon.short+' · '+ammo.short;}
function refresh(){const s=api.getState(),{weapon,ammo}=current(s);$('weapon-select').value=weapon.id;const select=$('ammo-select');select.replaceChildren();for(const a of loads.filter(a=>compatible(weapon,a))){const o=document.createElement('option');o.value=a.id;o.textContent=a.name;select.append(o);}select.value=ammo.id;$('weapon-description').textContent=weapon.description;$('ammo-description').textContent=ammo.construction+' · bleifrei'+(ammo.e100!=null?' · E100 = '+ammo.e100.toLocaleString('de-DE')+' J (Herstellerbeispiel)':' · keine Anwendung der Büchsen-E100-Grenze auf Schrot')+'.';$('ammo-source').href=ammo.source;
 const body=$('ammo-wildlife');body.replaceChildren();for(const kind of RevierEcology.species){const r=assess(kind.kind,weapon,ammo),row=document.createElement('div');row.className='ammo-species '+r.level;const title=document.createElement('strong');title.textContent=(r.level==='ok'?'✓ ':r.level==='law'||r.level==='protected'?'✕ ':'! ')+kind.name;const text=document.createElement('span');text.textContent=r.level==='ok'?'Lernprofil passend':r.level==='law'?'Gesetzliche Mindestanforderung nicht erfüllt / verboten':r.level==='protected'?'Keine reguläre Bejagung':'Eignungshinweis im Spiel';row.append(title,text);row.title=r.text+' '+r.recommendation;body.append(row);}render(s);}
function init(options){api=options;const select=$('weapon-select');for(const w of weapons){const o=document.createElement('option');o.value=w.id;o.textContent=w.name;select.append(o);}$('armory-open').onclick=()=>{refresh();$('armory-dialog').showModal();};$('armory-close').onclick=()=>$('armory-dialog').close();select.onchange=()=>{const w=byWeapon[select.value];if(!w)return;choose(api.getState(),w.id,loads.find(a=>compatible(w,a)).id);api.persist();refresh();};$('ammo-select').onchange=()=>{choose(api.getState(),select.value,$('ammo-select').value);api.persist();refresh();};render(api.getState());}
window.RevierArmory={weapons,loads,compatible,ensure,current,choose,assess,check,render,init};
})();
