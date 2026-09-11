import { Clock3, CornerUpLeft, PlayCircle } from 'lucide-react';

export default function HistoryLog({ entries, activeEntryId, onReplay, onUndo }) {
  return (
    <aside className="flex h-full flex-col rounded-2xl border border-white/10 bg-slate-950/50 p-3 shadow-glow backdrop-blur-xl sm:rounded-3xl sm:p-5">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/70 sm:text-sm sm:tracking-[0.24em]">Operation History</p>
          <h2 className="mt-0.5 text-base font-semibold text-white sm:mt-1 sm:text-xl">Replay every step</h2>
        </div>
        <button
          type="button"
          onClick={onUndo}
          className="inline-flex items-center justify-center whitespace-nowrap gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 text-xs font-medium text-white transition hover:bg-white/10 sm:rounded-2xl sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"
        >
          <CornerUpLeft size={14} />
          Undo
        </button>
      </div>

      <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1 sm:mt-4 sm:space-y-3">
        {entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-3 text-xs text-slate-300 sm:rounded-2xl sm:p-5 sm:text-sm">
            No operations yet. Insert, delete, or search to populate the timeline.
          </div>
        ) : (
          entries.map((entry) => (
            <article
              key={entry.id}
              className={`rounded-xl border p-3 transition sm:rounded-2xl sm:p-4 ${
                activeEntryId === entry.id
                  ? 'border-amber-400/30 bg-amber-400/10 shadow-lg shadow-amber-500/10'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white sm:text-sm">{entry.message}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-400 sm:mt-1 sm:text-xs sm:tracking-[0.22em]">
                    {entry.kind} • {entry.operation}{entry.value !== undefined ? ` • ${entry.value}` : ''}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-300 sm:px-2 sm:py-1 sm:text-[11px]">
                  <Clock3 size={10} />
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onReplay(entry)}
                className="mt-2 inline-flex whitespace-nowrap w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-medium text-cyan-100 transition hover:bg-cyan-500/20 sm:mt-3 sm:rounded-2xl sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"
              >
                <PlayCircle size={14} />
                Replay
              </button>
            </article>
          ))
        )}
      </div>
    </aside>
  );
}