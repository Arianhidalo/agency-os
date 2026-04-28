export function WheelProtocol() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
      <h3 className="font-mono text-sm uppercase tracking-[0.2em] text-slate-200">EL PROTOCOLO DE LA RUEDA</h3>
      <p className="mt-2 text-sm text-slate-300">Si vas por la autopista y se pincha una rueda, no sales del coche a pinchar las otras tres. Cambias la rueda. Vuelves al coche. Sigues conduciendo. Llegas tarde, pero llegas.</p>
      <div className="mt-4 grid gap-2 md:grid-cols-3 text-sm">
        <div className="rounded-xl border border-slate-800 p-3"><p className="font-mono text-xs text-slate-500">1. RECONOCE</p><p>He fallado.</p></div>
        <div className="rounded-xl border border-slate-800 p-3"><p className="font-mono text-xs text-slate-500">2. CONTÉN</p><p>El daño termina aquí.</p></div>
        <div className="rounded-xl border border-slate-800 p-3"><p className="font-mono text-xs text-slate-500">3. REANUDA</p><p>Ejecuto la siguiente acción correcta ahora.</p></div>
      </div>
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-sm text-slate-300">
        <p>- Si comiste mal: Agua. Próxima comida limpia.</p>
        <p>- Si despertaste tarde: 10 flexiones. Día reactivado.</p>
        <p>- Si fallaste una tarea: 5 minutos de trabajo. Motor encendido.</p>
        <p>- Si perdiste tiempo en redes: Cierra la app. Vuelve al bloque.</p>
      </div>
      <p className="mt-3 text-sm text-slate-400">Un fallo es un evento. El enemigo quiere convertirlo en identidad. No cooperes.</p>
    </section>
  );
}
