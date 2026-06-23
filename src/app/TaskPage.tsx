import { useState } from 'react';
import type { TaskDef } from '../data/types';
import { useLang } from '../i18n/LanguageContext';
import { ui } from '../i18n/ui';
import { LearnView } from './LearnView';
import { Playground } from '../components/Playground';

type Tab = 'learn' | 'playground';

export function TaskPage({ task }: { task: TaskDef }) {
  const { t } = useLang();
  const [tab, setTab] = useState<Tab>('learn');

  return (
    <div>
      <header className="task-header">
        <h1>
          {task.emoji} {t(task.title)}
        </h1>
        <p className="blurb">{t(task.blurb)}</p>
      </header>

      <div className="tabs" role="tablist">
        <button
          className={`tab ${tab === 'learn' ? 'active' : ''}`}
          onClick={() => setTab('learn')}
          role="tab"
          aria-selected={tab === 'learn'}
        >
          {t(ui.learn)}
        </button>
        <button
          className={`tab ${tab === 'playground' ? 'active' : ''}`}
          onClick={() => setTab('playground')}
          role="tab"
          aria-selected={tab === 'playground'}
        >
          {t(ui.playground)}
        </button>
      </div>

      {tab === 'learn' ? <LearnView task={task} /> : <Playground task={task} />}
    </div>
  );
}
