// ============================================================
// pages.js — Sidebar navigation pages
// ============================================================

// id starting with "_sep" renders as a section header instead of a button.
// This lets us visually group "general DL/CV" pages above and the
// "Surgical AI Application" sub-module below without hiding anything.
export const PAGES = [
  // Core DL/CV navigation
  {id:"overview",      icon:"🎯",  t:"概覽"},
  {id:"timeline",      icon:"🌳",  t:"演化樹"},
  {id:"graph",         icon:"🕸️",  t:"知識圖譜"},
  {id:"tags",          icon:"🏷️",  t:"標籤索引"},

  // Surgical AI Application sub-module
  {id:"_sep_surgical", t:"🏥 Surgical AI 應用"},
  {id:"phases",        icon:"🔬",  t:"9-Phase Schema"},
  {id:"roadmap_learn", icon:"📖",  t:"學習路線"},
  {id:"prereqs",       icon:"📚",  t:"先備知識"},
  {id:"roadmap",       icon:"🗺️",  t:"論文路線圖"},
];
