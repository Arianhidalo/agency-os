import { ShieldCheck } from 'lucide-react';
import { formatLongDate } from '../utils/date';

export function DashboardHeader({ progress }: { progress: number }) {
  return (
    <header className="panel tactical-grid rounded-2xl p-6 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.34em] text-slate-500">Mission Control</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/90 p-2">
              <ShieldCheck size={16} className="accent-text" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold md:text-3xl">Command Day</h1>
              <p className="text-sm text-slate-400">Name the enemy. Execute the mission.</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-3 text-right">
          <p className="text-sm text-slate-300">{formatLongDate()}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">Progress {Math.round(progress)}%</p>
        </div>
      </div>
    </header>
  );
}
