import { useCallback, useMemo } from 'react';
import type { TaskDef } from '../data/types';
import { useLang } from '../i18n/LanguageContext';
import { ui } from '../i18n/ui';
import { LossCard } from '../components/LossCard';
import { ComparisonTable } from '../components/ComparisonTable';

export function LearnView({ task }: { task: TaskDef }) {
  const { t } = useLang();

  const nameOf = useCallback(
    (id: string) => task.losses.find((l) => l.id === id)?.name,
    [task],
  );

  const onNavigate = useCallback((id: string) => {
    const el = document.getElementById(`loss-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const count = useMemo(() => task.losses.length, [task]);

  return (
    <div>
      <p style={{ color: 'var(--text-muted)', marginTop: 0 }}>
        {count} {t(ui.losses)}
      </p>

      {task.losses.map((loss) => (
        <LossCard key={loss.id} loss={loss} nameOf={nameOf} onNavigate={onNavigate} />
      ))}

      {task.comparison && (
        <>
          <h2 className="section-title">{t(ui.comparison)}</h2>
          <ComparisonTable table={task.comparison} nameOf={nameOf} />
        </>
      )}
    </div>
  );
}
