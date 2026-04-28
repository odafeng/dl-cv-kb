// ============================================================
// vlm.js — General vision-language models
// ============================================================
// Surgical VLMs (HecVL, PeskaVLP) descend from CLIP. BLIP-2 /
// LLaVA represent the LLM-augmented branch increasingly used
// for surgical report generation and zero-shot phase recognition.

export const VLM_PAPERS = [
  {id:"clip", t:"CLIP", a:"Radford et al.", v:"ICML 2021", y:2021,
   cat:"VLM", sub:"Contrastive VLM", domain:"general",
   parents:["vit","simclr"],
   ax:"2103.00020",
   tg:["400M pairs","contrastive","zero-shot"],
   n:"圖文對比學習打開 zero-shot CV。HecVL/PeskaVLP 直接繼承這個 framework。", pri:1},

  {id:"align", t:"ALIGN", a:"Jia et al.", v:"ICML 2021", y:2021,
   cat:"VLM", sub:"Contrastive VLM", domain:"general",
   parents:["clip"],
   ax:"2102.05918",
   tg:["1.8B noisy pairs","scale matters"],
   n:"Google 版 CLIP — 證明用 noisy alt-text 大規模也能 work，scale 比 data quality 重要。"},

  {id:"blip2", t:"BLIP-2", a:"Li et al.", v:"ICML 2023", y:2023,
   cat:"VLM", sub:"LLM-augmented VLM", domain:"general",
   parents:["clip","vit"],
   ax:"2301.12597",
   tg:["Q-Former","frozen LLM","modular"],
   n:"用 Q-Former 把凍結的視覺編碼器接到凍結的 LLM。模組化設計影響後續所有 VLM。"},

  {id:"llava", t:"LLaVA", a:"Liu et al.", v:"NeurIPS 2023", y:2023,
   cat:"VLM", sub:"Visual Instruction", domain:"general",
   parents:["clip","blip2"],
   ax:"2304.08485",
   tg:["visual instruction tuning","Vicuna","GPT-4 generated data"],
   n:"開源視覺指令 tuning 的標竿。手術領域已有多個基於 LLaVA 的衍生模型 (Surgical-LVLM 等)。"},
];
