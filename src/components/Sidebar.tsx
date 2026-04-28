import type { ComponentType } from 'react';
import { AlertTriangle, Brain, History, Menu, Settings, Shield, Target } from 'lucide-react';
import { AppView } from '../types';

interface Props {
  view: AppView;
  onNavigate: (view: AppView) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const items: Array<{ key: AppView; label: string; icon: ComponentType<{ size?: number }> }> = [
  { key: 'today', label: 'Today', icon: Target },
  { key: 'knowEnemy', label: 'Know Your Enemy', icon: AlertTriangle },
  { key: 'intelligence', label: 'Enemy Intelligence', icon: Brain },
  { key: 'history', label: 'History', icon: History },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ view, onNavigate, mobileOpen, setMobileOpen }: Props) {
  return (
    <>
      <button className="panel fixed right-4 top-4 z-40 rounded-xl p-2 lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
        <Menu size={16} />
      </button>
      <aside className={`panel fixed inset-y-0 left-0 z-30 w-72 translate-x-0 rounded-none p-4 transition-transform duration-300 lg:static lg:w-auto lg:rounded-2xl ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <p className="text-[10px] uppercase tracking-[0.34em] text-slate-500">Command Deck</p>
        <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">SYSTEM ONLINE</span>
            <span className="rounded border border-emerald-800/50 bg-emerald-950/50 px-2 py-0.5 text-emerald-300">SECURE</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-slate-500"><Shield size={12} /> Classified channel</div>
        </div>
        <nav className="mt-4 space-y-1.5">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                onNavigate(item.key);
                setMobileOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all ${view === item.key ? 'accent-bg-soft accent-border border text-white shadow-sm' : 'border-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-900/80 hover:text-slate-200'}`}
            >
              <item.icon size={14} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
