import type { TaskDef } from '../data/types';
import { useLang } from '../i18n/LanguageContext';
import { ui } from '../i18n/ui';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from '../i18n/LanguageToggle';

type Props = {
  tasks: TaskDef[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function Sidebar({ tasks, activeId, onSelect }: Props) {
  const { t } = useLang();
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="title">{t(ui.brandTitle)}</span>
        <span className="subtitle">{t(ui.brandSubtitle)}</span>
      </div>
      <nav>
        <ul className="nav-list">
          {tasks.map((task) => (
            <li key={task.id}>
              <button
                className={`nav-item ${task.id === activeId ? 'active' : ''}`}
                onClick={() => onSelect(task.id)}
              >
                <span className="nav-emoji" aria-hidden>
                  {task.emoji}
                </span>
                {t(task.short)}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-foot">
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </aside>
  );
}
