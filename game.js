(()=>{'use strict';
const N=300,S=30,KEY='revier-wildnis-v02';
const TYPES=[['meadow','🌾','Wiese','#a9c878'],['deciduous','🌳','Laubwald','#4b9158'],['conifer','🌲','Nadelwald','#326e4b'],['water','💧','Wasser','#4c9dca'],['field','🌱','Acker','#d2b46b'],['mountain','⛰️','Berg','#92938b'],['hedge','🌿','Hecke','#69965a'],['wetland','🪷','Feuchtgebiet','#76a895'],['path','🟫','Waldweg','#b59b72'],['deadwood','🪵','Totholz','#907a58'],['flowers','🌼','Blumenwiese','#b1cb76']];
const byId=Object.fromEntries(TYPES.map(t=>[t[0],t]));const $=id=>document.getElementById(id);let tool='deciduous',state,painting=false;let zoom=1.15,viewX=89,viewY=108,pan=false,panStart=null,dirty=false,inspect=false;let learning=true;try{learning=localStorage.getItem('revier-learning-v04')!=='off'}catch{}
function seededMap(){let a=Array(N*N).fill('meadow');for(let y=0;y<N;y++)for(let x=0;x<N;x++){let k=y*N+x;const r=Math.sin(x*12.9898+y*78.233)*43758.5453;const z=r-Math.floor(r);let lake=((x-125)/19)**2+((y-125)/30)**2<1;let woodland=(x<95&&y<195)||(x>205&&y>105);if(lake)a[k]='water';else if(woodland)a[k]=z<.65?'deciduous':'conifer';else if(x>160&&x<250&&y<100)a[k]='field';else if(z<.035)a[k]='hedge';}return a}
function fresh(){return {version:1,month:0,tiles:seededMap(),deer:12,hares:16}}
function valid(s){return s&&s.version===1&&Number.isInteger(s.month)&&s.month>=0&&s.month<=100000&&Array.isArray(s.tiles)&&s.tiles.length===N*N&&s.tiles.every(t=>!!byId[t])&&Number.isFinite(s.deer)&&s.deer>=0&&s.deer<=100000&&Number.isFinite(s.hares)&&s.hares>=0&&s.hares<=100000}
try{let v=JSON.parse(localStorage.getItem(KEY));state=valid(v)?v:fresh()}catch{state=fresh()}
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
const art={}; let groundCache=null,groundKey='',actors=[];
for(const name of ['woodland','wildlife']){const im=new Image();art[name]=im;im.onload=()=>{groundKey='';draw()};im.src='assets/art/'+name+'.png'}
function sprite(atlas,col,row,x,y,w,h,flip=false){
 const im=art[atlas];if(!im||!im.complete||!im.naturalWidth)return false;
 let xs=atlas==='woodland'?[0,392,735,1102,1448]:[0,768,1536];
 let ys=atlas==='woodland'?[0,418,710,1086]:[0,512,1024];
 const sw=xs[col+1]-xs[col],sh=ys[row+1]-ys[row],scale=Math.min(w/sw,h/sh);
 const dw=sw*scale,dh=sh*scale;
 ctx.save();ctx.translate(x,y);if(flip)ctx.scale(-1,1);
 ctx.drawImage(im,xs[col],ys[row],sw,sh,-dw/2,-dh,dw,dh);ctx.restore();return true;
}
function draw(){
 const size=S*zoom,visible=V/size,season=[3,3,0,0,0,1,1,1,2,2,2,3][state.month%12];
 const sx=Math.max(0,Math.floor(viewX)-2),sy=Math.max(0,Math.floor(viewY)-3),ex=Math.min(N,Math.ceil(viewX+visible)+2),ey=Math.min(N,Math.ceil(viewY+visible)+3);
 const key=[viewX,viewY,zoom,season].join(':');
 if(!groundCache){groundCache=document.createElement('canvas');groundCache.width=V;groundCache.height=V}
 if(groundKey!==key||dirty){
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
 if(size>11)for(let y=sy;y<ey;y++)for(let x=sx;x<ex;x++){
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
 if(cell)objects.push({x:(x-viewX+.5+(h-.5)*.24)*size,y:(y-viewY+.88)*size,cell,m,h});
 }
 for(const a of actors){
 const phase=animationTime*.00018+a.phase,wx=a.x+Math.sin(phase)*.65,wy=a.y+Math.cos(phase*.7)*.45;
 if(wx<viewX-2||wx>viewX+visible+2||wy<viewY-2||wy>viewY+visible+2)continue;
 if(!a.habitat.includes(state.tiles[Math.floor(wy)*N+Math.floor(wx)]))continue;
 objects.push({x:(wx-viewX)*size,y:(wy-viewY)*size,animal:a.kind,flip:Math.cos(phase)<0});
 }
 objects.sort((a,b)=>a.y-b.y);
 for(const o of objects){if(o.animal){const c={deer:[0,0],hare:[1,0],fox:[0,1],boar:[1,1]}[o.animal];const m=o.animal==='hare'?.85:1.25;
 if(!sprite('wildlife',...c,o.x,o.y,size*m,size*m,o.flip))animalSprite(o.x,o.y,size*.35,o.animal);
 }else{sprite('woodland',...o.cell,o.x,o.y,size*o.m,size*o.m,o.h>.5)}}
}
function populateActors(){
 actors=[];
 for(const [kind,count,habitat] of [['deer',state.deer,['meadow','deciduous']],['hare',state.hares,['meadow','field']],['fox',4,['hedge','meadow']],['boar',5,['deciduous','conifer']]]){
 for(let j=0;j<Math.min(60,Math.ceil(count));j++){
 // First observations near the starting woodland edge, others across the world.
 for(let attempt=0;attempt<300;attempt++){
 const seed=j*317+attempt*73+kind.charCodeAt(0)*101;
 const x=j<3?90+hash(seed)*14:2+hash(seed)*296,y=j<3?110+hash(seed+41)*18:2+hash(seed+41)*296;
 if(habitat.includes(state.tiles[Math.floor(y)*N+Math.floor(x)])){actors.push({kind,habitat,x,y,phase:hash(seed+81)*6.28});break}
 }
 }
 }
}
function animate(t){animationTime=t;if(!painting&&!panStart&&document.visibilityState==='visible')draw();setTimeout(()=>requestAnimationFrame(animate),50)}requestAnimationFrame(animate);
function clampView(){let visible=V/(S*zoom);viewX=Math.max(0,Math.min(N-visible,viewX));viewY=Math.max(0,Math.min(N-visible,viewY))}
function changeZoom(factor){const old=V/(S*zoom);zoom=Math.max(.2,Math.min(4,zoom*factor));const now=V/(S*zoom);viewX+=(old-now)/2;viewY+=(old-now)/2;clampView();draw();updateView()}
function updateView(){$('zoomlevel').textContent=Math.round(zoom*100)+' %';$('coords').textContent=`Ausschnitt: ${Math.floor(viewX)+1}, ${Math.floor(viewY)+1}`}
function evaluate(){let c=Object.fromEntries(TYPES.map(t=>[t[0],0]));for(const t of state.tiles)c[t]++;let edges=0,habitatEdges=0,waterAdj=0;for(let y=0;y<N;y++)for(let x=0;x<N;x++){let i=y*N+x,a=state.tiles[i];for(const j of [x<N-1?i+1:-1,y<N-1?i+N:-1])if(j>=0){let b=state.tiles[j];if(a!==b)edges++;if((a==='meadow'||a==='field')&&(b==='deciduous'||b==='conifer'||b==='hedge')||(b==='meadow'||b==='field')&&(a==='deciduous'||a==='conifer'||a==='hedge'))habitatEdges++;if(a==='water'&&b!=='water'||b==='water'&&a!=='water')waterAdj++}}
let forest=c.deciduous+c.conifer,open=c.meadow+c.field;let deerScore=Math.max(0,Math.min(100,Math.round(20+Math.min(35,habitatEdges*.045)+Math.min(20,forest*.00065)+Math.min(15,(c.hedge+c.wetland)*.0018)+Math.min(10,waterAdj*.016)-Math.max(0,forest-65000)*.0008)));
let hareScore=Math.max(0,Math.min(100,Math.round(10+Math.min(38,open*.00085)+Math.min(35,(c.hedge+c.wetland)*.008)+Math.min(17,habitatEdges*.018)-Math.max(0,c.conifer-28000)*.0006)));
return {c,forest,open,edges,habitatEdges,waterAdj,deerScore,hareScore}}
function advance(months){for(let m=0;m<months;m++){state.month++;const e=evaluate();let seasonal=1+0.12*Math.sin(state.month*Math.PI/6);let targetDeer=e.deerScore/100*26, targetHare=e.hareScore/100*38;state.deer=Math.max(0,Math.min(70,state.deer+(targetDeer-state.deer)*.22*seasonal));state.hares=Math.max(0,Math.min(100,state.hares+(targetHare-state.hares)*.25*seasonal));}persist();render();if(learning&&state.month>0&&state.month%4===0)showQuiz()}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch{return false}}
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
function render(){groundKey='';populateActors();draw();const e=evaluate();let month=state.month%12,year=1+Math.floor(state.month/12),months=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];$('date').textContent=months[month]+' · Jahr '+year;$('season').textContent=['Winter','Winter','Frühling','Frühling','Frühling','Sommer','Sommer','Sommer','Herbst','Herbst','Herbst','Winter'][month];$('deer').textContent=Math.round(state.deer);$('hares').textContent=Math.round(state.hares);
let metrics=[['Wald',e.forest],['Offenland',e.open],['Wasser',e.c.water],['Hecken',e.c.hedge],['Feuchtgebiet',e.c.wetland],['Waldwege',e.c.path],['Totholz',e.c.deadwood],['Blumenwiesen',e.c.flowers]];$('metrics').innerHTML=metrics.map(([n,v])=>`<div class="metric"><div><span>${n}</span><b>${(v/900).toFixed(1)} %</b></div><div class="track"><div class="fill" style="width:${v/900}%"></div></div></div>`).join('');$('animals').innerHTML=`<div class="animal"><strong>🦌 Rehwild · ${Math.round(state.deer)} Tiere</strong><small>Lebensraumeignung: ${e.deerScore}/100</small></div><div class="animal"><strong>🐇 Feldhase · ${Math.round(state.hares)} Tiere</strong><small>Lebensraumeignung: ${e.hareScore}/100</small></div>`;let tips=[];if(e.habitatEdges<650)tips.push('Schaffe mehr Übergänge zwischen Wald und Offenland.');if(e.c.hedge<200)tips.push('Hecken und Säume können die Strukturvielfalt verbessern.');if(e.c.water===0)tips.push('Wasserflächen und Feuchtgebiete fehlen.');if(e.forest<15000)tips.push('Einige zusammenhängende Waldflächen können Deckung bieten.');if(e.open<18000)tips.push('Offene Flächen sind für viele Arten wichtig.');if(!tips.length)tips.push('Dein Revier hat bereits verschiedene Lebensraumstrukturen. Beobachte die Entwicklung.');$('advice').innerHTML=tips.map(t=>`<div class="advice">${t}</div>`).join('')}
function paint(ev){if(inspect){if(!learning){notify('Im Kindermodus sind Lernkarten deaktiviert.');return;}const r=canvas.getBoundingClientRect(),x=Math.floor(viewX+(ev.clientX-r.left)/r.width*V/(S*zoom)),y=Math.floor(viewY+(ev.clientY-r.top)/r.height*V/(S*zoom));if(x>=0&&x<N&&y>=0&&y<N){const kind=state.tiles[y*N+x];showSpecies(kind==='deciduous'?'buche':kind==='conifer'?'fichte':kind==='hedge'?'hasel':kind==='meadow'?'reh':kind==='field'?'hase':kind==='water'?'stockente':kind==='wetland'?'schilf':'fuchs')}return;}const rect=canvas.getBoundingClientRect(),x=Math.floor(viewX+(ev.clientX-rect.left)/rect.width*V/(S*zoom)),y=Math.floor(viewY+(ev.clientY-rect.top)/rect.height*V/(S*zoom));if(x<0||x>=N||y<0||y>=N)return;let i=y*N+x;if(state.tiles[i]!==tool){state.tiles[i]=tool;dirty=true;draw()}}
canvas.addEventListener('pointerdown',ev=>{painting=!ev.shiftKey&&!pan;panStart={x:ev.clientX,y:ev.clientY,vx:viewX,vy:viewY};canvas.setPointerCapture(ev.pointerId);if(painting)paint(ev)});canvas.addEventListener('pointermove',ev=>{if(!panStart)return;if(painting)paint(ev);else{let r=canvas.getBoundingClientRect(),size=S*zoom*r.width/V;viewX=panStart.vx-(ev.clientX-panStart.x)/size;viewY=panStart.vy-(ev.clientY-panStart.y)/size;clampView();draw();updateView()}});for(const evt of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(evt,()=>{if(dirty){persist();render();dirty=false}painting=false;panStart=null});
$('learning').checked=learning;$('learning').onchange=()=>{learning=$('learning').checked;try{localStorage.setItem('revier-learning-v04',learning?'on':'off')}catch{notify('Lernmodus gilt nur für diese Sitzung; Browserspeicher ist blockiert.');}$('learningpanel').hidden=!learning;if(!learning){$('quiz').innerHTML='';$('species').innerHTML=''}else showSpecies('reh');window.RevierLearning.sync();notify(learning?'Lernmodus aktiviert.':'Kindermodus: Fragen ausgeschaltet.');};$('learningpanel').hidden=!learning;$('inspect').onclick=()=>{inspect=!inspect;$('inspect').classList.toggle('active',inspect);$('inspect').textContent=inspect?'🔎 Erkunden: AN':'🔎 Natur erkunden';notify(inspect?'Tippe auf ein Feld, um Artenwissen zu sehen.':'Bearbeitungsmodus aktiv.');};$('zoomIn').onclick=()=>changeZoom(1.5);$('zoomOut').onclick=()=>changeZoom(1/1.5);$('pan').onclick=()=>{pan=!pan;$('pan').textContent=pan?'✋ Verschieben: AN':'✋ Karte verschieben';$('pan').classList.toggle('active',pan)};canvas.addEventListener('wheel',e=>{e.preventDefault();changeZoom(e.deltaY<0?1.2:1/1.2)},{passive:false});
$('tools').innerHTML=TYPES.map(t=>`<button type="button" data-tool="${t[0]}"><span class="tool-art art-${t[0]}" aria-hidden="true">${['water','path','meadow'].includes(t[0])?t[1]:''}</span>${t[2]}</button>`).join('');function setTool(t){tool=t;document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('active',b.dataset.tool===tool))}document.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>setTool(b.dataset.tool)));setTool(tool);
$('next').onclick=()=>advance(1);$('year').onclick=()=>advance(12);$('save').onclick=()=>notify(persist()?'Spielstand auf diesem Gerät gespeichert.':'Speichern nicht möglich: Browserspeicher blockiert. Bitte exportieren.');$('load').onclick=()=>{try{let s=JSON.parse(localStorage.getItem(KEY));if(!valid(s))throw Error();state=s;render();notify('Spielstand geladen.')}catch{notify('Kein gültiger Spielstand vorhanden.')}};$('reset').onclick=()=>{if(confirm('Die aktuelle Landschaft zurücksetzen?')){state=fresh();persist();render();notify('Neue Landschaft erstellt.')}};$('export').onclick=()=>{let blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='revier-spielstand.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};$('import').onchange=async ev=>{let file=ev.target.files[0];if(!file)return;if(file.size>1500000){notify('Datei ist zu groß.');return}try{let s=JSON.parse(await file.text());if(!valid(s))throw Error();state=s;persist();render();notify('Spielstand importiert.')}catch{notify('Ungültiger Spielstand.')}ev.target.value=''};window.RevierLearning.init({isLearning:()=>learning,notify});render();updateView();if(learning)showSpecies('reh');})();
