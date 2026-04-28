// ============================================================
// surgical.js — Surgical-domain papers (PhD thesis core)
// ============================================================
// Schema additions on top of original `s` field:
//   y       : year (int)
//   cat     : top-level technical category (see categories.js)
//   sub     : sub-category within cat
//   parents : array of paper ids this builds directly on
//             (within the KB; used by Tree of Life lineage view)
//   domain  : "surgical" — kept on every paper here
// `s` (legacy section, Chinese) is preserved so existing views
// (sidebar grouping, graph coloring, search) keep working.

export const SURGICAL_PAPERS = [
  // ----- Spatial backbones -----
  {id:"surgenetxl", s:"空間特徵骨幹", t:"SurgeNetXL", a:"Jaspers et al.", v:"MedIA 2026", y:2026,
   cat:"SSL", sub:"Surgical Image FM", domain:"surgical",
   parents:["dino"],
   doi:"10.1016/j.media.2025.103873", gh:"TimJaspers0801/SurgeNet",
   tg:["CAFormer","DINO","470萬幀","自監督"],
   n:"目前最強手術空間骨幹。470萬幀、23+術式。建議預設空間編碼器。", pri:1},

  {id:"surgvista", s:"空間特徵骨幹", t:"SurgVISTA", a:"Yang et al.", v:"npj Digit Med 2026", y:2026,
   cat:"SSL", sub:"Surgical Video FM", domain:"surgical",
   parents:["surgenetxl","videomae"],
   doi:"10.1038/s41746-026-02403-0", ax:"2506.02692", gh:"isyangshu/SurgVISTA",
   tg:["VideoMAE","影片原生","355萬幀"],
   n:"首個影片層級手術基礎模型。聯合時空學習，workflow recognition 特強。", pri:2},

  {id:"surgmotion", s:"空間特徵骨幹", t:"SurgMotion", a:"Wu et al.", v:"arXiv 2026", y:2026,
   cat:"SSL", sub:"Surgical Video FM", domain:"surgical",
   parents:["surgvista","surgenetxl","vjepa"],
   ax:"2602.05638",
   tg:["V-JEPA","動作引導","1500萬片段"],
   n:"最新最大。潛在動作預測取代像素重建。15M clips / 3658 hrs / 13+ 解剖區域。", pri:3},

  {id:"lemon", s:"空間特徵骨幹", t:"LEMON / LemonFM", a:"ViSurg-AI", v:"CVPR 2026", y:2026,
   cat:"Architecture", sub:"Surgical Backbone", domain:"surgical",
   parents:["vit"],
   gh:"visurg-ai/surg-3m",
   tg:["Image FM","Phase fine-tune","公開腳本"],
   n:"手術影像基礎模型，repo 直接提供 phase recognition fine-tuning script。非常實用的 frame encoder。", pri:1},

  {id:"surgrec", s:"空間特徵骨幹", t:"SurgRec", a:"2026 預印本", v:"arXiv 2026", y:2026,
   cat:"SSL", sub:"Surgical SSL Method", domain:"surgical",
   parents:["surgenetxl","mae"],
   ax:"2603.29966",
   tg:["MAE","JEPA","10535部","可重現"],
   n:"可擴展可重現的預訓練方案。方法學參考。"},

  // ----- Temporal heads -----
  {id:"mstcn", s:"時序建模頭", t:"MS-TCN", a:"Farha & Gall", v:"CVPR 2019", y:2019,
   cat:"VideoUnderstanding", sub:"Temporal Head", domain:"general",
   parents:[],
   doi:"10.1109/CVPR.2019.00369", gh:"ChinaYi/MS-TCN2",
   tg:["TCN","膨脹卷積","動作分割"],
   n:"多階段 TCN 開山之作。所有後續方法的基線。", pri:1},

  {id:"tecno", s:"時序建模頭", t:"TeCNO", a:"Czempiel et al.", v:"MICCAI 2020", y:2020,
   cat:"VideoUnderstanding", sub:"Surgical Temporal Head", domain:"surgical",
   parents:["mstcn"],
   doi:"10.1007/978-3-030-59716-0_33", gh:"tobiascz/TeCNO",
   tg:["MS-TCN變體","手術專用","因果推論"],
   n:"MS-TCN 適配手術階段辨識。首證 TCN>LSTM。你的主要基線。先 reproduce 這個。", pri:1},

  {id:"transsvnet", s:"時序建模頭", t:"Trans-SVNet", a:"Gao et al.", v:"MICCAI 2021", y:2021,
   cat:"VideoUnderstanding", sub:"Surgical Temporal Head", domain:"surgical",
   parents:["tecno","vit"],
   doi:"10.1007/978-3-030-87202-1_57", ax:"2103.09712",
   tg:["Transformer","混合嵌入","91fps"],
   n:"首次引入 Transformer 至手術工作流程。你的第二基線。"},

  {id:"dacat", s:"時序建模頭", t:"DACAT", a:"Yang et al.", v:"ICASSP 2025", y:2025,
   cat:"VideoUnderstanding", sub:"Surgical Temporal Head", domain:"surgical",
   parents:["transsvnet","mstcn"],
   doi:"10.1109/ICASSP49660.2025.10890444", gh:"kk42yy/DACAT",
   tg:["雙流","自適應片段","SOTA"],
   n:"Cholec80/M2CAI16/AutoLaparo SOTA temporal head。"},

  {id:"lovit", s:"時序建模頭", t:"LoViT", a:"Liu et al.", v:"MedIA 2025", y:2025,
   cat:"VideoUnderstanding", sub:"Surgical Temporal Head", domain:"surgical",
   parents:["transsvnet","vit"],
   doi:"10.1016/j.media.2024.103366", gh:"MRUIL/LoViT",
   tg:["長影片","ProbSparse","多尺度"],
   n:"擅長超長手術影片。多尺度局部＋全域聚合。"},

  {id:"must", s:"時序建模頭", t:"MuST", a:"BCV-Uniandes", v:"MICCAI 2024", y:2024,
   cat:"VideoUnderstanding", sub:"Surgical Temporal Head", domain:"surgical",
   parents:["transsvnet","vit"],
   gh:"BCV-Uniandes/MuST",
   tg:["Multi-Scale Transformer","Two-stage","PhaKIR冠軍"],
   n:"Multi-Scale Transformers for Surgical Phase Recognition。PhaKIR 2024 challenge winning solution。", pri:2},

  {id:"surgformer", s:"時序建模頭", t:"Surgformer", a:"2024", v:"arXiv 2024", y:2024,
   cat:"VideoUnderstanding", sub:"Surgical Temporal Head", domain:"surgical",
   parents:["transsvnet","vit"],
   ax:"2408.03867",
   tg:["階層式時序注意力","手術專用"],
   n:"Hierarchical temporal attention 針對手術影片設計。"},

  {id:"mosformer", s:"時序建模頭", t:"MoSFormer", a:"2024", v:"2024", y:2024,
   cat:"VideoUnderstanding", sub:"Surgical Temporal Head", domain:"surgical",
   parents:["transsvnet","vit"],
   tg:["Memory of Surgery","長程依賴"],
   n:"加入 Memory of Surgery 補足固定 context window 缺點，適合超長手術流程。"},

  // ----- VLM -----
  {id:"hecvl", s:"視覺語言模型", t:"HecVL", a:"Yuan et al.", v:"MICCAI 2024", y:2024,
   cat:"VLM", sub:"Surgical VLM", domain:"surgical",
   parents:["clip"],
   doi:"10.1007/978-3-031-72089-5_29", ax:"2405.10075", gh:"CAMMA-public/PeskaVLP",
   tg:["階層式","零樣本","對比學習"],
   n:"階層式影片文字預訓練，跨術式零樣本階段辨識。"},

  {id:"peskavlp", s:"視覺語言模型", t:"PeskaVLP", a:"Yuan et al.", v:"NeurIPS 2024 Spotlight", y:2024,
   cat:"VLM", sub:"Surgical VLM", domain:"surgical",
   parents:["hecvl","clip"],
   ax:"2410.00263", gh:"CAMMA-public/PeskaVLP",
   tg:["術式感知","知識增強"],
   n:"HecVL 進化版。+12.3% accuracy。目前最強手術 VLM。"},

  // ----- Plane / segmentation -----
  {id:"kumazu", s:"切割平面辨識", t:"Kumazu — 胃切除 LCTF 分割", a:"Kumazu et al.", v:"Sci Reports 2021", y:2021,
   cat:"Segmentation", sub:"Surgical Plane", domain:"surgical",
   parents:["unet"],
   doi:"10.1038/s41598-021-00557-3",
   tg:["U-Net","結締組織","可遷移"],
   n:"同概念用於胃切除。已證跨術式遷移可行。"},

  {id:"igaki2022", s:"切割平面辨識", t:"Igaki — TME 疏鬆結締組織分割", a:"Igaki et al.", v:"DCR 2022", y:2022,
   cat:"Segmentation", sub:"Surgical Plane", domain:"surgical",
   parents:["kumazu","deeplabv3plus"],
   doi:"10.1097/DCR.0000000000002393",
   tg:["DeepLabv3+","600張","32例"],
   n:"首篇 TME 平面導航。僅疏鬆結締組織分割。"},

  {id:"kolbinger", s:"切割平面辨識", t:"Kolbinger — 機器人直腸切除情境感知", a:"Kolbinger et al.", v:"EJSO 2024", y:2024,
   cat:"Segmentation", sub:"Surgical Plane", domain:"surgical",
   parents:["igaki2022","deeplabv3plus"],
   doi:"10.1016/j.ejso.2023.106996",
   tg:["DeepLabv3","57台RARR","16結構"],
   n:"最全面。階段辨識＋16 種結構分割，無血管平面 F1=0.54。"},

  {id:"suzuki2025", s:"切割平面辨識", t:"Suzuki — AI 導航 TME 骨盆筋膜平面分割", a:"Suzuki, Kitaguchi et al.", v:"Ann Gastroenterol Surg 2025", y:2025,
   cat:"Segmentation", sub:"Surgical Plane", domain:"surgical",
   parents:["igaki2022","efficientnet"],
   doi:"10.1002/ags3.70064", pmc:"PMC12586929",
   tg:["FPN+EfficientNetB7","2861張","157例","NCC Japan"],
   n:"Kitaguchi/Ito 組 (NCC Japan)。腹腔鏡 TME 三區域分割：直腸繫膜 DSC 90.4%、骨盆壁 90.6%、Holy plane 68.5%。", pri:2},

  // ----- Benchmark & Challenge -----
  {id:"surgbench", s:"基準與挑戰", t:"SurgBench", a:"2025", v:"arXiv 2025", y:2025,
   cat:"Benchmark", sub:"Surgical Benchmark", domain:"surgical",
   parents:[],
   ax:"2506.07603",
   tg:["53M frames","22術式","72 tasks","統一基準"],
   n:"你的「地圖」。涵蓋 6 大類 72 tasks，不讀這篇容易把 phase recognition 當成整個領域。", pri:1},

  {id:"phakir", s:"基準與挑戰", t:"PhaKIR 2024 Challenge", a:"Rueckert et al.", v:"MedIA 2026", y:2026,
   cat:"Benchmark", sub:"Surgical Benchmark", domain:"surgical",
   parents:["must"],
   doi:"10.1016/j.media.2026.103945", ax:"2507.16559",
   tg:["跨中心驗證","膽囊切除","泛化能力差"],
   n:"現實校正器。三醫學中心真實資料，各方法跨中心泛化都不好。影響你的 split 設計與 external validation。", pri:1},
];
