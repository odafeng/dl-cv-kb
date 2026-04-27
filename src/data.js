// ============================================================
// data.js — Backward-compatibility shim
// ============================================================
// All actual data lives in ./data/*.js. This file just re-exports
// so existing modules (graph.js, nav.js, views.js, pdf-modal.js)
// keep working without changing their import paths.
//
// New code should import directly from './data/index.js'.

export * from './data/index.js';
