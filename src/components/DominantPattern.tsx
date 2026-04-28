import { AlertTriangle } from 'lucide-react';

export function DominantPattern({ text }: { text: string }) {
  return (
    <section className="panel rounded-2xl p-4 text-sm">
      <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Dominant Pattern</h3>
      <p className="mt-2 flex items-start gap-2 text-slate-300"><AlertTriangle size={14} className="mt-0.5 text-red-300" /> {text}</p>
    </section>
  );
}
