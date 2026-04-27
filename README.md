# PhD Thesis Knowledge Base

**機器人全直腸繫膜切除術之手術影像分析**
Surgical Video Analytics for Robotic Total Mesorectal Excision

PhD Thesis — NCKU Computer Science
Author: Shih-Feng Huang, MD (黃士峯)

---

## 架構

純靜態網站，無後端依賴：

- 21 篇文獻 metadata 與所有研究計畫內容寫死在 `src/data.js`
- 21 個 PDF 直接放在 `pdfs/`，點擊「開啟 PDF」由瀏覽器原生 viewer 處理
- 學習進度勾選狀態存在 `localStorage`（每台裝置獨立追蹤）
- d3 知識圖譜走 CDN

```
PhD_Thesis/
├── index.html          # HTML shell + CSS
├── src/
│   ├── app.js          # entry, wires modules + service worker
│   ├── data.js         # papers, chapters, graph, all static content
│   ├── store.js        # localStorage wrapper
│   ├── checkboxes.js   # checkbox state binding
│   ├── views.js        # render functions for all pages
│   ├── nav.js          # sidebar, search, view switching
│   └── graph.js        # d3 force-directed knowledge graph
├── pdfs/               # 21 paper PDFs
├── manifest.json       # PWA manifest
├── sw.js               # service worker (precache + offline)
└── icon-*.png          # app icons
```

## 部署

GitHub Pages 直接 serve：

```
Settings → Pages → Source: main branch, / (root)
```

或本機開發：

```bash
python3 -m http.server 8000
# 開 http://localhost:8000
```

ES modules 需要 HTTP serve（不能直接 `file://` 開啟）。

## Cache 失效

修改 `src/*.js` 後，sw.js 的 `CACHE` 版本號要 bump（`phd-kb-v5` → `v6`），否則使用者拿到舊版。
