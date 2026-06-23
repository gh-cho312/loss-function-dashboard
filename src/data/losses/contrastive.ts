import type { TaskDef } from '../types';

export const contrastive: TaskDef = {
  id: 'contrastive',
  emoji: '🧲',
  title: { ko: '대조·메트릭 학습 (Contrastive / Metric)', en: 'Contrastive / Metric Learning' },
  short: { ko: '대조·메트릭', en: 'Contrastive' },
  blurb: {
    ko: '레이블 대신 "닮음/다름"으로 표현을 학습합니다. 같은 것은 가깝게, 다른 것은 멀게. 라벨이 적은 의료영상의 자기지도 사전학습(SimCLR·MoCo)과 영상 검색의 핵심입니다.',
    en: 'Learn representations from "same vs different" instead of labels: pull alike together, push unlike apart. The backbone of self-supervised pretraining (SimCLR, MoCo) for label-scarce medical imaging and of image retrieval.',
  },
  xDomain: { min: -1, max: 1 },
  xLabel: { ko: '양성 쌍 코사인 유사도  s', en: 'positive-pair cosine similarity  s' },
  playgroundNote: {
    ko: 'x축 = 함께 있어야 할 양성 쌍의 유사도 s (높을수록 좋음 → 손실↓). 슬라이더로 음성 유사도 s⁻, 온도 τ, 음성 개수 K, 마진 m을 바꿔보세요. InfoNCE의 τ를 낮추면 곡선이 가팔라지며(대비 강조) 어려운 음성에 민감해집니다.',
    en: 'x = similarity s of a positive pair that should be together (higher is better → lower loss). Sliders set the negative similarity s⁻, temperature τ, number of negatives K, and margin m. Lowering InfoNCE\'s τ steepens the curve (sharper contrast), making it sensitive to hard negatives.',
  },
  losses: [
    {
      id: 'infonce',
      name: 'InfoNCE / NT-Xent',
      oneLiner: {
        ko: '양성 쌍을 여러 음성 사이에서 골라내는 소프트맥스 분류로 표현을 학습.',
        en: 'Learns by classifying the positive pair out of many negatives — a softmax over similarities.',
      },
      formulaTeX:
        'L = -\\log \\frac{\\exp(s^{+}/\\tau)}{\\exp(s^{+}/\\tau) + \\sum_{k=1}^{K}\\exp(s^{-}_k/\\tau)}',
      gradientTeX: '\\frac{\\partial L}{\\partial s^{+}} = \\frac{1}{\\tau}\\,(P^{+} - 1)',
      intuition: {
        ko: '양성을 "정답 클래스"로 두고 음성들과 소프트맥스 분류하는 것과 같습니다. 온도 τ가 작을수록 가장 어려운 음성에 집중(대비 강조). 음성이 많을수록(K↑) 표현이 더 촘촘하게 정렬됩니다. SimCLR의 NT-Xent가 바로 이 형태.',
        en: 'It is a softmax classification with the positive as the "correct class" against the negatives. Smaller temperature τ focuses on the hardest negatives (sharper contrast); more negatives (larger K) align representations more tightly. SimCLR\'s NT-Xent is exactly this form.',
      },
      whenToUse: {
        ko: '대규모 자기지도 사전학습. 라벨 없는 대량의 CT/MRI/병리 영상에서 표현을 미리 학습할 때.',
        en: 'Large-scale self-supervised pretraining — learning representations from large pools of unlabeled CT/MRI/pathology images.',
      },
      pros: [
        { ko: '많은 음성을 한 번에 활용해 강력한 표현 학습.', en: 'Exploits many negatives at once for strong representations.' },
        { ko: '레이블 없이도 작동(자기지도).', en: 'Works without labels (self-supervised).' },
      ],
      cons: [
        { ko: '많은 음성(큰 배치·메모리 뱅크)이 필요.', en: 'Needs many negatives (large batches / memory banks).' },
        { ko: 'τ에 성능이 민감.', en: 'Performance is sensitive to τ.' },
      ],
      related: ['triplet', 'cosine_embedding', 'supcon'],
      params: [
        { key: 'tau', label: { ko: '온도 τ', en: 'temperature τ' }, min: 0.05, max: 1, step: 0.05, default: 0.2 },
        { key: 'kneg', label: { ko: '음성 개수 K', en: 'negatives K' }, min: 1, max: 64, step: 1, default: 8 },
        { key: 'sneg', label: { ko: '음성 유사도 s⁻', en: 'negative sim s⁻' }, min: -1, max: 1, step: 0.05, default: 0 },
      ],
      papers: [
        {
          title: 'Representation Learning with Contrastive Predictive Coding',
          authors: 'A. van den Oord, Y. Li, O. Vinyals',
          year: 2018,
          venue: 'arXiv:1807.03748',
          url: 'https://arxiv.org/abs/1807.03748',
          note: { ko: 'InfoNCE 손실을 정식화.', en: 'Formalized the InfoNCE loss.' },
        },
        {
          title: 'A Simple Framework for Contrastive Learning of Visual Representations (SimCLR)',
          authors: 'T. Chen, S. Kornblith, M. Norouzi, G. Hinton',
          year: 2020,
          venue: 'ICML',
          url: 'https://arxiv.org/abs/2002.05709',
          note: { ko: 'NT-Xent(정규화 온도 교차엔트로피).', en: 'The NT-Xent form.' },
        },
      ],
      profileId: 'infonce',
    },
    {
      id: 'triplet',
      name: 'Triplet Loss',
      oneLiner: {
        ko: '앵커-양성을 앵커-음성보다 마진 m만큼 더 가깝게 만든다.',
        en: 'Forces the anchor–positive to be closer than the anchor–negative by a margin m.',
      },
      formulaTeX: 'L = \\max\\big(0,\\; d(a,p) - d(a,n) + m\\big)',
      gradientTeX: 'd(a,p) - d(a,n) + m > 0 \\;\\Rightarrow\\; \\text{active}',
      intuition: {
        ko: '세 개(앵커·양성·음성)를 비교해, 양성이 음성보다 마진 이상 가까우면 손실 0. 그 안쪽이면 선형으로 벌합니다(플레이그라운드는 유사도 형태 max(0, s⁻+m−s)로 표시). 어떤 삼중쌍을 고르냐(하드 네거티브 마이닝)가 성패를 좌우.',
        en: 'It compares three items (anchor, positive, negative): if the positive is closer than the negative by at least the margin, loss is 0; inside that, a linear penalty (the playground shows the similarity form max(0, s⁻+m−s)). Success hinges on which triplets you mine (hard-negative mining).',
      },
      whenToUse: {
        ko: '얼굴·영상 검색 등 임베딩 학습, 환자/병변 검색. 음성이 적은 상황에서 InfoNCE 대안.',
        en: 'Embedding learning for face/image retrieval, patient/lesion retrieval. An alternative to InfoNCE when negatives are scarce.',
      },
      pros: [
        { ko: '상대적 순서만 강제해 유연.', en: 'Flexible — enforces only relative ordering.' },
        { ko: '직접적인 검색 임베딩에 적합.', en: 'Well-suited to retrieval embeddings.' },
      ],
      cons: [
        { ko: '삼중쌍 선택(마이닝)에 매우 민감.', en: 'Very sensitive to triplet selection (mining).' },
        { ko: '쉬운 삼중쌍은 기울기 0이라 비효율.', en: 'Easy triplets give zero gradient (inefficient).' },
      ],
      related: ['infonce', 'cosine_embedding', 'contrastive_pair'],
      params: [
        { key: 'margin', label: { ko: '마진 m', en: 'margin m' }, min: 0, max: 1, step: 0.05, default: 0.2 },
        { key: 'sneg', label: { ko: '음성 유사도 s⁻', en: 'negative sim s⁻' }, min: -1, max: 1, step: 0.05, default: 0 },
      ],
      papers: [
        {
          title: 'FaceNet: A Unified Embedding for Face Recognition and Clustering',
          authors: 'F. Schroff, D. Kalenichenko, J. Philbin',
          year: 2015,
          venue: 'CVPR',
          url: 'https://arxiv.org/abs/1503.03832',
        },
      ],
      profileId: 'triplet',
    },
    {
      id: 'cosine_embedding',
      name: 'Cosine Embedding (positive)',
      oneLiner: {
        ko: '양성 쌍의 코사인 유사도를 1로 끌어올리는 가장 단순한 정렬 손실.',
        en: 'The simplest alignment loss: pull a positive pair\'s cosine similarity toward 1.',
      },
      formulaTeX: 'L_{+} = 1 - \\cos(x_1, x_2)',
      gradientTeX: '\\frac{\\partial L_{+}}{\\partial s} = -1',
      intuition: {
        ko: '양성 쌍은 (1−s)로 끌어당기고, 음성 쌍은 보통 max(0, s−m)으로 밀어냅니다. 음성을 명시적으로 비교하지 않는 단순 기준선으로, 정렬(alignment)만 볼 때 유용합니다.',
        en: 'Positive pairs are pulled by (1−s); negatives are usually pushed by max(0, s−m). A simple baseline that does not compare many negatives — useful when you only care about alignment.',
      },
      whenToUse: {
        ko: '쌍(pair) 단위 정렬이 필요할 때, 또는 InfoNCE/Triplet의 기준선.',
        en: 'When you need pairwise alignment, or as a baseline against InfoNCE/Triplet.',
      },
      pros: [
        { ko: '단순하고 안정적.', en: 'Simple and stable.' },
        { ko: '음성 샘플링이 필요 없음(양성 항).', en: 'No negative sampling for the positive term.' },
      ],
      cons: [
        { ko: '음성을 함께 다루지 않으면 표현이 붕괴(collapse)할 수 있음.', en: 'Can collapse without negatives.' },
        { ko: '대조 학습만큼 강력하지 않음.', en: 'Less powerful than full contrastive learning.' },
      ],
      related: ['infonce', 'triplet'],
      papers: [
        {
          title: 'Learning a Similarity Metric Discriminatively, with Application to Face Verification',
          authors: 'S. Chopra, R. Hadsell, Y. LeCun',
          year: 2005,
          venue: 'CVPR',
          url: 'https://doi.org/10.1109/CVPR.2005.202',
        },
      ],
      profileId: 'cosine_embedding',
    },
    {
      id: 'contrastive_pair',
      name: 'Contrastive Loss (pairs)',
      oneLiner: {
        ko: '양성 쌍은 거리를 0으로, 음성 쌍은 마진 밖으로 미는 고전적 쌍 손실.',
        en: 'The classic pair loss: drive positive pairs to distance 0, push negatives beyond a margin.',
      },
      formulaTeX: 'L = y\\, d^2 + (1-y)\\,\\max(0,\\; m - d)^2',
      intuition: {
        ko: 'y=1(양성)이면 거리 d를 0으로, y=0(음성)이면 마진 m 밖으로 밀어냅니다. 음성이 이미 m보다 멀면 손실 0. Siamese 네트워크의 원조 손실로, 거리 기반이라 1차원 곡선으로 한 축에 합치기 어려워 설명만 제공합니다.',
        en: 'For y=1 (positive) it pulls distance d to 0; for y=0 (negative) it pushes past margin m (zero loss once a negative is already farther than m). The original Siamese-network loss; being distance-based with two regimes, it is explained rather than plotted.',
      },
      whenToUse: {
        ko: '쌍 라벨(같다/다르다)이 주어진 검증(verification) 문제.',
        en: 'Verification problems with pairwise (same/different) labels.',
      },
      pros: [
        { ko: '개념이 단순하고 해석이 명확.', en: 'Conceptually simple and interpretable.' },
        { ko: '쌍 라벨만 있으면 됨.', en: 'Needs only pairwise labels.' },
      ],
      cons: [
        { ko: '절대 거리·마진 스케일에 민감.', en: 'Sensitive to absolute distance/margin scale.' },
        { ko: 'InfoNCE보다 음성 활용이 비효율적.', en: 'Uses negatives less efficiently than InfoNCE.' },
      ],
      related: ['triplet', 'cosine_embedding'],
      papers: [
        {
          title: 'Dimensionality Reduction by Learning an Invariant Mapping (DrLIM)',
          authors: 'R. Hadsell, S. Chopra, Y. LeCun',
          year: 2006,
          venue: 'CVPR',
          url: 'https://doi.org/10.1109/CVPR.2006.100',
        },
      ],
    },
    {
      id: 'arcface',
      name: 'ArcFace (Additive Angular Margin)',
      oneLiner: {
        ko: '소프트맥스 분류에 각도 마진을 더해 클래스 간 경계를 또렷하게 만든다.',
        en: 'Adds an angular margin to softmax so class boundaries become crisp and well-separated.',
      },
      formulaTeX:
        'L = -\\log \\frac{e^{\\,s\\,\\cos(\\theta_{y}+m)}}{e^{\\,s\\,\\cos(\\theta_{y}+m)} + \\sum_{j\\ne y} e^{\\,s\\,\\cos\\theta_{j}}}',
      intuition: {
        ko: '정답 클래스의 각도 θ_y에 마진 m을 더해, 정답으로 인정받으려면 "더 확실히 가까워야" 하게 만듭니다. 그 결과 클래스가 구(球) 위에서 더 멀리 떨어져 식별력이 커집니다. 다른 클래스 전체가 필요해 1차원 곡선 대신 설명 제공.',
        en: 'It adds a margin m to the true class\'s angle θ_y, so an example must be "even more clearly close" to count as correct. Classes end up farther apart on the hypersphere, improving discriminability. It needs all other classes, so it is explained rather than plotted.',
      },
      whenToUse: {
        ko: '얼굴 인식 등 대규모 식별(identification), 환자/개체 식별 임베딩.',
        en: 'Large-scale identification (face recognition), patient/identity embeddings.',
      },
      pros: [
        { ko: '클래스 간 분리(마진)를 명시적으로 강화.', en: 'Explicitly enforces inter-class separation (margin).' },
        { ko: '소프트맥스 파이프라인에 그대로 얹기 쉬움.', en: 'Drops into a softmax pipeline easily.' },
      ],
      cons: [
        { ko: 'scale s, margin m 튜닝 필요.', en: 'Needs tuning of scale s and margin m.' },
        { ko: '클래스 수가 매우 많으면 비용 큼.', en: 'Costly with very many classes.' },
      ],
      related: ['infonce', 'ce'],
      papers: [
        {
          title: 'ArcFace: Additive Angular Margin Loss for Deep Face Recognition',
          authors: 'J. Deng, J. Guo, N. Xue, S. Zafeiriou',
          year: 2019,
          venue: 'CVPR',
          url: 'https://arxiv.org/abs/1801.07698',
        },
      ],
    },
    {
      id: 'supcon',
      name: 'Supervised Contrastive (SupCon)',
      oneLiner: {
        ko: '라벨을 활용해 같은 클래스의 모든 샘플을 양성으로 끌어당기는 대조 손실.',
        en: 'A contrastive loss that uses labels to pull all same-class samples together as positives.',
      },
      formulaTeX:
        'L = \\sum_{i}\\frac{-1}{|P(i)|}\\sum_{p\\in P(i)} \\log \\frac{\\exp(z_i\\!\\cdot\\! z_p/\\tau)}{\\sum_{a\\ne i}\\exp(z_i\\!\\cdot\\! z_a/\\tau)}',
      intuition: {
        ko: 'InfoNCE를 지도학습으로 확장: 같은 클래스의 여러 샘플을 모두 양성으로 봅니다(P(i)). 자기지도 대조의 표현력과 라벨 정보를 합쳐, 종종 CE보다 강건한 분류 표현을 얻습니다. 다수 양성/음성이 필요해 설명만 제공.',
        en: 'A supervised extension of InfoNCE: all same-class samples count as positives (P(i)). It blends contrastive representation power with label information, often yielding more robust classification features than CE. Needs many positives/negatives, so explained rather than plotted.',
      },
      whenToUse: {
        ko: '라벨이 있는 분류에서 더 강건한 표현이 필요할 때(노이즈·불균형 포함).',
        en: 'Labeled classification where you want more robust features (incl. noise/imbalance).',
      },
      pros: [
        { ko: '라벨 + 대조의 장점 결합.', en: 'Combines labels with contrastive strength.' },
        { ko: 'CE보다 견고한 표현·전이성능.', en: 'Often more robust/transferable than CE.' },
      ],
      cons: [
        { ko: '큰 배치와 2단계(사전학습→분류) 절차.', en: 'Large batches and a two-stage recipe.' },
        { ko: 'τ 민감성은 그대로.', en: 'Inherits τ sensitivity.' },
      ],
      related: ['infonce', 'ce'],
      papers: [
        {
          title: 'Supervised Contrastive Learning',
          authors: 'P. Khosla et al.',
          year: 2020,
          venue: 'NeurIPS',
          url: 'https://arxiv.org/abs/2004.11362',
        },
      ],
    },
  ],
  comparison: {
    columns: [
      { key: 'labels', label: { ko: '필요 신호', en: 'Signal needed' } },
      { key: 'neg', label: { ko: '음성 활용', en: 'Negatives' } },
      { key: 'use', label: { ko: '대표 사용처', en: 'Typical use' } },
    ],
    rows: [
      { lossId: 'infonce', cells: { labels: { ko: '없음(자기지도)', en: 'None (self-sup)' }, neg: { ko: '많이(K)', en: 'Many (K)' }, use: { ko: 'SimCLR/MoCo 사전학습', en: 'SimCLR/MoCo pretraining' } } },
      { lossId: 'triplet', cells: { labels: { ko: '삼중쌍', en: 'Triplets' }, neg: { ko: '1개/스텝', en: 'One per step' }, use: { ko: '검색 임베딩', en: 'Retrieval embeddings' } } },
      { lossId: 'cosine_embedding', cells: { labels: { ko: '쌍', en: 'Pairs' }, neg: { ko: '선택적', en: 'Optional' }, use: { ko: '단순 정렬', en: 'Simple alignment' } } },
      { lossId: 'contrastive_pair', cells: { labels: { ko: '쌍', en: 'Pairs' }, neg: { ko: '마진 기반', en: 'Margin-based' }, use: { ko: '검증(verification)', en: 'Verification' } } },
      { lossId: 'arcface', cells: { labels: { ko: '클래스 라벨', en: 'Class labels' }, neg: { ko: '다른 클래스', en: 'Other classes' }, use: { ko: '대규모 식별', en: 'Large-scale ID' } } },
      { lossId: 'supcon', cells: { labels: { ko: '클래스 라벨', en: 'Class labels' }, neg: { ko: '많이', en: 'Many' }, use: { ko: '강건한 분류 표현', en: 'Robust classifier features' } } },
    ],
  },
};
