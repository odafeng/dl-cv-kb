# 術前 CT 預測首隻 Trocar 進入點沾黏:Zone-level 多標籤分類

> **狀態**: Research note / brainstorm
> **最後更新**: 2026-05
> **Tags**: surgical AI, adhesion prediction, trocar safety, preoperative CT, multi-label classification, visceral slide, minimally invasive surgery

這篇 note 起源於一個對話 — 一開始問的是「AI 能不能用 CT 預測沾黏」,但對話進行到一半才意識到真正有臨床價值的問題不是「沾黏有多嚴重」,而是 **「我等下要打第一刀的這個位置,底下到底安不安全」**。

---

## 為什麼「用 CT 預測沾黏」是錯的 framing

直覺上會把這個問題設計成:術前 CT → 預測 PAI (Peritoneal Adhesion Index) score → 某種臨床應用。但這個 framing 有三個根本問題:

1. **PAI 總分沒有 actionable 意義**。一個 PAI = 15 沾黏全在 RUQ 的病人,跟 PAI = 15 沾黏全在 pelvis 的病人,手術規劃完全不同。外科醫師在乎的是 **分布**,不是 **總分**。
2. **「有沒有沾黏」本身是廢問題**。幾乎所有有過腹部手術的病人都有「某種程度」的沾黏。臨床有意義的訊號是 **嚴重度跟位置**,不是「有/沒有」。
3. **Selection bias 會虛構出 model performance**。會有術前 CT 的病人本來就 enrich 了「有過手術」的群體,沾黏率本來就高。Model 可以靠「重新發明 prior surgery 這個 binary feature」就拿到很高的 AUC — 但這用 logistic regression 就做得到,根本不需要 DL。

把這三個問題一次解決的 reframe:**預測幾個固定 first-trocar 候選進入點的 zone-level 沾黏機率,當成 multi-label classification task。**

---

## 臨床動機

第一隻 trocar 進入腹腔是所有微創腹部手術裡最危險的瞬間。Entry-related visceral injury 發生率約 0.04–0.5%,injury 一旦發生,死亡率約 13%。這個數字 30 年來沒有顯著改善 — 不是因為 Veress needle、Hasson、optical trocar 這些技術不夠進步,而是因為 **問題本質是 information asymmetry,不是 mechanical**:外科醫師根本不知道腹壁那一公分下面有沒有腸子黏著。

現有的解法只解決一部分:

- **術前 ultrasound visceral slide assessment** 對 periumbilical bowel adhesion 的 NPV 大概 99%,是目前最接近 gold standard 的非侵入評估方式。但它 operator-dependent、需要 OR 額外時間、亞洲多數醫院不是 routine、一次只能看一個區域。
- **Cine-MRI visceral slide** 比較量化,但不是 routine preop imaging,健保多半也不給付。
- **術中 video-based abdominal-wall layer detection**(2023 年 Surgical Endoscopy 那篇 YOLOv8 alarm system)是在 entry **過程中** 給警示,但無法影響 **進入點的選擇** — 你已經在那個位置了。

相對地,**術前 CT 幾乎每個 elective 微創手術病人都會做**。問題是:這張靜態 CT 裡到底能不能擠出 entry-site safety 的訊號。

---

## 提議的 Task

對 N 個標準 first-trocar 候選進入點,各自預測「該位置有腸子黏在腹壁上」的機率。

合理的初版 vocabulary(N = 4):

| Site | 解剖位置 | 常用情境 | 典型沾黏率 |
|---|---|---|---|
| Umbilicus | 肚臍 | 預設 entry,大部分手術用 | 高(尤其前次 midline laparotomy) |
| Palmer's point | LUQ, subcostal mid-clavicular | umbilical 不安全時的首選 backup | 低(~5%)— 這也是它能當 backup 的原因 |
| RUQ mirror point | Palmer's 的右側對應點 | LUQ 不適用時的 alternative | 低 |
| Suprapubic | 下腹中線 | 部分 pelvic 手術 | 變動大,前次骨盆手術後偏高 |

Output 是一個 4 維機率向量。臨床決策規則很單純:**選擇預測沾黏機率最低、且在解剖上適合該手術的 site**。

這個 framing 在 DL task 上有幾個友善的性質:

- **Output 結構小**:4 個 binary label,不是 0–30 的 ordinal score。
- **每個 label 都可以從局部 imaging 判斷**:不需要 global reasoning。
- **Ground truth 可以從術中影片觀察**:腹腔鏡進去後幾分鐘內,4 個 zone 通常都會被掃過。
- **Inter-rater agreement 應該會比較高**:「這個 quadrant 有沒有腸子黏腹壁」比 PAI 全套打分容易達成共識。

---

## Prior Art 地圖

這個問題的有趣之處在於:**周邊文獻很密,但我要做的這格是空的**。用一個 2×4 矩陣可以一目了然:

|  | Static CT | Cine-MRI | Ultrasound | Intraop video |
|---|---|---|---|---|
| 全腹沾黏 presence | — | de Wilde et al. 2021 (ConvGRU+ResNet, AUROC 0.83) | Limperg et al. 2020 meta-analysis | — |
| **Entry zone-level 沾黏** | **(空 — 本提案)** | — | Limperg et al. 2020 (periumbilical sens 96%, NPV 99%) | — |
| Entry 時 abdominal-wall layer detection | — | — | — | YOLOv8 alarm system, 2023 |
| Surgical complexity / outcome 預測 | AWR (Elhage et al. 2021, AUROC 0.74); peritoneal metastasis PCI; SBO transition zone | — | — | — |

從這張表可以看出三件事:

1. **DL feasibility 已經被證明了**。de Wilde et al. (2021) 證實 DL 可以從 medical imaging 學出 adhesion-relevant 訊號,即使訊號間接。他們的 cine-MRI AUROC 0.83 是個有用的 upper bound — cine-MRI 的訊號比 static CT 強(因為直接捕捉 visceral slide)。
2. **臨床相關性也已經被證明了**。Ultrasound visceral slide 的 2020 systematic review(1609 病人)已經把「entry-site adhesion 是 well-defined, actionable clinical question」這件事 settle 掉。Reviewer 想要的「這個臨床問題重不重要」的證據已經在文獻裡。
3. **真正未解的是 modality-specific 的問題**:**ultrasound 跟 cine-MRI 用 dynamic 訊號(visceral slide)解決的事情,能不能用 static CT 的 geometric 訊號近似?**

這其實不只是一個 application paper 的問題,而是一個 methodological 的問題。Static CT 沒辦法直接觀察 visceral motion,但 plausibly 可以捕捉間接的 geometric signature:前次手術留下的 surgical clips / mesh、bowel 跟腹壁之間 fat plane 的保留、舊疤痕沿線的異常 angulation、bowel loop 與 parietal peritoneum 的異常貼近。

---

## 為什麼這格是空的(假說)

三個 plausible 的解釋:

1. **需要的技能交集太窄**。把這個做好需要同時有 (a) first-trocar 進入決策的臨床經驗、(b) 影片庫 + 對應的術前 CT、(c) DL/CV 能力、(d) 願意花時間 retrospective 打 label。同時擁有這四項的人不多 — 在台灣大概 5 個以內。

2. **歐洲(尤其 Radboud)把這個方向錨在 cine-MRI 上**。cine-MRI 一旦被證明可行,該團隊下游的 DL 工作都往 cine-MRI 走,沒人回頭做 static CT。亞洲沒有 cine-MRI 文化,但 CT 滿地都是 — 起點不同,方向就不同。**這是地理優勢,不是劣勢。**

3. **西方臨床上覺得「這個 ultrasound 已經解決了」**。在 OB/GYN routine 做 visceral slide US 的醫療體系裡,沒有 unmet need。在 ultrasound 不是 routine 的場域(亞洲多數醫院、emergency / urgent case、ICU consult),需求存在,但有需求的人通常不寫 DL paper。

第三點對 paper 的 framing 很重要。我的 contribution 不是「DL 解決了沒人解決過的問題」,而是 **「DL 把一個已經被建立的解決方案延伸到原本拿不到的場域」**。後者比較好賣,reviewer 也比較不會用「為什麼不用 ultrasound」打你。

---

## Architecture Sketch

不需要花俏的東西:

```
Preprocessed CT volume (3D, soft-tissue window)
        ↓
3D CNN backbone (ResNet-3D / ResNeXt-3D / nnU-Net encoder)
        ↓
Anatomical landmark conditioning  ←  reuse ctpelvimetry-style landmark detection
        ↓
Per-zone ROI feature extraction (4 ROIs)
        ↓
Multi-label classification head (4 sigmoid outputs)
```

Novelty 不在 architecture,而在 **task formulation + label generation pipeline + 跟既有 ctpelvimetry / FREDRIC framework 的 anatomical landmark localization 整合**(這部分可以直接 reuse,不用從零做)。

兩個值得提早決定的設計問題:

- **Whole-volume input vs. zone-cropped input**:Whole-volume 讓 model 看得到 prior surgical history(疤痕、clips),但參數效率差;zone-cropped 強迫 model 學 local 訊號,但失去 global context。Two-stream 架構同時用兩者是一個 plausible 折衷。
- **要不要用 multi-phase CT**:大部分術前 CT 是多期的(arterial / portal venous)。期相之間的 enhancement difference 可能間接帶有 motion-related 資訊。會不會幫到 adhesion prediction 是 empirical question,值得在 ablation 裡跑跑看。

---

## Critical Ablation(這一節是 paper 生死)

這個 paper 在 review 階段一定會被問的問題:

> **DL model 比起「只用 structured clinical feature(年齡、性別、prior surgery type、prior surgery 次數、BMI)的 logistic regression」有沒有顯著贏?**

這就是 selection bias 的擋箭牌。如果一個 binary feature(prior abdominal surgery 有/沒有)+ 一個 categorical feature(surgery type)用 logistic regression 跑出 zone-level adhesion AUROC = 0.80,而我的 DL model 跑出 0.83,那 contribution 就是 marginal,paper 講不出故事。

DL model 必須在這個比較上贏出 **clinically meaningful margin**(AUROC ≥ 0.05,或顯著更好的 calibration),這篇 paper 才值得寫。

**這個 ablation 必須在 protocol 階段就定死,不是做完 model 才補**。先決定終局怎麼判勝負,再開始打仗。

---

## 誠實的 Feasibility 評估

「Model 跑得出來」這件事其實有三個層次,每層的可行性差很多:

| Level | 定義 | 估計成功機率 |
|---|---|---|
| 1 | Internal test set AUROC > 0.7 | ~95% |
| 2 | 每個 zone AUROC ≥ 0.80, sensitivity ≥ 0.85, well-calibrated | ~70% |
| 3 | Prospective 證明改變外科醫師決策且降低 visceral injury | 單一 PhD 階段內 ~25% |

Level 1 幾乎是 prior art 保證的。Level 2 是現實的 publication target,主要受 sample size 跟 label quality 影響。Level 3 是跨機構、跨年的工作,不應該設成單一 paper 的 primary aim。

之所以 Level 2 從原本估計的 60% 上修到 70%,是因為:(a) de Wilde et al. 已經證明 DL 可以從 imaging 學出 adhesion 訊號;(b) ultrasound meta-analysis 已經證明 zone-level entry adhesion 是 well-defined 的臨床 target。剩下 30% 的不確定性集中在:

- Static CT 的訊號強度跟 dynamic modality 比起來差距多大
- 單一機構的 sample size 是否足夠
- 影片打 label 的 noise 能不能控制住

---

## 還沒解決的 Open Questions

1. **Sample size 的下限是多少?** Adhesion prevalence 各 zone 差很大(umbilical 高、Palmer's 低)。Palmer's point 的 class imbalance 會很嚴重。可能要靠 focal loss + heavy oversampling,或乾脆改 formulation(連續 severity regression 而不是 binary)。

2. **Multi-phase CT 幫多少?** 大部分術前 CT 都是多期的。期相 enhancement dynamics 會不會帶來靜態 morphology 之外的資訊,要實驗才知道。

3. **Pretrained foundation model 能不能取代 from-scratch training?** 最近的 CT foundation model(Merlin、CT-CLIP 之類)在 dataset size 受限時可能提供有用的 initialization。

4. **Output uncertainty 的形式?** 外科醫師需要的是 **calibrated probability**,不是 raw score。在 4 個 zone 上做 conformal prediction,給出「definitely safe / probably safe / unclear / probably unsafe」的 decision band,比給單一機率值對臨床更有用。

5. **跨科別 generalize 嗎?** Training cohort 會橫跨一般外、大腸直腸外、婦科、泌尿 — 不同手術、不同病人結構、不同 prior surgery pattern。一個通用 model 還是 specialty-specific model 比較好,未知。

6. **真正該看的 metric 是什麼?** AUROC 是學術預設,但不是臨床上對的 metric。臨床真正在乎的是:**給定 model 推薦,外科醫師有多少機率避免一個原本會發生的 injury**。這個基本上沒辦法 retrospective 評估,需要 prospective design。

---

## Commit 之前該做的事

三個具體的 go/no-go 檢查,依順序執行:

1. **Human-expert pilot(一個下午搞定)**。挑 5–10 個我自己開過、有完整影片 + 術前 CT 的 case。**先不看影片**,單看 CT 把 4 個 zone 各自評為「likely safe / unclear / likely unsafe」,然後再對影片驗證。如果我自己都無法達到 60% 以上的 agreement,CNN 大概也學不出來。如果我能到 70–80%,CNN 有空間推到 80–90%。**這一步沒跑之前不要寫 protocol、不要打 IRB、不要規劃資源。**

2. **影片庫可得性(一週行政查證)**。確認過去 3 年微創手術裡,有多少 % case 能調到完整、涵蓋 4 個 entry zone 的術中影片。如果 < 50%,project 不可行,要嘛改 prospective collection 要嘛換題目。

3. **Inter-rater pilot(~30 個 case)**。我跟 Yu-Hsun 各自 score 30 個影片,算 Cohen's kappa。< 0.7 表示 label 太雜,scoring rubric 要重寫或簡化才能繼續。

三個都過,project 值得 commit 重資源。任何一個沒過,失敗本身會給設計上的 information — 不一定要砍掉,但要改。

---

## 總結

臨床上有價值的 framing 不是「用 CT 預測沾黏」,而是 **「用 CT 預測 zone-level 進入安全性」**。這個 reframe 把一個模糊、有爭議的量化問題,轉成結構化、可行動、ground truth 可從影片取得的 multi-label classification 問題。

這個工作的真正 opening,在於三個條件的交集 — 沒有現有 paper 同時滿足:

- **Static CT 當 input**(universal、routine 可得,不像 cine-MRI 跟 visceral slide US)
- **Zone-level output**(可直接用於 entry-site selection,不像「全腹有沒有沾黏」)
- **影片導出的 ground truth**(比 op note text mining 可靠)

Static CT 的訊號夠不夠強到能支撐 clinically useful zone-level prediction,這件事 **真的還未知**。最接近的證據(de Wilde 的 cine-MRI 工作)說 plausible 但不保證。上面那三個 pilot check 設計就是要在大投入之前先把這個答案撈出來。

這個 framing 還打開一個方法學上的問題,超出單一 application:**dynamic-imaging 的訊號能不能用 learned geometric feature 從 static imaging 近似出來?** 如果可以,這個原理可能延伸到其他 dynamic-imaging task(cardiac function、organ motion、peristalsis),paper 會從 surgical AI application 升級成 methodology contribution。

---

*這是 working note,不是定稿 proposal。Label vocabulary、architecture、甚至核心 framing,都會隨 pilot 結果變動。*
