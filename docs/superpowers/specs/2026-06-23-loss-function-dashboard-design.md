# Loss Function Dashboard — Design Spec

_Date: 2026-06-23 · Status: approved, ready for implementation_

## One-liner

An interactive, bilingual (한국어 / English) static web app that teaches **loss
functions across ML tasks**, with a focus on what is actually used in **medical
imaging**. Mirrors the explanatory structure of `snubilab/metric-dashboard` (sidebar
of topics, per-topic Learn + Playground views, light/dark, KaTeX, design tokens, no
backend) — but for the functions you *optimize during training*, not evaluation
metrics.

## Why / target user

A medical-imaging AI researcher (and students) learning *which loss to use for which
failure mode, and why*. The lesson is intuition: every loss shapes a different
gradient, so the choice changes what the model learns. Korean-first prose, English
proper nouns kept (Dice, Focal, …), plus a full English locale.

## Core structure (mirrors reference)

- **Left sidebar**: 8 tasks.
- Each task = two tabs: **Learn** (explanations) and **Playground** (interactive).
- **Light/Dark** toggle + **한/영** language toggle, both persisted to `localStorage`.
- Design-system tokens (CSS custom properties); components never hard-code colors.
- Okabe–Ito colorblind-safe palette for plotted series. WCAG-AA text contrast.
- Fully static (Vite build → `dist/`), no backend, no tracking.

## Explanation model (한 줄 요약 + 펼치기 상세)

Each loss is one **LossCard**:
- Always visible: **name** (English proper noun) + **one-line intuition** (short, clear).
- "자세히 보기 / Show details" expands to: KaTeX **formula** → **gradient** → intuition
  prose → **언제 쓰나 / When to use** → **장점·단점 / Pros·Cons** → **관련 손실**
  (cross-links that jump to that card) → **검증된 실제 논문** (title, authors, year,
  venue, link).
- End of each task's Learn: a **comparison / selection table** (the analog of the
  reference's "how these complement each other" section).

## Playground (loss curve + gradient + sliders + compare)

The unifying abstraction: every playground-able loss is a **1-D profile** — a pure
function `value(x, params)` and `grad(x, params)` over a scalar axis `x` whose meaning
is per-task. The Playground is one generic component (`LossPlot`, hand-rolled SVG):

- Checkboxes to overlay multiple losses on one axis (Okabe–Ito colors).
- Toggle to also draw the **gradient** curve (dashed).
- **Hyperparameter sliders** (Focal γ, Huber δ, Tversky α/β, Focal-Tversky γ, Label
  Smoothing ε, margin, temperature τ, seg false-positive level φ, …) → live recompute.
- Hover readout of loss & gradient at the cursor x.

Per-task x-axis semantics:

| Task | x axis | extra slider(s) |
|------|--------|-----------------|
| 분류 Classification | p = prob. of correct class (0→1) | Focal γ, LS ε, class weight |
| 회귀 Regression | residual r = ŷ − y | Huber δ, Quantile τ |
| 세그멘테이션 Segmentation | recall = GT coverage (0→1) | FP level φ, Tversky α/β, FT γ |
| 객체검출 Detection | residual r (box offset) / IoU | Huber δ, Focal γ |
| 대조·메트릭 Contrastive/Metric | similarity s / distance d | margin m, temp τ, K negatives |
| 랭킹·추천 Ranking | score gap Δ = s⁺ − s⁻ | margin m |
| 시퀀스·NLP·LLM | p = prob. of true token (0→1) | LS ε |
| 생성 Generative | D output d / σ / noise residual | — |

Losses that don't reduce to an honest 1-D curve (Boundary loss, GIoU/DIoU/CIoU box
geometry, LPIPS/perceptual, ListNet) are **Learn-only** (formula + static SVG figure +
prose); they simply have no `profile` and never appear in the Playground. This is
flagged in the UI, not silently dropped.

## Curated loss list (medical-imaging-representative)

1. **분류 Classification** — Cross-Entropy, Binary CE, Weighted CE (class imbalance),
   Focal Loss (Lin 2017), Label Smoothing CE (Szegedy 2016).
2. **회귀 Regression** — MSE (L2), MAE (L1), Huber / Smooth L1 (Huber 1964), Log-Cosh,
   Quantile / Pinball.
3. **세그멘테이션 Segmentation** — Soft Dice (Milletari 2016), IoU/Jaccard, Tversky
   (Salehi 2017), Focal Tversky (Abraham 2019), Combo Dice+CE, Boundary loss (Kervadec
   2019, Learn-only).
4. **객체검출 Detection** — Smooth L1, IoU loss, GIoU (Rezatofighi 2019, Learn-only),
   DIoU/CIoU (Zheng 2020, Learn-only), Focal (RetinaNet, Lin 2017).
5. **대조·메트릭 Contrastive/Metric** — Contrastive (Hadsell 2006), Triplet (FaceNet
   Schroff 2015), InfoNCE/NT-Xent (Oord 2018 / SimCLR Chen 2020), ArcFace (Deng 2019),
   SupCon (Khosla 2020, Learn note).
6. **랭킹·추천 Ranking** — BPR (Rendle 2009), Pairwise Hinge (RankSVM), Softmax/ListNet
   (Cao 2007, Learn-only).
7. **시퀀스·NLP·LLM** — Next-token Cross-Entropy (language modeling), Label Smoothing,
   CTC (Graves 2006, Learn note); relevant to radiology report generation.
8. **생성 Generative** — GAN minimax & non-saturating (Goodfellow 2014), WGAN (Arjovsky
   2017), Hinge-GAN (Lim 2017 / Miyato 2018), VAE KL/ELBO (Kingma 2013), Diffusion
   denoising MSE (Ho 2020), Perceptual/LPIPS (Zhang 2018, Learn-only).

(Final per-loss math is fixed in `engine/`; prose + verified papers per the schema below.)

## Architecture

```
src/
  main.tsx, App.tsx
  app/
    Sidebar.tsx          # task list + active state
    TaskPage.tsx         # Learn / Playground tabs for a task
    ThemeToggle.tsx      # light/dark, persisted
  i18n/
    LanguageContext.tsx  # 'ko' | 'en', persisted
    ui.ts                # UI chrome strings (buttons, labels)
  data/
    types.ts             # LossDef, TaskDef, Paper, ParamSpec, LocalizedText
    registry.ts          # ordered tasks -> losses
    losses/<task>.ts     # one file per task: LossDef[] (content + formula + params + profile ref)
  engine/
    profiles.ts          # pure value(x,params)/grad(x,params) per loss id
    profiles.test.ts     # analytic grad == numeric grad; known points
  components/
    LossCard.tsx         # one-liner + expandable detail (KaTeX)
    FormulaBlock.tsx     # KaTeX wrapper
    LossPlot.tsx         # generic SVG plot: multi-series loss + gradient, hover
    ParamSlider.tsx
    ComparisonTable.tsx
    LossFigure.tsx       # static SVG for Learn-only losses
  styles/
    tokens.css, global.css
```

### Data types (shape)

```ts
type LocalizedText = { ko: string; en: string };
type Paper = { title: string; authors: string; year: number; venue?: string; url?: string; note?: LocalizedText };
type ParamSpec = { key: string; label: LocalizedText; min: number; max: number; step: number; default: number };
type LossDef = {
  id: string;
  name: string;                 // English proper noun, shared across locales
  oneLiner: LocalizedText;      // short & clear
  formulaTeX: string;
  gradientTeX?: string;
  intuition: LocalizedText;
  whenToUse: LocalizedText;
  pros: LocalizedText[];
  cons: LocalizedText[];
  related: string[];            // other loss ids
  papers: Paper[];
  params?: ParamSpec[];
  profileId?: string;           // key into engine/profiles; absent => Learn-only
  xAxis?: LocalizedText;        // axis meaning for playground
};
type TaskDef = { id: string; title: LocalizedText; blurb: LocalizedText; losses: LossDef[]; xDomain: {min:number;max:number}; xLabel: LocalizedText };
```

Engine math (formulas + gradients + profile functions + param specs) is authored by
hand for correctness. Bilingual prose + verified papers are generated per task in
parallel and dropped into the typed `losses/<task>.ts` files.

## Success criteria (verification bar)

- `npm run build` passes (incl. `tsc` typecheck); zero console errors at runtime.
- `engine/profiles.test.ts` passes: for every profile, analytic gradient matches a
  central finite-difference numeric gradient within tolerance; spot-check known values
  (e.g. CE at p=1 → 0; MSE grad = 2r; Focal reduces to CE at γ=0).
- All 8 tasks render Learn + Playground; every loss has ≥1 verified real paper.
- Light/dark + ko/en toggles work and persist; Okabe–Ito series; WCAG-AA text.
- No grade words ("good"/"bad" verdict on a loss) — present trade-offs, like the reference.

## Out of scope (YAGNI)

- Backend, accounts, analytics, model leaderboard.
- Training a real model in-browser; full 2-D canvas drawing (curve playground only).
- Losses that can't be honestly reduced to the chosen 1-D axis get Learn-only treatment.
```
