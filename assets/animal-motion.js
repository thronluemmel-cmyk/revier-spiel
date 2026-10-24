/* Articulated runtime sprites: textured bodies and independently jointed legs. */
(()=>{'use strict';
const configs={
 deer:[.64,[.24,.34,.58,.66],'#895c3d',4],hare:[.70,[.28,.35,.66,.72],'#95775b',2],fox:[.69,[.38,.45,.67,.73],'#553a2c',4],boar:[.75,[.24,.33,.62,.72],'#4b4035',4],
 rotwild:[.72,[.22,.33,.57,.65],'#704a32',4],damwild:[.73,[.23,.33,.53,.61],'#936b49',4],dachs:[.81,[.38,.44,.69,.76],'#302f2c',4],waschbaer:[.82,[.38,.47,.72,.80],'#605547',4],eichhornchen:[.84,[.48,.56,.72,.79],'#a95a27',2],biber:[.85,[.48,.55,.72,.8],'#694631',4],fischotter:[.82,[.45,.53,.73,.81],'#5c4837',4],stockente:[.78,[.53,.65],'#d48a25',2],fasan:[.78,[.66,.73],'#745235',2],graureiher:[.76,[.47,.59],'#776039',2]};
const cache=new Map();
function tile(image,kind,col,row,more){let item=cache.get(kind);if(item&&item.image===image)return item;
 if(!image?.complete||!image.naturalWidth)return null;
 const xs=more?[0,430,835,1175,1655,1984].map(x=>x*image.naturalWidth/1984):[0,768,1536],ys=more?[0,445*image.naturalHeight/784,image.naturalHeight]:[0,512,1024];
 const sw=xs[col+1]-xs[col],sh=ys[row+1]-ys[row],scale=Math.min(192/sw,192/sh),w=sw*scale,h=sh*scale;
 const canvas=document.createElement('canvas');canvas.width=192;canvas.height=192;const c=canvas.getContext('2d');c.drawImage(image,xs[col],ys[row],sw,sh,(192-w)/2,192-h,w,h);
 // Keep the original textured upper body. Legs are drawn separately, never frozen.
 const cut=configs[kind][0];c.clearRect(0,192*cut,192,192);item={image,canvas};cache.set(kind,item);return item;
}
function leg(c,x,hip,length,width,phase,color,far,hopping,running){
 const stride=(running?.56:.32)*Math.sin(phase),lift=Math.max(0,Math.cos(phase))*(running?.35:.2);
 const knee={x:x+stride*length*.45+lift*length*.25,y:hip+length*(.5-lift*.2)},foot={x:x+stride*length,y:hip+length-lift*length};
 c.save();c.globalAlpha=far?.72:1;c.lineCap='round';c.lineJoin='round';const g=c.createLinearGradient(x-width,hip,x+width,hip+length);g.addColorStop(0,color);g.addColorStop(.6,color);g.addColorStop(1,'#40362c');c.strokeStyle=g;
 c.lineWidth=width;c.beginPath();c.moveTo(x,hip);c.quadraticCurveTo(x+width*.3,hip+length*.25,knee.x,knee.y);c.stroke();
 c.lineWidth=width*.55;c.beginPath();c.moveTo(knee.x,knee.y);c.lineTo(foot.x,foot.y);c.stroke();c.strokeStyle='#332d26';c.lineWidth=width*.7;c.beginPath();c.moveTo(foot.x-width*.1,foot.y);c.lineTo(foot.x+width*.35,foot.y);c.stroke();c.restore();

}
function draw(c,image,kind,col,row,more,x,y,w,h,flip,phase,moving,running){
 const item=tile(image,kind,col,row,more);if(!item)return false;const [cut,legs,color,gait]=configs[kind],hop=['hare','eichhornchen'].includes(kind),bird=['stockente','fasan','graureiher'].includes(kind);
 const cycle=moving?phase:0,bounce=moving?(hop?-Math.max(0,Math.sin(cycle))*h*(running?.11:.065):Math.sin(cycle*2)*h*.014):Math.sin(phase*.3)*h*.003;
 c.save();c.translate(x,y);if(flip)c.scale(-1,1);c.translate(-w/2,bounce-h);
 const hip=h*(cut-.035),length=h*(.97-cut),width=w*(kind==='graureiher'?.018:['boar','dachs','biber'].includes(kind)?.065:.037);
 // Back legs first, then front pair: the textured trunk hides their attachment points.
 for(let j=0;j<legs.length;j++){
  const far=legs.length===4&&j%2===0,offset=hop?(j<2?0:Math.PI):j%2*Math.PI+(j>=2?Math.PI:0);
  leg(c,w*legs[j],hip,length,width,cycle+offset,color,far,hop,running);
 }
 c.save();if(moving&&!hop)c.rotate(Math.sin(cycle)*.008);c.drawImage(item.canvas,0,0,w,h);c.restore();
 // Small wake for swimming waterfowl; walking leg motion remains visible on banks.
 c.restore();return true;
}
window.RevierAnimalMotion={draw,configs};
})();
