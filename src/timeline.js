// ============================================================
// timeline.js — Tree of Life: time-anchored DAG of paper lineage
// ============================================================
// Layout: hand-crafted "cat-band" where X = year, Y = category band.
// Within a (cat, year) bucket, papers are spread vertically.
// Edges = parent → child bezier curves, drawn beneath nodes.
//
// d3 is loaded as a UMD global from index.html's CDN script tag —
// kept that way to mirror graph.js and avoid mixing module systems.

import { P, childrenMap, byId, CATS, ERAS } from './data.js';
import { openPDF } from './pdf-modal.js';

// Visual constants
const NODE_R_BY_PRI = { 1: 9, 2: 7 };  // 1 = required reading, 2 = recommended
const NODE_R_DEFAULT = 5;

// State that persists across the renderTimeline() lifecycle.
// Module-scoped so the chip click handler can read it.
let filterState = null;     // Set<cat>
let surgicalOnly = false;   // when true, dim non-surgical to ~25%
let nodeSel, edgeSel;       // d3 selections, set in renderTimeline

// ============================================================
// Public entry point
// ============================================================
export function renderTimeline() {
  const container = document.getElementById('timeline-container');
  if (!container) return;

  const W = container.clientWidth;
  const H = container.clientHeight;
  container.innerHTML = '';
  // Make sure the container can position the absolute tooltip
  container.style.position = 'relative';

  const isMobile = W < 600;
  const padding = {
    top: 56,
    right: 24,
    bottom: 36,
    left: isMobile ? 100 : 180,
  };

  // ----- Which cats actually appear in P? Only those get a band. -----
  // Sort by canonical CAT order from categories.js so future cats slot in
  // the same place each render.
  const CAT_KEYS = Object.keys(CATS);
  const catsPresent = [...new Set(P.map(p => p.cat).filter(Boolean))]
    .sort((a, b) => CAT_KEYS.indexOf(a) - CAT_KEYS.indexOf(b));

  if (catsPresent.length === 0 || P.length === 0) {
    container.innerHTML = '<div style="padding:20px;color:var(--mt)">尚無資料</div>';
    return;
  }

  filterState = new Set(catsPresent);
  surgicalOnly = false;

  // ----- Scales -----
  const yearExt = d3.extent(P, p => p.y);
  const xScale = d3.scaleLinear()
    .domain([yearExt[0] - 0.5, yearExt[1] + 0.5])
    .range([padding.left, W - padding.right]);

  const bandH = (H - padding.top - padding.bottom) / catsPresent.length;
  const catY = Object.fromEntries(
    catsPresent.map((c, i) => [c, padding.top + (i + 0.5) * bandH])
  );

  // ----- Compute deterministic positions -----
  // Within each (cat, year) bucket, spread papers symmetrically around the
  // band centerline so multi-paper years don't overlap.
  const positions = {};
  catsPresent.forEach(cat => {
    const papersInCat = P.filter(p => p.cat === cat);
    const yearGroups = d3.group(papersInCat, p => p.y);
    yearGroups.forEach((papers, year) => {
      const x0 = xScale(year);
      const step = bandH * 0.55 / Math.max(papers.length, 1);
      papers.forEach((p, i) => {
        const offset = (i - (papers.length - 1) / 2) * step;
        positions[p.id] = { x: x0, y: catY[cat] + offset, p };
      });
    });
  });

  // ----- SVG canvas -----
  const svg = d3.select(container).append('svg')
    .attr('width', W).attr('height', H)
    .style('display', 'block');

  // Pan/zoom group — everything drawn inside `g` is transformable
  const g = svg.append('g');
  svg.call(d3.zoom()
    .scaleExtent([0.5, 4])
    .filter(event => !event.ctrlKey && event.type !== 'dblclick')
    .on('zoom', e => g.attr('transform', e.transform))
  );

  // ----- Era backdrop bands -----
  const eraLayer = g.append('g').attr('class', 'eras');
  ERAS.forEach(era => {
    const x1 = Math.max(padding.left, xScale(era.start - 0.5));
    const x2 = Math.min(W - padding.right, xScale(era.end + 0.5));
    if (x2 <= x1 + 1) return;  // era not visible in current year range

    eraLayer.append('rect')
      .attr('x', x1).attr('y', padding.top - 24)
      .attr('width', x2 - x1)
      .attr('height', H - padding.top - padding.bottom + 24)
      .attr('fill', era.color).attr('opacity', 0.08);

    eraLayer.append('text')
      .attr('x', (x1 + x2) / 2).attr('y', 16)
      .attr('text-anchor', 'middle')
      .attr('font-size', isMobile ? 9 : 10).attr('font-weight', 600)
      .attr('fill', 'var(--t2)')
      .text(era.name);
  });

  // ----- Year ticks -----
  const xAxis = g.append('g').attr('class', 'x-axis');
  d3.range(yearExt[0], yearExt[1] + 1).forEach(y => {
    xAxis.append('line')
      .attr('x1', xScale(y)).attr('x2', xScale(y))
      .attr('y1', padding.top - 8)
      .attr('y2', H - padding.bottom)
      .attr('stroke', 'var(--bd)').attr('stroke-width', 1)
      .attr('opacity', 0.6);
    xAxis.append('text')
      .attr('x', xScale(y)).attr('y', H - padding.bottom + 16)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10).attr('fill', 'var(--t2)')
      .text(y);
  });

  // ----- Cat-band labels (left rail) -----
  const catLabels = g.append('g').attr('class', 'cat-labels');
  catsPresent.forEach(c => {
    const cfg = CATS[c];
    const labelX = padding.left - (isMobile ? 10 : 14);
    catLabels.append('circle')
      .attr('cx', labelX - (isMobile ? 70 : 150))
      .attr('cy', catY[c])
      .attr('r', 5).attr('fill', cfg.color);
    catLabels.append('text')
      .attr('x', labelX - (isMobile ? 60 : 140))
      .attr('y', catY[c] + 4)
      .attr('font-size', isMobile ? 10 : 11)
      .attr('font-weight', 600)
      .attr('fill', 'var(--t)')
      .text(isMobile ? cfg.icon : `${cfg.icon} ${c}`);
  });

  // ----- Edges -----
  // Built first so they render under nodes
  const edges = [];
  P.forEach(child => {
    (child.parents || []).forEach(pid => {
      const parent = byId(pid);
      if (parent && positions[pid] && positions[child.id]) {
        edges.push({ source: parent, target: child });
      }
    });
  });

  edgeSel = g.append('g').attr('class', 'edges').selectAll('path')
    .data(edges).enter().append('path')
    .attr('d', d => bezierPath(positions[d.source.id], positions[d.target.id]))
    .attr('fill', 'none')
    .attr('stroke', 'var(--bd)').attr('stroke-width', 1.4)
    .attr('opacity', 0.65)
    .style('pointer-events', 'none');

  // ----- Nodes -----
  nodeSel = g.append('g').attr('class', 'nodes').selectAll('g')
    .data(P.filter(p => p.cat && positions[p.id])).enter()
    .append('g')
    .attr('transform', d => `translate(${positions[d.id].x},${positions[d.id].y})`)
    .style('cursor', 'pointer');

  nodeSel.append('circle')
    .attr('r', d => NODE_R_BY_PRI[d.pri] || NODE_R_DEFAULT)
    .attr('fill', d => CATS[d.cat]?.color || '#888')
    .attr('stroke', 'var(--bg)').attr('stroke-width', 2);

  // Inline label for high-priority papers (pri 1) — saves a hover
  nodeSel.filter(d => d.pri === 1)
    .append('text')
    .attr('y', d => -(NODE_R_BY_PRI[d.pri] || NODE_R_DEFAULT) - 4)
    .attr('text-anchor', 'middle')
    .attr('font-size', 9).attr('font-weight', 700)
    .attr('fill', 'var(--t)')
    .attr('pointer-events', 'none')
    .text(d => d.id);

  // ----- Tooltip -----
  const tooltip = d3.select(container).append('div')
    .attr('class', 'tl-tooltip')
    .style('position', 'absolute')
    .style('pointer-events', 'none')
    .style('background', 'var(--card)')
    .style('border', '1px solid var(--bd)')
    .style('border-radius', '6px')
    .style('padding', '8px 10px')
    .style('font-size', '11px')
    .style('color', 'var(--t)')
    .style('opacity', 0)
    .style('max-width', '260px')
    .style('z-index', 100)
    .style('transition', 'opacity .12s');

  // ----- Hover & click -----
  nodeSel
    .on('mouseover', function (event, d) {
      const lineage = lineageOf(d.id);
      // Dim non-lineage nodes (but only among visible cats)
      nodeSel.style('opacity', n =>
        filterState.has(n.cat) && lineage.has(n.id) ? 1 : 0.12
      );
      // Highlight lineage edges in accent blue
      edgeSel
        .attr('stroke', e =>
          lineage.has(e.source.id) && lineage.has(e.target.id)
            ? 'var(--ac)' : 'var(--bd)'
        )
        .attr('stroke-width', e =>
          lineage.has(e.source.id) && lineage.has(e.target.id) ? 2 : 1.2
        )
        .attr('opacity', e =>
          lineage.has(e.source.id) && lineage.has(e.target.id) ? 0.95 : 0.06
        );

      const rect = container.getBoundingClientRect();
      tooltip.style('opacity', 1)
        .style('left', `${Math.min(event.clientX - rect.left + 14, W - 280)}px`)
        .style('top', `${event.clientY - rect.top + 14}px`)
        .html(`
          <div style="font-weight:700;margin-bottom:4px">${escapeHtml(d.t)}</div>
          <div style="color:var(--t2);font-size:10px;margin-bottom:6px">
            ${escapeHtml(d.a)} · ${escapeHtml(d.v)}
          </div>
          <div style="color:var(--ttx);font-size:10px">
            ${(d.tg || []).slice(0, 4).map(escapeHtml).join(' · ')}
          </div>
          <div style="color:var(--mt);font-size:9px;margin-top:6px">
            點擊開啟 PDF
          </div>
        `);
    })
    .on('mousemove', function (event) {
      const rect = container.getBoundingClientRect();
      tooltip
        .style('left', `${Math.min(event.clientX - rect.left + 14, W - 280)}px`)
        .style('top', `${event.clientY - rect.top + 14}px`);
    })
    .on('mouseout', function () {
      applyFilter();
      tooltip.style('opacity', 0);
    })
    .on('click', function (event, d) {
      openPDF(d.id);
    });

  // ----- Chip bar -----
  buildChipBar(catsPresent);
}

// ============================================================
// Internal helpers
// ============================================================

function bezierPath(s, t) {
  // S-curve: control points horizontally midway between endpoints
  const mx = (s.x + t.x) / 2;
  return `M${s.x},${s.y} C${mx},${s.y} ${mx},${t.y} ${t.x},${t.y}`;
}

// BFS through both ancestors and descendants of `id`
function lineageOf(id) {
  const set = new Set([id]);

  // Walk up via paper.parents
  const upQueue = [id];
  while (upQueue.length) {
    const cur = upQueue.shift();
    const p = byId(cur);
    (p?.parents || []).forEach(pid => {
      if (!set.has(pid)) { set.add(pid); upQueue.push(pid); }
    });
  }

  // Walk down via precomputed childrenMap
  const downQueue = [id];
  while (downQueue.length) {
    const cur = downQueue.shift();
    (childrenMap.get(cur) || []).forEach(cid => {
      if (!set.has(cid)) { set.add(cid); downQueue.push(cid); }
    });
  }

  return set;
}

function applyFilter() {
  if (!nodeSel || !edgeSel) return;
  const visible = d => filterState.has(d.cat) && (!surgicalOnly || d.domain === 'surgical');
  nodeSel.style('opacity', d => visible(d) ? 1 : (surgicalOnly && filterState.has(d.cat) ? 0.18 : 0.08));
  edgeSel
    .attr('stroke', 'var(--bd)').attr('stroke-width', 1.4)
    .attr('opacity', e => {
      const sV = visible(e.source), tV = visible(e.target);
      if (sV && tV) return 0.65;
      // In surgical-only mode, keep "leads-to-surgical" edges faintly visible
      if (surgicalOnly && (e.target.domain === 'surgical' || e.source.domain === 'surgical')) return 0.25;
      return 0.05;
    });
}

function buildChipBar(catsPresent) {
  const chipBar = document.getElementById('timeline-chips');
  if (!chipBar) return;

  // Surgical-only toggle (separate from cat filter chips)
  const surgicalToggle = `<button class="tl-surg-toggle"
    style="background:transparent;border:1px dashed #ff905077;color:#ff9050;
    padding:4px 12px;border-radius:14px;font-size:11px;cursor:pointer;font-weight:700;
    transition:all .15s;margin-right:8px">
    🏥 Surgical only</button>`;

  const chips = catsPresent.map(c => {
    const cfg = CATS[c];
    const count = P.filter(p => p.cat === c).length;
    return `<button class="tl-chip" data-cat="${c}"
      style="background:${cfg.color}22;border:1px solid ${cfg.color};color:${cfg.color};
      padding:4px 10px;border-radius:14px;font-size:11px;cursor:pointer;font-weight:600;
      transition:opacity .15s">
      ${cfg.icon} ${c} (${count})</button>`;
  }).join('');

  chipBar.innerHTML = surgicalToggle + chips;

  // Cat filter chips
  chipBar.querySelectorAll('.tl-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      if (filterState.has(cat)) {
        filterState.delete(cat);
        btn.style.opacity = '0.35';
      } else {
        filterState.add(cat);
        btn.style.opacity = '1';
      }
      applyFilter();
    });
  });

  // Surgical-only toggle
  chipBar.querySelector('.tl-surg-toggle').addEventListener('click', e => {
    surgicalOnly = !surgicalOnly;
    e.target.style.background = surgicalOnly ? '#ff905033' : 'transparent';
    e.target.style.borderStyle = surgicalOnly ? 'solid' : 'dashed';
    applyFilter();
  });
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
  }[c]));
}
