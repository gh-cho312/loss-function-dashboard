import type { TaskDef } from '../types';

export const regression: TaskDef = {
  id: 'regression',
  emoji: '📈',
  title: { ko: '회귀 (Regression)', en: 'Regression' },
  short: { ko: '회귀', en: 'Regression' },
  blurb: {
    ko: '연속값을 예측하는 문제. 의료영상에서는 골연령 추정, 병변 크기·부피 측정, 영상-영상 변환(잡음 제거·복원)의 픽셀 회귀 등에 쓰입니다. 핵심은 "이상치(outlier)에 얼마나 민감하게 만들 것인가"입니다.',
    en: 'Predict a continuous value. In medical imaging this covers bone-age estimation, lesion size/volume, and pixel-wise regression for image-to-image tasks (denoising, reconstruction). The key knob is how sensitive to outliers you want to be.',
  },
  xDomain: { min: -3, max: 3 },
  xLabel: { ko: '잔차  r = ŷ − y', en: 'residual  r = ŷ − y' },
  playgroundNote: {
    ko: 'x축은 잔차(예측−정답)입니다. r=0에서 손실 0이 이상적. 기울기 곡선을 켜고, 큰 잔차(이상치)에서 MSE의 기울기는 끝없이 커지는 반면 MAE·Huber는 일정하게 유지되는 차이를 보세요. (MSE는 비교를 위해 ½r²로 표시)',
    en: 'The x-axis is the residual (prediction − target); loss should be 0 at r=0. Turn on gradients and see how MSE\'s gradient grows without bound on large residuals (outliers) while MAE/Huber stay bounded. (MSE shown as ½r² for comparability.)',
  },
  losses: [
    {
      id: 'mse',
      name: 'MSE / L2',
      oneLiner: {
        ko: '잔차를 제곱해 평균. 큰 오차를 제곱으로 크게 벌하는 매끄러운 기본 회귀 손실.',
        en: 'Mean of squared residuals — a smooth default that punishes large errors quadratically.',
      },
      formulaTeX: 'L_{\\text{MSE}} = \\tfrac{1}{2}\\,(\\hat y - y)^2 = \\tfrac{1}{2} r^2',
      gradientTeX: '\\frac{\\partial L}{\\partial \\hat y} = r',
      intuition: {
        ko: '기울기가 잔차에 정비례(∝ r)해, 많이 틀릴수록 더 세게 교정합니다. 어디서나 미분 가능해 최적화가 안정적이지만, 이상치 하나가 손실을 지배할 수 있습니다. 가우시안 잡음 가정의 최대우도와 동치.',
        en: 'The gradient is proportional to the residual (∝ r), so larger errors are corrected harder. It is differentiable everywhere (stable optimization) but a single outlier can dominate the loss. Equivalent to maximum likelihood under Gaussian noise.',
      },
      whenToUse: {
        ko: '잡음이 대체로 가우시안이고 이상치가 적을 때. 영상 복원·잡음 제거의 픽셀 회귀 기본값(다만 과하게 매끈한 결과를 낳기도 함).',
        en: 'When noise is roughly Gaussian and outliers are few. The default for pixel regression in restoration/denoising (though it can oversmooth results).',
      },
      pros: [
        { ko: '매끄럽고 어디서나 미분 가능, 볼록.', en: 'Smooth, differentiable everywhere, convex.' },
        { ko: '가우시안 가정 하 통계적으로 최적.', en: 'Statistically optimal under Gaussian noise.' },
      ],
      cons: [
        { ko: '이상치에 매우 민감(제곱 + 무한정 커지는 기울기).', en: 'Highly sensitive to outliers (squared + unbounded gradient).' },
        { ko: '영상에서는 과도하게 흐릿한(blurry) 결과를 내기 쉬움.', en: 'Tends to produce blurry image outputs.' },
      ],
      related: ['mae', 'huber', 'logcosh'],
      papers: [
        {
          title: 'Pattern Recognition and Machine Learning (Ch. 1, 3 — least squares & Gaussian noise)',
          authors: 'C. M. Bishop',
          year: 2006,
          venue: 'Springer',
        },
      ],
      profileId: 'mse',
    },
    {
      id: 'mae',
      name: 'MAE / L1',
      oneLiner: {
        ko: '잔차의 절댓값 평균. 이상치에 강건하지만 0에서 꺾여 미분 불가.',
        en: 'Mean absolute residual — robust to outliers but non-differentiable at 0.',
      },
      formulaTeX: 'L_{\\text{MAE}} = |\\hat y - y| = |r|',
      gradientTeX: '\\frac{\\partial L}{\\partial \\hat y} = \\operatorname{sign}(r)',
      intuition: {
        ko: '기울기 크기가 항상 1로 일정합니다. 큰 잔차든 작은 잔차든 같은 힘으로 끌어당겨, 이상치 하나가 손실을 지배하지 못합니다. 대신 r=0에서 뾰족하게 꺾여(미분 불연속) 수렴 막판에 진동할 수 있습니다. 중앙값(median) 추정에 해당.',
        en: 'The gradient magnitude is always 1: big or small residuals are pulled with equal force, so no single outlier dominates. But it has a sharp kink at r=0 (non-differentiable), which can cause jitter near convergence. It corresponds to estimating the median.',
      },
      whenToUse: {
        ko: '이상치가 많거나 잡음이 두꺼운 꼬리(heavy-tailed)일 때. 영상 변환에서 MSE보다 선명한 결과를 주는 경우가 많아 자주 선호.',
        en: 'When outliers are common or noise is heavy-tailed. Often preferred over MSE in image translation because it yields sharper results.',
      },
      pros: [
        { ko: '이상치에 강건(median 추정).', en: 'Robust to outliers (median estimate).' },
        { ko: '영상에서 더 선명한 출력.', en: 'Sharper image outputs.' },
      ],
      cons: [
        { ko: 'r=0에서 미분 불가 → 막판 진동.', en: 'Non-differentiable at r=0 → late-stage jitter.' },
        { ko: '작은 오차도 같은 기울기라 정밀한 미세조정이 더딤.', en: 'Constant gradient slows fine-grained tuning of small errors.' },
      ],
      related: ['mse', 'huber'],
      papers: [
        {
          title: 'Robust Estimation of a Location Parameter',
          authors: 'P. J. Huber',
          year: 1964,
          venue: 'Annals of Mathematical Statistics',
          url: 'https://doi.org/10.1214/aoms/1177703732',
          note: { ko: 'L1 vs L2 강건성 논의의 출발점.', en: 'Foundational discussion of L1 vs L2 robustness.' },
        },
      ],
      profileId: 'mae',
    },
    {
      id: 'huber',
      name: 'Huber Loss',
      oneLiner: {
        ko: '작은 잔차는 MSE(매끈)처럼, 큰 잔차는 MAE(강건)처럼. δ로 전환점을 정한다.',
        en: 'MSE (smooth) for small residuals, MAE (robust) for large ones — δ sets the switch point.',
      },
      formulaTeX:
        'L_{\\delta}(r) = \\begin{cases} \\tfrac{1}{2}r^2 & |r| \\le \\delta \\\\ \\delta\\,(|r| - \\tfrac{1}{2}\\delta) & |r| > \\delta \\end{cases}',
      gradientTeX: '\\frac{\\partial L}{\\partial \\hat y} = \\operatorname{clip}(r,\\,-\\delta,\\,\\delta)',
      intuition: {
        ko: '|r|≤δ 구간에서는 MSE처럼 매끈하게 미분되고, 그 밖에서는 기울기가 ±δ로 고정돼 이상치의 영향이 제한됩니다. δ를 키우면 MSE에, 줄이면 MAE에 가까워집니다. 슬라이더로 전환점이 움직이는 걸 보세요.',
        en: 'Inside |r|≤δ it is smooth like MSE; outside, the gradient is clipped to ±δ, capping outlier influence. Large δ → MSE, small δ → MAE. Slide δ and watch the switch point move.',
      },
      whenToUse: {
        ko: '대부분 정상이지만 이따금 이상치가 섞일 때(두 세계의 장점). 회귀형 검출 헤드, 로버스트 영상 회귀 등.',
        en: 'When data is mostly clean but has occasional outliers (best of both worlds). Regression-style detection heads, robust image regression.',
      },
      pros: [
        { ko: '강건성 + 0 근처 매끈함을 동시에.', en: 'Robustness and near-zero smoothness together.' },
        { ko: 'δ로 강건성-정밀도 트레이드오프를 직접 조절.', en: 'δ tunes the robustness/precision trade-off directly.' },
      ],
      cons: [
        { ko: 'δ 튜닝 필요(스케일 의존).', en: 'Needs tuning of δ (scale-dependent).' },
        { ko: '전환점에서 2차 미분이 불연속.', en: 'Second derivative is discontinuous at the switch point.' },
      ],
      related: ['mse', 'mae', 'smooth_l1', 'logcosh'],
      params: [
        { key: 'delta', label: { ko: '전환점 δ', en: 'switch δ' }, min: 0.2, max: 3, step: 0.1, default: 1 },
      ],
      papers: [
        {
          title: 'Robust Estimation of a Location Parameter',
          authors: 'P. J. Huber',
          year: 1964,
          venue: 'Annals of Mathematical Statistics',
          url: 'https://doi.org/10.1214/aoms/1177703732',
        },
      ],
      profileId: 'huber',
    },
    {
      id: 'logcosh',
      name: 'Log-Cosh',
      oneLiner: {
        ko: 'log(cosh r). Huber와 거의 같은 모양인데 어디서나 매끄럽게 미분된다.',
        en: 'log(cosh r) — behaves like Huber but is smooth (twice-differentiable) everywhere.',
      },
      formulaTeX: 'L = \\log\\!\\big(\\cosh(r)\\big)',
      gradientTeX: '\\frac{\\partial L}{\\partial \\hat y} = \\tanh(r)',
      intuition: {
        ko: '작은 r에서는 ≈½r²(MSE), 큰 r에서는 ≈|r|−log2(MAE)처럼 행동합니다. 기울기가 tanh(r)이라 ±1로 부드럽게 포화돼, Huber의 장점을 전환점 없이 매끄럽게 얻습니다.',
        en: 'For small r it is ≈½r² (MSE); for large r ≈|r|−log2 (MAE). Its gradient tanh(r) smoothly saturates to ±1, giving Huber\'s benefits without a hard switch point.',
      },
      whenToUse: {
        ko: '2차 미분의 매끄러움이 필요한 최적화(2차 방법, 일부 부스팅)나 Huber의 전환점이 거슬릴 때.',
        en: 'When you want smooth second derivatives (second-order optimizers, some boosting) or want to avoid Huber\'s kink in the derivative.',
      },
      pros: [
        { ko: 'Huber처럼 강건하면서 전 구간 매끈(C∞).', en: 'Robust like Huber, but smooth everywhere (C∞).' },
        { ko: '튜닝할 하이퍼파라미터가 없음.', en: 'No hyperparameter to tune.' },
      ],
      cons: [
        { ko: '강건성 정도를 조절할 수 없음(δ가 없음).', en: 'Robustness level is fixed (no δ to adjust).' },
        { ko: '큰 r에서 cosh가 수치적으로 넘칠 수 있어 안정화 구현 필요.', en: 'cosh can overflow for large r; needs a numerically stable implementation.' },
      ],
      related: ['huber', 'mae', 'mse'],
      papers: [
        {
          title: 'Statistical Properties of the log-cosh Loss Function Used in Machine Learning',
          authors: 'R. A. Saleh, A. K. Md. E. Saleh',
          year: 2022,
          venue: 'arXiv:2208.04564',
          url: 'https://arxiv.org/abs/2208.04564',
          note: { ko: 'log-cosh의 통계적 성질 분석.', en: 'Analysis of log-cosh\'s statistical properties.' },
        },
      ],
      profileId: 'logcosh',
    },
    {
      id: 'quantile',
      name: 'Quantile / Pinball',
      oneLiner: {
        ko: '과대예측과 과소예측을 비대칭으로 벌해 특정 분위수(τ)를 추정한다.',
        en: 'Penalizes over- and under-prediction asymmetrically to estimate a chosen quantile (τ).',
      },
      formulaTeX: 'L_{\\tau}(r) = \\max\\big(\\tau r,\\,(\\tau-1) r\\big),\\quad r = \\hat y - y',
      gradientTeX: '\\frac{\\partial L}{\\partial \\hat y} = \\begin{cases} \\tau & r > 0 \\\\ \\tau - 1 & r < 0 \\end{cases}',
      intuition: {
        ko: 'τ=0.5면 MAE의 절반(중앙값). τ를 0.9로 올리면 과소예측(r<0)을 더 세게 벌해 모델이 높게 예측하도록(90% 분위수) 유도합니다. 비대칭 기울기가 핵심.',
        en: 'At τ=0.5 it is half of MAE (the median). Raising τ to 0.9 penalizes under-prediction (r<0) harder, pushing the model to predict high (the 90th percentile). The asymmetric gradient is the whole point.',
      },
      whenToUse: {
        ko: '불확실성 구간(예측 구간) 추정, 또는 과대/과소예측의 비용이 다를 때. 영상 기반 위험도 예측의 구간 추정 등.',
        en: 'Estimating prediction intervals (uncertainty), or when over- vs under-prediction have different costs. Interval estimates in imaging-based risk prediction.',
      },
      pros: [
        { ko: '분포의 분위수를 직접 추정(구간 예측 가능).', en: 'Directly estimates distribution quantiles (enables intervals).' },
        { ko: '비대칭 비용을 자연스럽게 반영.', en: 'Naturally encodes asymmetric costs.' },
      ],
      cons: [
        { ko: 'r=0에서 미분 불가(MAE와 동일).', en: 'Non-differentiable at r=0 (like MAE).' },
        { ko: '여러 분위수를 원하면 모델을 여러 번 학습.', en: 'Multiple quantiles require multiple trained heads/models.' },
      ],
      related: ['mae'],
      params: [
        { key: 'tau', label: { ko: '분위수 τ', en: 'quantile τ' }, min: 0.05, max: 0.95, step: 0.05, default: 0.5 },
      ],
      papers: [
        {
          title: 'Regression Quantiles',
          authors: 'R. Koenker, G. Bassett',
          year: 1978,
          venue: 'Econometrica',
          url: 'https://doi.org/10.2307/1913643',
        },
      ],
      profileId: 'quantile',
    },
  ],
  comparison: {
    columns: [
      { key: 'robust', label: { ko: '이상치 강건성', en: 'Outlier robustness' } },
      { key: 'smooth', label: { ko: '매끄러움', en: 'Smoothness' } },
      { key: 'estimates', label: { ko: '추정 대상', en: 'Estimates' } },
    ],
    rows: [
      { lossId: 'mse', cells: { robust: { ko: '낮음', en: 'Low' }, smooth: { ko: '전 구간', en: 'Everywhere' }, estimates: { ko: '평균(mean)', en: 'Mean' } } },
      { lossId: 'mae', cells: { robust: { ko: '높음', en: 'High' }, smooth: { ko: '0에서 꺾임', en: 'Kink at 0' }, estimates: { ko: '중앙값(median)', en: 'Median' } } },
      { lossId: 'huber', cells: { robust: { ko: '중~높음(δ)', en: 'Med–high (δ)' }, smooth: { ko: '1차 매끈', en: 'C¹' }, estimates: { ko: '평균/중앙값 절충', en: 'Mean/median blend' } } },
      { lossId: 'logcosh', cells: { robust: { ko: '중~높음', en: 'Med–high' }, smooth: { ko: '전 구간(C∞)', en: 'Everywhere (C∞)' }, estimates: { ko: '평균/중앙값 절충', en: 'Mean/median blend' } } },
      { lossId: 'quantile', cells: { robust: { ko: '높음', en: 'High' }, smooth: { ko: '0에서 꺾임', en: 'Kink at 0' }, estimates: { ko: 'τ-분위수', en: 'τ-quantile' } } },
    ],
  },
};
