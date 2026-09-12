import { Paintbrush } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const themes = [
  { id: 'sunset', from: '#fbbf24', to: '#f97316', label: 'Sunset' },
  { id: 'ocean', from: '#22d3ee', to: '#0ea5e9', label: 'Ocean' },
  { id: 'emerald', from: '#34d399', to: '#059669', label: 'Emerald' },
  { id: 'rose', from: '#fb7185', to: '#e11d48', label: 'Rose' },
  { id: 'violet', from: '#a78bfa', to: '#7c3aed', label: 'Violet' },
];

export default function ThemeToggle({ theme, setTheme }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onDown = (event) => {
      if (wrapperRef.current && wrapperRef.current.contains(event.target)) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-label="Change theme"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-full btn-accent shadow-lg shadow-[var(--accent-glow)] transition-transform hover:scale-105 active:scale-95"
      >
        <Paintbrush size={17} className="text-slate-950" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] p-3 shadow-xl backdrop-blur-xl">
          <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">Theme</p>
          <div className="flex items-center gap-2.5">
            {themes.map((option) => {
              const active = option.id === theme;
              return (
                <button
                  key={option.id}
                  type="button"
                  title={option.label}
                  aria-label={option.label}
                  onClick={() => {
                    setTheme(option.id);
                    setOpen(false);
                  }}
                  className={`h-9 w-9 rounded-full shadow-lg transition-transform hover:scale-110 ${active ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--ring-offset)]' : 'opacity-80 hover:opacity-100'}`}
                  style={{ backgroundImage: `linear-gradient(135deg, ${option.from}, ${option.to})` }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}