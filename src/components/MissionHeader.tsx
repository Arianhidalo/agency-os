import { Activity, Crosshair } from 'lucide-react';
import { formatLongDate } from '../utils/date';

interface Props {
  progress: number;
  streak: number;
}

export function MissionHeader({ progress, streak }: Props) {
  return (
    <header className="panel tactical-grid rounded-2xl p-6 md:p-7">
      <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-slate-500">Mission Control</p>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Command Day</h1>
          <p className="mt-1 text-sm text-slate-400">Name the enemy. Execute the mission.</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <Crosshair size={12} /> Mission code CD-XI-742
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm">
          <p>{formatLongDate()}</p>
          <p className="mt-1 text-xs text-slate-500">Progress {Math.round(progress)}%</p>
          <p className="text-xs text-slate-500">Streak {streak}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-emerald-300"><Activity size={12} /> Operational</p>
        </div>
      </div>
    </header>
  );
}
