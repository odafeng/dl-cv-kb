// ============================================================
// video.js — Video understanding
// ============================================================
// I3D → SlowFast → TimeSformer → VideoMAE → V-JEPA chain.
// SurgVISTA / SurgMotion are direct surgical descendants of
// VideoMAE / V-JEPA respectively.

export const VIDEO_PAPERS = [
  {id:"i3d", t:"I3D", a:"Carreira & Zisserman", v:"CVPR 2017", y:2017,
   cat:"VideoUnderstanding", sub:"3D CNN", domain:"general",
   parents:["googlenet"],
   ax:"1705.07750",
   tg:["inflated 3D conv","Kinetics","two-stream"],
   n:"把 2D Inception 沿時間軸膨脹成 3D。Kinetics 資料集 + I3D 是 video 領域的 ImageNet+AlexNet 時刻。"},

  {id:"slowfast", t:"SlowFast", a:"Feichtenhofer et al.", v:"ICCV 2019", y:2019,
   cat:"VideoUnderstanding", sub:"3D CNN", domain:"general",
   parents:["i3d","resnet"],
   ax:"1812.03982",
   tg:["雙路徑","低/高 frame rate","FAIR"],
   n:"Slow path 抓語意，Fast path 抓動作。仿生設計，至今仍在很多 video benchmark 名列前茅。"},

  {id:"timesformer", t:"TimeSformer", a:"Bertasius et al.", v:"ICML 2021", y:2021,
   cat:"VideoUnderstanding", sub:"Transformer-based", domain:"general",
   parents:["vit"],
   ax:"2102.05095",
   tg:["divided space-time attention","純 Transformer"],
   n:"純 Transformer 做 video，divided attention 大幅降低計算量。"},

  {id:"videomae", t:"VideoMAE", a:"Tong et al.", v:"NeurIPS 2022", y:2022,
   cat:"VideoUnderstanding", sub:"Video SSL", domain:"general",
   parents:["mae","timesformer"],
   ax:"2203.12602",
   tg:["tube masking","90% mask","video pretraining"],
   n:"MAE 的 video 版。SurgVISTA 直接繼承這個 pretraining 方法。", pri:2},

  {id:"vjepa", t:"V-JEPA", a:"Bardes et al.", v:"arXiv 2024", y:2024,
   cat:"VideoUnderstanding", sub:"Video SSL", domain:"general",
   parents:["mae","videomae"],
   ax:"2404.08471",
   tg:["latent prediction","非像素重建","Meta"],
   n:"在 latent space 預測動作而非像素。SurgMotion 直接採用，2026 年最新最大規模手術影片 FM 的方法基礎。"},
];
