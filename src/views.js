// ============================================================
// views.js — render functions for every page and section
// ============================================================
// Pure-render module: turns data (from data.js) into HTML strings
// and writes them to #mn. No global state, no Supabase, no PDF reader.

import { P, CHP, PHASES, LEARN_ROADMAP, PREREQS, PAPER_ROADMAP } from './data.js';
import { applyCkState } from './checkboxes.js';
import { renderGraph } from './graph.js';
import { renderTimeline } from './timeline.js';

const $ = id => document.getElementById(id);

// ----- Paper card (used in section views and search results) -----
export function pcHTML(p) {
  const lk = [];
  if (p.doi) lk.push(`<a class="lb" href="https://doi.org/${p.doi}" target="_blank" rel="noopener">DOI↗</a>`);
  if (p.ax)  lk.push(`<a class="lb" href="https://arxiv.org/abs/${p.ax}" target="_blank" rel="noopener">arXiv↗</a>`);
  if (p.gh)  lk.push(`<a class="lb" href="https://github.com/${p.gh}" target="_blank" rel="noopener">GitHub↗</a>`);
  if (p.pmc) lk.push(`<a class="lb" href="https://pmc.ncbi.nlm.nih.gov/articles/${p.pmc}/" target="_blank" rel="noopener">PMC↗</a>`);
  // Open PDF in modal overlay — bypasses PWA / mobile force-download behaviour
  lk.push(`<button class="lb rb" onclick="openPDF('${p.id}')">📖 開啟 PDF</button>`);

  const priTag = p.pri
    ? `<span style="font-size:9px;padding:2px 6px;border-radius:8px;background:${p.pri===1?'rgba(255,180,100,.15)':'rgba(120,220,160,.12)'};color:${p.pri===1?'#ffb464':'#78dca0'};font-weight:700;margin-left:6px">${p.pri===1?'必讀':'推薦'}</span>`
    : '';

  return `<div class="pc">
    <div class="pt">${p.t}${priTag}</div>
    <div class="pm">${p.a} — ${p.v}</div>
    <div class="ptg">${p.tg.map(t=>`<span>${t}</span>`).join('')}</div>
    <div class="pn">${p.n}</div>
    <div class="pl">${lk.join('')}</div>
  </div>`;
}

// ----- Section view: list all papers in one category -----
export function renderS(sec) {
  const papers = P.filter(p => p.s === sec);
  $('mn').innerHTML = `<h2>📄 ${sec}</h2>${papers.map(pcHTML).join('')}`;
}

// ----- Page view dispatcher -----
export function renderP(id) {
  const m = $('mn');
  if (id === 'overview')        return renderOverview(m);
  if (id === 'graph')           return renderGraphPage(m);
  if (id === 'timeline')        return renderTimelinePage(m);
  if (id === 'phases')          return renderPhasesPage(m);
  if (id === 'roadmap_learn')   return renderLearnRoadmap(m);
  if (id === 'prereqs')         return renderPrereqs(m);
  if (id === 'roadmap')         return renderPaperRoadmap(m);
}

// ----- Overview -----
function renderOverview(m) {
  m.innerHTML = `<h2>🎯 論文概覽</h2>
    <div style="font-size:20px;font-weight:800;margin-bottom:3px">機器人全直腸繫膜切除術之手術影像分析</div>
    <div style="font-size:12px;color:var(--mt);margin-bottom:18px">博士論文 — 成功大學資工系</div>
    <div style="font-size:13px;font-weight:700;margin-bottom:8px">論文架構</div>
    ${CHP.map(ch => `
      <div class="pc" style="display:flex;align-items:center;gap:12px;cursor:pointer" onclick="showChapter(${ch.n})">
        <div class="phase-num" style="color:${ch.color};background:${ch.color}18">${ch.n}</div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:13px">${ch.t}
            <span style="font-size:9px;color:var(--ac);background:var(--acs);padding:2px 7px;border-radius:10px;margin-left:5px">${ch.sub}</span>
          </div>
          <div style="font-size:11.5px;color:var(--t2);margin-top:1px">${ch.q.slice(0,50)}...</div>
        </div>
        <span style="color:var(--mt);font-size:14px">›</span>
      </div>`).join('')}
    <div style="font-size:13px;font-weight:700;margin:16px 0 8px">競爭優勢</div>
    <div class="pc">${[
      "約100台達文西TME影像＋9階段標註",
      "全球首個機器人TME階段辨識資料集",
      "大腸直腸外科專科醫師擔任專家標註者",
      "結合ctpelvimetry術前評估＋PostOp PWA術後照護"
    ].map(a => `<div style="display:flex;gap:7px;margin-bottom:4px"><span style="color:var(--ac);font-weight:700;font-size:12px">→</span><span style="font-size:12px;color:var(--t2)">${a}</span></div>`).join('')}</div>`;
}

// ----- Knowledge graph page -----
function renderGraphPage(m) {
  m.innerHTML = `<h2>🕸️ 知識圖譜</h2>
    <div style="font-size:12px;color:var(--t2);margin-bottom:12px">拖曳節點探索論文關聯 · 點擊論文節點開啟 PDF · 滾輪縮放</div>
    <div id="graph-container" style="width:100%;height:calc(100vh - 140px);border:1px solid var(--bd);border-radius:10px;overflow:hidden;background:#0a0a14"></div>
    <div id="graph-legend" style="display:flex;gap:16px;margin-top:10px;flex-wrap:wrap">
      <span style="font-size:11px;color:var(--t2)"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#6688ff;margin-right:4px"></span>空間骨幹</span>
      <span style="font-size:11px;color:var(--t2)"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#78dca0;margin-right:4px"></span>時序建模</span>
      <span style="font-size:11px;color:var(--t2)"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ff7eb3;margin-right:4px"></span>視覺語言</span>
      <span style="font-size:11px;color:var(--t2)"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ffb464;margin-right:4px"></span>平面辨識</span>
      <span style="font-size:11px;color:var(--t2)"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#e0e0e0;margin-right:4px"></span>基準挑戰</span>
      <span style="font-size:11px;color:var(--t2)"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ffd54f;margin-right:4px;opacity:.7"></span>共享概念</span>
    </div>`;
  renderGraph();
}

// ----- Tree of Life timeline -----
function renderTimelinePage(m) {
  m.innerHTML = `<h2>🌳 演化樹 (Tree of Life)</h2>
    <div style="font-size:12px;color:var(--t2);margin-bottom:10px">
      X 軸 = 年份 · Y 軸 = 技術類別 · 連線 = 父→子論文血緣 ·
      Hover 高亮整條 lineage · 點節點開 PDF · 滾輪縮放、拖曳平移
    </div>
    <div id="timeline-chips" style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap"></div>
    <div id="timeline-container" style="width:100%;height:calc(100vh - 200px);border:1px solid var(--bd);border-radius:10px;overflow:hidden;background:#0a0a14;position:relative"></div>`;
  renderTimeline();
}

// ----- 9-phase schema -----
function renderPhasesPage(m) {
  m.innerHTML = `<h2>🔬 Robotic TME 9-Phase Schema <span style="font-size:12px;color:var(--mt);font-weight:500">v0.1</span></h2>
    <p style="font-size:12px;color:var(--t2);margin-bottom:14px">自訂的機器人全直腸繫膜切除術 9 階段標註架構，用於手術影片逐幀標註。</p>
    ${PHASES.map((p,i) => `
      <div class="pc" style="padding:16px 18px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <div class="phase-num">${i+1}</div>
          <div>
            <div class="phase-name" style="font-size:14px">${p.zh}</div>
            <div style="font-size:11px;color:var(--mt)">${p.en}</div>
          </div>
        </div>
        <div style="font-size:12.5px;color:var(--t2);line-height:1.65;margin-bottom:8px">${p.desc}</div>
        <div style="font-size:11.5px;margin-bottom:6px">
          <span style="color:var(--ac);font-weight:700">👁 視覺特徵：</span>
          <span style="color:var(--t2)">${p.cue}</span>
        </div>
        ${p.to !== '—（手術結束）'
          ? `<div style="display:flex;align-items:center;gap:6px;padding:8px 12px;background:rgba(255,180,100,.08);border-radius:6px;border:1px solid rgba(255,180,100,.15)">
              <span style="color:#ffb464;font-weight:700;font-size:11px">⬇ 切換至 Phase ${i+2} 的判定點：</span>
              <span style="font-size:11.5px;color:var(--t2)">${p.to}</span>
            </div>`
          : `<div style="font-size:11px;color:var(--mt);font-style:italic">手術結束</div>`}
      </div>`).join('')}
    <div style="margin-top:16px;font-size:12px;color:var(--t2);line-height:1.6">
      <div style="font-weight:700;margin-bottom:6px;color:var(--t)">設計說明</div>
      <p style="margin-bottom:8px">Phase 6-7 將骨盆 TME 解剖拆為後方（early）與前側方（completion），反映實際手術中 posterior holy plane dissection 先行、anterior/lateral dissection 後續完成的順序。這比單一「pelvic dissection」phase 更能捕捉 plane recognition 的關鍵時刻。</p>
      <div style="font-weight:700;margin-bottom:6px;color:var(--t)">標註原則</div>
      <p>• 切換點以「決定性動作開始」為準，而非器械移動或暫停<br>
      • 若兩個 phase 的動作短暫重疊（如 IMV 在脾彎游離時才結紮），以主要目的判定<br>
      • 不可標註的片段（鏡頭模糊、清潔鏡頭、嚴重出血處理）另設 flag 但不新增 phase</p>
    </div>`;
}

// ----- Learning roadmap (with checkboxes) -----
function renderLearnRoadmap(m) {
  m.innerHTML = `<h2>📖 學習路線</h2>
    <p style="font-size:12px;color:var(--t2);margin-bottom:14px">基於目前公開 repo 成熟度與研究目標排列的優先順序。</p>
    ${LEARN_ROADMAP.map((s,si) => `
      <div class="rc">
        <h3 style="font-size:14px">${s.stage}</h3>
        ${s.items.map((i,j) => `
          <div class="rt" id="ck_learn_${si}_${j}">
            <input type="checkbox" data-ck="learn_${si}_${j}" onchange="toggleCk(this)">
            <span>${i}</span>
          </div>`).join('')}
        ${s.note ? `<div style="font-size:11px;color:var(--t2);margin-top:6px;padding-left:22px">${s.note}</div>` : ''}
      </div>`).join('')}
    <div style="font-size:13px;font-weight:700;margin:16px 0 8px">建議第一版實驗配置</div>
    <div class="pc" style="font-size:12px;color:var(--t2);line-height:1.7">
      <b style="color:var(--t)">Backbone</b>：SurgeNetXL 或 LemonFM<br>
      <b style="color:var(--t)">Temporal head</b>：TeCNO<br>
      <b style="color:var(--t)">對照組</b>：MuST 或 Surgformer<br>
      <b style="color:var(--t)">高階延伸</b>：SurgVISTA probing / fine-tuning
    </div>`;
  applyCkState();
}

// ----- Prerequisite knowledge -----
function renderPrereqs(m) {
  m.innerHTML = `<h2>📚 先備知識</h2>
    <div class="prg">${PREREQS.map(([n,items]) => `
      <div class="prc">
        <h4>${n}</h4>
        <ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>
      </div>`).join('')}
    </div>`;
}

// ----- Paper roadmap (with checkboxes) -----
function renderPaperRoadmap(m) {
  m.innerHTML = `<h2>🗺️ 論文路線圖</h2>${PAPER_ROADMAP.map(ch => `
    <div class="rc">
      <h3><span class="rn" style="background:${ch.bg};color:${ch.c}">${ch.n}</span>${ch.t}</h3>
      ${ch.tasks.map((t,j) => `
        <div class="rt" id="ck_road_${ch.n}_${j}">
          <input type="checkbox" data-ck="road_${ch.n}_${j}" onchange="toggleCk(this)">
          <span>${t}</span>
        </div>`).join('')}
      <div class="ro">預期產出：${ch.out}</div>
    </div>`).join('')}`;
  applyCkState();
}

// ----- Chapter detail (drilled down from overview) -----
export function showChapter(n) {
  const ch = CHP.find(c => c.n === n);
  if (!ch) return;

  const sec = (title, items, type) => {
    if (type === 'list') {
      return `<div class="ch-sec"><div class="ch-label">${title}</div>${items.map(i => `<div class="ch-item">• ${i}</div>`).join('')}</div>`;
    }
    return `<div class="ch-sec"><div class="ch-label">${title}</div><div class="ch-body">${items}</div></div>`;
  };

  const relPapers = ch.papers.map(pid => P.find(p => p.id === pid)).filter(Boolean);

  $('mn').innerHTML = `
    <button class="lb" onclick="showP('overview')" style="margin-bottom:14px">← 返回概覽</button>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
      <div class="phase-num" style="width:40px;height:40px;font-size:18px;color:${ch.color};background:${ch.color}18">${ch.n}</div>
      <div>
        <div style="font-size:20px;font-weight:800">${ch.t}</div>
        <div style="font-size:11px;color:var(--mt)">${ch.sub} · ${ch.timeline}</div>
      </div>
    </div>
    ${sec('研究問題', ch.q, 'text')}
    ${sec('背景', ch.bg, 'text')}
    ${sec('資料', ch.data, 'list')}
    ${sec('方法', ch.method, 'list')}
    ${sec('評估指標', ch.metrics, 'list')}
    ${sec('風險與對策', ch.risks, 'list')}
    ${sec('預期產出', ch.out, 'text')}
    <div class="ch-sec">
      <div class="ch-label">相關文獻</div>
      ${relPapers.map(p => `
        <div class="ch-item" style="cursor:pointer" onclick="showS('${p.s}')">
          <span style="color:var(--ac);font-weight:700">${p.t}</span>
          <span style="color:var(--mt);font-size:11px">— ${p.a}, ${p.v}</span>
        </div>`).join('')}
    </div>
    <button class="lb rb" onclick="downloadChapterMD(${ch.n})" style="margin-top:16px;padding:8px 18px;font-size:12px">⬇ 下載 Markdown</button>`;
}

// ----- Chapter Markdown export -----
export function downloadChapterMD(n) {
  const ch = CHP.find(c => c.n === n);
  if (!ch) return;

  let md = `# Chapter ${ch.n}：${ch.t}\n\n`;
  md += `> ${ch.sub} · ${ch.timeline}\n\n`;
  md += `## 研究問題\n\n${ch.q}\n\n`;
  md += `## 背景\n\n${ch.bg}\n\n`;
  md += `## 資料\n\n${ch.data.map(d => `- ${d}`).join('\n')}\n\n`;
  md += `## 方法\n\n${ch.method.map(x => `- ${x}`).join('\n')}\n\n`;
  md += `## 評估指標\n\n${ch.metrics.map(x => `- ${x}`).join('\n')}\n\n`;
  md += `## 風險與對策\n\n${ch.risks.map(r => `- ${r}`).join('\n')}\n\n`;
  md += `## 預期產出\n\n${ch.out}\n\n`;
  md += `## 相關文獻\n\n`;
  ch.papers.forEach(pid => {
    const p = P.find(pp => pp.id === pid);
    if (p) md += `- **${p.t}** — ${p.a}, ${p.v}${p.doi ? ` (DOI: ${p.doi})` : ''}\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `chapter${ch.n}_${ch.t}.md`;
  a.click();
  URL.revokeObjectURL(a.href);
}
