import { Moon, Sun } from 'lucide-react';

export default function ModeToggle({ mode, setMode }) {
  const isLight = mode === 'light';

  return (
    <button
      type="button"
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      onClick={() => setMode(isLight ? 'dark' : 'light')}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--hover-subtle)] text-[var(--text-soft)] shadow-lg transition hover:bg-[var(--hover)] active:scale-95"
    >
      {isLight ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  );
}