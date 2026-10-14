/* Image galleries: bundled Commons images plus local user uploads in IndexedDB. */
(()=>{'use strict';
const defaults=window.REVIER_MEDIA||{},ids=new Set(window.REVIER_CARDS.map(c=>c.id)),known=new Map();
for(const list of Object.values(defaults))for(const image of list)known.set(image.src,image);
let records={},db=null,dbError='',draft=[],editId='',editToken=0,uploading=false,loading=false,dirtyCallback=()=>{};
const urls=new Map(),$=id=>document.getElementById(id),clone=x=>JSON.parse(JSON.stringify(x));
function node(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e}
function validURL(s){if(!s)return true;try{return ['http:','https:'].includes(new URL(s).protocol)}catch{return false}}
function validImage(x){return x&&typeof x==='object'&&typeof x.src==='string'&&(known.has(x.src)||/^user:[a-z0-9-]{12,80}$/.test(x.src))&&['caption','credit','source','license'].every(k=>typeof x[k]==='string'&&x[k].length<=2000)&&validURL(x.source)&&(!known.has(x.src)||['credit','source','license'].every(k=>x[k]===known.get(x.src)[k]))}
function validRecords(x){return x&&typeof x==='object'&&!Array.isArray(x)&&Object.entries(x).every(([id,list])=>ids.has(id)&&Array.isArray(list)&&list.length<=8&&list.every(validImage))}
function transaction(stores,mode,work){return new Promise((resolve,reject)=>{if(!db){reject(Error('Bildspeicher nicht verfügbar.'));return}const t=db.transaction(stores,mode);t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error||Error('Bildspeicherfehler.'));t.onabort=()=>reject(t.error||Error('Bildspeicher abgebrochen.'));try{work(t)}catch(e){t.abort();reject(e)}})}
function read(store,key){return new Promise((resolve,reject)=>{if(!db){reject(Error(dbError||'Bildspeicher nicht verfügbar.'));return}const r=db.transaction(store).objectStore(store).get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
const ready=new Promise(resolve=>{
 try{const r=indexedDB.open('revier-card-images-v1',1);r.onupgradeneeded=()=>{r.result.createObjectStore('settings');r.result.createObjectStore('uploads')};r.onsuccess=async()=>{db=r.result;try{const saved=await read('settings','cards');if(saved){if(!validRecords(saved))throw Error('Ungültige Bilddaten.');records=saved}}catch(e){dbError=e.message}resolve()};r.onerror=()=>{dbError='Eigene Bilder können in diesem Browser nicht gespeichert werden.';resolve()};r.onblocked=()=>{dbError='Bildspeicher ist durch einen anderen Tab blockiert.';resolve()};}catch{dbError='Bildspeicher ist nicht verfügbar.';resolve()}
});
const images=id=>clone(records[id]||defaults[id]||[]);
async function url(image){if(known.has(image.src))return image.src;if(urls.has(image.src))return urls.get(image.src);await ready;const blob=await read('uploads',image.src);if(!blob)throw Error('Bild fehlt im Gerätespeicher. Bitte die Bildsicherung importieren.');const u=URL.createObjectURL(blob);urls.set(image.src,u);return u}
function creditLine(image){const p=node('p',image.credit+(image.license?' · '+image.license:''),'image-credit');if(image.source){p.append(document.createTextNode(' · '));const a=node('a','Quelle / Lizenz');a.href=image.source;a.target='_blank';a.rel='noopener noreferrer';p.append(a)}return p}
async function setImage(img,image){try{img.src=await url(image)}catch(e){img.alt=e.message;img.classList.add('missing-image')}}
function zoom(image){const dialog=$('image-viewer'),body=$('image-viewer-body');body.replaceChildren();const img=node('img');img.alt=image.caption;body.append(img,node('p',image.caption,'image-caption'),creditLine(image));setImage(img,image);dialog.showModal()}
async function render(host,id){
 await ready;if(!host.isConnected)return;
 const list=images(id);host.replaceChildren();if(!list.length)return;
 host.append(node('h4','Bilder & Erkennungsmerkmale'));
 const grid=node('div',undefined,'learning-gallery');
 for(const image of list){const fig=node('figure'),button=node('button');button.type='button';button.className='gallery-thumb';button.setAttribute('aria-label','Bild vergrößern: '+image.caption);const img=node('img');img.alt=image.caption;img.loading='lazy';button.append(img);button.onclick=()=>zoom(image);setImage(img,image);fig.append(button,node('figcaption',image.caption),creditLine(image));grid.append(fig)}
 host.append(grid);
 const note=(window.REVIER_IMAGE_NOTES||{})[id];if(note)host.append(node('p',note,'image-note'));
}
function mark(){dirtyCallback();$('image-editor-status').textContent='Bildänderungen noch nicht gespeichert.'}
function renderEditor(){
 const root=$('image-editor-list');root.replaceChildren();
 for(const [index,image] of draft.entries()){
 const item=node('div',undefined,'image-editor-item'),preview=node('img');preview.alt=image.caption;preview.onclick=()=>zoom(image);preview.style.cursor='zoom-in';setImage(preview,image);item.append(preview);
 const fields=node('div');
 for(const [key,label] of [['caption','Bildbeschreibung'],['credit','Urheber / Herkunft'],['source','Quellenlink (optional)']]){
 const l=node('label',label),input=node('input');input.value=image[key];input.maxLength=2000;input.type=key==='source'?'url':'text';input.setAttribute('aria-label',label+' Bild '+(index+1));input.oninput=()=>{image[key]=input.value;mark()};l.append(input);fields.append(l);
 // Original attribution remains mandatory for bundled photographs.
 if(known.has(image.src)&&key!=='caption')input.readOnly=true;
 }
 if(image.license)fields.append(node('small',image.license));
 const remove=node('button','Bild entfernen');remove.type='button';remove.onclick=()=>{draft.splice(index,1);mark();renderEditor()};fields.append(remove);item.append(fields);root.append(item);
 }
 if(!draft.length)root.append(node('p','Noch keine Bilder auf dieser Karte.','hint'));
 $('image-upload').disabled=!db||uploading||draft.length>=8;
}
async function edit(id,onDirty){const token=++editToken;loading=true;editId=id;dirtyCallback=onDirty;await ready;if(token!==editToken)return;draft=images(id);loading=false;renderEditor();$('image-editor-status').textContent=dbError||'Bis zu 8 Bilder pro Karte. Bilder antippen, um sie groß anzusehen.'}
async function saveDraft(){await ready;if(uploading||loading)throw Error('Bitte warten, bis der Bildupload fertig ist.');if(!draft.every(validImage))throw Error('Bitte gültige Bildquellen verwenden (http/https oder leer).');const next={...records,[editId]:clone(draft)};
 // If persistent image storage is unavailable, text edits must remain possible.
 if(!db){if(JSON.stringify(draft)!==JSON.stringify(images(editId)))throw Error(dbError);return}
 await transaction(['settings'],'readwrite',t=>t.objectStore('settings').put(next,'cards'));records=next;
}
function dataURL(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob)})}
async function bitmap(blob){const u=URL.createObjectURL(blob);try{return await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Bild konnte nicht gelesen werden. Bitte JPG, PNG oder WebP verwenden.'));im.src=u})}finally{URL.revokeObjectURL(u)}}
async function compress(file){if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15000000)throw Error('Bitte JPG, PNG oder WebP bis 15 MB auswählen.');const im=await bitmap(file),w=im.naturalWidth,h=im.naturalHeight;if(!w||!h||w*h>60000000)throw Error('Bildabmessungen sind zu groß.');const scale=Math.min(1,1400/Math.max(w,h)),c=document.createElement('canvas');c.width=Math.round(w*scale);c.height=Math.round(h*scale);const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(im,0,0,c.width,c.height);const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.86));if(!blob||blob.size>2000000)throw Error('Bild bleibt zu groß; bitte eine kleinere Datei wählen.');return blob}
async function exportState(){await ready;const blobs={};for(const list of Object.values(records))for(const image of list)if(image.src.startsWith('user:')&&!blobs[image.src]){const blob=await read('uploads',image.src);if(!blob)throw Error('Eine eigene Bilddatei fehlt. Bitte ersetzen oder entfernen.');blobs[image.src]=await dataURL(blob)}return {version:1,cards:clone(records),blobs}}
async function prepareImport(state){if(state===undefined)return null;if(!state||state.version!==1||!validRecords(state.cards)||!state.blobs||typeof state.blobs!=='object')throw Error('Ungültige Bildsicherung.');await ready;if(!db)throw Error(dbError||'Bildspeicher nicht verfügbar.');
 const required=new Set(Object.values(state.cards).flat().filter(x=>x.src.startsWith('user:')).map(x=>x.src)),uploads={};let total=0;
 for(const id of required){const str=state.blobs[id];if(typeof str!=='string'||str.length>3000000||!/^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(str))throw Error('Bilddatei in der Sicherung fehlt oder ist ungültig.');total+=str.length;if(total>70000000)throw Error('Bildsicherung ist zu groß.');const [head,body]=str.split(',');let raw;try{raw=atob(body)}catch{throw Error('Ungültige Bildkodierung.')}const blob=new Blob([Uint8Array.from(raw,c=>c.charCodeAt(0))],{type:head.slice(5,head.indexOf(';'))});const im=await bitmap(blob);if(im.naturalWidth*im.naturalHeight>60000000)throw Error('Importiertes Bild ist zu groß.');uploads[id]=blob}
 return {cards:clone(state.cards),uploads};
}
async function importPrepared(data){if(!data)return;await transaction(['settings','uploads'],'readwrite',t=>{t.objectStore('settings').put(data.cards,'cards');for(const [id,b] of Object.entries(data.uploads))t.objectStore('uploads').put(b,id)});records=data.cards;for(const u of urls.values())URL.revokeObjectURL(u);urls.clear()}
async function restoreMetadata(data){if(!db)return;await transaction(['settings'],'readwrite',t=>t.objectStore('settings').put(data,'cards'));records=data}
function init(){
 $('image-viewer-close').onclick=()=>$('image-viewer').close();
 $('image-upload').onchange=async e=>{const files=Array.from(e.target.files),token=editToken;if(!files.length)return;if(files.length+draft.length>8){$('image-editor-status').textContent='Maximal 8 Bilder pro Karte.';e.target.value='';return}uploading=true;mark();renderEditor();try{for(const file of files){const blob=await compress(file),id='user:'+(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Array.from(crypto.getRandomValues(new Uint32Array(3))).map(n=>n.toString(36)).join('-'));await transaction(['uploads'],'readwrite',t=>t.objectStore('uploads').put(blob,id));if(token!==editToken)break;draft.push({src:id,caption:file.name.replace(/\.[^.]+$/,''),credit:'Eigenes Bild',source:'',license:''})}if(token===editToken)$('image-editor-status').textContent='Bilder hinzugefügt. Bitte „Änderungen speichern“ drücken.';}catch(err){$('image-editor-status').textContent=err.message}finally{uploading=false;e.target.value='';if(token===editToken)renderEditor()}};
 $('images-default').onclick=()=>{draft=clone(defaults[editId]||[]);mark();renderEditor()};
}
window.RevierGallery={init,render,edit,saveDraft,exportState,prepareImport,importPrepared,restoreMetadata,snapshot:()=>clone(records),get busy(){return uploading||loading},ready};
})();
