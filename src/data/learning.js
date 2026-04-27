// ============================================================
// learning.js — Learning paths and prerequisite knowledge
// ============================================================

// ----- Learning roadmap (phase-by-phase progression) -----
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
