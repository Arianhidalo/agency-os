import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, History, Settings, SunMedium } from 'lucide-react';
import { DashboardHeader } from './components/DashboardHeader';
import { DailyStats } from './components/DailyStats';
import { EnemyIntelligence } from './components/EnemyIntelligence';
import { FailureModal } from './components/FailureModal';
import { HistoryPanel } from './components/HistoryPanel';
import { RecoveryProtocol } from './components/RecoveryProtocol';
import { SettingsPanel } from './components/SettingsPanel';
import { TaskCard } from './components/TaskCard';
import { TaskInput } from './components/TaskInput';
import { STRATEGIC_PHRASES } from './data/constants';
import { AppView, FailureLog, Task } from './types';
import { buildEnemyIntelligence } from './utils/analytics';
import { getDateKey } from './utils/date';
import { defaultSettings, loadSettings, loadStreak, loadTasks, resetAllData, saveSettings, saveStreak, saveTasks } from './utils/storage';

const createId = () => crypto.randomUUID();

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [settings, setSettings] = useState(() => loadSettings());
  const [streak, setStreak] = useState(() => loadStreak());
  const [view, setView] = useState<AppView>('today');
  const [failureTask, setFailureTask] = useState<Task | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const todayKey = getDateKey();

  useEffect(() => saveTasks(tasks), [tasks]);
  useEffect(() => saveSettings(settings), [settings]);
  useEffect(() => saveStreak(streak), [streak]);

  useEffect(() => {
    document.documentElement.classList.remove('accent-steel', 'accent-crimson', 'accent-gold');
    document.documentElement.classList.add(`accent-${settings.accent}`);
  }, [settings.accent]);

  useEffect(() => {
    if (!statusMessage) return;
    const timeout = setTimeout(() => setStatusMessage(''), 1800);
    return () => clearTimeout(timeout);
  }, [statusMessage]);

  const todayTasks = useMemo(() => tasks.filter((t) => t.dateKey === todayKey), [tasks, todayKey]);
  const completed = todayTasks.filter((t) => t.status === 'completed').length;
  const pending = todayTasks.filter((t) => t.status === 'pending').length;
  const failed = todayTasks.filter((t) => t.status === 'failed').length;
  const progress = todayTasks.length ? (completed / todayTasks.length) * 100 : 0;

  const phrase = settings.motivationalPhrases
    ? STRATEGIC_PHRASES[Math.abs(todayKey.split('-').join('').split('').reduce((a, b) => a + Number(b), 0)) % STRATEGIC_PHRASES.length]
    : 'Execute the next correct action.';

  const dominantEnemyToday = buildEnemyIntelligence(todayTasks).topSabotage;
  const latestFailed = [...todayTasks].reverse().find((t) => t.status === 'failed');
  const editingTask = editingTaskId ? tasks.find((task) => task.id === editingTaskId) ?? null : null;

  const handleCreateTask = (payload: Pick<Task, 'title' | 'note' | 'category' | 'priority' | 'timeBlock'>) => {
    if (editingTaskId) {
      setTasks((prev) => prev.map((task) => (task.id === editingTaskId ? { ...task, ...payload } : task)));
      setEditingTaskId(null);
      setStatusMessage('Order updated. Continue execution.');
      return;
    }

    setTasks((prev) => [
      {
        id: createId(),
        dateKey: todayKey,
        createdAt: new Date().toISOString(),
        status: 'pending',
        ...payload,
      },
      ...prev,
    ]);
    setStatusMessage('New order locked.');
  };

  const setStatus = (id: string, status: Task['status']) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        if (status === 'completed') {
          return {
            ...task,
            status,
            completedAt: new Date().toISOString(),
          };
        }
        if (status === 'pending') {
          return {
            ...task,
            status,
            failedAt: undefined,
            failureReason: undefined,
            sabotageCategory: undefined,
            nextCorrectAction: undefined,
            excuse: undefined,
          };
        }
        return task;
      }),
    );
    if (status === 'completed') {
      setStreak((s) => s + 1);
      setStatusMessage('Executed.');
    }
  };

  const handleFailureSubmit = (taskId: string, payload: FailureLog) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: 'failed',
              failedAt: new Date().toISOString(),
              sabotageCategory: payload.sabotageCategory,
              failureReason: payload.whatHappened,
              excuse: payload.excuse,
              nextCorrectAction: payload.nextCorrectAction,
            }
          : task,
      ),
    );
    setStatusMessage('Damage contained. Resume the mission.');
  };

  const nav = [
    { key: 'today', label: 'Today', icon: SunMedium },
    { key: 'intelligence', label: 'Enemy Intelligence', icon: Brain },
    { key: 'history', label: 'History', icon: History },
    { key: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen text-slate-100">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-4 p-4 lg:grid-cols-[240px_minmax(0,1fr)_340px] lg:p-6">
        <aside className="panel rounded-2xl p-3">
          <p className="px-2 text-[10px] uppercase tracking-[0.32em] text-slate-500">Command Deck</p>
          <nav className="mt-3 space-y-1">
            {nav.map((item) => (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition ${view === item.key ? 'accent-bg-soft accent-border border text-slate-100' : 'border border-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-900/70 hover:text-slate-200'}`}
              >
                <item.icon size={14} /> {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="space-y-4">
          <DashboardHeader progress={progress} />
          {statusMessage && <p className="rounded-xl border accent-border accent-bg-soft px-3 py-2 text-sm">{statusMessage}</p>}

          {view === 'today' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
              <TaskInput onCreate={handleCreateTask} editingTask={editingTask} />
              <div className="space-y-3">
                {todayTasks.length === 0 ? (
                  <div className="panel rounded-2xl p-8 text-center text-slate-500">No orders assigned. Define the mission.</div>
                ) : (
                  todayTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      compactMode={settings.compactMode}
                      onComplete={(id) => setStatus(id, 'completed')}
                      onFail={(id) => {
                        setFailureTask(tasks.find((taskItem) => taskItem.id === id) ?? null);
                        setStatusMessage('Pattern detected. Name the enemy.');
                      }}
                      onReset={(id) => setStatus(id, 'pending')}
                      onDelete={(id) => setTasks((prev) => prev.filter((taskItem) => taskItem.id !== id))}
                      onEdit={(taskToEdit) => setEditingTaskId(taskToEdit.id)}
                    />
                  ))
                )}
              </div>
            </motion.div>
          )}

          {view === 'intelligence' && <EnemyIntelligence tasks={tasks} />}
          {view === 'history' && <HistoryPanel tasks={tasks} todayKey={todayKey} />}
          {view === 'settings' && (
            <SettingsPanel
              settings={settings}
              onUpdate={setSettings}
              onResetData={() => {
                resetAllData();
                setTasks([]);
                setSettings(defaultSettings);
                setStreak(0);
                setEditingTaskId(null);
                setStatusMessage('All data purged. Fresh mission day.');
              }}
            />
          )}
        </main>

        <section className="space-y-4">
          <DailyStats completed={completed} pending={pending} failed={failed} streak={streak} progress={progress} phrase={phrase} />
          <section className="panel rounded-2xl p-4 text-sm">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Dominant Pattern</h3>
            <p className="mt-2 text-slate-300">{dominantEnemyToday ? `Enemy Pattern Detected: ${dominantEnemyToday}` : 'No hostile pattern logged today.'}</p>
          </section>
          <RecoveryProtocol task={latestFailed} />
        </section>
      </div>
      <FailureModal task={failureTask} onClose={() => setFailureTask(null)} onSubmit={handleFailureSubmit} />
    </div>
  );
}
