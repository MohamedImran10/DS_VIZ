import { Paintbrush } from 'lucide-react';

export default function ThemeToggle() {
  return (
    <button
      type="button"
      aria-label="Theme: Violet"
      className="flex h-10 w-10 items-center justify-center rounded-full btn-accent shadow-lg shadow-[var(--accent-glow)] transition-transform hover:scale-105 active:scale-95 cursor-default"
    >
      <Paintbrush size={17} className="text-slate-950" />
    </button>
  );
}