import { useState } from 'react';
import { tasks } from './data/registry';
import { Sidebar } from './app/Sidebar';
import { TaskPage } from './app/TaskPage';

export function App() {
  const [activeId, setActiveId] = useState<string>(tasks[0].id);
  const task = tasks.find((tk) => tk.id === activeId) ?? tasks[0];

  function select(id: string) {
    setActiveId(id);
    if (typeof window.scrollTo === 'function') window.scrollTo({ top: 0 });
  }

  return (
    <div className="app">
      <Sidebar tasks={tasks} activeId={activeId} onSelect={select} />
      <main className="main">
        <div className="main-inner">
          <TaskPage task={task} key={task.id} />
        </div>
      </main>
    </div>
  );
}
