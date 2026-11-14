'use strict';
function poly(c,pts,fill,edge){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(edge){c.strokeStyle=edge;c.lineWidth=1.6;c.stroke()}}
function oval(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,rx,ry,0,0,2*Math.PI);c.fillStyle=fill;c.fill()}
function box(c,x,y,w,h,r,col){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=col;c.fill()}
function star(c,x,y,r,col){poly(c,Array.from({length:10},(_,i)=>{const a=i*Math.PI/5-Math.PI/2,l=i%2?r*.44:r;return [x+l*Math.cos(a),y+l*Math.sin(a)]}),col)}
function sprite(c,k,x,y,scale=1,outfit=0,flip=false){
 c.save();c.translate(x,y);c.scale(flip?-scale:scale,scale);const ink='#243649',color=heroes[k].color;
 oval(c,0,17,20,5,'#26334338');box(c,-13,9,9,10,4,ink);box(c,4,9,9,10,4,ink);
 if(k===0){
 poly(c,[[-9,1],[-28,5],[-22,8],[-31,13],[-8,10]],outfit?'#ffcd66':'#fb785b',ink);
 oval(c,0,5,13,11,ink);oval(c,0,3,11,9,color);
 poly(c,[[-16,-5],[-18,-24],[-6,-17],[3,-18],[14,-26],[15,-7],[19,0],[11,7],[-4,8],[-16,2]],color,ink);
 poly(c,[[-14,-19],[-8,-14],[-13,-12]],'#226687');poly(c,[[8,-15],[12,-20],[11,-12]],'#226687');
 oval(c,2,-3,11,6,'#f3eac0');oval(c,-2,-5,1.8,2.5,ink);oval(c,8,-5,1.8,2.5,ink);poly(c,[[1,-1],[6,-1],[4,2]],ink);
 }else if(k===1){
 box(c,-24,-5,13,19,4,ink);box(c,13,-5,13,19,4,ink);box(c,-23,-7,12,14,4,color);box(c,13,-7,12,14,4,color);
 box(c,-15,-16,32,32,7,ink);box(c,-13,-16,28,26,6,color);box(c,-10,-10,22,10,4,ink);box(c,-7,-8,6,3,1,'#9affef');box(c,3,-8,6,3,1,'#9affef');box(c,-7,3,14,5,2,'#b66a48');box(c,-6,-20,14,5,2,'#ffda8d');
 }else if(k===2){
 poly(c,[[-18,14],[-12,-7],[7,-14],[21,14],[11,11],[6,18],[-1,13],[-9,18]],'#8555bd',ink);oval(c,0,-4,12,11,'#f8cea9');oval(c,-3,-3,2,2.7,ink);oval(c,5,-3,2,2.7,ink);
 poly(c,[[-20,-7],[-8,-12],[1,-27],[15,-22],[21,-24],[14,-15],[7,-15],[14,-8],[20,-5]],color,ink);star(c,20,-24,5,'#ffe39a');star(c,0,9,6,'#ffd778');
 }
 else if(k===3){
  poly(c,[[-18,13],[-14,-10],[-4,-22],[12,-19],[18,13]],'#337dba',ink);oval(c,0,-8,13,13,'#d0eff7');
  poly(c,[[-17,-12],[-7,-27],[7,-30],[18,-11],[9,-15],[0,-23],[-9,-13]],color,ink);
  box(c,-8,-8,6,4,2,ink);box(c,4,-8,6,4,2,ink);star(c,18,2,7,'#ebfaff');
 }else if(k===4){
  box(c,-17,-13,34,32,9,'#6b343f');box(c,-14,-13,28,26,8,color);
  poly(c,[[-19,-13],[-14,-27],[-4,-17],[6,-29],[18,-13]],'#ffdd85',ink);
  oval(c,0,-6,11,9,'#ffd7b1');box(c,-8,-8,6,4,1,ink);box(c,3,-8,6,4,1,ink);
  poly(c,[[-23,7],[-34,1],[-27,-13],[-15,-10]],'#e7af66',ink);star(c,20,5,6,'#ffef9f');
 }else if(k===5){
  poly(c,[[-19,13],[-16,-16],[0,-26],[18,-13],[21,14]],'#41866d',ink);oval(c,0,-5,12,12,'#f4d3ac');
  poly(c,[[-17,-9],[-9,-27],[-1,-23],[6,-30],[20,-9],[10,-13],[0,-22],[-8,-13]],color,ink);
  oval(c,-4,-6,2,2,ink);oval(c,5,-6,2,2,ink);poly(c,[[-5,9],[0,0],[6,9]],'#d5f5b4');
 }else if(k===6){
  // Панді: впізнаваний, але оригінальний округлий силует із бамбуковим спорядженням.
  oval(c,-18,-12,9,9,'#283b46');oval(c,19,-13,9,9,'#283b46');
  oval(c,0,7,19,16,'#263a43');oval(c,0,6,16,13,'#faf5dc');
  box(c,-15,7,7,12,4,'#263a43');box(c,9,7,7,12,4,'#263a43');
  oval(c,0,-9,23,20,'#293e47');oval(c,0,-10,20,18,'#faf9e8');
  oval(c,-9,-12,7,8,'#2b4247');oval(c,9,-12,7,8,'#2b4247');
  oval(c,-8,-12,2.8,3.4,'#f7faf1');oval(c,9,-12,2.8,3.4,'#f7faf1');
  oval(c,0,-4,4.5,3.2,'#2b4247');oval(c,0,1,2.4,1,'#d67f82');
  poly(c,[[-17,5],[14,5],[19,12],[-11,13]],'#f9c86e','#805648');
  box(c,16,-19,5,31,2,'#4c9f68');box(c,16,-18,5,5,2,'#9de18b');
  box(c,15,-6,7,4,2,'#b4f596');star(c,-10,5,3,'#ffefb3');
 }else if(k===7){
  // Котик: чорно-білий пухнастик (tuxedo cat) з білою мордочкою, рожевим носиком та зеленуватими очима.
  const fur='#1e2532',white='#faf7f0',nose='#f598aa';
  poly(c,[[-12,10],[-26,6],[-30,-4],[-24,-7],[-20,3],[-10,6]],fur,'#131822');
  oval(c,-26,-5,3.5,3.5,white);
  oval(c,0,7,16,13,fur);
  oval(c,1,8,10,9,white);
  box(c,-13,8,7,10,3.5,fur);box(c,7,8,7,10,3.5,fur);
  oval(c,-9.5,16,3,2,white);oval(c,10.5,16,3,2,white);
  poly(c,[[-17,-14],[-19,-32],[-5,-22]],fur,'#131822');
  poly(c,[[17,-14],[19,-32],[5,-22]],fur,'#131822');
  poly(c,[[-15,-16],[-16,-27],[-7,-20]],white);
  poly(c,[[15,-16],[16,-27],[7,-20]],white);
  oval(c,0,-11,20,17,fur);
  poly(c,[[0,-18],[-12,-3],[12,-3]],white);
  oval(c,0,-5,12,8.5,white);
  oval(c,-8,-12,3.6,3.8,'#4f8062');oval(c,8,-12,3.6,3.8,'#4f8062');
  oval(c,-8,-12,2.4,2.7,'#111722');oval(c,8,-12,2.4,2.7,'#111722');
  oval(c,-9,-13,1,1,'#ffffff');oval(c,7,-13,1,1,'#ffffff');
  poly(c,[[-3.2,-7],[3.2,-7],[0,-3.5]],nose);
  c.strokeStyle='#d6778a';c.lineWidth=1.4;c.beginPath();c.moveTo(0,-3.5);c.lineTo(-2.5,-1.5);c.moveTo(0,-3.5);c.lineTo(2.5,-1.5);c.stroke();
 }
 if(outfit){poly(c,[[-13,2],[11,6],[12,10],[-11,6]],outfit===2?'#ff94c4':'#ffdc72');star(c,7,7,3,'#fffad4')}
 c.restore();
}
function banner(c,x,y,kind=0,scale=1){c.save();c.translate(x,y);c.scale(scale,scale);box(c,-2,-32,4,34,2,'#333c55');poly(c,[[1,-31],[25,-29],[19,-21],[26,-16],[1,-18]],flagColors[kind][0]);poly(c,[[1,-23],[21,-22],[24,-18],[1,-20]],flagColors[kind][1]);c.restore()}
function terrain(c,m){
 const d=maps[m];c.fillStyle=d.floor;c.fillRect(0,0,W,H);
 // Власний мультяшний рисунок ґрунту: м'які плитки, рослинний візерунок, світлі доріжки.
 c.strokeStyle='#ffffff15';c.lineWidth=2;
 for(let x=22;x<W;x+=46)for(let y=16;y<H;y+=46){
  const jitter=(x*13+y*7)%13;box(c,x+jitter,y+(jitter%5),21,12,4,'#ffffff0b');
  if((x+y)%4===0){oval(c,x+31,y+23,3,1.5,'#182e3a1b')}
 }
 c.beginPath();c.roundRect(18,18,W-36,H-36,24);c.stroke();
 for(let i=0;i<260;i++){const x=(i*79+17)%W,y=(i*i*13+i*71)%H;oval(c,x,y,2+i%5,1.4,i%2?'#fff6d430':'#34384a1f')}
 // Півпрозорі дуги маркують ігрові шляхи, не утворюючи колізій.
 c.strokeStyle='#fffaf014';c.lineWidth=18;c.beginPath();c.moveTo(76,270);c.bezierCurveTo(260,125,625,395,850,270);c.stroke();
 if(m===1){for(const y of [238,408])for(let x=372;x<545;x+=13)box(c,x,y,12,y===238?58:20,2,'#b77b55')}
 for(const [x,y,w,h] of d.blocks){
 box(c,x+5,y+10,w,h,12,'#192f4757');box(c,x+1,y+5,w,h,10,'#21263869');box(c,x,y,w,h,9,d.shade);
 if(m===1){box(c,x+2,y+2,w-4,h-5,8,'#563f55');for(let i=10;i<w-8;i+=24)poly(c,[[x+i,y],[x+i+15,y],[x+i+6,y+10]],'#f5bd85')}
 else{box(c,x,y-4,w,h-7,10,d.wall);box(c,x+7,y+4,w-14,3,2,'#ffffff45');for(let i=12;i<w-8;i+=24){if(m===2){oval(c,x+i,y+8,6,5,'#c79cce');oval(c,x+i-1,y+6,2,1.5,'#ffeab8')}else{poly(c,[[x+i,y+8],[x+i-5,y+1],[x+i,y+4],[x+i+4,y-2],[x+i+5,y+6]],'#5a997e')}}}
 }
 for(let i=0;i<26;i++){let x=i*77%W,y=i%2?H-8:11;if(m===0)poly(c,[[x,y],[x-4,y-7],[x-1,y-13],[x+2,y-6],[x+7,y-12],[x+4,y]],'#e78075');if(m===2){oval(c,x,y,7,4,'#df92ca');oval(c,x+9,y-5,2,2,'#ffe48b')}}
}
function poster(m,k,wear){
 const c=document.getElementById('poster').getContext('2d'),d=maps[m];const g=c.createLinearGradient(0,0,0,430);g.addColorStop(0,d.sky);g.addColorStop(1,d.floor);c.fillStyle=g;c.fillRect(0,0,900,430);oval(c,700,90,65,65,'#ffedbd');
 for(let row=0;row<2;row++)for(let j=-1;j<8;j++){const x=j*165+row*80,y=232+row*75;
 poly(c,[[x-80,430],[x-70,y+7],[x+16,y-60-j%3*22],[x+60,y-63],[x+115,y+10],[x+155,430]],row?d.shade:d.mount);
 poly(c,[[x+16,y-60-j%3*22],[x+60,y-63],[x+76,y-37],[x+46,y-46],[x+32,y-35]],d.floor)}
 c.fillStyle=d.floor;c.fillRect(0,355,900,75);sprite(c,k,680,290,4.4,wear);
}

function mapPreview(c,map){
 const d=maps[map];c.fillStyle=d.sky;c.fillRect(0,0,180,88);
 oval(c,137,22,13,13,map===2?'#fff6bd':'#ffedac');
 if(map===0){
  poly(c,[[0,50],[38,33],[63,43],[96,29],[120,40],[180,32],[180,88],[0,88]],'#438f82');
  poly(c,[[0,55],[63,46],[102,53],[180,42],[180,88],[0,88]],'#4ad3bd');
  poly(c,[[0,76],[53,59],[86,65],[132,63],[180,54],[180,88],[0,88]],'#ffe1a0');
  for(const x of [24,39,48])poly(c,[[x,69],[x-6,54],[x-2,46],[x+6,52],[x+7,66]],'#47cabb','#247c83');
 }else if(map===1){
  poly(c,[[0,39],[36,23],[63,24],[72,48],[110,41],[132,14],[165,16],[180,28],[180,88],[0,88]],'#ce8065');
  poly(c,[[0,62],[36,39],[60,41],[73,61],[111,65],[143,30],[180,34],[180,88],[0,88]],'#995465');
  poly(c,[[44,88],[67,54],[96,51],[139,88]],'#583e58');
  for(let i=0;i<10;i++)box(c,50+i*7,58+Math.sin(i/3)*3,7,5,1,'#ffca82');
 }else if(map===2){
  poly(c,[[0,61],[32,36],[63,54],[105,31],[143,54],[180,36],[180,88],[0,88]],'#65558e');
  for(const [x,y,r] of [[20,68,14],[50,75,19],[123,65,12],[149,80,18]]){box(c,x-2,y,4,13,2,'#f8cfdd');oval(c,x,y,r,r*.43,'#e49dc4');oval(c,x-3,y-1,3,2,'#fff1bf')}
  for(let i=0;i<14;i++)oval(c,7+i*13,34+(i*23)%45,1.7,1.7,'#fff7aa');
 }else{
  poly(c,[[0,60],[38,33],[68,52],[102,23],[130,51],[180,30],[180,88],[0,88]],d.mount);
  for(let i=0;i<7;i++)box(c,12+i*25,55+(i%3)*7,15,16,3,d.wall);
 }

 const patches=brushLayouts[map]||[];for(let i=0;i<Math.min(4,patches.length);i++){const p=patches[i],x=p[0]/W*180,y=56+(p[1]/H)*22;oval(c,x,y,10,4,'#2d7454');oval(c,x,y-2,7,3,'#98e8a3')}
}

function zombieSprite(c,z){
 c.save();c.translate(z.x,z.y);c.scale(Math.cos(z.heading)<0?-1:1,1);
 oval(c,0,14,15,5,'#25304745');
 box(c,-9,8,6,8,2,'#33374b');box(c,3,8,7,8,2,'#33374b');
 box(c,-10,-2,22,15,4,'#60537a');box(c,5,1,z.windup>0?18:13,5,2,'#a3cf79');
 box(c,-10,-18,21,19,5,'#365849');box(c,-9,-17,19,16,4,'#accf80');
 box(c,-8,-18,15,4,2,'#626878');box(c,-3,-11,4,4,1,'#fff4ba');box(c,5,-10,4,4,1,'#ffdb8f');
 box(c,1,-4,7,2,1,'#405044');c.restore();
}

// Процедурне листя: окремий стиль для кожної арени й напівпрозора верхня крона.
// Функція не використовує зовнішніх зображень, тому працює офлайн на GitHub Pages.
function drawBrush(c,patches,layer,map,playerPatches=[]){
 const palette=brushColors[map]||brushColors[5];
 c.save();
 for(const p of patches){
  const [x,y,w,h]=p,own=playerPatches.includes(p),waves=Math.sin((typeof left==='number'?left:0)*1.4+x*.13)*1.2;
  if(!layer){
   box(c,x+2,y+7,w,h-5,14,'#163d354a');box(c,x,y,w,h-7,14,palette[0]);
   for(let i=0;i<Math.max(5,Math.floor(w/15));i++){
    const px=x+11+(i*17)%(w-18),py=y+11+(i*29)%(h-23);
    oval(c,px,py,9+(i%3)*2,7,palette[1]);
    poly(c,[[px-6,py+5],[px+2,py-7],[px+8,py+5]],palette[0]);
   }
   if(p.length===5)for(let i=0;i<4;i++)star(c,x+18+i*31,y+12+i%2*23,3,'#f6ffb5');
  }else{
   c.globalAlpha=own?.24:.62;
   for(let i=0;i<Math.max(5,Math.floor(w/18));i++){
    const px=x+11+(i*19)%(w-12),py=y+9+(i*11)%(h-15);
    oval(c,px,py+waves,9+i%2*3,5.3,palette[1]);
    poly(c,[[px-4,py+waves],[px,py-7+waves],[px+4,py+waves]],i%3?'#b5ee8b':'#d9f6a7');
   }
   c.globalAlpha=1;
  }
 }
 c.restore();
}
