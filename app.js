/* COREX 04 — local, dependency-free 3D projection and interaction. */
(()=>{
'use strict';
document.documentElement.classList.add('js');
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n)), mix=(a,b,t)=>a+(b-a)*t;
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
let paused=motionQuery.matches, userMotionChoice=false, time=0, previous=0, progress=0, smoothProgress=0, selected='system', manual=false, lastScroll=scrollY, sceneVisible=true, chartVisible=false;
const motionButton=$('#motion-toggle');
function setMotion(){document.documentElement.classList.toggle('paused',paused);document.documentElement.classList.toggle('motion-enabled',!paused);motionButton.setAttribute('aria-pressed',String(paused));motionButton.setAttribute('aria-label',paused?'Ativar animações':'Pausar animações');motionButton.innerHTML=(paused?'▷':'Ⅱ')+' <span>Motion</span>';}
setMotion();
motionButton.addEventListener('click',()=>{userMotionChoice=true;paused=!paused;setMotion();ensureTick()});
motionQuery.addEventListener('change',e=>{if(!userMotionChoice){paused=e.matches;setMotion();ensureTick()}});
$$('.wave i').forEach((el,i)=>{el.style.setProperty('--i',i);el.style.height=(20+Math.sin(i*.75)**2*44)+'%'});
const reveals=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');reveals.unobserve(e.target)}}),{threshold:.08});
$$('.reveal').forEach(el=>reveals.observe(el));
new IntersectionObserver(es=>{sceneVisible=es[0].isIntersecting;ensureTick()},{rootMargin:'80px 0px'}).observe($('.experience'));
new IntersectionObserver(es=>{chartVisible=es[0].isIntersecting;if(chartVisible)drawChart()},{rootMargin:'80px 0px'}).observe($('#frame-chart'));
const chapters=[
 {key:'system',index:'01 / SISTEMA INTEGRADO',title:'Seu PC.<br>Outra <span>dimensão.</span>',description:'Menos ruído entre você e o jogo.<br>Explore o que move cada frame.',state:'ASSEMBLED'},
 {key:'cpu',index:'02 / PROCESSAMENTO',title:'Cada ciclo.<br><span>Conta.</span>',description:'A CPU prepara o próximo frame.<br>Menos tarefas disputando sua atenção.',state:'CPU / EXPLODED'},
 {key:'gpu',index:'03 / GRÁFICOS',title:'Mais mundo.<br><span>Menos espera.</span>',description:'A GPU transforma cálculos em imagem.<br>Equilibre qualidade e fluidez.',state:'GPU / EXPLODED'},
 {key:'ram',index:'04 / MEMÓRIA',title:'Tudo pronto.<br><span>Na hora.</span>',description:'Memória para manter o jogo em movimento.<br>Estabilidade também é performance.',state:'RAM / EXPLODED'}
];
let currentChapter=-1;
function updateChapter(i){if(currentChapter===i)return;currentChapter=i;selected=chapters[i].key;$('#chapter-index').textContent=chapters[i].index;$('#hero-title').innerHTML=chapters[i].title;$('#hero-description').innerHTML=chapters[i].description;$('#assembly-state').textContent=chapters[i].state;$('#scene-count').textContent='0'+(i+1)+' — 04';$$('[data-part]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.part===selected)));if(!paused&&$('.hero-copy').animate)$('.hero-copy').animate([{opacity:.2,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)'});}
function selectPart(part){manual=true;updateChapter(chapters.findIndex(c=>c.key===part));ensureTick();}
$$('[data-part]').forEach(b=>b.addEventListener('click',()=>selectPart(b.dataset.part)));
addEventListener('scroll',()=>{if(Math.abs(scrollY-lastScroll)>30){manual=false;lastScroll=scrollY}ensureTick()},{passive:true});

// A small painter's-algorithm renderer: actual perspective geometry, no bitmap.
const canvas=$('#hardware'),ctx=canvas.getContext('2d',{alpha:true}),chart=$('#frame-chart'),cctx=chart.getContext('2d',{alpha:true});
const experience=$('.experience'),hardwareWrap=$('.hardware-wrap'),labResult=$('.lab-result'),sceneProgressEl=$('#scene-progress'),introDialog=$('#intro');
let W=1,H=1,CW=1,CH=120,dpr=1,pointer={x:0,y:0},camera={x:0,y:0},shapes=[],shapeCount=0,hotspots=[],rotationY=-.48,rotationX=-.14,sceneScale=1,experienceTop=0,experienceHeight=1,canvasRect=null,hardwareGlow=null,canvasPointerRAF=0,pointerClientX=0,pointerClientY=0;
let rotCY=1,rotSY=0,rotCX=1,rotSX=0,projectScale=1,resizeRAF=0;
const FULL_CIRCLE=Math.PI*2,CIRCLE32=Array.from({length:33},(_,i)=>{const a=i/32*FULL_CIRCLE;return [Math.cos(a),Math.sin(a)]});
const FAN_ANGLES=Array.from({length:7},(_,i)=>{const a=i*FULL_CIRCLE/7;return [a,a+.1,a+.56,a+.7].map(v=>[Math.cos(v),Math.sin(v)])});
function resizeHardware(){experienceTop=experience.offsetTop;experienceHeight=experience.offsetHeight;canvasRect=canvas.getBoundingClientRect();W=Math.max(1,canvasRect.width);H=Math.max(1,canvasRect.height);dpr=Math.min(devicePixelRatio||1,2);const pw=Math.round(W*dpr),ph=Math.round(H*dpr);if(canvas.width!==pw||canvas.height!==ph){canvas.width=pw;canvas.height=ph;ctx.setTransform(dpr,0,0,dpr,0,0)}hardwareGlow=ctx.createRadialGradient(W*.55,H*.54,5,W*.55,H*.54,W*.43);hardwareGlow.addColorStop(0,'#88c6570d');hardwareGlow.addColorStop(1,'#88c65700');}
function resizeChart(){const cr=chart.getBoundingClientRect();CW=Math.max(1,cr.width);CH=Math.max(1,cr.height);dpr=Math.min(devicePixelRatio||1,2);const pw=Math.round(CW*dpr),ph=Math.round(CH*dpr);if(chart.width!==pw||chart.height!==ph){chart.width=pw;chart.height=ph;cctx.setTransform(dpr,0,0,dpr,0,0)}}
function queueResize(){if(resizeRAF)return;resizeRAF=requestAnimationFrame(()=>{resizeRAF=0;resizeHardware();resizeChart();ensureTick()})}
new ResizeObserver(queueResize).observe(hardwareWrap);new ResizeObserver(queueResize).observe(labResult);
canvas.addEventListener('pointermove',e=>{pointerClientX=e.clientX;pointerClientY=e.clientY;if(!canvasPointerRAF)canvasPointerRAF=requestAnimationFrame(()=>{canvasPointerRAF=0;const r=canvasRect||canvas.getBoundingClientRect();pointer.x=(pointerClientX-r.left)/W-.5;pointer.y=(pointerClientY-r.top)/H-.5;const x=pointerClientX-r.left,y=pointerClientY-r.top;canvas.style.cursor=hotspots.some(h=>{const dx=h.x-x,dy=h.y-y;return dx*dx+dy*dy<1600})?'pointer':'default';ensureTick()})},{passive:true});
canvas.addEventListener('pointerleave',()=>{pointer.x=pointer.y=0;ensureTick()});
canvas.addEventListener('click',e=>{const r=canvasRect||canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;const hit=hotspots.find(h=>Math.hypot(h.x-x,h.y-y)<45);if(hit)selectPart(hit.key);ensureTick()});
function projectInto(p,out){const x=p[0]*rotCY+p[2]*rotSY,z=-p[0]*rotSY+p[2]*rotCY,y=p[1]*rotCX-z*rotSX,zz=p[1]*rotSX+z*rotCX,f=820/(820-zz);out.x=W*.55+x*projectScale*f;out.y=H*.49+y*projectScale*f;out.z=zz;return out;}
function project(p){return projectInto(p,{x:0,y:0,z:0});}
function polygon(points,fill,stroke,width=1,glow=0){let shape=shapes[shapeCount];if(!shape){shape={pts:[],z:0,fill:null,stroke:null,width:1,glow:0};shapes[shapeCount]=shape}const pts=shape.pts,n=points.length;let zsum=0;for(let i=0;i<n;i++){let out=pts[i];if(!out)out=pts[i]={x:0,y:0,z:0};projectInto(points[i],out);zsum+=out.z}pts.length=n;shape.z=zsum/n;shape.fill=fill;shape.stroke=stroke;shape.width=width;shape.glow=glow;shapeCount++;}
function line(points,color,width=1,glow=0){polygon(points,null,color,width,glow)}
function box(x,y,z,w,h,d,color='#192824',accent='#4e7262'){
 const p=[[x-w/2,y-h/2,z-d/2],[x+w/2,y-h/2,z-d/2],[x+w/2,y+h/2,z-d/2],[x-w/2,y+h/2,z-d/2],[x-w/2,y-h/2,z+d/2],[x+w/2,y-h/2,z+d/2],[x+w/2,y+h/2,z+d/2],[x-w/2,y+h/2,z+d/2]];
 [[0,1,2,3],[0,4,5,1],[1,5,6,2],[3,2,6,7],[0,3,7,4],[4,7,6,5]].forEach((ids,i)=>polygon(ids.map(j=>p[j]),i===1?'#34443c':i===2?'#111d1a':color,accent,.65));
}
function ring(x,y,z,r,color,plane='xy',phase=0,span=FULL_CIRCLE,width=1,glow=0){const pts=[];if(phase===0&&span===FULL_CIRCLE){for(const [ca,sa] of CIRCLE32)pts.push(plane==='xy'?[x+ca*r,y+sa*r,z]:[x,y+sa*r,z+ca*r])}else{for(let i=0;i<=32;i++){const a=phase+i/32*span;pts.push(plane==='xy'?[x+Math.cos(a)*r,y+Math.sin(a)*r,z]:[x,y+Math.sin(a)*r,z+Math.cos(a)*r])}}line(pts,color,width,glow)}
function fan(x,y,z,r,plane='xy'){
 const rotor=time*.003,ct=Math.cos(rotor),st=Math.sin(rotor);
 const pointFromUnit=(unit,rr)=>{const ca=unit[0]*ct-unit[1]*st,sa=unit[1]*ct+unit[0]*st;return plane==='xy'?[x+ca*rr,y+sa*rr,z]:[x,y+sa*rr,z+ca*rr]};
 ring(x,y,z,r,'#3f6254',plane,0,FULL_CIRCLE,1.2);ring(x,y,z,r*.86,'#b4ff7788',plane,0,FULL_CIRCLE,2,8);ring(x,y,z,r*.76,'#64e8d366',plane,0,FULL_CIRCLE,1);
 for(let i=0;i<7;i++){const u=FAN_ANGLES[i];polygon([pointFromUnit(u[0],7),pointFromUnit(u[1],r*.73),pointFromUnit(u[2],r*.7),pointFromUnit(u[3],10)],'#223b32','#60967655',.5)}
 ring(x,y,z,8,'#96b9a2',plane);ring(x,y,z,5,'#495f54',plane);
}
function boardDetail(x,y,z,w,h){for(let i=0;i<10;i++){const yy=y-h/2+10+i*(h-20)/10,xx=x-w/2+7;line([[xx,yy,z],[xx+12+(i%3)*4,yy,z],[xx+24,yy+7,z],[x+w/2-6,yy+7,z]],i%3===0?'#a0d77855':'#42625355',.65)}}
function drawHardware(dt){
 progress=clamp((scrollY-experienceTop)/Math.max(1,experienceHeight-innerHeight));smoothProgress=paused?progress:mix(smoothProgress,progress,Math.min(1,dt*.007));
 if(!manual)updateChapter(Math.min(3,Math.floor(progress*4)));
 sceneProgressEl.style.transform=`scaleX(${progress})`;
 const targetExplode=manual?(selected==='system'?0:.9):clamp((smoothProgress-.1)/.6);drawHardware.explode=paused?targetExplode:mix(drawHardware.explode||0,targetExplode,Math.min(1,dt*.005));const e=drawHardware.explode;
 camera.x=mix(camera.x,pointer.x,Math.min(1,dt*.004));camera.y=mix(camera.y,pointer.y,Math.min(1,dt*.004));rotationY=-.48+smoothProgress*.24+(paused?0:camera.x*.2+Math.sin(time*.00017)*.045);rotationX=-.13+(paused?0:camera.y*.1);sceneScale=1-e*.12;
 rotCY=Math.cos(rotationY);rotSY=Math.sin(rotationY);rotCX=Math.cos(rotationX);rotSX=Math.sin(rotationX);projectScale=Math.min(W/470,H/440)*sceneScale;
 ctx.clearRect(0,0,W,H);shapeCount=0;hotspots.length=0;
 if(hardwareGlow){ctx.fillStyle=hardwareGlow;ctx.fillRect(0,0,W,H)}
 // Floating floor grid and footprint.
 for(let i=-3;i<=3;i++){line([[-220,180,i*65],[220,180,i*65]],'#57786015',.7);line([[i*65,180,-200],[i*65,180,200]],'#57786015',.7)}
 ring(0,0,-100,190,'#79b5650c');
 // Back wall, base, feet, corner posts and front panel.
 box(0,0,-84,218,307,7,'#101a17','#3f594a');
 box(0,151,0,230,9,186,'#18231f','#53775b');box(0,-151,0,230,7,186,'#1b2b23','#5f8067');
 [-108,108].forEach(x=>[-86,86].forEach(z=>box(x,0,z,5,305,5,'#24382c','#6e947455')));
 [-82,82].forEach(x=>box(x,161,35,24,11,106,'#0b100e','#35473b'));
 // Motherboard with traces, PCI slots and VRMs.
 box(-12,-23,-68,174,239,6,'#18362b','#557b50');boardDetail(-12,-23,-64,168,235);
 for(let i=0;i<6;i++){box(-77,-95+i*17,-57,14,10,11,'#394d3c','#63764d');box(-19+i*17,-127,-58,12,12,10,'#394d3c','#617c4e')}
 for(let i=0;i<3;i++)box(-13,70+i*19,-56,121,6,9,'#151f1b','#66785a');
 for(let i=0;i<10;i++){const x=-75+(i%5)*29,y=90+Math.floor(i/5)*17;box(x,y,-55,10,8,7,'#17271c','#667f4a')}
 // CPU package: projected solid, contact pins, heat spreader and etched traces.
 const bob=paused?0:Math.sin(time*.0012)*2;
 const cpu={x:-30-e*58,y:-52-e*25+bob*e,z:-42+e*155};
 box(cpu.x,cpu.y,cpu.z,69,69,7,'#314f36',selected==='cpu'?'#b8ff65':'#7a9564');
 box(cpu.x,cpu.y,cpu.z+7,51,51,8,'#b0bcb0','#d6dfc6');box(cpu.x,cpu.y,cpu.z+12,43,43,1,'#7d9080','#81957f');
 for(let i=0;i<9;i++){const offset=-28+i*7;line([[cpu.x+offset,cpu.y-36,cpu.z],[cpu.x+offset,cpu.y-31,cpu.z]],'#c5bc76',1.4);line([[cpu.x+offset,cpu.y+31,cpu.z],[cpu.x+offset,cpu.y+36,cpu.z]],'#c5bc76',1.4)}
 // RAM sticks separate laterally, with individually modeled memory chips.
 const ram={x:56+e*68,y:-55-e*12-bob*e,z:-46+e*103};
 for(let j=0;j<2;j++){let x=ram.x+j*19;box(x,ram.y,ram.z+j*8,13,136,6,'#203726','#648753');for(let i=0;i<6;i++)box(x,ram.y-49+i*19,ram.z+5+j*8,10,13,4,'#101b17','#446543');line([[x-6,ram.y-70,ram.z+7+j*8],[x+6,ram.y-70,ram.z+7+j*8]],j?'#5ee7df':'#b8ff65',3,9);}
 // GPU shroud and dual rotating fans.
 const gpu={x:-14-e*13,y:57+e*69+bob*e,z:10+e*134};
 box(gpu.x,gpu.y,gpu.z,177,66,57,'#1d2b25',selected==='gpu'?'#b8ff65':'#69856e');
 for(let i=0;i<17;i++)line([[gpu.x-81+i*10,gpu.y-30,gpu.z-27],[gpu.x-81+i*10,gpu.y-30,gpu.z+23]],'#72917866',1);
 box(gpu.x,gpu.y-36,gpu.z-15,169,3,31,'#203a26','#718548');
 fan(gpu.x-44,gpu.y,gpu.z+30,27);fan(gpu.x+31,gpu.y,gpu.z+30,27);
 line([[gpu.x-83,gpu.y+33,gpu.z+29],[gpu.x+83,gpu.y+33,gpu.z+29]],'#b8ff65',2,10);
 // Front fan stack and power supply.
 box(107,-12,0,6,270,162,'#14241c','#537c57');
 [-91,-9,73].forEach(y=>fan(112,y,0,32,'yz'));
 box(-15,127,-13,155,39,125,'#14221b','#49644d');
 for(let i=0;i<12;i++)line([[-82+i*11,113,51],[-82+i*11,139,51]],'#446849',1);
 // Exploded glass side; diagonal highlight and screws stay attached.
 const glassX=e*135,glassZ=94+e*75;
 polygon([[-108+glassX,-150,glassZ],[108+glassX,-150,glassZ],[108+glassX,149,glassZ],[-108+glassX,149,glassZ]],'#85cfa105','#82bc9260',1);
 line([[-104+glassX,20,glassZ],[39+glassX,-147,glassZ]],'#b3dfbe15',1);
 [-100,100].forEach(x=>[-142,140].forEach(y=>ring(x+glassX,y,glassZ,2,'#98b59b')));
 if(e>.12){[cpu,ram,gpu].forEach(part=>line([[part.x,part.y,-60],[part.x,part.y,part.z]],'#b8ff6520',.7));}
 // Painter sorting handles opaque component faces back-to-front. Reuse the shape pool to avoid per-frame GC spikes.
 shapes.length=shapeCount;shapes.sort((a,b)=>a.z-b.z);for(const s of shapes){ctx.beginPath();s.pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));if(s.fill){ctx.closePath();ctx.fillStyle=s.fill;ctx.fill()}if(s.stroke){ctx.strokeStyle=s.stroke;ctx.lineWidth=s.width;ctx.shadowBlur=paused?0:(s.glow>=8?4:0);if(ctx.shadowBlur)ctx.shadowColor=s.stroke;ctx.stroke();ctx.shadowBlur=0}}
 // Etching and interactive component labels.
 const cp=project([cpu.x,cpu.y,cpu.z+14]);ctx.save();ctx.translate(cp.x,cp.y);ctx.fillStyle='#233b2c';ctx.textAlign='center';ctx.font='bold '+Math.max(8,Math.min(W/70,12))+'px Segoe UI';ctx.fillText('COREX',0,0);ctx.font='7px Consolas';ctx.fillText('PROCESSOR',0,11);ctx.restore();
 const parts=[{...cpu,key:'cpu',name:'CPU',dx:-58,dy:-40},{...gpu,key:'gpu',name:'GPU',dx:-63,dy:46},{...ram,key:'ram',name:'RAM',dx:40,dy:-43}];
 if(e>.15||manual){parts.forEach(part=>{const p=project([part.x,part.y,part.z+30]), a=clamp((e-.15)*3);const lx=clamp(p.x+part.dx,25,W-50),ly=clamp(p.y+part.dy,35,H-70);ctx.globalAlpha=a;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(lx,ly);ctx.lineTo(lx+29,ly);ctx.strokeStyle=selected===part.key?'#b8ff65':'#5e7d68';ctx.lineWidth=.8;ctx.stroke();ctx.fillStyle='#b8ff65';ctx.beginPath();ctx.arc(p.x,p.y,2.5,0,Math.PI*2);ctx.fill();ctx.fillStyle=selected===part.key?'#c5ff87':'#a7bba9';ctx.font='11px Consolas';ctx.fillText(part.name,lx,ly-7);ctx.globalAlpha=1;hotspots.push({x:p.x,y:p.y,key:part.key});hotspots.push({x:lx+15,y:ly-10,key:part.key});});}
 // Quiet moving specks; never marketed as real telemetry.
 if(!paused){ctx.fillStyle='#b8ff6540';for(let i=0;i<17;i++){const x=(i*137.1)%W,y=(i*91.7-time*.006*(1+i%3)+H*100)%H;ctx.fillRect(x,y,i%3===0?2:1,1)}}
}

let result;
const fmt=n=>n.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1});
function calculate(e){if(e)e.preventDefault();try{result=window.CorexSimulator.estimateScenario({fps:$('#fps').value,low:$('#low').value,load:$('#gpu-load').value,ram:$('#ram').value,system:$('#system').value,game:$('#game').value});$('#form-error').textContent='';$('#fps-range').textContent=result.fpsMin+'–'+result.fpsMax;$('#gain').textContent='0–'+result.gainMax+'%';$('#baseline').innerHTML=result.fpsMin+' <small>FPS</small>';$('#low-result').textContent=result.lowMin===null?'Não informado':result.lowMin+'–'+result.lowMax;$('#frame-result').innerHTML=fmt(result.frameMin)+'–'+fmt(result.frameMax)+' <small>ms</small>';$('#bottleneck').textContent=result.bottleneck;if(e&&!paused&&$('#result-summary').animate)$('#result-summary').animate([{opacity:.35,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:500});drawChart();}catch(error){$('#form-error').textContent=error.message}}
$('#sim-form').addEventListener('submit',calculate);
$('#gpu-load').addEventListener('input',()=>$('#gpu-load-value').textContent=$('#gpu-load').value+'%');
$('#sim-form').addEventListener('input',()=>{if(result)$('#form-error').textContent='Cenário alterado. Clique em “Simular performance” para atualizar.'});
function drawChart(){if(!result||!CW)return;cctx.clearRect(0,0,CW,CH);cctx.strokeStyle='#80978912';cctx.lineWidth=1;for(let i=0;i<4;i++){const y=10+i*30;cctx.beginPath();cctx.moveTo(0,y);cctx.lineTo(CW,y);cctx.stroke()}const phase=paused?0:time*.0001;[false,true].forEach(after=>{cctx.beginPath();for(let i=0;i<=100;i++){const base=.45+Math.sin(i*.53+phase)*.1+Math.sin(i*1.47+phase)*.06;const spike=i%23<2?.32:0;const variation=after?(base+spike*.65)*(1-result.reclaim):base+spike;const y=CH-15-variation*(CH-22);i?cctx.lineTo(i/100*CW,y):cctx.moveTo(0,y)}cctx.strokeStyle=after?'#b8ff65':'#57726b';cctx.lineWidth=after?1.8:1;cctx.stroke()});}
calculate();
const dialog=$('#plan-dialog');
$$('[data-plan]').forEach(b=>b.addEventListener('click',()=>{$('#chosen-plan').textContent=b.dataset.plan;$('#chosen-price').textContent='R$ '+b.dataset.price+',00';const scope=[...b.closest('article').querySelectorAll('li')].map(li=>li.textContent).join('; ');$('#plan-summary').value='COREX '+b.dataset.plan+' — R$ '+b.dataset.price+',00\n'+scope+'.\nConfiguração: '+($('#cpu-name').value||'CPU não informada')+' / '+($('#gpu-name').value||'GPU não informada')+'.\nSeleção para consulta. Confirmar escopo e atendimento antes de contratar.';$('#copy-status').textContent='';dialog.showModal()}));
$('.close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
$('#copy-plan').addEventListener('click',async()=>{try{if(!navigator.clipboard)throw new Error();await navigator.clipboard.writeText($('#plan-summary').value);$('#copy-status').textContent='Resumo copiado.'}catch{$('#plan-summary').focus();$('#plan-summary').select();$('#copy-status').textContent='Resumo selecionado. Use Ctrl+C ou a opção Copiar do seu dispositivo.'}});
let rafId=0;
function introBlocking(){return !!(introDialog?.open||document.documentElement.classList.contains('intro-running'))}
function ensureTick(){if(!rafId&&!document.hidden)rafId=requestAnimationFrame(tick)}
function tick(now){rafId=0;const dt=Math.min(40,now-previous||16);previous=now;const blocked=introBlocking();if(!document.hidden){if(!paused)time+=dt;if(sceneVisible&&!blocked)drawHardware(dt)}const active=!document.hidden&&!blocked&&sceneVisible;if(active&&!paused)rafId=requestAnimationFrame(tick)}
introDialog?.addEventListener('close',()=>{previous=performance.now();ensureTick()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){previous=performance.now();ensureTick()}});
resizeHardware();resizeChart();updateChapter(0);ensureTick();
})();
