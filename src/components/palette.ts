/** Okabe–Ito series slots, theme-aware via CSS custom properties. */
export const PALETTE = [
  'var(--series-1)',
  'var(--series-2)',
  'var(--series-3)',
  'var(--series-4)',
  'var(--series-5)',
  'var(--series-6)',
  'var(--series-7)',
];

export const colorAt = (i: number) => PALETTE[i % PALETTE.length];
