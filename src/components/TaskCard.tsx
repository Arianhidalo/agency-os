import { Check, Pencil, RotateCcw, Skull, Trash2 } from 'lucide-react';
import { Task } from '../types';
import { CategoryBadge } from './CategoryBadge';
import { PriorityBadge } from './PriorityBadge';

interface Props {
  task: Task;
  compactMode: boolean;
  onComplete: (id: string) => void;
  onFail: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, compactMode, onComplete, onFail, onReset, onDelete, onEdit }: Props) {
  return (
    <article className="panel rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-600/60">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-slate-100">{task.title}</h3>
          {!compactMode && task.note && <p className="mt-1 text-sm text-slate-400">{task.note}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <CategoryBadge category={task.category} />
            <PriorityBadge priority={task.priority} />
            <span className="rounded-lg border border-slate-700 px-2 py-0.5 text-xs text-slate-400">{task.timeBlock}</span>
            <span className="rounded-lg border border-slate-700 px-2 py-0.5 text-xs uppercase text-slate-300">{task.status}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1 sm:flex">
          <button onClick={() => onComplete(task.id)} className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800/80" title="Executed"><Check size={14} /></button>
          <button onClick={() => onFail(task.id)} className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800/80" title="Failed"><Skull size={14} /></button>
          <button onClick={() => onReset(task.id)} className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800/80" title="Reset"><RotateCcw size={14} /></button>
          <button onClick={() => onEdit(task)} className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800/80" title="Edit"><Pencil size={14} /></button>
          <button onClick={() => onDelete(task.id)} className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800/80" title="Delete"><Trash2 size={14} /></button>
        </div>
      </div>
    </article>
  );
}
