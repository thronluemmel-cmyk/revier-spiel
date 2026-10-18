const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('src/Index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(script);
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(ids.length,new Set(ids).size,'Duplicate DOM IDs');
for(const m of script.matchAll(/\$\('([^']+)'\)/g)) assert.ok(ids.includes(m[1]),'Missing element '+m[1]);
console.log('Frontend syntax and DOM references OK');
