/* Walkers follow cardinal path edges; ten tiles is a game rule only. */
(()=>{'use strict';
const caches=new WeakMap(),MAX=12;
function invalidate(s){caches.delete(s)}
function network(s){if(caches.has(s))return caches.get(s);const N=Math.round(Math.sqrt(s.tiles.length)),edges=new Map();for(let i=0;i<s.tiles.length;i++){if(s.tiles[i]!=='path')continue;const x=i%N,ns=[x>0?i-1:-1,x<N-1?i+1:-1,i-N,i+N].filter(j=>j>=0&&j<s.tiles.length&&s.tiles[j]==='path');if(ns.length)edges.set(i,ns);}const net={N,edges,starts:[...edges.keys()]};caches.set(s,net);return net;}
function valid(s){return Array.isArray(s.walkers)&&s.walkers.length<=MAX&&new Set(s.walkers.map(w=>w.id)).size===s.walkers.length&&s.walkers.every(w=>Number.isInteger(w.id)&&w.id>=1&&w.id<=MAX&&['from','to'].every(k=>Number.isInteger(w[k])&&w[k]>=0&&w[k]<s.tiles.length)&&Number.isFinite(w.progress)&&w.progress>=0&&w.progress<1&&Number.isSafeInteger(w.steps)&&w.steps>=0&&Number.isInteger(w.previous)&&w.previous>=-1&&w.previous<s.tiles.length);}
function reconcile(s){const n=network(s),count=Math.min(MAX,Math.ceil(n.starts.length/40));s.walkers=(s.walkers||[]).filter(w=>n.edges.get(w.from)?.includes(w.to)).slice(0,count);const used=new Set(s.walkers.map(w=>w.id));for(let id=1;s.walkers.length<count&&id<=MAX;id++){if(used.has(id))continue;const from=n.starts[Math.floor((id*.61803398875%1)*n.starts.length)],to=n.edges.get(from)[0];s.walkers.push({id,from,to,progress:0,previous:-1,steps:0});}return s.walkers;}
function step(s,seconds){const n=network(s);for(const w of s.walkers){w.progress+=Math.max(0,Math.min(seconds,.25))*.28;while(w.progress>=1){w.progress-=1;w.previous=w.from;w.from=w.to;w.steps++;let options=n.edges.get(w.from)||[];const forward=options.filter(i=>i!==w.previous);if(forward.length)options=forward;w.to=options[(w.id+w.steps)%options.length];}}}
function positions(s){const N=network(s).N;return (s.walkers||[]).map(w=>({id:w.id,x:w.from%N+.5+(w.to%N-w.from%N)*w.progress,y:Math.floor(w.from/N)+.5+(Math.floor(w.to/N)-Math.floor(w.from/N))*w.progress,phase:w.steps+w.progress}));}
function near(s,x,y){return positions(s).some(p=>Math.hypot(p.x-x,p.y-y)<=10+1e-9)}
window.RevierVisitors={invalidate,network,reconcile,step,positions,near,valid};
})();
