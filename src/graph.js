// ============================================================
// graph.js — d3 force-directed knowledge graph
// ============================================================
// d3 is loaded via CDN as a global (window.d3) — kept that way
// because mixing ES module + UMD bundle for d3 is more pain than
// it's worth for a single-page viz.

import { P, GRAPH_DATA, SECTION_COLORS, EDGE_COLORS } from './data.js';
import { openPDF } from './pdf-modal.js';

export function renderGraph() {
  const container = document.getElementById('graph-container');
  if (!container) return;
  const W = container.clientWidth;
  const H = container.clientHeight;
  container.innerHTML = '';

  const svg = d3.select(container).append('svg').attr('width', W).attr('height', H);
  const g = svg.append('g');

  // Pan / zoom
  svg.call(d3.zoom().scaleExtent([0.3, 4]).on('zoom', e => g.attr('transform', e.transform)));

  // Deep clone for D3 mutation
  const nodes = GRAPH_DATA.nodes.map(d => ({ ...d }));
  const edges = GRAPH_DATA.edges.map(d => ({ ...d }));

  // Lookup tables
  const paperSec = {};
  const paperTitle = {};
  P.forEach(p => { paperSec[p.id] = p.s; paperTitle[p.id] = p.t; });

  const sim = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(edges).id(d => d.id)
      .distance(d => d.type === 'has_concept' ? 80 : 120)
      .strength(d => d.type === 'has_concept' ? 0.3 : 0.7))
    .force('charge', d3.forceManyBody().strength(d => d.type === 'concept' ? -200 : -400))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide(d => d.type === 'concept' ? 20 : 30));

  // Edges
  const link = g.append('g').selectAll('line').data(edges).join('line')
    .attr('stroke', d => EDGE_COLORS[d.type] || '#333')
    .attr('stroke-width', d => d.type === 'has_concept' ? 0.8 : 1.5)
    .attr('stroke-opacity', d => d.type === 'has_concept' ? 0.15 : 0.5)
    .attr('stroke-dasharray', d => d.type === 'compares' ? '4,3' : 'none');

  // Nodes (with drag)
  const node = g.append('g').selectAll('g').data(nodes).join('g')
    .call(d3.drag()
      .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end',   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

  // Paper nodes — click opens PDF in new tab
  node.filter(d => d.type === 'paper').append('circle')
    .attr('r', 14)
    .attr('fill',  d => (SECTION_COLORS[paperSec[d.id]] || '#666') + '30')
    .attr('stroke', d => SECTION_COLORS[paperSec[d.id]] || '#666')
    .attr('stroke-width', 2)
    .attr('cursor', 'pointer')
    .on('click', (_, d) => { openPDF(d.id); });

  node.filter(d => d.type === 'paper').append('text')
    .text(d => paperTitle[d.id] || d.id)
    .attr('dy', 28)
    .attr('text-anchor', 'middle')
    .attr('fill', '#ccc')
    .attr('font-size', '9px')
    .attr('font-weight', '600')
    .attr('pointer-events', 'none');

  // Concept nodes
  node.filter(d => d.type === 'concept').append('circle')
    .attr('r', d => 6 + d.count * 1.5)
    .attr('fill', '#ffd54f18')
    .attr('stroke', '#ffd54f')
    .attr('stroke-width', 1)
    .attr('stroke-opacity', 0.5);

  node.filter(d => d.type === 'concept').append('text')
    .text(d => d.label)
    .attr('dy', d => 12 + d.count * 1.5)
    .attr('text-anchor', 'middle')
    .attr('fill', '#ffd54f')
    .attr('font-size', '10px')
    .attr('font-weight', '600')
    .attr('opacity', 0.7)
    .attr('pointer-events', 'none');

  // Hover tooltip
  const tooltip = d3.select(container).append('div')
    .style('position', 'absolute').style('background', '#1a1a2e').style('color', '#e6e6f0')
    .style('padding', '5px 10px').style('border-radius', '6px').style('font-size', '11px')
    .style('pointer-events', 'none').style('opacity', 0).style('border', '1px solid #2a2a40')
    .style('z-index', 10);

  node.filter(d => d.type === 'paper')
    .on('mouseenter', (e, d) => {
      link.attr('stroke-opacity', l => (l.source.id === d.id || l.target.id === d.id) ? 0.9 : 0.05)
          .attr('stroke-width', l => (l.source.id === d.id || l.target.id === d.id)
            ? (l.type === 'has_concept' ? 1 : 2.5)
            : (l.type === 'has_concept' ? 0.8 : 1.5));
      const p = P.find(p => p.id === d.id);
      if (p) {
        tooltip.html(`<div style="font-weight:700;margin-bottom:2px">${p.t}</div>
                     <div style="color:#9898ae;font-size:10px">${p.a} · ${p.v}</div>
                     <div style="margin-top:4px;font-size:10px">${p.n || ''}</div>`)
          .style('left', (e.offsetX + 15) + 'px')
          .style('top',  (e.offsetY - 10) + 'px')
          .style('opacity', 1);
      }
    })
    .on('mouseleave', () => {
      link.attr('stroke-opacity', d => d.type === 'has_concept' ? 0.15 : 0.5)
          .attr('stroke-width',  d => d.type === 'has_concept' ? 0.8 : 1.5);
      tooltip.style('opacity', 0);
    });

  sim.on('tick', () => {
    link
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });
}
