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

    const scrollToDivision = () => {
      if (options.scroll === false) return;
      const target = business ? businessSite : performanceSite;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 90, behavior: reducedMotion ? 'auto' : 'smooth' });
    };

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
        if (!document.documentElement.classList.contains('paused') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          requestAnimationFrame(() => businessSite.classList.add('division-enter'));
        }
      } else if (!document.hidden && !document.documentElement.classList.contains('paused') && !intro?.open) {
        video?.play().catch(() => {});
      }
    };

    if (document.startViewTransition && !reducedMotion && !options.instant) {
      document.startViewTransition(apply).updateCallbackDone.then(scrollToDivision).catch(() => {});
    } else {
      apply();
      scrollToDivision();
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
    document.querySelectorAll('.business-project-card,.business-standard,.business-showcase-card').forEach((card) => {
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
          card.style.setProperty('--show-x', `${x}px`);
          card.style.setProperty('--show-y', `${y}px`);
          raf = 0;
        });
      }, { passive: true });
    });
  }

  // Pause decorative CSS motion when the Business division is not visible.
  // CSS class is cheap and avoids background work while the user is in Performance.
  const syncBusinessMotion = () => {
    document.documentElement.classList.toggle('business-running', document.body.classList.contains('business-mode') && !document.hidden && !document.documentElement.classList.contains('paused') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };
  syncBusinessMotion();
  new MutationObserver(syncBusinessMotion).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', syncBusinessMotion, { passive: true });
  new MutationObserver(syncBusinessMotion).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', syncBusinessMotion);
})();

/* =========================================================
   COREX BUSINESS V14 — expanded showcase previews
   ========================================================= */
(() => {
  'use strict';

  const dialog = document.querySelector('#business-showcase-dialog');
  const viewport = document.querySelector('#business-showcase-dialog-viewport');
  const title = document.querySelector('#business-showcase-dialog-title');
  if (!dialog || !viewport) return;

  const projects = {
    nexus: {
      title: 'NEXUS Architecture — Institutional Premium',
      html: `
        <article class="showcase-site showcase-site--nexus">
          <nav class="showcase-site__nav"><b>NEXUS</b><span>STUDIO&nbsp;&nbsp;&nbsp; PROJECTS&nbsp;&nbsp;&nbsp; ABOUT&nbsp;&nbsp;&nbsp; CONTACT</span></nav>
          <section class="showcase-site__hero">
            <div><small>ARCHITECTURE / BRAND EXPERIENCE</small><h3>Spaces built<br>to be remembered.</h3><p>Um conceito institucional pensado para empresas premium: pouco ruído, hierarquia forte, fotografia dominante e sensação editorial.</p><span class="showcase-site__cta">VIEW SELECTED WORK ↗</span></div>
            <div class="showcase-site__hero-visual" aria-hidden="true"></div>
          </section>
          <section class="showcase-site__section"><div class="showcase-site__section-head"><h4>Selected projects.</h4><span>Estrutura preparada para apresentar projetos, história, equipe e contato sem perder o ar sofisticado.</span></div><div class="showcase-site__cards"><article><small>01 / RESIDENTIAL</small><strong>Casa Linha</strong><p>Projeto editorial com destaque para imagem, conceito e detalhes arquitetônicos.</p></article><article><small>02 / COMMERCIAL</small><strong>Vértice</strong><p>Composição modular para mostrar escala, materiais e identidade do espaço.</p></article><article><small>03 / CULTURAL</small><strong>Pavilhão Norte</strong><p>Página de projeto com narrativa longa e foco em autoridade visual.</p></article></div></section>
        </article>`
    },
    atlas: {
      title: 'ATLAS Cloud — SaaS / Dashboard',
      html: `
        <article class="showcase-site showcase-site--atlas">
          <nav class="showcase-site__nav"><b>ATLAS</b><span>PRODUCT&nbsp;&nbsp;&nbsp; SOLUTIONS&nbsp;&nbsp;&nbsp; PRICING&nbsp;&nbsp;&nbsp; LOGIN</span></nav>
          <section class="showcase-site__hero">
            <div><small>OPERATIONS / DATA PLATFORM</small><h3>Run your business<br>with clearer data.</h3><p>Conceito para software B2B com dashboard, métricas, onboarding e páginas de produto com aparência de plataforma madura.</p><span class="showcase-site__cta">START WORKSPACE ↗</span></div>
            <div class="showcase-site__hero-visual" aria-hidden="true"></div>
          </section>
          <section class="showcase-site__section"><div class="showcase-site__section-head"><h4>Product system.</h4><span>Design de software precisa organizar informação antes de tentar impressionar. A estética entra para reforçar leitura e confiança.</span></div><div class="showcase-site__cards"><article><small>01 / DASHBOARD</small><strong>Live overview</strong><p>Indicadores, evolução e alertas organizados em uma visualização limpa.</p></article><article><small>02 / AUTOMATION</small><strong>Smart workflows</strong><p>Fluxos operacionais com estado, prioridade e acompanhamento visual.</p></article><article><small>03 / REPORTING</small><strong>Decision layer</strong><p>Relatórios estruturados para ajudar a transformar dado em ação.</p></article></div></section>
        </article>`
    },
    aura: {
      title: 'AURA Creative — Brand / Campaign',
      html: `
        <article class="showcase-site showcase-site--aura">
          <nav class="showcase-site__nav"><b>AURA</b><span>WORK&nbsp;&nbsp;&nbsp; SERVICES&nbsp;&nbsp;&nbsp; CULTURE&nbsp;&nbsp;&nbsp; CONTACT</span></nav>
          <section class="showcase-site__hero">
            <div><small>CREATIVE STUDIO / CAMPAIGN SYSTEM</small><h3>Brands that<br><em>move.</em></h3><p>Uma linguagem mais ousada para estúdios, lançamentos e campanhas. Tipografia grande, cor, movimento e composição forte.</p><span class="showcase-site__cta">SEE THE CAMPAIGN ↗</span></div>
            <div class="showcase-site__hero-visual" aria-hidden="true"></div>
          </section>
          <section class="showcase-site__section"><div class="showcase-site__section-head"><h4>Creative direction.</h4><span>Uma boa campanha não é só um post bonito. O conceito precisa funcionar no site, social, anúncio e peça de lançamento.</span></div><div class="showcase-site__cards"><article><small>01 / IDENTITY</small><strong>Visual language</strong><p>Tipografia, contraste e ritmo visual pensados como um sistema.</p></article><article><small>02 / SOCIAL</small><strong>Content rollout</strong><p>Desdobramento para posts, carrosséis, teasers e campanhas.</p></article><article><small>03 / LANDING</small><strong>Launch page</strong><p>Página com alto impacto para transformar atenção em ação.</p></article></div></section>
        </article>`
    },
    vanta: {
      title: 'VANTA Commerce — Product Showcase',
      html: `
        <article class="showcase-site showcase-site--vanta">
          <nav class="showcase-site__nav"><b>VANTA</b><span>NEW&nbsp;&nbsp;&nbsp; SHOP&nbsp;&nbsp;&nbsp; OBJECTS&nbsp;&nbsp;&nbsp; LOOKBOOK</span></nav>
          <section class="showcase-site__hero">
            <div><small>DROP / 07 — OBJECT SERIES</small><h3>FORM 01.</h3><p>Conceito de catálogo premium com foco em produto, imagens grandes, navegação simples e uma jornada curta até a ação.</p><span class="showcase-site__cta">EXPLORE COLLECTION ↗</span></div>
            <div class="showcase-site__hero-visual"><div class="showcase-site__product" aria-hidden="true"></div></div>
          </section>
          <section class="showcase-site__section"><div class="showcase-site__section-head"><h4>Designed to sell.</h4><span>Um e-commerce pode ser visualmente forte sem esconder preço, produto, benefício ou próximo passo.</span></div><div class="showcase-site__cards"><article><small>01 / PRODUCT</small><strong>Strong focus</strong><p>Produto e benefícios ficam no centro da interface, sem distrações desnecessárias.</p></article><article><small>02 / CATALOG</small><strong>Fast browsing</strong><p>Grid, filtros e coleções pensados para descoberta rápida.</p></article><article><small>03 / CONVERSION</small><strong>Clear action</strong><p>CTAs, hierarquia e confiança organizados para reduzir fricção.</p></article></div></section>
        </article>`
    }
  };

  const openProject = (key) => {
    const project = projects[key];
    if (!project) return;
    if (title) title.textContent = project.title;
    viewport.innerHTML = project.html;
    viewport.scrollTop = 0;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    document.body.classList.add('showcase-dialog-open');
  };

  document.querySelectorAll('[data-showcase-open]').forEach((button) => {
    button.addEventListener('click', () => openProject(button.dataset.showcaseOpen));
  });

  const closeDialog = () => {
    if (dialog.open && typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    document.body.classList.remove('showcase-dialog-open');
  };

  dialog.querySelector('[data-showcase-close]')?.addEventListener('click', closeDialog);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog();
  });
  dialog.addEventListener('close', () => document.body.classList.remove('showcase-dialog-open'));
})();
