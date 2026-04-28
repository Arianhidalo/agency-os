import { Priority } from '../types';

const styles: Record<Priority, string> = {
  Low: 'text-slate-300 border-slate-700 bg-slate-900/70',
  Medium: 'text-sky-300 border-sky-900/70 bg-sky-950/25',
  High: 'text-amber-300 border-amber-900/70 bg-amber-950/20',
  Critical: 'text-red-300 border-red-900/70 bg-red-950/20',
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`rounded-lg border px-2 py-0.5 text-xs ${styles[priority]}`}>{priority}</span>;
}
