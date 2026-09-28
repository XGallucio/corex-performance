/* Local cinematic timeline; progress describes the presentation, not asset loading. */
(()=>{
 'use strict';
 const el=id=>document.getElementById(id),intro=el('intro');
 if(!intro||!intro.showModal)return;
 const canvas=el('intro-canvas'),ctx=canvas.getContext('2d'),logo=intro.querySelector('.intro-logo'),mark=intro.querySelector('.intro-mark'),path=mark.querySelector('path'),letters=[...intro.querySelectorAll('.intro-word>span')],tag=intro.querySelector('.intro-tagline'),word=intro.querySelector('.intro-word'),sup=word.querySelector('sup'),bottom=intro.querySelector('.intro-bottom');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=x=>Math.max(0,Math.min(1,x)),segment=(t,a,b)=>1-Math.pow(1-clamp((t-a)/(b-a)),3);
 let frame=0,safety=0,start=0,closing=false,reduced=false,w=1,h=1,wordWidth=0,restoreFocus=null;
 function resize(){w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio||1,1.75);canvas.width=w*d;canvas.height=h*d;ctx?.setTransform(d,0,0,d,0,0);wordWidth=word.getBoundingClientRect().width}
 function release(){cancelAnimationFrame(frame);clearTimeout(safety);closing=true;intro.close();document.documentElement.classList.remove('intro-running');(restoreFocus||document.querySelector('.header .brand'))?.focus({preventScroll:true})}
 function open(force=false){
  cancelAnimationFrame(frame);clearTimeout(safety);if(!intro.open)restoreFocus=document.activeElement===document.body?null:document.activeElement;
  reduced=reduce.matches&&!force;closing=false;start=performance.now();
  intro.classList.remove('intro-leaving');intro.style.clipPath='none';intro.style.opacity='1';el('animate-intro').hidden=!reduced;
  if(!intro.open)intro.showModal();document.documentElement.classList.add('intro-running');resize();
  safety=setTimeout(release,reduced?4200:15500);render(0);frame=requestAnimationFrame(tick);
 }
 function draw(t){
  if(!ctx)return;ctx.clearRect(0,0,w,h);const cx=w/2,cy=h*.46,r=Math.min(w*.34,h*.35),formation=segment(t,0,3),burst=segment(t,8.9,11.6);
  const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,r*2.5);glow.addColorStop(0,'rgba(106,242,174,'+(.05+formation*.07)+')');glow.addColorStop(.4,'rgba(48,150,139,.035)');glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  for(let i=0;i<76;i++){
   const angle=i*2.399963+t*.017,seed=(i*.6180339)%1,cycle=(seed+t*.13)%1,dist=r*(.45+Math.pow(1-cycle,2)*3.6)*(1+burst*.6),stretch=6+(1-cycle)*28+burst*90;
   const x=cx+Math.cos(angle)*dist,y=cy+Math.sin(angle)*dist*.58;
   ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(angle)*stretch,y+Math.sin(angle)*stretch*.58);ctx.strokeStyle=i%4===0?'rgba(93,232,221,'+(.08+cycle*.35)+')':'rgba(180,255,111,'+(.04+cycle*.23)+')';ctx.lineWidth=i%7===0?1.3:.65;ctx.stroke();
  }
  for(let k=0;k<5;k++){
   const rr=r*(.78+k*.15)*(1+burst*.6),a=t*(k%2?.11:-.08)+k*.7;
   ctx.save();ctx.translate(cx,cy);ctx.rotate(Math.sin(t*.14+k)*.15);ctx.scale(1,.63+k*.065);ctx.beginPath();ctx.arc(0,0,rr,a,a+Math.PI*(k%2?1.3:1.75));ctx.strokeStyle=k===1?'#8eff9c40':'#64b89f19';ctx.lineWidth=k===1?1.1:.6;ctx.stroke();
   if(k===1)for(let j=0;j<60;j++){const b=j*Math.PI/30;ctx.beginPath();ctx.moveTo(Math.cos(b)*rr,Math.sin(b)*rr);ctx.lineTo(Math.cos(b)*(rr+(j%5?3:8)),Math.sin(b)*(rr+(j%5?3:8)));ctx.strokeStyle='#89bc8c35';ctx.stroke()}
   ctx.restore();
  }
  const scan=(t*.10)%1;ctx.fillStyle='#71fbc006';ctx.fillRect(0,h*scan,w,40);ctx.fillStyle='#8dffd51c';ctx.fillRect(w*.12,h*scan,w*.76,.6);
 }
 function render(t){
  const v=reduced?9:t;draw(v);
  const appear=segment(v,.3,2.2),assemble=segment(v,2.6,5.8),settle=segment(v,7,10.8),ww=wordWidth;
  mark.style.opacity=appear;mark.style.transform='translateX('+((ww+18)/2*(1-assemble))+'px) scale('+(1.6-.6*assemble)+') rotate('+(-12*(1-appear))+'deg)';path.style.strokeDashoffset=1-appear;
  logo.style.opacity='1';logo.style.transform='scale('+(1.04-settle*.04)+')';
  letters.forEach((letter,i)=>{const p=segment(v,3.1+i*.26,4.8+i*.26);letter.style.opacity=p;letter.style.transform='translate3d('+(35*(1-p))+'px,'+((i%2?-1:1)*50*(1-p))+'px,'+(-100*(1-p))+'px) rotateX('+(70*(1-p))+'deg)';letter.style.filter='blur('+(12*(1-p))+'px)';const shine=clamp(1-Math.abs(v-(6.5+i*.16))/.65);letter.style.color=shine>.01?'rgb('+Math.round(239-55*shine)+','+Math.round(245+10*shine)+','+Math.round(233-73*shine)+')':'#edf4e9';letter.style.textShadow='0 0 '+(shine*30)+'px rgba(162,255,110,'+(shine*.5)+')'});
  sup.style.opacity=segment(v,5.7,6.6);tag.style.opacity=segment(v,7.1,8.4);tag.style.transform='translateY('+(12*(1-segment(v,7.1,8.4)))+'px)';tag.style.letterSpacing=(w<600?2:4)+(1-segment(v,7.1,8.4))*5+'px';
  const p=clamp(t/(reduced?3.2:11.4));el('intro-progress').value=p*100;el('intro-percent').textContent=String(Math.floor(p*100)).padStart(2,'0');el('intro-status').textContent=p<.25?'01 / O INÍCIO DE TUDO':p<.53?'02 / ENERGIA GANHA FORMA':p<.8?'03 / CADA FRAME CONTA':'04 / BEM-VINDO À COREX';
  if(!reduced&&t>11.4){const out=clamp((t-11.4)/1.4),smooth=out*out*(3-2*out);intro.style.clipPath='inset('+(smooth*50)+'% 0 '+(smooth*50)+'% 0)';logo.style.transform='scale('+(1+out*.13)+')';logo.style.opacity=1-out;bottom.style.opacity=1-out;}else bottom.style.opacity=1;
 }
 function tick(now){if(closing)return;const t=(now-start)/1000;if(t>=(reduced?3.2:12.8)){release();return}render(t);frame=requestAnimationFrame(tick)}
 el('skip-intro').addEventListener('click',release);el('animate-intro').addEventListener('click',()=>open(true));el('replay-intro').addEventListener('click',()=>open(true));intro.addEventListener('cancel',e=>{e.preventDefault();release()});intro.addEventListener('close',()=>{cancelAnimationFrame(frame);clearTimeout(safety);document.documentElement.classList.remove('intro-running')});addEventListener('resize',()=>{if(intro.open)resize()});open();
})();
