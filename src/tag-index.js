// ============================================================
// tag-index.js — Tag index page
// ============================================================
// Browsable index of every tag across all papers. Tags are
// grouped by the paper's category so the user can scan
// "what concepts exist in SSL" vs "what concepts exist in
// segmentation" side by side.
//
// Unlike a frequency-sized word cloud (most tags appear only
// once in this KB), this layout treats tags as categorical
// shortcuts — click a tag → run a search restricted to that
// term across all papers.

import { P, CATS, CAT_ORDER } from './data.js';

export function renderTagIndex() {
  const container = document.getElementById('tag-index-container');
  if (!container) return;

  // Build {cat: Map<tag, count>} index. Iterate paper.tg and bucket
  // into the paper's cat. A tag appearing in two cats shows in both
  // (intentional — surfaces cross-cat concepts like "self-distillation").
  const byCat = {};
  P.forEach(p => {
    if (!p.cat || !p.tg) return;
    if (!byCat[p.cat]) byCat[p.cat] = new Map();
    p.tg.forEach(t => {
      const m = byCat[p.cat];
      m.set(t, (m.get(t) || 0) + 1);
    });
  });

  // Render in canonical CAT_ORDER so position is stable as papers grow
  const html = CAT_ORDER
    .filter(c => byCat[c])
    .map(c => renderCatBlock(c, byCat[c]))
    .join('');

  container.innerHTML = html || '<div style="color:var(--mt)">尚無標籤資料</div>';

  // Tag click → run search with the tag as query.
  // doSearch is exposed on window by app.js.
  container.querySelectorAll('.tag-pill').forEach(el => {
    el.addEventListener('click', () => {
      window.doSearch(el.dataset.tag);
    });
  });
}

function renderCatBlock(cat, tagMap) {
  const cfg = CATS[cat] || { color: '#888', icon: '📌' };
  // Sort: most-frequent first (so multi-paper tags stand out), then alpha.
  const sorted = [...tagMap.entries()].sort((a, b) =>
    b[1] - a[1] || a[0].localeCompare(b[0])
  );

  const pills = sorted.map(([tag, n]) => {
    const heavy = n >= 2;
    const bg   = heavy ? cfg.color + '33' : cfg.color + '15';
    const bd   = heavy ? cfg.color + 'aa' : cfg.color + '44';
    const fw   = heavy ? 700 : 500;
    return `<span class="tag-pill" data-tag="${escapeAttr(tag)}"
      style="display:inline-block;background:${bg};border:1px solid ${bd};color:${cfg.color};
      padding:3px 10px;border-radius:12px;font-size:11px;font-weight:${fw};
      cursor:pointer;margin:3px;transition:all .15s"
      title="${n} 篇">${escapeHtml(tag)}${heavy ? ` <span style="opacity:.6">×${n}</span>` : ''}</span>`;
  }).join('');

  return `<div style="margin-bottom:24px">
    <div style="font-size:13px;font-weight:700;margin-bottom:8px;color:${cfg.color}">
      ${cfg.icon} ${cat}
      <span style="color:var(--mt);font-size:11px;font-weight:400;margin-left:6px">
        ${tagMap.size} 個獨特標籤
      </span>
    </div>
    <div>${pills}</div>
  </div>`;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
  }[c]));
}

function escapeAttr(s) {
  return String(s).replace(/"/g, '&quot;').replace(/'/g, "&#39;");
}
