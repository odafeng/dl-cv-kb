// ============================================================
// data/index.js — Central re-export hub
// ============================================================
// Combines every data module so callers can do:
//   import { P, CHP, PHASES, ... } from './data/index.js'
// or via the legacy shim at ../data.js (preserved for compat).

export { P, byId, byCat, byYear, byDomain, childrenMap } from './papers/index.js';
export { CATS, CAT_ORDER, ERAS, DOMAINS } from './categories.js';
export { CHP, PHASES } from './chapters.js';
export { LEARN_ROADMAP, PREREQS, PAPER_ROADMAP } from './learning.js';
export { PAGES } from './pages.js';
export { SEC_ORDER, SECTION_COLORS, EDGE_COLORS, GRAPH_DATA } from './graph.js';
