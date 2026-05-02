# Preoperative CT for Safe First-Trocar Entry: Regional Adhesion Prediction

> **Status**: Research note / brainstorm
> **Last updated**: 2026-05
> **Tags**: surgical AI, adhesion prediction, trocar safety, preoperative CT, multi-label classification, visceral slide, minimally invasive surgery

A note on a research direction motivated by a clinical pain point that surfaced during a conversation about whether AI could "predict adhesions from CT." The interesting reframe came halfway through: the actionable question is not *"how much adhesion is there"* but *"is the spot where I'm about to put the first trocar safe to enter blind."*

---

## Why "predict adhesions from CT" is the wrong framing

The natural first instinct is to set up the problem as: preoperative CT → predicted PAI (Peritoneal Adhesion Index) score → some downstream clinical use. This framing has several problems:

1. **PAI total score is not actionable**. A patient with PAI = 15 concentrated in the RUQ and a patient with PAI = 15 concentrated in the pelvis have completely different surgical implications. Surgeons care about *distribution*, not *total*.
2. **"Adhesions yes/no" is uninformative**. Almost every patient with prior abdominal surgery has *some* adhesion. The clinically interesting signal is severity and location, not presence.
3. **Selection bias inflates apparent performance**. A model trained on patients with preoperative CT is enriched for prior-surgery patients, where adhesion prevalence is high. A model can achieve high AUC by essentially re-deriving "did this patient have prior surgery" — which a single binary feature already captures.

The reframe that addresses all three: **predict adhesion probability at specific candidate first-trocar entry sites, as a multi-label classification task.**

---

## The clinical motivation

First-trocar placement is the most dangerous moment of any minimally invasive abdominal procedure. Visceral injury during entry has a reported incidence of roughly 0.04–0.5%, with mortality around 13% when injury occurs. This number has not meaningfully improved in 30 years despite the introduction of Veress needle, Hasson technique, optical trocars, and various sensor-based approaches — because the underlying problem is informational, not mechanical: **the surgeon does not know what is on the other side of the abdominal wall at the entry site.**

Existing solutions partially address this:

- **Preoperative ultrasound visceral slide assessment** has high negative predictive value (~99%) for periumbilical bowel adhesion and is the closest thing to a current gold standard for noninvasive entry-site assessment. However, it is operator-dependent, requires extra OR time, is not routine in most Asian centers, and assesses one region at a time.
- **Cine-MRI visceral slide** is more quantitative but is not a routine preoperative imaging modality and is not reimbursed in most settings.
- **Intraoperative video-based abdominal-wall layer detection** (YOLOv8-based alarm systems published in 2023) helps *during* entry but cannot inform the *choice* of entry site.

Static preoperative CT, in contrast, is already obtained for nearly every patient undergoing elective abdominal surgery. The question is whether useful entry-site safety information can be extracted from it.

---

## The proposed task

Predict, for each of N standard first-trocar candidate entry sites, the probability of bowel-to-abdominal-wall adhesion at that site.

A reasonable initial vocabulary (N = 4):

| Site | Anatomical landmark | Common use | Typical adhesion prevalence |
|---|---|---|---|
| Umbilicus | Most common entry point | Default for most procedures | High in patients with prior midline laparotomy |
| Palmer's point | LUQ, subcostal mid-clavicular line | Recommended when umbilical entry is suspect | Low (~5%) — the reason it works as a backup |
| RUQ mirror point | RUQ analogue | Alternative when LUQ contraindicated | Low |
| Suprapubic | Lower midline | Some pelvic procedures | Variable; high after pelvic surgery |

The output is a 4-dimensional probability vector. The clinical decision rule is straightforward: prefer the site with the lowest predicted adhesion probability that is anatomically suitable for the planned procedure.

This framing has several properties that make it tractable as a DL task:

- **Output is small and structured** — 4 binary labels, not a 30-point ordinal score.
- **Each label is independently decidable from the imaging** — no global reasoning required.
- **Ground truth is observable from intraoperative video** — when the laparoscope first enters the abdomen, all four zones are typically visualized within minutes.
- **Inter-rater agreement should be high** — "is bowel adhered to the abdominal wall in this quadrant" is a more reliable judgment than full PAI scoring.

---

## Prior art landscape

The interesting thing about this problem is that the surrounding literature is dense but the specific cell I'm describing is empty. A 2×4 matrix illustrates this:

|  | Static CT | Cine-MRI | Ultrasound | Intraop video |
|---|---|---|---|---|
| Adhesion presence (whole abdomen) | — | de Wilde et al. 2021 (ConvGRU+ResNet, AUROC 0.83) | Limperg et al. 2020 meta-analysis | — |
| **Adhesion at specific entry zones** | **(empty — proposed work)** | — | Limperg et al. 2020 (periumbilical sens 96%, NPV 99%) | — |
| Abdominal-wall layer detection during entry | — | — | — | YOLOv8 alarm system, 2023 |
| Surgical complexity / outcome prediction | AWR (Elhage et al. 2021, AUROC 0.74); peritoneal metastasis PCI; SBO transition zone | — | — | — |

A few observations from this landscape:

1. **The DL feasibility question is largely settled.** de Wilde et al. (2021) showed that deep learning can extract adhesion-relevant signal from medical imaging, even when the signal is subtle and indirect. Their AUROC of 0.83 on cine-MRI sets a useful upper bound (cine-MRI has *more* signal than static CT because it captures visceral slide directly).

2. **The clinical relevance question is largely settled.** The ultrasound visceral slide literature — culminating in the 2020 systematic review with 1609 patients — established that entry-site adhesion assessment is a well-defined, actionable clinical question. The body of evidence reviewers would demand for "is this clinically useful" already exists.

3. **The unaddressed question is modality-specific:** can the visceral slide signal that ultrasound and cine-MRI capture *dynamically* be approximated *statically* from CT?

This is actually an interesting methodological question, not just an application paper. Static CT cannot directly observe visceral motion, but can plausibly capture indirect geometric signatures: surgical clips and mesh marking prior incisions, fat plane preservation between bowel and abdominal wall, abnormal angulation of bowel loops along old scars, abnormal proximity of bowel to the parietal peritoneum.

---

## Why this cell of the matrix is empty (hypothesis)

Three plausible reasons no one has done this:

1. **The intersection of required skills is narrow.** Doing this well requires (a) clinical familiarity with first-trocar entry decisions, (b) access to a video archive linked to preoperative CT, (c) DL/CV competence to build the model, (d) the willingness to retrospectively score thousands of videos. The number of people sitting at this intersection is small.

2. **European centers (notably Radboud) anchored the field on cine-MRI.** Once cine-MRI was shown to work, the DL community downstream of that group worked on cine-MRI rather than going back to static CT. Asian centers lack the cine-MRI infrastructure but have abundant CT — a different starting point yields a different research direction.

3. **The problem is perceived as "solved by ultrasound."** In settings where preoperative visceral slide US is routine, there is no perceived gap. In settings where it isn't (most Asian institutions, emergency/urgent cases, ICU consults), the gap exists but the people experiencing it don't typically build DL models.

The third point matters for how the paper should be framed. The contribution is not "DL solves a problem nobody has solved" but rather "DL extends an established solution to a setting where the established solution is not available."

---

## Architecture sketch

Nothing exotic is required:

```
Preprocessed CT volume (3D, soft-tissue window)
        ↓
3D CNN backbone (ResNet-3D / ResNeXt-3D / nnU-Net encoder)
        ↓
Anatomical landmark conditioning  ←  reuses ctpelvimetry-style landmark detection
        ↓
Per-zone ROI feature extraction (4 ROIs corresponding to entry sites)
        ↓
Multi-label classification head (4 sigmoid outputs)
```

The novelty is not in the architecture; it's in the task formulation, the label generation pipeline, and the integration of anatomical landmark localization (which is reusable from the existing ctpelvimetry / FREDRIC framework).

Two design questions worth flagging:

- **Whole-volume vs. zone-cropped input**: Whole-volume gives the model context to reason about prior surgical history; zone-cropped is more parameter-efficient and forces the model to learn local signal. A two-stream architecture using both is plausible.
- **Temporal information from multi-phase CT**: Most preoperative CTs include arterial and portal venous phases. The differential between phases captures organ enhancement and indirectly some motion-related information. Whether this helps for adhesion prediction is unclear and worth ablating.

---

## The critical ablation

Any paper on this topic will be killed in review if it cannot answer this question:

> **Does the DL model meaningfully outperform a simple logistic regression using only structured clinical features (age, sex, prior surgery type, prior surgery count, BMI)?**

This is the "history-only baseline" that captures the selection-bias concern. If a binary feature for "prior abdominal surgery" + a categorical feature for surgery type can predict zone-level adhesion at AUROC 0.80, and the DL model achieves 0.83, the contribution is marginal at best.

The DL model needs to win this comparison by a clinically meaningful margin (≥ 0.05 AUROC, or substantially better calibration) for the paper to be worth writing. This ablation should be specified in the protocol *before* any model training, not after results are in hand.

---

## Honest feasibility assessment

Three levels of "the model works":

| Level | Definition | Estimated success probability |
|---|---|---|
| 1 | AUROC > 0.7 on internal test set | ~95% |
| 2 | AUROC ≥ 0.80 per zone, sensitivity ≥ 0.85, well-calibrated | ~70% |
| 3 | Prospectively shown to change surgeon decisions and reduce visceral injury | ~25% within a single PhD timeframe |

Level 1 is essentially guaranteed by the existing prior art. Level 2 is the realistic publication target and depends primarily on sample size and label quality. Level 3 is a multi-institution, multi-year effort and should not be the primary aim of a single paper.

The estimate moves up from ~60% to ~70% on Level 2 specifically because (a) de Wilde et al. demonstrated that DL can learn adhesion signal from imaging, and (b) the ultrasound meta-analysis demonstrated that zone-level entry adhesion is a well-defined clinical target. The remaining 30% uncertainty is concentrated in:

- Whether the static-CT signal is strong enough relative to dynamic modalities
- Whether sample size at a single institution is sufficient
- Whether label noise from video-based scoring is controllable

---

## Open questions

1. **What is the sample-size floor?** Adhesion prevalence varies by zone (umbilical: high; Palmer's: low). The Palmer's point class will be severely imbalanced. Either focal loss + heavy oversampling, or a different formulation (regression on continuous severity rather than binary classification) may be required.

2. **How much does multi-phase CT help?** Most preoperative CTs are multi-phase. Whether enhancement dynamics carry information beyond static morphology is an empirical question.

3. **Can a pretrained foundation model substitute for from-scratch training?** Recent CT foundation models (Merlin, CT-CLIP, etc.) might provide useful initialization given the modest dataset sizes likely available.

4. **What is the right form of output uncertainty?** Surgeons need calibrated probabilities, not raw scores. Conformal prediction over the 4 zones (giving a "definitely safe / probably safe / unclear / probably unsafe" decision band per zone) is more clinically useful than a single probability.

5. **Does the model generalize across surgical specialties?** The training cohort spans general surgery, colorectal, gynecology, urology — different procedures, different patient populations, different prior-surgery patterns. Whether a single model generalizes or specialty-specific models are needed is unknown.

6. **What is the evaluation metric that matters?** AUROC is the academic default but is not the right clinical metric. The clinically relevant question is: *given the model's recommendation, how often does the surgeon avoid an injury they would otherwise have caused?* This is essentially impossible to evaluate retrospectively and requires prospective design.

---

## What needs to happen before committing

Three concrete go/no-go checks, in order:

1. **Human-expert pilot (1 afternoon)**. Take 5–10 cases where the surgeon has both the preoperative CT and the intraoperative video. Without watching the video first, score each of the 4 zones as "likely safe / unclear / likely unsafe" based on CT alone. Then watch the video and check. If a domain expert cannot achieve >60% agreement with the video ground truth, a CNN almost certainly cannot. If the expert achieves 70–80%, a CNN has room to push to 80–90%.

2. **Video archive feasibility (1 week of administrative work)**. Determine what fraction of MIS cases over the past 3 years have retrievable, complete intraoperative video covering all 4 entry zones. If this fraction is <50%, the project is not feasible without prospective video collection.

3. **Inter-rater pilot (~30 cases)**. Score zone-level adhesion on 30 video cases with a second reviewer. Cohen's kappa < 0.7 means the labels are too noisy and the scoring rubric needs to be tightened or simplified before proceeding.

If all three checks pass, the project is worth committing serious effort to. If any one fails, the failure mode is informative — the project is not necessarily dead, but the design needs to change.

---

## Summary

The clinically valuable framing is not "predict adhesions from CT" but "predict zone-level entry safety from CT." The reframe converts a fuzzy, contested quantification problem into a structured, actionable, multi-label classification problem with reliable ground truth from intraoperative video.

The unique opening for this work is the intersection of three conditions that no existing paper simultaneously addresses:

- **Static CT as input** (universal, routinely available, unlike cine-MRI or visceral slide US)
- **Zone-level output** (actionable for entry-site selection, unlike whole-abdomen adhesion presence)
- **Video-derived ground truth** (more reliable than operative-note text mining)

Whether the static CT signal is strong enough to support clinically useful zone-level prediction is genuinely unknown. The closest evidence — de Wilde et al.'s cine-MRI work — suggests it is plausible but not certain. The pilot checks above are designed to surface this answer cheaply before any large-scale effort.

The framing also opens a methodological question that goes beyond the application: **can dynamic-imaging-derived signals be approximated from static imaging through learned geometric features?** If yes, the same principle might extend to other dynamic-imaging tasks (cardiac function, organ motion, peristalsis), making the work a methodological contribution rather than just a surgical AI application.

---

*This is a working note, not a finished proposal. The label vocabulary, architecture, and even the core framing will likely shift as pilot data come in.*
