/* Deliberately simple game rules, not wildlife management recommendations. */
(()=>{'use strict';
const species=[
 ['deer','reh','Rehwild',['deciduous','conifer','hedge'],true],['hare','hase','Feldhase',['field','flowers','hedge'],true],['fox','fuchs','Rotfuchs',['hedge','deciduous'],true],['boar','schwarzwild','Wildschwein',['deciduous','conifer'],true],
 ['rotwild','rotwild','Rotwild',['deciduous','conifer'],true],['damwild','damwild','Damwild',['deciduous','meadow'],true],['dachs','dachs','Dachs',['deciduous','hedge'],true],['waschbaer','waschbaer','Waschbär',['deciduous','wetland'],true],['eichhornchen','eichhornchen','Eichhörnchen',['deciduous','conifer'],false],['biber','biber','Biber',['water','wetland'],false],['fischotter','fischotter','Fischotter',['water','wetland'],false],['stockente','stockente','Stockente',['water','wetland'],true],['fasan','fasan','Fasan',['field','flowers','hedge'],true],['graureiher','graureiher','Graureiher',['water','wetland'],false]
].map(([kind,id,name,habitat,hunt])=>({kind,id,name,habitat,hunt}));
const byKind=Object.fromEntries(species.map(s=>[s.kind,s]));
const empty=()=>Object.fromEntries(species.map(s=>[s.kind,0]));
function capacities(tiles){const c={};for(const t of tiles)c[t]=(c[t]||0)+1;const n=k=>c[k]||0,f=n('deciduous')+n('conifer'),cover=n('hedge'),water=n('water')+n('wetland'),food=n('field')+n('flowers');
 const cap=(v,max=24)=>Math.min(max,Math.max(0,Math.floor(v)));
 return {deer:cap((f+cover)/8),hare:cap((food+cover)/7),fox:cap(Math.min((f+cover)/18,(food+cover)/8),12),boar:cap(f/12),rotwild:cap(f/22,18),damwild:cap(n('deciduous')/16,18),dachs:cap((n('deciduous')+cover)/14,12),waschbaer:cap(Math.min(f/12,water/5),12),eichhornchen:cap(f/5),biber:cap(Math.min(water/8,f/6),10),fischotter:cap(water/18,10),stockente:cap(water/5),fasan:cap(Math.min(food/6,cover/3),18),graureiher:cap(water/15,10)};
}
function reconcile(s){const caps=capacities(s.tiles);for(const a of species)if(caps[a.kind]===0)s.populations[a.kind]=0;
 if(s.event){s.event.remaining=Math.min(s.event.remaining,s.populations[s.event.kind]);if(!s.event.remaining)s.event=null}return caps;
}
function advance(s){const caps=capacities(s.tiles);s.month++;s.growthCredit||=empty();
 for(const a of species){const k=a.kind,n=s.populations[k],target=caps[k];if(!target){s.populations[k]=0;s.growthCredit[k]=0;continue}if(s.event?.kind===k)continue;
 if(n<target){s.growthCredit[k]+=Math.min(2,Math.max(1,Math.ceil((target-n)/4))*.5);const add=Math.floor(s.growthCredit[k]);s.growthCredit[k]-=add;s.populations[k]=Math.min(target,n+add);}
 else {s.growthCredit[k]=0;if(n>target)s.populations[k]=Math.max(target,n-1);}
 }
 if(!s.event&&s.month>=s.nextEventMonth){
 const over=species.filter(a=>a.hunt&&caps[a.kind]>0&&s.populations[a.kind]>caps[a.kind]);
 const settled=species.filter(a=>a.hunt&&caps[a.kind]>=3&&s.populations[a.kind]===caps[a.kind]);
 const candidates=over.length?over:settled;
 if(candidates.length){const a=candidates[Math.floor(s.month/6)%candidates.length];if(!over.length)s.populations[a.kind]++;s.event={kind:a.kind,remaining:s.populations[a.kind]-caps[a.kind]};}
 s.nextEventMonth=s.month+6;}
 reconcile(s);return s.event;
}
function take(s,kind){if(!s.event||s.event.kind!==kind||s.event.remaining<=0||s.populations[kind]<=0)return false;s.populations[kind]--;s.event.remaining--;if(!s.event.remaining)s.event=null;return true}
function valid(s){return s&&[2,3].includes(s.version)&&s.populations&&species.every(a=>Number.isInteger(s.populations[a.kind])&&s.populations[a.kind]>=0&&s.populations[a.kind]<=100)&&Number.isInteger(s.nextEventMonth)&&s.nextEventMonth>=0&&s.nextEventMonth<=100010&&(s.event===null||(s.event&&byKind[s.event.kind]?.hunt&&Number.isInteger(s.event.remaining)&&s.event.remaining>0&&s.event.remaining<=s.populations[s.event.kind]))}
window.RevierEcology={species,byKind,empty,capacities,reconcile,advance,take,valid};
})();
