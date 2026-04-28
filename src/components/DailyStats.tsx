import { ProgressRing } from './ProgressRing';

interface Props {
  completed: number;
  pending: number;
  failed: number;
  streak: number;
  progress: number;
  phrase: string;
}

export function DailyStats({ completed, pending, failed, streak, progress, phrase }: Props) {
  return (
    <section className="panel rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Daily Snapshot</h2>
        <span className="rounded border border-slate-700/70 px-2.5 py-1 text-xs text-slate-300">Streak {streak}</span>
      </div>
      <div className="grid place-items-center">
        <ProgressRing value={progress} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5"><p className="text-slate-500">Executed</p><p className="mt-1 text-base font-semibold">{completed}</p></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5"><p className="text-slate-500">Pending</p><p className="mt-1 text-base font-semibold">{pending}</p></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5"><p className="text-slate-500">Failed</p><p className="mt-1 text-base font-semibold">{failed}</p></div>
      </div>
      <p className="mt-4 border-l-2 accent-border pl-3 text-sm text-slate-300">{phrase}</p>
    </section>
  );
}
