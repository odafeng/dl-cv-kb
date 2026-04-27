// ============================================================
// store.js — localStorage wrapper for persistent client-side state
// ============================================================
// Replaces the previous Supabase storage backend. All state is
// per-device (no cross-device sync), which is intentional: this
// app is a personal reading tracker, not a shared workspace.

const KEY = 'phd-kb:checkboxes';

let cache = (() => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('[store] failed to read localStorage:', e);
    return {};
  }
})();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('[store] failed to write localStorage:', e);
  }
}

export function get(key) {
  return cache[key];
}

export function set(key, value) {
  cache[key] = value;
  persist();
}

export function getAll() {
  return cache;
}

export function clear() {
  cache = {};
  persist();
}
