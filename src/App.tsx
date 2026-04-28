import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AppView, FailureLog, Task } from './types';
import { buildEnemyIntelligence } from './utils/analytics';
import { getDateKey } from './utils/date';
import { defaultSettings, loadSettings, loadStreak, loadTasks, resetAllData, saveSettings, saveStreak, saveTasks } from './utils/storage';
import { FailureModal } from './components/FailureModal';
import { TaskCard } from './components/TaskCard';
import { SettingsPanel } from './components/SettingsPanel';
import { EnemyIntelligence } from './components/EnemyIntelligence';
import { OperationLog } from './components/OperationLog';
import { RecoveryProtocol } from './components/RecoveryProtocol';
import { DailySnapshot } from './components/DailySnapshot';
import { DominantPattern } from './components/DominantPattern';
import { Sidebar } from './components/Sidebar';
import { MissionHeader } from './components/MissionHeader';
import { TodayOrders } from './components/TodayOrders';
import { KnowYourEnemy } from './components/KnowYourEnemy';

const createId = () => crypto.randomUUID();

const doctrineEs = [
  'No necesitas motivación. Necesitas obedecer la misión.',
  'La excusa se debilita cuando la nombras.',
  'El día no se pierde por fallar. Se pierde por abandonar.',
  'No busques sentirte listo. Ejecuta.',
  'El enemigo quiere comodidad. Tú quieres control.',
  'Una mala hora no decide el día.',
  'Cambia la rueda. Sigue conduciendo.',
  'La siguiente acción correcta es suficiente.',
];

const doctrineEn = [
  'Your mission does not wait for your mood.',
  'Name the pattern and break the spell.',
  'A bad hour does not decide the day.',
  'Execute first. Meaning follows action.',
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [settings, setSettings] = useState(() => loadSettings());
  const [streak, setStreak] = useState(() => loadStreak());
  const [view, setView] = useState<AppView>('today');
  const [failureTask, setFailureTask] = useState<Task | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const todayKey = getDateKey();

  useEffect(() => saveTasks(tasks), [tasks]);
  useEffect(() => saveSettings(settings), [settings]);
  useEffect(() => saveStreak(streak), [streak]);

  useEffect(() => {
    document.documentElement.classList.remove('accent-steel', 'accent-crimson', 'accent-gold', 'accent-terminal');
    document.documentElement.classList.add(`accent-${settings.accent}`);
  }, [settings.accent]);

  useEffect(() => {
    if (!statusMessage) return;
    const timeout = setTimeout(() => setStatusMessage(''), 2200);
    return () => clearTimeout(timeout);
  }, [statusMessage]);

  const todayTasks = useMemo(() => tasks.filter((task) => task.dateKey === todayKey), [tasks, todayKey]);
  const completed = todayTasks.filter((task) => task.status === 'completed').length;
  const pending = todayTasks.filter((task) => task.status === 'pending').length;
  const failed = todayTasks.filter((task) => task.status === 'failed').length;
  const progress = todayTasks.length ? (completed / todayTasks.length) * 100 : 0;

  const doctrineSource = settings.languageMode === 'Spanish' ? doctrineEs : doctrineEn;
  const doctrine = doctrineSource[Math.abs(todayKey.split('-').join('').split('').reduce((acc, digit) => acc + Number(digit), 0)) % doctrineSource.length];

  const dominantEnemyToday = buildEnemyIntelligence(todayTasks).topSabotage;
  const latestFailed = [...todayTasks].reverse().find((task) => task.status === 'failed');
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
        if (status === 'completed') return { ...task, status, completedAt: new Date().toISOString() };
        if (status === 'pending') return { ...task, status, failedAt: undefined, failureReason: undefined, sabotageCategory: undefined, nextCorrectAction: undefined, excuse: undefined };
        return task;
      }),
    );

    if (status === 'completed') {
      setStreak((value) => value + 1);
      setStatusMessage('Executed. Momentum secured.');
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

  const dangerousPrefix = settings.dangerousMode ? 'No excuses. ' : '';
  const dominantPatternText = !dominantEnemyToday
    ? 'No hostile pattern logged today.'
    : `${dangerousPrefix}${dominantEnemyToday} is active today.`;

  return (
    <div className="min-h-screen text-slate-100">
      <div className="mx-auto grid max-w-[1540px] grid-cols-1 gap-4 p-4 lg:grid-cols-[260px_minmax(0,1fr)_340px] lg:p-6">
        <Sidebar view={view} onNavigate={setView} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <main className="space-y-4">
          <MissionHeader progress={progress} streak={streak} />
          {statusMessage && <p className="rounded-xl border accent-border accent-bg-soft px-3 py-2 text-sm">{statusMessage}</p>}

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
            {view === 'today' && (
              <>
                <TodayOrders onCreate={handleCreateTask} editingTask={editingTask} />
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
                        onDelete={(id) => setTasks((prev) => prev.filter((taskItem) => taskItem.id !== id))}
                        onEdit={(taskToEdit) => setEditingTaskId(taskToEdit.id)}
                      />
                    ))
                  )}
                </div>
              </>
            )}

            {view === 'knowEnemy' && <KnowYourEnemy />}
            {view === 'intelligence' && <EnemyIntelligence tasks={tasks} />}
            {view === 'history' && <OperationLog tasks={tasks} todayKey={todayKey} />}
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
          </motion.div>
        </main>

        <section className="space-y-4">
          <DailySnapshot
            completed={completed}
            pending={pending}
            failed={failed}
            streak={streak}
            progress={progress}
            doctrine={doctrine}
            showDoctrine={settings.showDailyDoctrine}
          />
          <DominantPattern text={dominantPatternText} />
          <RecoveryProtocol task={latestFailed} />
        </section>
      </div>

      <FailureModal task={failureTask} onClose={() => setFailureTask(null)} onSubmit={handleFailureSubmit} />
    </div>
  );
}
