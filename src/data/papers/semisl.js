// ============================================================
// semisl.js — Semi-supervised learning
// ============================================================
// The pseudo-label → consistency regularization line. Highly
// relevant for surgical AI where labeled frames are expensive
// but unlabeled video is abundant.

export const SEMI_SL_PAPERS = [
  {id:"pseudolabel", t:"Pseudo-Label", a:"Lee", v:"ICML Workshop 2013", y:2013,
   cat:"SemiSL", sub:"Self-training", domain:"general",
   parents:[],
   doi:"10.1.1.664.3543",
   tg:["self-training","entropy minimization"],
   n:"極簡 self-training — 用模型 confident prediction 當 pseudo-label。後續所有 semi-SL 方法的祖先。"},

  {id:"meanteacher", t:"Mean Teacher", a:"Tarvainen & Valpola", v:"NeurIPS 2017", y:2017,
   cat:"SemiSL", sub:"Consistency Regularization", domain:"general",
   parents:["pseudolabel"],
   ax:"1703.01780",
   tg:["EMA teacher","consistency loss"],
   n:"用 EMA 學生模型權重當 teacher。EMA 概念後來被 BYOL / DINO 廣泛採用。"},

  {id:"mixmatch", t:"MixMatch", a:"Berthelot et al.", v:"NeurIPS 2019", y:2019,
   cat:"SemiSL", sub:"Holistic", domain:"general",
   parents:["meanteacher","pseudolabel"],
   ax:"1905.02249",
   tg:["MixUp","sharpening","K augmentations"],
   n:"統一 entropy minimization、consistency、MixUp 三個技巧。"},

  {id:"fixmatch", t:"FixMatch", a:"Sohn et al.", v:"NeurIPS 2020", y:2020,
   cat:"SemiSL", sub:"Consistency Regularization", domain:"general",
   parents:["mixmatch"],
   ax:"2001.07685",
   tg:["weak/strong aug","confidence threshold","CIFAR SOTA"],
   n:"極簡卻有效 — 用 weak aug 產生 pseudo-label，要求 strong aug 預測一致。手術 semi-SL 常用 baseline。", pri:2},

  {id:"noisystudent", t:"Noisy Student", a:"Xie et al.", v:"CVPR 2020", y:2020,
   cat:"SemiSL", sub:"Self-training at Scale", domain:"general",
   parents:["pseudolabel","efficientnet"],
   ax:"1911.04252",
   tg:["iterative self-training","JFT-300M","noise injection"],
   n:"反覆 self-training + EfficientNet，把 ImageNet top-1 推到 88.4%。"},
];
