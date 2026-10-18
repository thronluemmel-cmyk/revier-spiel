/* Pure domain functions. Underscore suffix prevents browser RPC access. */
const LEGACY_YEAR = 2026;
const LEGACY_NAMES = ['Chris', 'Daniel', 'Hendrik', 'Roman'];
const SPECIES = ['Hecht', 'Zander', 'Barsch', 'Meerforelle', 'Rapfen'];
function number_(value) {
  if (typeof value === 'number') return value;
  const s = String(value == null ? '' : value).trim().replace(/\s*cm$/i, '').replace(',', '.');
  return s === '' ? 0 : Number(s);
}
function check_(condition, message) { if (!condition) throw new Error(message); }
function text_(value, max) { return String(value == null ? '' : value).trim().slice(0, max); }
function name_(value) {
  const name = String(value || '').trim().replace(/\s+/g, ' ');
  check_(name.length >= 2 && name.length <= 40 && /^[\p{L}\p{N} ._\-]+$/u.test(name), 'Der Name muss 2–40 Zeichen haben (Buchstaben, Zahlen, Leerzeichen, Punkt, Bindestrich).');
  return name;
}
function year_(value, active) {
  const n = Number(value);
  check_(Number.isInteger(n) && n >= LEGACY_YEAR && n <= Math.max(2027, active), 'Ungültige Saison.');
  return n;
}
function legacy_(rows) {
  const rules = rows.slice(5, 10).map(r => ({species:r[4], factor:number_(r[5]), limit:number_(r[6])}));
  validateRules_(rules);
  const participants = [], catches = [];
  LEGACY_NAMES.forEach((name, i) => {
    const offset = 11 + i * 8;
    check_(rows[offset] && rows[offset][0] === name, 'Das Blatt Turnier wurde umgebaut. Bitte die Zuordnung in Model.js prüfen.');
    const id = 'legacy-' + name.toLowerCase();
    participants.push({id, name});
    rules.forEach((rule, j) => {
      const row = rows[offset + 2 + j] || [];
      check_(row[0] === rule.species, 'Fischarten in Turnier stimmen nicht mit der erwarteten Struktur überein.');
      for (let k = 1; k <= rule.limit; k++) {
        const length = number_(row[k]);
        check_(Number.isFinite(length) && length >= 0, 'Ungültige Fanglänge in Turnier.');
        if (length > 0) catches.push({id:`${id}-${j}-${k}`, participantId:id, name, species:rule.species, length, date:'', photo:false, source:'Tabelle'});
      }
    });
  });
  return {participants, catches, rules};
}
function validateRules_(rules) {
  check_(rules.length === SPECIES.length, 'Fünf Wertungsregeln werden benötigt.');
  SPECIES.forEach(s => {
    const r = rules.find(r => r.species === s);
    check_(r && Number.isFinite(r.factor) && r.factor > 0 && Number.isInteger(r.limit) && r.limit > 0 && r.limit <= 20, 'Ungültige Wertungsregel für ' + s);
  });
}
function score_(participants, catches, rules) {
  const countedIds = new Set();
  const rankings = participants.map(p => {
    let points = 0, counted = 0;
    const breakdown = rules.map(rule => {
      const fish = catches.filter(c => c.participantId === p.id && c.species === rule.species)
        .sort((a,b) => b.length-a.length || a.id.localeCompare(b.id)).slice(0, rule.limit);
      fish.forEach(c => countedIds.add(c.id));
      const subtotal = fish.reduce((n,c) => n + c.length * rule.factor, 0);
      points += subtotal; counted += fish.length;
      return {species:rule.species, count:fish.length, limit:rule.limit, points:Math.round(subtotal*100)/100};
    });
    return {...p, points:Math.round(points*100)/100, count:counted, breakdown};
  }).sort((a,b) => b.points-a.points || a.name.localeCompare(b.name, 'de'));
  rankings.forEach((p,i) => {p.rank = i && p.points === rankings[i-1].points ? rankings[i-1].rank : i+1;});
  const records = rules.map(rule => {
    const fish = catches.filter(c => c.species === rule.species);
    const max = fish.reduce((n,c) => Math.max(n,c.length),0);
    return {species:rule.species, length:max, holders:[...new Set(fish.filter(c=>c.length===max).map(c=>c.name))]};
  });
  return {rankings, records, catches:catches.map(c=>({...c,counted:countedIds.has(c.id)}))};
}
function catchInput_(input, active, today) {
  check_(input && Number(input.year) === active && active >= LEGACY_YEAR, 'Fänge sind nur für die laufende Saison möglich.');
  check_(SPECIES.includes(input.species), 'Bitte eine gültige Fischart auswählen.');
  const length = number_(input.length);
  check_(Number.isFinite(length) && length > 0 && length <= 300 && Math.abs(length*10 - Math.round(length*10)) < 0.00001, 'Die Länge muss zwischen 0,1 und 300 cm liegen, mit höchstens einer Nachkommastelle.');
  const date = String(input.date || '');
  check_(/^\d{4}-\d{2}-\d{2}$/.test(date) && date.slice(0,4) === String(active) && date <= today && new Date(date).toISOString().slice(0,10) === date, 'Bitte ein gültiges Fangdatum aus der laufenden Saison wählen.');
  check_(/^[a-f0-9-]{36}$/.test(String(input.requestId)), 'Ungültige Übertragungs-ID. Bitte die Seite neu laden.');
  return {species:input.species, length, date, requestId:input.requestId};
}

function parseAccounts_(source) {
  check_(typeof source==='string'&&source.length<=50000,'Ungültige Zugangsliste.');
  const users=[],seen=new Set();
  source.replace(/^\uFEFF/,'').split(/\r?\n/).forEach((line,i)=>{
    if(!line.trim()||line.trim().startsWith('#'))return;
    const parts=line.split('|');check_(parts.length===2,'ANGLER.txt: Formatfehler in Zeile '+(i+1)+'.');
    const name=name_(parts[0]),key=name.toLocaleLowerCase('de-DE'),password=parts[1].trim();
    check_(!seen.has(key),'ANGLER.txt: Name doppelt in Zeile '+(i+1)+'.');seen.add(key);
    if(!password)return; // empty password disables access
    check_(password.length>=5&&password.length<=128,'ANGLER.txt: Passwort in Zeile '+(i+1)+' muss 5–128 Zeichen haben.');
    users.push({key,name,password});
  });return users;
}
