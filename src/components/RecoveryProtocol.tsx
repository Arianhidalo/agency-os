import { Task } from '../types';

const recommendations: Record<string, string> = {
  Fitness: 'Do 10 pushups now or schedule the next session. Do not let one missed workout become a lost day.',
  Business: 'Open the file. Work for 5 minutes. Restart the engine.',
  Health: 'Drink water. Eat the next clean meal. Do not slash the other three tires.',
};

export function RecoveryProtocol({ task }: { task?: Task }) {
  return (
    <section className="panel rounded-2xl p-4 text-sm">
      <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Recovery Protocol</h3>
      {!task ? (
        <p className="mt-3 text-slate-400">No active incident. Stay disciplined.</p>
      ) : (
        <>
          <p className="mt-3"><strong>Acknowledge:</strong> I slipped.</p>
          <p className="mt-1"><strong>Contain:</strong> The damage stops here.</p>
          <p className="mt-1"><strong>Resume:</strong> Execute the next correct action.</p>
          <p className="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-slate-300">{task.nextCorrectAction ?? recommendations[task.category] ?? 'Take one immediate action before negotiating again.'}</p>
        </>
      )}
    </section>
  );
}
