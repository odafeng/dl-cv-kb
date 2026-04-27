// ============================================================
// data.js — pure static data (no DOM, no side effects)
// ============================================================

// ----- Papers -----
export const P = [
  // Spatial backbones
  {id:"surgenetxl",s:"空間特徵骨幹",t:"SurgeNetXL",a:"Jaspers et al.",v:"MedIA 2026",doi:"10.1016/j.media.2025.103873",gh:"TimJaspers0801/SurgeNet",tg:["CAFormer","DINO","470萬幀","自監督"],n:"目前最強手術空間骨幹。470萬幀、23+術式。建議預設空間編碼器。",pri:1},
  {id:"surgvista",s:"空間特徵骨幹",t:"SurgVISTA",a:"Yang et al.",v:"npj Digit Med 2026",doi:"10.1038/s41746-026-02403-0",ax:"2506.02692",gh:"isyangshu/SurgVISTA",tg:["VideoMAE","影片原生","355萬幀"],n:"首個影片層級手術基礎模型。聯合時空學習，workflow recognition 特強。",pri:2},
  {id:"surgmotion",s:"空間特徵骨幹",t:"SurgMotion",a:"Wu et al.",v:"arXiv 2026",ax:"2602.05638",tg:["V-JEPA","動作引導","1500萬片段"],n:"最新最大。潛在動作預測取代像素重建。15M clips / 3658 hrs / 13+ 解剖區域。",pri:3},
  {id:"lemon",s:"空間特徵骨幹",t:"LEMON / LemonFM",a:"ViSurg-AI",v:"CVPR 2026",gh:"visurg-ai/surg-3m",tg:["Image FM","Phase fine-tune","公開腳本"],n:"手術影像基礎模型，repo 直接提供 phase recognition fine-tuning script。非常實用的 frame encoder。",pri:1},
  {id:"surgrec",s:"空間特徵骨幹",t:"SurgRec",a:"2026 預印本",v:"arXiv 2026",ax:"2603.29966",tg:["MAE","JEPA","10535部","可重現"],n:"可擴展可重現的預訓練方案。方法學參考。"},
  // Temporal heads
  {id:"mstcn",s:"時序建模頭",t:"MS-TCN",a:"Farha & Gall",v:"CVPR 2019",doi:"10.1109/CVPR.2019.00369",gh:"ChinaYi/MS-TCN2",tg:["TCN","膨脹卷積","動作分割"],n:"多階段 TCN 開山之作。所有後續方法的基線。",pri:1},
  {id:"tecno",s:"時序建模頭",t:"TeCNO",a:"Czempiel et al.",v:"MICCAI 2020",doi:"10.1007/978-3-030-59716-0_33",gh:"tobiascz/TeCNO",tg:["MS-TCN變體","手術專用","因果推論"],n:"MS-TCN 適配手術階段辨識。首證 TCN>LSTM。你的主要基線。先 reproduce 這個。",pri:1},
  {id:"transsvnet",s:"時序建模頭",t:"Trans-SVNet",a:"Gao et al.",v:"MICCAI 2021",doi:"10.1007/978-3-030-87202-1_57",ax:"2103.09712",tg:["Transformer","混合嵌入","91fps"],n:"首次引入 Transformer 至手術工作流程。你的第二基線。"},
  {id:"dacat",s:"時序建模頭",t:"DACAT",a:"Yang et al.",v:"ICASSP 2025",doi:"10.1109/ICASSP49660.2025.10890444",gh:"kk42yy/DACAT",tg:["雙流","自適應片段","SOTA"],n:"Cholec80/M2CAI16/AutoLaparo SOTA temporal head。"},
  {id:"lovit",s:"時序建模頭",t:"LoViT",a:"Liu et al.",v:"MedIA 2025",doi:"10.1016/j.media.2024.103366",gh:"MRUIL/LoViT",tg:["長影片","ProbSparse","多尺度"],n:"擅長超長手術影片。多尺度局部＋全域聚合。"},
  {id:"must",s:"時序建模頭",t:"MuST",a:"BCV-Uniandes",v:"MICCAI 2024",gh:"BCV-Uniandes/MuST",tg:["Multi-Scale Transformer","Two-stage","PhaKIR冠軍"],n:"Multi-Scale Transformers for Surgical Phase Recognition。PhaKIR 2024 challenge winning solution。",pri:2},
  {id:"surgformer",s:"時序建模頭",t:"Surgformer",a:"2024",ax:"2408.03867",tg:["階層式時序注意力","手術專用"],n:"Hierarchical temporal attention 針對手術影片設計。"},
  {id:"mosformer",s:"時序建模頭",t:"MoSFormer",a:"2024",tg:["Memory of Surgery","長程依賴"],n:"加入 Memory of Surgery 補足固定 context window 缺點，適合超長手術流程。"},
  // VLM
  {id:"hecvl",s:"視覺語言模型",t:"HecVL",a:"Yuan et al.",v:"MICCAI 2024",doi:"10.1007/978-3-031-72089-5_29",ax:"2405.10075",gh:"CAMMA-public/PeskaVLP",tg:["階層式","零樣本","對比學習"],n:"階層式影片文字預訓練，跨術式零樣本階段辨識。"},
  {id:"peskavlp",s:"視覺語言模型",t:"PeskaVLP",a:"Yuan et al.",v:"NeurIPS 2024 Spotlight",ax:"2410.00263",gh:"CAMMA-public/PeskaVLP",tg:["術式感知","知識增強"],n:"HecVL 進化版。+12.3% accuracy。目前最強手術 VLM。"},
  // Plane recognition
  {id:"igaki2022",s:"切割平面辨識",t:"Igaki — TME 疏鬆結締組織分割",a:"Igaki et al.",v:"DCR 2022",doi:"10.1097/DCR.0000000000002393",tg:["DeepLabv3+","600張","32例"],n:"首篇 TME 平面導航。僅疏鬆結締組織分割。"},
  {id:"kolbinger",s:"切割平面辨識",t:"Kolbinger — 機器人直腸切除情境感知",a:"Kolbinger et al.",v:"EJSO 2024",doi:"10.1016/j.ejso.2023.106996",tg:["DeepLabv3","57台RARR","16結構"],n:"最全面。階段辨識＋16 種結構分割，無血管平面 F1=0.54。"},
  {id:"suzuki2025",s:"切割平面辨識",t:"Suzuki — AI 導航 TME 骨盆筋膜平面分割",a:"Suzuki, Kitaguchi et al.",v:"Ann Gastroenterol Surg 2025",doi:"10.1002/ags3.70064",pmc:"PMC12586929",tg:["FPN+EfficientNetB7","2861張","157例","NCC Japan"],n:"Kitaguchi/Ito 組 (NCC Japan)。腹腔鏡 TME 三區域分割：直腸繫膜 DSC 90.4%、骨盆壁 90.6%、Holy plane 68.5%。",pri:2},
  {id:"kumazu",s:"切割平面辨識",t:"Kumazu — 胃切除 LCTF 分割",a:"Kumazu et al.",v:"Sci Reports 2021",doi:"10.1038/s41598-021-00557-3",tg:["U-Net","結締組織","可遷移"],n:"同概念用於胃切除。已證跨術式遷移可行。"},
  // Benchmark & Challenge
  {id:"surgbench",s:"基準與挑戰",t:"SurgBench",a:"2025",v:"arXiv 2025",ax:"2506.07603",tg:["53M frames","22術式","72 tasks","統一基準"],n:"你的「地圖」。涵蓋 6 大類 72 tasks，不讀這篇容易把 phase recognition 當成整個領域。",pri:1},
  {id:"phakir",s:"基準與挑戰",t:"PhaKIR 2024 Challenge",a:"Rueckert et al.",v:"MedIA 2026",doi:"10.1016/j.media.2026.103945",ax:"2507.16559",tg:["跨中心驗證","膽囊切除","泛化能力差"],n:"現實校正器。三醫學中心真實資料，各方法跨中心泛化都不好。影響你的 split 設計與 external validation。",pri:1},
];

export const SEC_ORDER = ["空間特徵骨幹","時序建模頭","視覺語言模型","切割平面辨識","基準與挑戰"];

export const PAGES = [
  {id:"overview",icon:"🎯",t:"論文概覽"},
  {id:"phases",icon:"🔬",t:"9-Phase Schema"},
  {id:"roadmap_learn",icon:"📖",t:"學習路線"},
  {id:"prereqs",icon:"📚",t:"先備知識"},
  {id:"roadmap",icon:"🗺️",t:"論文路線圖"},
  {id:"graph",icon:"🕸️",t:"知識圖譜"},
];

// ----- Chapter plans -----
export const CHP = [
  {n:1,t:"手術階段辨識",sub:"基礎層",color:"#6688ff",
   q:"在機器人全直腸繫膜切除術（robotic TME）影片中，如何自動辨識手術所處階段？",
   bg:"目前手術階段辨識研究集中在腹腔鏡膽囊切除術（Cholec80），尚無專門針對機器人 TME 的階段辨識資料集。TME 手術更長、更複雜，涉及深部骨盆解剖，且手術視野變化大。",
   data:[
    "約 100 台達文西機器人 TME 手術影片（高雄榮總）",
    "9 階段標註架構 v0.1：Abdominal inspection → IMA/IMV ligation → Medial-to-lateral dissection → Lateral mobilization → Splenic flexure → Posterior TME → Anterior-lateral TME → Rectal transection → Reconstruction",
    "逐幀標註（1 fps 取樣），由大腸直腸外科專科醫師標註",
    "訓練/驗證/測試切分：70/10/20（依手術分），外部驗證視資料量決定",
   ],
   method:[
    "二階段架構：Spatial backbone → Temporal head",
    "Spatial backbone 候選：SurgeNetXL（CAFormer, 470萬幀預訓練）、LemonFM（CVPR 2026, 直接提供 phase fine-tuning script）",
    "Temporal head 候選：TeCNO（基線, causal MS-TCN）、MuST（PhaKIR 2024 冠軍, multi-scale Transformer）、DACAT（SOTA, dual-stream adaptive）",
    "基線對照：ImageNet ResNet50 + TeCNO",
    "消融實驗：backbone 效果、temporal head 比較、預訓練策略",
   ],
   metrics:["Accuracy","Phase-wise F1（macro & per-phase）","Jaccard index","Precision / Recall per phase","推論速度（FPS）"],
   risks:["標註一致性：inter-rater agreement 需量化","資料量：100 台可能不足以訓練大型 temporal model → 遷移學習 + 資料增強","phase imbalance：Phase 1, 8, 9 可能極短 → weighted loss"],
   out:"全球首個機器人 TME 階段辨識基準，含公開的 9-phase schema 與基線結果",
   papers:["surgenetxl","lemon","tecno","must","dacat","surgbench","phakir"],
   timeline:"PhD Year 1（2026 Q3–Q4）"},
  {n:2,t:"切割平面辨識",sub:"核心貢獻",color:"#78dca0",
   q:"能否即時分割出 TME 手術中的 holy plane、直腸繫膜筋膜（mesorectal fascia）與骨盆壁筋膜（parietal pelvic fascia）？",
   bg:"正確的筋膜平面解剖是 TME 手術品質的核心。Igaki 2022 首次嘗試疏鬆結締組織分割（DSC ~0.54），Igaki 2025 擴展至三區域分割（Holy plane DSC 68.5%）。Kolbinger 2024 在機器人直腸切除中分割 16 種結構但無血管平面 F1 僅 0.54。現有研究均受限於小資料集與單一術式。",
   data:[
    "從 Chapter 1 標註完成的影片中選取骨盆解剖階段片段",
    "像素級標註：3 類（直腸繫膜筋膜、骨盆壁筋膜、Holy plane）",
    "標註策略：SAM/SAM2 輔助初始標註 → 大腸直腸外科專科醫師逐張校正",
    "預估 2000–3000 張標註影像（來自 ~60–80 台手術）",
   ],
   method:[
    "語意分割架構：U-Net / DeepLabv3+ / SegFormer",
    "Backbone 比較：SurgeNetXL（手術預訓練）vs ImageNet（通用預訓練）",
    "嘗試半監督學習：用未標註幀增強訓練",
    "後處理：temporal smoothing（利用影片連續性減少閃爍）",
   ],
   metrics:["Dice Similarity Coefficient (DSC) per class","Normalized Surface Distance (NSD)","Boundary F1","各區域分開報告 + 整體 mean DSC"],
   risks:["Holy plane 邊界模糊 → DSC 可能偏低（Igaki 2025 報告 68.5%）","標註者間一致性：需要至少 2 位外科醫師雙盲標註子集","類別不平衡：holy plane 佔畫面比例小 → focal loss + 過採樣"],
   out:"機器人 TME 最佳平面分割結果，超越 Igaki 2025 的三區域 DSC",
   papers:["igaki2022","suzuki2025","kolbinger","kumazu","surgenetxl"],
   timeline:"PhD Year 2（2027 Q1–Q2）"},
  {n:3,t:"階段感知導航",sub:"整合應用",color:"#ffb464",
   q:"將階段辨識與平面分割整合後，能否透過「僅在骨盆解剖階段啟動平面分割」來降低誤報率並實現即時導航？",
   bg:"手術中全程運行分割模型會產生大量誤報（在非相關階段偵測到偽陽性平面）。Kolbinger 2024 提出情境感知概念但未真正整合階段辨識。本研究首次將兩個模組串聯：Phase Recognition → 骨盆解剖啟動 → Plane Segmentation。",
   data:[
    "使用 Chapter 1 的階段辨識模型 + Chapter 2 的平面分割模型",
    "完整手術影片端對端測試（不再只是片段）",
    "臨床回饋：外科醫師操作評估問卷",
   ],
   method:[
    "管線架構：Phase model 持續推論 → 偵測到 Phase 6/7 時啟動 Segmentation model",
    "評估策略 A：Phase-aware（僅 Phase 6/7 啟動）vs Always-on（全程啟動）",
    "評估策略 B：不同 phase prediction 延遲容忍度的影響",
    "效能評估：延遲（latency）、GPU 記憶體、FPS",
    "達文西研究控制台展示：即時 overlay 視覺化",
   ],
   metrics:["誤報率（FP/min）比較：Phase-aware vs Always-on","整體系統 Dice（端對端）","推論延遲（ms per frame）","外科醫師主觀評分（NASA-TLX 或自訂量表）"],
   risks:["Phase 辨識延遲可能導致 Segmentation 啟動過慢 → 評估 grace period","即時推論需要模型輕量化 → 可能犧牲準確度","IRB 審查：即時展示給外科醫師需要額外倫理核准"],
   out:"情境感知 TME 導航系統，證明 phase-aware activation 降低誤報率",
   papers:["kolbinger","surgenetxl","surgvista"],
   timeline:"PhD Year 2–3（2027 Q3–2028 Q1）"},
];

// ----- 9-phase schema -----
export const PHASES = [
  {en:"Abdominal inspection / exposure",zh:"腹腔探查與暴露",
   desc:"置入 trocar 後探查腹腔、確認腫瘤位置、擺放病人體位（Trendelenburg + right tilt），將小腸推離骨盆。",
   cue:"鏡頭在腹腔全景掃描，無明確切割動作",
   to:"開始辨識並接近 IMA 根部"},
  {en:"IMA/IMV approach and ligation",zh:"下腸繫膜動靜脈處理與結紮",
   desc:"辨識 IMA 起源處，沿主動脈前方分離，以 Hem-o-lok / 血管釘 / 能量裝置結紮 IMA（high tie 或 low tie）。IMV 可同步處理或延後至脾彎游離時。",
   cue:"辨認主動脈前方的 IMA，夾具或能量裝置出現在血管上",
   to:"IMA（± IMV）結紮完成，轉向結腸繫膜內側"},
  {en:"Medial-to-lateral mesocolon dissection",zh:"由內向外結腸繫膜分離",
   desc:"從 IMA 斷端沿 Toldt's fascia 向外側、頭端分離，建立結腸繫膜與後腹膜之間的無血管平面。辨識左側輸尿管與性腺血管並保護。",
   cue:"在後腹膜上方的膜層間推進，可見黃色脂肪與筋膜間隙",
   to:"內側分離到達腹壁側腹膜反折處（lateral peritoneal reflection）"},
  {en:"Lateral colon mobilization",zh:"外側結腸游離",
   desc:"切開 left paracolic gutter 的側腹膜，將降結腸從側腹壁游離。與 Phase 3 的內側分離平面會合。",
   cue:"沿腹壁白線（white line of Toldt）切開腹膜",
   to:"降結腸完全游離，視野轉向脾彎方向"},
  {en:"Splenic flexure mobilization",zh:"脾彎游離",
   desc:"分離橫結腸繫膜與大網膜之間的粘連，游離脾彎使降結腸有足夠長度進行無張力吻合。需注意脾臟下極避免損傷。",
   cue:"視野朝向左上方，分離結腸與胃大彎/脾臟之間的組織",
   to:"脾彎完全游離，結腸可無張力拉到骨盆；視野轉入骨盆"},
  {en:"Posterior / early pelvic TME dissection",zh:"後方／早期骨盆 TME 解剖",
   desc:"進入骨盆，沿直腸後方的 holy plane（直腸固有筋膜與壁層骨盆筋膜之間的無血管平面）向遠端分離。辨識並保護下腹神經（hypogastric nerve）。此階段為 plane recognition 的核心區域。",
   cue:"視野深入骨盆，在直腸後方的疏鬆結締組織間推進",
   to:"後方解剖到達骨盆底（levator ani 水平），轉向前方與側方"},
  {en:"Anterior-lateral / distal pelvic TME completion",zh:"前側方／遠端骨盆 TME 完成",
   desc:"完成前方（Denonvilliers' fascia 前方或後方）及兩側方的 TME 分離。辨識並保護骨盆神經叢（pelvic plexus）。直腸周圍 360° 完全游離至預定切斷點。",
   cue:"視野在直腸前方（男性：精囊/前列腺；女性：子宮/陰道）與兩側方交替",
   to:"直腸 360° 周圍完全游離，可清楚看到預定切斷點遠端的直腸壁"},
  {en:"Rectal transection",zh:"直腸切斷",
   desc:"以線性切割釘合器（stapler）在腫瘤遠端足夠安全距離處切斷直腸。可能需要多次擊發。低位腫瘤可能需要經肛門 ISR 或 Hartmann 術式。",
   cue:"Endo-GIA / 線性切割器出現在視野中，夾住直腸",
   to:"直腸切斷完成，標本可取出"},
  {en:"Reconstruction / anastomosis",zh:"重建／吻合",
   desc:"取出標本後，進行結腸-直腸（或結腸-肛管）吻合。通常使用環形釘合器（circular stapler）進行端對端吻合。測試吻合口密封性（leak test）。視需要建立暫時性迴腸造口。",
   cue:"環形釘合器鉆頭（anvil）出現；或經肛門操作",
   to:"—（手術結束）"},
];

// ----- Learning roadmap (phase-by-phase) -----
export const LEARN_ROADMAP = [
  {stage:"第一階段：掌握 backbone + temporal head",
   items:["SurgeNetXL 或 LemonFM 當 frame encoder","TeCNO 當 temporal head","先 reproduce → 再跑自己的 TME data"],
   note:"最容易收斂、debug、寫出第一篇 paper。"},
  {stage:"第二階段：比較 temporal modeling",
   items:["TeCNO vs MuST vs Surgformer","回答：TCN 類 vs Transformer 類對你的 9-phase TME 哪個最好","這步的研究訊號比追巨型 FM 更高"],
   note:""},
  {stage:"第三階段：探索 video-native FM",
   items:["SurgVISTA probing / fine-tuning","SurgMotion（如果已公開 weights）","問題變成：video-native pretraining 在 robotic TME 有額外收益嗎？"],
   note:"這是頂刊等級的方法學問題。"},
];

// ----- Prerequisite knowledge -----
export const PREREQS = [
  ["深度學習基礎",["CNN（ResNet, EfficientNet, ConvNeXt, CAFormer）","Transformer / 自注意力機制","自監督學習（DINO, MAE, V-JEPA, 對比學習）","遷移學習與微調策略","語意分割（U-Net, DeepLabv3+, FPN, SegFormer）"]],
  ["影片理解",["時序卷積網路（TCN、膨脹因果卷積）","影片 Transformer（TimeSformer, VideoMAE）","動作分割 vs. 動作辨識","線上（因果）vs. 離線推論"]],
  ["手術資料科學",["手術工作流程 / 階段辨識範式","二階段流程：spatial backbone + temporal head","手術影片標註工具與協定","Accuracy, F1, Jaccard, Precision, Recall","Cholec80 資料切分與評估協定"]],
  ["臨床知識",["TME：直腸繫膜筋膜、骨盆壁筋膜、Holy plane","自律神經保留（下腹神經、骨盆神經叢）","Quirke 分級評估 TME 標本品質","手術困難因子：狹窄骨盆、肥胖、CRT","機器人 vs. 腹腔鏡 TME 差異"]],
];

// ----- Paper roadmap (chapter-aligned task list) -----
export const PAPER_ROADMAP = [
  {n:1,c:"#6688ff",bg:"rgba(102,136,255,.12)",t:"機器人 TME 手術階段辨識",
   tasks:["定義 9 階段標註架構","標註約100台影片","SurgeNetXL/LemonFM + TeCNO/MuST/DACAT","與 ImageNet ResNet50 基線比較","分析各階段準確度"],
   out:"全球首個機器人TME階段辨識基準"},
  {n:2,c:"#78dca0",bg:"rgba(120,220,160,.12)",t:"Holy Plane 與筋膜平面分割",
   tasks:["標註架構：直腸繫膜 / 骨盆壁 / Holy plane","像素級標註（SAM輔助→專家校正）","分割模型基準測試","SurgeNetXL vs ImageNet backbone","DSC, NSD, 各區域準確度"],
   out:"機器人TME最佳平面分割結果"},
  {n:3,c:"#ffb464",bg:"rgba(255,180,100,.12)",t:"階段感知平面導航",
   tasks:["整合階段辨識與平面分割","僅骨盆解剖階段啟動","評估階段感知降低誤報","達文西即時推論展示","外科醫師回饋研究"],
   out:"情境感知 TME 導航系統"},
];

// ----- Knowledge graph -----
export const SECTION_COLORS = {"空間特徵骨幹":"#6688ff","時序建模頭":"#78dca0","視覺語言模型":"#ff7eb3","切割平面辨識":"#ffb464","基準與挑戰":"#e0e0e0"};
export const EDGE_COLORS = {builds_on:"#78dca0",compares:"#6688ff",extends:"#ffb464",cites:"#888",inspired_by:"#ff7eb3",has_concept:"#ffd54f22"};

export const GRAPH_DATA = {"nodes":[{"id":"dacat","type":"paper"},{"id":"hecvl","type":"paper"},{"id":"igaki2022","type":"paper"},{"id":"suzuki2025","type":"paper"},{"id":"kolbinger","type":"paper"},{"id":"kumazu","type":"paper"},{"id":"lemon","type":"paper"},{"id":"lovit","type":"paper"},{"id":"mosformer","type":"paper"},{"id":"mstcn","type":"paper"},{"id":"must","type":"paper"},{"id":"peskavlp","type":"paper"},{"id":"phakir","type":"paper"},{"id":"surgbench","type":"paper"},{"id":"surgenetxl","type":"paper"},{"id":"surgformer","type":"paper"},{"id":"surgmotion","type":"paper"},{"id":"surgrec","type":"paper"},{"id":"surgvista","type":"paper"},{"id":"tecno","type":"paper"},{"id":"transsvnet","type":"paper"},{"id":"c_手術階段辨識","type":"concept","label":"手術階段辨識","count":10},{"id":"c_時序建模","type":"concept","label":"時序建模","count":8},{"id":"c_注意力機制","type":"concept","label":"注意力機制","count":6},{"id":"c_膨脹卷積","type":"concept","label":"膨脹卷積","count":3},{"id":"c_視覺語言模型","type":"concept","label":"視覺語言模型","count":2},{"id":"c_對比學習","type":"concept","label":"對比學習","count":2},{"id":"c_語意分割","type":"concept","label":"語意分割","count":4},{"id":"c_TME導航","type":"concept","label":"TME導航","count":2},{"id":"c_骨盆解剖","type":"concept","label":"骨盆解剖","count":2},{"id":"c_遷移學習","type":"concept","label":"遷移學習","count":2},{"id":"c_基礎模型","type":"concept","label":"基礎模型","count":5},{"id":"c_自監督預訓練","type":"concept","label":"自監督預訓練","count":6},{"id":"c_大規模資料","type":"concept","label":"大規模資料","count":6},{"id":"c_長影片處理","type":"concept","label":"長影片處理","count":2},{"id":"c_多尺度特徵","type":"concept","label":"多尺度特徵","count":2},{"id":"c_基準評估","type":"concept","label":"基準評估","count":2}],"edges":[{"source":"dacat","target":"mstcn","type":"builds_on","label":"改進 MS-TCN 的時序建模"},{"source":"dacat","target":"transsvnet","type":"compares","label":"超越 Trans-SVNet"},{"source":"dacat","target":"tecno","type":"compares","label":"對比基線"},{"source":"hecvl","target":"peskavlp","type":"inspired_by","label":"PeskaVLP 的前身"},{"source":"igaki2022","target":"suzuki2025","type":"inspired_by","label":"Suzuki 等受啟發"},{"source":"igaki2022","target":"kolbinger","type":"compares","label":"同領域競爭"},{"source":"suzuki2025","target":"igaki2022","type":"extends","label":"單區域→三區域 (NCC Japan)"},{"source":"suzuki2025","target":"kolbinger","type":"compares","label":"不同分割策略"},{"source":"kolbinger","target":"igaki2022","type":"compares","label":"更全面結構分割"},{"source":"kolbinger","target":"tecno","type":"cites","label":"使用階段辨識概念"},{"source":"kumazu","target":"igaki2022","type":"inspired_by","label":"類似概念不同術式"},{"source":"lemon","target":"surgenetxl","type":"compares","label":"競爭空間骨幹"},{"source":"lemon","target":"tecno","type":"builds_on","label":"提供 phase fine-tune"},{"source":"lovit","target":"transsvnet","type":"builds_on","label":"改進長程依賴"},{"source":"lovit","target":"mosformer","type":"compares","label":"類似長影片目標"},{"source":"mosformer","target":"transsvnet","type":"builds_on","label":"擴展記憶機制"},{"source":"mstcn","target":"tecno","type":"inspired_by","label":"TeCNO 直接改編"},{"source":"must","target":"phakir","type":"builds_on","label":"PhaKIR 冠軍方案"},{"source":"must","target":"transsvnet","type":"builds_on","label":"改進 Transformer"},{"source":"peskavlp","target":"hecvl","type":"extends","label":"HecVL 進化版 +12.3%"},{"source":"phakir","target":"must","type":"cites","label":"MuST 為冠軍"},{"source":"phakir","target":"tecno","type":"cites","label":"包含基線"},{"source":"surgbench","target":"surgenetxl","type":"cites","label":"評估空間骨幹"},{"source":"surgbench","target":"tecno","type":"cites","label":"評估時序方法"},{"source":"surgenetxl","target":"surgvista","type":"compares","label":"圖像 vs 影片"},{"source":"surgenetxl","target":"surgmotion","type":"compares","label":"不同自監督目標"},{"source":"surgformer","target":"transsvnet","type":"builds_on","label":"改進 Transformer"},{"source":"surgmotion","target":"surgenetxl","type":"compares","label":"不同預訓練"},{"source":"surgmotion","target":"surgrec","type":"compares","label":"規模比較"},{"source":"surgrec","target":"surgenetxl","type":"compares","label":"預訓練對比"},{"source":"surgvista","target":"surgenetxl","type":"compares","label":"影片 vs 圖像"},{"source":"tecno","target":"mstcn","type":"builds_on","label":"MS-TCN 手術版"},{"source":"transsvnet","target":"tecno","type":"builds_on","label":"加入 Transformer"},{"source":"transsvnet","target":"mstcn","type":"builds_on","label":"整合 TCN+Transformer"},{"source":"dacat","target":"c_手術階段辨識","type":"has_concept","label":""},{"source":"hecvl","target":"c_手術階段辨識","type":"has_concept","label":""},{"source":"kolbinger","target":"c_手術階段辨識","type":"has_concept","label":""},{"source":"lemon","target":"c_手術階段辨識","type":"has_concept","label":""},{"source":"must","target":"c_手術階段辨識","type":"has_concept","label":""},{"source":"phakir","target":"c_手術階段辨識","type":"has_concept","label":""},{"source":"surgbench","target":"c_手術階段辨識","type":"has_concept","label":""},{"source":"surgformer","target":"c_手術階段辨識","type":"has_concept","label":""},{"source":"tecno","target":"c_手術階段辨識","type":"has_concept","label":""},{"source":"transsvnet","target":"c_手術階段辨識","type":"has_concept","label":""},{"source":"dacat","target":"c_時序建模","type":"has_concept","label":""},{"source":"lovit","target":"c_時序建模","type":"has_concept","label":""},{"source":"mosformer","target":"c_時序建模","type":"has_concept","label":""},{"source":"mstcn","target":"c_時序建模","type":"has_concept","label":""},{"source":"must","target":"c_時序建模","type":"has_concept","label":""},{"source":"surgformer","target":"c_時序建模","type":"has_concept","label":""},{"source":"tecno","target":"c_時序建模","type":"has_concept","label":""},{"source":"transsvnet","target":"c_時序建模","type":"has_concept","label":""},{"source":"dacat","target":"c_注意力機制","type":"has_concept","label":""},{"source":"lovit","target":"c_注意力機制","type":"has_concept","label":""},{"source":"mosformer","target":"c_注意力機制","type":"has_concept","label":""},{"source":"must","target":"c_注意力機制","type":"has_concept","label":""},{"source":"surgformer","target":"c_注意力機制","type":"has_concept","label":""},{"source":"transsvnet","target":"c_注意力機制","type":"has_concept","label":""},{"source":"dacat","target":"c_膨脹卷積","type":"has_concept","label":""},{"source":"mstcn","target":"c_膨脹卷積","type":"has_concept","label":""},{"source":"tecno","target":"c_膨脹卷積","type":"has_concept","label":""},{"source":"hecvl","target":"c_視覺語言模型","type":"has_concept","label":""},{"source":"peskavlp","target":"c_視覺語言模型","type":"has_concept","label":""},{"source":"hecvl","target":"c_對比學習","type":"has_concept","label":""},{"source":"peskavlp","target":"c_對比學習","type":"has_concept","label":""},{"source":"igaki2022","target":"c_語意分割","type":"has_concept","label":""},{"source":"suzuki2025","target":"c_語意分割","type":"has_concept","label":""},{"source":"kolbinger","target":"c_語意分割","type":"has_concept","label":""},{"source":"kumazu","target":"c_語意分割","type":"has_concept","label":""},{"source":"igaki2022","target":"c_TME導航","type":"has_concept","label":""},{"source":"suzuki2025","target":"c_TME導航","type":"has_concept","label":""},{"source":"igaki2022","target":"c_骨盆解剖","type":"has_concept","label":""},{"source":"suzuki2025","target":"c_骨盆解剖","type":"has_concept","label":""},{"source":"kumazu","target":"c_遷移學習","type":"has_concept","label":""},{"source":"surgenetxl","target":"c_遷移學習","type":"has_concept","label":""},{"source":"lemon","target":"c_基礎模型","type":"has_concept","label":""},{"source":"surgenetxl","target":"c_基礎模型","type":"has_concept","label":""},{"source":"surgmotion","target":"c_基礎模型","type":"has_concept","label":""},{"source":"surgrec","target":"c_基礎模型","type":"has_concept","label":""},{"source":"surgvista","target":"c_基礎模型","type":"has_concept","label":""},{"source":"lemon","target":"c_自監督預訓練","type":"has_concept","label":""},{"source":"peskavlp","target":"c_自監督預訓練","type":"has_concept","label":""},{"source":"surgenetxl","target":"c_自監督預訓練","type":"has_concept","label":""},{"source":"surgmotion","target":"c_自監督預訓練","type":"has_concept","label":""},{"source":"surgrec","target":"c_自監督預訓練","type":"has_concept","label":""},{"source":"surgvista","target":"c_自監督預訓練","type":"has_concept","label":""},{"source":"lemon","target":"c_大規模資料","type":"has_concept","label":""},{"source":"surgbench","target":"c_大規模資料","type":"has_concept","label":""},{"source":"surgenetxl","target":"c_大規模資料","type":"has_concept","label":""},{"source":"surgmotion","target":"c_大規模資料","type":"has_concept","label":""},{"source":"surgrec","target":"c_大規模資料","type":"has_concept","label":""},{"source":"surgvista","target":"c_大規模資料","type":"has_concept","label":""},{"source":"lovit","target":"c_長影片處理","type":"has_concept","label":""},{"source":"mosformer","target":"c_長影片處理","type":"has_concept","label":""},{"source":"lovit","target":"c_多尺度特徵","type":"has_concept","label":""},{"source":"must","target":"c_多尺度特徵","type":"has_concept","label":""},{"source":"phakir","target":"c_基準評估","type":"has_concept","label":""},{"source":"surgbench","target":"c_基準評估","type":"has_concept","label":""}]};
