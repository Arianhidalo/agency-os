import { AppSettings } from '../types';

interface Props {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  onResetData: () => void;
}

export function SettingsPanel({ settings, onUpdate, onResetData }: Props) {
  return (
    <section className="panel rounded-2xl p-5">
      <h2 className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Settings</h2>
      <div className="mt-4 space-y-3">
        <label className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm">
          Compact mode
          <input type="checkbox" checked={settings.compactMode} onChange={(e) => onUpdate({ ...settings, compactMode: e.target.checked })} />
        </label>
        <label className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm">
          Strategic phrases
          <input type="checkbox" checked={settings.motivationalPhrases} onChange={(e) => onUpdate({ ...settings, motivationalPhrases: e.target.checked })} />
        </label>
        <label className="block rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm">
          Accent color
          <select value={settings.accent} onChange={(e) => onUpdate({ ...settings, accent: e.target.value as AppSettings['accent'] })} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900/70 p-2">
            <option value="steel">Steel Blue</option>
            <option value="crimson">Dark Crimson</option>
            <option value="gold">Muted Gold</option>
          </select>
        </label>
      </div>
      <button onClick={onResetData} className="mt-4 rounded-xl border border-red-900/60 bg-red-950/25 px-3 py-2 text-sm text-red-300">Reset all data</button>
    </section>
  );
}
