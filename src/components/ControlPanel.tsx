import { ArrowDownLeft, ArrowRightLeft, CornerDownRight, Play, Search, Sparkles, Trash2 } from 'lucide-react';
import type { ChangeEvent } from 'react';
import type { StructureKind } from '../types';

interface ControlPanelProps {
  value: string;
  speed: number;
  maxSize: number;
  skipListMaxLevel: number;
  selectedKind: StructureKind;
  onValueChange(value: string): void;
  onSpeedChange(value: number): void;
  onMaxSizeChange(value: number): void;
  onSkipLevelChange(value: number): void;
  onInsert(): void;
  onDelete(): void;
  onSearch(): void;
  onReset(): void;
  onSeedSample(): void;
}

const helperBadges = ['BST', 'AVL', 'RB', 'B-Tree', '2-3', 'Skip'];

export default function ControlPanel({
  value,
  speed,
  maxSize,
  skipListMaxLevel,
  selectedKind,
  onValueChange,
  onSpeedChange,
  onMaxSizeChange,
  onSkipLevelChange,
  onInsert,
  onDelete,
  onSearch,
  onReset,
  onSeedSample,
}: ControlPanelProps) {
  const onInput = (setter: (next: string) => void) => (event: ChangeEvent<HTMLInputElement>) => setter(event.target.value);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/6 p-5 shadow-glow backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/70">Control Panel</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Operate the active {selectedKind}</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {helperBadges.map((badge) => (
            <span key={badge} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <label className="mb-2 block text-sm font-medium text-slate-200">Value to insert, delete, or search</label>
          <input
            value={value}
            onChange={onInput(onValueChange)}
            type="number"
            placeholder="Enter a number"
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-lg text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/70 focus:ring-2 focus:ring-amber-400/20"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onInsert}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3 font-medium text-slate-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110"
            >
              <ArrowDownLeft size={18} />
              Insert
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 font-medium text-rose-100 transition hover:bg-rose-500/20"
            >
              <Trash2 size={18} />
              Delete
            </button>
            <button
              type="button"
              onClick={onSearch}
              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 font-medium text-cyan-100 transition hover:bg-cyan-500/20"
            >
              <Search size={18} />
              Search
            </button>
            <button
              type="button"
              onClick={onSeedSample}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition hover:bg-white/10"
            >
              <Sparkles size={18} />
              Sample set
            </button>
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <label className="block text-sm font-medium text-slate-200">Structure size limit</label>
          <div className="flex items-center gap-3">
            <input
              value={maxSize}
              onChange={(event) => onMaxSizeChange(Number(event.target.value))}
              type="range"
              min="10"
              max="120"
              className="h-2 w-full accent-amber-400"
            />
            <input
              value={maxSize}
              onChange={(event) => onMaxSizeChange(Number(event.target.value))}
              type="number"
              min="10"
              max="120"
              className="w-24 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-white outline-none"
            />
          </div>

          <label className="block text-sm font-medium text-slate-200">Animation speed</label>
          <div className="flex items-center gap-3">
            <input
              value={speed}
              onChange={(event) => onSpeedChange(Number(event.target.value))}
              type="range"
              min="0.2"
              max="2"
              step="0.1"
              className="h-2 w-full accent-cyan-400"
            />
            <span className="w-16 text-right text-sm text-slate-300">{speed.toFixed(1)}x</span>
          </div>

          <label className="block text-sm font-medium text-slate-200">Skip list max level</label>
          <div className="flex items-center gap-3">
            <input
              value={skipListMaxLevel}
              onChange={(event) => onSkipLevelChange(Number(event.target.value))}
              type="range"
              min="3"
              max="10"
              className="h-2 w-full accent-fuchsia-400"
            />
            <input
              value={skipListMaxLevel}
              onChange={(event) => onSkipLevelChange(Number(event.target.value))}
              type="number"
              min="3"
              max="10"
              className="w-24 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-white outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition hover:bg-white/10"
            >
              <CornerDownRight size={18} />
              Reset structure
            </button>
            <button
              type="button"
              onClick={onInsert}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 font-medium text-emerald-100 transition hover:bg-emerald-500/20"
            >
              <Play size={18} />
              Run insert
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}