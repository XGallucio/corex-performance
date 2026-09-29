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
   COREX BUSINESS V11 — operations hub + optimized interaction
   ========================================================= */
(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const stage = document.querySelector('#businessOpsStage');
  const scene = document.querySelector('#businessOpsScene');

  // One compositor-only 3D transform for the whole hero scene.
  // No canvas loop, no continuously rotating cube, no per-frame DOM rebuilding.
  if (stage && scene && !coarsePointer && !reducedMotion) {
    let raf = 0;
    let nx = 0;
    let ny = 0;

    const paint = () => {
      stage.style.setProperty('--ops-ry', `${(nx * 2.8).toFixed(2)}deg`);
      stage.style.setProperty('--ops-rx', `${(-ny * 2.2).toFixed(2)}deg`);
      raf = 0;
    };

    stage.addEventListener('pointermove', (event) => {
      const rect = stage.getBoundingClientRect();
      nx = Math.max(-.5, Math.min(.5, (event.clientX - rect.left) / rect.width - .5));
      ny = Math.max(-.5, Math.min(.5, (event.clientY - rect.top) / rect.height - .5));
      if (!raf) raf = requestAnimationFrame(paint);
    }, { passive: true });

    stage.addEventListener('pointerleave', () => {
      nx = 0;
      ny = 0;
      if (!raf) raf = requestAnimationFrame(paint);
    }, { passive: true });
  }

  // Service cards keep a subtle, local 3D response. Updates are capped to one paint/frame.
  if (!coarsePointer && !reducedMotion) {
    document.querySelectorAll('[data-biz-service]').forEach((card) => {
      let raf = 0;
      let x = 0;
      let y = 0;
      let width = 1;
      let height = 1;

      const paint = () => {
        const px = x / width - .5;
        const py = y / height - .5;
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
        card.style.transform = `perspective(1200px) rotateX(${(-py * 1.8).toFixed(2)}deg) rotateY(${(px * 2.2).toFixed(2)}deg) translateY(-5px)`;
        raf = 0;
      };

      card.addEventListener('pointerenter', () => {
        const rect = card.getBoundingClientRect();
        width = rect.width || 1;
        height = rect.height || 1;
      }, { passive: true });

      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
        width = rect.width || 1;
        height = rect.height || 1;
        if (!raf) raf = requestAnimationFrame(paint);
      }, { passive: true });

      card.addEventListener('pointerleave', () => {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        card.style.transform = '';
      }, { passive: true });
    });

    // Project cards use only a cursor-local highlight; no extra transform chain.
    document.querySelectorAll('.business-project-card,.business-standard').forEach((card) => {
      let raf = 0;
      let x = 0;
      let y = 0;
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          card.style.setProperty('--detail-x', `${x}px`);
          card.style.setProperty('--detail-y', `${y}px`);
          raf = 0;
        });
      }, { passive: true });
    });
  }

  // Pause decorative CSS motion when the Business division is not visible.
  // CSS class is cheap and avoids background work while the user is in Performance.
  const syncBusinessMotion = () => {
    document.documentElement.classList.toggle('business-running', document.body.classList.contains('business-mode') && !document.hidden);
  };
  syncBusinessMotion();
  new MutationObserver(syncBusinessMotion).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', syncBusinessMotion, { passive: true });
})();
