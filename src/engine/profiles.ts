import type { Profile } from '../data/types';

/**
 * 1-D loss profiles: pure `value(x, params)` and analytic `grad(x, params)`.
 * The scalar `x` means different things per task (see each task's xLabel):
 *   classification / nlp : p = predicted probability of the correct class/token
 *   regression / detection : r = residual (prediction − target)
 *   segmentation : recall = fraction of ground-truth covered (with FP level φ)
 *   contrastive : s = cosine similarity of a positive pair
 *   ranking : Δ = score gap (positive − negative)
 *   generative : d = discriminator output D(G(z)) ∈ (0,1)
 *
 * Every grad here is verified against central finite differences in profiles.test.ts.
 */

const EPS = 1e-6;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const p01 = (p: number) => clamp(p, EPS, 1 - EPS);
const pos = (v: number) => clamp(v, EPS, Infinity);
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

export const profiles: Record<string, Profile> = {
  // ---------------- classification (x = p) ----------------
  ce: {
    value: (x) => -Math.log(p01(x)),
    grad: (x) => -1 / p01(x),
  },
  weighted_ce: {
    value: (x, q) => -(q.weight ?? 1) * Math.log(p01(x)),
    grad: (x, q) => -(q.weight ?? 1) / p01(x),
  },
  focal: {
    value: (x, q) => {
      const p = p01(x);
      const g = q.gamma ?? 2;
      return -Math.pow(1 - p, g) * Math.log(p);
    },
    grad: (x, q) => {
      const p = p01(x);
      const g = q.gamma ?? 2;
      return g * Math.pow(1 - p, g - 1) * Math.log(p) - Math.pow(1 - p, g) / p;
    },
  },
  label_smoothing: {
    value: (x, q) => {
      const p = p01(x);
      const e = q.eps ?? 0.1;
      return -(1 - e) * Math.log(p) - e * Math.log(1 - p);
    },
    grad: (x, q) => {
      const p = p01(x);
      const e = q.eps ?? 0.1;
      return -(1 - e) / p + e / (1 - p);
    },
  },

  // ---------------- regression (x = r) ----------------
  // L2/MSE shown as ½r² so it coincides with Huber's quadratic region.
  mse: {
    value: (x) => 0.5 * x * x,
    grad: (x) => x,
  },
  mae: {
    value: (x) => Math.abs(x),
    grad: (x) => (x > 0 ? 1 : x < 0 ? -1 : 0),
  },
  huber: {
    value: (x, q) => {
      const d = q.delta ?? 1;
      const a = Math.abs(x);
      return a <= d ? 0.5 * x * x : d * (a - 0.5 * d);
    },
    grad: (x, q) => {
      const d = q.delta ?? 1;
      return Math.abs(x) <= d ? x : d * Math.sign(x);
    },
  },
  logcosh: {
    value: (x) => Math.log(Math.cosh(x)),
    grad: (x) => Math.tanh(x),
  },
  quantile: {
    value: (x, q) => {
      const t = q.tau ?? 0.5;
      return x >= 0 ? t * x : (t - 1) * x;
    },
    grad: (x, q) => {
      const t = q.tau ?? 0.5;
      return x >= 0 ? t : t - 1;
    },
  },

  // ---------------- detection box regression (x = r) ----------------
  smooth_l1: {
    value: (x, q) => {
      const b = q.beta ?? 1;
      const a = Math.abs(x);
      return a < b ? (0.5 * x * x) / b : a - 0.5 * b;
    },
    grad: (x, q) => {
      const b = q.beta ?? 1;
      return Math.abs(x) < b ? x / b : Math.sign(x);
    },
  },
  det_l1: {
    value: (x) => Math.abs(x),
    grad: (x) => (x > 0 ? 1 : x < 0 ? -1 : 0),
  },
  det_l2: {
    value: (x) => 0.5 * x * x,
    grad: (x) => x,
  },

  // ---------------- segmentation (x = recall, φ = FP level) ----------------
  dice: {
    value: (x, q) => {
      const phi = q.phi ?? 0.2;
      return 1 - (2 * x) / (x + 1 + phi);
    },
    grad: (x, q) => {
      const phi = q.phi ?? 0.2;
      const den = x + 1 + phi;
      return -(2 * (1 + phi)) / (den * den);
    },
  },
  iou: {
    value: (x, q) => {
      const phi = q.phi ?? 0.2;
      return 1 - x / (1 + phi);
    },
    grad: (_x, q) => {
      const phi = q.phi ?? 0.2;
      return -1 / (1 + phi);
    },
  },
  tversky: {
    value: (x, q) => {
      const phi = q.phi ?? 0.2;
      const a = q.alpha ?? 0.3;
      const b = q.beta ?? 0.7;
      const den = x * (1 - b) + a * phi + b;
      return 1 - x / den;
    },
    grad: (x, q) => {
      const phi = q.phi ?? 0.2;
      const a = q.alpha ?? 0.3;
      const b = q.beta ?? 0.7;
      const den = x * (1 - b) + a * phi + b;
      return -(a * phi + b) / (den * den);
    },
  },
  focal_tversky: {
    value: (x, q) => {
      const phi = q.phi ?? 0.2;
      const a = q.alpha ?? 0.3;
      const b = q.beta ?? 0.7;
      const g = q.gamma ?? 1.33;
      const den = x * (1 - b) + a * phi + b;
      const ti = x / den;
      return Math.pow(1 - ti, g);
    },
    grad: (x, q) => {
      const phi = q.phi ?? 0.2;
      const a = q.alpha ?? 0.3;
      const b = q.beta ?? 0.7;
      const g = q.gamma ?? 1.33;
      const den = x * (1 - b) + a * phi + b;
      const ti = x / den;
      const dti = (a * phi + b) / (den * den);
      return -g * Math.pow(1 - ti, g - 1) * dti;
    },
  },
  combo: {
    value: (x, q) => {
      const phi = q.phi ?? 0.2;
      const lam = q.lam ?? 0.5;
      const diceLoss = 1 - (2 * x) / (x + 1 + phi);
      return diceLoss + lam * -Math.log(pos(x));
    },
    grad: (x, q) => {
      const phi = q.phi ?? 0.2;
      const lam = q.lam ?? 0.5;
      const den = x + 1 + phi;
      const diceGrad = -(2 * (1 + phi)) / (den * den);
      return diceGrad + lam * (-1 / pos(x));
    },
  },

  // ---------------- contrastive / metric (x = similarity s) ----------------
  infonce: {
    value: (x, q) => {
      const tau = q.tau ?? 0.1;
      const k = q.kneg ?? 8;
      const sn = q.sneg ?? 0;
      const z = Math.exp(x / tau);
      const zn = k * Math.exp(sn / tau);
      return -(x / tau) + Math.log(z + zn);
    },
    grad: (x, q) => {
      const tau = q.tau ?? 0.1;
      const k = q.kneg ?? 8;
      const sn = q.sneg ?? 0;
      const z = Math.exp(x / tau);
      const zn = k * Math.exp(sn / tau);
      const p = z / (z + zn);
      return (p - 1) / tau;
    },
  },
  triplet: {
    value: (x, q) => {
      const m = q.margin ?? 0.2;
      const sn = q.sneg ?? 0;
      return Math.max(0, sn + m - x);
    },
    grad: (x, q) => {
      const m = q.margin ?? 0.2;
      const sn = q.sneg ?? 0;
      return x < sn + m ? -1 : 0;
    },
  },
  cosine_embedding: {
    value: (x) => 1 - x,
    grad: () => -1,
  },

  // ---------------- ranking (x = score gap Δ) ----------------
  bpr: {
    value: (x) => Math.log(1 + Math.exp(-x)),
    grad: (x) => sigmoid(x) - 1,
  },
  pairwise_hinge: {
    value: (x, q) => {
      const m = q.margin ?? 1;
      return Math.max(0, m - x);
    },
    grad: (x, q) => {
      const m = q.margin ?? 1;
      return x < m ? -1 : 0;
    },
  },
  exp_rank: {
    value: (x) => Math.exp(-x),
    grad: (x) => -Math.exp(-x),
  },

  // ---------------- sequence / NLP / LLM (x = p of true token) ----------------
  nll: {
    value: (x) => -Math.log(p01(x)),
    grad: (x) => -1 / p01(x),
  },
  label_smoothing_lm: {
    value: (x, q) => {
      const p = p01(x);
      const e = q.eps ?? 0.1;
      return -(1 - e) * Math.log(p) - e * Math.log(1 - p);
    },
    grad: (x, q) => {
      const p = p01(x);
      const e = q.eps ?? 0.1;
      return -(1 - e) / p + e / (1 - p);
    },
  },

  // ---------------- generative (x = D output d) ----------------
  gan_minimax_g: {
    value: (x) => Math.log(1 - p01(x)),
    grad: (x) => -1 / (1 - p01(x)),
  },
  gan_nonsat_g: {
    value: (x) => -Math.log(p01(x)),
    grad: (x) => -1 / p01(x),
  },
};

export type ProfileId = keyof typeof profiles;

export function getProfile(id: string): Profile | undefined {
  return profiles[id];
}
