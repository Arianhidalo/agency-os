import { motion } from 'framer-motion';

interface Props {
  title: string;
  subtitle: string;
  description: string;
  lie: string;
  examples: string[];
  counterattack: string;
}

export function EnemyCategoryCard({ title, subtitle, description, lie, examples, counterattack }: Props) {
  return (
    <motion.details className="group rounded-xl border border-slate-800 bg-slate-950/70 p-4" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <summary className="cursor-pointer list-none">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-red-300">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </summary>
      <div className="mt-3 space-y-2 text-sm text-slate-300">
        <p>{description}</p>
        <p className="rounded border border-red-900/60 bg-red-950/20 p-2"><span className="text-red-300">Mentira central:</span> {lie}</p>
        <ul className="space-y-1 text-slate-400">{examples.map((example) => <li key={example}>- {example}</li>)}</ul>
        <p className="rounded border border-emerald-900/60 bg-emerald-950/20 p-2"><span className="text-emerald-300">Contraataque:</span> {counterattack}</p>
      </div>
    </motion.details>
  );
}
