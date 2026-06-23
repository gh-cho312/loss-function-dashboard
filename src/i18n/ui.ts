import type { LocalizedText } from '../data/types';

/** UI chrome strings (everything that isn't loss content). */
export const ui = {
  brandTitle: { ko: '손실함수 대시보드', en: 'Loss Function Dashboard' },
  brandSubtitle: {
    ko: 'task별 손실함수 · 의료영상 중심',
    en: 'Loss functions by task · medical-imaging focus',
  },
  learn: { ko: 'Learn 설명', en: 'Learn' },
  playground: { ko: 'Playground 실습', en: 'Playground' },
  showDetails: { ko: '자세히 보기', en: 'Show details' },
  hideDetails: { ko: '접기', en: 'Hide details' },
  formula: { ko: '수식', en: 'Formula' },
  gradient: { ko: '기울기 (gradient)', en: 'Gradient' },
  intuition: { ko: '직관', en: 'Intuition' },
  whenToUse: { ko: '언제 쓰나', en: 'When to use' },
  pros: { ko: '장점', en: 'Pros' },
  cons: { ko: '단점', en: 'Cons' },
  related: { ko: '관련 손실', en: 'Related losses' },
  papers: { ko: '대표 논문', en: 'Key papers' },
  learnOnly: { ko: 'Learn 전용', en: 'Learn-only' },
  learnOnlyHint: {
    ko: '이 손실은 1차원 곡선으로 단순화하기 어려워 설명만 제공합니다.',
    en: 'This loss does not reduce to an honest 1-D curve, so only the explanation is shown.',
  },
  comparison: { ko: '비교 · 선택 가이드', en: 'Comparison · how to choose' },
  losses: { ko: '손실함수', en: 'losses' },

  // playground
  selectLosses: { ko: '표시할 손실', en: 'Show losses' },
  hyperparams: { ko: '하이퍼파라미터', en: 'Hyperparameters' },
  options: { ko: '옵션', en: 'Options' },
  showGradient: { ko: '기울기 곡선도 표시', en: 'Also show gradient curve' },
  reset: { ko: '초기화', en: 'Reset' },
  hoverHint: {
    ko: '곡선 위에 마우스를 올리면 값과 기울기를 보여줍니다.',
    en: 'Hover the plot to read the value and gradient.',
  },
  noProfiles: {
    ko: '이 task에는 곡선으로 표현 가능한 손실이 없습니다.',
    en: 'This task has no curve-able losses.',
  },
  lossAxis: { ko: '손실값 (loss)', en: 'loss' },
  gradAxis: { ko: '기울기', en: 'gradient' },
  appLead: {
    ko: '왼쪽에서 task를 고르세요. 각 손실은 한 줄 요약을 항상 보여주고, “자세히 보기”로 수식·기울기·논문까지 펼칩니다. Playground에서는 곡선과 기울기를 직접 만져볼 수 있습니다.',
    en: 'Pick a task on the left. Each loss shows a one-line summary, and “Show details” expands the formula, gradient, and papers. The Playground lets you manipulate the curve and its gradient.',
  },
  themeLight: { ko: '라이트', en: 'Light' },
  themeDark: { ko: '다크', en: 'Dark' },
} satisfies Record<string, LocalizedText>;
