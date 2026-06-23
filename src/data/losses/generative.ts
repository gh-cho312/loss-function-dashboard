import type { TaskDef } from '../types';

export const generative: TaskDef = {
  id: 'generative',
  emoji: '🎨',
  title: { ko: '생성 (Generative)', en: 'Generative' },
  short: { ko: '생성', en: 'Generative' },
  blurb: {
    ko: '데이터 분포 자체를 학습해 새 영상을 만듭니다. 의료에서는 데이터 증강, 모달리티 변환(MRI↔CT), 저선량 CT 잡음제거·복원, 초해상이 대표적입니다. 손실 선택이 화질·안정성을 좌우합니다.',
    en: 'Learn the data distribution to synthesize new images. In medicine: data augmentation, modality translation (MRI↔CT), low-dose CT denoising/reconstruction, super-resolution. The loss choice drives image quality and training stability.',
  },
  xDomain: { min: 0.02, max: 0.98 },
  xLabel: { ko: '판별자 출력  D(G(z))', en: 'discriminator output  D(G(z))' },
  playgroundNote: {
    ko: 'x축 = 판별자가 "가짜를 진짜라고 믿는 정도" D(G(z)). 생성자는 이 값을 1로 올리고 싶어 합니다. 기울기 곡선을 꼭 켜 보세요: 생성자가 지고 있을 때(d가 작을 때) minimax의 기울기는 0에 가까워(학습 정체) 반면, non-saturating은 강한 기울기를 줍니다 — 실제 GAN이 non-saturating을 쓰는 이유입니다.',
    en: 'x = how much the discriminator believes the fake is real, D(G(z)). The generator wants to push it to 1. Turn the gradient curve on: when the generator is losing (small d), the minimax gradient nearly vanishes (stalled learning), while the non-saturating one stays strong — exactly why real GANs use the non-saturating loss.',
  },
  losses: [
    {
      id: 'gan_nonsat_g',
      name: 'Non-Saturating GAN (generator)',
      oneLiner: {
        ko: '생성자가 −log D(G(z))를 최소화. 질 때도 강한 기울기를 줘 실제로 쓰이는 GAN 손실.',
        en: 'The generator minimizes −log D(G(z)) — strong gradients even when losing, the GAN loss actually used.',
      },
      formulaTeX: 'L_G = -\\,\\mathbb{E}_{z}\\big[\\log D(G(z))\\big]',
      gradientTeX: '\\frac{\\partial L_G}{\\partial d} = -\\frac{1}{d}',
      intuition: {
        ko: '판별자가 가짜를 잘 잡아낼 때(d가 작을 때)도 −1/d로 기울기가 커서 생성자가 학습을 멈추지 않습니다. Goodfellow 원논문이 minimax 대신 실제로 권한 형태입니다.',
        en: 'Even when the discriminator easily catches fakes (small d), the gradient −1/d is large, so the generator keeps learning. This is the form Goodfellow\'s paper actually recommended over the minimax one.',
      },
      whenToUse: {
        ko: '기본 GAN 학습. 의료영상 증강·변환의 적대적 항으로 널리 사용.',
        en: 'Default GAN training; the adversarial term in medical image augmentation/translation.',
      },
      pros: [
        { ko: '초기·열세 구간에서도 강한 학습 신호.', en: 'Strong signal early and when the generator is behind.' },
        { ko: '실전에서 minimax보다 안정적.', en: 'More stable than minimax in practice.' },
      ],
      cons: [
        { ko: '여전히 모드 붕괴·불안정 위험.', en: 'Still prone to mode collapse / instability.' },
        { ko: '판별자와의 균형 튜닝이 까다로움.', en: 'Balancing with the discriminator is delicate.' },
      ],
      related: ['gan_minimax_g', 'wgan', 'hinge_gan'],
      papers: [
        {
          title: 'Generative Adversarial Nets',
          authors: 'I. Goodfellow et al.',
          year: 2014,
          venue: 'NeurIPS',
          url: 'https://arxiv.org/abs/1406.2661',
        },
      ],
      profileId: 'gan_nonsat_g',
    },
    {
      id: 'gan_minimax_g',
      name: 'Minimax GAN (generator)',
      oneLiner: {
        ko: '원래의 minimax 게임 항 log(1−D). 생성자가 질 때 기울기가 사라지는 약점이 있다.',
        en: 'The original minimax term log(1−D) — its gradient vanishes when the generator is losing.',
      },
      formulaTeX: 'L_G = \\mathbb{E}_{z}\\big[\\log(1 - D(G(z)))\\big]',
      gradientTeX: '\\frac{\\partial L_G}{\\partial d} = -\\frac{1}{1-d}',
      intuition: {
        ko: '판별자가 가짜를 잘 잡을 때(d가 작을 때) 기울기 −1/(1−d)가 거의 0이 됩니다 — 정확히 도움이 가장 필요한 순간에 신호가 사라지는 "기울기 포화" 문제. 그래서 이론적 출발점이지만 실제로는 non-saturating을 씁니다. 기울기 곡선을 켜서 직접 비교하세요.',
        en: 'When the discriminator catches fakes (small d), the gradient −1/(1−d) is nearly 0 — the "saturation" problem where the signal disappears exactly when it is most needed. So it is the theoretical starting point, but practice uses the non-saturating form. Compare them with the gradient curve on.',
      },
      whenToUse: {
        ko: '개념 이해용. 실제 학습에는 non-saturating 권장.',
        en: 'For conceptual understanding; use the non-saturating form for real training.',
      },
      pros: [
        { ko: '원래 minimax 게임과 이론적으로 정합.', en: 'Theoretically matches the original minimax game.' },
      ],
      cons: [
        { ko: '생성자가 열세일 때 기울기 소실.', en: 'Vanishing gradient when the generator is behind.' },
      ],
      related: ['gan_nonsat_g'],
      papers: [
        {
          title: 'Generative Adversarial Nets',
          authors: 'I. Goodfellow et al.',
          year: 2014,
          venue: 'NeurIPS',
          url: 'https://arxiv.org/abs/1406.2661',
        },
      ],
      profileId: 'gan_minimax_g',
    },
    {
      id: 'wgan',
      name: 'Wasserstein GAN (WGAN)',
      oneLiner: {
        ko: '확률 대신 Wasserstein 거리를 줄여, 기울기 소실 없이 안정적으로 학습한다.',
        en: 'Minimizes the Wasserstein distance instead of a probability — stable, no vanishing gradients.',
      },
      formulaTeX:
        'L = \\mathbb{E}_{x\\sim p_{\\text{data}}}[f(x)] - \\mathbb{E}_{z}[f(G(z))],\\quad \\|f\\|_{L}\\le 1',
      intuition: {
        ko: '판별자(여기선 "비평가critic")가 확률 대신 실수 점수를 내고, 1-Lipschitz로 제한합니다. 두 분포의 "흙 옮기기(earth-mover)" 거리를 근사해, 분포가 안 겹쳐도 의미 있는 매끈한 기울기를 줍니다. 가중치 클리핑 대신 gradient penalty(WGAN-GP)가 표준. 비평가 점수가 무한대 축이라 곡선 대신 설명 제공.',
        en: 'The discriminator (here a "critic") outputs a real score, not a probability, constrained to be 1-Lipschitz. It approximates the earth-mover distance, giving meaningful smooth gradients even when distributions do not overlap. A gradient penalty (WGAN-GP) is the standard substitute for weight clipping. The critic score is an unbounded axis, so it is explained rather than plotted.',
      },
      whenToUse: {
        ko: '학습 불안정·모드 붕괴가 심할 때. 손실값이 화질과 상관되길 원할 때.',
        en: 'When training is unstable / mode-collapsing, or you want a loss that correlates with sample quality.',
      },
      pros: [
        { ko: '기울기 소실 없이 안정적.', en: 'Stable, no vanishing gradients.' },
        { ko: '손실이 수렴·품질 지표로 의미 있음.', en: 'Loss is a meaningful convergence/quality signal.' },
      ],
      cons: [
        { ko: 'Lipschitz 제약(클리핑/GP) 필요.', en: 'Requires a Lipschitz constraint (clipping / GP).' },
        { ko: '비평가를 더 많이 학습시켜야.', en: 'Needs more critic updates per generator step.' },
      ],
      related: ['gan_nonsat_g', 'hinge_gan'],
      papers: [
        {
          title: 'Wasserstein GAN',
          authors: 'M. Arjovsky, S. Chintala, L. Bottou',
          year: 2017,
          venue: 'ICML',
          url: 'https://arxiv.org/abs/1701.07875',
        },
        {
          title: 'Improved Training of Wasserstein GANs (WGAN-GP)',
          authors: 'I. Gulrajani, F. Ahmed, M. Arjovsky, V. Dumoulin, A. Courville',
          year: 2017,
          venue: 'NeurIPS',
          url: 'https://arxiv.org/abs/1704.00028',
        },
      ],
    },
    {
      id: 'hinge_gan',
      name: 'Hinge GAN',
      oneLiner: {
        ko: '마진 기반 hinge 손실로 판별자를 학습. 고품질 GAN(BigGAN 등)의 표준.',
        en: 'Trains the discriminator with a margin-based hinge loss — the standard in high-quality GANs (e.g., BigGAN).',
      },
      formulaTeX:
        'L_D = \\mathbb{E}[\\max(0, 1 - D(x))] + \\mathbb{E}[\\max(0, 1 + D(G(z)))],\\quad L_G = -\\mathbb{E}[D(G(z))]',
      intuition: {
        ko: '판별자가 진짜는 +1, 가짜는 −1 이상으로 마진을 두고 분리하게 합니다. 마진을 넘으면 기울기 0이라 과도한 업데이트를 막아 안정적입니다. Spectral Normalization과 짝지어 고해상 생성에 널리 쓰입니다.',
        en: 'It makes the discriminator separate reals above +1 and fakes below −1 with a margin; past the margin the gradient is 0, preventing over-updates and improving stability. Paired with Spectral Normalization, it is common in high-resolution generation.',
      },
      whenToUse: {
        ko: '고해상·고품질 GAN. SN-GAN, BigGAN 계열.',
        en: 'High-resolution, high-quality GANs (SN-GAN, BigGAN family).',
      },
      pros: [
        { ko: '안정적이고 좋은 화질.', en: 'Stable with strong image quality.' },
        { ko: 'Spectral Norm과 궁합이 좋음.', en: 'Pairs well with spectral normalization.' },
      ],
      cons: [
        { ko: 'WGAN처럼 손실이 곧 품질은 아님.', en: 'Loss does not directly track quality (unlike WGAN).' },
      ],
      related: ['gan_nonsat_g', 'wgan', 'pairwise_hinge'],
      papers: [
        {
          title: 'Geometric GAN',
          authors: 'J. H. Lim, J. C. Ye',
          year: 2017,
          venue: 'arXiv:1705.02894',
          url: 'https://arxiv.org/abs/1705.02894',
        },
        {
          title: 'Spectral Normalization for Generative Adversarial Networks',
          authors: 'T. Miyato, T. Kataoka, M. Koyama, Y. Yoshida',
          year: 2018,
          venue: 'ICLR',
          url: 'https://arxiv.org/abs/1802.05957',
        },
      ],
    },
    {
      id: 'vae_kl',
      name: 'VAE / ELBO (recon + KL)',
      oneLiner: {
        ko: '복원 오차와 잠재분포 정규화(KL)를 더한 변분 오토인코더의 목적함수.',
        en: 'The variational autoencoder objective: reconstruction error plus a latent KL regularizer.',
      },
      formulaTeX:
        'L = \\underbrace{\\mathbb{E}_{q}\\!\\big[-\\log p(x|z)\\big]}_{\\text{recon}} + \\underbrace{D_{KL}\\!\\big(q(z|x)\\,\\|\\,p(z)\\big)}_{\\text{regularize}}',
      intuition: {
        ko: '복원 항은 입력을 잘 재현하게 하고, KL 항은 잠재공간을 표준정규에 가깝게 정리해 새 샘플을 뽑을 수 있게 합니다. 가우시안일 때 KL은 ½∑(μ²+σ²−1−logσ²)로 닫힌형. β로 KL 비중을 키우면(β-VAE) 표현이 더 풀려(disentangle)집니다. 잠재분포 함수라 곡선 대신 설명 제공.',
        en: 'The reconstruction term makes the model reproduce inputs; the KL term tidies the latent space toward a standard normal so you can sample new data. For Gaussians, KL is closed-form ½∑(μ²+σ²−1−logσ²). Up-weighting KL (β-VAE) encourages disentangled representations. It is a distribution-level objective, so explained rather than plotted.',
      },
      whenToUse: {
        ko: '안정적 생성·표현학습, 잠재공간이 필요한 의료영상 모델링·이상탐지.',
        en: 'Stable generation/representation learning; latent-space medical-image modeling and anomaly detection.',
      },
      pros: [
        { ko: '학습이 안정적이고 잠재공간이 정돈됨.', en: 'Stable training with an organized latent space.' },
        { ko: '확률모델로 이상탐지 등에 활용 가능.', en: 'A probabilistic model usable for anomaly detection.' },
      ],
      cons: [
        { ko: '샘플이 흐릿한 경향(GAN 대비).', en: 'Samples tend to be blurry (vs GANs).' },
        { ko: '사후붕괴(posterior collapse) 위험.', en: 'Risk of posterior collapse.' },
      ],
      related: ['mse', 'diffusion'],
      papers: [
        {
          title: 'Auto-Encoding Variational Bayes',
          authors: 'D. P. Kingma, M. Welling',
          year: 2013,
          venue: 'ICLR 2014',
          url: 'https://arxiv.org/abs/1312.6114',
        },
      ],
    },
    {
      id: 'diffusion',
      name: 'Diffusion (Denoising MSE)',
      oneLiner: {
        ko: '각 단계에서 더해진 노이즈를 예측하는 단순 MSE. 현대 영상 생성의 주력.',
        en: 'A simple MSE that predicts the noise added at each step — the workhorse of modern image generation.',
      },
      formulaTeX:
        'L = \\mathbb{E}_{t,\\,x_0,\\,\\epsilon}\\big\\|\\,\\epsilon - \\epsilon_{\\theta}(x_t, t)\\,\\big\\|^2',
      intuition: {
        ko: '데이터에 점점 노이즈를 더했다가(forward) 거꾸로 제거하도록(reverse) 학습합니다. 놀랍게도 학습 목표는 "이 단계에서 더해진 노이즈 ε를 맞혀라"는 MSE 한 줄입니다(회귀의 MSE와 본질적으로 동일). 안정적이고 모드 붕괴가 없어 GAN을 대체하고 있습니다. 노이즈 잔차 회귀라 회귀 탭의 MSE 곡선을 참고하세요.',
        en: 'It learns to add noise to data (forward) and remove it (reverse). Remarkably, the objective is a single MSE: "predict the noise ε added at this step" (essentially the regression MSE). Stable and free of mode collapse, it has been displacing GANs. Being noise-residual regression, see the MSE curve under the Regression tab.',
      },
      whenToUse: {
        ko: '고품질·다양성 생성, 의료영상 합성·복원·초해상. 현재 사실상의 기본.',
        en: 'High-quality, diverse generation; medical image synthesis/reconstruction/super-resolution. The current de-facto default.',
      },
      pros: [
        { ko: '안정적 학습, 모드 붕괴 없음, 높은 품질·다양성.', en: 'Stable training, no mode collapse, high quality and diversity.' },
        { ko: '목적함수가 단순(MSE).', en: 'Simple objective (MSE).' },
      ],
      cons: [
        { ko: '샘플링이 느림(여러 단계).', en: 'Slow sampling (many steps).' },
        { ko: '학습·추론 계산량이 큼.', en: 'Heavy compute for training/inference.' },
      ],
      related: ['mse', 'vae_kl'],
      papers: [
        {
          title: 'Denoising Diffusion Probabilistic Models (DDPM)',
          authors: 'J. Ho, A. Jain, P. Abbeel',
          year: 2020,
          venue: 'NeurIPS',
          url: 'https://arxiv.org/abs/2006.11239',
        },
      ],
    },
    {
      id: 'lpips',
      name: 'Perceptual / LPIPS',
      oneLiner: {
        ko: '픽셀이 아니라 사전학습 특징공간에서의 차이를 재, 사람 눈에 맞춘 화질 손실.',
        en: 'Measures difference in a pretrained feature space, not pixels — a perceptually aligned image loss.',
      },
      formulaTeX:
        'L = \\sum_{l} w_l \\,\\big\\| \\phi_l(\\hat x) - \\phi_l(x) \\big\\|_2^2',
      intuition: {
        ko: 'φ_l은 사전학습 CNN의 l번째 층 특징입니다. 픽셀 MSE는 흐릿함을 못 잡지만, 특징공간 거리는 질감·구조 차이를 사람 지각에 가깝게 포착합니다. 복원·초해상에서 MSE와 결합해 선명도를 높입니다. 네트워크 특징이 필요해 곡선 대신 설명 제공.',
        en: 'φ_l are features from layer l of a pretrained CNN. Pixel MSE misses blur, but feature-space distance captures texture/structure differences closer to human perception. Combined with MSE in restoration/super-resolution to boost sharpness. It needs network features, so it is explained rather than plotted.',
      },
      whenToUse: {
        ko: '지각적 화질이 중요한 복원·초해상·변환. MSE/L1과 함께 사용.',
        en: 'Restoration/super-resolution/translation where perceptual quality matters; used alongside MSE/L1.',
      },
      pros: [
        { ko: '사람 눈에 맞는 선명한 결과.', en: 'Sharper results aligned with human perception.' },
        { ko: '픽셀 손실의 흐릿함을 보완.', en: 'Counters the blurriness of pixel losses.' },
      ],
      cons: [
        { ko: '사전학습 네트워크에 의존(도메인 편향 가능).', en: 'Depends on a pretrained network (possible domain bias).' },
        { ko: '계산 비용 추가.', en: 'Adds compute.' },
      ],
      related: ['mse', 'mae'],
      papers: [
        {
          title: 'The Unreasonable Effectiveness of Deep Features as a Perceptual Metric (LPIPS)',
          authors: 'R. Zhang, P. Isola, A. A. Efros, E. Shechtman, O. Wang',
          year: 2018,
          venue: 'CVPR',
          url: 'https://arxiv.org/abs/1801.03924',
        },
      ],
    },
  ],
  comparison: {
    columns: [
      { key: 'family', label: { ko: '계열', en: 'Family' } },
      { key: 'stability', label: { ko: '안정성', en: 'Stability' } },
      { key: 'quality', label: { ko: '특징', en: 'Trait' } },
    ],
    rows: [
      { lossId: 'gan_nonsat_g', cells: { family: { ko: 'GAN', en: 'GAN' }, stability: { ko: '보통', en: 'Medium' }, quality: { ko: '선명하나 불안정', en: 'Sharp but unstable' } } },
      { lossId: 'gan_minimax_g', cells: { family: { ko: 'GAN', en: 'GAN' }, stability: { ko: '낮음', en: 'Low' }, quality: { ko: '기울기 소실', en: 'Vanishing gradient' } } },
      { lossId: 'wgan', cells: { family: { ko: 'GAN', en: 'GAN' }, stability: { ko: '높음', en: 'High' }, quality: { ko: '손실=품질 지표', en: 'Loss tracks quality' } } },
      { lossId: 'hinge_gan', cells: { family: { ko: 'GAN', en: 'GAN' }, stability: { ko: '높음', en: 'High' }, quality: { ko: '고해상 표준', en: 'Hi-res standard' } } },
      { lossId: 'vae_kl', cells: { family: { ko: 'VAE', en: 'VAE' }, stability: { ko: '높음', en: 'High' }, quality: { ko: '흐릿, 잠재공간', en: 'Blurry, latent space' } } },
      { lossId: 'diffusion', cells: { family: { ko: 'Diffusion', en: 'Diffusion' }, stability: { ko: '매우 높음', en: 'Very high' }, quality: { ko: '고품질, 느린 샘플링', en: 'High quality, slow' } } },
      { lossId: 'lpips', cells: { family: { ko: '보조(perceptual)', en: 'Auxiliary' }, stability: { ko: '—', en: '—' }, quality: { ko: '지각적 선명도', en: 'Perceptual sharpness' } } },
    ],
  },
};
