'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Exercise the scene through its public browser events. Keep rendering mocked;
// the regressions here concern scheduling and lifecycle, not CSS pixel output.
const mutations = [];
class Surface {
  constructor(classes = []) {
    this.listeners = new Map();
    this.styles = new Map();
    this.tokens = new Set(classes);
    this.classList = {
      contains: (token) => this.tokens.has(token),
      toggle: (token, force = !this.tokens.has(token)) => {
        if (this.tokens.has(token) !== force) {
          if (force) this.tokens.add(token);
          else this.tokens.delete(token);
          mutations.push(this);
        }
        return force;
      }
    };
    this.style = { setProperty: (name, value) => this.styles.set(name, value) };
    this.clientWidth = 0;
  }
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }
  emit(type, details = {}) {
    for (const listener of this.listeners.get(type) || []) listener({ type, ...details });
  }
  getBoundingClientRect() {
    return { left: 0, top: 0, width: this.clientWidth, height: this.clientWidth * .85 };
  }
}

const stage = new Surface();
const body = new Surface();
const html = new Surface();
const intro = new Surface();
intro.open = false;
const document = new Surface();
Object.assign(document, {
  body, documentElement: html, hidden: false,
  querySelector: (selector) => selector === '#businessOpsStage' ? stage : selector === '#intro' ? intro : null
});
const motion = new Surface();
motion.matches = false;
const pointer = new Surface();
pointer.matches = true;
const window = new Surface();
window.matchMedia = (query) => query.includes('reduced-motion') ? motion : pointer;
window.ResizeObserver = true;
window.IntersectionObserver = true;
const observerRecords = [];
let resize;
let intersection;
class ResizeObserver {
  constructor(callback) { resize = callback; }
  observe() {}
}
class IntersectionObserver {
  constructor(callback) { intersection = callback; }
  observe() {}
}
class MutationObserver {
  constructor(callback) { this.callback = callback; }
  observe(target) { observerRecords.push({ target, callback: this.callback }); }
}
let nextFrame = 0;
const frames = new Map();
const requestAnimationFrame = (callback) => {
  frames.set(++nextFrame, callback);
  return nextFrame;
};
const cancelAnimationFrame = (id) => frames.delete(id);
function settleMutations() {
  let delivered = 0;
  while (mutations.length) {
    assert.ok(++delivered < 30, 'Class synchronization must settle without an observer loop');
    const target = mutations.shift();
    for (const record of observerRecords) if (record.target === target) record.callback([]);
  }
}
function flushFrame() {
  const pending = [...frames.values()];
  frames.clear();
  for (const callback of pending) callback(16);
}
function camera() {
  return [stage.styles.get('--camera-x'), stage.styles.get('--camera-y')];
}
function move() {
  stage.emit('pointermove', { clientX: stage.clientWidth * .85, clientY: stage.clientWidth * .65, pointerType: 'mouse' });
}
function assertInactive(label) {
  assert.equal(stage.classList.contains('is-active'), false, label);
  assert.equal(frames.size, 0, `${label}: cancel pending pointer paint`);
  assert.deepEqual(camera(), restingCamera, `${label}: restore resting camera`);
  move();
  assert.equal(frames.size, 0, `${label}: reject further pointer work`);
}

vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'business-scene.js'), 'utf8'), {
  document, window, ResizeObserver, IntersectionObserver, MutationObserver,
  requestAnimationFrame, cancelAnimationFrame
}, { filename: 'business-scene.js' });

assert.equal(stage.styles.has('--scene-scale'), false, 'Initially hidden scene must not store a zero scale');
intersection([{ isIntersecting: false }]);
const restingCamera = camera();

// Switching from a hidden division must resize and activate without needing
// a window resize or a pointer event.
body.classList.toggle('business-mode', true);
settleMutations();
stage.clientWidth = 540;
resize();
intersection([{ isIntersecting: true }]);
assert.equal(stage.classList.contains('is-active'), true);
const firstScale = Number(stage.styles.get('--scene-scale'));
assert.ok(Number.isFinite(firstScale) && firstScale > 0, 'Visible scene gets a valid scale');
stage.clientWidth = 340;
resize();
assert.ok(Number(stage.styles.get('--scene-scale')) < firstScale, 'Narrower scene scales down');
stage.clientWidth = 0;
resize();
assert.ok(Number(stage.styles.get('--scene-scale')) > 0, 'Hiding preserves the last usable scale');
stage.clientWidth = 540;
resize();

// A leave event must cancel the queued paint, otherwise the camera can become
// tilted again after the pointer has already left.
move();
assert.equal(frames.size, 1);
move();
assert.equal(frames.size, 1, 'Pointer events coalesce into one frame');
stage.emit('pointerleave');
assert.equal(frames.size, 0);
flushFrame();
assert.deepEqual(camera(), restingCamera);
move();
flushFrame();
assert.notDeepEqual(camera(), restingCamera, 'Active scene reacts to the pointer');

move();
html.classList.toggle('paused', true);
settleMutations();
assertInactive('Manual pause');
html.classList.toggle('paused', false);
settleMutations();
assert.equal(stage.classList.contains('is-active'), true, 'Unpausing restores interaction');

move();
motion.matches = true;
motion.emit('change');
assertInactive('Reduced motion changed during use');
motion.matches = false;
motion.emit('change');
assert.equal(stage.classList.contains('is-active'), true);

move();
body.classList.toggle('business-mode', false);
settleMutations();
assertInactive('Performance division selected');
body.classList.toggle('business-mode', true);
settleMutations();
assert.equal(stage.classList.contains('is-active'), true, 'Returning to Business restores interaction');
assert.deepEqual(camera(), restingCamera, 'Returning does not restore stale pointer tilt');

move();
document.hidden = true;
document.emit('visibilitychange');
assertInactive('Browser tab hidden');
document.hidden = false;
document.emit('visibilitychange');
assert.equal(stage.classList.contains('is-active'), true);

move();
intersection([{ isIntersecting: false }]);
assertInactive('Scene outside viewport');
intersection([{ isIntersecting: true }]);
assert.equal(stage.classList.contains('is-active'), true);

move();
pointer.matches = false;
pointer.emit('change');
assertInactive('Fine pointer no longer available');
pointer.matches = true;
pointer.emit('change');
assert.equal(stage.classList.contains('is-active'), true);
stage.emit('pointermove', { clientX: 100, clientY: 100, pointerType: 'touch' });
assert.equal(frames.size, 0, 'Touch scrolling does not schedule camera movement');

intro.open = true;
for (const record of observerRecords) if (record.target === intro) record.callback([]);
assertInactive('Intro dialog opened');
intro.open = false;
for (const record of observerRecords) if (record.target === intro) record.callback([]);
assert.equal(stage.classList.contains('is-active'), true);
settleMutations();

console.log('Business scene lifecycle: all checks passed.');
