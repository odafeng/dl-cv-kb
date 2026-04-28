// ============================================================
// architecture.js — CNN to ViT backbone evolution
// ============================================================
// The backbone family tree from LeNet (1998) → ConvNeXt (2022).
// Many other papers' parents trace back to entries here.

export const ARCH_PAPERS = [
  {id:"lenet", t:"LeNet-5", a:"LeCun et al.", v:"Proc. IEEE 1998", y:1998,
   cat:"Architecture", sub:"Foundational CNN", domain:"general",
   parents:[],
   doi:"10.1109/5.726791",
   tg:["CNN","Backprop","MNIST"],
   n:"首個成功的 CNN。手寫數字辨識。深度學習的考古起點。"},

  {id:"alexnet", t:"AlexNet", a:"Krizhevsky et al.", v:"NeurIPS 2012", y:2012,
   cat:"Architecture", sub:"Deep CNN", domain:"general",
   parents:["lenet"],
   doi:"10.1145/3065386",
   tg:["ImageNet 2012","ReLU","GPU","Dropout"],
   n:"引爆深度學習的論文。把 ImageNet top-5 error 從 26% 砍到 15%。"},

  {id:"vgg", t:"VGG", a:"Simonyan & Zisserman", v:"ICLR 2015", y:2014,
   cat:"Architecture", sub:"Deep CNN", domain:"general",
   parents:["alexnet"],
   ax:"1409.1556",
   tg:["3x3 conv","16/19 層","簡潔"],
   n:"純粹堆 3×3 卷積。設計極簡，至今仍是教材首選。"},

  {id:"googlenet", t:"GoogLeNet / Inception", a:"Szegedy et al.", v:"CVPR 2015", y:2014,
   cat:"Architecture", sub:"Deep CNN", domain:"general",
   parents:["alexnet"],
   ax:"1409.4842",
   tg:["Inception module","1x1 conv","多尺度"],
   n:"Inception 模組同時用多種 kernel size。後來引出 detection / video 的 inflated 版本。"},

  {id:"resnet", t:"ResNet", a:"He et al.", v:"CVPR 2016", y:2015,
   cat:"Architecture", sub:"Deep CNN", domain:"general",
   parents:["vgg","googlenet"],
   ax:"1512.03385",
   tg:["殘差連接","152 層","ImageNet 2015"],
   n:"Skip connection 解決深層網路退化問題。引用最高的 CV 論文之一。", pri:1},

  {id:"densenet", t:"DenseNet", a:"Huang et al.", v:"CVPR 2017", y:2017,
   cat:"Architecture", sub:"Deep CNN", domain:"general",
   parents:["resnet"],
   ax:"1608.06993",
   tg:["dense connection","feature reuse"],
   n:"每層接受所有先前層的 feature concat。參數效率高但記憶體消耗大。"},

  {id:"efficientnet", t:"EfficientNet", a:"Tan & Le", v:"ICML 2019", y:2019,
   cat:"Architecture", sub:"Deep CNN", domain:"general",
   parents:["resnet"],
   ax:"1905.11946",
   tg:["compound scaling","NAS","MBConv"],
   n:"Compound scaling 同時放大 depth/width/resolution。Suzuki 2025 用 B7 做 TME 平面分割。"},

  {id:"vit", t:"Vision Transformer (ViT)", a:"Dosovitskiy et al.", v:"ICLR 2021", y:2020,
   cat:"Architecture", sub:"Transformer Backbone", domain:"general",
   parents:["resnet"],
   ax:"2010.11929",
   tg:["patch embedding","純 attention","JFT-300M"],
   n:"An image is worth 16×16 words. CV 從 CNN 主導轉向 Transformer 的轉折點。後續 SSL/VLM/分割幾乎都建在這上面。", pri:1},

  {id:"swin", t:"Swin Transformer", a:"Liu et al.", v:"ICCV 2021", y:2021,
   cat:"Architecture", sub:"Transformer Backbone", domain:"general",
   parents:["vit"],
   ax:"2103.14030",
   tg:["階層式","shifted window","linear complexity"],
   n:"把 ViT 變成可作 backbone 的階層式設計。dense prediction 任務的常用 baseline。"},

  {id:"convnext", t:"ConvNeXt", a:"Liu et al.", v:"CVPR 2022", y:2022,
   cat:"Architecture", sub:"Modernized CNN", domain:"general",
   parents:["resnet","vit"],
   ax:"2201.03545",
   tg:["modernized CNN","reverse-engineering","ViT-equivalent"],
   n:"把 Swin/ViT 的設計選擇逐項移植回 ResNet，證明純 CNN 在同訓練配方下可與 Transformer 並駕齊驅。"},
];
