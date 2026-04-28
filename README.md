# DL/CV Knowledge Base

> A curated map of foundational papers in **deep learning for computer vision**, from LeNet (1998) to current-gen surgical foundation models (2026). Built as an interactive, offline-first PWA — no backend, no auth, just the lineage tree visible at a glance.

**Author**: 黃士峯 Shih-Feng Huang, MD · 高榮大腸直腸外科主治醫師
**Live site**: https://odafeng.github.io/dl-cv-kb/

---

## What's in here

72 papers across 9 technical categories, with **101 lineage edges** (parent→child relations) showing how each paper builds on its ancestors:

| Category | Count | Example chain |
|---|---|---|
| 🏗️ Architecture | 11 | LeNet → AlexNet → VGG → ResNet → ViT → ConvNeXt |
| 🧠 SSL | 14 | InstDisc → MoCo → SimCLR → BYOL → MAE → DINO → DINOv2 |
| 🌗 Semi-SL | 5 | Pseudo-Label → Mean Teacher → FixMatch |
| ✂️ Segmentation | 12 | FCN → U-Net → DeepLab → SAM → SAM2 |
| 🎯 Detection | 5 | R-CNN → Faster R-CNN → YOLO → DETR |
| 🎨 Generative | 4 | GAN → VAE → DDPM → Stable Diffusion |
| 💬 VLM | 6 | CLIP → BLIP-2 → LLaVA |
| 🎬 Video | 13 | I3D → SlowFast → VideoMAE → V-JEPA |
| 📊 Benchmark | 2 | SurgBench, PhaKIR |

Of those 72, **20 are surgical-AI applications** (TME phase recognition, plane segmentation, surgical foundation models). The remaining 52 are general-CV foundations they descend from. **18 cross-domain edges** connect surgical work back to its general-CV ancestors — letting you trace e.g. ViT → MAE → VideoMAE → SurgVISTA in a single visual path.

---

## Main views

| View | What it does |
|---|---|
| 🎯 **概覽 (Overview)** | Stats summary + how-to-use guide + entry to surgical AI sub-module |
| 🌳 **演化樹 (Tree of Life)** | Time-anchored DAG, X=year, Y=category. Hover lights up full lineage; **🛤️ Path mode** picks two papers and animates the chain between them; **🏥 Surgical only** dims general-CV nodes |
| 🕸️ **知識圖譜** | Force-directed concept graph (surgical papers + shared topics) |
| 🏷️ **標籤索引** | 206 tags grouped by category; click any tag → filtered search |

### 🏥 Surgical AI Application sub-module

The site started life as the knowledge base for my PhD thesis on **robotic Total Mesorectal Excision (TME) surgical video analytics**. That work is preserved as a focused sub-module:

- **9-Phase Schema** — custom annotation taxonomy for robotic TME videos
- **學習路線 / 先備知識 / 論文路線圖** — PhD progression and chapter plans
- **Three thesis chapters**: Phase Recognition · Plane Segmentation · Phase-aware Navigation

If you're here for general DL/CV reference, you can ignore this section. If you're interested in surgical AI specifically, this is where the curated thesis-level analysis lives.

---

## Architecture

Pure-static PWA, offline-first:

```
dl-cv-kb/
├── index.html              # HTML shell + dark CSS tokens
├── src/
│   ├── app.js              # entry, wires modules + SW
│   ├── config.js           # Supabase URL + paper-aware pdfUrlFor()
│   ├── data.js             # legacy shim → re-exports src/data/
│   ├── data/
│   │   ├── index.js        # central re-export hub
│   │   ├── categories.js   # CATS / ERAS / DOMAINS taxonomy
│   │   ├── chapters.js     # PhD CHP + 9-phase PHASES (surgical sub-module)
│   │   ├── learning.js     # LEARN_ROADMAP / PREREQS / PAPER_ROADMAP
│   │   ├── pages.js        # sidebar navigation
│   │   ├── graph.js        # legacy concept-graph data
│   │   └── papers/         # 9 paper files, one per category
│   ├── store.js            # localStorage wrapper (progress checkboxes)
│   ├── checkboxes.js       # checkbox state binding
│   ├── views.js            # page render dispatch
│   ├── nav.js              # sidebar, search, view switching
│   ├── graph.js            # d3 force-directed concept graph
│   ├── timeline.js         # d3 time-anchored DAG (Tree of Life)
│   ├── tag-index.js        # tag-by-category index page
│   └── pdf-modal.js        # iframe PDF overlay
├── manifest.json           # PWA manifest
├── sw.js                   # service worker (precache + runtime)
└── icon-*.png              # app icons
```

### Paper schema

```js
{
  id:       "resnet",                  // unique, lowercase
  t:        "ResNet",                  // title
  a:        "He et al.",               // authors short
  v:        "CVPR 2016",               // venue
  y:        2015,                      // year (int) — timeline X axis
  cat:      "Architecture",            // top-level taxonomy
  sub:      "Deep CNN",                // sub-category
  domain:   "general",                 // "surgical" | "general"
  parents:  ["vgg", "googlenet"],      // direct ancestor ids (DAG)
  ax:       "1512.03385",              // arXiv id (PDF auto-resolved)
  doi:      "10.1109/CVPR.2016.90",    // optional
  gh:       "KaimingHe/...",           // optional GitHub
  tg:       ["殘差連接", "152 層"],      // searchable tags
  n:        "Skip connection 解決深層退化問題",
  pri:      1,                         // optional: 1=must-read (larger node + label)
}
```

### PDF resolution

`config.js → pdfUrlFor(paper)` decides where each paper's PDF comes from:

- **Surgical-domain papers** → Supabase Storage `papers` bucket (curated, public-read, 21 files / 107 MB)
- **General-CV papers** → arXiv direct (`https://arxiv.org/pdf/{ax}.pdf`)
- Override via `paper.local: true` to force Supabase, or `local: false` to force external

The Supabase project (`dl-cv-knowledge-base`, region `ap-southeast-1`) holds 21 surgical PDFs.

---

## Deploy

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

## Cache busting

Modify any `src/*.js` and bump `sw.js`'s `CACHE` version (`phd-kb-vN` → `vN+1`). The service worker auto-clears non-current caches on activation, so users pick up the new build on their next reload.

---

## Extending

**Add a paper to an existing category**: open `src/data/papers/<cat>.js` and push a new object. Don't forget the `parents` field — that's what plants the paper in the family tree.

**Add a new category**:

1. Create `src/data/papers/<newcat>.js` exporting an array
2. Import + spread it into `P` in `src/data/papers/index.js`
3. Add the new cat to `CATS` and `CAT_ORDER` in `src/data/categories.js`
4. Add the file path to `PRECACHE` in `sw.js`, bump `CACHE` version

The Tree of Life view auto-discovers categories from data — no view-layer changes needed.
