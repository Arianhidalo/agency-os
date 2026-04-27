import { Category } from '../types';

export function CategoryBadge({ category }: { category: Category }) {
  return <span className="rounded-lg border border-slate-700 bg-slate-900/70 px-2 py-0.5 text-xs text-slate-300">{category}</span>;
}
