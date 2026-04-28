# Anatomy-Aware Surgical Phase Recognition

> **Status**: Research note / brainstorm
> **Last updated**: 2026-04 (revised to incorporate action triplet prior art)
> **Tags**: surgical phase recognition, multi-task learning, action triplets, explainable AI, long-duration video

A note on a research direction that emerged from reading LoViT (Liu et al., *Medical Image Analysis* 2025) and thinking about how phase recognition methods would (and would not) generalize to long-duration robotic procedures.

---

## Why current phase recognition methods feel mismatched to long procedures

Most published surgical phase recognition pipelines look like:

```
Frame stream → Spatial backbone (ViT / CNN) → Temporal aggregator → Phase prediction
```

The temporal aggregator is the part that has been intensely engineered in the last few years — LoViT's L-Trans + G-Informer, MuST's multi-scale Transformer, DACAT's dual-stream design, SR-Mamba's state-space model. Each of these is fundamentally trying to solve the same problem: **how do you make a Transformer-style model attend across thousands of frames without running out of GPU memory?**

This becomes an order of magnitude harder for long procedures:

| Procedure | Avg duration | Frames @ 1fps | Methods evaluated? |
|---|---|---|---|
| Lap. cholecystectomy (Cholec80) | ~38 min | ~2,300 | Most published methods |
| Hysterectomy (AutoLaparo) | ~66 min | ~4,000 | LoViT, MuST, DACAT |
| Lap. sigmoidectomy | ~175 min | ~10,500 | Frame-only CNN (Kitaguchi 2020) |
| **Robotic TME** | **~300 min** | **~18,000** | **Largely unexplored** |

The gap between "what existing temporal models can fit in GPU memory" and "what a long procedure actually requires" is uncomfortable. Two existing strategies handle it:

1. **Frame-only CNN** (Kitaguchi 2020 line): drop the temporal model entirely. Scales to any duration, but loses temporal context and accuracy plateaus around 85%.
2. **Sophisticated temporal models** (LoViT etc.): keep the temporal model, restrict to short procedures. Accuracy reaches 92-95% on Cholec80 but doesn't scale.

There's a missing third path.

---

## The intuition: phases are defined by what's happening, not how it looks

The standard "spatial features + temporal model" framing treats phase recognition as a generic video classification task. But surgical phase boundaries are **defined by surgical activity** — what instrument is doing what to which anatomy — not by visual texture statistics:

- A surgeon doesn't think "I'm in phase 4 because the pixel distribution looks 92% similar to phase 4 training data."
- A surgeon thinks "I just exposed the holy plane, energy device is dissecting posteriorly along the mesorectal fascia, helper is retracting the rectum anteriorly — this is phase 4."

That perceptual logic decomposes naturally into three components:

```
Anatomy (where):    holy plane / mesorectal fascia visible
Instrument (what):  monopolar / energy device active near the plane
Action (how):       dissecting (not retracting, not coagulating)
```

Each component on its own is ambiguous — the same anatomy appears in multiple phases, the same instrument is used across many phases — but the **co-occurrence** is highly phase-specific. Two adjacent phases that share anatomy (e.g., posterior vs. anterior mesorectal dissection) become separable once instrument position relative to that anatomy is taken into account.

This decomposition is not a new observation. It's the framing behind the **surgical action triplet** literature.

---

## Prior art: what's already been done

This space has a lot of existing work that any new proposal needs to position against carefully.

### Multi-task learning with auxiliary tool/anatomy supervision

The earliest line, going back ~10 years:

- **EndoNet** (Twinanda et al., *IEEE TMI* 2017) — joint phase + tool presence (binary multi-label), single CNN, no temporal model. The original multi-task baseline.
- **TeCNO / OperA** (Czempiel et al., *MICCAI* 2020-2021) — phase + tool presence + temporal convolution / attention.
- **Mondal et al.** (arXiv:1905.08315, 2018) — adds an explicit joint-distribution loss capturing tool–phase co-occurrence.
- **Fuentes-Hurtado et al.** ("Data-centric multi-task surgical phase estimation with sparse scene segmentation," 2022) — extends auxiliary supervision from tool presence to **scene segmentation including both instruments and anatomy**. Closest predecessor to anything one would want to propose along these lines.

The conclusion from this line of work is that auxiliary tool/anatomy supervision **helps** phase recognition modestly but is not transformative on Cholec80. The framing has been thoroughly explored.

### Surgical action triplets (CAMMA group line)

A more structured approach, treating each frame's activity as ⟨**instrument**, **verb**, **target**⟩:

- **Nwoye et al.** (*MICCAI* 2020) — first to formalize action triplet recognition.
- **Rendezvous** (Nwoye et al., *Medical Image Analysis* 2022) — Transformer with self- and cross-attention over instrument / verb / target heads. Released the **CholecT50** dataset (50 cholecystectomy videos with 100 triplet classes drawn from 6 instruments × 10 verbs × 15 targets).
- **CholecTriplet 2021 / 2022 / 2024** — recurring MICCAI challenges benchmarking triplet recognition. CholecTriplet 2022 added instrument tip bounding boxes.
- **CurConMix+** (arXiv:2601.12312, 2026) — current state-of-the-art on CholecT45 frame-level triplet recognition.

Action triplets are the closest existing formalization of "instrument acting on anatomy" that this note's direction would build on. The CAMMA team has essentially owned this sub-field for 5+ years.

### Geometric / spatial relationship between instrument and anatomy

A newer angle:

- **Geo-RepNet** (arXiv:2507.09294, 2025) — uses depth estimation to derive spatial relationships between tools and tissue, evaluated on ESD (endoscopic submucosal dissection). Demonstrates that *where* an instrument is relative to anatomy carries phase information beyond mere co-occurrence.

This is the most recent and most relevant prior work, but it's narrowly scoped to ESD and uses depth as the geometric signal.

### Holistic multi-level surgical understanding

- **PSI-AVA benchmark** (arXiv:2212.04582, 2022) — joint phase + step + instrument + atomic visual action recognition, on robot-assisted radical prostatectomy. Demonstrates the "holistic understanding" framing.

---

## Where the actual gap is

Reading the prior art, the genuinely under-explored areas are not the multi-task framing itself (well-trodden) or triplet recognition itself (a thriving sub-field with annual challenges) — they are:

1. **Triplet vocabulary for procedures other than cholecystectomy.** CholecT50's instruments and targets are cholecystectomy-specific. Robotic TME has different instruments (robotic monopolar, robotic vessel sealer, robotic stapler), different targets (mesorectal fascia, hypogastric nerve, levator ani, seminal vesicle, prostate), and different verbs (medial-to-lateral mobilization, TME plane dissection, anastomosis fashioning).

2. **Triplet recognition under long-procedure constraints.** All published triplet methods are validated on Cholec80-length videos. The interaction between long-range temporal context and triplet recognition is unexplored.

3. **Triplet predictions as structured intermediate representation for phase recognition.** Most existing work either predicts triplets *as the end task* (CAMMA line) or predicts phases with anatomy/tool as auxiliary signal (EndoNet line). Treating triplet predictions as an explicit, interpretable intermediate that feeds a downstream phase classifier — and exploiting this for offline phase smoothing on long videos — is a less-explored framing.

4. **Spatial relationships using non-depth signals.** Geo-RepNet uses depth estimation, which is fragile. Using bounding-box overlap, instrument trajectory relative to anatomy regions, or learned spatial embeddings is an alternative geometric channel.

5. **Cross-procedure triplet transfer.** Whether a triplet model trained on cholecystectomy provides useful initialization for TME triplet recognition is unknown but relevant.

---

## A direction worth thinking through

If a project were going to build along this line, the structure that seems most defensible is:

### Stage 1: TME-specific triplet vocabulary

Define ⟨instrument, verb, target⟩ classes adapted to robotic TME. Rough scale:

- Instruments (~8): robotic monopolar shears, robotic bipolar forceps, robotic vessel sealer, robotic stapler, robotic suction-irrigator, robotic needle holder, large clip applier, retraction grasper
- Verbs (~10): retract, dissect, coagulate, cut, ligate, clip, staple, suction, irrigate, suture
- Targets (~15): IMA pedicle, IMV, left ureter, hypogastric nerve, mesorectal fascia (anterior/posterior), Denonvilliers' fascia, seminal vesicle, prostate, levator ani, rectum, anastomosis ring, retracted small bowel, omentum, pelvic sidewall

Cross-product is ~1200 combinations but only ~50-80 are clinically valid (most don't make sense — you don't suction the IMA pedicle, you don't staple the ureter). Following the Nwoye approach, only the valid combinations are kept as triplet classes.

Annotation strategy: borrow CholecT50's frame-level binary multi-label format. Annotate ~500-1000 frames per case across ~30-50 cases initially. Pure single-annotator effort is roughly 200-400 hours.

### Stage 2: Triplet detector

Standard backbone (SurgeNetXL or DINOv2 frozen) + three heads:

```
Backbone → spatial feature
        ├─ Instrument head: multi-label sigmoid + (optional) bbox
        ├─ Verb head:       multi-label sigmoid
        └─ Target head:     multi-label sigmoid + (optional) bbox

Triplet association: cross-attention or matching head, following Rendezvous
```

Pretraining on CholecT50 followed by TME fine-tuning is worth comparing against TME-only training to assess transfer.

### Stage 3: Triplet-guided phase recognition

Instead of running a heavy temporal model on raw spatial features, run a light model on the **predicted triplet sequence**:

```
Per-frame triplet predictions: [t_1, t_2, ..., t_T]
where each t_i is a sparse vector over triplet classes

→ Bidirectional GRU (offline) or HMM smoothing
→ Phase prediction
```

The information bottleneck is intentional: instead of forcing the temporal model to attend over 768-d visual features across 18,000 frames, it operates on a much sparser, more interpretable representation. GPU memory and compute concerns largely evaporate.

### What this trades off

- **Probably worse on Cholec80**: short procedures don't benefit enough from triplet structure to outweigh the loss of direct visual signal. The story has to live in the long-procedure regime.
- **Annotation cost**: triplet annotation is more demanding than phase-only annotation. The hope is that triplet labels are reusable across multiple downstream tasks (phase recognition, skill assessment, automated reporting), amortizing the cost.
- **Compounding errors**: triplet detector errors propagate to phase prediction. End-to-end training can mitigate but reintroduces some of the GPU memory issue.

---

## Open questions

1. **Is triplet vocabulary the right abstraction for TME, or is something coarser/finer better?** Maybe ⟨instrument, anatomical region⟩ pairs without a verb dimension is sufficient. Maybe a 4-tuple including hand-laterality is needed.
2. **Does cross-procedure triplet transfer actually work?** A model pretrained on CholecT50 might or might not provide useful initialization.
3. **How does triplet-guided phase recognition compare to direct phase recognition with triplet auxiliary loss?** Two architecturally different ways to use the same information.
4. **What's the right granularity for spatial relationships?** Bounding-box overlap, instrument-tip-to-target distance, or learned spatial embeddings — each has different annotation requirements.
5. **Does this hold up cross-center?** Anatomy and instruments are more consistent across centers than visual texture, but operative style varies substantially between surgeons.

---

## Summary

Multi-task learning with anatomy/instrument auxiliary supervision is not novel — it goes back to EndoNet (2017) and has been studied extensively. Action triplet recognition is a thriving sub-field with its own benchmarks (CholecT50, CholecTriplet challenges) and current SOTA work (CurConMix+ 2026).

The genuinely open territory is the intersection of three constraints that no existing work simultaneously addresses:

- **Long procedures** (5+ hours, where current temporal models break)
- **Procedure-specific triplet vocabulary** (TME-specific anatomy and instruments)
- **Triplet predictions as structured input to phase recognition** (rather than triplet recognition as the end task)

Whether that intersection is large enough to support a substantive research contribution depends on details that experiments would have to surface. But the framing connects naturally to existing literature, builds on rather than ignores prior art, and aligns with the clinical reasoning surgeons actually use.

---

*This is a working note, not a finished proposal. Architecture choices, baseline comparisons, dataset specifics, and even the core framing will likely shift as the experiments unfold.*
