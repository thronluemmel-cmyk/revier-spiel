/* Niedersachsen learning model, sources checked 16 October 2026.
 * Month-only play uses the FIRST day of the selected month. No daily clock.
 * Legal exceptions and parent protection are explained, not simulated.
 */
(()=>{'use strict';
const sources={state:'https://www.ml.niedersachsen.de/startseite/themen/wald_holz_jagd/jagd_in_niedersachsen/gesetze-und-andere-bestimmungen-rund-um-das-thema-jagd-und-jager-5137.html',table:'https://www.ml.niedersachsen.de/download/163729/Aktuelle_Jagdzeiten_in_Niedersachsen_Stand_25.01.2021_nicht_vollstaendig_barrierefrei_.pdf',parents:'https://www.gesetze-im-internet.de/bjagdg/__22.html'};
const all=[[101,1231]],autumn=[[901,131]],may=[[401,131]],split=[[401,515],[901,131]],red=[[801,131]],redSplit=[[401,515],[801,131]];
const rule=(label,dates,note='')=>({label,dates,note});
const rules={
 deer:{young:rule('Kitz',autumn),male:rule('Rehbock',may),yearling:rule('Schmalreh',split),female:rule('Ricke',autumn)},
 rotwild:{young:rule('Kalb',red),male:rule('Hirsch',red),spike:rule('Schmalspießer',redSplit),yearling:rule('Schmaltier',redSplit),female:rule('Alttier',red)},
 damwild:{young:rule('Kalb',autumn),male:rule('Hirsch',red),spike:rule('Schmalspießer',redSplit),yearling:rule('Schmaltier',redSplit),female:rule('Alttier',autumn)},
 fox:{young:rule('Jungfuchs',all),adult:rule('Altfuchs',[[616,228]])},
 fasan:{male:rule('Fasanenhahn',[[1001,115]]),female:rule('Fasanenhenne',[[1001,115]])},
 hare:{adult:rule('Feldhase',[[1001,1231]])},boar:{adult:rule('Schwarzwild',all)},dachs:{young:rule('Jungdachs',all),adult:rule('Dachs',[[801,131]])},waschbaer:{young:rule('Jungwaschbär',all),adult:rule('Waschbär',[[716,331]])},stockente:{adult:rule('Stockente',[[901,115]])},
 eichhornchen:{adult:rule('Eichhörnchen',[],'Artenschutz: keine reguläre Jagdzeit.')},biber:{adult:rule('Biber',[],'Artenschutz: keine reguläre Jagdzeit. Behördliche Ausnahmen sind hier nicht abgebildet.')},fischotter:{adult:rule('Fischotter',[],'Ganzjährig geschont; keine reguläre Jagdzeit.')},
 graureiher:{adult:rule('Graureiher',[],'Ganzjährig geschont; keine reguläre Jagdzeit in Niedersachsen.')}
};
function assign(a,month,newborn=false){if(!['m','f'].includes(a.sex))a.sex=a.id%2?'m':'f';if(!Number.isInteger(a.bornMonth))a.bornMonth=newborn?month:month-36-(a.id%24);return a;}
function valid(a,month){return ['m','f'].includes(a.sex)&&Number.isInteger(a.bornMonth)&&a.bornMonth>=-120&&a.bornMonth<=month;}
function classify(a,month){const set=rules[a.kind];const age=Math.max(0,Math.floor((month-3)/12)-Math.floor((a.bornMonth-3)/12));if(['deer','rotwild','damwild'].includes(a.kind)){if(age===0)return set.young;if(a.sex==='m')return age===1&&set.spike?set.spike:set.male;return age===1?set.yearling:set.female;}if(['fox','dachs','waschbaer'].includes(a.kind))return month-a.bornMonth<12?set.young:set.adult;if(a.kind==='fasan')return set[a.sex==='m'?'male':'female'];return set.adult;}
const format=n=>String(n%100).padStart(2,'0')+'.'+String(Math.floor(n/100)).padStart(2,'0')+'.';
function period(r){return r.dates===all?'ganzjährig':r.dates.length?r.dates.map(([a,b])=>format(a)+' bis '+format(b)).join(' und '):'keine reguläre Jagdzeit';}
function check(a,month){const r=classify(a,month),date=(month%12+1)*100+1,open=r.dates.some(([a,b])=>a<=b?date>=a&&date<=b:date>=a||date<=b);return {...r,open,period:period(r),date:format(date),warning:!open};}
function explain(a,month){const r=check(a,month);return { ...r,title:r.open?'Jagdzeit im Spielkalender':'Achtung: außerhalb der Jagdzeit geschossen!',text:r.label+' · geprüft zum '+r.date+' (Spielmonat). Jagdzeit: '+r.period+'. '+r.note};}
window.RevierHunting={rules,sources,assign,valid,classify,period,check,explain};
})();
