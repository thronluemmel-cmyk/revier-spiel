/* REVIER 0.9 — original pastoral miniature and synthesized woodland ambience.
   No recordings, external requests, microphone access or third-party audio assets. */
(()=>{'use strict';
const KEY='revier-audio-v09';
const DEFAULTS={version:1,music:true,forest:true,master:65,musicVolume:45,forestVolume:55};
let settings={...DEFAULTS},persistFailed=false,engine=null,starting=null,wantsAudio=false;
const $=id=>document.getElementById(id);
function valid(p){return p&&p.version===1&&typeof p.music==='boolean'&&typeof p.forest==='boolean'&&['master','musicVolume','forestVolume'].every(k=>Number.isFinite(p[k])&&p[k]>=0&&p[k]<=100)}
try{const p=JSON.parse(localStorage.getItem(KEY));if(valid(p))settings={...DEFAULTS,...p}}catch{}
function save(){try{localStorage.setItem(KEY,JSON.stringify(settings));persistFailed=false}catch{persistFailed=true}}
const hz=n=>440*Math.pow(2,(n-69)/12),random=(a,b)=>a+Math.random()*(b-a);
// Six eighth-note pulses per bar, 6/8 at a quiet walking pace. 24-bar original theme.
const SCORE=[
 [[48,52,55],[72,76,79,76,74,72]],[[47,50,55],[71,74,79,77,74,71]],
 [[45,48,52],[72,76,81,79,76,72]],[[43,48,52],[67,72,76,74,72,0]],
 [[41,45,48],[69,72,77,76,72,69]],[[40,43,48],[67,72,76,79,76,72]],
 [[43,47,50],[71,74,77,76,74,71]],[[48,52,55],[72,0,76,74,72,0]],
 [[45,48,52],[76,79,81,79,76,74]],[[41,45,48],[72,77,79,77,76,72]],
 [[50,53,57],[74,77,81,79,77,74]],[[43,47,50],[71,74,79,77,74,0]],
 [[48,52,55],[76,79,84,83,81,79]],[[41,45,48],[77,81,79,77,76,74]],
 [[43,47,50],[74,76,77,74,71,0]],[[48,52,55],[72,0,0,76,74,72]],
 [[45,48,52],[69,72,76,74,72,69]],[[52,56,59],[71,76,80,79,76,71]],
 [[45,48,52],[72,76,81,79,76,72]],[[50,53,57],[74,77,81,79,77,0]],
 [[41,45,48],[77,76,74,72,69,72]],[[43,47,50],[74,76,77,74,71,67]],
 [[48,52,55],[72,76,79,76,74,71]],[[48,52,55],[72,0,0,0,0,0]]
];
class SoundEngine{
 constructor(ctx){
 this.ctx=ctx;this.timer=null;this.pulse=0;this.nextMusic=ctx.currentTime+.15;this.nextBird=ctx.currentTime+2.2;this.nextAnimal=ctx.currentTime+34;
 this.birdIndex=0;this.animalIndex=0;this.settings={...DEFAULTS};this.scheduled={notes:0,birds:0,animals:0};
 this.master=ctx.createGain();this.master.gain.value=0;
 const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-12;limiter.knee.value=12;limiter.ratio.value=5;limiter.attack.value=.01;limiter.release.value=.3;
 this.master.connect(limiter);limiter.connect(ctx.destination);
 this.music=ctx.createGain();this.forest=ctx.createGain();this.music.gain.value=0;this.forest.gain.value=0;this.music.connect(this.master);this.forest.connect(this.master);
 this.reverb=ctx.createConvolver();const impulse=ctx.createBuffer(2,Math.floor(ctx.sampleRate*1.5),ctx.sampleRate);
 for(let c=0;c<2;c++){const d=impulse.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3)*.16}
 this.reverb.buffer=impulse;const wet=ctx.createGain();wet.gain.value=.18;this.reverb.connect(wet);wet.connect(this.music);
 const real=new Float32Array(9),imag=new Float32Array([0,1,.38,.18,.09,.045,.02,.01,.005]);this.pianoWave=ctx.createPeriodicWave(real,imag);
 this.noise=ctx.createBuffer(1,ctx.sampleRate*5,ctx.sampleRate);const data=this.noise.getChannelData(0);let last=0;
 for(let i=0;i<data.length;i++){last=(last+.025*(Math.random()*2-1))/1.025;data[i]=last*3}
 this.wind();
 }
 apply(p){this.settings={...p};const t=this.ctx.currentTime;
 for(const [bus,value] of [[this.master,p.master/100],[this.music,p.music?p.musicVolume/100:0],[this.forest,p.forest?p.forestVolume/100:0]]){
 bus.gain.cancelScheduledValues(t);bus.gain.setTargetAtTime(value,t,.07);
 }
 }
 route(node,bus,pan=0){const p=this.ctx.createStereoPanner?this.ctx.createStereoPanner():this.ctx.createGain();if(p.pan)p.pan.value=pan;node.connect(p);p.connect(bus);return p}
 piano(note,t,duration,velocity,pan=0){
 const c=this.ctx,osc=c.createOscillator(),gain=c.createGain(),filter=c.createBiquadFilter();osc.setPeriodicWave(this.pianoWave);osc.frequency.value=hz(note);
 filter.type='lowpass';filter.frequency.setValueAtTime(3600,t);filter.frequency.exponentialRampToValueAtTime(900,t+duration);
 gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(velocity,t+.009);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
 osc.connect(filter);filter.connect(gain);const out=this.route(gain,this.music,pan);gain.connect(this.reverb);
 osc.start(t);osc.stop(t+duration+.02);osc.onended=()=>{osc.disconnect();filter.disconnect();gain.disconnect();out.disconnect()};this.scheduled.notes++;
 }
 strings(notes,t,duration){
 for(const note of notes){const osc=this.ctx.createOscillator(),g=this.ctx.createGain();osc.type='sine';osc.frequency.value=hz(note);osc.detune.value=random(-3,3);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.025,t+.6);g.gain.setValueAtTime(.025,t+duration-.5);g.gain.linearRampToValueAtTime(0,t+duration);
 osc.connect(g);g.connect(this.music);osc.start(t);osc.stop(t+duration+.01);osc.onended=()=>{osc.disconnect();g.disconnect()}}
 }
 musicPulse(t,pulse){
 const bar=Math.floor(pulse/6)%SCORE.length,k=pulse%6,[chord,melody]=SCORE[bar],cycle=Math.floor(pulse/(6*SCORE.length));
 const expressive=.9+.1*Math.sin(bar*.7),step=.44;
 if(this.settings.music){
 if(k===0){this.piano(chord[0],t,2.4,.16,-.25);if(bar%2===0)this.strings(chord.map(n=>n+12),t,2.7)}
 // Delicate broken-chord accompaniment, with room for the melody.
 if(k!==0||bar===23)this.piano(chord[[0,1,2,1,2,1][k]]+12,t+random(0,.014),1.3,.065,-.2);
 const note=melody[k];if(note)this.piano(note,t+.018,k===0?1.7:1.1,.12*expressive, .2);
 // Every other pass omits selected notes for a less mechanical repeating texture.
 if(cycle%2&&k===3&&bar%4===1)this.piano(chord[1]+24,t+step*.5,.8,.035,.1);
 }
 }
 wind(){
 const c=this.ctx,src=c.createBufferSource(),filter=c.createBiquadFilter(),g=c.createGain();src.buffer=this.noise;src.loop=true;
 filter.type='lowpass';filter.frequency.value=650;g.gain.value=.09;src.connect(filter);filter.connect(g);g.connect(this.forest);
 const lfo=c.createOscillator(),depth=c.createGain();lfo.frequency.value=.065;depth.gain.value=.035;lfo.connect(depth);depth.connect(g.gain);lfo.start();src.start();
 this.windNodes=[src,filter,g,lfo,depth];
 }
 whistle(t,start,end,duration,volume,pan){
 const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(start,t);o.frequency.exponentialRampToValueAtTime(end,t+duration*.65);o.frequency.exponentialRampToValueAtTime(end*.96,t+duration);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.018);g.gain.exponentialRampToValueAtTime(.0001,t+duration);
 o.connect(g);const p=this.route(g,this.forest,pan);o.start(t);o.stop(t+duration+.02);o.onended=()=>{o.disconnect();g.disconnect();p.disconnect()};
 }
 bird(t,type){
 const pan=random(-.7,.7),v=random(.055,.085),shift=random(.9,1.1);
 // Blackbird-like flute phrases, robin-like flowing chirps, tit-like paired calls.
 const phrases=[[[0,1800,2300,.30],[.42,2200,1800,.25],[.81,1700,2500,.38],[1.28,2700,2350,.22]],[[0,3200,4200,.12],[.19,3800,2900,.17],[.43,3000,4400,.12],[.63,4200,3100,.15],[.91,3000,3700,.22]],[[0,2600,2750,.13],[.20,1850,1800,.17],[.61,2600,2750,.13],[.81,1850,1800,.17]]];
 for(const [dt,a,b,d] of phrases[type%3])this.whistle(t+dt,a*shift,b*shift,d,v,pan);
 this.scheduled.birds++;
 }
 animal(t,type){
 const c=this.ctx,pan=random(-.6,.6),count=type===2?3:1;
 for(let k=0;k<count;k++){
 const start=t+k*.47,duration=type===0?.24:type===1?.36:.29;
 const o=c.createOscillator(),ng=c.createGain(),src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
 src.buffer=this.noise;src.playbackRate.value=type===2?1.8:3;
 o.type=type===2?'sawtooth':'triangle';const base=type===0?470:type===1?240:105;
 o.frequency.setValueAtTime(base*1.4,start);o.frequency.exponentialRampToValueAtTime(base*.65,start+duration);
 f.type='bandpass';f.frequency.value=type===0?1200:type===1?650:350;f.Q.value=.7;
 ng.gain.value=type===2?.85:.5;
 g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(type===2?.09:.075,start+.025);g.gain.exponentialRampToValueAtTime(.0001,start+duration);
 o.connect(f);src.connect(ng);ng.connect(f);f.connect(g);const p=this.route(g,this.forest,pan);
 o.start(start);src.start(start);o.stop(start+duration+.02);src.stop(start+duration+.02);
 o.onended=()=>{o.disconnect();src.disconnect();ng.disconnect();f.disconnect();g.disconnect();p.disconnect()};
 }
 this.scheduled.animals++;
 }
 tick(){
 const now=this.ctx.currentTime;if(this.nextMusic<now-.5)this.nextMusic=now+.1;
 while(this.nextMusic<now+.65){this.musicPulse(this.nextMusic,this.pulse++);this.nextMusic+=.44}
 if(now>=this.nextBird){if(this.settings.forest)this.bird(now+.05,this.birdIndex++);this.nextBird=now+random(7,15)}
 if(now>=this.nextAnimal){if(this.settings.forest){this.animal(now+.05,this.animalIndex++%3);this.nextBird=Math.max(this.nextBird,now+5)}this.nextAnimal=now+random(40,70)}
 }
 start(){if(this.timer!==null)return;this.tick();this.timer=setInterval(()=>{if(this.ctx.state==='running')this.tick()},160)}
 stopScheduler(){if(this.timer!==null)clearInterval(this.timer);this.timer=null}
}
function status(){
 let text;
 if(!settings.music&&!settings.forest)text='Musik und Waldgeräusche ausgeschaltet.';
 else if(settings.master===0)text='Gesamtlautstärke: stumm.';
 else if(document.hidden&&wantsAudio)text='Ton pausiert im Hintergrund.';
 else if(engine?.ctx.state==='running')text='Ton läuft · '+[settings.music?'Klassik':'',settings.forest?'Wald':''].filter(Boolean).join(' + ');
 else text='Ton startet beim ersten Antippen. Oder „Ton starten“ wählen.';
 if(persistFailed)text+=' Einstellungen gelten nur für diese Sitzung; Speichern ist nicht möglich.';
 $('audio-status').textContent=text;
 $('audio-start').hidden=!!(engine?.ctx.state==='running')||(!settings.music&&!settings.forest);
}
async function start(){
 if(!settings.music&&!settings.forest){status();return}
 wantsAudio=true;
 if(starting)return starting;
 starting=(async()=>{try{
 if(!engine){const Constructor=window.AudioContext||window.webkitAudioContext;if(!Constructor)throw Error('unsupported');engine=new SoundEngine(new Constructor());engine.ctx.onstatechange=status;}
 engine.apply(settings);
 await engine.ctx.resume();
 if(!document.hidden&&(settings.music||settings.forest))engine.start();else await engine.ctx.suspend();
 status();
 }catch{$('audio-status').textContent='Ton konnte nicht starten. Bitte „Ton starten“ erneut antippen oder einen aktuellen Browser verwenden.';$('audio-start').hidden=false;}finally{starting=null}})();
 return starting;
}
function update(){save();if(engine)engine.apply(settings);
 if(!settings.music&&!settings.forest){if(engine){engine.stopScheduler();engine.ctx.suspend().catch(()=>{});}status()}
 else start();
}
for(const [id,key] of [['music-on','music'],['forest-on','forest']]){const input=$(id);input.checked=settings[key];input.addEventListener('change',()=>{settings[key]=input.checked;update()})}
for(const [id,key] of [['volume-master','master'],['volume-music','musicVolume'],['volume-forest','forestVolume']]){
 const input=$(id),output=$(id+'-value');input.value=settings[key];output.textContent=settings[key]+' %';
 input.addEventListener('input',()=>{settings[key]=Number(input.value);output.textContent=settings[key]+' %';update()});
}
$('audio-start').onclick=start;
function gesture(e){if(e.target.closest('#sound-panel'))return;if(!engine||engine.ctx.state!=='running')start()}
document.addEventListener('pointerup',gesture);document.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')gesture(e)});
document.addEventListener('visibilitychange',()=>{
 if(!engine)return;
 if(document.hidden){engine.stopScheduler();engine.ctx.suspend().catch(()=>{});status()}
 else if(wantsAudio&&(settings.music||settings.forest))start();
});
window.addEventListener('pagehide',()=>{if(engine){engine.stopScheduler();engine.ctx.suspend().catch(()=>{})}});
window.addEventListener('pageshow',()=>{if(engine&&wantsAudio&&!document.hidden&&(settings.music||settings.forest))start()});
status();
// Read-only diagnostics and reusable synthesis engine for offline verification.
window.RevierAudio={getState:()=>({settings:{...settings},state:engine?.ctx.state||'not-started',scheduled:engine?{...engine.scheduled}:null}),SoundEngine};
})();
