import { describe, expect, it } from 'vitest';
import { profiles } from './profiles';

/** central finite-difference gradient */
function numGrad(
  f: (x: number, q: Record<string, number>) => number,
  x: number,
  q: Record<string, number>,
  h = 1e-5,
) {
  return (f(x + h, q) - f(x - h, q)) / (2 * h);
}

type Case = { id: string; params: Record<string, number>; points: number[] };

// Test points avoid non-differentiable kinks so the numeric check is valid.
const cases: Case[] = [
  { id: 'ce', params: {}, points: [0.1, 0.3, 0.6, 0.9] },
  { id: 'weighted_ce', params: { weight: 2 }, points: [0.1, 0.5, 0.9] },
  { id: 'focal', params: { gamma: 2 }, points: [0.1, 0.4, 0.8] },
  { id: 'label_smoothing', params: { eps: 0.1 }, points: [0.1, 0.5, 0.9] },
  { id: 'mse', params: {}, points: [-2, -0.5, 0.5, 2] },
  { id: 'mae', params: {}, points: [-2, -0.5, 0.5, 2] },
  { id: 'huber', params: { delta: 1 }, points: [-2, -0.3, 0.3, 2] },
  { id: 'logcosh', params: {}, points: [-2, -0.5, 0.5, 2] },
  { id: 'quantile', params: { tau: 0.7 }, points: [-2, -0.5, 0.5, 2] },
  { id: 'smooth_l1', params: { beta: 1 }, points: [-2, -0.4, 0.4, 2] },
  { id: 'det_l1', params: {}, points: [-2, -0.5, 0.5, 2] },
  { id: 'det_l2', params: {}, points: [-2, 2] },
  { id: 'dice', params: { phi: 0.2 }, points: [0.1, 0.5, 0.9] },
  { id: 'iou', params: { phi: 0.2 }, points: [0.1, 0.5, 0.9] },
  { id: 'tversky', params: { phi: 0.2, alpha: 0.3, beta: 0.7 }, points: [0.1, 0.5, 0.9] },
  {
    id: 'focal_tversky',
    params: { phi: 0.2, alpha: 0.3, beta: 0.7, gamma: 1.33 },
    points: [0.2, 0.5, 0.8],
  },
  { id: 'combo', params: { phi: 0.2, lam: 0.5 }, points: [0.2, 0.5, 0.9] },
  { id: 'infonce', params: { tau: 0.1, kneg: 8, sneg: 0 }, points: [-0.5, 0, 0.5] },
  { id: 'triplet', params: { margin: 0.2, sneg: 0 }, points: [-0.5, 0.5] },
  { id: 'cosine_embedding', params: {}, points: [-0.5, 0.5] },
  { id: 'bpr', params: {}, points: [-2, 0, 2] },
  { id: 'pairwise_hinge', params: { margin: 1 }, points: [-1, 0.5, 2] },
  { id: 'exp_rank', params: {}, points: [-1, 0, 1] },
  { id: 'nll', params: {}, points: [0.1, 0.5, 0.9] },
  { id: 'label_smoothing_lm', params: { eps: 0.1 }, points: [0.1, 0.5, 0.9] },
  { id: 'gan_minimax_g', params: {}, points: [0.1, 0.5, 0.9] },
  { id: 'gan_nonsat_g', params: {}, points: [0.1, 0.5, 0.9] },
];

describe('profiles: analytic gradient matches numeric gradient', () => {
  for (const { id, params, points } of cases) {
    const prof = profiles[id];
    it(`${id}`, () => {
      expect(prof, `profile "${id}" exists`).toBeTruthy();
      for (const x of points) {
        const analytic = prof.grad(x, params);
        const numeric = numGrad(prof.value, x, params);
        expect(
          Math.abs(analytic - numeric),
          `${id} grad at x=${x}: analytic=${analytic} numeric=${numeric}`,
        ).toBeLessThan(1e-3 + 1e-3 * Math.abs(numeric));
      }
    });
  }
});

describe('every profile is covered by a gradient test case', () => {
  it('no profile left untested', () => {
    const tested = new Set(cases.map((c) => c.id));
    const missing = Object.keys(profiles).filter((id) => !tested.has(id));
    expect(missing, `untested profiles: ${missing.join(', ')}`).toHaveLength(0);
  });
});

describe('known values & limiting cases', () => {
  it('CE is ~0 at perfect prediction', () => {
    expect(profiles.ce.value(1, {})).toBeLessThan(1e-4);
  });
  it('MSE gradient is the residual (½r² convention)', () => {
    expect(profiles.mse.grad(2, {})).toBeCloseTo(2, 10);
    expect(profiles.mse.value(2, {})).toBeCloseTo(2, 10);
  });
  it('Focal reduces to CE when γ=0', () => {
    for (const p of [0.2, 0.5, 0.8]) {
      expect(profiles.focal.grad(p, { gamma: 0 })).toBeCloseTo(profiles.ce.grad(p, {}), 8);
      expect(profiles.focal.value(p, { gamma: 0 })).toBeCloseTo(profiles.ce.value(p, {}), 8);
    }
  });
  it('Huber → MSE for large δ', () => {
    expect(profiles.huber.value(0.5, { delta: 100 })).toBeCloseTo(profiles.mse.value(0.5, {}), 8);
  });
  it('Huber slope saturates at ±δ for large residuals', () => {
    expect(profiles.huber.grad(5, { delta: 1 })).toBeCloseTo(1, 10);
    expect(profiles.huber.grad(-5, { delta: 1 })).toBeCloseTo(-1, 10);
  });
  it('BPR gradient at Δ=0 is −0.5', () => {
    expect(profiles.bpr.grad(0, {})).toBeCloseTo(-0.5, 10);
  });
  it('Dice loss decreases as recall rises', () => {
    expect(profiles.dice.value(0.9, { phi: 0.2 })).toBeLessThan(profiles.dice.value(0.3, { phi: 0.2 }));
  });
  it('non-saturating GAN gradient is stronger than minimax when D is confident (d small)', () => {
    const d = 0.05;
    expect(Math.abs(profiles.gan_nonsat_g.grad(d, {}))).toBeGreaterThan(
      Math.abs(profiles.gan_minimax_g.grad(d, {})),
    );
  });
});
