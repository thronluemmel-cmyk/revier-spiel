const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c=vm.createContext({});vm.runInContext(fs.readFileSync('src/Model.js','utf8'),c);
const fixture=JSON.parse(fs.readFileSync('tests/legacy-fixture.json','utf8'));
const legacy=c.legacy_(fixture),score=c.score_(legacy.participants,legacy.catches,legacy.rules);
test('Current four anglers and exact existing liveboard scores',()=>{
 assert.deepEqual(JSON.parse(JSON.stringify(score.rankings.map(p=>[p.name,p.points]))),[['Hendrik',826.5],['Daniel',757.9],['Roman',681.5],['Chris',191.6]]);
});
test('All joint species record holders are retained',()=>{
 const record=score.records.find(r=>r.species==='Barsch');assert.equal(record.length,43);assert.deepEqual(Array.from(record.holders),['Daniel','Hendrik']);
 assert.equal(score.records.find(r=>r.species==='Zander').holders[0],'Roman');
});
test('Live sheet corrections are read and not hard-coded snapshots',()=>{const rows=JSON.parse(JSON.stringify(fixture));rows[15][1]='40 cm';const d=c.legacy_(rows);assert.equal(c.score_(d.participants,d.catches,d.rules).rankings.find(p=>p.name==='Chris').points,209.6);});
test('Changed legacy layout fails closed',()=>{const rows=JSON.parse(JSON.stringify(fixture));rows[11][0]='Andere Person';assert.throws(()=>c.legacy_(rows),/umgebaut/);});
test('Empty season contains zero anglers and zero catches',()=>{const r=c.score_([],[],legacy.rules);assert.equal(r.rankings.length,0);assert.equal(r.catches.length,0);assert.ok(r.records.every(r=>r.length===0));});
test('Only longest three fish, and one asp, score; equal points share rank',()=>{
 const p=[{id:'a',name:'A'},{id:'b',name:'B'}];const fish=[20,40,30,10].map((length,i)=>({id:'x'+i,participantId:'a',name:'A',species:'Barsch',length}));
 fish.push({id:'r1',participantId:'a',name:'A',species:'Rapfen',length:70},{id:'r2',participantId:'a',name:'A',species:'Rapfen',length:60},{id:'b',participantId:'b',name:'B',species:'Hecht',length:250});
 const r=c.score_(p,fish,legacy.rules);assert.equal(r.rankings[0].points,250);assert.equal(r.rankings[1].rank,1);assert.equal(r.catches.filter(c=>c.counted).length,5);assert.equal(r.catches.find(c=>c.id==='x3').counted,false);
});
test('Fifth and sixth entrants score without fixed participant limit',()=>{const ps=Array.from({length:6},(_,i)=>({id:String(i),name:'Angler '+i}));assert.equal(c.score_(ps,[],legacy.rules).rankings.length,6);});
test('Upload accepts current 2026 and rejects other seasons, wrong species and bad lengths',()=>{
 const good={year:2027,species:'Hecht',length:'72,5',date:'2027-01-01',requestId:'12345678-1234-1234-1234-123456789012'};
 assert.equal(c.catchInput_(good,2027,'2027-01-02').length,72.5);
 for(const patch of [{year:2026},{year:2028},{species:'Lachs'},{length:0},{length:301},{length:'NaN'},{length:1.234},{date:'2027-02-01'},{date:'2027-02-30'},{requestId:'oops'}]) assert.throws(()=>c.catchInput_({...good,...patch},2027,'2027-01-02'));
 assert.equal(c.catchInput_({...good,year:2026,date:'2026-01-01'},2026,'2026-12-01').length,72.5);
});
test('Input validation blocks formula and HTML names',()=>{for(const s of ['=IMPORTXML(1)','<img>','a','@X'])assert.throws(()=>c.name_(s));assert.equal(c.name_('  Chris  '),'Chris');});
test('Invalid or duplicate rules rejected',()=>assert.throws(()=>c.validateRules_([...legacy.rules.slice(0,4),legacy.rules[0]])));
