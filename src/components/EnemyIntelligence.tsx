import { buildEnemyIntelligence } from '../utils/analytics';
import { Task } from '../types';

export function EnemyIntelligence({ tasks }: { tasks: Task[] }) {
  const intel = buildEnemyIntelligence(tasks);

  return (
    <section className="panel rounded-2xl p-5">
      <h2 className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Enemy Intelligence</h2>
      <div className="mt-4 grid gap-2 md:grid-cols-5 text-sm">
        <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3">Completed (7d): <span className="font-semibold">{intel.weekCompleted}</span></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3">Failed (7d): <span className="font-semibold">{intel.weekFailed}</span></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3">Top Enemy: <span className="font-semibold">{intel.topSabotage ?? 'N/A'}</span></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3">Weakest Time: <span className="font-semibold">{intel.topTimeBlock ?? 'N/A'}</span></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3">Weakest Priority: <span className="font-semibold">{intel.topPriorityFailed ?? 'N/A'}</span></div>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-slate-300">
        {intel.insights.length === 0 ? <li>No hostile pattern detected yet.</li> : intel.insights.map((line) => <li key={line}>• {line}</li>)}
      </ul>
    </section>
  );
}
