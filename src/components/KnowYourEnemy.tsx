import { EnemyCategoryCard } from './EnemyCategoryCard';
import { WheelProtocol } from './WheelProtocol';

const entries = [
  {
    title: 'EL NEGOCIADOR',
    subtitle: 'The Negotiator',
    description: 'Hace que rendirte parezca lógico. Te convence de que mañana será mejor, de que necesitas mejores condiciones o de que ahora no es el momento.',
    lie: 'Puedes hacerlo luego.',
    examples: ['Empiezo mañana.', 'Hoy no es eficiente.', 'Mejor cuando tenga más energía.', 'Solo necesito descansar un poco.'],
    counterattack: 'Empiezo ahora precisamente porque apareció esa excusa.',
  },
  {
    title: 'EL ASESINO',
    subtitle: 'The Assassin',
    description: 'Ataca tu identidad. Usa vergüenza, comparación y culpa para hacerte sentir pequeño. Si te sientes pequeño, actuarás pequeño.',
    lie: '¿Quién te crees que eres?',
    examples: ['No eres suficiente.', 'Siempre fallas.', 'La gente se va a reír.', 'Otros ya están demasiado por delante.'],
    counterattack: 'No necesito sentirme digno. Necesito ejecutar.',
  },
  {
    title: 'EL SEDUCTOR',
    subtitle: 'The Seducer',
    description: 'No argumenta. Te arrastra. Usa dopamina, comodidad, comida, redes sociales, porno, entretenimiento o distracciones para secuestrar tu atención.',
    lie: 'Esto hará que el dolor desaparezca.',
    examples: ['Solo miro el móvil 5 minutos.', 'Un episodio más.', 'Me merezco algo dulce.', 'Necesito relajarme.'],
    counterattack: 'Corto la fuente. Vuelvo a la misión.',
  },
  {
    title: 'EL NIHILISTA',
    subtitle: 'The Nihilist',
    description: 'Aparece cuando el camino se pone difícil. Cuestiona el sentido de todo para justificar abandonar.',
    lie: 'Nada de esto importa.',
    examples: ['¿Para qué esforzarse tanto?', 'La disciplina me hace infeliz.', 'La vida es corta.', 'Ser promedio está bien.'],
    counterattack: 'El significado no aparece antes de actuar. Se construye ejecutando.',
  },
  {
    title: 'EL INCENDIARIO',
    subtitle: 'The Arsonist',
    description: 'Convierte un fallo pequeño en una destrucción total. Usa una grieta para intentar demoler todo el sistema.',
    lie: 'El día ya está arruinado.',
    examples: ['Ya rompí la dieta, ahora da igual.', 'Ya perdí la racha.', 'Ya fallé hoy.', 'Empiezo otra vez mañana.'],
    counterattack: 'No pincho las otras tres ruedas. Cambio la rueda y sigo.',
  },
];

export function KnowYourEnemy() {
  return (
    <section className="panel rounded-2xl p-5">
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">Archive</p>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-400">
            <li>Manual de campo</li>
            <li>Nombra el patrón</li>
            <li>Rompe el hechizo</li>
            <li>Si puedes verlo, puedes vencerlo</li>
          </ul>
        </aside>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">CONOCE A TU ENEMIGO</p>
          <h2 className="mt-1 text-2xl font-semibold">La mayoría pierde contra un enemigo que ni siquiera sabe nombrar.</h2>
          <p className="mt-3 text-slate-300">Crees que estás peleando contra la economía, el cansancio, la falta de tiempo, la genética o el sistema. Pero muchas veces el verdadero operador está dentro de tu propia cabeza: negociando retiradas, justificando excusas y saboteando cada avance.</p>
          <p className="mt-3 rounded-xl border border-red-900/50 bg-red-950/20 p-3 text-red-200">El momento en que reconoces el patrón, el hechizo se rompe.</p>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-slate-500">ARCHIVO CLASIFICADO: EL ENEMIGO INTERNO</p>
          <div className="mt-3 space-y-2">
            {entries.map((entry) => (
              <EnemyCategoryCard key={entry.title} {...entry} />
            ))}
          </div>
          <div className="mt-4">
            <WheelProtocol />
          </div>
        </div>
      </div>
    </section>
  );
}
