/* COREX V8 — premium interactions, optimized navigation and WhatsApp launcher. */
(()=>{
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse=matchMedia('(pointer: coarse)').matches;
  const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));

  // Background video: high quality stays intact, while playback is suspended behind the full-screen intro.
  const video=document.querySelector('#site-bg-video');
  const intro=document.querySelector('#intro');
  if(video){
    video.muted=true;
    video.defaultMuted=true;
    video.loop=true;
    video.playsInline=true;
    video.autoplay=true;
    video.setAttribute('muted','');
    video.setAttribute('playsinline','');
    video.setAttribute('webkit-playsinline','');

    let playbackUnlocked=false;
    const unlockEvents=['pointermove','pointerdown','touchstart','keydown','wheel','scroll'];
    const shouldPause=()=>document.hidden||!!intro?.open;

    const cleanupUnlock=()=>unlockEvents.forEach(type=>window.removeEventListener(type,unlockPlayback));
    const tryPlay=()=>{
      if(shouldPause()){
        if(!video.paused) video.pause();
        return;
      }
      const p=video.play();
      if(p&&typeof p.then==='function'){
        p.then(()=>{
          playbackUnlocked=true;
          video.classList.add('is-playing');
          cleanupUnlock();
        }).catch(()=>{playbackUnlocked=false});
      }
    };
    function unlockPlayback(){if(!playbackUnlocked||video.paused)tryPlay()}

    video.addEventListener('loadeddata',()=>{video.classList.add('is-ready');tryPlay()},{once:true});
    video.addEventListener('canplay',tryPlay);
    video.addEventListener('pause',()=>{if(!shouldPause())requestAnimationFrame(tryPlay)});
    document.addEventListener('visibilitychange',tryPlay,{passive:true});

    unlockEvents.forEach(type=>window.addEventListener(type,unlockPlayback,{passive:true}));

    if(intro){
      new MutationObserver(tryPlay).observe(intro,{attributes:true,attributeFilter:['open']});
    }

    video.load();
    tryPlay();
    window.setTimeout(tryPlay,250);
    window.setTimeout(tryPlay,900);
  }

  // Global cursor glow: one compositor update at most per screen frame.
  const glow=document.querySelector('#v7-cursor-glow');
  if(glow&&!coarse&&!reduced){
    let raf=0,lastX=-500,lastY=-500;
    addEventListener('pointermove',e=>{
      lastX=e.clientX;lastY=e.clientY;
      if(!raf)raf=requestAnimationFrame(()=>{
        glow.style.opacity='.95';
        glow.style.transform=`translate3d(${lastX}px,${lastY}px,0)`;
        raf=0;
      });
    },{passive:true});
    document.documentElement.addEventListener('mouseleave',()=>glow.style.opacity='0');
  }

  // High-polling gaming mice can send hundreds/thousands of pointer events per second.
  // Cache layout boxes and collapse all pointer work to max. one DOM update per frame.
  let rectCache=new WeakMap();
  const pending=new WeakMap();
  addEventListener('resize',()=>{rectCache=new WeakMap()},{passive:true});

  const getRect=el=>{
    let r=rectCache.get(el);
    if(!r){r=el.getBoundingClientRect();rectCache.set(el,r)}
    return r;
  };

  const localPointer=(el,e)=>{
    const r=getRect(el),x=e.clientX-r.left,y=e.clientY-r.top;
    el.style.setProperty('--fx-x',`${x}px`);
    el.style.setProperty('--fx-y',`${y}px`);
    return {r,x,y};
  };

  const framePointer=(el,e,fn)=>{
    const state=pending.get(el)||{raf:0,x:0,y:0};
    state.x=e.clientX;state.y=e.clientY;
    if(!state.raf){
      state.raf=requestAnimationFrame(()=>{
        state.raf=0;
        fn({clientX:state.x,clientY:state.y});
      });
    }
    pending.set(el,state);
  };

  const activateRect=el=>{
    el.addEventListener('pointerenter',()=>rectCache.set(el,el.getBoundingClientRect()),{passive:true});
    el.addEventListener('pointerleave',()=>rectCache.delete(el),{passive:true});
  };

  document.querySelectorAll('.button').forEach(button=>{
    activateRect(button);
    button.addEventListener('pointermove',e=>{
      if(coarse||reduced)return;
      framePointer(button,e,evt=>{
        const {r,x,y}=localPointer(button,evt);
        button.style.setProperty('--mag-x',`${clamp((x-r.width/2)*.035,-5,5).toFixed(2)}px`);
        button.style.setProperty('--mag-y',`${clamp((y-r.height/2)*.045,-4,4).toFixed(2)}px`);
      });
    },{passive:true});
    button.addEventListener('pointerleave',()=>{
      button.style.setProperty('--mag-x','0px');
      button.style.setProperty('--mag-y','0px');
    });
    button.addEventListener('pointerdown',e=>{
      if(reduced)return;
      const {x,y}=localPointer(button,e);
      const ripple=document.createElement('i');
      ripple.className='v7-ripple';
      ripple.style.left=`${x}px`;ripple.style.top=`${y}px`;
      button.appendChild(ripple);
      ripple.addEventListener('animationend',()=>ripple.remove(),{once:true});
    });
  });

  document.querySelectorAll('.component-tabs button,.header nav a,.motion-toggle,.back-top,.replay-intro').forEach(el=>{
    activateRect(el);
    el.addEventListener('pointermove',e=>framePointer(el,e,evt=>localPointer(el,evt)),{passive:true});
  });

  document.querySelectorAll('.engine-card,.plan').forEach(card=>{
    activateRect(card);
    card.addEventListener('pointermove',e=>{
      if(coarse||reduced)return;
      framePointer(card,e,evt=>{
        const {r,x,y}=localPointer(card,evt);
        card.style.setProperty('--tilt-x',`${((.5-y/r.height)*4).toFixed(2)}deg`);
        card.style.setProperty('--tilt-y',`${((x/r.width-.5)*5).toFixed(2)}deg`);
      });
    },{passive:true});
    card.addEventListener('pointerleave',()=>{
      card.style.setProperty('--tilt-x','0deg');
      card.style.setProperty('--tilt-y','0deg');
    });
  });

  // Decorative CSS animation only runs while the corresponding card is actually on-screen.
  const animatedCards=document.querySelectorAll('.engine-card');
  if('IntersectionObserver' in window){
    const animObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      entry.target.classList.toggle('fx-active',entry.isIntersecting);
    }),{rootMargin:'100px 0px'});
    animatedCards.forEach(card=>animObserver.observe(card));
  }else animatedCards.forEach(card=>card.classList.add('fx-active'));


  // Premium top navigation: active state follows the section, no continuous loop.
  const navLinks=[...document.querySelectorAll('[data-nav-target]')];
  if(navLinks.length&&'IntersectionObserver' in window){
    const navSections=navLinks.map(link=>document.getElementById(link.dataset.navTarget)).filter(Boolean);
    const navObserver=new IntersectionObserver(entries=>{
      const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!visible)return;
      navLinks.forEach(link=>link.classList.toggle('is-active',link.dataset.navTarget===visible.target.id));
    },{rootMargin:'-28% 0px -56% 0px',threshold:[0,.12,.3,.55]});
    navSections.forEach(section=>navObserver.observe(section));
  }

  // WhatsApp launcher placeholder. We only add the real URL after the number is configured.
  const whatsappButton=document.querySelector('#whatsapp-button');
  const whatsappToast=document.querySelector('#whatsapp-toast');
  let whatsappToastTimer=0;
  whatsappButton?.addEventListener('click',()=>{
    const configuredUrl=whatsappButton.dataset.url||'';
    if(configuredUrl){
      window.open(configuredUrl,'_blank','noopener,noreferrer');
      return;
    }
    if(whatsappToast){
      whatsappToast.classList.add('is-visible');
      clearTimeout(whatsappToastTimer);
      whatsappToastTimer=window.setTimeout(()=>whatsappToast.classList.remove('is-visible'),2600);
    }
  });
})();
