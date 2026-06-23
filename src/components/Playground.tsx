import { useMemo, useState } from 'react';
import type { ParamSpec, TaskDef } from '../data/types';
import { getProfile } from '../engine/profiles';
import { useLang } from '../i18n/LanguageContext';
import { ui } from '../i18n/ui';
import { LossPlot, type PlotSeries } from './LossPlot';
import { ParamSlider } from './ParamSlider';
import { colorAt } from './palette';

export function Playground({ task }: { task: TaskDef }) {
  const { t } = useLang();

  // losses that have a 1-D profile (others are Learn-only)
  const profileLosses = useMemo(
    () => task.losses.filter((l) => l.profileId && getProfile(l.profileId)),
    [task],
  );

  // stable color per loss (by position among profile losses)
  const colorOf = useMemo(() => {
    const map = new Map<string, string>();
    profileLosses.forEach((l, i) => map.set(l.id, colorAt(i)));
    return map;
  }, [profileLosses]);

  // all params across the task (deduped by key) + their defaults
  const allParams = useMemo(() => {
    const map = new Map<string, ParamSpec>();
    for (const l of profileLosses) for (const p of l.params ?? []) if (!map.has(p.key)) map.set(p.key, p);
    return map;
  }, [profileLosses]);

  const defaults = useMemo(() => {
    const o: Record<string, number> = {};
    allParams.forEach((p, k) => (o[k] = p.default));
    return o;
  }, [allParams]);

  const initialSelected = useMemo(
    () => new Set(profileLosses.slice(0, Math.min(4, profileLosses.length)).map((l) => l.id)),
    [profileLosses],
  );

  const [selected, setSelected] = useState<Set<string>>(initialSelected);
  const [params, setParams] = useState<Record<string, number>>(defaults);
  const [showGradient, setShowGradient] = useState(false);

  if (profileLosses.length === 0) {
    return <p className="pg-hint">{t(ui.noProfiles)}</p>;
  }

  const selectedLosses = profileLosses.filter((l) => selected.has(l.id));

  // only show sliders for params used by currently-selected losses
  const activeParamKeys = new Set<string>();
  for (const l of selectedLosses) for (const p of l.params ?? []) activeParamKeys.add(p.key);

  const series: PlotSeries[] = selectedLosses.map((l) => {
    const prof = getProfile(l.profileId!)!;
    return {
      id: l.id,
      label: l.name,
      color: colorOf.get(l.id)!,
      value: (x: number) => prof.value(x, params),
      grad: (x: number) => prof.grad(x, params),
    };
  });

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function reset() {
    setSelected(new Set(initialSelected));
    setParams(defaults);
    setShowGradient(false);
  }

  return (
    <div>
      {task.playgroundNote && <div className="callout">{t(task.playgroundNote)}</div>}
      <div className="pg-layout">
        <div className="pg-plot-card">
          {series.length > 0 ? (
            <LossPlot
              series={series}
              xMin={task.xDomain.min}
              xMax={task.xDomain.max}
              xLabel={t(task.xLabel)}
              lossLabel={t(ui.lossAxis)}
              gradLabel={t(ui.gradAxis)}
              showGradient={showGradient}
            />
          ) : (
            <p className="pg-hint">{t(ui.selectLosses)} →</p>
          )}
          <p className="pg-hint">{t(ui.hoverHint)}</p>
        </div>

        <div className="pg-controls">
          <div className="pg-section">
            <div className="pg-section-title">{t(ui.selectLosses)}</div>
            {profileLosses.map((l) => (
              <label className="loss-toggle" key={l.id}>
                <input
                  type="checkbox"
                  checked={selected.has(l.id)}
                  onChange={() => toggle(l.id)}
                />
                <span className="swatch" style={{ background: colorOf.get(l.id) }} />
                {l.name}
              </label>
            ))}
          </div>

          {activeParamKeys.size > 0 && (
            <div className="pg-section">
              <div className="pg-section-title">{t(ui.hyperparams)}</div>
              {[...allParams.values()]
                .filter((p) => activeParamKeys.has(p.key))
                .map((p) => (
                  <ParamSlider
                    key={p.key}
                    label={t(p.label)}
                    value={params[p.key]}
                    min={p.min}
                    max={p.max}
                    step={p.step}
                    onChange={(v) => setParams((prev) => ({ ...prev, [p.key]: v }))}
                  />
                ))}
            </div>
          )}

          <div className="pg-section">
            <div className="pg-section-title">{t(ui.options)}</div>
            <label className="check-row">
              <input
                type="checkbox"
                checked={showGradient}
                onChange={(e) => setShowGradient(e.target.checked)}
              />
              {t(ui.showGradient)}
            </label>
            <button className="toggle-btn" style={{ marginTop: 12 }} onClick={reset}>
              ↺ {t(ui.reset)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
