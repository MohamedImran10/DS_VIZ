import { Clock3, CornerUpLeft, PlayCircle } from 'lucide-react';
import type { OperationHistoryEntry } from '../types';

interface HistoryLogProps {
  entries: OperationHistoryEntry[];
  activeEntryId: string | null;
  onReplay(entry: OperationHistoryEntry): void;
  onUndo(): void;
}

export default function HistoryLog({ entries, activeEntryId, onReplay, onUndo }: HistoryLogProps) {
  return (
    <aside className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-950/50 p-5 shadow-glow backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-emerald-200/70">Operation History</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Replay every step</h2>
        </div>
        <button
          type="button"
          onClick={onUndo}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          <CornerUpLeft size={16} />
          Undo
        </button>
      </div>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-300">
            No operations yet. Insert, delete, or search to populate the timeline.
          </div>
        ) : (
          entries.map((entry) => (
            <article
              key={entry.id}
              className={`rounded-2xl border p-4 transition ${
                activeEntryId === entry.id
                  ? 'border-amber-400/30 bg-amber-400/10 shadow-lg shadow-amber-500/10'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{entry.message}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">
                    {entry.kind} • {entry.operation}{entry.value !== undefined ? ` • ${entry.value}` : ''}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-[11px] text-slate-300">
                  <Clock3 size={12} />
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onReplay(entry)}
                className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/20"
              >
                <PlayCircle size={16} />
                Replay
              </button>
            </article>
          ))
        )}
      </div>
    </aside>
  );
}