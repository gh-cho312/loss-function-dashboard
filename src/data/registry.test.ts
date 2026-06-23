import { describe, expect, it } from 'vitest';
import { tasks } from './registry';
import { profiles } from '../engine/profiles';

describe('registry consistency', () => {
  it('task ids are unique', () => {
    const ids = tasks.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const task of tasks) {
    describe(task.id, () => {
      it('loss ids are unique within the task', () => {
        const ids = task.losses.map((l) => l.id);
        expect(new Set(ids).size, `dups in ${task.id}`).toBe(ids.length);
      });

      it('every profileId resolves to an engine profile', () => {
        for (const l of task.losses) {
          if (l.profileId) {
            expect(profiles[l.profileId], `${l.id} -> ${l.profileId}`).toBeTruthy();
          }
        }
      });

      it('profile losses return finite value & grad at defaults across the domain', () => {
        const { min, max } = task.xDomain;
        for (const l of task.losses) {
          if (!l.profileId) continue;
          const prof = profiles[l.profileId];
          const params: Record<string, number> = {};
          for (const p of l.params ?? []) params[p.key] = p.default;
          for (let i = 0; i <= 10; i++) {
            const x = min + ((max - min) * i) / 10;
            const v = prof.value(x, params);
            const g = prof.grad(x, params);
            expect(Number.isFinite(v), `${l.id} value at x=${x}`).toBe(true);
            expect(Number.isFinite(g), `${l.id} grad at x=${x}`).toBe(true);
          }
        }
      });

      it('every loss has at least one paper with title & authors', () => {
        for (const l of task.losses) {
          expect(l.papers.length, `${l.id} papers`).toBeGreaterThan(0);
          for (const p of l.papers) {
            expect(p.title.length).toBeGreaterThan(0);
            expect(p.authors.length).toBeGreaterThan(0);
          }
        }
      });

      it('comparison rows reference real loss ids', () => {
        if (!task.comparison) return;
        const ids = new Set(task.losses.map((l) => l.id));
        for (const row of task.comparison.rows) {
          expect(ids.has(row.lossId), `${task.id} cmp row ${row.lossId}`).toBe(true);
        }
      });

      it('bilingual fields have both ko and en', () => {
        for (const l of task.losses) {
          for (const f of [l.oneLiner, l.intuition, l.whenToUse]) {
            expect(f.ko.length, `${l.id} ko`).toBeGreaterThan(0);
            expect(f.en.length, `${l.id} en`).toBeGreaterThan(0);
          }
        }
      });
    });
  }
});
