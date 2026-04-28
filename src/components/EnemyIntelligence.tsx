import { buildEnemyIntelligence } from '../utils/analytics';
import { Task } from '../types';

export function EnemyIntelligence({ tasks }: { tasks: Task[] }) {
  const intel = buildEnemyIntelligence(tasks);

  return (
    <section className="panel rounded-2xl p-5">
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">Enemy Intelligence</h2>
      <div className="mt-4 grid gap-2 md:grid-cols-4 text-sm">
        <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3">Frequent pattern: <span className="font-semibold">{intel.topSabotage ?? 'N/A'}</span></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3">Weakest hour block: <span className="font-semibold">{intel.topTimeBlock ?? 'N/A'}</span></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3">Failed category: <span className="font-semibold">{intel.topCategoryFailed ?? 'N/A'}</span></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3">Failed priority: <span className="font-semibold">{intel.topPriorityFailed ?? 'N/A'}</span></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3">Weekly execution: <span className="font-semibold">{intel.executionRate}%</span></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3">Completed missions: <span className="font-semibold">{intel.weekCompleted}</span></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3">Failed missions: <span className="font-semibold">{intel.weekFailed}</span></div>
        <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/15 p-3">Strategic recommendation: <span className="font-semibold">{intel.strategicRecommendation}</span></div>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-slate-300">
        {intel.insights.length === 0 ? <li>No hostile pattern detected yet.</li> : intel.insights.map((line) => <li key={line}>• {line}</li>)}
      </ul>
    </section>
  );
}
