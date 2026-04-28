// ============================================================
// nav.js — sidebar, search, view-switching
// ============================================================

import { P, SEC_ORDER, PAGES } from './data.js';
import { renderP, renderS, pcHTML } from './views.js';

const $ = id => document.getElementById(id);

let currentView = 'overview';

export function getView() { return currentView; }

// ----- Sidebar nav build -----
export function buildNav() {
  let h = '';
  PAGES.forEach(p => {
    if (p.id.startsWith('_sep')) {
      // Section header — same style as the "文獻分類" header below
      h += `<div class="ns">${p.t}</div>`;
    } else {
      h += `<button class="nb" data-id="${p.id}" onclick="showP('${p.id}')">${p.icon} ${p.t}</button>`;
    }
  });
  h += `<div class="ns">手術文獻分類</div>`;
  SEC_ORDER.forEach(s => {
    h += `<button class="nb" data-id="s_${s}" onclick="showS('${s}')">📄 ${s}</button>`;
  });
  $('nv').innerHTML = h;
}

function updNav() {
  document.querySelectorAll('.nb').forEach(b => b.classList.remove('on'));
  const b = document.querySelector(`.nb[data-id="${currentView}"]`);
  if (b) b.classList.add('on');
}

// ----- Mobile sidebar toggle -----
export function toggleSB() {
  const sb = $('sb'), ov = $('overlay'), btn = $('mbtn');
  const open = sb.classList.toggle('open');
  ov.classList.toggle('show', open);
  btn.textContent = open ? '✕' : '☰';
}

function closeSB() {
  $('sb').classList.remove('open');
  $('overlay').classList.remove('show');
  $('mbtn').textContent = '☰';
}

// ----- View switching -----
export function showP(id) {
  currentView = id;
  $('mn').style.display = 'block';
  updNav();
  renderP(id);
  closeSB();
}

export function showS(s) {
  currentView = `s_${s}`;
  $('mn').style.display = 'block';
  updNav();
  renderS(s);
  closeSB();
}

// ----- Search -----
// Domain filter persists across searches. Default to surgical-only since
// this KB started life as a PhD thesis tool — generalist papers are
// reference material, not the primary haystack.
let searchDomain = 'surgical';

export function setSearchDomain(d) { searchDomain = d; }

export function doSearch(q) {
  // Sync both search inputs
  if ($('ssearch').value !== q) $('ssearch').value = q;
  if ($('msearch').value !== q) $('msearch').value = q;
  q = q.trim().toLowerCase();

  if (!q) {
    // Restore current view
    if (currentView.startsWith('s_')) showS(currentView.slice(2));
    else                              showP(currentView);
    return;
  }

  // Match against text first, then narrow by domain.
  // Sort: pri 1 (must-read) → pri 2 → others; ties broken by year desc.
  const results = P
    .filter(p => {
      if (searchDomain !== 'all' && p.domain !== searchDomain) return false;
      const hay = [p.t, p.a, p.v, p.n, p.s, ...(p.tg || []), p.cat, p.sub]
        .filter(Boolean).join(' ').toLowerCase();
      return q.split(/\s+/).every(w => hay.includes(w));
    })
    .sort((a, b) => (a.pri || 9) - (b.pri || 9) || (b.y || 0) - (a.y || 0));

  const m = $('mn');
  m.style.display = 'block';

  // Domain filter chip bar — sits above the results
  const counts = {
    surgical: P.filter(p => p.domain === 'surgical' && matchText(p, q)).length,
    general:  P.filter(p => p.domain === 'general'  && matchText(p, q)).length,
  };
  const chip = (val, label, n) => {
    const active = searchDomain === val;
    return `<button onclick="setSearchDomain('${val}');doSearch('${escapeAttr(q)}')"
      style="background:${active?'var(--ac)':'transparent'};color:${active?'#fff':'var(--t2)'};
      border:1px solid ${active?'var(--ac)':'var(--bd)'};padding:4px 12px;border-radius:14px;
      font-size:11px;cursor:pointer;font-weight:600;margin-right:6px">
      ${label} (${n})</button>`;
  };
  const filterBar = `<div style="margin-bottom:14px">
    ${chip('surgical', '🏥 手術專區', counts.surgical)}
    ${chip('general',  '🌐 通用 CV', counts.general)}
    ${chip('all',      '📚 全部', counts.surgical + counts.general)}
  </div>`;

  if (!results.length) {
    m.innerHTML = `<h2>🔍 搜尋：${q}</h2>${filterBar}
      <div style="color:var(--mt);font-size:13px;padding:20px 0">
        在「${searchDomain === 'surgical' ? '手術專區' : searchDomain === 'general' ? '通用 CV' : '全部'}」找不到符合的文獻。試試其他關鍵字或切換上方類別？
      </div>`;
    return;
  }

  m.innerHTML = `<h2>🔍 搜尋：${q}</h2>${filterBar}
    <div style="font-size:12px;color:var(--mt);margin-bottom:14px">找到 ${results.length} 篇文獻（依優先度排序）</div>
    ${results.map(pcHTML).join('')}`;
}

// Helper: text-match alone (no domain filter), used to count category sizes
function matchText(p, q) {
  const hay = [p.t, p.a, p.v, p.n, p.s, ...(p.tg || []), p.cat, p.sub]
    .filter(Boolean).join(' ').toLowerCase();
  return q.split(/\s+/).every(w => hay.includes(w));
}

function escapeAttr(s) {
  return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
