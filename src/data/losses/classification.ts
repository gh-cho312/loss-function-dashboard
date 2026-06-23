import type { TaskDef } from '../types';

export const classification: TaskDef = {
  id: 'classification',
  emoji: '🏷️',
  title: { ko: '분류 (Classification)', en: 'Classification' },
  short: { ko: '분류', en: 'Classification' },
  blurb: {
    ko: '입력을 정해진 클래스 중 하나(또는 여러 개)로 맞히는 문제. 의료영상에서는 정상/질환 판별, 병변 등급 분류 등에 쓰이며, 데이터 불균형이 핵심 난제라 그에 맞는 손실 선택이 중요합니다.',
    en: 'Assign an input to one (or several) of a fixed set of classes. In medical imaging this covers normal/abnormal, disease grading, and more — where class imbalance is the central challenge that drives the choice of loss.',
  },
  xDomain: { min: 0.02, max: 1 },
  xLabel: { ko: '정답 클래스 예측확률  p', en: 'predicted probability of true class  p' },
  playgroundNote: {
    ko: 'x축은 모델이 정답 클래스에 부여한 확률 p입니다. p가 1에 가까울수록 잘 맞힌 것 → 손실이 0에 가까워야 합니다. 기울기 곡선을 켜고, "쉬운 예제"(p가 큰 영역)에서 Focal이 어떻게 기울기를 줄이는지 보세요.',
    en: 'The x-axis is the probability p the model assigns to the true class. p near 1 means a correct, confident prediction → loss should be near 0. Turn on the gradient curve and watch how Focal shrinks the gradient on "easy" examples (large p).',
  },
  losses: [
    {
      id: 'ce',
      name: 'Cross-Entropy (CE)',
      oneLiner: {
        ko: '정답 클래스 확률에 −log를 씌운 값. 틀릴수록(확률↓) 손실이 가파르게 커지는 분류의 기본 손실.',
        en: 'Negative log of the true-class probability — the default classification loss that grows steeply as you get it wrong.',
      },
      formulaTeX: 'L_{\\text{CE}} = -\\sum_{c} y_c \\log p_c = -\\log p_{t}',
      gradientTeX: '\\frac{\\partial L}{\\partial p_t} = -\\frac{1}{p_t}, \\qquad \\frac{\\partial L}{\\partial z_c} = p_c - y_c',
      intuition: {
        ko: '정답일 확률 p가 1이면 손실 0, p가 0에 가까우면 손실이 무한대로 발산합니다. "확신을 갖고 틀리는 것"을 가장 강하게 벌합니다. 로짓(z)에 대한 기울기는 깔끔하게 p−y가 됩니다.',
        en: 'If the probability p of the correct class is 1 the loss is 0; as p approaches 0 the loss diverges to infinity. It punishes "confidently wrong" hardest. The gradient w.r.t. logits is the clean p − y.',
      },
      whenToUse: {
        ko: '클래스가 비교적 균형 잡힌 일반 분류의 기본값. softmax(다중분류)와 짝을 이룹니다. 불균형이 심하면 Weighted CE나 Focal을 고려하세요.',
        en: 'The default for ordinary, reasonably balanced classification, paired with softmax (multi-class). For heavy imbalance, reach for Weighted CE or Focal.',
      },
      pros: [
        { ko: '확률론적으로 자연스럽고(최대우도), 로짓 기울기가 p−y로 단순.', en: 'Probabilistically principled (maximum likelihood); logit gradient is simply p − y.' },
        { ko: '잘 보정된(calibrated) 확률을 내는 경향.', en: 'Tends to yield well-calibrated probabilities.' },
      ],
      cons: [
        { ko: '쉬운 다수 클래스가 손실을 지배 → 불균형에 취약.', en: 'Easy majority examples dominate the loss → fragile under imbalance.' },
        { ko: '레이블 노이즈에 민감(확신 있는 오답에 큰 벌점).', en: 'Sensitive to label noise (huge penalty for confident mistakes).' },
      ],
      related: ['weighted_ce', 'focal', 'label_smoothing', 'bce'],
      papers: [
        {
          title: 'Pattern Recognition and Machine Learning',
          authors: 'C. M. Bishop',
          year: 2006,
          venue: 'Springer',
          note: { ko: '교차엔트로피·최대우도의 표준 교과서적 유도.', en: 'Standard textbook derivation of cross-entropy / maximum likelihood.' },
        },
        {
          title: 'Deep Learning',
          authors: 'I. Goodfellow, Y. Bengio, A. Courville',
          year: 2016,
          venue: 'MIT Press',
          url: 'https://www.deeplearningbook.org/',
        },
      ],
      profileId: 'ce',
    },
    {
      id: 'bce',
      name: 'Binary Cross-Entropy (BCE)',
      oneLiner: {
        ko: '클래스가 둘(또는 다중 레이블)일 때의 CE. 각 출력에 sigmoid를 씌워 독립적으로 본다.',
        en: 'Cross-entropy for two classes (or multi-label) — each output passed through a sigmoid and scored independently.',
      },
      formulaTeX: 'L_{\\text{BCE}} = -\\big[\\, y\\log p + (1-y)\\log(1-p) \\,\\big]',
      gradientTeX: '\\frac{\\partial L}{\\partial z} = p - y',
      intuition: {
        ko: '양성(y=1)이면 −log p, 음성(y=0)이면 −log(1−p). 정답이 양성일 때의 곡선은 CE와 똑같습니다. 다중 레이블(한 영상에 여러 소견)에서는 각 레이블에 BCE를 따로 매깁니다.',
        en: 'For a positive (y=1) it is −log p, for a negative (y=0) it is −log(1−p). For a positive label the curve is identical to CE. For multi-label problems (several findings per image) you apply BCE to each label independently.',
      },
      whenToUse: {
        ko: '이진 분류, 또는 클래스가 상호배타적이지 않은 다중 레이블 분류(흉부 X선의 여러 동시 소견 등).',
        en: 'Binary classification, or multi-label problems where classes are not mutually exclusive (e.g., several co-occurring findings on a chest X-ray).',
      },
      pros: [
        { ko: '다중 레이블을 자연스럽게 처리(레이블마다 독립 sigmoid).', en: 'Handles multi-label naturally (independent sigmoid per label).' },
        { ko: '로짓 기울기가 p−y로 CE와 동일하게 단순.', en: 'Logit gradient is p − y, as simple as CE.' },
      ],
      cons: [
        { ko: '양성이 드문 레이블에서는 불균형 문제가 그대로(→ pos_weight/Focal).', en: 'Imbalance persists for rare-positive labels (→ pos_weight / Focal).' },
        { ko: '레이블 간 상관을 모델 구조가 따로 잡아주지 않으면 무시.', en: 'Ignores label correlations unless the architecture models them.' },
      ],
      related: ['ce', 'focal', 'weighted_ce'],
      papers: [
        {
          title: 'The Regression Analysis of Binary Sequences',
          authors: 'D. R. Cox',
          year: 1958,
          venue: 'J. Royal Statistical Society B',
          note: { ko: '로지스틱 회귀/이진 로그우도의 고전.', en: 'The classic origin of logistic regression / binary log-likelihood.' },
        },
      ],
      // Learn-only: for a positive label its curve coincides exactly with CE.
    },
    {
      id: 'weighted_ce',
      name: 'Weighted Cross-Entropy',
      oneLiner: {
        ko: 'CE에 클래스별 가중치 w를 곱해 드문 클래스를 더 크게 벌하는 불균형 대처법.',
        en: 'CE scaled by a per-class weight w to penalize rare classes more — the simplest imbalance fix.',
      },
      formulaTeX: 'L = -\\, w_{t}\\, \\log p_{t}',
      gradientTeX: '\\frac{\\partial L}{\\partial p_t} = -\\frac{w_t}{p_t}',
      intuition: {
        ko: 'CE 곡선의 세로 크기를 클래스마다 다르게 스케일합니다. 가중치를 키우면 그 클래스의 손실·기울기가 함께 커져 학습 신호가 강해집니다. 보통 w는 클래스 빈도의 역수로 줍니다.',
        en: 'It rescales the height of the CE curve per class. A larger weight grows that class\'s loss and gradient together, strengthening its learning signal. Weights are commonly set to the inverse class frequency.',
      },
      whenToUse: {
        ko: '클래스 불균형이 있을 때 가장 먼저 시도하는 방법. 양성이 드문 의료영상 분류(질환 유병률이 낮은 경우)에 흔히 사용.',
        en: 'The first thing to try under class imbalance. Common in medical-imaging classification where positives are rare (low disease prevalence).',
      },
      pros: [
        { ko: '구현이 한 줄로 간단하고 직관적.', en: 'A one-line change; simple and intuitive.' },
        { ko: '드문 클래스의 재현율(recall)을 끌어올림.', en: 'Lifts recall on rare classes.' },
      ],
      cons: [
        { ko: '가중치 자체가 튜닝 대상이고, 과하면 다수 클래스 정밀도가 무너짐.', en: 'The weight is itself a hyperparameter; too large and majority-class precision collapses.' },
        { ko: '쉬운/어려운 예제는 구분하지 못함(그건 Focal의 몫).', en: 'Does not distinguish easy vs hard examples (that is Focal\'s job).' },
      ],
      related: ['ce', 'focal'],
      params: [
        { key: 'weight', label: { ko: '클래스 가중치 w', en: 'class weight w' }, min: 0.2, max: 5, step: 0.1, default: 2 },
      ],
      papers: [
        {
          title: 'The Class Imbalance Problem: A Systematic Study',
          authors: 'N. Japkowicz, S. Stephen',
          year: 2002,
          venue: 'Intelligent Data Analysis',
          note: { ko: '불균형 학습과 비용가중의 체계적 분석.', en: 'A systematic study of imbalance and cost-weighting.' },
        },
      ],
      profileId: 'weighted_ce',
    },
    {
      id: 'focal',
      name: 'Focal Loss',
      oneLiner: {
        ko: '쉬운 예제의 손실을 (1−p)^γ로 눌러, 어려운 소수 예제에 학습을 집중시키는 손실.',
        en: 'Down-weights easy examples by (1−p)^γ so training focuses on the hard, rare ones.',
      },
      formulaTeX: 'L_{\\text{focal}} = -(1-p_t)^{\\gamma}\\, \\log p_t',
      gradientTeX: '\\frac{\\partial L}{\\partial p_t} = \\gamma\\,(1-p_t)^{\\gamma-1}\\log p_t \\; - \\; \\frac{(1-p_t)^{\\gamma}}{p_t}',
      intuition: {
        ko: '잘 맞힌 쉬운 예제(p가 큼)는 (1−p)^γ가 거의 0이라 손실·기울기가 사라지고, 잘 못 맞힌 예제(p가 작음)는 거의 그대로 남습니다. γ=0이면 정확히 CE가 됩니다. 슬라이더로 γ를 올리며 쉬운 영역의 곡선이 눌리는 걸 확인하세요.',
        en: 'Easy, well-classified examples (large p) have (1−p)^γ ≈ 0 so their loss and gradient vanish, while hard examples (small p) are left almost untouched. At γ=0 it reduces exactly to CE. Slide γ up and watch the easy region get flattened.',
      },
      whenToUse: {
        ko: '극심한 불균형(검출에서 배경 앵커가 압도적일 때, 드문 병변 분류 등). RetinaNet의 핵심 아이디어로, 의료영상의 작은 병변 검출/분류에 널리 쓰임.',
        en: 'Extreme imbalance (overwhelming background anchors in detection, rare-lesion classification). The core idea of RetinaNet, widely used for small-lesion detection/classification in medical imaging.',
      },
      pros: [
        { ko: '쉬운 다수 예제의 영향력을 자동으로 줄여 불균형을 흡수.', en: 'Automatically suppresses the easy majority, absorbing imbalance.' },
        { ko: 'α(클래스 가중)와 결합해 정밀하게 균형 조절 가능.', en: 'Combines with an α class weight for fine-grained balancing.' },
      ],
      cons: [
        { ko: 'γ를 너무 키우면 학습이 느려지거나 노이즈를 어려운 예제로 오인.', en: 'Too large a γ slows learning or mistakes noise for "hard" examples.' },
        { ko: 'γ, α 두 하이퍼파라미터 튜닝 필요.', en: 'Adds two hyperparameters (γ, α) to tune.' },
      ],
      related: ['ce', 'weighted_ce'],
      params: [
        { key: 'gamma', label: { ko: '집중 계수 γ', en: 'focusing γ' }, min: 0, max: 5, step: 0.1, default: 2 },
      ],
      papers: [
        {
          title: 'Focal Loss for Dense Object Detection',
          authors: 'T.-Y. Lin, P. Goyal, R. Girshick, K. He, P. Dollár',
          year: 2017,
          venue: 'ICCV',
          url: 'https://arxiv.org/abs/1708.02002',
        },
      ],
      profileId: 'focal',
    },
    {
      id: 'label_smoothing',
      name: 'Label Smoothing CE',
      oneLiner: {
        ko: '정답을 1 대신 1−ε로, 나머지에 ε를 조금 나눠줘 과신을 막는 정규화된 CE.',
        en: 'CE with soft targets (1−ε for the truth, ε spread elsewhere) to curb overconfidence.',
      },
      formulaTeX: 'L_{\\text{LS}} = -(1-\\varepsilon)\\log p_t \\; - \\; \\tfrac{\\varepsilon}{K-1}\\sum_{c\\ne t}\\log p_c',
      gradientTeX: '\\text{(2-class)}\\quad \\frac{\\partial L}{\\partial p_t} = -\\frac{1-\\varepsilon}{p_t} + \\frac{\\varepsilon}{1-p_t}',
      intuition: {
        ko: '정답 목표를 1에서 살짝 낮춰(1−ε) 모델이 무한히 확신하지 못하게 합니다. 그 결과 손실의 최소점이 p=1이 아니라 p=1−ε 부근으로 옮겨가, 곡선이 끝에서 다시 살짝 올라갑니다. 표시 곡선은 2-클래스 근사입니다.',
        en: 'It lowers the target for the truth slightly (1−ε) so the model never becomes infinitely confident. The loss minimum shifts from p=1 toward p≈1−ε, so the curve turns back up near the right edge. The plotted curve is the 2-class reduction.',
      },
      whenToUse: {
        ko: '대규모 분류에서 일반화·보정(calibration) 개선용. 레이블이 다소 노이지하거나 클래스 경계가 모호한 의료 등급 분류에 도움.',
        en: 'To improve generalization and calibration in large-scale classification. Helpful when labels are noisy or class boundaries are fuzzy, as in medical grading.',
      },
      pros: [
        { ko: '과신을 줄이고 보정을 개선, 종종 정확도도 소폭 향상.', en: 'Reduces overconfidence, improves calibration, often nudges accuracy up.' },
        { ko: '레이블 노이즈에 더 강건.', en: 'More robust to label noise.' },
      ],
      cons: [
        { ko: '지식 증류(distillation)의 teacher 확률 정보를 일부 지움.', en: 'Can erase information useful for knowledge distillation (teacher logits).' },
        { ko: 'ε 튜닝 필요, 너무 크면 신호가 흐려짐.', en: 'Needs tuning of ε; too large blurs the signal.' },
      ],
      related: ['ce'],
      params: [
        { key: 'eps', label: { ko: '스무딩 ε', en: 'smoothing ε' }, min: 0, max: 0.4, step: 0.01, default: 0.1 },
      ],
      papers: [
        {
          title: 'Rethinking the Inception Architecture for Computer Vision',
          authors: 'C. Szegedy, V. Vanhoucke, S. Ioffe, J. Shlens, Z. Wojna',
          year: 2016,
          venue: 'CVPR',
          url: 'https://arxiv.org/abs/1512.00567',
          note: { ko: '레이블 스무딩을 처음 제안.', en: 'Introduced label smoothing.' },
        },
        {
          title: 'When Does Label Smoothing Help?',
          authors: 'R. Müller, S. Kornblith, G. Hinton',
          year: 2019,
          venue: 'NeurIPS',
          url: 'https://arxiv.org/abs/1906.02629',
        },
      ],
      profileId: 'label_smoothing',
    },
  ],
  comparison: {
    columns: [
      { key: 'use', label: { ko: '주 용도', en: 'Primary use' } },
      { key: 'imb', label: { ko: '불균형 대응', en: 'Imbalance' } },
      { key: 'note', label: { ko: '특징', en: 'Note' } },
    ],
    rows: [
      { lossId: 'ce', cells: { use: { ko: '균형 잡힌 다중분류 기본', en: 'Balanced multi-class default' }, imb: { ko: '약함', en: 'Weak' }, note: { ko: '보정 양호, 단순', en: 'Well-calibrated, simple' } } },
      { lossId: 'bce', cells: { use: { ko: '이진/다중 레이블', en: 'Binary / multi-label' }, imb: { ko: 'pos_weight로 보완', en: 'Via pos_weight' }, note: { ko: '레이블마다 독립', en: 'Independent per label' } } },
      { lossId: 'weighted_ce', cells: { use: { ko: '불균형 분류', en: 'Imbalanced classes' }, imb: { ko: '강함(클래스 단위)', en: 'Strong (class-level)' }, note: { ko: '쉬움/어려움 구분 없음', en: 'No easy/hard distinction' } } },
      { lossId: 'focal', cells: { use: { ko: '극심한 불균형·작은 병변', en: 'Extreme imbalance, small lesions' }, imb: { ko: '강함(예제 단위)', en: 'Strong (example-level)' }, note: { ko: 'γ로 쉬운 예제 억제', en: 'γ suppresses easy examples' } } },
      { lossId: 'label_smoothing', cells: { use: { ko: '일반화·보정', en: 'Generalization / calibration' }, imb: { ko: '간접적', en: 'Indirect' }, note: { ko: '과신 방지', en: 'Curbs overconfidence' } } },
    ],
  },
};
