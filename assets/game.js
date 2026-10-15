(()=>{'use strict';
const N=212,S=30,KEY='revier-wildnis-v02',AREA=N*N,SCALE=N/300;
const EXTRA=[['rotwild','Rothirsch',4,['deciduous','meadow'],0,0],['damwild','Damhirsch',4,['deciduous','meadow'],1,0],['dachs','Dachs',4,['hedge','deciduous'],2,0],['waschbaer','Waschbär',3,['deciduous','wetland'],3,0],['eichhornchen','Eichhörnchen',7,['deciduous','conifer'],4,0],['biber','Biber',3,['water','wetland'],0,1],['fischotter','Fischotter',3,['water','wetland'],1,1],['stockente','Stockente',8,['water'],2,1],['fasan','Fasan',5,['field','meadow'],3,1],['graureiher','Graureiher',3,['water','wetland'],4,1]];
const eco=window.RevierEcology,trees=window.RevierTrees;let selectedTrees={deciduous:'eiche',conifer:'fichte'};let hunting=false,aim=null;
const EXTRA_BY_ID=Object.fromEntries(EXTRA.map(a=>[a[0],a]));
const TYPES=[['meadow','🌾','Wiese','#a9c878'],['deciduous','🌳','Laubwald','#4b9158'],['conifer','🌲','Nadelwald','#326e4b'],['water','💧','Wasser','#4c9dca'],['field','🌱','Acker','#d2b46b'],['mountain','⛰️','Berg','#92938b'],['hedge','🌿','Hecke','#69965a'],['wetland','🪷','Feuchtgebiet','#76a895'],['path','🟫','Waldweg','#b59b72'],['deadwood','🪵','Totholz','#907a58'],['flowers','🌼','Blumenwiese','#b1cb76']];
const byId=Object.fromEntries(TYPES.map(t=>[t[0],t]));const $=id=>document.getElementById(id);let tool='deciduous',state,painting=false,migrationRemoved=0;let zoom=1.15,viewX=62,viewY=76,pan=false,panStart=null,dirty=false,inspect=false;let learning=true;try{learning=localStorage.getItem('revier-learning-v04')!=='off'}catch{}
function fresh(){return {version:4,month:0,tiles:Array(AREA).fill('meadow'),trees:Array(AREA).fill(null),animals:[],nextAnimalId:1,harvest:eco.empty(),growthCredit:eco.empty(),birthCredit:eco.empty(),lossCredit:eco.empty(),populations:eco.empty(),event:null,nextEventMonth:6}}
function migrate(s){
 if(s&&s.version===1&&Array.isArray(s.tiles)&&[AREA,90000].includes(s.tiles.length)&&s.tiles.every(t=>!!byId[t])&&Number.isFinite(s.deer)&&s.deer>=0&&s.deer<=100000&&Number.isFinite(s.hares)&&s.hares>=0&&s.hares<=100000){
 const old=s.tiles;const tiles=old.length===AREA?old:Array.from({length:AREA},(_,i)=>old[Math.floor(Math.floor(i/N)/SCALE)*300+Math.floor((i%N)/SCALE)]);
 s={version:2,month:s.month,tiles,populations:{...eco.empty(),deer:Math.min(100,Math.round(s.deer)),hare:Math.min(100,Math.round(s.hares))},event:null,nextEventMonth:s.month+6};
 }if(s&&s.version===2&&Array.isArray(s.tiles)){s={...s,version:3,trees:s.tiles.map(t=>t==='deciduous'?'eiche':t==='conifer'?'fichte':null),animals:[],nextAnimalId:1,harvest:eco.empty(),growthCredit:eco.empty()};}if(s&&s.version===3){s={...s,version:4,birthCredit:eco.empty(),lossCredit:eco.empty(),growthCredit:eco.empty()};if(valid(s)){migrationRemoved=eco.normalizeLegacy(s);}}return s;
}
function valid(s){return eco.valid(s)&&Number.isInteger(s.month)&&s.month>=0&&s.month<=100000&&Array.isArray(s.tiles)&&s.tiles.length===AREA&&s.tiles.every(t=>!!byId[t])&&s.version===4&&Array.isArray(s.trees)&&s.trees.length===AREA&&s.trees.every((id,i)=>['deciduous','conifer'].includes(s.tiles[i])?trees.byId[id]?.type===s.tiles[i]:id===null)&&s.harvest&&eco.species.every(a=>Number.isSafeInteger(s.harvest[a.kind])&&s.harvest[a.kind]>=0)&&s.growthCredit&&eco.species.every(a=>Number.isFinite(s.growthCredit[a.kind])&&s.growthCredit[a.kind]>=0&&s.growthCredit[a.kind]<1)&&['birthCredit','lossCredit'].every(key=>s[key]&&eco.species.every(a=>Number.isFinite(s[key][a.kind])&&s[key][a.kind]>=0&&s[key][a.kind]<1))&&Number.isSafeInteger(s.nextAnimalId)&&s.nextAnimalId>0&&Array.isArray(s.animals)&&s.animals.length<=1400&&new Set(s.animals.map(a=>a.id)).size===s.animals.length&&s.animals.every(a=>Number.isSafeInteger(a.id)&&a.id>0&&a.id<s.nextAnimalId&&eco.byKind[a.kind]&&Number.isFinite(a.x)&&a.x>=.5&&a.x<N&&Number.isFinite(a.y)&&a.y>=.5&&a.y<N&&Number.isFinite(a.phase))}
try{let v=migrate(JSON.parse(localStorage.getItem(KEY)));state=valid(v)?v:fresh()}catch{state=fresh()}
const canvas=$('map'),ctx=canvas.getContext('2d');const V=canvas.width;let decorations=[];function hash(i){let x=Math.sin(i*94.12+5.1)*47453.5;return x-Math.floor(x)}
let animationTime=0,framePending=false;
function colorFor(type,season){const colors={meadow:['#b2c982','#8fb86d','#bdab72','#c8c6b9'],flowers:['#a9ca80','#8fbf70','#bfae76','#c9c7b7'],deciduous:['#77a65f','#477f45','#b17e46','#b9b6aa'],conifer:['#497957','#346b4d','#416d4f','#667b70'],water:['#65b5c8','#438db5','#528fae','#8caeb9'],field:['#b9b47d','#c6ac65','#aa8d57','#c1bcb0'],mountain:['#979e94','#919a91','#99938b','#b8b8b5'],hedge:['#6e9c5e','#4b8951','#8d7847','#a4aaa0'],wetland:['#79a999','#6c9c89','#9b9980','#b4bbb6'],path:['#b8a27b','#b49a6e','#a68e6b','#b3aca0'],deadwood:['#8e9b72','#7e966b','#a58c69','#b5b2a5']};return (colors[type]||colors.meadow)[season]}
function disk(x,y,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
function tree(px,py,size,type,i,season){let x=px+size*.52,y=py+size*.62,r=size*.35;ctx.fillStyle='rgba(21,39,22,.19)';ctx.beginPath();ctx.ellipse(x+r*.25,y+r*.4,r*.82,r*.42,-.2,0,7);ctx.fill();ctx.fillStyle='#68523b';ctx.fillRect(x-r*.12,y-r*.05,r*.24,r*.62);if(type==='conifer'){for(let k=0;k<3;k++){let yy=y-r*.95+k*r*.35,rr=r*(.53+k*.22);ctx.fillStyle=['#234d3b','#2b6749','#3b7950'][k];ctx.beginPath();ctx.moveTo(x,yy-r*.8);ctx.lineTo(x-rr,yy+r*.65);ctx.lineTo(x+rr,yy+r*.65);ctx.fill()}if(season===3){ctx.strokeStyle='#dce6e4';ctx.lineWidth=Math.max(1,size*.045);ctx.beginPath();ctx.moveTo(x,y-r*1.15);ctx.lineTo(x-r*.48,y-r*.2);ctx.moveTo(x,y-r*.95);ctx.lineTo(x+r*.4,y+r*.06);ctx.stroke()}}else{let leaves=season===2?['#b87837','#d39a4b','#8e7337']:season===3?['#aeb7ad','#d1d4cc','#9fa9a1']:season===0?['#6da85c','#8fc375','#508c4d']:['#387a40','#50994a','#2c673b'];for(let k=0;k<5;k++){let angle=k*Math.PI*2/5;disk(x+Math.cos(angle)*r*.48,y-r*.62+Math.sin(angle)*r*.4,r*.48,leaves[k%3])}disk(x,y-r*.65,r*.6,leaves[1])}}
function animalSprite(x,y,r,kind){ctx.save();ctx.translate(x,y);ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(0,r*.55,r*.9,r*.24,0,0,7);ctx.fill();let body=kind==='deer'?'#a87348':kind==='hare'?'#937658':kind==='fox'?'#c77b3c':'#544d42';ctx.fillStyle=body;ctx.beginPath();ctx.ellipse(0,0,r*.75,r*.42,-.2,0,7);ctx.fill();disk(r*.58,-r*.24,r*.3,body);if(kind==='deer'){ctx.strokeStyle='#644d35';ctx.lineWidth=Math.max(1,r*.09);for(let a of [-.5,.3]){ctx.beginPath();ctx.moveTo(a*r,r*.22);ctx.lineTo((a-.12)*r,r*.85);ctx.stroke()}ctx.beginPath();ctx.moveTo(r*.65,-r*.43);ctx.lineTo(r*.52,-r*.95);ctx.moveTo(r*.65,-r*.43);ctx.lineTo(r*.9,-r*.86);ctx.stroke()}else if(kind==='hare'){ctx.fillStyle=body;ctx.beginPath();ctx.ellipse(r*.46,-r*.75,r*.13,r*.45,-.2,0,7);ctx.ellipse(r*.7,-r*.76,r*.13,r*.45,.1,0,7);ctx.fill()}else if(kind==='fox'){ctx.fillStyle='#e5d8b6';ctx.beginPath();ctx.moveTo(r*.75,-r*.15);ctx.lineTo(r*1.18,-r*.05);ctx.lineTo(r*.7,r*.08);ctx.fill();ctx.fillStyle=body;ctx.beginPath();ctx.moveTo(-r*.55,-r*.1);ctx.lineTo(-r*1.35,-r*.42);ctx.lineTo(-r*.9,r*.3);ctx.fill()}else{disk(r*.8,-r*.18,r*.17,'#756c5a')}ctx.restore()}
// Version 0.6: deterministic hand-painted terrain detailing (no external assets).
function terrainDetail(type,px,py,size,i,season){
 if(size<9)return;
 const rnd=n=>hash(i*13+n*977), winter=season===3;
 ctx.save();ctx.beginPath();ctx.rect(px,py,size+.3,size+.3);ctx.clip();
 if(type==='water'){
  let g=ctx.createLinearGradient(px,py,px+size,py+size);g.addColorStop(0,'rgba(255,255,255,.13)');g.addColorStop(.55,'rgba(0,50,86,.08)');g.addColorStop(1,'rgba(255,255,255,.04)');ctx.fillStyle=g;ctx.fillRect(px,py,size,size);
  ctx.strokeStyle='rgba(226,250,250,.3)';ctx.lineWidth=Math.max(.6,size*.022);
  for(let n=0;n<3;n++){let xx=px+size*rnd(n+2), yy=py+size*rnd(n+8);ctx.beginPath();ctx.moveTo(xx-size*.11,yy);ctx.quadraticCurveTo(xx,yy-size*.05,xx+size*.17,yy);ctx.stroke()}
 }else if(type==='path'){
  for(let n=0;n<9;n++){ctx.fillStyle=n%3===0?'rgba(86,65,43,.23)':'rgba(246,218,167,.34)';let x=px+size*rnd(n+3),y=py+size*rnd(n+15);ctx.beginPath();ctx.ellipse(x,y,size*(.018+rnd(n+21)*.025),size*.018,0,0,7);ctx.fill()}
 }else if(type==='mountain'){
  ctx.strokeStyle='rgba(255,255,255,.19)';ctx.lineWidth=Math.max(.7,size*.03);ctx.beginPath();ctx.moveTo(px+size*.16,py+size*.82);ctx.lineTo(px+size*.56,py+size*.19);ctx.stroke();
 }else{
  let count=size<18?3:size<40?8:16;
  for(let n=0;n<count;n++){
   let x=px+size*rnd(n+1),y=py+size*rnd(n+45),v=rnd(n+89);
   if(type==='field'){
    ctx.strokeStyle=winter?'rgba(247,247,238,.27)':'rgba(77,86,39,.34)';ctx.lineWidth=Math.max(.5,size*.018);ctx.beginPath();ctx.moveTo(x,y+size*.065);ctx.lineTo(x+size*.018,y-size*.06);ctx.stroke();
   }else if(type==='flowers'||type==='meadow'||type==='wetland'){
    ctx.strokeStyle=winter?'rgba(255,255,255,.55)':'rgba(31,95,39,.4)';ctx.lineWidth=Math.max(.6,size*.015);ctx.beginPath();ctx.moveTo(x,y+size*.045);ctx.lineTo(x+size*(v-.5)*.07,y-size*.08);ctx.stroke();
    if(type==='flowers'&&!winter&&n%3===0){ctx.fillStyle=['#f5df78','#f9f3e7','#dc93a8','#f4c2e0'][n%4];ctx.beginPath();ctx.arc(x,y-size*.075,Math.max(.8,size*.037),0,7);ctx.fill()}
   }else if(type==='deciduous'||type==='conifer'||type==='hedge'||type==='deadwood'){
    ctx.fillStyle=winter?'rgba(239,243,231,.18)':n%3?'rgba(15,58,25,.16)':'rgba(230,213,141,.19)';ctx.beginPath();ctx.ellipse(x,y,size*.045,size*.018,v*6,0,7);ctx.fill();
   }
  }
 }
 if(winter&&type!=='water'&&type!=='path'&&type!=='conifer'&&size>16){ctx.fillStyle='rgba(243,247,246,.15)';ctx.fillRect(px,py,size,size)}
 ctx.restore();
}
// 0.7: image artwork, layered scenery and a cached terrain pass.
const art={}; let groundCache=null,sceneCache=null,sceneKey='',groundKey='',actors=[],drawnActors=[];
for(const name of ['woodland','wildlife','wildlife-more','trees-a','trees-b','trees-c']){const im=new Image();art[name]=im;im.onload=()=>{groundKey='';draw()};im.src='assets/art/'+name+'.webp'}
function sprite(atlas,col,row,x,y,w,h,flip=false){
 const im=art[atlas];if(!im||!im.complete||!im.naturalWidth)return false;
 let xs=atlas==='woodland'?[0,392,735,1102,1448]:atlas==='wildlife-more'?[0,430,835,1175,1655,1984].map(x=>x*im.naturalWidth/1984):[0,768,1536];
 let ys=atlas==='woodland'?[0,418,710,1086]:atlas==='wildlife-more'?[0,445*im.naturalHeight/784,im.naturalHeight]:[0,512,1024];
 if(atlas.startsWith('trees-')){const cols=atlas==='trees-b'?4:3,rows=atlas==='trees-a'?3:2;xs=Array.from({length:cols+1},(_,i)=>i*im.naturalWidth/cols);ys=Array.from({length:rows+1},(_,i)=>i*im.naturalHeight/rows);}
 const sw=xs[col+1]-xs[col],sh=ys[row+1]-ys[row],scale=Math.min(w/sw,h/sh);
 const dw=sw*scale,dh=sh*scale;
 ctx.save();ctx.translate(x,y);if(flip)ctx.scale(-1,1);
 ctx.drawImage(im,xs[col],ys[row],sw,sh,-dw/2,-dh,dw,dh);ctx.restore();return true;
}
// Cache small, season-tinted tree sprites once instead of filtering a large atlas
// hundreds of times during every pan frame.
const treeSprites=new Map();
function treeSprite(t,season,x,y,w,h,flip){
 const im=art[t.atlas];if(!im?.complete||!im.naturalWidth)return false;
 const key=t.id+':'+season;let tile=treeSprites.get(key);
 if(!tile){tile=document.createElement('canvas');tile.width=192;tile.height=192;const c=tile.getContext('2d'),cols=t.atlas==='trees-b'?4:3,rows=t.atlas==='trees-a'?3:2,sw=im.naturalWidth/cols,sh=im.naturalHeight/rows,scale=Math.min(192/sw,192/sh);if(season===2&&(t.type==='deciduous'||t.id==='lärche'))c.filter='sepia(.65) saturate(1.4)';if(season===3)c.filter='saturate(.35) brightness(1.15)';c.drawImage(im,t.col*sw,t.row*sh,sw,sh,(192-sw*scale)/2,192-sh*scale,sw*scale,sh*scale);treeSprites.set(key,tile);}
 const size=Math.min(w,h);ctx.save();ctx.translate(x,y);if(flip)ctx.scale(-1,1);ctx.drawImage(tile,-size/2,-size,size,size);ctx.restore();return true;
}
function queueDraw(){if(framePending)return;framePending=true;requestAnimationFrame(()=>{framePending=false;draw();});}

function draw(){
 const size=S*zoom,visible=V/size,season=[3,3,0,0,0,1,1,1,2,2,2,3][state.month%12];
 const sx=Math.max(0,Math.floor(viewX)-2),sy=Math.max(0,Math.floor(viewY)-3),ex=Math.min(N,Math.ceil(viewX+visible)+2),ey=Math.min(N,Math.ceil(viewY+visible)+3);
 const key=[viewX,viewY,zoom,season].join(':');
 if(!groundCache){groundCache=document.createElement('canvas');groundCache.width=V;groundCache.height=V}
 const rebuild=groundKey!==key||dirty||sceneKey!==key;
 if(rebuild){
 ctx.clearRect(0,0,V,V);
 for(let y=sy;y<ey;y++)for(let x=sx;x<ex;x++){
 const i=y*N+x,type=state.tiles[i],px=(x-viewX)*size,py=(y-viewY)*size;
 ctx.fillStyle=colorFor(['hedge','flowers','deadwood'].includes(type)?'meadow':type,season);ctx.fillRect(px,py,size+.7,size+.7);
 terrainDetail(type,px,py,size,i,season);
 // Quiet irregular ground shading; no visible tile outlines.
 ctx.fillStyle='rgba(26,50,28,'+(hash(i)*.045)+')';ctx.fillRect(px,py,size+.3,size+.3);
 if(type==='water'){
 for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=N||ny>=N||state.tiles[ny*N+nx]==='water')continue;
 ctx.fillStyle='rgba(208,211,155,.48)';ctx.fillRect(px+(dx===1?size*.87:0),py+(dy===1?size*.87:0),dx?size*.13:size,dy?size*.13:size)}
 }
 }
 const gc=groundCache.getContext('2d');gc.clearRect(0,0,V,V);gc.drawImage(canvas,0,0);groundKey=key;
 }
 ctx.clearRect(0,0,V,V);ctx.drawImage(groundCache,0,0);
 const objects=[];
 if(rebuild&&size>11)for(let y=sy;y<ey;y++)for(let x=sx;x<ex;x++){
 const i=y*N+x,type=state.tiles[i],h=hash(i);let cell=null,m=1;
 if(type==='deciduous'){cell=season===3?[3,0]:season===2?[2,0]:h>.72?[1,2]:[0,0];m=1.5}
 if(type==='conifer'){cell=season===3?[2,2]:[1,0];m=1.55}
 if(type==='hedge'){cell=[0,1];m=1.1}
 if(type==='deadwood'){cell=[1,1];m=1.15}
 if(type==='flowers'&&season!==3){cell=[2,1];m=.8}
 if(type==='wetland'){cell=[3,1];m=.85}
 if(type==='mountain'){cell=[0,2];m=1.25}
 if(type==='field'&&season!==3&&h>.45){cell=[3,2];m=.7}
 if(type==='meadow'&&h>.975&&season!==3){cell=[2,1];m=.4}
 if(cell)objects.push({x:(x-viewX+.5+(h-.5)*.24)*size,y:(y-viewY+.88)*size,cell,m,h,tree:trees.byId[state.trees[i]]});
 }
 if(rebuild){
 objects.sort((a,b)=>a.y-b.y);for(const o of objects){const t=o.tree;if(!t||!treeSprite(t,season,o.x,o.y,size*o.m,size*o.m,o.h>.5))sprite('woodland',...o.cell,o.x,o.y,size*o.m,size*o.m,o.h>.5);}
 if(!sceneCache){sceneCache=document.createElement('canvas');sceneCache.width=V;sceneCache.height=V}
 const sc=sceneCache.getContext('2d');sc.clearRect(0,0,V,V);sc.drawImage(canvas,0,0);sceneKey=key;
 }else{ctx.clearRect(0,0,V,V);ctx.drawImage(sceneCache,0,0)}
 drawnActors=[];
 for(const a of actors){
 const phase=animationTime*.00018+a.phase;let wx=a.x+Math.sin(phase)*.25,wy=a.y+Math.cos(phase*.7)*.2;
 if(!a.allowed.has(Math.floor(wy)*N+Math.floor(wx))){wx=a.x;wy=a.y;}
 if(wx<viewX-2||wx>viewX+visible+2||wy<viewY-2||wy>viewY+visible+2)continue;

 drawnActors.push({kind:a.kind,wx,wy,x:(wx-viewX)*size,y:(wy-viewY)*size,flip:Math.cos(phase)<0,actor:a});
 }
 drawnActors.sort((a,b)=>a.y-b.y);
 for(const o of drawnActors){const extra=EXTRA_BY_ID[o.kind],c=extra?[extra[4],extra[5]]:{deer:[0,0],hare:[1,0],fox:[0,1],boar:[1,1]}[o.kind];const m=['hare','eichhornchen','stockente'].includes(o.kind)?.85:1.25;
 o.w=size*m;o.h=size*m;
 if(!sprite(extra?'wildlife-more':'wildlife',...c,o.x,o.y,o.w,o.h,o.flip))animalSprite(o.x,o.y,size*.35,o.kind);
 if(hunting&&state.event?.kind===o.kind){ctx.strokeStyle='#f4d77d';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(o.x,o.y-size*.35,size*.55,size*.55,0,0,Math.PI*2);ctx.stroke();}
 }
}

function populateActors(){
 const kept=[];
 for(const spec of eco.species){const locations=eco.locations(state,spec.kind),allowed=new Set(locations);if(!locations.length)continue;
 const existing=state.animals.filter(a=>a.kind===spec.kind).slice(0,state.populations[spec.kind]);
 while(existing.length<state.populations[spec.kind]){const id=state.nextAnimalId++;existing.push({id,kind:spec.kind,x:-1,y:-1,phase:hash(id+81)*6.28});}
 for(const a of existing){if(!allowed.has(Math.floor(a.y)*N+Math.floor(a.x))){let i=locations[Math.floor(hash(a.id*317)*locations.length)];for(let attempt=0;attempt<8;attempt++){const candidate=locations[Math.floor(hash(a.id*317+attempt*43)*locations.length)];if(!kept.some(b=>Math.hypot(b.x-(candidate%N+.5),b.y-(Math.floor(candidate/N)+.5))<1.2)){i=candidate;break;}}a.x=i%N+.5;a.y=Math.floor(i/N)+.5;}kept.push(a);}
 }
 state.animals=kept;const sets=Object.fromEntries(eco.species.map(a=>[a.kind,new Set(eco.locations(state,a.kind))]));actors=kept.map(a=>({...a,allowed:sets[a.kind]}));
}

let mapVisible=true;new IntersectionObserver(entries=>{mapVisible=entries[0].isIntersecting}).observe(canvas);
function animate(t){animationTime=t;if(!painting&&!panStart&&mapVisible&&document.visibilityState==='visible'&&!$('hunt-result').open&&!$('month-dialog').open&&(actors.length||hunting))draw();setTimeout(()=>requestAnimationFrame(animate),100)}requestAnimationFrame(animate);
function clampView(){let visible=V/(S*zoom);viewX=Math.max(0,Math.min(N-visible,viewX));viewY=Math.max(0,Math.min(N-visible,viewY))}
function changeZoom(factor){const old=V/(S*zoom);zoom=Math.max(.2,Math.min(4,zoom*factor));const now=V/(S*zoom);viewX+=(old-now)/2;viewY+=(old-now)/2;clampView();draw();updateView()}
function updateView(){$('zoomlevel').textContent=Math.round(zoom*100)+' %';$('coords').textContent=`Ausschnitt: ${Math.floor(viewX)+1}, ${Math.floor(viewY)+1} · ${(Math.pow(V/(S*zoom),2)*eco.TILE_HA).toFixed(1)} ha`}
function evaluate(){let c=Object.fromEntries(TYPES.map(t=>[t[0],0]));for(const t of state.tiles)c[t]++;let edges=0,habitatEdges=0,waterAdj=0;for(let y=0;y<N;y++)for(let x=0;x<N;x++){let i=y*N+x,a=state.tiles[i];for(const j of [x<N-1?i+1:-1,y<N-1?i+N:-1])if(j>=0){let b=state.tiles[j];if(a!==b)edges++;if((a==='meadow'||a==='field')&&(b==='deciduous'||b==='conifer'||b==='hedge')||(b==='meadow'||b==='field')&&(a==='deciduous'||a==='conifer'||a==='hedge'))habitatEdges++;if(a==='water'&&b!=='water'||b==='water'&&a!=='water')waterAdj++}}
const actual={...c},areaFactor=90000/AREA;for(const k of Object.keys(c))c[k]*=areaFactor;habitatEdges/=SCALE;waterAdj/=SCALE;
let forest=c.deciduous+c.conifer,open=c.meadow+c.field;let deerScore=Math.max(0,Math.min(100,Math.round(20+Math.min(35,habitatEdges*.045)+Math.min(20,forest*.00065)+Math.min(15,(c.hedge+c.wetland)*.0018)+Math.min(10,waterAdj*.016)-Math.max(0,forest-65000)*.0008)));
let hareScore=Math.max(0,Math.min(100,Math.round(10+Math.min(38,open*.00085)+Math.min(35,(c.hedge+c.wetland)*.008)+Math.min(17,habitatEdges*.018)-Math.max(0,c.conifer-28000)*.0006)));
return {c,forest,open,edges,habitatEdges,waterAdj,deerScore,hareScore,actual}}
function advance(months){const hadEvent=!!state.event,visited=[];let grown=0;for(let m=0;m<months;m++){if(state.month>=100000)break;eco.advance(state);if(state.month%12===0){grown+=trees.grow(state,N);eco.invalidate(state);}visited.push(state.month);if(!hadEvent&&state.event)break;}persist();render();if(state.event){notify('Bestandswarnung: '+eco.byKind[state.event.kind].name+'. Der Zeitsprung wurde bei der Meldung angehalten.');}else{notify(visited.length+' Spielmonat(e) vergangen.'+(grown?' '+grown+' Bäume sind natürlich nachgewachsen.':''));if(learning&&state.month>0&&state.month%4===0)showQuiz();}if(visited.length)window.RevierCalendar.open(visited,grown);}
function persist(){eco.reconcile(state);populateActors();try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch{return false}}

function notify(t){$('notice').textContent=t}
const QUESTIONS=[['Wann ist die Blattzeit des Rehwilds?',['Juli/August','Januar/Februar','November/Dezember'],0,'reh'],['Wann liegt die Hauptranzzeit des Rotfuchses?',['Mai/Juni','Januar/Februar','September/Oktober'],1,'fuchs'],['Wie heißen die Früchte der Rotbuche?',['Eicheln','Bucheckern','Zapfen'],1,'buche'],['Welche Aussage trifft auf den Feldhasen zu?',['Junge kommen sehend zur Welt','Junge schlüpfen aus Eiern','Er lebt nur in geschlossenen Wäldern'],0,'hase'],['Welche Zapfenform ist typisch für die Fichte?',['Aufrecht stehend','Hängend','Keine Zapfen'],1,'fichte'],['Welcher Nadelbaum wirft im Herbst seine Nadeln ab?',['Europäische Lärche','Weißtanne','Waldkiefer'],0,'lärche'],['Welche Art lebt oft in unterirdischen Koloniebauen?',['Feldhase','Wildkaninchen','Rehwild'],1,'kaninchen'],['Welche Aussage trifft auf die Weißtanne zu?',['Zapfen stehen aufrecht','Zapfen hängen herab','Sie trägt keine Zapfen'],0,'tanne'],['Wie heißen die Jungen beim Schwarzwild?',['Kitze','Frischlinge','Welpen'],1,'schwarzwild'],['Welche Wildart zeigt einen auffälligen Schnepfenstrich?',['Waldschnepfe','Stockente','Ringeltaube'],0,'waldschnepfe'],['Wann brunftet Rotwild überwiegend?',['September/Oktober','April/Mai','Januar/Februar'],0,'rotwild']];
function showSpecies(id){window.RevierLearning.show(id)}
function showQuiz(){
 if(!learning)return;
 const available=QUESTIONS.filter(q=>window.RevierLearning.quizAllowed(q[3]));
 if(!available.length){$('quiz').replaceChildren();return}
 const q=available[Math.max(0,Math.floor(state.month/4-1))%available.length];
 $('quiz').innerHTML='<div class="quiz-card"><strong>🧠 Revierfrage (freiwillig)</strong><p>'+q[0]+'</p>'+q[1].map((a,i)=>'<button type="button" data-answer="'+i+'">'+a+'</button>').join('')+'<div id="quiz-feedback" role="status"></div><button type="button" id="quiz-close">Später</button></div>';
 document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{const ok=Number(b.dataset.answer)===q[2];$('quiz-feedback').textContent=ok?'✓ Richtig!':'Noch nicht. Richtig: '+q[1][q[2]];showSpecies(q[3]);document.querySelectorAll('[data-answer]').forEach(x=>x.disabled=true)});
 $('quiz-close').onclick=()=>{$('quiz').innerHTML=''};
}
function render(){const caps=eco.reconcile(state),habitat=eco.habitat(state);groundKey='';populateActors();draw();const e=evaluate();let month=state.month%12,year=1+Math.floor(state.month/12),months=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];$('date').textContent=months[month]+' · Jahr '+year;$('season-month').textContent=$('date').textContent;$('season').textContent=['Winter','Winter','Frühling','Frühling','Frühling','Sommer','Sommer','Sommer','Herbst','Herbst','Herbst','Winter'][month];
let metrics=[['Wald',e.forest],['Offenland',e.open],['Wasser',e.c.water],['Hecken',e.c.hedge],['Feuchtgebiet',e.c.wetland],['Waldwege',e.c.path],['Totholz',e.c.deadwood],['Blumenwiesen',e.c.flowers]];$('metrics').innerHTML=metrics.map(([n,v])=>`<div class="metric"><div><span>${n}</span><b>${(v/900).toFixed(1)} %</b></div><div class="track"><div class="fill" style="width:${v/900}%"></div></div></div>`).join('');$('animals').replaceChildren();
for(const a of eco.species){const button=document.createElement('button');button.type='button';button.dataset.observe=a.kind;button.textContent=a.name+' · '+state.populations[a.kind];button.title=a.name+': '+state.populations[a.kind]+' im Revier · Lebensraumziel im Spiel: '+caps[a.kind];button.onclick=()=>{focusAnimal(a.kind);if(learning)showSpecies(a.id)};$('animals').append(button)}
$('wildlife-summary').textContent=Object.values(state.populations).reduce((a,b)=>a+b,0)+' Tiere auf '+(AREA*eco.TILE_HA).toFixed(1)+' ha Gesamtfläche. Die Zahlen gelten für die ganze Karte.';$('habitat-summary').textContent=habitat.forestHa.toFixed(1)+' ha Wald · größte zusammenhängende Waldfläche '+habitat.largestForest.toFixed(1)+' ha · '+habitat.waterHa.toFixed(1)+' ha Gewässer/Feuchtgebiete.';$('habitat-targets').replaceChildren();for(const a of eco.species){const li=document.createElement('li');li.textContent=a.name+': '+caps[a.kind];$('habitat-targets').append(li);}updateHunt();$('harvest-total').textContent=Object.values(state.harvest).reduce((a,b)=>a+b,0);$('harvest-list').replaceChildren();for(const a of eco.species.filter(a=>a.hunt)){const li=document.createElement('li');li.textContent=a.name+' · '+state.harvest[a.kind];$('harvest-list').append(li);}let tips=[];if(e.habitatEdges<650)tips.push('Schaffe mehr Übergänge zwischen Wald und Offenland.');if(e.c.hedge<200)tips.push('Hecken und Säume können die Strukturvielfalt verbessern.');if(e.c.water===0)tips.push('Wasserflächen und Feuchtgebiete fehlen.');if(e.forest<15000)tips.push('Einige zusammenhängende Waldflächen können Deckung bieten.');if(e.open<18000)tips.push('Offene Flächen sind für viele Arten wichtig.');if(!tips.length)tips.push('Dein Revier hat bereits verschiedene Lebensraumstrukturen. Beobachte die Entwicklung.');$('advice').innerHTML=tips.map(t=>`<div class="advice">${t}</div>`).join('')}
function focusAnimal(kind){const a=actors.find(a=>a.kind===kind);if(a){viewX=a.x-V/(S*zoom)/2;viewY=a.y-V/(S*zoom)/2;clampView();draw();updateView();canvas.scrollIntoView({block:'center',behavior:'smooth'})}notify(a?'Beobachtung: '+eco.byKind[kind].name:'Noch keine '+eco.byKind[kind].name+' im Revier. Ausreichend passenden Lebensraum schaffen und mehrere Monate abwarten.');}
function setHunting(on){hunting=on;canvas.classList.toggle('hunting',on);$('hunt-toggle').classList.toggle('active',on);$('hunt-toggle').setAttribute('aria-pressed',String(on));$('hunt-toggle').textContent=on?'⊕ Gewehr ablegen':'⊕ Gewehr auswählen';if(on){inspect=false;pan=false;$('inspect').classList.remove('active');$('inspect').textContent='🔎 Natur erkunden';$('pan').classList.remove('active');$('pan').textContent='✋ Karte verschieben';}draw();}
function updateHunt(){const e=state.event;$('hunt-alert').hidden=!e;$('hunt-toggle').disabled=!e;$('hunt-focus').hidden=!e;if(!e&&hunting)setHunting(false);$('hunt-message').textContent=e?'Bestandswarnung: '+eco.byKind[e.kind].name+' – '+e.remaining+' Tier(e) über dem Spielziel. Wähle das Gewehr und tippe auf ein markiertes Tier.':'';}
function shoot(ev){
 if(!state.event)return;const r=canvas.getBoundingClientRect(),x=(ev.clientX-r.left)*V/r.width,y=(ev.clientY-r.top)*V/r.height;
 const hit=[...drawnActors].reverse().find(a=>Math.abs(a.x-x)<a.w*.5&&y>a.y-a.h&&y<a.y+4);
 if(!hit){notify('Kein Tier getroffen.');return}if(hit.kind!==state.event.kind){notify('Diese Art gehört nicht zur aktuellen Bestandswarnung.');return}
 eco.reconcile(state);if(!eco.take(state,hit.kind))return;state.animals=state.animals.filter(a=>a.id!==hit.actor.id);state.harvest[hit.kind]++;
 const name=eco.byKind[hit.kind].name;persist();render();$('hunt-result-title').textContent=name+' – Lernkarte';$('hunt-result-message').textContent='Ein Tier entnommen. '+(state.event?'Noch '+state.event.remaining+' Tier(e) im Auftrag.':'Bestandsauftrag abgeschlossen.');window.RevierLearning.renderInto($('hunt-card'),eco.byKind[hit.kind].id);$('hunt-result').showModal();
}
$('hunt-toggle').onclick=()=>{if(state.event)setHunting(!hunting)};$('hunt-focus').onclick=()=>{if(state.event)focusAnimal(state.event.kind)};$('hunt-result-close').onclick=()=>$('hunt-result').close();
function paint(ev){if(inspect){if(!learning){notify('Im Kindermodus sind Lernkarten deaktiviert.');return;}const r=canvas.getBoundingClientRect(),x=Math.floor(viewX+(ev.clientX-r.left)/r.width*V/(S*zoom)),y=Math.floor(viewY+(ev.clientY-r.top)/r.height*V/(S*zoom));if(x>=0&&x<N&&y>=0&&y<N){const animal=drawnActors.find(a=>Math.hypot(a.wx-x-.5,a.wy-y-.5)<1.2);if(animal){showSpecies(({deer:'reh',hare:'hase',fox:'fuchs',boar:'schwarzwild'})[animal.kind]||animal.kind);return}const kind=state.tiles[y*N+x];showSpecies(state.trees[y*N+x]|| (kind==='deciduous'?'eiche':kind==='conifer'?'fichte':kind==='hedge'?'hasel':kind==='meadow'?'reh':kind==='field'?'hase':kind==='water'?'stockente':kind==='wetland'?'schilf':'fuchs'))}return;}const rect=canvas.getBoundingClientRect(),x=Math.floor(viewX+(ev.clientX-rect.left)/rect.width*V/(S*zoom)),y=Math.floor(viewY+(ev.clientY-rect.top)/rect.height*V/(S*zoom));if(x<0||x>=N||y<0||y>=N)return;let i=y*N+x;const species=selectedTrees[tool]||null;if(state.tiles[i]!==tool||state.trees[i]!==species){state.tiles[i]=tool;state.trees[i]=species;eco.invalidate(state);dirty=true;draw()}}
// One release = one action. Movement always pans; holding never paints.
const pressedPointers=new Set(),DRAG_PX=7,HOLD_MS=450;
function cancelGesture(){panStart=null;painting=false;pressedPointers.clear();canvas.classList.remove('dragging');}
canvas.addEventListener('pointerdown',ev=>{
 if(ev.pointerType==='mouse'&&ev.button!==0)return;
 pressedPointers.add(ev.pointerId);if(pressedPointers.size>1){if(panStart)panStart.cancelled=true;canvas.setPointerCapture(ev.pointerId);ev.preventDefault();return;}
 panStart={id:ev.pointerId,x:ev.clientX,y:ev.clientY,vx:viewX,vy:viewY,time:performance.now(),dragged:false,cancelled:false,panOnly:pan||ev.shiftKey};
 canvas.setPointerCapture(ev.pointerId);ev.preventDefault();
});
canvas.addEventListener('pointermove',ev=>{
 const g=panStart;if(!g||ev.pointerId!==g.id||g.cancelled)return;
 const dx=ev.clientX-g.x,dy=ev.clientY-g.y;
 if(Math.hypot(dx,dy)>DRAG_PX)g.dragged=true;
 if(!g.dragged)return;
 const r=canvas.getBoundingClientRect(),size=S*zoom*r.width/V;
 viewX=g.vx-dx/size;viewY=g.vy-dy/size;clampView();canvas.classList.add('dragging');queueDraw();updateView();ev.preventDefault();
});
canvas.addEventListener('pointerup',ev=>{
 pressedPointers.delete(ev.pointerId);const g=panStart;if(!g||ev.pointerId!==g.id)return;
 panStart=null;canvas.classList.remove('dragging');
 const r=canvas.getBoundingClientRect(),inside=ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom;
 const tap=inside&&!g.cancelled&&!g.dragged&&!g.panOnly&&Math.hypot(ev.clientX-g.x,ev.clientY-g.y)<=DRAG_PX&&performance.now()-g.time<HOLD_MS;
 if(tap){if(hunting)shoot(ev);else paint(ev);}
 if(dirty){persist();render();dirty=false;}painting=false;
});
for(const evt of ['pointercancel','lostpointercapture'])canvas.addEventListener(evt,ev=>{pressedPointers.delete(ev.pointerId);if(panStart?.id===ev.pointerId){panStart=null;canvas.classList.remove('dragging');}});
window.addEventListener('blur',cancelGesture);document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelGesture();});
canvas.addEventListener('contextmenu',ev=>ev.preventDefault());

$('learning').checked=learning;$('learning').onchange=()=>{learning=$('learning').checked;try{localStorage.setItem('revier-learning-v04',learning?'on':'off')}catch{notify('Lernmodus gilt nur für diese Sitzung; Browserspeicher ist blockiert.');}$('learningpanel').hidden=!learning;if(!learning){$('quiz').innerHTML='';$('species').innerHTML=''}else showSpecies('reh');window.RevierLearning.sync();notify(learning?'Lernmodus aktiviert.':'Kindermodus: Fragen ausgeschaltet.');};$('learningpanel').hidden=!learning;$('inspect').onclick=()=>{setHunting(false);inspect=!inspect;$('inspect').classList.toggle('active',inspect);$('inspect').textContent=inspect?'🔎 Erkunden: AN':'🔎 Natur erkunden';notify(inspect?'Tippe auf ein Feld, um Artenwissen zu sehen.':'Bearbeitungsmodus aktiv.');};$('zoomIn').onclick=()=>changeZoom(1.5);$('zoomOut').onclick=()=>changeZoom(1/1.5);$('pan').onclick=()=>{setHunting(false);pan=!pan;$('pan').textContent=pan?'✋ Verschieben: AN':'✋ Karte verschieben';$('pan').classList.toggle('active',pan)};canvas.addEventListener('wheel',e=>{e.preventDefault();cancelGesture();changeZoom(e.deltaY<0?1.2:1/1.2)},{passive:false});
$('tools').innerHTML=TYPES.map(t=>`<button type="button" data-tool="${t[0]}"><span class="tool-art art-${t[0]}" aria-hidden="true">${['water','path','meadow'].includes(t[0])?t[1]:''}</span>${t[2]}</button>`).join('');function setTool(t){setHunting(false);pan=false;$('pan').classList.remove('active');$('pan').textContent='✋ Karte verschieben';inspect=false;$('inspect').classList.remove('active');$('inspect').textContent='🔎 Natur erkunden';tool=t;$('tree-picker').hidden=!selectedTrees[t];if(selectedTrees[t]){$('tree-select').replaceChildren();for(const a of trees.species.filter(a=>a.type===t)){const o=document.createElement('option');o.value=a.id;o.textContent=a.name;$('tree-select').append(o);}$('tree-select').value=selectedTrees[t];}document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('active',b.dataset.tool===tool))}document.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>setTool(b.dataset.tool)));setTool(tool);$('tree-select').onchange=()=>{selectedTrees[tool]=$('tree-select').value;notify('Pflanzen: '+trees.byId[selectedTrees[tool]].name);};$('month-open').onclick=()=>window.RevierCalendar.open([state.month],0);
$('next').onclick=()=>advance(1);$('year').onclick=()=>advance(12);$('save').onclick=()=>notify(persist()?'Spielstand auf diesem Gerät gespeichert.':'Speichern nicht möglich: Browserspeicher blockiert. Bitte exportieren.');$('load').onclick=()=>{try{let s=migrate(JSON.parse(localStorage.getItem(KEY)));if(!valid(s))throw Error();state=s;setHunting(false);render();notify('Spielstand geladen.'+(migrationRemoved?' '+migrationRemoved+' Tiere sind bei der Umstellung auf passende Bestände abgewandert.':''));migrationRemoved=0}catch{notify('Kein gültiger Spielstand vorhanden.')}};$('reset').onclick=()=>{if(confirm('Die aktuelle Landschaft zurücksetzen?')){state=fresh();setHunting(false);persist();render();notify('Neue Landschaft erstellt.')}};$('export').onclick=()=>{let blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='revier-spielstand.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};$('import').onchange=async ev=>{let file=ev.target.files[0];if(!file)return;if(file.size>8000000){notify('Datei ist zu groß.');return}try{let s=migrate(JSON.parse(await file.text()));if(!valid(s))throw Error();state=s;setHunting(false);eco.reconcile(state);persist();render();notify('Spielstand importiert.'+(migrationRemoved?' '+migrationRemoved+' Tiere sind bei der Umstellung auf passende Bestände abgewandert.':''));migrationRemoved=0}catch{notify('Ungültiger Spielstand.')}ev.target.value=''};window.RevierLearning.init({isLearning:()=>learning,notify});render();updateView();if(learning)showSpecies('reh');if(migrationRemoved){const n=migrationRemoved;migrationRemoved=0;const saved=persist();notify('Update 0.13: '+n+' Tiere sind bei der Umstellung auf passende Bestände abgewandert.'+(saved?'':' Bitte Spielstand exportieren; Browserspeicher ist voll.'));}})();
