import { BarChart3, Binary, Layers3, RotateCcw, ShieldCheck, Sigma, TreePine } from 'lucide-react';
import type { ReactNode } from 'react';
import type { StructureKind } from '../types';

const options: Array<{ kind: StructureKind; label: string; icon: ReactNode }> = [
  { kind: 'BST', label: 'BST', icon: <TreePine size={16} /> },
  { kind: 'AVL', label: 'AVL', icon: <Binary size={16} /> },
  { kind: 'RBT', label: 'Red-Black', icon: <ShieldCheck size={16} /> },
  { kind: 'BTREE', label: 'B-Tree', icon: <Layers3 size={16} /> },
  { kind: 'T23', label: '2-3 Tree', icon: <Sigma size={16} /> },
  { kind: 'SKIPLIST', label: 'Skip List', icon: <BarChart3 size={16} /> },
];

interface TopBarProps {
  active: StructureKind;
  onChange(kind: StructureKind): void;
  onReset(): void;
}

export default function TopBar({ active, onChange, onReset }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">Advanced Data Structures</p>
          <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">Interactive Visualizer</h1>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 shadow-glow overflow-x-auto max-w-full">
          {options.map((option) => (
            <button
              key={option.kind}
              type="button"
              onClick={() => onChange(option.kind)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                active === option.kind
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          <RotateCcw size={16} />
          Reset current structure
        </button>
      </div>
    </header>
  );
}