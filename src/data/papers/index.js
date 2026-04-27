// ============================================================
// papers/index.js — combine all paper sources
// ============================================================
// Adding a new category in Phase 3:
//   1. Create ./architecture.js (or ssl.js, segmentation.js, ...)
//      exporting `export const ARCH_PAPERS = [...]`
//   2. Import and spread it into P below
//   3. Done — graph, search, sidebar all auto-pick it up

import { SURGICAL_PAPERS } from './surgical.js';

// ----- Combined paper list (the public `P`) -----
export const P = [
  ...SURGICAL_PAPERS,
  // ...ARCH_PAPERS,
  // ...SSL_PAPERS,
  // ...SEMI_SL_PAPERS,
  // ...SEG_PAPERS,
  // etc.
];

// ----- Helpers (used by future timeline / filter views) -----
export const byId  = id => P.find(p => p.id === id);
export const byCat = cat => P.filter(p => p.cat === cat);
export const byYear = y => P.filter(p => p.y === y);
export const byDomain = d => P.filter(p => p.domain === d);

// Build child-of-X lookup once; saves O(n²) in lineage traversal
export const childrenMap = (() => {
  const m = new Map();
  P.forEach(p => {
    (p.parents || []).forEach(pid => {
      if (!m.has(pid)) m.set(pid, []);
      m.get(pid).push(p.id);
    });
  });
  return m;
})();
