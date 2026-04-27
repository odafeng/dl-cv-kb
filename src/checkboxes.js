// ============================================================
// checkboxes.js — checkbox state binding and click delegation
// ============================================================
// Used by `學習路線` and `論文路線圖` views. Each checkbox carries
// a `data-ck` key. State is persisted via store.js (localStorage).

import * as store from './store.js';

/**
 * Apply persisted state to all checkboxes currently in the DOM.
 * Called after each render that contains checkboxes.
 */
export function applyCkState() {
  document.querySelectorAll('.rt input[type=checkbox]').forEach(el => {
    const key = el.dataset.ck;
    if (store.get(key)) {
      el.checked = true;
      el.closest('.rt')?.classList.add('done');
    }
  });
}

/**
 * Toggle handler bound to inline `onchange` on each checkbox.
 */
export function toggleCk(el) {
  const key = el.dataset.ck;
  store.set(key, el.checked);
  el.closest('.rt')?.classList.toggle('done', el.checked);
}

/**
 * Make the entire row clickable (not just the small checkbox).
 * Idempotent: safe to call once at app boot.
 */
export function initRowClickDelegation() {
  document.addEventListener('click', e => {
    const rt = e.target.closest('.rt');
    if (!rt) return;
    if (e.target.tagName === 'INPUT') return; // checkbox handles itself
    const cb = rt.querySelector('input[type=checkbox]');
    if (cb) {
      cb.checked = !cb.checked;
      toggleCk(cb);
    }
  });
}
