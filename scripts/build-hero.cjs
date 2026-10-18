const fs=require('node:fs');
const image=fs.readFileSync('pwa-public/fishay-hero.jpg').toString('base64');
const css=fs.readFileSync('scripts/hero.css','utf8');
for(const p of ['src/Index.html','Vorschau.html']){
 let s=fs.readFileSync(p,'utf8');
 s=s.replace(/\/\* HERO_START \*\/[\s\S]*?\/\* HERO_END \*\//g,'');
 s=s.replace('</style>','/* HERO_START */\n'+css+'\n/* HERO_END */\n</style>');
 s=s.replace(/<h1>Jeder Fang zählt\.[\s\S]*?<\/h1>/,'<h1>FISHAY<em>PREDATOR CUP</em></h1>');
 s=s.replace('Alle Punkte, eure größten Fänge und die aktuelle Rangliste – direkt aus eurer Turniertabelle.','Euer Wasser. Eure Fänge. Wer holt den Cup?');
 s=s.replace(/<div class="hero-art" aria-hidden="true">[\s\S]*?<\/div>/,'<div class="hero-art" aria-hidden="true"><img src="data:image/jpeg;base64,'+image+'" alt="" width="1400" height="483" fetchpriority="high"></div>');
 fs.writeFileSync(p,s);
}
