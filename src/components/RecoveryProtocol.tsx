import { Task } from '../types';

const sabotageAction: Record<string, string> = {
  'The Negotiator': 'Empieza durante 5 minutos. No negocies con la excusa.',
  'The Seducer': 'Cierra la fuente de dopamina. Vuelve al objetivo.',
  'The Arsonist': 'No destruyas el día por una grieta. Cambia la rueda y sigue.',
  'The Assassin': 'No discutas con la vergüenza. Ejecuta una acción mínima ahora.',
  'The Nihilist': 'Actúa primero. El significado se construye en movimiento.',
};

export function RecoveryProtocol({ task }: { task?: Task | null }) {
  return (
    <section className="panel rounded-2xl p-4 text-sm">
      <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Recovery Protocol</h3>
      {!task ? (
        <p className="mt-3 text-slate-400">No active incident. Stay disciplined.</p>
      ) : (
        <>
          <p className="mt-3"><strong>ACKNOWLEDGE:</strong> He fallado.</p>
          <p className="mt-1"><strong>CONTAIN:</strong> El daño termina aquí.</p>
          <p className="mt-1"><strong>RESUME:</strong> Ejecuto la siguiente acción correcta.</p>
          <p className="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-slate-300">{sabotageAction[task.sabotageCategory ?? ''] ?? task.nextCorrectAction ?? 'Ejecuta una acción mínima ahora.'}</p>
        </>
      )}
    </section>
  );
}
