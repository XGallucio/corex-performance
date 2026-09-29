(() => {
  'use strict';
  const stage = document.querySelector('#businessOpsStage');
  if (!stage) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = window.matchMedia('(pointer: fine)');
  let visible = false;
  let frame = 0;
  let x = 0;
  let y = 0;

  const enabled = () => visible && !document.hidden && !motion.matches && pointer.matches &&
    document.body.classList.contains('business-mode') && !document.documentElement.classList.contains('paused') &&
    !document.querySelector('#intro')?.open;

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    x = y = 0;
    stage.style.setProperty('--camera-x', '-5deg');
    stage.style.setProperty('--camera-y', '-12deg');
  }
  function sync() {
    stage.classList.toggle('is-active', enabled());
    if (!enabled()) reset();
  }
  function fit() {
    if (stage.clientWidth) stage.style.setProperty('--scene-scale', String(stage.clientWidth / 680));
  }
  fit();
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(stage);
  else window.addEventListener('resize', fit, { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .08 }).observe(stage);
  } else { visible = true; sync(); }

  stage.addEventListener('pointermove', (event) => {
    if (!enabled() || event.pointerType === 'touch') return;
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    x = Math.max(-.5, Math.min(.5, (event.clientX - rect.left) / rect.width - .5));
    y = Math.max(-.5, Math.min(.5, (event.clientY - rect.top) / rect.height - .5));
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!enabled()) return;
      stage.style.setProperty('--camera-x', `${(-5 - y * 8).toFixed(2)}deg`);
      stage.style.setProperty('--camera-y', `${(-12 + x * 12).toFixed(2)}deg`);
    });
  }, { passive: true });
  stage.addEventListener('pointerleave', reset, { passive: true });
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  pointer.addEventListener('change', sync);
  const observer = new MutationObserver(sync);
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  const intro = document.querySelector('#intro');
  if (intro) observer.observe(intro, { attributes: true, attributeFilter: ['open'] });
})();
