import { FormEvent, useEffect, useState } from 'react';
import { CATEGORIES, PRIORITIES, TIME_BLOCKS } from '../data/constants';
import { Category, Priority, Task, TimeBlock } from '../types';

interface InputState {
  title: string;
  note: string;
  category: Category;
  priority: Priority;
  timeBlock: TimeBlock;
}

const initialState: InputState = {
  title: '',
  note: '',
  category: 'Deep Work',
  priority: 'High',
  timeBlock: 'Morning',
};

interface Props {
  onCreate: (payload: InputState) => void;
  editingTask?: Task | null;
}

export function TaskInput({ onCreate, editingTask }: Props) {
  const [form, setForm] = useState<InputState>(initialState);

  useEffect(() => {
    if (!editingTask) return;
    setForm({
      title: editingTask.title,
      note: editingTask.note ?? '',
      category: editingTask.category,
      priority: editingTask.priority,
      timeBlock: editingTask.timeBlock,
    });
  }, [editingTask]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onCreate(form);
    setForm(initialState);
  };

  return (
    <form onSubmit={submit} className="panel rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Today’s Orders</h2>
        {editingTask && <span className="rounded border accent-border px-2.5 py-1 text-xs accent-text">Edit Mode</span>}
      </div>
      <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Define mission objective" className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5" />
      <input value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} placeholder="Optional tactical note" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm" />
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as Category }))} className="rounded-xl border border-slate-700 bg-slate-900/70 px-2 py-2.5 text-sm">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as Priority }))} className="rounded-xl border border-slate-700 bg-slate-900/70 px-2 py-2.5 text-sm">{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select>
        <select value={form.timeBlock} onChange={(e) => setForm((p) => ({ ...p, timeBlock: e.target.value as TimeBlock }))} className="rounded-xl border border-slate-700 bg-slate-900/70 px-2 py-2.5 text-sm">{TIME_BLOCKS.map((t) => <option key={t}>{t}</option>)}</select>
      </div>
      <button className="mt-3 rounded-xl accent-bg-soft accent-border border px-4 py-2 text-sm font-semibold">
        {editingTask ? 'Update Order' : 'Add Order'}
      </button>
    </form>
  );
}
