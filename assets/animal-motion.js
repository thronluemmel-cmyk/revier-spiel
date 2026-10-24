/* 0.19: animate the original complete animal, retaining its textured legs.
 * Smooth image deformation below the natural leg roots; no added stick limbs. */
(()=>{'use strict';
const configs={
 deer:{hip:.64,left:.12,right:.86},hare:{hip:.73,left:.20,right:.88,hop:true},fox:{hip:.75,left:.33,right:.87},boar:{hip:.79,left:.15,right:.94},
 rotwild:{hip:.75,left:.08,right:.83},damwild:{hip:.76,left:.12,right:.84},dachs:{hip:.88,left:.20,right:.95},waschbaer:{hip:.88,left:.29,right:.96},
 eichhornchen:{hip:.88,left:.45,right:.98,hop:true},biber:{hip:.90,left:.45,right:.94},fischotter:{hip:.88,left:.38,right:.98},
 stockente:{hip:.89,left:.4,right:.80},fasan:{hip:.89,left:.57,right:.88},graureiher:{hip:.81,left:.35,right:.79}
};
const cache=new Map(),SIZE=160,FRAMES=16;
const smooth=n=>{n=Math.max(0,Math.min(1,n));return n*n*(3-2*n)};
function tile(image,kind,col,row,more){let item=cache.get(kind);if(item&&item.image===image)return item;
 if(!image?.complete||!image.naturalWidth)return null;
 const xs=more?[0,430,835,1175,1655,1984].map(x=>x*image.naturalWidth/1984):[0,768,1536],ys=more?[0,445*image.naturalHeight/784,image.naturalHeight]:[0,512,1024];
 const sw=xs[col+1]-xs[col],sh=ys[row+1]-ys[row],scale=Math.min(SIZE/sw,SIZE/sh),w=sw*scale,h=sh*scale;
 const canvas=document.createElement('canvas');canvas.width=SIZE;canvas.height=SIZE;const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(image,xs[col],ys[row],sw,sh,(SIZE-w)/2,SIZE-h,w,h);
 item={image,canvas,pixels:c.getImageData(0,0,SIZE,SIZE),poses:new Map()};cache.set(kind,item);return item;
}
function pose(item,kind,frame,running){
 const key=frame+(running?FRAMES:0);if(item.poses.has(key))return item.poses.get(key);
 const cfg=configs[kind],phase=frame/FRAMES*Math.PI*2,canvas=document.createElement('canvas');canvas.width=SIZE;canvas.height=SIZE;const c=canvas.getContext('2d'),out=c.createImageData(SIZE,SIZE),src=item.pixels.data,dst=out.data;
 const hip=cfg.hip*SIZE,left=cfg.left*SIZE,right=cfg.right*SIZE,amplitude=(running?.042:.025)*SIZE;
 for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
  const weight=smooth((y-hip)/(SIZE-1-hip)),edge=smooth((x-left)/6)*smooth((right-x)/6),local=phase+(cfg.hop?(x<(left+right)*.5?0:Math.PI):(x-left)/(right-left)*Math.PI*3);
  const dx=Math.sin(local)*amplitude*weight*edge,dy=Math.max(0,Math.cos(local))*amplitude*.42*weight*edge;
  const sx=x-dx,sy=y+dy,ix=Math.floor(sx),iy=Math.floor(sy),tx=sx-ix,ty=sy-iy,j=(y*SIZE+x)*4;
  // Interpolate premultiplied alpha to retain clean fur and hoof outlines.
  let a=0,r=0,g=0,b=0;for(let q=0;q<4;q++){const xx=ix+(q%2),yy=iy+(q>>1);if(xx<0||xx>=SIZE||yy<0||yy>=SIZE)continue;const w=(q%2?tx:1-tx)*(q>>1?ty:1-ty),i=(yy*SIZE+xx)*4,aw=src[i+3]*w;a+=aw;r+=src[i]*aw;g+=src[i+1]*aw;b+=src[i+2]*aw;}
  if(a>0){dst[j]=r/a;dst[j+1]=g/a;dst[j+2]=b/a;dst[j+3]=a;}
 }
 c.putImageData(out,0,0);item.poses.set(key,canvas);return canvas;
}
function draw(c,image,kind,col,row,more,x,y,w,h,flip,phase,moving,running,behavior='roam',water=false){
 const item=tile(image,kind,col,row,more);if(!item)return false;
 const cfg=configs[kind],frame=((Math.floor(phase/(Math.PI*2)*FRAMES)%FRAMES)+FRAMES)%FRAMES;
 const picture=moving?pose(item,kind,frame,running):item.canvas;
 const bounce=moving?(cfg.hop?-Math.max(0,Math.sin(phase))*h*(running?.045:.022):Math.sin(phase*2)*h*.005):0;
 const swimming=water&&['stockente','biber','fischotter'].includes(kind);
 if(swimming){c.save();c.strokeStyle='#c5e2ddaa';c.lineWidth=1.2;c.beginPath();c.ellipse(x,y-h*.12,w*.38,h*.09,0,0,Math.PI*2);c.stroke();c.restore();}
 c.save();c.translate(x,y+bounce);if(flip)c.scale(-1,1);if(swimming){c.beginPath();c.rect(-w,-h,w*2,h);c.clip();c.drawImage(picture,-w/2,-h*.82,w,h);}else{if(behavior==='feed'&&!moving){c.translate(0,-h*.5);c.rotate(.055+Math.sin(phase)*.018);c.translate(0,h*.5);}c.drawImage(picture,-w/2,-h,w,h);}c.restore();return true;
}
window.RevierAnimalMotion={draw,configs};
})();
