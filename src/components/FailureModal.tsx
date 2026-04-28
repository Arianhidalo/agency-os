import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { SABOTAGE_PROFILES } from '../data/constants';
import { FailureLog, SabotageCategory, Task } from '../types';

interface Props {
  task: Task | null;
  onClose: () => void;
  onSubmit: (taskId: string, payload: FailureLog) => void;
}

export function FailureModal({ task, onClose, onSubmit }: Props) {
  const [sabotageCategory, setCategory] = useState<SabotageCategory>('The Negotiator');
  const [whatHappened, setWhatHappened] = useState('');
  const [excuse, setExcuse] = useState('');
  const [nextCorrectAction, setNextCorrectAction] = useState('');

  const profile = useMemo(() => SABOTAGE_PROFILES[sabotageCategory], [sabotageCategory]);
  useEffect(() => {
    if (!task) return;
    setCategory('The Negotiator');
    setWhatHappened('');
    setExcuse('');
    setNextCorrectAction('');
  }, [task]);

  if (!task) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!whatHappened.trim() || !excuse.trim() || !nextCorrectAction.trim()) return;
    onSubmit(task.id, { sabotageCategory, whatHappened, excuse, nextCorrectAction });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-3 backdrop-blur-sm">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="panel-strong w-full max-w-2xl rounded-2xl p-5 shadow-2xl"
      >
        <div className="mb-3 flex items-center gap-2 text-red-300">
          <AlertTriangle size={16} />
          <p className="text-xs uppercase tracking-[0.22em]">Enemy Pattern Detected</p>
        </div>
        <h3 className="text-xl font-semibold">Why did the mission fail?</h3>
        <p className="mt-1 text-sm text-slate-400">Pattern detected. Name the enemy.</p>

        <select value={sabotageCategory} onChange={(e) => setCategory(e.target.value as SabotageCategory)} className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-900/70 p-2.5">
          {Object.keys(SABOTAGE_PROFILES).map((k) => <option key={k}>{k}</option>)}
        </select>

        <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-300">
          <p>{profile.description}</p>
          <p className="mt-2 text-slate-500">Examples: {profile.examples.join(' · ')}</p>
        </div>

        <textarea required value={whatHappened} onChange={(e) => setWhatHappened(e.target.value)} placeholder="What exactly happened?" className="mt-3 h-20 w-full rounded-xl border border-slate-700 bg-slate-900/70 p-2.5" />
        <textarea required value={excuse} onChange={(e) => setExcuse(e.target.value)} placeholder="What was the excuse?" className="mt-2 h-20 w-full rounded-xl border border-slate-700 bg-slate-900/70 p-2.5" />
        <textarea required value={nextCorrectAction} onChange={(e) => setNextCorrectAction(e.target.value)} placeholder="What is the next correct action?" className="mt-2 h-20 w-full rounded-xl border border-slate-700 bg-slate-900/70 p-2.5" />

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-700 px-3.5 py-2">Cancel</button>
          <button className="rounded-xl accent-bg-soft accent-border border px-3.5 py-2 font-semibold">Damage contained. Resume the mission.</button>
        </div>
      </motion.form>
    </div>
  );
}
