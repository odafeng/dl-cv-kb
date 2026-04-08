# PhD Thesis Knowledge Base

**機器人全直腸繫膜切除術之手術影像分析**  
Surgical Video Analytics for Robotic Total Mesorectal Excision

PhD Thesis — NCKU Computer Science  
Author: Shih-Feng Huang, MD (黃士峯)

## Setup

### 1. Supabase Storage

在 Supabase Dashboard 建立一個 **public** storage bucket：

- Bucket name: `phd-papers`
- Public: ✅ (允許匿名讀取)
- File size limit: 50MB

上傳 PDF 檔案時，命名規則：`{paper_id}.pdf`  
例如：`surgenetxl.pdf`, `tecno.pdf`, `dacat.pdf`

Paper ID 清單請參考 `index.html` 中的 `PAPERS` 陣列。

### 2. 部署

直接用 GitHub Pages 或任何靜態託管即可：

```bash
# GitHub Pages
# Settings → Pages → Source: main branch, / (root)
```

### 3. 使用

- 左側選擇論文分類
- 點擊「📖 閱讀 & 標記」開啟 PDF 閱讀器
- 如果 Supabase 有該 PDF → 自動載入
- 如果沒有 → 顯示上傳區域，上傳後自動存入 Supabase
- 選取文字 → 選擇顏色 → 建立標記
- 標記自動存入 Supabase Storage（`highlights/` 資料夾）
