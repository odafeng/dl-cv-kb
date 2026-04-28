# DL-in-CV Knowledge Base · 深度學習在電腦視覺的知識庫

> 起點是 PhD 論文用的 21 篇手術影片 paper，現在擴成 72 篇 + 演化樹的
> 「DL in CV」全景知識庫。仍是純靜態 PWA，無後端依賴。

**研究主軸**: 機器人全直腸繫膜切除術之手術影像分析 (Surgical Video Analytics for Robotic TME)
**作者**: 黃士峯 Shih-Feng Huang, MD — NCKU CS PhD candidate · 高榮大腸直腸外科主治醫師

---

## 內容

| 類別 | 篇數 | 範例 |
|---|---|---|
| 🏗️ Architecture | 11 | LeNet → AlexNet → VGG → ResNet → ViT → ConvNeXt |
| 🧠 SSL | 14 | InstDisc → MoCo → SimCLR → BYOL → MAE → DINO → DINOv2 |
| 🌗 Semi-SL | 5 | Pseudo-Label → Mean Teacher → FixMatch → Noisy Student |
| ✂️ Segmentation | 12 | FCN → U-Net → DeepLab → SAM → SAM2 (含手術 plane) |
| 🎯 Detection | 5 | R-CNN → Faster R-CNN → YOLO → DETR |
| 🎨 Generative | 4 | GAN → VAE → DDPM → Stable Diffusion |
| 💬 VLM | 6 | CLIP → BLIP-2 → LLaVA (含手術 HecVL/PeskaVLP) |
| 🎬 Video | 13 | I3D → SlowFast → TimeSformer → VideoMAE → V-JEPA (含手術時序頭) |
| 📊 Benchmark | 2 | SurgBench, PhaKIR Challenge |

**總計 72 篇** · 1998–2026 · 101 條 lineage 連線（其中 18 條跨外科↔通用 CV 領域）

---

## 主要視圖

- **🎯 論文概覽** — PhD thesis 三章節大綱（階段辨識 / 平面分割 / 階段感知導航）
- **🌳 演化樹 (Tree of Life)** — 時間錨定 DAG，X=年份，Y=技術類別，hover 整條 lineage 高亮，「🏥 Surgical only」toggle 把外科 paper 凸顯
- **🕸️ 知識圖譜** — Force-directed concept graph（外科 21 篇）
- **🔬 9-Phase Schema** — TME 自訂 9 階段標註架構
- **📖 學習路線** / **📚 先備知識** / **🗺️ 論文路線圖** — 學習與計畫追蹤頁

---

## 架構

純靜態 PWA，offline-first：

```
PhD_Thesis/
├── index.html               # HTML shell + 暗色 CSS tokens
├── src/
│   ├── app.js               # entry, wires modules + SW
│   ├── config.js            # Supabase URL + pdfUrlFor() resolver
│   ├── data.js              # legacy shim → re-exports src/data/
│   ├── data/
│   │   ├── index.js         # central re-export hub
│   │   ├── categories.js    # CATS / ERAS / DOMAINS taxonomy
│   │   ├── chapters.js      # PhD CHP + 9-phase PHASES
│   │   ├── learning.js      # LEARN_ROADMAP / PREREQS / PAPER_ROADMAP
│   │   ├── pages.js         # sidebar navigation
│   │   ├── graph.js         # legacy concept-graph data (surgical)
│   │   └── papers/
│   │       ├── index.js     # combiner + byId/byCat/byYear helpers
│   │       ├── surgical.js  # 21 surgical-domain papers
│   │       ├── architecture.js, ssl.js, semisl.js,
│   │       ├── segmentation.js, detection.js,
│   │       ├── generative.js, vlm.js, video.js
│   ├── store.js             # localStorage wrapper
│   ├── checkboxes.js        # checkbox state binding
│   ├── views.js             # page render dispatch
│   ├── nav.js               # sidebar, search, view switching
│   ├── graph.js             # d3 force-directed concept graph
│   ├── timeline.js          # d3 time-anchored DAG (Tree of Life)
│   └── pdf-modal.js         # iframe PDF overlay
├── manifest.json            # PWA manifest
├── sw.js                    # service worker (precache + runtime)
└── icon-*.png               # app icons
```

### Paper schema

```js
{
  id:       "resnet",                  // unique, lowercase
  t:        "ResNet",                  // title
  a:        "He et al.",               // authors short
  v:        "CVPR 2016",               // venue
  y:        2015,                      // year (int) — for timeline X axis
  cat:      "Architecture",            // top-level taxonomy
  sub:      "Deep CNN",                // sub-category
  domain:   "general",                 // "surgical" | "general"
  parents:  ["vgg", "googlenet"],      // direct ancestor ids (DAG)
  ax:       "1512.03385",              // arXiv id (PDF auto-resolved)
  doi:      "10.1109/CVPR.2016.90",    // optional
  gh:       "KaimingHe/...",           // optional GitHub
  tg:       ["殘差連接", "152 層"],     // searchable tags
  n:        "Skip connection 解決深層退化問題",
  pri:      1,                         // optional: 1=must-read (larger node + inline label)
  s:        "...",                     // optional legacy section (Chinese, surgical only)
}
```

### PDF resolution

`config.js → pdfUrlFor(paper)` decides where the PDF comes from:

- **Surgical-domain papers** → Supabase Storage `papers` bucket (curated, public-read)
- **General CV papers** → arXiv PDF directly (`https://arxiv.org/pdf/{ax}.pdf`)
- **Override**: any paper with `local: true` forces Supabase; `local: false` forces external

The Supabase project (`dl-cv-knowledge-base`, region `ap-southeast-1`) holds 21 surgical PDFs at ~107 MB total.

---

## 部署

GitHub Pages auto-deploys on push to `main`:

```
Settings → Pages → Source: main branch, / (root)
```

Local dev:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

ES modules require HTTP serve (not `file://`).

---

## Cache 失效

修改 `src/*.js` 後，bump `sw.js` 的 `CACHE` 版本號（`phd-kb-vN` → `vN+1`），否則使用者拿到舊版。

Service worker 會自動清掉非當前版本的舊 cache。

---

## 擴充 paper

加新類別：

1. 新建 `src/data/papers/<cat>.js`，匯出 array of paper objects
2. 在 `src/data/papers/index.js` import + spread 進 `P`
3. （若是新 cat）在 `src/data/categories.js` 加進 `CATS` 與 `CAT_ORDER`
4. 在 `sw.js` 把新檔案路徑加進 `PRECACHE`，bump 版本

加 paper 到既有類別：直接 push 到對應的 array，記得填 `parents` 把它接上家族樹。
