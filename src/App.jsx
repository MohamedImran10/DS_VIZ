import { useEffect, useMemo, useRef, useState } from 'react';
import ControlPanel from './components/ControlPanel.jsx';
import HistoryLog from './components/HistoryLog.jsx';
import TopBar from './components/TopBar.jsx';
import VisualizerCanvas from './components/VisualizerCanvas.jsx';
import { createStructureEngine } from './engine/dataStructures.js';

const structureDescriptions = {
  BST: 'Classic binary search tree with path highlighting.',
  AVL: 'Self-balancing binary tree with rotation-aware animations.',
  RBT: 'Color-coded tree emphasizing recoloring and property fixes.',
  BTREE: 'Multi-key, multi-way tree with split and migration cues.',
  T23: 'Compact order-3 tree with node split and merge storytelling.',
};

const defaultFrame = { message: 'Ready', nodes: [], links: [] };

export default function App() {
  const engineMap = useRef(new Map());
  const [selectedKind, setSelectedKind] = useState('BST');
  const [value, setValue] = useState('');
  const [history, setHistory] = useState([]);
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [timeline, setTimeline] = useState([]);
  const [engineVersion, setEngineVersion] = useState(0);
  const [statusAlert, setStatusAlert] = useState({ open: false, message: '' });
  const [traversalResult, setTraversalResult] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('ads-theme') || 'violet');
  const [mode, setMode] = useState(() => localStorage.getItem('ads-mode') || 'dark');

  const engine = useMemo(() => {
    if (!engineMap.current.has(selectedKind)) {
      engineMap.current.set(selectedKind, createStructureEngine(selectedKind));
    }

    return engineMap.current.get(selectedKind);
  }, [selectedKind, engineVersion]);

  const clearAlerts = () => {
    setStatusAlert({ open: false, message: '' });
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('ads-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.dsMode = mode;
    localStorage.setItem('ads-mode', mode);
  }, [mode]);

  useEffect(() => {
    engineMap.current = new Map();
    setEngineVersion((v) => v + 1);
    setTimeline([defaultFrame]);
    setActiveFrameIndex(0);
    setActiveEntryId(null);
    setValue('');
    setHistory([]);
    setTraversalResult('');
    clearAlerts();
  }, [selectedKind]);

  const currentFrame = timeline[activeFrameIndex] ?? timeline.at(-1) ?? defaultFrame;
  const context = {};

  useEffect(() => {
    if (timeline.length <= 1) {
      setActiveFrameIndex(0);
      return undefined;
    }

    const interval = window.setInterval(() => {
      setActiveFrameIndex((index) => Math.min(index + 1, timeline.length - 1));
    }, 700);

    return () => window.clearInterval(interval);
  }, [timeline]);

  const runOperation = (operation) => {
    const trimmed = value.trim();
    if (!trimmed) {
      const invalidFrame = currentFrame?.nodes?.length || currentFrame?.links?.length
        ? { ...currentFrame, message: 'Enter a valid numeric value' }
        : { message: 'Enter a valid numeric value', nodes: [], links: [] };

      setTimeline([invalidFrame]);
      setActiveFrameIndex(0);
      setActiveEntryId(null);
      return;
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
      const invalidFrame = currentFrame?.nodes?.length || currentFrame?.links?.length
        ? { ...currentFrame, message: 'Enter a valid numeric value' }
        : { message: 'Enter a valid numeric value', nodes: [], links: [] };

      setTimeline([invalidFrame]);
      setActiveFrameIndex(0);
      setActiveEntryId(null);
      return;
    }

    const result = engine[operation](parsed, context);
    const treeKinds = new Set(['BST', 'AVL', 'RBT', 'BTREE', 'T23']);
    const isTreeSearch = treeKinds.has(selectedKind) && operation === 'search';
    setValue('');
    setTraversalResult('');

    let isStatusOnly = !result.message
      || result.message === 'Enter a valid numeric value'
      || result.message.includes('already in list')
      || result.message.startsWith('Found ')
      || result.message.endsWith('not found')
      || result.message.endsWith('is empty');

    // For searches: if the result indicates "not found" show a popup, otherwise use animated frames
    if (isTreeSearch) {
      const notFound = typeof result.message === 'string' && result.message.includes('not found');
      isStatusOnly = !!notFound;
    }

    if (isStatusOnly) {
      setStatusAlert({ open: true, message: result.message || 'Operation unavailable' });

      setTimeline(result.frames.length ? result.frames : [defaultFrame]);
      setActiveFrameIndex(0);
      setActiveEntryId(null);
      return;
    }

    setTimeline(result.frames.length ? result.frames : [defaultFrame]);
    setActiveFrameIndex(0);

    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      kind: selectedKind,
      operation,
      value: parsed,
      message: result.message,
      frames: result.frames,
      snapshot: result.snapshot,
      timestamp: Date.now(),
    };

    setHistory((current) => [entry, ...current].slice(0, 20));
    setActiveEntryId(entry.id);
  };

  const handleReset = () => {
    engineMap.current = new Map();
    const freshEngine = createStructureEngine(selectedKind);
    engineMap.current.set(selectedKind, freshEngine);
    setHistory([]);
    setValue('');
    setTraversalResult('');
    setTimeline([defaultFrame]);
    setActiveEntryId(null);
    setActiveFrameIndex(0);
    setEngineVersion((value) => value + 1);
    clearAlerts();
  };

  const handleReplay = (entry) => {
    const restoredEngine = createStructureEngine(entry.kind);
    restoredEngine.restore(entry.snapshot);
    engineMap.current.set(entry.kind, restoredEngine);
    setEngineVersion((value) => value + 1);

    if (entry.kind === selectedKind) {
      setTimeline(entry.frames.length ? entry.frames : [defaultFrame]);
      setActiveEntryId(entry.id);
      setActiveFrameIndex(0);
    }
  };

  const handleTraverse = (order) => {
    const result = engine.traverse(order);
    setTraversalResult(result.message);
    clearAlerts();
  };

  const handleUndo = () => {
    setHistory((current) => {
      const [latest, ...rest] = current;
      if (!latest) {
        return current;
      }

      const previous = rest.find((entry) => entry.kind === latest.kind) ?? null;
      const engineForKind = createStructureEngine(latest.kind);

      if (previous) {
        engineForKind.restore(previous.snapshot);
      } else {
        engineForKind.restore({ kind: latest.kind, payload: null, values: [] });
      }

      engineMap.current.set(latest.kind, engineForKind);
      setEngineVersion((value) => value + 1);

      if (latest.kind === selectedKind) {
        const nextFrames = previous?.frames?.length ? previous.frames : [defaultFrame];
        setTimeline(nextFrames);
        setActiveEntryId(previous?.id ?? null);
        setActiveFrameIndex(0);
        setTraversalResult('');
        clearAlerts();
      }

      return rest;
    });
  };

  return (
    <div className="min-h-screen bg-mesh-gradient">
      {statusAlert.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] px-3 backdrop-blur-sm sm:px-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--accent-border)] bg-[var(--surface-solid)] p-4 shadow-[0_0_30px_var(--accent-glow)] sm:rounded-3xl sm:p-6">
            <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-lg text-[var(--accent-fg)] sm:h-11 sm:w-11 sm:rounded-2xl sm:text-2xl">i</div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--accent-text)] sm:text-xs sm:tracking-[0.22em]">Notice</p>
                  <h3 className="mt-0.5 text-base font-semibold text-[var(--text-strong)] sm:mt-1 sm:text-xl">Status</h3>
                </div>
              </div>
            </div>

            <p className="text-sm leading-6 text-[var(--text-strong)] sm:text-base sm:leading-7">{statusAlert.message}</p>

            <div className="mt-4 flex justify-end sm:mt-6">
              <button
                type="button"
                onClick={() => setStatusAlert({ open: false, message: '' })}
                className="rounded-xl btn-accent px-4 py-2 text-sm font-medium text-slate-950 shadow-lg shadow-[var(--accent-glow)] transition hover:brightness-110 sm:rounded-2xl sm:px-5 sm:py-2.5 sm:text-base"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <TopBar active={selectedKind} onChange={setSelectedKind} onReset={handleReset} theme={theme} setTheme={setTheme} mode={mode} setMode={setMode} />

      <main className="mx-auto grid max-w-[1600px] gap-3 px-3 py-4 sm:gap-5 sm:px-4 sm:py-6 lg:grid-cols-[1fr_350px] lg:px-8">
        <div className="space-y-3 min-w-0 sm:space-y-5">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-glow backdrop-blur-xl sm:rounded-3xl sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-2 sm:gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-fg)] sm:text-sm sm:tracking-[0.24em]">Overview</p>
                <h2 className="mt-0.5 text-lg font-semibold text-[var(--text-strong)] sm:mt-1 sm:text-2xl">{selectedKind}</h2>
              </div>
              <p className="max-w-2xl text-xs leading-5 text-[var(--text-muted)] sm:text-sm sm:leading-6">{structureDescriptions[selectedKind]}</p>
            </div>
          </section>

          <ControlPanel
            value={value}
            selectedKind={selectedKind}
            onValueChange={setValue}
            onInsert={() => runOperation('insert')}
            onDelete={() => runOperation('delete')}
            onSearch={() => runOperation('search')}
            onReset={handleReset}
            onTraverse={handleTraverse}
            traversalResult={traversalResult}
          />

          <VisualizerCanvas structure={selectedKind} frame={currentFrame} speed={1} />
        </div>

        <div className="h-auto lg:h-[calc(100vh-8rem)] lg:sticky lg:top-24 min-w-0">
          <HistoryLog entries={history} activeEntryId={activeEntryId} onReplay={handleReplay} onUndo={handleUndo} />
        </div>
      </main>
    </div>
  );
}