# Anatomy-Aware Surgical Phase Recognition

> **Status**: Research note / brainstorm
> **Last updated**: 2026-04
> **Tags**: surgical phase recognition, multi-task learning, explainable AI, long-duration video

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

## The intuition: anatomy *is* the phase definition

The whole framing of "spatial features + temporal model" treats phase recognition as a generic video classification task. But in reality, surgical phase boundaries are **defined by anatomy**, not by visual texture statistics:

- A surgeon doesn't think "I'm in phase 4 because the pixel distribution looks 92% similar to phase 4 training data."
- A surgeon thinks "I just exposed the holy plane, so I'm now doing mesorectal dissection."

If the model also operated on anatomical structures rather than raw visual features, several things would simultaneously improve:

1. **Explainability** — predictions can be grounded in detected structures, not opaque attention scores
2. **Cross-procedure transferability** — IMA looks like IMA whether you're doing colectomy or TME
3. **Annotation efficiency** — anatomy detection needs ~500 well-chosen frames vs. tens of thousands of frame-level phase labels
4. **Reduced reliance on heavy temporal modeling** — anatomy presence is a much stronger per-frame signal than raw RGB

---

## A naive version (and why it fails)

```
Frame → Object detector → "IMA detected" → Rule: "if IMA detected, transition to phase 2"
```

This is the obvious first idea, but it has four breakdowns:

1. **Object appearance ≠ phase transition.** IMA might flash by 10 minutes before the surgeon actually starts working on it.
2. **Detection noise.** A single false positive can mistrigger a phase transition that propagates errors through the rest of the video.
3. **Phases aren't 1:1 with anatomy.** Two adjacent phases might both involve the same structure (anterior vs. posterior dissection on the mesorectal plane).
4. **Missed detections cascade.** Unlike traditional phase recognition where one bad frame is forgivable, missing a key transition event ruins everything downstream.

So pure rule-based event-driven recognition is too brittle. But the underlying intuition — that anatomy should be central — is sound.

---

## A better version: anatomy as auxiliary supervision

Instead of "detect anatomy → rule → phase," do:

```
                ┌─→ Anatomy detection head: {IMA, ureter, hypogastric_n, ...}
Frame → Backbone│
                └─→ Phase classification head: {phase 1, ..., phase 9}

Loss = phase_CE + λ × anatomy_BCE
```

Both heads share the spatial backbone. The anatomy head is a multi-label binary classifier (or detector) with bounding boxes over key structures. The phase head is the standard frame-wise classifier you'd have anyway.

The auxiliary anatomy loss does several things:
- Forces the backbone to learn anatomy-relevant features rather than overfitting to procedure-specific visual texture
- Provides a regularizing signal that's much denser than phase labels (anatomy presence/absence on every frame, vs. phase labels that are constant across long stretches)
- Gives an interpretable channel: at inference, you can show *which anatomical structures the model detected* alongside the phase prediction

This is **not novel as a general technique** — multi-task learning with auxiliary tool/instrument detection has been done since EndoNet (Twinanda et al., 2017) and is implicit in Trans-SVNet's tool prediction head. What's underexplored is:

- Doing it with **anatomical structures** rather than instruments (most prior work uses instruments because they're easier to label)
- Doing it on **long procedures** where the temporal model alone is insufficient
- Doing it specifically for **TME** where the anatomical landmarks (mesorectal plane, hypogastric nerve, seminal vesicle, levator ani) are well-defined and clinically meaningful

---

## What this would look like in practice

### Stage 1: Anatomy detector

Train a YOLO-family or DETR-family detector on a curated set of frames with bounding boxes for ~10 key TME structures:

- IMA (inferior mesenteric artery) and its pedicle
- IMV (inferior mesenteric vein)
- Left ureter
- Hypogastric nerve
- Mesorectal fascia (anterior/posterior)
- Denonvilliers' fascia / rectovaginal septum
- Seminal vesicle / posterior vaginal wall
- Levator ani plane
- Hartmann's pouch (during specimen retrieval)
- Anastomosis ring (during reconstruction)

Annotation cost is the bottleneck but tractable: ~500-1000 frames sampled across phases, annotated by a colorectal surgeon. SAM2 can accelerate the bbox-to-mask step if needed.

### Stage 2: Anatomy-aware phase model

Two designs are worth comparing:

**A. Single backbone, two heads (multi-task)**
```
Backbone (frozen SurgeNetXL) → 768-d feature
                                  ├─ Anatomy head (multi-label sigmoid)
                                  └─ Phase head (softmax over 9 phases)
```

**B. Cascaded (anatomy detection feeds phase model)**
```
Backbone → spatial feature
        → anatomy detector → {set of detected structures, confidence scores}
                                                ↓
                              concatenate with spatial feature
                                                ↓
                                  bidirectional GRU (offline)
                                                ↓
                                          phase prediction
```

Design B is cleaner conceptually (anatomy is a real intermediate representation) but cascades errors. Design A optimizes both jointly but requires careful loss balancing. Worth ablating both.

### Stage 3: Offline temporal smoothing

Either design produces per-frame phase scores. A lightweight bidirectional GRU (or even a simple HMM) over the score sequence smooths phase boundaries. Because we're operating offline, we can use future-frame context — which on long procedures is substantially more informative than on Cholec80.

---

## What this changes about the long-video problem

Reframing phase recognition as "anatomy detection + light temporal smoothing" sidesteps most of the GPU-memory hell that motivates LoViT's two-stage design:

| Problem | Heavy-temporal approach | Anatomy-aware approach |
|---|---|---|
| Spatial backbone at scale | ViT clip-pretraining workaround | Use frozen SurgeNetXL, no special pretraining |
| Long-sequence attention | ProbSparse / Mamba / chunking tricks | Light GRU on per-frame scores; no attention bottleneck |
| GPU memory peak | 30-50 GB on long video | 8-12 GB |
| Explainability | Attention maps (limited) | Detected anatomy bounding boxes (direct) |
| Cross-center transfer | Risky (texture-specific features) | More robust (anatomy is anatomy) |

The trade-off: this approach won't beat LoViT/DACAT on Cholec80 — short procedures don't need anatomy context to do well, and pure visual features are sufficient. The advantage shows up specifically on long, anatomically structured procedures.

---

## Open questions

Things I haven't worked out and would want to investigate:

1. **What's the right anatomy granularity?** 5 structures? 20? Too few and the auxiliary signal is weak; too many and annotation becomes intractable.
2. **How does anatomy detection accuracy degrade across operators?** A 65-year-old surgeon's IMA exposure technique looks different from a 35-year-old's. Does this break detection generalization?
3. **Is bbox enough, or do we need segmentation?** Segmentation is more informative but 10× more annotation cost.
4. **How does this interact with cross-center generalization?** Anatomy looks more consistent across centers than procedure-specific visual texture, but lighting/camera/equipment differences still exist.
5. **Does the auxiliary loss actually help on Cholec80 too?** If yes, it's a general method; if no, it's a long-procedure-specific method. Both framings are publishable but they're different stories.

---

## Related work to position against

- **Twinanda et al., EndoNet** (IEEE TMI 2017) — earliest multi-task spatial recognition for surgical phase, used tool presence as auxiliary task
- **Czempiel et al., TeCNO / Opera** — multi-task phase + tool recognition with TCN
- **LoViT** (Liu et al., MedIA 2025) — heavy temporal modeling, no anatomy supervision
- **Kitaguchi et al.** (Surg Endosc 2020, 2022) — frame-only CNN for sigmoidectomy and TaTME, no temporal model
- **MS-AST / SurgPLAN++** — explicit online vs offline framing for phase recognition
- **MuST** (BCV-Uniandes, MICCAI 2024) — multi-scale Transformers, PhaKIR 2024 winner
- **SurgVISTA / SurgMotion** — video-native surgical foundation models, the next-generation paradigm

The anatomy-aware angle sits between "tool-presence multi-task learning" (which is well-established) and "instrument segmentation as primary task" (which is a different research line). The specific combination of *anatomical-structure* auxiliary supervision + *long-procedure* setting + *offline* inference is the gap.

---

## Why this is worth pursuing

Three reasons this idea feels like it has more substance than the typical "let me apply method X to procedure Y" angle:

1. **It's grounded in surgical reasoning.** Surgeons explicitly track anatomy; building a model around what experts actually pay attention to is more principled than chasing benchmark accuracy on visual feature distributions.

2. **It threads multiple research arcs together.** Anatomy detection feeds plane segmentation feeds anatomy-driven navigation — all three become part of one story rather than disconnected projects.

3. **It survives the long-procedure constraint without heroic engineering.** The whole framing makes the GPU-memory problem secondary rather than central.

The honest risk is that on standard short-procedure benchmarks (Cholec80, AutoLaparo) this approach won't outperform existing temporal-heavy methods, and the contribution rests entirely on the long-procedure setting. That's a narrow story, but it's a real one — and one that nobody else is currently telling.

---

*This is a working note, not a finished proposal. Architecture choices, baseline comparisons, and dataset specifics will likely shift as the experiments unfold.*
