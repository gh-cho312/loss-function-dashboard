import type { TaskDef } from '../types';

export const ranking: TaskDef = {
  id: 'ranking',
  emoji: '🥇',
  title: { ko: '랭킹·추천 (Ranking)', en: 'Ranking / Recommendation' },
  short: { ko: '랭킹·추천', en: 'Ranking' },
  blurb: {
    ko: '절대값이 아니라 "순서"를 맞히는 문제. 검색·추천이 대표적이며, 의료에서는 판독 우선순위(triage) 정렬이나 유사 증례 검색 순위에 응용됩니다. 핵심은 양성을 음성보다 위에 놓는 것.',
    en: 'Get the order right rather than absolute values. Classic in search/recommendation; in medicine it maps to triage prioritization and similar-case retrieval ranking. The crux is putting positives above negatives.',
  },
  xDomain: { min: -3, max: 3 },
  xLabel: { ko: '점수차  Δ = s⁺ − s⁻', en: 'score gap  Δ = s⁺ − s⁻' },
  playgroundNote: {
    ko: 'x축 = 양성과 음성의 점수차 Δ. Δ>0이면 순서가 맞은 것(손실↓). 세 손실의 성격을 비교하세요: 지수형은 틀린 순서에 폭발적으로, BPR(로그)은 부드럽게, Hinge는 마진을 넘으면 딱 0이 됩니다.',
    en: 'x = score gap Δ between a positive and a negative. Δ>0 means correct order (lower loss). Compare the three: the exponential blows up on wrong order, BPR (log) is smooth, and Hinge becomes exactly 0 past the margin.',
  },
  losses: [
    {
      id: 'bpr',
      name: 'BPR (Bayesian Personalized Ranking)',
      oneLiner: {
        ko: '양성이 음성보다 높을 확률 σ(Δ)을 최대화하는 부드러운 쌍별 랭킹 손실.',
        en: 'A smooth pairwise loss that maximizes σ(Δ), the probability a positive outranks a negative.',
      },
      formulaTeX: 'L = -\\log \\sigma(s^{+} - s^{-}),\\qquad \\sigma(z)=\\frac{1}{1+e^{-z}}',
      gradientTeX: '\\frac{\\partial L}{\\partial \\Delta} = \\sigma(\\Delta) - 1',
      intuition: {
        ko: '순서가 맞아도(Δ>0) 기울기가 완전히 0이 되지 않아 계속 더 벌립니다. 순서가 틀리면(Δ<0) 기울기가 −1에 가까워져 강하게 교정. 부드러워 안정적이고, 암묵적 피드백(클릭 등) 추천의 표준.',
        en: 'Even when the order is correct (Δ>0) the gradient never quite hits 0, so it keeps separating. When wrong (Δ<0) the gradient approaches −1 for strong correction. Smooth and stable — the standard for implicit-feedback recommendation.',
      },
      whenToUse: {
        ko: '암묵적 피드백 추천, 부드러운 쌍별 랭킹이 필요할 때.',
        en: 'Implicit-feedback recommendation; whenever you want a smooth pairwise ranker.',
      },
      pros: [
        { ko: '확률적 해석이 명확하고 매끄러움.', en: 'Clear probabilistic interpretation; smooth.' },
        { ko: '항상 약한 분리 신호를 제공.', en: 'Always provides a small separating signal.' },
      ],
      cons: [
        { ko: '쌍 샘플링 전략에 성능이 좌우.', en: 'Performance depends on pair-sampling strategy.' },
        { ko: '리스트 수준 지표(NDCG)를 직접 최적화하진 않음.', en: 'Does not directly optimize list metrics (NDCG).' },
      ],
      related: ['pairwise_hinge', 'exp_rank', 'bce'],
      papers: [
        {
          title: 'BPR: Bayesian Personalized Ranking from Implicit Feedback',
          authors: 'S. Rendle, C. Freudenthaler, Z. Gantner, L. Schmidt-Thieme',
          year: 2009,
          venue: 'UAI',
          url: 'https://arxiv.org/abs/1205.2618',
        },
      ],
      profileId: 'bpr',
    },
    {
      id: 'pairwise_hinge',
      name: 'Pairwise Hinge (RankSVM)',
      oneLiner: {
        ko: '양성이 음성보다 마진 m 이상 높으면 손실 0인 마진 기반 랭킹 손실.',
        en: 'A margin loss: zero once the positive beats the negative by at least a margin m.',
      },
      formulaTeX: 'L = \\max\\big(0,\\; m - (s^{+} - s^{-})\\big)',
      gradientTeX: '\\frac{\\partial L}{\\partial \\Delta} = \\begin{cases} -1 & \\Delta < m \\\\ 0 & \\Delta \\ge m \\end{cases}',
      intuition: {
        ko: '마진 m을 확보하면 더 이상 벌하지 않고(기울기 0) 다른 어려운 쌍에 집중합니다. SVM의 랭킹 버전으로, 명확한 "충분히 분리됨" 기준을 줍니다.',
        en: 'Once the margin m is met it stops penalizing (zero gradient) and moves on to harder pairs. The ranking analog of an SVM, giving a crisp "separated enough" criterion.',
      },
      whenToUse: {
        ko: '명확한 마진 기반 분리를 원할 때, 학습-투-랭크의 고전 기준선.',
        en: 'When you want crisp margin-based separation; a classic learning-to-rank baseline.',
      },
      pros: [
        { ko: '충분히 분리된 쌍은 무시해 효율적.', en: 'Efficient — ignores already-separated pairs.' },
        { ko: '마진으로 분리 정도를 직접 제어.', en: 'Margin directly controls the separation.' },
      ],
      cons: [
        { ko: '마진 지점에서 미분 불가.', en: 'Non-differentiable at the margin.' },
        { ko: '확률 출력이 아님.', en: 'Not probabilistic.' },
      ],
      related: ['bpr', 'exp_rank', 'triplet'],
      params: [
        { key: 'margin', label: { ko: '마진 m', en: 'margin m' }, min: 0, max: 2, step: 0.1, default: 1 },
      ],
      papers: [
        {
          title: 'Optimizing Search Engines using Clickthrough Data (Ranking SVM)',
          authors: 'T. Joachims',
          year: 2002,
          venue: 'KDD',
          url: 'https://doi.org/10.1145/775047.775067',
        },
      ],
      profileId: 'pairwise_hinge',
    },
    {
      id: 'exp_rank',
      name: 'Exponential (RankBoost)',
      oneLiner: {
        ko: '틀린 순서를 지수적으로 폭발시켜 벌하는 부스팅 계열 랭킹 손실.',
        en: 'A boosting-style loss that penalizes wrong order exponentially.',
      },
      formulaTeX: 'L = e^{-(s^{+} - s^{-})}',
      gradientTeX: '\\frac{\\partial L}{\\partial \\Delta} = -e^{-\\Delta}',
      intuition: {
        ko: '순서가 크게 틀릴수록(Δ가 음수로 큼) 손실·기울기가 지수적으로 커져 어려운 쌍을 공격적으로 교정합니다. 강력하지만 이상치(노이지 라벨)에 매우 민감.',
        en: 'The more wrong the order (large negative Δ), the more loss and gradient grow exponentially, aggressively fixing hard pairs. Powerful but very sensitive to outliers (noisy labels).',
      },
      whenToUse: {
        ko: '부스팅 기반 랭킹(RankBoost). 라벨이 깨끗할 때.',
        en: 'Boosting-based ranking (RankBoost), when labels are clean.',
      },
      pros: [
        { ko: '어려운 쌍에 강한 신호.', en: 'Strong signal on hard pairs.' },
        { ko: '부스팅과 잘 맞음.', en: 'Fits boosting frameworks well.' },
      ],
      cons: [
        { ko: '노이즈·이상치에 매우 취약.', en: 'Very fragile to noise/outliers.' },
        { ko: '수치적으로 폭주 위험.', en: 'Risk of numerical blow-up.' },
      ],
      related: ['bpr', 'pairwise_hinge'],
      papers: [
        {
          title: 'An Efficient Boosting Algorithm for Combining Preferences (RankBoost)',
          authors: 'Y. Freund, R. Iyer, R. E. Schapire, Y. Singer',
          year: 2003,
          venue: 'JMLR',
          url: 'https://www.jmlr.org/papers/v4/freund03a.html',
        },
      ],
      profileId: 'exp_rank',
    },
    {
      id: 'listnet',
      name: 'ListNet (Listwise Softmax)',
      oneLiner: {
        ko: '리스트 전체의 점수를 소프트맥스 분포로 보고 정답 분포와 맞추는 손실.',
        en: 'Treats a whole list\'s scores as a softmax distribution and matches it to the ground-truth distribution.',
      },
      formulaTeX:
        'L = -\\sum_{i} P^{gt}_i \\log P^{\\theta}_i,\\quad P^{\\theta}_i = \\frac{e^{s_i}}{\\sum_j e^{s_j}}',
      intuition: {
        ko: '쌍이 아니라 리스트 전체를 한 번에 봅니다. 점수를 소프트맥스로 확률화해 정답 순위 분포와 교차엔트로피를 맞춥니다. 리스트 문맥을 살리지만, 쌍 단위 손실보다 1차원 곡선으로 표현하기 어려워 설명만 제공.',
        en: 'It looks at the entire list at once: scores are softmaxed into a distribution and matched to the ground-truth rank distribution via cross-entropy. It captures list context but, being listwise, is explained rather than plotted.',
      },
      whenToUse: {
        ko: '리스트 수준 문맥이 중요한 학습-투-랭크.',
        en: 'Learning-to-rank where list-level context matters.',
      },
      pros: [
        { ko: '리스트 전체를 고려.', en: 'Considers the whole list.' },
        { ko: '확률적 해석.', en: 'Probabilistic interpretation.' },
      ],
      cons: [
        { ko: '계산 비용이 큼.', en: 'More expensive to compute.' },
        { ko: 'NDCG 같은 비매끈 지표와는 여전히 간접적.', en: 'Still indirect w.r.t. non-smooth metrics like NDCG.' },
      ],
      related: ['lambdarank', 'bpr'],
      papers: [
        {
          title: 'Learning to Rank: From Pairwise Approach to Listwise Approach (ListNet)',
          authors: 'Z. Cao, T. Qin, T.-Y. Liu, M.-F. Tsai, H. Li',
          year: 2007,
          venue: 'ICML',
          url: 'https://doi.org/10.1145/1273496.1273513',
        },
      ],
    },
    {
      id: 'lambdarank',
      name: 'LambdaRank / LambdaMART',
      oneLiner: {
        ko: '손실을 직접 정의하지 않고, NDCG 변화량으로 기울기(λ)를 가중하는 영리한 우회.',
        en: 'Skips defining a loss and instead weights the gradient (λ) by the change in NDCG.',
      },
      formulaTeX:
        '\\lambda_{ij} = \\frac{-1}{1+e^{(s_i - s_j)}}\\,\\big|\\Delta \\text{NDCG}_{ij}\\big|',
      intuition: {
        ko: 'NDCG처럼 미분 불가능한 랭킹 지표를 직접 최적화하기 어려우니, "이 두 항목을 바꾸면 NDCG가 얼마나 변하나"로 기울기를 키우거나 줄입니다. 손실 함수 없이 기울기만 정의하는 접근이라 곡선으로 표시하지 않습니다.',
        en: 'Since metrics like NDCG are non-differentiable, it scales the gradient by "how much would swapping these two change NDCG" instead of optimizing a loss directly. It defines gradients, not a loss, so it is not plotted.',
      },
      whenToUse: {
        ko: 'NDCG/MAP 같은 랭킹 지표를 사실상 최적화해야 하는 실전 검색 랭킹.',
        en: 'Production search ranking where you effectively must optimize NDCG/MAP.',
      },
      pros: [
        { ko: '비매끈 랭킹 지표를 효과적으로 최적화.', en: 'Effectively optimizes non-smooth ranking metrics.' },
        { ko: 'LambdaMART로 강력한 성능.', en: 'Strong performance via LambdaMART.' },
      ],
      cons: [
        { ko: '명시적 손실이 없어 해석이 덜 직관적.', en: 'No explicit loss; less intuitive to reason about.' },
        { ko: '구현이 복잡.', en: 'More complex to implement.' },
      ],
      related: ['listnet', 'bpr'],
      papers: [
        {
          title: 'From RankNet to LambdaRank to LambdaMART: An Overview',
          authors: 'C. J. C. Burges',
          year: 2010,
          venue: 'Microsoft Research Tech. Report MSR-TR-2010-82',
          url: 'https://www.microsoft.com/en-us/research/publication/from-ranknet-to-lambdarank-to-lambdamart-an-overview/',
        },
      ],
    },
  ],
  comparison: {
    columns: [
      { key: 'level', label: { ko: '수준', en: 'Level' } },
      { key: 'shape', label: { ko: '틀린 순서 벌점', en: 'Wrong-order penalty' } },
      { key: 'use', label: { ko: '대표 사용처', en: 'Typical use' } },
    ],
    rows: [
      { lossId: 'bpr', cells: { level: { ko: '쌍별', en: 'Pairwise' }, shape: { ko: '부드러움(로그)', en: 'Smooth (log)' }, use: { ko: '암묵 피드백 추천', en: 'Implicit-feedback rec.' } } },
      { lossId: 'pairwise_hinge', cells: { level: { ko: '쌍별', en: 'Pairwise' }, shape: { ko: '마진 후 0', en: 'Zero past margin' }, use: { ko: 'RankSVM', en: 'RankSVM' } } },
      { lossId: 'exp_rank', cells: { level: { ko: '쌍별', en: 'Pairwise' }, shape: { ko: '지수 폭발', en: 'Exponential' }, use: { ko: 'RankBoost', en: 'RankBoost' } } },
      { lossId: 'listnet', cells: { level: { ko: '리스트', en: 'Listwise' }, shape: { ko: '분포 교차엔트로피', en: 'Distribution CE' }, use: { ko: '리스트 문맥 LTR', en: 'List-context LTR' } } },
      { lossId: 'lambdarank', cells: { level: { ko: '리스트(지표)', en: 'List (metric)' }, shape: { ko: 'ΔNDCG 가중', en: 'ΔNDCG-weighted' }, use: { ko: '실전 검색 랭킹', en: 'Production search' } } },
    ],
  },
};
