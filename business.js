(() => {
  'use strict';

  const body = document.body;
  const performanceSite = document.querySelector('#performance-site');
  const businessSite = document.querySelector('#business-site');
  const performanceFooter = document.querySelector('#performance-footer');
  const businessFooter = document.querySelector('#business-footer');
  const performanceNav = document.querySelector('#performance-nav');
  const businessNav = document.querySelector('#business-nav');
  const headerBrand = document.querySelector('.brand-home');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const video = document.querySelector('#site-bg-video');
  const intro = document.querySelector('#intro');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let division = 'performance';

  function setActiveSwitch(next) {
    document.querySelectorAll('.division-switch__button[data-division]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.division === next);
    });
  }

  function showDivision(next, options = {}) {
    const business = next === 'business';
    division = business ? 'business' : 'performance';

    const apply = () => {
      body.classList.toggle('business-mode', business);
      performanceSite.hidden = business;
      performanceFooter.hidden = business;
      performanceNav.hidden = business;
      businessSite.hidden = !business;
      businessFooter.hidden = !business;
      businessNav.hidden = !business;
      setActiveSwitch(division);

      if (themeMeta) themeMeta.setAttribute('content', business ? '#f4f8ff' : '#070a0b');

      if (headerBrand) {
        headerBrand.setAttribute('href', business ? '#business-inicio' : '#inicio');
        headerBrand.setAttribute('aria-label', business ? 'COREX Business início' : 'COREX Performance início');
      }

      if (business) {
        video?.pause();
        businessSite.classList.remove('division-enter');
        requestAnimationFrame(() => businessSite.classList.add('division-enter'));
      } else if (!document.hidden) {
        video?.play().catch(() => {});
      }
    };

    if (document.startViewTransition && !reducedMotion && !options.instant) {
      document.startViewTransition(apply);
    } else {
      apply();
    }

    if (options.scroll !== false) {
      const target = business ? document.querySelector('#business-inicio') : document.querySelector('#inicio');
      window.scrollTo({ top: target?.offsetTop || 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  }

  // Header / in-page switches
  document.querySelectorAll('[data-division]').forEach((control) => {
    control.addEventListener('click', (event) => {
      const next = control.dataset.division;
      if (!next) return;
      if (control.tagName === 'A') event.preventDefault();
      showDivision(next);
    });
  });

  // Intro division buttons
  document.querySelectorAll('[data-enter-division]').forEach((control) => {
    control.addEventListener('click', () => {
      const next = control.dataset.enterDivision || 'performance';
      if (intro?.open) intro.close();
      showDivision(next, { instant: false });
    });
  });

  // COREX logo returns to the current division top.
  headerBrand?.addEventListener('click', (event) => {
    if (division !== 'business') return;
    event.preventDefault();
    document.querySelector('#business-inicio')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  });

  // Business reveal animations
  const revealItems = [...document.querySelectorAll('.business-reveal')];
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // Dashboard reacts softly to the pointer. rAF avoids event flooding.
  const dashboard = document.querySelector('#businessDashboard');
  if (dashboard && !reducedMotion && !window.matchMedia('(pointer: coarse)').matches) {
    let pending = false;
    let eventX = 0;
    let eventY = 0;

    dashboard.addEventListener('pointermove', (event) => {
      eventX = event.clientX;
      eventY = event.clientY;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        const rect = dashboard.getBoundingClientRect();
        const x = (eventX - rect.left) / rect.width - .5;
        const y = (eventY - rect.top) / rect.height - .5;
        dashboard.style.transform = `perspective(1100px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-2px)`;
        pending = false;
      });
    }, { passive: true });

    dashboard.addEventListener('pointerleave', () => {
      dashboard.style.transform = '';
    });
  }

  // Business buttons: cursor-local light, no extra animation loop.
  document.querySelectorAll('.business-button').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      button.style.setProperty('--bx', `${event.clientX - rect.left}px`);
      button.style.setProperty('--by', `${event.clientY - rect.top}px`);
    }, { passive: true });
  });

  // Business nav active state
  const businessLinks = [...document.querySelectorAll('[data-business-nav]')];
  const businessSections = businessLinks
    .map((link) => document.getElementById(link.dataset.businessNav))
    .filter(Boolean);

  if ('IntersectionObserver' in window && businessSections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      businessLinks.forEach((link) => {
        link.classList.toggle('is-active', link.dataset.businessNav === visible.target.id);
      });
    }, { threshold: [.18, .35, .55], rootMargin: '-18% 0px -56% 0px' });
    businessSections.forEach((section) => navObserver.observe(section));
  }

  // Business brief form is intentionally local for now.
  const businessForm = document.querySelector('#business-contact-form');
  const businessStatus = document.querySelector('#business-form-status');
  businessForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(businessForm);
    const company = String(data.get('company') || '').trim();
    const service = String(data.get('service') || '').trim();
    if (businessStatus) {
      businessStatus.textContent = `${company || 'Projeto'} preparado (${service}). Falta conectar o envio ao WhatsApp/e-mail.`;
    }
  });

  // Deep-link support
  const initialHash = window.location.hash;
  if (initialHash.startsWith('#business')) {
    showDivision('business', { scroll: false, instant: true });
    requestAnimationFrame(() => document.querySelector(initialHash)?.scrollIntoView({ behavior: 'auto' }));
  } else {
    setActiveSwitch('performance');
  }

  // If hash changes to a business section manually, switch divisions automatically.
  window.addEventListener('hashchange', () => {
    if (window.location.hash.startsWith('#business') && division !== 'business') {
      showDivision('business', { scroll: false, instant: true });
    }
  });
})();

/* =========================================================
   COREX BUSINESS V10 — 3D scene + service interactions
   ========================================================= */
(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const stage = document.querySelector('#business3dStage');
  const core = document.querySelector('#businessCore3d');
  const canvas = document.querySelector('#businessCanvas');

  // Pointer-driven 3D stage. rAF keeps high-polling mice from flooding style updates.
  if (stage && core && !coarsePointer && !reducedMotion) {
    let raf = 0;
    let px = 0;
    let py = 0;

    stage.addEventListener('pointermove', (event) => {
      const rect = stage.getBoundingClientRect();
      px = (event.clientX - rect.left) / rect.width - .5;
      py = (event.clientY - rect.top) / rect.height - .5;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        stage.style.setProperty('--stage-ry', `${(px * 4.5).toFixed(2)}deg`);
        stage.style.setProperty('--stage-rx', `${(-py * 3.6).toFixed(2)}deg`);
        core.style.setProperty('--core-ry', `${(28 + px * 18).toFixed(2)}deg`);
        core.style.setProperty('--core-rx', `${(-16 - py * 14).toFixed(2)}deg`);
        raf = 0;
      });
    }, { passive: true });

    stage.addEventListener('pointerleave', () => {
      stage.style.setProperty('--stage-ry', '0deg');
      stage.style.setProperty('--stage-rx', '0deg');
      core.style.setProperty('--core-ry', '28deg');
      core.style.setProperty('--core-rx', '-16deg');
    });
  }

  // Service cards: cursor-local light + restrained 3D tilt.
  if (!coarsePointer && !reducedMotion) {
    document.querySelectorAll('[data-biz-service]').forEach((card) => {
      let raf = 0;
      let lastX = 0;
      let lastY = 0;

      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        lastX = event.clientX - rect.left;
        lastY = event.clientY - rect.top;
        card.style.setProperty('--mx', `${lastX}px`);
        card.style.setProperty('--my', `${lastY}px`);
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const nx = lastX / rect.width - .5;
          const ny = lastY / rect.height - .5;
          card.style.transform = `perspective(1100px) rotateX(${(-ny * 3.2).toFixed(2)}deg) rotateY(${(nx * 3.8).toFixed(2)}deg) translateY(-8px)`;
          raf = 0;
        });
      }, { passive: true });

      card.addEventListener('pointerleave', () => {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        card.style.transform = '';
      });
    });
  }

  // Lightweight professional data-field canvas. Runs only while Business hero is visible.
  if (!canvas || !stage) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let visible = false;
  let frameId = 0;
  let lastTime = 0;

  const nodes = Array.from({ length: coarsePointer ? 24 : 42 }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - .5) * .000055,
    vy: (Math.random() - .5) * .000055,
    size: Math.random() * 1.3 + .7,
    phase: Math.random() * Math.PI * 2
  }));

  function resize() {
    const rect = stage.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(now) {
    frameId = 0;
    if (!visible || !document.body.classList.contains('business-mode')) return;

    const dt = Math.min(32, now - lastTime || 16.7);
    lastTime = now;
    ctx.clearRect(0, 0, width, height);

    const time = now * .001;
    for (const node of nodes) {
      node.x += node.vx * dt;
      node.y += node.vy * dt;
      if (node.x < -.03) node.x = 1.03;
      if (node.x > 1.03) node.x = -.03;
      if (node.y < -.03) node.y = 1.03;
      if (node.y > 1.03) node.y = -.03;
    }

    // Connections are intentionally sparse to stay smooth.
    ctx.lineWidth = .65;
    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i];
      const ax = a.x * width;
      const ay = a.y * height;
      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j];
        const dx = (a.x - b.x) * width;
        const dy = (a.y - b.y) * height;
        const dist2 = dx * dx + dy * dy;
        if (dist2 > 115 * 115) continue;
        const alpha = (1 - Math.sqrt(dist2) / 115) * .12;
        ctx.strokeStyle = `rgba(72,211,255,${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(b.x * width, b.y * height);
        ctx.stroke();
      }
    }

    ctx.globalCompositeOperation = 'lighter';
    for (const node of nodes) {
      const pulse = .65 + Math.sin(time * 1.3 + node.phase) * .25;
      ctx.beginPath();
      ctx.arc(node.x * width, node.y * height, node.size * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(83,225,255,${(.24 + pulse * .18).toFixed(3)})`;
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

    // Slow scan beam.
    const scanY = (time * 28) % Math.max(height, 1);
    const gradient = ctx.createLinearGradient(0, scanY, width, scanY);
    gradient.addColorStop(0, 'rgba(0,214,255,0)');
    gradient.addColorStop(.5, 'rgba(55,218,255,.10)');
    gradient.addColorStop(1, 'rgba(0,214,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, scanY, width, 1);

    if (!reducedMotion) frameId = requestAnimationFrame(draw);
  }

  function ensureRunning() {
    if (!visible || reducedMotion || frameId || !document.body.classList.contains('business-mode')) return;
    lastTime = performance.now();
    frameId = requestAnimationFrame(draw);
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) {
      resize();
      ensureRunning();
    } else if (frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }
  }, { threshold: .02 });
  observer.observe(stage);

  // Division changes do not emit a custom event, so watch the body class cheaply.
  const bodyObserver = new MutationObserver(() => {
    if (document.body.classList.contains('business-mode')) ensureRunning();
    else if (frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
      ctx.clearRect(0, 0, width, height);
    }
  });
  bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  window.addEventListener('resize', () => {
    if (!visible) return;
    resize();
  }, { passive: true });
})();
