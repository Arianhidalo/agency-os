import { Task } from '../types';

const statusTone = {
  completed: 'border-emerald-900/50 text-emerald-300 bg-emerald-950/20',
  failed: 'border-red-900/50 text-red-300 bg-red-950/20',
  pending: 'border-slate-700 text-slate-300 bg-slate-900/40',
} as const;

export function OperationLog({ tasks, todayKey }: { tasks: Task[]; todayKey: string }) {
  const history = tasks.filter((task) => task.dateKey !== todayKey).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <section className="panel rounded-2xl p-5">
      <h2 className="text-sm uppercase tracking-[0.2em] text-slate-400">Operation Log</h2>
      {history.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No historical operations recorded.</p>
      ) : (
        <div className="mt-3 space-y-2.5">
          {history.map((task) => (
            <article key={task.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{task.title}</p>
                <span className={`rounded border px-2 py-0.5 text-xs uppercase ${statusTone[task.status]}`}>{task.status === 'completed' ? 'EXECUTED' : task.status === 'failed' ? 'FAILED' : 'PENDING'}</span>
              </div>
              <p className="mt-1 text-slate-500">{task.dateKey} · {task.timeBlock} · {task.priority}</p>
              {task.sabotageCategory && <p className="mt-1 text-slate-300">Enemy: {task.sabotageCategory}</p>}
              {task.excuse && <p className="text-slate-400">Excuse: {task.excuse}</p>}
              {task.nextCorrectAction && <p className="text-slate-400">Next correct action: {task.nextCorrectAction}</p>}
              {task.status === 'failed' && task.nextCorrectAction && <p className="mt-1 text-xs text-emerald-300">CONTAINED / RESUMED</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
