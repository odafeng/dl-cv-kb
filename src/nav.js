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
    h += `<button class="nb" data-id="${p.id}" onclick="showP('${p.id}')">${p.icon} ${p.t}</button>`;
  });
  h += `<div class="ns">文獻分類</div>`;
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

  const results = P.filter(p => {
    const hay = [p.t, p.a, p.v, p.n, p.s, ...p.tg].join(' ').toLowerCase();
    return q.split(/\s+/).every(w => hay.includes(w));
  });

  const m = $('mn');
  m.style.display = 'block';

  if (!results.length) {
    m.innerHTML = `<h2>🔍 搜尋：${q}</h2>
      <div style="color:var(--mt);font-size:13px;padding:20px 0">找不到符合的文獻。試試其他關鍵字？</div>`;
    return;
  }

  m.innerHTML = `<h2>🔍 搜尋：${q}</h2>
    <div style="font-size:12px;color:var(--mt);margin-bottom:14px">找到 ${results.length} 篇文獻</div>
    ${results.map(pcHTML).join('')}`;
}
