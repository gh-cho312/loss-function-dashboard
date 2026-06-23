import type { TaskDef } from '../types';

export const detection: TaskDef = {
  id: 'detection',
  emoji: '🎯',
  title: { ko: '객체검출 (Object Detection)', en: 'Object Detection' },
  short: { ko: '객체검출', en: 'Detection' },
  blurb: {
    ko: '"무엇이, 어디에" — 박스 위치를 회귀하고 클래스를 분류합니다. 의료영상에서는 결절·병변 검출에 쓰이며, 손실은 (1) 박스 좌표 회귀와 (2) 분류(배경 불균형) 두 축으로 나뉩니다.',
    en: '"What and where" — regress a box and classify it. Used for nodule/lesion detection in medical imaging. Its losses split into (1) box-coordinate regression and (2) classification (background imbalance).',
  },
  xDomain: { min: -3, max: 3 },
  xLabel: { ko: '박스 좌표 잔차  r', en: 'box-coordinate residual  r' },
  playgroundNote: {
    ko: '플레이그라운드는 박스 좌표 회귀를 다룹니다(x축 = 좌표 잔차). 큰 잔차(잘못 맞은 박스)에서 L2의 기울기는 폭발해 학습을 불안정하게 만드는 반면, Smooth L1은 ±1로 포화돼 강건합니다 — Fast R-CNN이 Smooth L1을 쓴 이유입니다. IoU 계열(아래)은 2D 박스 기하라 곡선 대신 설명으로 제공합니다.',
    en: 'The playground covers box-coordinate regression (x = coordinate residual). On large residuals (badly placed boxes) L2\'s gradient explodes and destabilizes training, while Smooth L1 saturates to ±1 and stays robust — why Fast R-CNN used Smooth L1. The IoU family (below) lives in 2-D box geometry, so it is explained rather than plotted.',
  },
  losses: [
    {
      id: 'smooth_l1',
      name: 'Smooth L1 (Huber for boxes)',
      oneLiner: {
        ko: '작은 좌표 오차는 L2처럼, 큰 오차는 L1처럼. 박스 회귀의 표준 손실.',
        en: 'L2 for small coordinate errors, L1 for large ones — the standard box-regression loss.',
      },
      formulaTeX:
        '\\text{smooth}_{L_1}(r) = \\begin{cases} \\tfrac{1}{2}r^2/\\beta & |r| < \\beta \\\\ |r| - \\tfrac{1}{2}\\beta & |r| \\ge \\beta \\end{cases}',
      gradientTeX: '\\frac{\\partial L}{\\partial r} = \\operatorname{clip}(r/\\beta,\\,-1,\\,1)',
      intuition: {
        ko: 'Huber와 같은 형태입니다. 초기 학습에서 박스가 크게 틀려도 기울기가 ±1로 묶여 폭주하지 않고, 수렴 근처 작은 오차는 L2처럼 매끄럽게 다듬습니다. β가 전환점.',
        en: 'It is Huber by another name. Early in training, badly placed boxes have gradients capped at ±1 (no blow-up), while near convergence small errors are polished smoothly like L2. β is the switch point.',
      },
      whenToUse: {
        ko: '앵커 기반 검출기(Faster R-CNN, SSD, RetinaNet)의 기본 박스 회귀 손실. 좌표를 직접 회귀할 때.',
        en: 'The default box-regression loss in anchor-based detectors (Faster R-CNN, SSD, RetinaNet) when regressing coordinates directly.',
      },
      pros: [
        { ko: '큰 오차에 강건(기울기 포화).', en: 'Robust to large errors (saturated gradient).' },
        { ko: '0 근처 매끄러워 미세조정 안정적.', en: 'Smooth near 0 for stable fine-tuning.' },
      ],
      cons: [
        { ko: '좌표를 독립적으로 봐서 IoU(겹침)와 직접 정렬되지 않음.', en: 'Treats coordinates independently; not directly aligned with IoU.' },
        { ko: 'β(스케일) 튜닝 필요.', en: 'Needs tuning of β (scale).' },
      ],
      related: ['det_l1', 'det_l2', 'huber', 'iou_loss'],
      params: [
        { key: 'beta', label: { ko: '전환점 β', en: 'switch β' }, min: 0.2, max: 3, step: 0.1, default: 1 },
      ],
      papers: [
        {
          title: 'Fast R-CNN',
          authors: 'R. Girshick',
          year: 2015,
          venue: 'ICCV',
          url: 'https://arxiv.org/abs/1504.08083',
          note: { ko: '검출 박스 회귀에 Smooth L1 도입.', en: 'Introduced Smooth L1 for detection box regression.' },
        },
      ],
      profileId: 'smooth_l1',
    },
    {
      id: 'det_l1',
      name: 'L1 (box)',
      oneLiner: {
        ko: '좌표 오차의 절댓값. 이상치에 강건하지만 0에서 꺾인다.',
        en: 'Absolute coordinate error — robust to outliers but kinked at 0.',
      },
      formulaTeX: 'L = |r|',
      gradientTeX: '\\frac{\\partial L}{\\partial r} = \\operatorname{sign}(r)',
      intuition: {
        ko: '기울기 크기가 항상 1이라 큰 오차에 폭주하지 않습니다. DETR 등 일부 최신 검출기는 L1을 GIoU와 결합해 씁니다.',
        en: 'Constant unit-magnitude gradient never blows up on large errors. Modern detectors like DETR combine L1 with GIoU.',
      },
      whenToUse: {
        ko: 'IoU 계열 손실과 결합하는 좌표 회귀 항으로 자주 사용(예: DETR = L1 + GIoU).',
        en: 'Often the coordinate term paired with an IoU-family loss (e.g., DETR = L1 + GIoU).',
      },
      pros: [{ ko: '이상치에 강건.', en: 'Robust to outliers.' }, { ko: '단순.', en: 'Simple.' }],
      cons: [
        { ko: '0에서 미분 불가.', en: 'Non-differentiable at 0.' },
        { ko: '작은 오차도 같은 기울기.', en: 'Same gradient for small errors.' },
      ],
      related: ['smooth_l1', 'det_l2', 'mae'],
      papers: [
        {
          title: 'End-to-End Object Detection with Transformers (DETR)',
          authors: 'N. Carion et al.',
          year: 2020,
          venue: 'ECCV',
          url: 'https://arxiv.org/abs/2005.12872',
          note: { ko: 'L1 + GIoU 박스 손실 사용.', en: 'Uses an L1 + GIoU box loss.' },
        },
      ],
      profileId: 'det_l1',
    },
    {
      id: 'det_l2',
      name: 'L2 (box)',
      oneLiner: {
        ko: '좌표 오차의 제곱. 큰 오차에서 기울기가 폭발해 검출에는 잘 안 쓴다.',
        en: 'Squared coordinate error — gradient explodes on large errors, so rarely used for detection.',
      },
      formulaTeX: 'L = \\tfrac{1}{2}r^2',
      gradientTeX: '\\frac{\\partial L}{\\partial r} = r',
      intuition: {
        ko: '기울기가 잔차에 비례해, 초기의 크게 틀린 박스가 학습을 지배하고 불안정하게 만듭니다. Smooth L1이 등장한 이유를 보여주는 대조군.',
        en: 'Gradient grows with the residual, so early badly-placed boxes dominate and destabilize training — the foil that motivated Smooth L1.',
      },
      whenToUse: {
        ko: '검출 박스 회귀에는 비권장(대조용). 잔차가 작게 보장될 때만.',
        en: 'Not recommended for detection box regression (shown for contrast); only when residuals are guaranteed small.',
      },
      pros: [{ ko: '전 구간 매끄러움.', en: 'Smooth everywhere.' }],
      cons: [
        { ko: '큰 오차에 매우 민감(기울기 폭발).', en: 'Very sensitive to large errors (exploding gradient).' },
      ],
      related: ['smooth_l1', 'det_l1', 'mse'],
      papers: [
        {
          title: 'Pattern Recognition and Machine Learning',
          authors: 'C. M. Bishop',
          year: 2006,
          venue: 'Springer',
        },
      ],
      profileId: 'det_l2',
    },
    {
      id: 'iou_loss',
      name: 'IoU Loss',
      oneLiner: {
        ko: '좌표가 아니라 박스 겹침(IoU) 자체를 최대화한다.',
        en: 'Maximizes box overlap (IoU) directly instead of coordinates.',
      },
      formulaTeX: 'L_{\\text{IoU}} = 1 - \\text{IoU} = 1 - \\frac{|B \\cap B^{gt}|}{|B \\cup B^{gt}|}',
      intuition: {
        ko: '네 좌표를 따로 회귀하는 대신 최종 평가지표(IoU)를 직접 최적화해, 스케일에 불변이고 박스를 하나의 단위로 다룹니다. 단, 두 박스가 겹치지 않으면 IoU=0이라 기울기가 사라지는 약점(→ GIoU). 2D 기하라 곡선 대신 설명으로 제공.',
        en: 'Instead of regressing four coordinates separately, it optimizes the evaluation metric (IoU) directly — scale-invariant and treating the box as one unit. But if boxes do not overlap, IoU=0 gives no gradient (→ GIoU). It is 2-D geometry, so explained rather than plotted.',
      },
      whenToUse: {
        ko: 'IoU 평가와 정렬된 박스 회귀가 필요할 때. 보통 GIoU/DIoU/CIoU 같은 개선형으로 사용.',
        en: 'When you want box regression aligned with the IoU metric; usually via the improved GIoU/DIoU/CIoU variants.',
      },
      pros: [
        { ko: '평가지표(IoU)와 직접 정렬, 스케일 불변.', en: 'Directly aligned with IoU; scale-invariant.' },
        { ko: '박스를 하나의 단위로 최적화.', en: 'Optimizes the box as a single unit.' },
      ],
      cons: [
        { ko: '겹치지 않는 박스에서 기울기 소실.', en: 'Vanishing gradient for non-overlapping boxes.' },
      ],
      related: ['giou', 'diou_ciou', 'smooth_l1'],
      papers: [
        {
          title: 'UnitBox: An Advanced Object Detection Network',
          authors: 'J. Yu, Y. Jiang, Z. Wang, Z. Cao, T. Huang',
          year: 2016,
          venue: 'ACM Multimedia',
          url: 'https://arxiv.org/abs/1608.01471',
        },
      ],
    },
    {
      id: 'giou',
      name: 'GIoU Loss',
      oneLiner: {
        ko: '두 박스를 감싸는 최소 박스를 이용해, 겹치지 않을 때도 기울기를 준다.',
        en: 'Uses the smallest enclosing box to give a gradient even when boxes do not overlap.',
      },
      formulaTeX: 'L_{\\text{GIoU}} = 1 - \\text{IoU} + \\frac{|C \\setminus (B \\cup B^{gt})|}{|C|}',
      intuition: {
        ko: 'C는 두 박스를 모두 감싸는 최소 박스입니다. 겹침이 0이어도 "얼마나 떨어졌는지"를 C로 측정해 박스를 끌어당깁니다. IoU 손실의 기울기 소실 문제를 해결.',
        en: 'C is the smallest box enclosing both. Even with zero overlap, it measures "how far apart" via C and pulls boxes together, fixing IoU loss\'s vanishing gradient.',
      },
      whenToUse: {
        ko: '비겹침 박스가 흔한 1단계 검출/트랜스포머 검출기의 박스 손실.',
        en: 'Box loss for one-stage / transformer detectors where non-overlapping boxes are common.',
      },
      pros: [
        { ko: '비겹침에서도 학습 신호 제공.', en: 'Provides a signal even without overlap.' },
        { ko: 'IoU의 장점은 유지.', en: 'Keeps IoU\'s advantages.' },
      ],
      cons: [
        { ko: '포함 관계 등 일부 경우 수렴이 느림(→ DIoU).', en: 'Slow convergence in some enclosed cases (→ DIoU).' },
      ],
      related: ['iou_loss', 'diou_ciou'],
      papers: [
        {
          title: 'Generalized Intersection over Union: A Metric and A Loss for Bounding Box Regression',
          authors: 'H. Rezatofighi et al.',
          year: 2019,
          venue: 'CVPR',
          url: 'https://arxiv.org/abs/1902.09630',
        },
      ],
    },
    {
      id: 'diou_ciou',
      name: 'DIoU / CIoU Loss',
      oneLiner: {
        ko: '중심 거리(DIoU)와 종횡비(CIoU)까지 벌해 더 빠르고 정확하게 수렴한다.',
        en: 'Adds center-distance (DIoU) and aspect-ratio (CIoU) penalties for faster, better convergence.',
      },
      formulaTeX:
        'L_{\\text{DIoU}} = 1 - \\text{IoU} + \\frac{\\rho^2(b,b^{gt})}{c^2}, \\quad L_{\\text{CIoU}} = L_{\\text{DIoU}} + \\alpha v',
      intuition: {
        ko: 'ρ는 두 박스 중심 간 거리, c는 감싸는 박스의 대각선입니다. DIoU는 중심을 바로 끌어당기고, CIoU는 종횡비 일치 항 v까지 더합니다. YOLO 계열의 기본 박스 손실로 널리 채택.',
        en: 'ρ is the distance between box centers, c the enclosing diagonal. DIoU pulls centers together directly; CIoU adds an aspect-ratio term v. Widely adopted as the default box loss in the YOLO family.',
      },
      whenToUse: {
        ko: '빠른 수렴과 정확한 박스가 중요할 때(YOLOv4+ 등). GIoU보다 일반적으로 우수.',
        en: 'When you want fast convergence and precise boxes (YOLOv4+); generally outperforms GIoU.',
      },
      pros: [
        { ko: '수렴이 빠르고 박스 품질이 높음.', en: 'Faster convergence, higher box quality.' },
        { ko: '중심·종횡비를 명시적으로 정렬.', en: 'Explicitly aligns center and aspect ratio.' },
      ],
      cons: [
        { ko: '항이 늘어 구현이 약간 복잡.', en: 'More terms, slightly more complex.' },
      ],
      related: ['giou', 'iou_loss'],
      papers: [
        {
          title: 'Distance-IoU Loss: Faster and Better Learning for Bounding Box Regression',
          authors: 'Z. Zheng et al.',
          year: 2020,
          venue: 'AAAI',
          url: 'https://arxiv.org/abs/1911.08287',
        },
      ],
    },
    {
      id: 'focal_det',
      name: 'Focal Loss (classification head)',
      oneLiner: {
        ko: '1단계 검출기의 분류 헤드에서 압도적 배경 앵커를 눌러주는 손실.',
        en: 'Tames the overwhelming background anchors in a one-stage detector\'s classification head.',
      },
      formulaTeX: 'L_{\\text{focal}} = -\\alpha_t (1-p_t)^{\\gamma}\\log p_t',
      intuition: {
        ko: '검출에서는 배경(음성) 앵커가 전경보다 수천 배 많습니다. Focal이 쉬운 배경의 손실을 (1−p)^γ로 눌러 드문 전경에 집중하게 합니다. 분류 손실이므로 자세한 곡선은 분류 탭의 Focal에서 직접 만져보세요.',
        en: 'In detection, background (negative) anchors outnumber foreground by thousands to one. Focal suppresses easy background via (1−p)^γ so learning concentrates on rare foreground. It is a classification loss — play with its curve under the Classification tab.',
      },
      whenToUse: {
        ko: 'RetinaNet 등 1단계 검출기. 의료영상의 작은 결절/병변 검출에서 특히 유용.',
        en: 'One-stage detectors like RetinaNet; especially useful for small nodule/lesion detection in medical imaging.',
      },
      pros: [
        { ko: '극심한 배경 불균형을 손실 수준에서 해결.', en: 'Solves extreme background imbalance at the loss level.' },
        { ko: '하드 네거티브 마이닝을 대체.', en: 'Replaces hard-negative mining.' },
      ],
      cons: [
        { ko: 'γ, α 튜닝 필요.', en: 'Needs tuning of γ, α.' },
      ],
      related: ['focal', 'smooth_l1'],
      papers: [
        {
          title: 'Focal Loss for Dense Object Detection',
          authors: 'T.-Y. Lin, P. Goyal, R. Girshick, K. He, P. Dollár',
          year: 2017,
          venue: 'ICCV',
          url: 'https://arxiv.org/abs/1708.02002',
        },
      ],
    },
  ],
  comparison: {
    columns: [
      { key: 'target', label: { ko: '대상', en: 'Target' } },
      { key: 'robust', label: { ko: '강건성/특징', en: 'Robustness / trait' } },
      { key: 'use', label: { ko: '대표 사용처', en: 'Typical use' } },
    ],
    rows: [
      { lossId: 'smooth_l1', cells: { target: { ko: '좌표', en: 'Coordinates' }, robust: { ko: '강건(포화)', en: 'Robust (saturating)' }, use: { ko: 'Faster R-CNN, SSD', en: 'Faster R-CNN, SSD' } } },
      { lossId: 'det_l1', cells: { target: { ko: '좌표', en: 'Coordinates' }, robust: { ko: '강건, 0서 꺾임', en: 'Robust, kink at 0' }, use: { ko: 'DETR(+GIoU)', en: 'DETR (+GIoU)' } } },
      { lossId: 'det_l2', cells: { target: { ko: '좌표', en: 'Coordinates' }, robust: { ko: '약함(폭발)', en: 'Weak (explodes)' }, use: { ko: '대조용', en: 'Baseline only' } } },
      { lossId: 'iou_loss', cells: { target: { ko: '겹침(IoU)', en: 'Overlap (IoU)' }, robust: { ko: '비겹침서 소실', en: 'Vanishes if disjoint' }, use: { ko: 'UnitBox', en: 'UnitBox' } } },
      { lossId: 'giou', cells: { target: { ko: '겹침+거리', en: 'Overlap + distance' }, robust: { ko: '비겹침 해결', en: 'Fixes disjoint' }, use: { ko: 'DETR, 1단계', en: 'DETR, one-stage' } } },
      { lossId: 'diou_ciou', cells: { target: { ko: '겹침+중심+비율', en: 'Overlap+center+ratio' }, robust: { ko: '빠른 수렴', en: 'Fast convergence' }, use: { ko: 'YOLOv4+', en: 'YOLOv4+' } } },
      { lossId: 'focal_det', cells: { target: { ko: '분류', en: 'Classification' }, robust: { ko: '배경 불균형 처리', en: 'Handles bg imbalance' }, use: { ko: 'RetinaNet', en: 'RetinaNet' } } },
    ],
  },
};
