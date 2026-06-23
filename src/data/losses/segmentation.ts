import type { TaskDef } from '../types';

export const segmentation: TaskDef = {
  id: 'segmentation',
  emoji: '🧩',
  title: { ko: '세그멘테이션 (Segmentation)', en: 'Segmentation' },
  short: { ko: '세그멘테이션', en: 'Segmentation' },
  blurb: {
    ko: '픽셀(복셀)마다 클래스를 매기는 문제 — 장기·종양·병변의 경계를 그립니다. 전경이 전체의 1%도 안 되는 극심한 불균형이 흔해, 겹침 기반(Dice·IoU·Tversky) 손실이 표준이 되었습니다.',
    en: 'Label every pixel (voxel) — delineating organs, tumors, lesions. Foreground is often <1% of the image, so this extreme imbalance is why overlap-based losses (Dice, IoU, Tversky) became the standard.',
  },
  xDomain: { min: 0.02, max: 1 },
  xLabel: { ko: '재현율 recall = 정답 영역 커버리지', en: 'recall = fraction of ground truth covered' },
  playgroundNote: {
    ko: '단순화 모델: 정답 영역 크기를 1로 두고 x축 = 재현율(맞춘 전경 비율 TP), 슬라이더 φ = 거짓양성(FP) 수준입니다. 손실 = 1 − 겹침지수. Tversky의 α(FP 가중)·β(FN 가중)를 움직여, β를 키우면 놓친 병변(FN)을 더 세게 벌해 손실이 가팔라지는 걸 보세요 — 의료에서 "놓치지 않기"가 중요할 때의 설정입니다.',
    en: 'Simplified model: ground-truth size = 1, x-axis = recall (covered foreground TP), slider φ = false-positive (FP) level. Loss = 1 − overlap index. Move Tversky\'s α (FP weight) and β (FN weight): raising β penalizes missed lesions (FN) harder, steepening the loss — the setting for "don\'t miss it" in medicine.',
  },
  losses: [
    {
      id: 'dice',
      name: 'Dice Loss (Soft Dice)',
      oneLiner: {
        ko: '예측과 정답의 겹침(Dice 계수)을 직접 최대화. 전경이 작아도 잘 작동하는 세그멘테이션의 표준.',
        en: 'Directly maximizes overlap (the Dice coefficient) — the segmentation standard that works even when foreground is tiny.',
      },
      formulaTeX:
        'L_{\\text{Dice}} = 1 - \\frac{2\\sum_i p_i g_i + \\epsilon}{\\sum_i p_i + \\sum_i g_i + \\epsilon}',
      intuition: {
        ko: '분자·분모 모두 전경 픽셀 수에 비례하므로, 배경이 아무리 많아도 손실이 배경에 휘둘리지 않습니다(자체 정규화). 그래서 불균형에 강합니다. 다만 전경이 거의 없을 때 기울기가 불안정할 수 있습니다.',
        en: 'Both numerator and denominator scale with the number of foreground pixels, so the loss is not swamped by background, however large it is (self-normalizing). That is why it handles imbalance well — though gradients can be unstable when foreground is nearly absent.',
      },
      whenToUse: {
        ko: '거의 모든 의료영상 세그멘테이션의 기본. 보통 CE와 합쳐(Combo) 안정성을 더합니다.',
        en: 'The default for almost all medical-image segmentation. Usually combined with CE (Combo) for stability.',
      },
      pros: [
        { ko: '극심한 전경/배경 불균형에 강건(자체 정규화).', en: 'Robust to extreme fg/bg imbalance (self-normalizing).' },
        { ko: '평가지표(Dice)와 학습 목표가 직접 일치.', en: 'Directly aligns the training objective with the Dice metric.' },
      ],
      cons: [
        { ko: '아주 작은 객체에서 기울기가 불안정/노이지.', en: 'Noisy, unstable gradients for very small objects.' },
        { ko: 'FP와 FN을 대칭으로 다뤄 임상적 비대칭을 반영 못 함(→ Tversky).', en: 'Treats FP and FN symmetrically, ignoring clinical asymmetry (→ Tversky).' },
      ],
      related: ['iou', 'tversky', 'combo', 'focal_tversky'],
      params: [
        { key: 'phi', label: { ko: '거짓양성 φ', en: 'false-positive φ' }, min: 0, max: 1, step: 0.05, default: 0.2 },
      ],
      papers: [
        {
          title: 'V-Net: Fully Convolutional Neural Networks for Volumetric Medical Image Segmentation',
          authors: 'F. Milletari, N. Navab, S.-A. Ahmadi',
          year: 2016,
          venue: '3DV',
          url: 'https://arxiv.org/abs/1606.04797',
          note: { ko: '미분 가능한 Soft Dice 손실을 대중화.', en: 'Popularized the differentiable soft Dice loss.' },
        },
        {
          title: 'Generalised Dice overlap as a deep learning loss function for highly unbalanced segmentations',
          authors: 'C. Sudre, W. Li, T. Vercauteren, S. Ourselin, M. J. Cardoso',
          year: 2017,
          venue: 'DLMIA (MICCAI)',
          url: 'https://arxiv.org/abs/1707.03237',
        },
      ],
      profileId: 'dice',
    },
    {
      id: 'iou',
      name: 'IoU / Jaccard Loss',
      oneLiner: {
        ko: '교집합/합집합(Jaccard)을 최대화. Dice와 친척이지만 겹침을 더 엄격하게 본다.',
        en: 'Maximizes intersection-over-union (Jaccard) — a cousin of Dice that judges overlap more strictly.',
      },
      formulaTeX:
        'L_{\\text{IoU}} = 1 - \\frac{\\sum_i p_i g_i}{\\sum_i p_i + \\sum_i g_i - \\sum_i p_i g_i}',
      intuition: {
        ko: 'IoU와 Dice는 단조 관계(IoU = Dice/(2−Dice))라 순위는 비슷하지만, IoU가 부분적 겹침을 더 가혹하게 벌합니다. 평가를 IoU로 한다면 학습도 IoU로 맞추는 게 일관적입니다.',
        en: 'IoU and Dice are monotonically related (IoU = Dice/(2−Dice)) so they rank similarly, but IoU penalizes partial overlap more harshly. If you evaluate with IoU, training on IoU keeps objective and metric aligned.',
      },
      whenToUse: {
        ko: '평가지표가 IoU일 때, 또는 Dice보다 엄격한 겹침이 필요할 때. Lovász-Softmax는 IoU의 미분 가능한 대리 손실로 자주 쓰임.',
        en: 'When the metric is IoU, or you want stricter overlap than Dice. Lovász-Softmax is a popular differentiable surrogate for IoU.',
      },
      pros: [
        { ko: 'IoU 평가지표와 직접 정렬.', en: 'Directly aligned with the IoU metric.' },
        { ko: 'Dice처럼 불균형에 강건.', en: 'Robust to imbalance, like Dice.' },
      ],
      cons: [
        { ko: 'Dice보다 기울기가 더 평평해 학습이 느릴 수 있음.', en: 'Flatter gradients than Dice can slow learning.' },
        { ko: '소프트 형태의 직접 최적화는 까다로움(→ Lovász).', en: 'Direct soft optimization is tricky (→ Lovász).' },
      ],
      related: ['dice', 'tversky'],
      params: [
        { key: 'phi', label: { ko: '거짓양성 φ', en: 'false-positive φ' }, min: 0, max: 1, step: 0.05, default: 0.2 },
      ],
      papers: [
        {
          title: 'Optimizing Intersection-Over-Union in Deep Neural Networks for Image Segmentation',
          authors: 'M. A. Rahman, Y. Wang',
          year: 2016,
          venue: 'ISVC',
          url: 'https://doi.org/10.1007/978-3-319-50835-1_22',
        },
        {
          title: 'The Lovász-Softmax loss: A tractable surrogate for the optimization of the IoU measure',
          authors: 'M. Berman, A. R. Triki, M. B. Blaschko',
          year: 2018,
          venue: 'CVPR',
          url: 'https://arxiv.org/abs/1705.08790',
        },
      ],
      profileId: 'iou',
    },
    {
      id: 'tversky',
      name: 'Tversky Loss',
      oneLiner: {
        ko: 'Dice를 일반화해 거짓양성(α)과 거짓음성(β)에 다른 가중치를 줄 수 있다.',
        en: 'Generalizes Dice with separate weights for false positives (α) and false negatives (β).',
      },
      formulaTeX:
        'L_{T} = 1 - \\frac{TP}{TP + \\alpha\\,FP + \\beta\\,FN}',
      intuition: {
        ko: 'α=β=0.5면 정확히 Dice입니다. β>α로 두면 놓친 전경(FN)을 더 크게 벌해 모델이 더 적극적으로(높은 재현율) 분할하도록 유도합니다. 병변을 놓치면 안 되는 의료 상황의 핵심 조절기.',
        en: 'At α=β=0.5 it is exactly Dice. Setting β>α penalizes missed foreground (FN) more, pushing the model to segment more aggressively (higher recall). The key knob when missing a lesion is unacceptable.',
      },
      whenToUse: {
        ko: '재현율과 정밀도의 균형을 임상 비용에 맞춰 조정할 때. 작은/드문 병변에서 FN을 줄이고 싶을 때.',
        en: 'When you need to tilt the precision/recall balance toward clinical cost — e.g., reducing FN on small/rare lesions.',
      },
      pros: [
        { ko: 'FP/FN 비대칭을 직접 제어.', en: 'Directly controls the FP/FN asymmetry.' },
        { ko: 'Dice를 포함하는 일반화(특수경우 호환).', en: 'Generalizes Dice (Dice is a special case).' },
      ],
      cons: [
        { ko: 'α, β 두 값 튜닝 필요, 과하면 FP 폭증.', en: 'Two params to tune; too aggressive and FP explodes.' },
        { ko: '여전히 경계 정확도 자체는 직접 다루지 않음.', en: 'Still does not directly address boundary accuracy.' },
      ],
      related: ['dice', 'focal_tversky', 'iou'],
      params: [
        { key: 'phi', label: { ko: '거짓양성 φ', en: 'false-positive φ' }, min: 0, max: 1, step: 0.05, default: 0.2 },
        { key: 'alpha', label: { ko: 'FP 가중 α', en: 'FP weight α' }, min: 0, max: 1, step: 0.05, default: 0.3 },
        { key: 'beta', label: { ko: 'FN 가중 β', en: 'FN weight β' }, min: 0, max: 1, step: 0.05, default: 0.7 },
      ],
      papers: [
        {
          title: 'Tversky loss function for image segmentation using 3D fully convolutional deep networks',
          authors: 'S. S. M. Salehi, D. Erdogmus, A. Gholipour',
          year: 2017,
          venue: 'MLMI (MICCAI)',
          url: 'https://arxiv.org/abs/1706.05721',
        },
      ],
      profileId: 'tversky',
    },
    {
      id: 'focal_tversky',
      name: 'Focal Tversky Loss',
      oneLiner: {
        ko: 'Tversky에 (1−TI)^γ를 씌워, 잘 안 되는 어려운 영역에 학습을 집중시킨다.',
        en: 'Raises Tversky to (1−TI)^γ to focus learning on hard, poorly-segmented regions.',
      },
      formulaTeX: 'L_{FT} = (1 - TI)^{\\gamma},\\qquad TI = \\frac{TP}{TP + \\alpha FP + \\beta FN}',
      intuition: {
        ko: 'Tversky 지수 TI가 높은(이미 잘 맞춘) 영역은 (1−TI)^γ가 작아 손실 기여가 줄고, 잘 못 맞춘 작은 병변에 집중됩니다. Focal Loss의 아이디어를 겹침 손실에 옮긴 것. γ>1이면 집중, γ<1이면 완화.',
        en: 'Regions with high TI (already well-segmented) get a small (1−TI)^γ and contribute less, so learning concentrates on poorly-segmented small lesions. It ports Focal\'s idea to overlap losses. γ>1 focuses, γ<1 relaxes.',
      },
      whenToUse: {
        ko: '작고 드문 병변 분할에서 Dice/Tversky가 큰 구조에 편향될 때. Attention U-Net 등과 결합해 ISBI에서 제안됨.',
        en: 'Small/rare-lesion segmentation where Dice/Tversky bias toward large structures. Proposed with Attention U-Net.',
      },
      pros: [
        { ko: '어려운 소수 영역에 학습 집중.', en: 'Concentrates learning on hard, minority regions.' },
        { ko: 'Tversky의 FP/FN 제어를 그대로 계승.', en: 'Inherits Tversky\'s FP/FN control.' },
      ],
      cons: [
        { ko: 'α, β, γ 세 하이퍼파라미터.', en: 'Three hyperparameters (α, β, γ).' },
        { ko: 'γ가 크면 학습이 불안정해질 수 있음.', en: 'Large γ can destabilize training.' },
      ],
      related: ['tversky', 'dice', 'focal'],
      params: [
        { key: 'phi', label: { ko: '거짓양성 φ', en: 'false-positive φ' }, min: 0, max: 1, step: 0.05, default: 0.2 },
        { key: 'alpha', label: { ko: 'FP 가중 α', en: 'FP weight α' }, min: 0, max: 1, step: 0.05, default: 0.3 },
        { key: 'beta', label: { ko: 'FN 가중 β', en: 'FN weight β' }, min: 0, max: 1, step: 0.05, default: 0.7 },
        { key: 'gamma', label: { ko: '집중 계수 γ', en: 'focusing γ' }, min: 0.5, max: 3, step: 0.1, default: 1.33 },
      ],
      papers: [
        {
          title: 'A Novel Focal Tversky Loss Function with Improved Attention U-Net for Lesion Segmentation',
          authors: 'N. Abraham, N. M. Khan',
          year: 2019,
          venue: 'ISBI',
          url: 'https://arxiv.org/abs/1810.07842',
        },
      ],
      profileId: 'focal_tversky',
    },
    {
      id: 'combo',
      name: 'Combo Loss (Dice + CE)',
      oneLiner: {
        ko: 'Dice의 불균형 강건성과 CE의 안정적 기울기를 가중합으로 합친다.',
        en: 'A weighted sum of Dice (imbalance-robust) and CE (stable gradients).',
      },
      formulaTeX: 'L = L_{\\text{Dice}} + \\lambda\\, L_{\\text{CE}}',
      intuition: {
        ko: 'Dice가 작은 전경에서 기울기를 잃을 때 CE 항이 픽셀별로 안정적인 기울기를 공급합니다. λ로 둘의 비중을 조절. 실무에서 가장 널리 쓰이는 조합 중 하나입니다. (플레이그라운드는 CE 항을 재현율의 −log로 근사)',
        en: 'When Dice loses gradient on tiny foreground, the CE term supplies stable per-pixel gradients. λ tunes their balance. One of the most widely used combinations in practice. (The playground approximates the CE term as −log of recall.)',
      },
      whenToUse: {
        ko: 'Dice 단독이 불안정하거나 수렴이 느릴 때의 안전한 기본 선택. nnU-Net 등 강력한 파이프라인의 기본 손실.',
        en: 'A safe default when Dice alone is unstable or slow. The default loss in strong pipelines such as nnU-Net (Dice + CE).',
      },
      pros: [
        { ko: '안정성과 불균형 강건성을 동시에.', en: 'Stability and imbalance-robustness together.' },
        { ko: '실전에서 검증된 견고한 기본값.', en: 'A battle-tested, robust default.' },
      ],
      cons: [
        { ko: 'λ(또는 CE 가중) 튜닝 필요.', en: 'Needs tuning of λ (or the CE weight).' },
        { ko: '두 항의 스케일 차이를 신경 써야.', en: 'Must watch the scale mismatch between terms.' },
      ],
      related: ['dice', 'ce', 'tversky'],
      params: [
        { key: 'phi', label: { ko: '거짓양성 φ', en: 'false-positive φ' }, min: 0, max: 1, step: 0.05, default: 0.2 },
        { key: 'lam', label: { ko: 'CE 가중 λ', en: 'CE weight λ' }, min: 0, max: 2, step: 0.1, default: 0.5 },
      ],
      papers: [
        {
          title: 'Combo Loss: Handling Input and Output Imbalance in Multi-Organ Segmentation',
          authors: 'S. A. Taghanaki et al.',
          year: 2019,
          venue: 'Computerized Medical Imaging and Graphics',
          url: 'https://arxiv.org/abs/1805.02798',
        },
      ],
      profileId: 'combo',
    },
    {
      id: 'boundary',
      name: 'Boundary Loss',
      oneLiner: {
        ko: '영역이 아니라 경계까지의 거리를 벌해, 가느다란/작은 구조의 경계를 살린다.',
        en: 'Penalizes distance to the boundary rather than region overlap, preserving thin/small structures.',
      },
      formulaTeX:
        'L_{B} = \\int_{\\Omega} \\phi_{G}(q)\\, s_{\\theta}(q)\\, dq',
      intuition: {
        ko: '정답 경계로부터의 부호화 거리(level-set) φ_G로 예측을 가중해, 경계에서 멀리 틀릴수록 더 크게 벌합니다. 겹침 손실이 무시하기 쉬운 얇은 경계·소형 구조에 강합니다. 보통 Dice와 함께(시간에 따라 비중 조절) 사용. 1차원 곡선으로 단순화하기 어려워 설명만 제공합니다.',
        en: 'It weights the prediction by the signed distance (level-set) φ_G to the true boundary, so errors far from the boundary cost more. Strong for thin boundaries and small structures that overlap losses ignore. Usually paired with Dice (with a scheduled weight). It does not reduce to a 1-D curve, so only the explanation is shown.',
      },
      whenToUse: {
        ko: '극심한 불균형 + 경계 정확도가 중요한 경우(혈관·종양 경계 등). 단독보다 Dice와 결합 권장.',
        en: 'Extreme imbalance where boundary accuracy matters (vessels, tumor margins). Recommended combined with Dice rather than alone.',
      },
      pros: [
        { ko: '경계 품질을 직접 개선(거리 기반).', en: 'Directly improves boundary quality (distance-based).' },
        { ko: '매우 불균형한 분할에서 효과적.', en: 'Effective on highly unbalanced segmentation.' },
      ],
      cons: [
        { ko: '거리 변환 계산이 필요하고 단독 사용은 불안정.', en: 'Requires distance transforms; unstable on its own.' },
        { ko: '구현·스케줄링이 까다로움.', en: 'Trickier to implement and schedule.' },
      ],
      related: ['dice', 'tversky'],
      papers: [
        {
          title: 'Boundary loss for highly unbalanced segmentation',
          authors: 'H. Kervadec, J. Bouchtiba, C. Desrosiers, É. Granger, J. Dolz, I. Ben Ayed',
          year: 2019,
          venue: 'MIDL (extended in Medical Image Analysis 2021)',
          url: 'https://arxiv.org/abs/1812.07032',
        },
      ],
      // Learn-only: distance-based, not reducible to the 1-D recall axis.
    },
  ],
  comparison: {
    columns: [
      { key: 'imb', label: { ko: '불균형 강건성', en: 'Imbalance' } },
      { key: 'control', label: { ko: '제어 가능한 것', en: 'What you control' } },
      { key: 'boundary', label: { ko: '경계 정확도', en: 'Boundary' } },
    ],
    rows: [
      { lossId: 'dice', cells: { imb: { ko: '강함', en: 'Strong' }, control: { ko: '—', en: '—' }, boundary: { ko: '간접', en: 'Indirect' } } },
      { lossId: 'iou', cells: { imb: { ko: '강함', en: 'Strong' }, control: { ko: '—', en: '—' }, boundary: { ko: '간접', en: 'Indirect' } } },
      { lossId: 'tversky', cells: { imb: { ko: '강함', en: 'Strong' }, control: { ko: 'FP/FN 균형(α,β)', en: 'FP/FN balance (α,β)' }, boundary: { ko: '간접', en: 'Indirect' } } },
      { lossId: 'focal_tversky', cells: { imb: { ko: '매우 강함', en: 'Very strong' }, control: { ko: 'FP/FN + 어려움 집중', en: 'FP/FN + hard focus' }, boundary: { ko: '간접', en: 'Indirect' } } },
      { lossId: 'combo', cells: { imb: { ko: '강함 + 안정', en: 'Strong + stable' }, control: { ko: 'Dice/CE 비중(λ)', en: 'Dice/CE mix (λ)' }, boundary: { ko: '간접', en: 'Indirect' } } },
      { lossId: 'boundary', cells: { imb: { ko: '강함', en: 'Strong' }, control: { ko: '경계 거리', en: 'Boundary distance' }, boundary: { ko: '직접', en: 'Direct' } } },
    ],
  },
};
