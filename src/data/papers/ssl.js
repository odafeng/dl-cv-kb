// ============================================================
// ssl.js — Self-supervised learning lineage
// ============================================================
// The contrastive → masked → joint-embedding chain that culminates
// in DINOv2-style universal visual features. Many surgical
// foundation models (SurgeNetXL, SurgVISTA, SurgMotion) trace
// their pretraining recipe back to these.

export const SSL_PAPERS = [
  {id:"instdisc", t:"InstDisc / NPID", a:"Wu et al.", v:"CVPR 2018", y:2018,
   cat:"SSL", sub:"Contrastive", domain:"general",
   parents:[],
   ax:"1805.01978",
   tg:["instance discrimination","memory bank"],
   n:"用 instance-level 區分當代理任務，引爆現代 contrastive SSL。"},

  {id:"moco", t:"MoCo (v1/v2)", a:"He et al.", v:"CVPR 2020", y:2020,
   cat:"SSL", sub:"Contrastive", domain:"general",
   parents:["instdisc"],
   ax:"1911.05722",
   tg:["momentum encoder","queue","decoupled batch"],
   n:"用 momentum encoder + queue 取代 memory bank。FAIR 出品，工業實作友善。"},

  {id:"simclr", t:"SimCLR", a:"Chen et al.", v:"ICML 2020", y:2020,
   cat:"SSL", sub:"Contrastive", domain:"general",
   parents:["instdisc"],
   ax:"2002.05709",
   tg:["強增強","projection head","large batch"],
   n:"證明強資料增強 + nonlinear projection head 是 contrastive 的關鍵。CLIP 的 SSL 祖先之一。", pri:1},

  {id:"byol", t:"BYOL", a:"Grill et al.", v:"NeurIPS 2020", y:2020,
   cat:"SSL", sub:"Non-contrastive", domain:"general",
   parents:["moco"],
   ax:"2006.07733",
   tg:["無負樣本","predictor","stop-gradient"],
   n:"沒有負樣本也能學到好表徵。挑戰了 contrastive 必要性的迷思。"},

  {id:"swav", t:"SwAV", a:"Caron et al.", v:"NeurIPS 2020", y:2020,
   cat:"SSL", sub:"Clustering-based", domain:"general",
   parents:["simclr","moco"],
   ax:"2006.09882",
   tg:["online clustering","Sinkhorn","multi-crop"],
   n:"用線上聚類分配代替直接對比。multi-crop 增強至今仍廣用。"},

  {id:"simsiam", t:"SimSiam", a:"Chen & He", v:"CVPR 2021", y:2021,
   cat:"SSL", sub:"Non-contrastive", domain:"general",
   parents:["byol","simclr"],
   ax:"2011.10566",
   tg:["stop-gradient analysis","minimalist"],
   n:"極簡 BYOL — 移除 momentum encoder。論文重點是解釋為何 stop-gradient 防止 collapse。"},

  {id:"mae", t:"Masked Autoencoder (MAE)", a:"He et al.", v:"CVPR 2022", y:2021,
   cat:"SSL", sub:"Masked Image Modeling", domain:"general",
   parents:["vit"],
   ax:"2111.06377",
   tg:["75% masking","asymmetric encoder-decoder","pixel reconstruction"],
   n:"BERT for vision。遮 75% patch 重建，pretrain 速度快。VideoMAE / SurgRec 的祖先。", pri:1},

  {id:"dino", t:"DINO", a:"Caron et al.", v:"ICCV 2021", y:2021,
   cat:"SSL", sub:"Self-distillation", domain:"general",
   parents:["byol","vit"],
   ax:"2104.14294",
   tg:["self-distillation","emergent segmentation","teacher EMA"],
   n:"ViT + self-distillation 後，attention map 自動產生語意分割。SurgeNetXL 預訓練核心方法。", pri:1},

  {id:"ibot", t:"iBOT", a:"Zhou et al.", v:"ICLR 2022", y:2022,
   cat:"SSL", sub:"Hybrid SSL", domain:"general",
   parents:["dino","mae"],
   ax:"2111.07832",
   tg:["online tokenizer","masked + distillation"],
   n:"DINO + MAE 的混血 — 同時做 masked image modeling 和 self-distillation。DINOv2 的直接前身。"},

  {id:"dinov2", t:"DINOv2", a:"Oquab et al.", v:"TMLR 2023", y:2023,
   cat:"SSL", sub:"Foundation Visual Features", domain:"general",
   parents:["dino","ibot"],
   ax:"2304.07193",
   tg:["1.42B 圖像","通用視覺特徵","凍結適配"],
   n:"目前最強通用視覺特徵 SSL backbone。下游任務 frozen 也很強，常作 zero-tuning baseline。", pri:1},
];
