import type { TaskDef } from './types';
import { classification } from './losses/classification';
import { regression } from './losses/regression';
import { segmentation } from './losses/segmentation';
import { detection } from './losses/detection';
import { contrastive } from './losses/contrastive';
import { ranking } from './losses/ranking';
import { nlp } from './losses/nlp';
import { generative } from './losses/generative';

/** Ordered list of tasks shown in the sidebar. */
export const tasks: TaskDef[] = [
  classification,
  regression,
  segmentation,
  detection,
  contrastive,
  ranking,
  nlp,
  generative,
];
