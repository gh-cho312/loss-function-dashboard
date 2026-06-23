export type Locale = 'ko' | 'en';

export type LocalizedText = { ko: string; en: string };

export type Paper = {
  title: string;
  authors: string;
  year: number;
  venue?: string;
  url?: string;
  note?: LocalizedText;
};

export type ParamSpec = {
  key: string;
  label: LocalizedText;
  min: number;
  max: number;
  step: number;
  default: number;
};

/**
 * A single loss function.
 * - `profileId` keys into `engine/profiles`. If absent, the loss is Learn-only
 *   (it can't be honestly reduced to the task's 1-D axis) and never appears in
 *   the Playground.
 */
export type LossDef = {
  id: string;
  name: string; // English proper noun, shared across locales
  oneLiner: LocalizedText; // short & clear, always visible
  formulaTeX: string;
  gradientTeX?: string;
  intuition: LocalizedText;
  whenToUse: LocalizedText;
  pros: LocalizedText[];
  cons: LocalizedText[];
  related?: string[]; // other loss ids
  papers: Paper[];
  params?: ParamSpec[];
  profileId?: string;
  /** Optional override of the task axis label for this specific loss. */
  xAxis?: LocalizedText;
};

export type ComparisonColumn = { key: string; label: LocalizedText };
export type ComparisonRow = { lossId: string; cells: Record<string, LocalizedText> };
export type ComparisonTableDef = {
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
};

export type TaskDef = {
  id: string;
  emoji: string;
  title: LocalizedText;
  short: LocalizedText; // sidebar label
  blurb: LocalizedText;
  losses: LossDef[];
  /** Playground x-axis domain and label (shared by the task's profiles). */
  xDomain: { min: number; max: number };
  xLabel: LocalizedText;
  /** Optional extra description shown above the playground plot. */
  playgroundNote?: LocalizedText;
  comparison?: ComparisonTableDef;
};

/** A profile is a pure 1-D function of a scalar x plus its analytic gradient. */
export type Profile = {
  value: (x: number, params: Record<string, number>) => number;
  grad: (x: number, params: Record<string, number>) => number;
};
