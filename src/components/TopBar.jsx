import { Binary, Layers3, RotateCcw, ShieldCheck, Sigma, TreePine, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ModeToggle from './ModeToggle.jsx';

const options = [
  { kind: 'BST', label: 'BST', icon: <TreePine size={16} /> },
  { kind: 'AVL', label: 'AVL', icon: <Binary size={16} /> },
  { kind: 'RBT', label: 'Red-Black', icon: <ShieldCheck size={16} /> },
  { kind: 'BTREE', label: 'B-Tree', icon: <Layers3 size={16} /> },
  { kind: 'T23', label: '2-3 Tree', icon: <Sigma size={16} /> },
];

export default function TopBar({ active, onChange, onReset, mode, setMode }) {
  const optionsRef = useRef(null);
  const containerRef = useRef(null);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const el = () => optionsRef.current;
    if (!container) return undefined;

    const check = () => {
      const cWidth = container.clientWidth || 0;
      if (cWidth < 640) {
        setIsOverflowing(true);
        return;
      }

      const opt = el();
      if (!opt) {
        setIsOverflowing(false);
        return;
      }

      const overflow = opt.scrollWidth > cWidth - 120;
      setIsOverflowing(overflow);
    };

    check();

    const ro = new ResizeObserver(() => check());
    ro.observe(container);
    const optEl = optionsRef.current;
    if (optEl) ro.observe(optEl);

    window.addEventListener('orientationchange', check);

    return () => {
      ro.disconnect();
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuOpen) return;
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      if (toggleRef.current && toggleRef.current.contains(e.target)) return;
      setMenuOpen(false);
    };

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('touchstart', onDocClick, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface-header)] backdrop-blur-xl">
      <div ref={containerRef} className="mx-auto flex max-w-[1600px] flex-col md:flex-row items-start md:items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3 lg:px-8">
        <div className="w-full md:w-auto">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--accent-fg)] sm:text-xs sm:tracking-[0.35em]">Advanced Data Structures</p>
          <h1 className="mt-1 text-lg font-semibold text-[var(--text-strong)] sm:mt-2 sm:text-2xl md:text-3xl">Interactive Visualizer</h1>
        </div>

        <div className="w-full md:w-auto flex items-center justify-end gap-2 sm:gap-3">
          <div className="flex-1 md:flex-none md:mr-2">
            {!isOverflowing ? (
              <div ref={optionsRef} className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-0.5 shadow-glow overflow-x-auto max-w-full sm:gap-2 sm:p-1">
                {options.map((option) => (
                  <button
                    key={option.kind}
                    type="button"
                    onClick={() => onChange(option.kind)}
                    className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium transition-all whitespace-nowrap sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm ${active === option.kind
                        ? 'btn-accent text-slate-950 shadow-lg shadow-[var(--accent-glow)]'
                        : 'text-[var(--text-soft)] hover:bg-[var(--hover)]'
                      }`}
                  >
                    {option.icon}
                    <span className="hidden sm:inline">{option.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="relative">
                <button
                  ref={toggleRef}
                  id="topbar-options-toggle"
                  type="button"
                  aria-expanded={menuOpen}
                  aria-controls="topbar-options-menu"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1.5 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--hover)] sm:p-2"
                >
                  {menuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>

                {menuOpen && (
                  <div
                    ref={menuRef}
                    id="topbar-options-menu"
                    className="absolute left-0 right-0 z-50 mt-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] p-2 shadow-lg backdrop-blur-xl sm:left-auto sm:right-0 sm:w-56 sm:p-3"
                  >
                    {options.map((option) => (
                      <button
                        key={option.kind}
                        type="button"
                        onClick={() => {
                          onChange(option.kind);
                          setMenuOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition sm:rounded-lg sm:py-2 ${active === option.kind ? 'bg-[var(--accent-soft)] text-[var(--accent-fg)]' : 'text-[var(--text-soft)] hover:bg-[var(--hover-subtle)]'
                          }`}
                      >
                        <span className="flex-shrink-0">{option.icon}</span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <ModeToggle mode={mode} setMode={setMode} />
        </div>
      </div>
    </header>
  );
}