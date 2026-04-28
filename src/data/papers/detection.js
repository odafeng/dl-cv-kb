// ============================================================
// detection.js — Object detection lineage
// ============================================================
// Two-stage (R-CNN family) and one-stage (YOLO family) plus
// the Transformer-era DETR. Mask R-CNN sits in segmentation.js
// because its mask head is what makes it relevant here.

export const DET_PAPERS = [
  {id:"rcnn", t:"R-CNN", a:"Girshick et al.", v:"CVPR 2014", y:2014,
   cat:"Detection", sub:"Two-stage", domain:"general",
   parents:["alexnet"],
   ax:"1311.2524",
   tg:["region proposals","selective search","SVM"],
   n:"首次把 CNN 用於 detection。慢但奠定 proposal-then-classify 範式。"},

  {id:"fasterrcnn", t:"Faster R-CNN", a:"Ren et al.", v:"NeurIPS 2015", y:2015,
   cat:"Detection", sub:"Two-stage", domain:"general",
   parents:["rcnn","vgg"],
   ax:"1506.01497",
   tg:["RPN","end-to-end","anchors"],
   n:"用 RPN 取代 selective search，end-to-end trainable。10 年來工業界部署最多的 detector 之一。"},

  {id:"yolo", t:"YOLO (v1)", a:"Redmon et al.", v:"CVPR 2016", y:2016,
   cat:"Detection", sub:"One-stage", domain:"general",
   parents:["googlenet"],
   ax:"1506.02640",
   tg:["single-shot","real-time","grid prediction"],
   n:"You Only Look Once — 把 detection 變成 single-shot regression。45 FPS 開創即時 detection 的時代。"},

  {id:"detr", t:"DETR", a:"Carion et al.", v:"ECCV 2020", y:2020,
   cat:"Detection", sub:"Transformer-based", domain:"general",
   parents:["fasterrcnn","vit"],
   ax:"2005.12872",
   tg:["set prediction","Hungarian matching","no anchors"],
   n:"用 Transformer + bipartite matching 取消 anchor / NMS 等手工設計。"},

  {id:"yolov8", t:"YOLOv8 / YOLOv11", a:"Ultralytics", v:"2023–2024", y:2023,
   cat:"Detection", sub:"One-stage", domain:"general",
   parents:["yolo"],
   gh:"ultralytics/ultralytics",
   tg:["anchor-free","unified API","production"],
   n:"YOLO 家族的當代 production-ready 版本。手術 instrument detection 常用基線。"},
];
