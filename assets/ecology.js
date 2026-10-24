/* Deliberately simple game rules, not wildlife management recommendations. */
(()=>{'use strict';
const species=[
 ['deer','reh','Rehwild',['deciduous','conifer','hedge','field','flowers','meadow'],true],['hare','hase','Feldhase',['field','flowers','hedge','meadow'],true],['fox','fuchs','Rotfuchs',['hedge','deciduous'],true],['boar','schwarzwild','Wildschwein',['deciduous','conifer'],true],
 ['rotwild','rotwild','Rotwild',['deciduous','conifer'],true],['damwild','damwild','Damwild',['deciduous','meadow'],true],['dachs','dachs','Dachs',['deciduous','hedge'],true],['waschbaer','waschbaer','Waschbär',['deciduous','wetland'],true],['eichhornchen','eichhornchen','Eichhörnchen',['deciduous','conifer'],false],['biber','biber','Biber',['water','wetland'],false],['fischotter','fischotter','Fischotter',['water','wetland'],false],['stockente','stockente','Stockente',['water','wetland'],true],['fasan','fasan','Fasan',['field','flowers','hedge'],true],['graureiher','graureiher','Graureiher',['water','wetland'],false]
].map(([kind,id,name,habitat,hunt])=>({kind,id,name,habitat,hunt}));
const byKind=Object.fromEntries(species.map(s=>[s.kind,s]));
const empty=()=>Object.fromEntries(species.map(s=>[s.kind,0]));
// Every numeric density/rate below is a conservative GAME parameter, not a
// census, biological constant, hunting recommendation or regional target.
const TILE_HA=.01, caches=new WeakMap();
const profiles={
 deer:{birth:[4,5],recruit:.4,loss:.12,arrival:.17},hare:{birth:[2,3,4,5,6,7],recruit:.8,loss:.25,arrival:.22},
 fox:{birth:[2,3],recruit:.35,loss:.2,arrival:.09},boar:{birth:[2,3,4],recruit:.65,loss:.2,arrival:.14},
 rotwild:{birth:[4,5],recruit:.25,loss:.1,arrival:.06},damwild:{birth:[5],recruit:.3,loss:.12,arrival:.07},
 dachs:{birth:[1,2],recruit:.25,loss:.12,arrival:.08},waschbaer:{birth:[3,4],recruit:.4,loss:.2,arrival:.1},
 eichhornchen:{birth:[2,3,6,7],recruit:.55,loss:.25,arrival:.2},biber:{birth:[4,5],recruit:.2,loss:.08,arrival:.06},
 fischotter:{birth:[0,1,2,3,4,5,6,7,8,9,10,11],recruit:.15,loss:.1,arrival:.04},
 stockente:{birth:[3,4,5],recruit:.7,loss:.25,arrival:.21},fasan:{birth:[4,5,6],recruit:.6,loss:.25,arrival:.13},
 graureiher:{birth:[2,3,4],recruit:.2,loss:.15,arrival:.05}
};
const isForest=t=>t==='deciduous'||t==='conifer';
const isWater=t=>t==='water'||t==='wetland';
const soft=new Set(['weide','salweide','espe']),mast=new Set(['eiche','traubeneiche','buche']),seeds=new Set(['eiche','traubeneiche','buche','hainbuche','fichte','tanne','kiefer','lärche','douglasie']);
function invalidate(s){caches.delete(s)}
function habitat(s){
 if(caches.has(s))return caches.get(s);
 const tiles=s.tiles,N=Math.round(Math.sqrt(tiles.length)),counts={},treeCounts={},forest=new Uint8Array(tiles.length),water=new Uint8Array(tiles.length),open=new Uint8Array(tiles.length),banks=[],softBanks=[];
 const neighbors=i=>{const a=[],x=i%N;if(x)a.push(i-1);if(x<N-1)a.push(i+1);if(i>=N)a.push(i-N);if(i+N<tiles.length)a.push(i+N);return a};
 let openCells=0,softBank=0,woodBank=0,edge=0,seedCells=0,mastCells=0;
 for(let i=0;i<tiles.length;i++){const t=tiles[i];counts[t]=(counts[t]||0)+1;forest[i]=+isForest(t);water[i]=+isWater(t);const id=s.trees?.[i];if(id){treeCounts[id]=(treeCounts[id]||0)+1;if(seeds.has(id))seedCells++;if(mast.has(id))mastCells++;}}
 for(let i=0;i<tiles.length;i++){
 const t=tiles[i];if(t==='field'||t==='flowers')open[i]=1;
 if(t==='meadow'){const x=i%N,y=Math.floor(i/N);outer:for(let d=1;d<=3;d++)for(const [dx,dy] of [[-d,0],[d,0],[0,-d],[0,d]]){const xx=x+dx,yy=y+dy;if(xx<0||xx>=N||yy<0||yy>=N)continue;const v=tiles[yy*N+xx];if(['field','flowers','hedge','deciduous','conifer'].includes(v)){open[i]=1;break outer;}}}
 if(open[i])openCells++;
 if(forest[i]&&neighbors(i).some(j=>!forest[j]))edge++;
 if(water[i]){const ns=neighbors(i),wood=ns.some(j=>forest[j]||tiles[j]==='hedge');if(wood){woodBank++;banks.push(i)}if(ns.some(j=>soft.has(s.trees?.[j]))){softBank++;softBanks.push(i)}}
 }
 function largest(mask){const seen=new Uint8Array(mask.length),q=new Int32Array(mask.length);let best=0;for(let i=0;i<mask.length;i++){if(!mask[i]||seen[i])continue;let start=0,end=1;q[0]=i;seen[i]=1;while(start<end){for(const j of neighbors(q[start++]))if(mask[j]&&!seen[j]){seen[j]=1;q[end++]=j;}}best=Math.max(best,end);}return best*TILE_HA;}
 const n=t=>(counts[t]||0)*TILE_HA;
 const h={counts,treeCounts,forest,water,open,banks,openHa:openCells*TILE_HA,forestHa:n('deciduous')+n('conifer'),waterHa:n('water')+n('wetland'),deciduousHa:n('deciduous'),coniferHa:n('conifer'),hedgeHa:n('hedge'),flowersHa:n('flowers'),fieldHa:n('field'),deadwoodHa:n('deadwood'),wetlandHa:n('wetland'),largestForest:largest(forest),largestWater:largest(water),softBankKm:softBank*.01,woodBankKm:woodBank*.01,mastHa:mastCells*TILE_HA,seedHa:seedCells*TILE_HA,edgeHa:edge*TILE_HA,locations:{},bankSet:new Set(banks),softBankSet:new Set(softBanks)};
 caches.set(s,h);return h;
}
function locations(s,kind){const h=habitat(s);if(h.locations[kind])return h.locations[kind];const result=[];
 for(let i=0;i<s.tiles.length;i++){const t=s.tiles[i];let ok=false;
 if(['deer','rotwild','damwild'].includes(kind))ok=!!h.forest[i]||!!h.open[i]||t==='hedge';
 else if(['hare','fasan'].includes(kind))ok=!!h.open[i]||t==='hedge';
 else if(kind==='fox')ok=!!h.open[i]||!!h.forest[i]||t==='hedge';
 else if(kind==='biber')ok=h.water[i]&&h.softBankSet.has(i);
 else ok=byKind[kind].habitat.includes(t);
 if(ok)result.push(i);
 }h.locations[kind]=result;return result;
}
function populationFactor(s){return 2*Math.max(1,Math.min(10,(s.populationPercent||10)/10));}
function capacities(s){
 const h=habitat(s),f=h.forestHa,o=h.openHa,c=h.hedgeHa,w=h.waterHa;
 const winter=[0,1,11].includes(s.month%12),foodSeason=winter?.78:1;
 const diversity=Math.min(1,Object.keys(h.treeCounts).length/5),connected=.45+.55*Math.min(1,h.largestForest/Math.max(1,f*.35));
 let ageQuality=1;if(window.RevierWorld){window.RevierWorld.ensure(s);let sum=0,count=0;for(let i=0;i<s.trees.length;i++)if(s.trees[i]){sum+=.35+.65*window.RevierWorld.maturity(s,i);count++;}if(count)ageQuality=sum/count;}
 const quality=(.55+.25*diversity+.2*Math.min(1,(h.flowersHa+c+h.edgeHa*.1)/Math.max(1,f*.1)))*connected*ageQuality;
 const cap=(n,max=60)=>Math.floor(Math.max(0,Math.min(max,Math.floor(n+1e-8)))*populationFactor(s));
 const deerFood=f*quality+o*.65+c*2;
 const pasture=Math.min(o,f*2+c*20+h.fieldHa*2);
 const prey=o*.6+f*.3+c*4;
 return {
 deer:cap(deerFood*.08*foodSeason,36),
 hare:cap(pasture*.19*(.5+.5*Math.min(1,(c+h.flowersHa)/Math.max(1,o*.06)))*foodSeason,60),
 fox:cap(prey*.008,6),
 boar:cap(f*ageQuality*(.012+.028*Math.min(1,(h.mastHa+h.fieldHa*.4)/Math.max(1,f)))*connected*foodSeason,18),
 rotwild:h.largestForest>=20&&o>=5?cap(Math.min(f+o,o*12)*.015*foodSeason,8):0,
 damwild:h.largestForest>=10&&o>=3?cap(Math.min(h.deciduousHa+o,o*10)*.02*foodSeason,10):0,
 dachs:cap((h.deciduousHa+c)*.012*Math.min(1,(o+h.deadwoodHa*5+f*.2)/10),6),
 waschbaer:cap(Math.min(h.deciduousHa*.03,w*.15,h.woodBankKm*3),8),
 eichhornchen:cap(f*ageQuality*(.035+.065*Math.min(1,h.seedHa/Math.max(1,f)))*connected,45),
 biber:h.largestWater>=.3?cap(Math.min(h.softBankKm*4,w*.6),6):0,
 fischotter:h.largestWater>=5?cap(Math.min(w*.04,h.woodBankKm*2),2):0,
 stockente:h.largestWater>=.1?cap(w*.18*(.6+.4*Math.min(1,(h.wetlandHa+h.woodBankKm)/Math.max(1,w*.1)))*(winter?.65:1),24):0,
 fasan:cap(Math.min(o*.07,(c+h.flowersHa)*1.4)*foodSeason,18),
 graureiher:h.largestWater>=1?cap(w*.035,3):0
 };
}
function repairEvent(s,caps){if(!s.event)return;const k=s.event.kind;const remaining=Math.min(s.event.remaining,Math.max(0,s.populations[k]-caps[k]));s.event=remaining?{kind:k,remaining}:null;}
function reconcile(s){const caps=capacities(s);for(const a of species){if(s.populations[a.kind]&&!locations(s,a.kind).length)s.populations[a.kind]=0;}repairEvent(s,caps);return caps;}
function normalizeLegacy(s){const caps=capacities(s);let removed=0;for(const a of species){const k=a.kind,newCount=Math.min(s.populations[k],caps[k]);removed+=s.populations[k]-newCount;s.populations[k]=newCount;}s.event=null;s.nextEventMonth=s.month+3;return removed;}
function advance(s){
 s.month++;const caps=capacities(s),report={births:0,arrivals:0,departures:0,birthsByKind:empty()};const factor=populationFactor(s);let arrivalBudget=Math.ceil(factor);
 s.growthCredit||=empty();s.birthCredit||=empty();s.lossCredit||=empty();
 // Rank accrued migration opportunities, rotating ties so no species wins forever.
 const ordered=[...species].sort((a,b)=>s.growthCredit[b.kind]-s.growthCredit[a.kind]||((species.indexOf(a)+s.month)%species.length)-((species.indexOf(b)+s.month)%species.length));
 for(const a of ordered){const k=a.kind,p=profiles[k],target=caps[k];let n=s.populations[k];
 // Losses and emigration are not counted as harvest.
 s.lossCredit[k]+=n*p.loss/12+(n>target?Math.max(.35,(n-target)*.3):0);
 const lost=Math.min(n,Math.floor(s.lossCredit[k]));s.lossCredit[k]-=Math.floor(s.lossCredit[k]);n-=lost;report.departures+=lost;
 if(!target){s.growthCredit[k]=0;s.birthCredit[k]=0;s.populations[k]=n;continue;}
 const birthMonth=p.birth.includes(s.month%12),limit=Math.min(2000,Math.ceil(target*1.15));
 if(birthMonth&&n>=2&&n<limit){s.birthCredit[k]+=n*p.recruit/p.birth.length;const born=Math.min(Math.ceil(2*factor),Math.floor(s.birthCredit[k]),limit-n);s.birthCredit[k]-=Math.floor(s.birthCredit[k]);n+=born;report.births+=born;report.birthsByKind[k]=born;}
 else if(n<2||n>=limit)s.birthCredit[k]=0;
 if(n<target){const credit=s.growthCredit[k]+p.arrival*factor,arrived=Math.min(Math.floor(credit+1e-5),arrivalBudget,target-n);n+=arrived;arrivalBudget-=arrived;report.arrivals+=arrived;s.growthCredit[k]=Math.min(.999999,Math.max(0,credit-arrived));}
 else s.growthCredit[k]=0;
 s.populations[k]=n;
 }
 reconcile(s);
 // Warn about actual overstock only. Never create animals for an alert.
 if(!s.event&&s.month>=s.nextEventMonth){const candidates=species.filter(a=>a.hunt&&s.populations[a.kind]>caps[a.kind]&&caps[a.kind]>0);if(candidates.length){const a=candidates.sort((a,b)=>(s.populations[b.kind]-caps[b.kind])-(s.populations[a.kind]-caps[a.kind]))[0];s.event={kind:a.kind,remaining:s.populations[a.kind]-caps[a.kind]};s.nextEventMonth=s.month+6;}}
 return report;
}
function take(s,kind){if(!byKind[kind]||s.populations[kind]<=0)return false;s.populations[kind]--;if(s.event?.kind===kind){s.event.remaining--;if(!s.event.remaining)s.event=null;}return true;}
function valid(s){return s&&[2,3,4,5].includes(s.version)&&s.populations&&species.every(a=>Number.isInteger(s.populations[a.kind])&&s.populations[a.kind]>=0&&s.populations[a.kind]<=2000)&&Number.isInteger(s.nextEventMonth)&&s.nextEventMonth>=0&&s.nextEventMonth<=100010&&(s.event===null||(s.event&&byKind[s.event.kind]?.hunt&&Number.isInteger(s.event.remaining)&&s.event.remaining>0&&s.event.remaining<=s.populations[s.event.kind]));}
window.RevierEcology={species,byKind,empty,capacities,reconcile,advance,take,valid,habitat,locations,invalidate,normalizeLegacy,TILE_HA,profiles,populationFactor};
})();
