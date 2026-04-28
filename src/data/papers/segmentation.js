// ============================================================
// segmentation.js — General CV semantic segmentation
// ============================================================
// FCN → U-Net → DeepLab → Mask2Former → SAM2 lineage.
// Surgical plane segmentation papers (igaki2022, kolbinger,
// suzuki2025) descend from these.

export const SEG_PAPERS = [
  {id:"fcn", t:"Fully Convolutional Networks (FCN)", a:"Long et al.", v:"CVPR 2015", y:2015,
   cat:"Segmentation", sub:"Foundational", domain:"general",
   parents:["vgg"],
   ax:"1411.4038",
   tg:["dense prediction","skip connections","upsampling"],
   n:"首個 end-to-end 像素級分類網路。把分類 CNN 改成 FCN 範式被沿用至今。"},

  {id:"unet", t:"U-Net", a:"Ronneberger et al.", v:"MICCAI 2015", y:2015,
   cat:"Segmentation", sub:"Biomedical", domain:"general",
   parents:["fcn"],
   ax:"1505.04597",
   tg:["encoder-decoder","skip","biomedical"],
   n:"醫學影像分割的標準 baseline。Kumazu 2021 用此架構做手術結締組織分割。", pri:1},

  {id:"maskrcnn", t:"Mask R-CNN", a:"He et al.", v:"ICCV 2017", y:2017,
   cat:"Segmentation", sub:"Instance Segmentation", domain:"general",
   parents:["resnet"],
   ax:"1703.06870",
   tg:["RoI Align","instance segmentation","FAIR"],
   n:"在 Faster R-CNN 上加 mask head，同時做 detection 和 instance segmentation。"},

  {id:"deeplabv3plus", t:"DeepLabv3+", a:"Chen et al.", v:"ECCV 2018", y:2018,
   cat:"Segmentation", sub:"Atrous + Decoder", domain:"general",
   parents:["fcn","resnet"],
   ax:"1802.02611",
   tg:["atrous convolution","ASPP","encoder-decoder"],
   n:"Atrous (dilated) convolution + 解碼器。Igaki 2022 / Kolbinger 2024 做 TME 平面分割的選擇。", pri:1},

  {id:"segformer", t:"SegFormer", a:"Xie et al.", v:"NeurIPS 2021", y:2021,
   cat:"Segmentation", sub:"Transformer-based", domain:"general",
   parents:["vit","fcn"],
   ax:"2105.15203",
   tg:["階層式 ViT","輕量 MLP head"],
   n:"用階層式 Transformer encoder 配輕量 MLP decoder，效能/速度 trade-off 漂亮。"},

  {id:"mask2former", t:"Mask2Former", a:"Cheng et al.", v:"CVPR 2022", y:2022,
   cat:"Segmentation", sub:"Universal", domain:"general",
   parents:["deeplabv3plus","vit"],
   ax:"2112.01527",
   tg:["mask classification","masked attention","unified"],
   n:"統一 semantic / instance / panoptic 為 mask classification 問題。下游廣泛採用。"},

  {id:"sam", t:"Segment Anything (SAM)", a:"Kirillov et al.", v:"ICCV 2023", y:2023,
   cat:"Segmentation", sub:"Foundation Model", domain:"general",
   parents:["vit","mask2former"],
   ax:"2304.02643",
   tg:["prompt-based","SA-1B","zero-shot"],
   n:"分割界的 GPT。1B mask 預訓練，prompt-driven。手術影片標註的關鍵加速器。", pri:1},

  {id:"sam2", t:"SAM 2", a:"Ravi et al.", v:"arXiv 2024", y:2024,
   cat:"Segmentation", sub:"Foundation Model", domain:"general",
   parents:["sam"],
   ax:"2408.00714",
   tg:["video segmentation","memory","streaming"],
   n:"SAM 擴展到影片，加 memory 機制。手術影片標註自動化的最新工具。"},
];
