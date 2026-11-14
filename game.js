'use strict';
const $=id=>document.getElementById(id),world=$('world'),ctx=world.getContext('2d');
const profileKey='iskra.adventure.v1';
function newProfile(){return {cups:0,matches:0,hero:0,map:0,difficulty:0,rule:0,banner:0,roster:heroes.map(()=>({xp:0,played:0,training:0,forge:0,power:0,wear:0,charm:0}))}}
function readProfile(){
 const p=newProfile(),int=(n,max)=>Number.isInteger(n)&&n>=0&&n<=max?n:0;
 try{const raw=JSON.parse(localStorage.getItem(profileKey));if(!raw)return p;
 for(const [key,max] of Object.entries({cups:1e9,matches:1e8,hero:heroes.length-1,map:maps.length-1,difficulty:2,rule:modes.length-1,banner:2}))p[key]=int(raw[key],max);
 if(maps[p.map].unlock>p.matches)p.map=0;
 p.roster.forEach((r,i)=>{const saved=raw.roster?.[i]||{};r.training=int(saved.training,3);r.forge=int(saved.forge,3);r.power=int(saved.power,3);r.xp=int(saved.xp,1e9);r.played=int(saved.played,1e8);r.wear=int(saved.wear,levelOf(r.xp)>=3?2:r.played?1:0);r.charm=int(saved.charm,levelOf(r.xp)>=2?1:0)})
 }catch{}return p;
}
const profile=readProfile();
function save(){try{localStorage.setItem(profileKey,JSON.stringify(profile))}catch{$('storageMsg').hidden=false}}
let state='menu',units=[],gems=[],loot=[],shots=[],meteors=[],rings=[],flag,previewGem,left,spawnIn,lootIn,supply,blocks,background;
let moveStick=[0,0],pointer=null,held=false,last=performance.now();
let brush=[],temporaryBrush=[],particles=[];
const keys=new Set(),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const blocked=(x,y,r)=>x<r||x>W-r||y<r||y>H-r||blocks.some(([a,b,w,h])=>x>a-r&&x<a+w+r&&y>b-r&&y<b+h+r);
function options(id,rows,value){
 const el=$(id);el.replaceChildren(...rows.map(([label,locked],i)=>{const o=new Option(label,i);o.disabled=Boolean(locked);return o}));el.value=value;
}
const invasionGoals=[
 {gems:20,kills:15,seconds:120},
 {gems:30,kills:25,seconds:150},
 {gems:40,kills:40,seconds:180}
];
let kills=0,eliminations=0,combo=0,comboClock=0;
const invasion=()=>profile.rule===2;
const quota=()=>invasionGoals[profile.difficulty];
const cleared=()=>units[0].score>=quota().gems&&kills>=quota().kills;
function tally(){return '◆ '+Math.min(units[0].score,quota().gems)+'/'+quota().gems+' · Зомбі '+Math.min(kills,quota().kills)+'/'+quota().kills}
function zombieSpawn(z){
 const player=units[0];
 const edges=[{x:38,y:38},{x:W-38,y:38},{x:38,y:H-38},{x:W-38,y:H-38},{x:W/2,y:H-28},{x:W/2,y:28}];
 const choices=edges.filter(p=>dist(p,player)>220&&!blocked(p.x,p.y,16));
 Object.assign(z,(choices.length?choices:edges)[Math.floor(Math.random()*(choices.length||edges.length))]);
 z.hp=z.max;z.dead=0;z.shield=0;z.windup=0;z.cd=.5;z.way=null;z.lastSeen=null;
}
function hunt(z,dt){
 const player=units[0];
 if(player.dead){z.windup=0;return}
 const sees=visible(z,player);if(sees)z.lastSeen={x:player.x,y:player.y};
 const near=dist(z,player)<32&&sees;
 if(z.windup>0){
  z.windup=Math.max(0,z.windup-dt);
  if(!z.windup){
   if(near){if(player.dome){if(player.heal){player.hp=Math.min(player.max,player.hp+1);player.heal=false}}else hit(player,1)}
   z.cd=1.1;
  }
  return;
 }
 if(near){if(z.cd<=0)z.windup=.38;return}
 z.nav-=dt;
 if(!z.way||z.nav<=0||dist(z,z.way)<3){const goal=sees?player:(z.lastSeen&&dist(z,z.lastSeen)>30?z.lastSeen:closest(z,gems)||{x:W/2,y:H/2});z.way=waypoint(z,goal);z.nav=.35}
 const dx=z.way.x-z.x,dy=z.way.y-z.y;z.heading=Math.atan2(dy,dx);
 move(z,dx,dy,Math.min(82+profile.difficulty*12,Math.hypot(dx,dy)/dt),dt);
}
const cupRewards=[4,7,10];
const upgradeCosts=[4,8,12];
function buyUpgrade(slot){
 if(state!=='menu')return;
 const r=profile.roster[profile.hero],cost=upgradeCosts[r[slot]];
 if(!cost||profile.cups<cost||(slot==='forge'&&levelOf(r.xp)<2))return;
 profile.cups-=cost;r[slot]++;save();lobby();
}
function workshop(r){
 for(const [slot,name] of [['training','Здоров’я +1'],['forge','Амулет · відновлення −0,5 с'],['power','Сила атаки +15%']]){
  const button=$(slot),cost=upgradeCosts[r[slot]],locked=slot==='forge'&&levelOf(r.xp)<2;
  button.textContent=name+' · '+r[slot]+'/3 · '+(locked?'з рівня 2':cost?cost+' 🏆':'Максимум');
  button.disabled=locked||!cost||profile.cups<cost;
  button.onclick=()=>buyUpgrade(slot);
 }
}
function lobby(){
 state='menu';document.body.classList.remove('playing');$('battle').hidden=true;$('lobby').hidden=false;
 const k=profile.hero,h=heroes[k],r=profile.roster[k],level=levelOf(r.xp),m=maps[profile.map];
 $('career').textContent='🏆 '+profile.cups+' · Бої: '+profile.matches;workshop(r);
 $('heroName').textContent=h.name;
 $('role').textContent=roles[k];
 $('skillName').textContent=h.ability;
 $('lobby').style.setProperty('--hero-color',h.color);
 const portrait=$('portrait').getContext('2d');
 portrait.clearRect(0,0,420,380);
 sprite(portrait,k,223,209,6.7,r.wear);
 $('mapInfo').textContent=m.hint+' 🌿 У заростях тебе не бачать здалеку; стрільба тимчасово видає позицію.';
 if($('activeMapLabel'))$('activeMapLabel').textContent=m.name;
 $('maps').replaceChildren(...maps.map((map,i)=>{
   const button=document.createElement('button'), art=document.createElement('canvas');
   const name=document.createElement('strong'), note=document.createElement('small');
   art.width=180;art.height=88;mapPreview(art.getContext('2d'),i);
   button.disabled=map.unlock>profile.matches;button.setAttribute('aria-pressed',profile.map===i);
   name.textContent=map.name;note.textContent=button.disabled?'Після '+map.unlock+(map.unlock===1?' бою':' боїв'):profile.map===i?'✓ Обрано':'Обрати';
   button.append(art,name,note);button.onclick=()=>{profile.map=i;save();lobby()};return button;
 }));
 $('heroes').replaceChildren(...heroes.map((hero,i)=>{const b=document.createElement('button'),c=document.createElement('canvas');c.width=112;c.height=108;const brush=c.getContext('2d');sprite(brush,i,56,60,1.85,profile.roster[i].wear);b.append(c,hero.name);b.setAttribute('aria-pressed',i===k);b.onclick=()=>{profile.hero=i;save();lobby()};return b}));
 $('desc').textContent=h.hint;const limit=level===1?30:85;
 $('bar').style.width=Math.min(100,r.xp/limit*100)+'%';$('level').textContent='Рівень '+level+' · '+r.xp+' досвіду'+(level<3?' · До '+(level===1?'амулета':'зоряного образу')+' ще '+(limit-r.xp):' · Зоряний образ відкрито');
 options('difficulty',tiers.map((x,i)=>[invasion()?x+' · '+invasionGoals[i].kills+' зомбі':x+' · '+(2+i)+' боти']),profile.difficulty);options('rule',modes.map(x=>[x]),profile.rule);options('banner',flags.map(x=>[x]),profile.banner);
 options('wear',[['Базовий образ'],['Золота стрічка'+(!r.played?' · за перший бій':''),!r.played],['Зоряна стрічка'+(level<3?' · рівень 3':''),level<3]],r.wear);
 options('charm',[['Без амулета'],[h.item+(level<2?' · рівень 2':''),level<2]],r.charm);
 $('itemInfo').textContent=h.item+' · '+h.perk;
 $('heroStats').textContent='♥ '+(h.hp+r.training)+' здоров’я · ⚡ '+h.speed+' швидкість · 🎯 '+Math.round(1/h.rate*10)/10+' атаки/с · ✦ супер: '+h.cd+' с · Сила '+(100+r.power*15)+'%';
 $('mission').textContent=invasion()?'Збери '+quota().gems+' кристалів і переможи '+quota().kills+' зомбі за '+quota().seconds+' с. Відступай, коли зомбі замахується.':profile.rule===1?'Забери прапор і повернись до своєї бази. Перший із трьома доставками перемагає.':profile.rule===3?'Арена мисливців: першим здійсни 8 нокаутів. Після поразки повертайся до бою.':'Першим збери 7 кристалів. '+(profile.map===1?'У каньйоні при нокауті випадає один кристал.':'Після нокауту зібране зберігається.');
}
for(const id of ['difficulty','rule','banner','wear','charm'])$(id).onchange=()=>{const target=['wear','charm'].includes(id)?profile.roster[profile.hero]:profile;target[id]=Number($(id).value);save();lobby()};
function clearInput(){keys.clear();moveStick=[0,0];pointer=null;held=false;$('stick').firstElementChild.style.transform=''}
function point(){for(let i=0;i<200;i++){const p={x:85+Math.random()*750,y:58+Math.random()*425};if(!blocked(p.x,p.y,32))return p}return {x:280,y:270}}
function start(){
 blocks=maps[profile.map].blocks;brush=brushLayouts[profile.map].map(b=>[...b]);temporaryBrush=[];particles=[];units=[...bases,{x:80,y:450},{x:455,y:35}].slice(0,3+profile.difficulty).map((base,i)=>{const kind=i?Math.floor(Math.random()*heroes.length):profile.hero,h=heroes[kind];return {...base,base,kind,i,hp:h.hp+(i?0:profile.roster[kind].training),max:h.hp+(i?0:profile.roster[kind].training),slow:0,hits:0,boost:0,score:0,picks:0,cd:i ? 0.6 : 0,cool:0,dome:0,dead:0,shield:1,angle:i?Math.PI:0,heading:i?Math.PI:0,nav:0,way:null,think:.7+i*.3,aim:null,heal:false,reveal:0,lastSeen:null}});
 kills=0;eliminations=0;combo=0;comboClock=0;
 if(invasion()){
  units.slice(1).forEach(z=>{z.zombie=true;z.max=2;zombieSpawn(z)});
 }
 gems=(profile.rule===1||profile.rule===3)?[]:Array.from({length:5},point);loot=[];shots=[];meteors=[];rings=[];left=invasion()?quota().seconds:90;supply={...point(),wait:12};spawnIn=2;lootIn=5;previewGem=point();flag={x:460,y:270,carrier:null};
 background=document.createElement('canvas');background.width=W;background.height=H;terrain(background.getContext('2d'),profile.map);
 clearInput();state='play';$('controls').hidden=false;$('lobby').hidden=true;$('battle').hidden=false;$('modal').hidden=true;document.body.classList.add('playing');window.scrollTo(0,0);hud();draw();
}
$('start').onclick=start;
function modal(title,message,next){$('controls').hidden=true;$('victoryFlag').hidden=true;$('title').textContent=title;$('summary').textContent=message;$('next').textContent=next;$('modal').hidden=false;$('leave').hidden=state!=='pause';$('equip').hidden=true}
function pause(){if(state!=='play')return;state='pause';clearInput();$('overline').textContent=maps[profile.map].name;modal('Пауза','Бій чекає на тебе.','Продовжити')}
$('pause').onclick=pause;$('leave').onclick=lobby;$('next').onclick=()=>{if(state==='pause'){state='play';$('controls').hidden=false;$('modal').hidden=true}else lobby()};
window.addEventListener('resize',()=>{if(state==='play'||state==='pause')draw()});window.addEventListener('orientationchange',()=>{setTimeout(()=>{if(state==='play'||state==='pause')draw()},120)});window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
function finish(){
 if(state!=='play')return;state='result';clearInput();const a=units[0],best=Math.max(...units.filter(b=>!b.zombie).map(b=>b.score)),win=invasion()?cleared():a.score===best&&units.filter(b=>b.score===best).length===1;
 const r=profile.roster[a.kind],prev=levelOf(r.xp),xp=12+Math.min(14,a.picks*2)+(win?8:0);const reward=win?cupRewards[profile.difficulty]:0;profile.cups+=reward;r.xp+=xp;r.played++;profile.matches++;save();
 const earned=[];if(r.played===1)earned.push(['wear',1,'Золота стрічка']);if(prev<2&&levelOf(r.xp)>=2)earned.push(['charm',1,heroes[a.kind].item]);if(prev<3&&levelOf(r.xp)===3)earned.push(['wear',2,'Зоряна стрічка']);
 const arena=maps.find(m=>m.unlock===profile.matches);
 $('overline').textContent=heroes[a.kind].name+' · +'+xp+' досвіду · +'+reward+' 🏆';
 modal(win?'Перемога!':invasion()?'Час вичерпано':a.score===best?'Нічия':'Бій завершено', (invasion()?tally():'Рахунок: '+units.map(b=>b.score).join(' / '))+'. '+(arena?'Нова арена: '+arena.name+'. ':'')+earned.map(e=>'Здобич: '+e[2]+'.').join(' '),'До героїв');
 if(win){const c=$('victoryFlag').getContext('2d');c.clearRect(0,0,80,55);banner(c,24,50,profile.banner,1.45);$('victoryFlag').hidden=false}
 if(earned.length){$('equip').hidden=false;$('equip').textContent='Одягнути · '+earned.map(e=>e[2]).join(' і ');$('equip').onclick=()=>{for(const [slot,id] of earned)r[slot]=id;save();$('equip').hidden=true;$('summary').textContent+=' Спорядження одягнено.'}}
}
function move(a,dx,dy,speed,dt){const len=Math.max(1,Math.hypot(dx,dy));const x=a.x+dx/len*speed*dt,y=a.y+dy/len*speed*dt;if(!blocked(x,a.y,14))a.x=x;if(!blocked(a.x,y,14))a.y=y}
function waypoint(a,g){const size=20,cols=46,rows=27,index=(x,y)=>Math.floor(y/size)*cols+Math.floor(x/size),start=index(a.x,a.y),goal=index(g.x,g.y);if(start===goal)return g;const queue=[start],prev=new Map([[start,-1]]);for(let k=0;k<queue.length;k++){const id=queue[k];if(id===goal){let n=id;while(prev.get(n)!==start)n=prev.get(n);return {x:n%cols*size+10,y:Math.floor(n/cols)*size+10}}for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=id%cols+dx,y=Math.floor(id/cols)+dy,n=y*cols+x;if(x<0||y<0||x>=cols||y>=rows||prev.has(n)||blocked(x*size+10,y*size+10,15))continue;prev.set(n,id);queue.push(n)}}return g}
function inBrush(u,patch){return u.x>=patch[0]&&u.x<=patch[0]+patch[2]&&u.y>=patch[1]&&u.y<=patch[1]+patch[3]}
function brushAt(u){return [...brush,...temporaryBrush].filter(p=>inBrush(u,p))}
function hiddenByBrush(observer,target){
 if(!target || !Number.isInteger(target.kind) || target.dead || target.reveal>0 || dist(observer,target)<88)return false;
 const hiding=brushAt(target);if(!hiding.length)return false;
 return !hiding.some(p=>inBrush(observer,p));
}
function visible(a,b){
 if(hiddenByBrush(a,b))return false;
 const n=Math.ceil(dist(a,b)/10);
 for(let i=1;i<n;i++)if(blocked(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n,4))return false;
 return true;
}
function seenOpponents(a){return opponents(a).filter(b=>visible(a,b))}
function sparkle(x,y,color,count=8,power=75){for(let i=0;i<count;i++){const dir=Math.random()*Math.PI*2,spd=(.3+Math.random())*power;particles.push({x,y,vx:Math.cos(dir)*spd,vy:Math.sin(dir)*spd,t:.25+Math.random()*.32,color,r:1.5+Math.random()*3})}if(particles.length>260)particles.splice(0,particles.length-260)}
function closest(a,list){return list.reduce((prev,v)=>!prev||dist(a,v)<dist(a,prev)?v:prev,null)}
function opponents(a){return units.filter(b=>b!==a&&!b.dead)}
function fire(a){if(a.cd>0||a.dead)return;const targets=seenOpponents(a).filter(b=>dist(a,b)<=418);const enemy=a.i&&profile.rule===1&&profile.difficulty&&targets.includes(flag.carrier)?flag.carrier:closest(a,targets);if(!enemy||dist(a,enemy)>418)return;
 const error=a.i?[.26,.095,.035][profile.difficulty]*(Math.random()*2-1):0;a.angle=Math.atan2(enemy.y-a.y,enemy.x-a.x)+error;
 const count=a.kind===3?3:(a.kind===6||a.kind===7)?2:1;
 for(let n=0;n<count;n++){
  const angle=a.angle+(n-(count-1)/2)*(a.kind===6?.22:.17);
  shots.push({x:a.x,y:a.y,owner:a,dx:Math.cos(angle),dy:Math.sin(angle),t:1.16,damage:a.kind===4?2:a.kind===6?.75:a.kind===7?.85:1,speed:a.kind===6?420:a.kind===7?400:360,slow:a.kind===3?1.3:0,color:heroes[a.kind].color});
 }
 a.reveal=a.kind===6?.95:1.35;sparkle(a.x+Math.cos(a.angle)*20,a.y+Math.sin(a.angle)*20,heroes[a.kind].color,3,25);
 a.cd=a.i?[1.28,.9,.72][profile.difficulty]:heroes[a.kind].rate}
function hit(b,n,attacker){if(b.dead||b.shield>0||b.dome>0)return;const upgrade=attacker&&!attacker.i&&!attacker.zombie?profile.roster[attacker.kind].power:0;b.hp-=n*(1+upgrade*.15);b.reveal=Math.max(b.reveal||0,.5);sparkle(b.x,b.y,heroes[attacker?.kind]?.color||'#ffda8d',6);if(attacker?.kind===5&&!attacker.i){attacker.hits=(attacker.hits||0)+1;if(attacker.hits%3===0)attacker.hp=Math.min(attacker.max,attacker.hp+1)}if(b.hp>0)return;b.dead=2.2;b.dome=0;b.way=null;rings.push({x:b.x,y:b.y,r:32,t:.4,color:'#ffe7a1'});
 if(b.zombie){kills++;gems.push({x:b.x,y:b.y});return}
 if(profile.rule===3&&attacker&&attacker!==b&&!attacker.zombie){attacker.score++;attacker.picks++;if(!attacker.i){eliminations++;combo=comboClock>0?combo+1:1;comboClock=7;}}
 if(flag.carrier===b){flag={x:b.x,y:b.y,carrier:null}}
 if(profile.rule===0&&profile.map===1&&b.score){b.score--;gems.push({x:b.x,y:b.y})}}
function collect(a){const idx=gems.findIndex(g=>dist(g,a)<22);if(idx<0)return;const gem=gems.splice(idx,1)[0];a.score++;a.picks++;sparkle(gem.x,gem.y,'#8cffe2',11,85)}
function cast(a){
 if(state!=='play'||a.dead||a.cool>0)return;const h=heroes[a.kind],charmed=!a.i&&profile.roster[a.kind].charm;
 if(a.kind===0){const struck=new Set();for(let j=0;j<36;j++){const x=a.x+4*Math.cos(a.heading),y=a.y+4*Math.sin(a.heading);if(blocked(x,y,14))break;a.x=x;a.y=y;if(j%6===0)rings.push({x,y,r:15,t:.4,color:h.color});for(const b of opponents(a)){if(!struck.has(b)&&dist(a,b)<30){hit(b,2,a);struck.add(b)}}if(charmed&&(profile.rule===0||invasion())){collect(a);if(invasion()?cleared():a.score>=7){finish();break}}}}
 else if(a.kind===1){a.dome=3;a.heal=charmed}
 else if(a.kind===3){for(const b of opponents(a)){if(dist(a,b)<145){b.slow=Math.max(b.slow,3.5);hit(b,1,a)}}rings.push({x:a.x,y:a.y,r:140,t:.4,color:h.color});if(charmed)a.hp=Math.min(a.max,a.hp+2)}
 else if(a.kind===4){for(const b of opponents(a)){if(dist(a,b)<122)hit(b,3,a)}rings.push({x:a.x,y:a.y,r:122,t:.4,color:h.color});if(charmed)a.cd=0}
 else if(a.kind===5){a.hp=Math.min(a.max,a.hp+3);for(const b of opponents(a)){if(dist(a,b)<108)hit(b,2,a)}if(charmed)a.dome=1.5;rings.push({x:a.x,y:a.y,r:108,t:.4,color:h.color})}
 else if(a.kind===6){const w=168,hg=124;temporaryBrush.push([Math.max(14,Math.min(W-w-14,a.x-w/2)),Math.max(14,Math.min(H-hg-14,a.y-hg/2)),w,hg,9]);a.hp=Math.min(a.max,a.hp+(charmed?3:2));if(charmed)a.dome=1.15;rings.push({x:a.x,y:a.y,r:86,t:.4,color:'#acffb1'});sparkle(a.x,a.y,'#d5ff9f',26,115)}
 else if(a.kind===7){const struck=new Set();for(let j=0;j<32;j++){const x=a.x+4.2*Math.cos(a.heading),y=a.y+4.2*Math.sin(a.heading);if(blocked(x,y,14))break;a.x=x;a.y=y;if(j%7===0)rings.push({x,y,r:16,t:.35,color:h.color});for(const b of opponents(a)){if(!struck.has(b)&&dist(a,b)<34){hit(b,2,a);struck.add(b)}}}sparkle(a.x,a.y,'#ffb8d5',18,95);if(charmed){a.boost=Math.max(a.boost,3);a.hp=Math.min(a.max,a.hp+1)}}
 else{const b=closest(a,seenOpponents(a));if(!b)return;meteors.push({owner:a,x:b.x,y:b.y,t:.55,r:85,power:3});if(charmed)meteors.push({owner:a,x:b.x,y:b.y,t:1.05,r:65,power:1})}
 a.cool=h.cd-(charmed?0.5*profile.roster[a.kind].forge:0);
}
function objective(a){
 if(profile.rule===1)return flag.carrier===a?a.base:(flag.carrier&&visible(a,flag.carrier)?flag.carrier:flag);
 if(profile.rule===3)return closest(a,seenOpponents(a))||closest(a,loot)||{x:460,y:270};
 if(!profile.difficulty)return closest(a,gems)||{x:460,y:270};
 let best=null,min=Infinity;
 for(const gem of gems){
  const travel=dist(a,gem);
  const contested=seenOpponents(a).some(other=>dist(other,gem)+30<travel);
  const cost=travel+(visible(a,gem)?0:55)+(contested?85:0);
  if(cost<min){min=cost;best=gem}
 }
 return best||{x:460,y:270};
}
function tactic(a){
 const tier=profile.difficulty,enemy=closest(a,seenOpponents(a));let target=objective(a);
 if(tier===2){const danger=meteors.find(m=>m.owner!==a&&dist(a,m)<m.r);if(danger){const safe=[{x:a.x+95,y:a.y},{x:a.x-95,y:a.y},{x:a.x,y:a.y+95},{x:a.x,y:a.y-95}].filter(p=>!blocked(p.x,p.y,16)).sort((u,v)=>dist(v,danger)-dist(u,danger));if(safe.length)return safe[0]}
 const leader=seenOpponents(a).find(b=>b.score>=(profile.rule===1?2:profile.rule===3?6:6));if(leader&&dist(a,leader)<240&&a.score<(profile.rule===1?2:6))target=leader}
 if(tier&&enemy&&a.hp<=2&&dist(a,enemy)<210){const heart=closest(a,loot.filter(p=>p.kind==='heart'||p.kind==='supply'));if(heart)return heart;const cover=blocks.flatMap(([x,y,w,h])=>[{x:x-24,y:y+h/2},{x:x+w+24,y:y+h/2},{x:x+w/2,y:y-24},{x:x+w/2,y:y+h+24}]).filter(p=>!blocked(p.x,p.y,16)&&!visible(enemy,p));return closest(a,cover)||target}return target;
}
function bot(a,dt){a.nav-=dt;a.think-=dt;if(!a.way||a.nav<=0||dist(a,a.way)<3){a.way=waypoint(a,tactic(a));a.nav=.45}
 const dx=a.way.x-a.x,dy=a.way.y-a.y;if(dx||dy)a.heading=Math.atan2(dy,dx);move(a,dx,dy,Math.min([88,111,138][profile.difficulty]*(a.boost?1.3:1)*(a.slow>.01?.65:1),Math.hypot(dx,dy)/dt),dt);
 if(a.think<=0){a.think=[.85,.42,.23][profile.difficulty];const b=closest(a,seenOpponents(a));if(b&&dist(a,b)<[210,275,330][profile.difficulty]){fire(a);if(profile.difficulty&&(!a.cool)&&((a.kind===0||a.kind===7)?dist(a,b)<130:a.kind===1?visible(a,b):a.kind===2?dist(a,b)<240:dist(a,b)<160)){if(a.kind===0||a.kind===7)a.heading=Math.atan2(b.y-a.y,b.x-a.x);cast(a)}}}}
function update(dt){
 left-=dt;spawnIn-=dt;lootIn-=dt;comboClock=Math.max(0,comboClock-dt);if(comboClock===0)combo=0;
 supply.wait-=dt;
 if(supply.wait<=0){
  loot.push({x:supply.x,y:supply.y,kind:'supply'});
  supply={...point(),wait:20};
 }if(profile.rule!==1&&profile.rule!==3&&spawnIn<=0&&gems.length<8){gems.push(previewGem);previewGem=point();spawnIn=1.8}
 if(lootIn<=0){if(loot.length<3)loot.push({...point(),kind:['heart','spark','wind'][Math.floor(Math.random()*3)]});lootIn=5}
 for(let i=temporaryBrush.length-1;i>=0;i--){temporaryBrush[i][4]-=dt;if(temporaryBrush[i][4]<=0)temporaryBrush.splice(i,1)}
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=50*dt;p.t-=dt}particles=particles.filter(p=>p.t>0);
 for(const a of units){a.boost=Math.max(0,a.boost-dt);a.cool=Math.max(0,a.cool-dt);a.cd-=dt;a.shield-=dt;a.dome=Math.max(0,a.dome-dt);a.slow=Math.max(0,(a.slow||0)-dt);a.reveal=Math.max(0,(a.reveal||0)-dt);
 if(a.dead){a.dead=Math.max(0,a.dead-dt);if(!a.dead&&a.zombie){zombieSpawn(a)}else if(!a.dead){Object.assign(a,a.base);a.hp=a.max;a.shield=1.4}continue}
 if(a.zombie){hunt(a,dt);continue}
 if(a.i)bot(a,dt);else{const dx=moveStick[0]+Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA')),dy=moveStick[1]+Number(keys.has('ArrowDown')||keys.has('KeyS'))-Number(keys.has('ArrowUp')||keys.has('KeyW'));if(dx||dy)a.heading=Math.atan2(dy,dx);move(a,dx,dy,heroes[a.kind].speed*(a.boost?1.3:1)*(a.slow>.01?.65:1),dt);if(held||keys.has('Space'))fire(a)}
 if(profile.rule===1){if(!flag.carrier&&dist(a,flag)<22)flag.carrier=a;if(flag.carrier===a&&dist(a,a.base)<29){a.score++;a.picks++;flag={x:460,y:270,carrier:null}}}else if(profile.rule===0||invasion())collect(a);
 if(invasion()?cleared():a.score>=(profile.rule===1?3:profile.rule===3?8:7)){finish();return}
 const j=loot.findIndex(p=>dist(a,p)<20);if(j>=0){const item=loot.splice(j,1)[0];if(item.kind==='supply'){a.boost=4;a.hp=Math.min(a.max,a.hp+2);a.cool=Math.max(0,a.cool-3)}else if(item.kind==='heart')a.hp=Math.min(a.max,a.hp+2);else if(item.kind==='wind')a.boost=4;else a.cool=Math.max(0,a.cool-3);rings.push({x:a.x,y:a.y,t:.4,r:26,color:item.kind==='heart'?'#ff91a4':'#ffe889'})}}
 for(const m of meteors){m.t-=dt;if(m.t<=0){opponents(m.owner).filter(b=>dist(m,b)<=m.r).forEach(b=>hit(b,m.power,m.owner));rings.push({...m,color:'#ffd2ff',t:.4})}}meteors=meteors.filter(m=>m.t>0);
 for(const s of shots){s.t-=dt;s.x+=s.dx*(s.speed||360)*dt;s.y+=s.dy*(s.speed||360)*dt;if(blocked(s.x,s.y,4))s.t=0;if(s.t<=0)continue;
 const b=opponents(s.owner).find(b=>dist(s,b)<(b.dome?36:17));if(b){if(b.dome){if(b.heal){b.hp=Math.min(b.max,b.hp+1);b.heal=false}rings.push({x:s.x,y:s.y,t:.4,r:11,color:'#fff2b1'})}else{hit(b,s.damage||1,s.owner);if(s.slow)b.slow=Math.max(b.slow,s.slow)}s.t=0}}
 shots=shots.filter(s=>s.t>0);rings=rings.filter(r=>(r.t-=dt)>0);if(left<=0||(invasion()&&cleared()))finish();else hud();
}
function hud(){const a=units[0];$('time').textContent=Math.ceil(left)+' с';$('score').textContent=invasion()?tally():(profile.rule===1?'⚑ ':profile.rule===3?'⚔ ':'◆ ')+a.score+'/'+(profile.rule===1?3:profile.rule===3?8:7)+' · Суперники '+units.slice(1).map(b=>b.score).join(' / ');$('streak').textContent=profile.rule===3&&combo>1?'⚡ Серія ×'+combo:'';$('streak').hidden=!(profile.rule===3&&combo>1);const covered=brushAt(a).length>0;$('stealth').hidden=!covered;$('stealth').textContent=a.reveal>0?'👀 Позицію видано':'🌿 У кущах';$('stealth').dataset.revealed=String(a.reveal>0);$('super').textContent=heroes[a.kind].ability+(a.cool?' · '+Math.ceil(a.cool)+' с':' ✦');$('super').disabled=Boolean(a.cool||a.dead)}
function draw(){
 const width=world.clientWidth,height=world.clientHeight;if(!width||!height)return;
 const ratio=Math.min(2,window.devicePixelRatio||1),pw=Math.round(width*ratio),ph=Math.round(height*ratio);
 if(world.width!==pw||world.height!==ph){world.width=pw;world.height=ph}
 const s=Math.max(width/W,height/H),vw=width/s,vh=height/s,a=units[0];
 const camX=Math.max(0,Math.min(W-vw,a.x-vw/2)),camY=Math.max(0,Math.min(H-vh,a.y-vh/2));
 ctx.setTransform(s*ratio,0,0,s*ratio,-camX*s*ratio,-camY*s*ratio);ctx.drawImage(background,0,0);drawBrush(ctx,brush,0,profile.map);drawBrush(ctx,temporaryBrush,0,5);
 for(const b of units){if(b.zombie)continue;const p=b.base;oval(ctx,p.x,p.y,28,14,b.i?'#944e623d':'#33968960');banner(ctx,p.x-16,p.y-2,b.i?(profile.banner+b.i)%3:profile.banner,.63)}
 if(profile.map===2&&(profile.rule===0||invasion())&&gems.length<8){for(let i=0;i<5;i++){const t=left*2+i*1.25;oval(ctx,previewGem.x+Math.cos(t)*14,previewGem.y+Math.sin(t)*8,2,2,'#fff094')}}
 for(const g of gems){const x=g.x,y=g.y+Math.sin(left*3+g.x)*2;poly(ctx,[[x,y-12],[x+9,y-3],[x+7,y+4],[x,y+12],[x-9,y+1],[x-7,y-6]],'#49ffc9','#246d70');poly(ctx,[[x,y-10],[x+7,y-3],[x,y+10]],'#18b9aa')}
 if(supply.wait<=3){ctx.strokeStyle='#ffef99';ctx.lineWidth=3;ctx.beginPath();ctx.arc(supply.x,supply.y,16+supply.wait*5,0,Math.PI*2);ctx.stroke();star(ctx,supply.x,supply.y,8,'#ffef99')}
 for(const p of loot){if(p.kind==='supply'){box(ctx,p.x-13,p.y-10,26,20,4,'#99532f');box(ctx,p.x-12,p.y-11,24,8,2,'#ffd367');star(ctx,p.x,p.y+1,6,'#fff3af');continue}oval(ctx,p.x,p.y,12,12,p.kind==='heart'?'#b64b69':p.kind==='wind'?'#197f94':'#977827');ctx.fillStyle='#fff2c3';ctx.font='bold 16px system-ui';ctx.textAlign='center';ctx.fillText(p.kind==='heart'?'♥':p.kind==='wind'?'»':'ϟ',p.x,p.y+5)}
 for(const m of meteors){oval(ctx,m.x,m.y,m.r,m.r,'#cb4ba44d');star(ctx,m.x,m.y-Math.min(.55,m.t)*100,12,'#fff2a8')}
 for(const b of units){if(b.dead||(b!==a&&hiddenByBrush(a,b)))continue;if(b.boost)oval(ctx,b.x,b.y+12,21,6,'#80f9ff');if(b.slow>0)oval(ctx,b.x,b.y+16,23,5,'#b1edff');if(b.zombie){if(b.windup>0)oval(ctx,b.x,b.y,26,14,'#ff714963');zombieSprite(ctx,b)}else sprite(ctx,b.kind,b.x,b.y,.85,b.i?0:profile.roster[b.kind].wear,Math.cos(b.heading)<0);
 box(ctx,b.x-16,b.y-30,32,5,2,'#263647');box(ctx,b.x-15,b.y-29,30*b.hp/b.max,3,1,b.i?'#ff927e':'#73fde1');
 if(!b.i)poly(ctx,[[b.x-5,b.y-39],[b.x+5,b.y-39],[b.x,b.y-34]],'#fffacc','#26404e');
 if(b.dome||b.shield>0){const r=b.dome?36:25;oval(ctx,b.x,b.y,r,r,b.dome?'#ffd66532':'#affff318');ctx.strokeStyle=b.dome?'#ffda75':'#aafff3';ctx.lineWidth=2;ctx.stroke()}}
 drawBrush(ctx,brush,1,profile.map,brushAt(a));drawBrush(ctx,temporaryBrush,1,5,brushAt(a));
 if(brushAt(a).length){ctx.strokeStyle='#efff9c';ctx.lineWidth=2;ctx.setLineDash([4,5]);ctx.beginPath();ctx.arc(a.x,a.y+7,25,0,Math.PI*2);ctx.stroke();ctx.setLineDash([])}
 if(profile.rule===1){const p=flag.carrier||flag;banner(ctx,p.x+6,p.y-(flag.carrier?14:0),profile.banner,.95);
 if(a===flag.carrier){ctx.strokeStyle='#fff1a2';ctx.lineWidth=3;ctx.setLineDash([4,9]);ctx.beginPath();ctx.moveTo(a.x,a.y+18);ctx.lineTo(a.base.x,a.base.y);ctx.stroke();ctx.setLineDash([])}else if(Math.abs(p.x-a.x)>vw/2-25){const side=p.x>a.x?1:-1;banner(ctx,Math.max(camX+12,Math.min(camX+vw-30,a.x+side*vw)),camY+vh/2,profile.banner,.6)}}
 for(const shot of shots)oval(ctx,shot.x,shot.y,shot.damage>1?8:shot.slow?4:5,shot.damage>1?8:5,shot.color||heroes[shot.owner.kind].color);
 for(const p of particles)oval(ctx,p.x,p.y,p.r*Math.min(1,p.t*3),p.r*Math.min(1,p.t*3),p.color);
 for(const r of rings){ctx.strokeStyle=r.color;ctx.lineWidth=3;ctx.beginPath();ctx.arc(r.x,r.y,Math.max(.1,r.r*(1-r.t/.4)),0,Math.PI*2);ctx.stroke()}
 if(a.dead){ctx.fillStyle='#193443';ctx.font='bold 20px system-ui';ctx.textAlign='center';ctx.fillText('Повернення за '+Math.ceil(a.dead)+' с',camX+vw/2,camY+vh/2)}
}
window.addEventListener('keydown',e=>{if(state!=='play')return;if(['Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.code==='KeyE'&&!e.repeat)cast(units[0]);if(e.code==='Escape')pause()});window.addEventListener('keyup',e=>keys.delete(e.code));
const pad=$('stick');function slide(e){if(e.pointerId!==pointer)return;const r=pad.getBoundingClientRect(),travel=r.width*.29,x=(e.clientX-r.left-r.width/2)/travel,y=(e.clientY-r.top-r.height/2)/travel,d=Math.max(1,Math.hypot(x,y));moveStick=[x/d,y/d];pad.firstElementChild.style.transform='translate('+moveStick[0]*travel+'px,'+moveStick[1]*travel+'px)'}
pad.onpointerdown=e=>{if(pointer!==null||state!=='play')return;pointer=e.pointerId;pad.setPointerCapture(pointer);slide(e)};pad.onpointermove=slide;pad.onlostpointercapture=()=>{pointer=null;moveStick=[0,0];pad.firstElementChild.style.transform=''};
$('fire').onpointerdown=e=>{held=true;e.currentTarget.setPointerCapture(e.pointerId)};$('fire').onlostpointercapture=()=>held=false;$('super').onclick=()=>cast(units[0]);
$('help').textContent=matchMedia('(pointer:coarse)').matches?'Джойстик — рух · Утримуй «Вогонь» для автоатаки':'WASD або стрілки — рух · Пробіл — атака · E — здібність';
// Простий обмін прогресом між різними доменами (Netlify → GitHub Pages).
$('exportProgress').onclick=()=>{
 $('backupText').value=JSON.stringify(profile);
 $('backupText').select();
 $('backupStatus').textContent='Код готовий. Скопіюй і збережи його перед переїздом на інший сайт.';
};
$('importProgress').onclick=()=>{
 const raw=$('backupText').value.trim();
 if(!raw||raw.length>100000){$('backupStatus').textContent='Встав код збереження (до 100 000 символів).';return}
 try{
  const parsed=JSON.parse(raw);
  if(!parsed || !Array.isArray(parsed.roster) || !Number.isInteger(parsed.cups))throw Error('format');
  if(!confirm('Замінити прогрес у цій грі на імпортований?'))return;
  localStorage.setItem(profileKey,raw);location.reload();
 }catch{$('backupStatus').textContent='Помилка формату. Потрібен код профілю Іскра Арени.'}
};
function setTab(name){
 $('lobby').dataset.tab=name;
 document.querySelectorAll('.tab-panel').forEach(p=>{p.hidden=p.dataset.panel!==name});
 document.querySelectorAll('.tab-btn').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===name)));
 const panels=document.querySelector('.tab-panels');if(panels)panels.scrollTop=0;
}
document.querySelectorAll('.tab-btn').forEach(b=>{b.onclick=()=>setTab(b.dataset.tab)});
document.querySelectorAll('[data-goto]').forEach(b=>{b.onclick=()=>setTab(b.dataset.goto)});
setTab('play');
lobby();function frame(now){const dt=Math.min(.034,(now-last)/1000);last=now;if(state==='play'&&dt>0){update(dt);draw()}requestAnimationFrame(frame)}requestAnimationFrame(frame);
