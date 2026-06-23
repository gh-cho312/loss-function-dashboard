import type { TaskDef } from '../types';

export const nlp: TaskDef = {
  id: 'nlp',
  emoji: '💬',
  title: { ko: '시퀀스·NLP·LLM', en: 'Sequence / NLP / LLM' },
  short: { ko: 'NLP·LLM', en: 'NLP / LLM' },
  blurb: {
    ko: '토큰 시퀀스를 생성·정렬하는 문제. 거의 모든 언어모델은 "다음 토큰 맞히기"(교차엔트로피)로 학습합니다. 의료에서는 판독문 자동생성, 의료 음성인식, 의료 LLM 정렬에 직접 닿아 있습니다.',
    en: 'Generate and align token sequences. Almost every language model trains on "predict the next token" (cross-entropy). In medicine this touches radiology report generation, medical ASR, and medical-LLM alignment.',
  },
  xDomain: { min: 0.02, max: 1 },
  xLabel: { ko: '정답 토큰 예측확률  p', en: 'predicted probability of true token  p' },
  playgroundNote: {
    ko: 'x축 = 모델이 정답 토큰에 준 확률 p. 분류의 CE와 본질적으로 같습니다(여기선 토큰 단위). Label Smoothing의 ε를 올리면 최소점이 p=1에서 살짝 안쪽으로 이동해 과신을 막는 걸 볼 수 있습니다. 참고로 perplexity = exp(평균 NLL).',
        en: 'x = the probability p the model gives the true token. It is essentially classification CE (here per token). Raise Label Smoothing\'s ε and the minimum shifts slightly inward from p=1, curbing overconfidence. Note: perplexity = exp(mean NLL).',
  },
  losses: [
    {
      id: 'nll',
      name: 'Next-Token Cross-Entropy (NLL)',
      oneLiner: {
        ko: '다음 토큰의 음의 로그우도. GPT를 비롯한 사실상 모든 언어모델의 학습 목표.',
        en: 'Negative log-likelihood of the next token — the training objective of essentially every language model.',
      },
      formulaTeX:
        'L = -\\frac{1}{T}\\sum_{t=1}^{T} \\log p_{\\theta}(x_t \\mid x_{<t})',
      gradientTeX: '\\frac{\\partial L}{\\partial p_t} = -\\frac{1}{p_t}, \\qquad \\frac{\\partial L}{\\partial z} = p - y',
      intuition: {
        ko: '각 위치에서 실제 다음 토큰에 높은 확률을 주도록 학습합니다(토큰 단위 CE). 평균 NLL에 exp를 취하면 perplexity가 되어, "모델이 평균적으로 몇 개 토큰 사이에서 헷갈리는가"로 해석됩니다.',
        en: 'At each position it pushes probability onto the actual next token (per-token CE). Exponentiating the mean NLL gives perplexity — "how many tokens, on average, is the model effectively confused between."',
      },
      whenToUse: {
        ko: '언어모델 사전학습·미세조정의 기본. 판독문 생성, 의료 텍스트 요약 등 생성형 의료 NLP.',
        en: 'The default for LM pretraining/fine-tuning. Report generation, medical text summarization — generative medical NLP.',
      },
      pros: [
        { ko: '단순하고 확장성이 뛰어남(대규모 학습의 토대).', en: 'Simple and massively scalable (foundation of large-scale training).' },
        { ko: 'perplexity로 직접 해석 가능.', en: 'Directly interpretable via perplexity.' },
      ],
      cons: [
        { ko: '노출 편향(teacher forcing)·과신 문제.', en: 'Exposure bias (teacher forcing) and overconfidence.' },
        { ko: '사실성·선호 같은 상위 목표를 직접 다루지 않음(→ DPO).', en: 'Does not address higher-level goals like factuality/preference (→ DPO).' },
      ],
      related: ['label_smoothing_lm', 'ce', 'dpo'],
      papers: [
        {
          title: 'A Neural Probabilistic Language Model',
          authors: 'Y. Bengio, R. Ducharme, P. Vincent, C. Jauvin',
          year: 2003,
          venue: 'JMLR',
          url: 'https://www.jmlr.org/papers/v3/bengio03a.html',
        },
      ],
      profileId: 'nll',
    },
    {
      id: 'label_smoothing_lm',
      name: 'Label Smoothing (sequence)',
      oneLiner: {
        ko: '정답 토큰 목표를 1−ε로 낮춰 과신을 줄이는 시퀀스 학습의 단골 정규화.',
        en: 'Lowers the true-token target to 1−ε — a staple regularizer in sequence training.',
      },
      formulaTeX:
        'L = -(1-\\varepsilon)\\log p_t - \\frac{\\varepsilon}{V-1}\\sum_{c\\ne t}\\log p_c',
      gradientTeX: '\\text{(2-class)}\\quad -\\frac{1-\\varepsilon}{p_t} + \\frac{\\varepsilon}{1-p_t}',
      intuition: {
        ko: '정답 토큰에 확률을 100% 몰아주지 않도록 막아, 번역·생성에서 일반화와 보정을 개선합니다. Transformer 원논문도 ε=0.1을 사용했습니다. 곡선은 분류의 Label Smoothing과 동일.',
        en: 'It prevents dumping 100% probability on the true token, improving generalization and calibration in translation/generation. The original Transformer used ε=0.1. The curve matches classification\'s Label Smoothing.',
      },
      whenToUse: {
        ko: '기계번역·시퀀스 생성의 일반화·보정 개선. 작은 의료 텍스트 데이터의 과적합 완화.',
        en: 'Generalization/calibration in MT and sequence generation; reducing overfit on small medical-text corpora.',
      },
      pros: [
        { ko: '과신을 줄이고 BLEU/보정 개선.', en: 'Reduces overconfidence, improves BLEU/calibration.' },
        { ko: '구현이 간단.', en: 'Trivial to implement.' },
      ],
      cons: [
        { ko: 'perplexity 평가와 약간 어긋남.', en: 'Slightly at odds with perplexity evaluation.' },
        { ko: 'ε 튜닝 필요.', en: 'Needs tuning of ε.' },
      ],
      related: ['nll', 'label_smoothing'],
      params: [
        { key: 'eps', label: { ko: '스무딩 ε', en: 'smoothing ε' }, min: 0, max: 0.4, step: 0.01, default: 0.1 },
      ],
      papers: [
        {
          title: 'Attention Is All You Need',
          authors: 'A. Vaswani et al.',
          year: 2017,
          venue: 'NeurIPS',
          url: 'https://arxiv.org/abs/1706.03762',
          note: { ko: 'Transformer 학습에 label smoothing ε=0.1 사용.', en: 'Used label smoothing ε=0.1 to train the Transformer.' },
        },
      ],
      profileId: 'label_smoothing_lm',
    },
    {
      id: 'ctc',
      name: 'CTC (Connectionist Temporal Classification)',
      oneLiner: {
        ko: '입력과 출력의 정렬(alignment)을 모를 때, 가능한 모든 정렬을 합산해 학습한다.',
        en: 'Trains without a known input–output alignment by summing over all valid alignments.',
      },
      formulaTeX:
        'L = -\\log \\sum_{\\pi \\in \\mathcal{B}^{-1}(y)} \\prod_{t=1}^{T} p_t(\\pi_t)',
      intuition: {
        ko: '음성→글자처럼 입력 길이와 출력 길이가 다르고 정렬이 없을 때, "빈칸(blank)"을 도입해 같은 라벨로 접히는(B) 모든 경로의 확률을 동적계획법으로 합산합니다. 정렬을 따로 라벨링할 필요가 없어집니다. 시퀀스 합산 구조라 곡선 대신 설명 제공.',
        en: 'When input and output lengths differ with no alignment (e.g., speech→characters), it adds a "blank" symbol and sums (via dynamic programming) the probability of all paths that collapse (B) to the same label — removing the need to label alignments. Being a sum over sequences, it is explained rather than plotted.',
      },
      whenToUse: {
        ko: '음성인식, 필기/장면 텍스트 인식 등 정렬 없는 시퀀스 라벨링. 의료 음성기록(받아쓰기).',
        en: 'Speech recognition, handwriting/scene-text — alignment-free sequence labeling. Medical dictation/ASR.',
      },
      pros: [
        { ko: '정렬 라벨이 필요 없음.', en: 'No alignment labels required.' },
        { ko: '가변 길이 시퀀스에 자연스러움.', en: 'Natural for variable-length sequences.' },
      ],
      cons: [
        { ko: '조건부 독립 가정(출력 간 의존 약함).', en: 'Conditional-independence assumption (weak output dependencies).' },
        { ko: '디코딩에 언어모델 보강이 흔히 필요.', en: 'Often needs an external LM at decoding.' },
      ],
      related: ['nll'],
      papers: [
        {
          title: 'Connectionist Temporal Classification: Labelling Unsegmented Sequence Data with RNNs',
          authors: 'A. Graves, S. Fernández, F. Gomez, J. Schmidhuber',
          year: 2006,
          venue: 'ICML',
          url: 'https://doi.org/10.1145/1143844.1143891',
        },
      ],
    },
    {
      id: 'dpo',
      name: 'DPO (Direct Preference Optimization)',
      oneLiner: {
        ko: '보상모델 없이, "선호된 답이 비선호 답보다 낫다"를 직접 최적화하는 정렬 손실.',
        en: 'Aligns a model directly to "preferred over rejected" without a separate reward model.',
      },
      formulaTeX:
        'L = -\\log \\sigma\\!\\Big(\\beta\\big[\\log\\tfrac{\\pi_\\theta(y_w|x)}{\\pi_{\\text{ref}}(y_w|x)} - \\log\\tfrac{\\pi_\\theta(y_l|x)}{\\pi_{\\text{ref}}(y_l|x)}\\big]\\Big)',
      intuition: {
        ko: '구조적으로 BPR과 같은 "쌍별 로지스틱"입니다: 선호 답 y_w의 상대 로그확률을 비선호 y_l보다 높이되, 참조모델(π_ref)에서 너무 멀어지지 않게 β로 묶습니다. RLHF의 복잡한 강화학습을 단일 분류 손실로 대체. 정책/참조 모델이 필요해 설명만 제공.',
        en: 'Structurally it is BPR\'s pairwise logistic: raise the relative log-prob of the preferred answer y_w over the rejected y_l, while β keeps the policy from drifting too far from a reference (π_ref). It replaces RLHF\'s complex RL with a single classification loss. It needs policy/reference models, so it is explained rather than plotted.',
      },
      whenToUse: {
        ko: '인간 선호로 LLM을 정렬할 때(RLHF 대체). 의료 LLM의 안전·사실성 정렬.',
        en: 'Aligning LLMs to human preferences (an RLHF alternative); safety/factuality alignment of medical LLMs.',
      },
      pros: [
        { ko: '보상모델·온라인 RL 없이 안정적으로 정렬.', en: 'Stable alignment without a reward model or online RL.' },
        { ko: '구현이 RLHF보다 단순.', en: 'Simpler than RLHF.' },
      ],
      cons: [
        { ko: '선호쌍 데이터 품질에 의존.', en: 'Depends on preference-pair data quality.' },
        { ko: 'β·참조모델 선택에 민감.', en: 'Sensitive to β and the reference model.' },
      ],
      related: ['nll', 'bpr'],
      papers: [
        {
          title: 'Direct Preference Optimization: Your Language Model is Secretly a Reward Model',
          authors: 'R. Rafailov et al.',
          year: 2023,
          venue: 'NeurIPS',
          url: 'https://arxiv.org/abs/2305.18290',
        },
      ],
    },
  ],
  comparison: {
    columns: [
      { key: 'goal', label: { ko: '학습 목표', en: 'Objective' } },
      { key: 'align', label: { ko: '정렬 필요?', en: 'Alignment?' } },
      { key: 'use', label: { ko: '대표 사용처', en: 'Typical use' } },
    ],
    rows: [
      { lossId: 'nll', cells: { goal: { ko: '다음 토큰 우도', en: 'Next-token likelihood' }, align: { ko: '불필요', en: 'No' }, use: { ko: 'LM 사전학습', en: 'LM pretraining' } } },
      { lossId: 'label_smoothing_lm', cells: { goal: { ko: '우도 + 정규화', en: 'Likelihood + reg.' }, align: { ko: '불필요', en: 'No' }, use: { ko: '번역·생성', en: 'MT / generation' } } },
      { lossId: 'ctc', cells: { goal: { ko: '정렬 주변화', en: 'Marginalize alignments' }, align: { ko: '학습이 처리', en: 'Learned' }, use: { ko: '음성/필기 인식', en: 'ASR / handwriting' } } },
      { lossId: 'dpo', cells: { goal: { ko: '선호 정렬', en: 'Preference alignment' }, align: { ko: '쌍 선호', en: 'Pair prefs' }, use: { ko: 'LLM 정렬', en: 'LLM alignment' } } },
    ],
  },
};
