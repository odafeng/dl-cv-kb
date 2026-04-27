// ============================================================
// chapters.js — PhD thesis chapter plans + 9-phase TME schema
// ============================================================
// PhD-specific content. Keeps the original CHP and PHASES
// untouched. When DL CV KB is generalized further, these stay
// as the "Surgical Application" track.

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

// ----- 9-phase TME schema -----
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
