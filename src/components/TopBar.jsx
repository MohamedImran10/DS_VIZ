import { Binary, Layers3, RotateCcw, ShieldCheck, Sigma, TreePine, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const options = [
  { kind: 'BST', label: 'BST', icon: <TreePine size={16} /> },
  { kind: 'AVL', label: 'AVL', icon: <Binary size={16} /> },
  { kind: 'RBT', label: 'Red-Black', icon: <ShieldCheck size={16} /> },
  { kind: 'BTREE', label: 'B-Tree', icon: <Layers3 size={16} /> },
  { kind: 'T23', label: '2-3 Tree', icon: <Sigma size={16} /> },
];

export default function TopBar({ active, onChange, onReset }) {
  const optionsRef = useRef(null);
  const containerRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const el = () => optionsRef.current;
    if (!container) return undefined;

    const check = () => {
      const cWidth = container.clientWidth || 0;
      // Force hamburger on small screens (under sm / ~640px)
      if (cWidth < 640) {
        setIsOverflowing(true);
        return;
      }

      const opt = el();
      if (!opt) {
        // If options not mounted yet, don't assume inline; keep compact when small
        setIsOverflowing(false);
        return;
      }

      // consider some padding for the reset button
      const overflow = opt.scrollWidth > cWidth - 120;
      setIsOverflowing(overflow);
    };

    // initial check
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
      const menuEl = document.getElementById('topbar-options-menu');
      const btn = document.getElementById('topbar-options-toggle');
      if (menuEl && !menuEl.contains(e.target) && btn && !btn.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div ref={containerRef} className="mx-auto flex max-w-[1600px] flex-col md:flex-row items-start md:items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <div className="w-full md:w-auto">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">Advanced Data Structures</p>
          <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">Interactive Visualizer</h1>
        </div>

        <div className="w-full md:w-auto flex items-center justify-end gap-3">
          {/* Options - show inline when not overflowing, otherwise show hamburger */}
          <div className="flex-1 md:flex-none md:mr-2">
            {!isOverflowing ? (
              <div ref={optionsRef} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 shadow-glow overflow-x-auto max-w-full">
                {options.map((option) => (
                  <button
                    key={option.kind}
                    type="button"
                    onClick={() => onChange(option.kind)}
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all whitespace-nowrap ${active === option.kind
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30'
                        : 'text-slate-200 hover:bg-white/10'
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
                  id="topbar-options-toggle"
                  type="button"
                  aria-expanded={menuOpen}
                  aria-controls="topbar-options-menu"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-2 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  {menuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>

                {menuOpen && (
                  <div
                    id="topbar-options-menu"
                    className={`absolute z-50 mt-2 rounded-2xl border border-white/10 bg-slate-950/95 p-3 shadow-lg ${
                      /* full-width on small screens, anchored right on larger */
                      typeof window !== 'undefined' && window.innerWidth < 640 ? 'left-4 right-4' : 'right-0 w-56'
                      }`}
                    style={{ top: 'calc(100% + 8px)' }}
                  >
                    {options.map((option) => (
                      <button
                        key={option.kind}
                        type="button"
                        onClick={() => {
                          onChange(option.kind);
                          setMenuOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${active === option.kind ? 'bg-amber-400/10 text-amber-200' : 'text-slate-200 hover:bg-white/5'
                          }`}
                      >
                        <span className="mr-2">{option.icon}</span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                    {/* reset removed — control panel already provides reset */}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Reset handled in the ControlPanel; removed duplicate buttons here */}
        </div>
      </div>
    </header>
  );
}