import { Task } from '../types';

export function HistoryPanel({ tasks, todayKey }: { tasks: Task[]; todayKey: string }) {
  const history = tasks.filter((t) => t.dateKey !== todayKey).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <section className="panel rounded-2xl p-5">
      <h2 className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Archive</h2>
      {history.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">No archived missions yet.</p>
      ) : (
        <div className="mt-3 space-y-2.5">
          {history.map((task) => (
            <div key={task.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm">
              <p className="font-medium">{task.title}</p>
              <p className="text-slate-500">{task.dateKey} · {task.status}</p>
              {task.sabotageCategory && <p className="text-slate-300">Enemy: {task.sabotageCategory}</p>}
              {task.failureReason && <p className="text-slate-400">Failure: {task.failureReason}</p>}
              {task.nextCorrectAction && <p className="text-slate-400">Next action: {task.nextCorrectAction}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
