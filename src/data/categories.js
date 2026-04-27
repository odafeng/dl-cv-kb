// ============================================================
// categories.js — Category taxonomy + era definitions
// ============================================================
// CAT (top-level): broad technical area
// SUB: sub-area within CAT
// DOMAIN: "general" (foundational/CV-wide) or "surgical" (surgical-specific)
// ERA: time period (used by Tree of Life timeline view)

// ----- Top-level categories -----
export const CATS = {
  Architecture:        { color: "#6688ff", icon: "🏗️" },
  SSL:                 { color: "#9d65ff", icon: "🧠" },  // self-supervised
  SemiSL:              { color: "#65bbff", icon: "🌗" },  // semi-supervised
  Segmentation:        { color: "#ffb464", icon: "✂️"  },
  Detection:           { color: "#ff8c42", icon: "🎯" },
  Generative:          { color: "#ff7eb3", icon: "🎨" },
  VLM:                 { color: "#ff6b9d", icon: "💬" },  // vision-language
  VideoUnderstanding:  { color: "#78dca0", icon: "🎬" },
  Benchmark:           { color: "#a0a0a0", icon: "📊" },
};

export const CAT_ORDER = [
  "Architecture", "SSL", "SemiSL", "Segmentation",
  "Detection", "Generative", "VLM", "VideoUnderstanding", "Benchmark",
];

// ----- Eras (used as backdrop on timeline) -----
export const ERAS = [
  { id: "pre_dl",      name: "Pre-DL",          start: 2000, end: 2011, color: "#3a3a3a" },
  { id: "cnn_era",     name: "CNN Era",         start: 2012, end: 2019, color: "#446688" },
  { id: "transformer", name: "Transformer Era", start: 2020, end: 2022, color: "#665588" },
  { id: "fm_era",      name: "Foundation Model Era", start: 2023, end: 2030, color: "#886655" },
];

// ----- Domain split -----
export const DOMAINS = {
  general:  { label: "通用 CV",     color: "#7a8aff" },
  surgical: { label: "手術影像",     color: "#ff9050" },
};
