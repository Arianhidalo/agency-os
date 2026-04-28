import { Pencil, Skull, Trash2 } from 'lucide-react';
import { Task } from '../types';
import { CategoryBadge } from './CategoryBadge';
import { PriorityBadge } from './PriorityBadge';

interface Props {
  task: Task;
  compactMode: boolean;
  onComplete: (id: string) => void;
  onFail: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const statusStyle = {
  pending: 'border-slate-700 text-slate-300 bg-slate-900/45',
  completed: 'border-emerald-900/60 text-emerald-300 bg-emerald-950/20',
  failed: 'border-red-900/60 text-red-300 bg-red-950/20',
} as const;

const statusText = {
  pending: 'PENDING',
  completed: 'EXECUTED',
  failed: 'PATTERN DETECTED',
} as const;

export function TaskCard({ task, compactMode, onComplete, onFail, onDelete, onEdit }: Props) {
  return (
    <article className={`panel rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-600/60 ${task.status === 'completed' ? 'border-emerald-900/60' : task.status === 'failed' ? 'border-red-900/60' : 'border-slate-800'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-slate-100">{task.title}</h3>
          {!compactMode && task.note && <p className="mt-1 text-sm text-slate-400">{task.note}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <CategoryBadge category={task.category} />
            <PriorityBadge priority={task.priority} />
            <span className="rounded-lg border border-slate-700 px-2 py-0.5 text-xs text-slate-400">{task.timeBlock}</span>
            <span className={`rounded-lg border px-2 py-0.5 text-xs uppercase ${statusStyle[task.status]}`}>{statusText[task.status]}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1 sm:flex">
          <button onClick={() => onComplete(task.id)} className="rounded-lg border border-emerald-900/60 bg-emerald-950/15 px-2.5 py-1.5 text-xs text-emerald-300 hover:bg-emerald-950/30">Execute</button>
          <button onClick={() => onFail(task.id)} className="rounded-lg border border-red-900/60 bg-red-950/15 px-2.5 py-1.5 text-xs text-red-300 hover:bg-red-950/30">Failed</button>
          <button onClick={() => onEdit(task)} className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800/80" title="Edit"><Pencil size={14} /></button>
          <button onClick={() => onDelete(task.id)} className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800/80" title="Delete"><Trash2 size={14} /></button>
        </div>
      </div>
    </article>
  );
}
