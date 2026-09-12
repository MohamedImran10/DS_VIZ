import { ArrowDownLeft, CornerDownRight, List, ListOrdered, ListTree, Search, Trash2 } from 'lucide-react';

const helperBadges = ['BST', 'AVL', 'RB', 'B-Tree', '2-3'];

export default function ControlPanel({
  value,
  selectedKind,
  onValueChange,
  onInsert,
  onDelete,
  onSearch,
  onReset,
  onTraverse,
  traversalResult,
}) {
  const onInput = (setter) => (event) => setter(event.target.value);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/6 p-3 shadow-glow backdrop-blur-xl sm:rounded-3xl sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/70 sm:text-sm sm:tracking-[0.24em]">Control Panel</p>
          <h2 className="mt-0.5 text-base font-semibold text-white sm:mt-1 sm:text-xl">Operate the active {selectedKind}</h2>
        </div>

        <div className="flex flex-wrap gap-1 sm:gap-2">
          {helperBadges.map((badge) => (
            <span key={badge} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-200 sm:px-3 sm:py-1 sm:text-xs">
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/50 p-3 sm:mt-5 sm:rounded-2xl sm:p-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-100 sm:mb-2 sm:text-sm">Value to insert, delete, or search</label>
        <input
          value={value}
          onChange={onInput(onValueChange)}
          type="text"
          inputMode="numeric"
          placeholder="Enter a number"
          className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-base text-white outline-none transition placeholder:text-slate-300 focus:border-amber-300/70 focus:ring-2 focus:ring-amber-400/20 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-lg"
        />

        <div className="mt-3 flex flex-wrap gap-2 sm:mt-4 sm:gap-3">
          <button
            type="button"
            onClick={onInsert}
            className="inline-flex items-center justify-center whitespace-nowrap gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-2 text-sm font-medium text-slate-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-base"
          >
            <ArrowDownLeft size={16} />
            Insert
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center justify-center whitespace-nowrap gap-1.5 rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-500/20 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-base"
          >
            <Trash2 size={16} />
            Delete
          </button>
          <button
            type="button"
            onClick={onSearch}
            className="inline-flex items-center justify-center whitespace-nowrap gap-1.5 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/20 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-base"
          >
            <Search size={16} />
            Search
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center whitespace-nowrap gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-base"
          >
            <CornerDownRight size={16} />
            Reset structure
          </button>
        </div>

        <div className="mt-3 border-t border-white/10 pt-3 sm:mt-4 sm:pt-4">
          <p className="mb-1.5 text-xs font-medium text-slate-100 sm:mb-2 sm:text-sm">Traversals</p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => onTraverse('inorder')}
              className="inline-flex items-center justify-center whitespace-nowrap gap-1.5 rounded-xl border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-100 transition hover:bg-violet-500/20 sm:rounded-2xl sm:px-4 sm:py-2.5 sm:text-sm"
            >
              <ListOrdered size={16} />
              Inorder
            </button>
            <button
              type="button"
              onClick={() => onTraverse('preorder')}
              className="inline-flex items-center justify-center whitespace-nowrap gap-1.5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/20 sm:rounded-2xl sm:px-4 sm:py-2.5 sm:text-sm"
            >
              <ListTree size={16} />
              Preorder
            </button>
            <button
              type="button"
              onClick={() => onTraverse('postorder')}
              className="inline-flex items-center justify-center whitespace-nowrap gap-1.5 rounded-xl border border-sky-400/20 bg-sky-500/10 px-3 py-2 text-sm font-medium text-sky-100 transition hover:bg-sky-500/20 sm:rounded-2xl sm:px-4 sm:py-2.5 sm:text-sm"
            >
              <List size={16} />
              Postorder
            </button>
          </div>

          {traversalResult && (
            <div className="mt-2.5 rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm leading-6 text-emerald-100 sm:mt-3 sm:px-4 sm:py-3 sm:text-base">
              {traversalResult}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}