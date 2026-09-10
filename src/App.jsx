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
  const [maxSize, setMaxSize] = useState('');
  const [history, setHistory] = useState([]);
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [timeline, setTimeline] = useState([]);
  const [engineVersion, setEngineVersion] = useState(0);
  const [limitAlert, setLimitAlert] = useState({ open: false, message: '', suggestion: '' });
  const [statusAlert, setStatusAlert] = useState({ open: false, message: '' });

  const engine = useMemo(() => {
    if (!engineMap.current.has(selectedKind)) {
      engineMap.current.set(selectedKind, createStructureEngine(selectedKind));
    }

    return engineMap.current.get(selectedKind);
  }, [selectedKind, engineVersion]);

  const clearAlerts = () => {
    setLimitAlert({ open: false, message: '', suggestion: '' });
    setStatusAlert({ open: false, message: '' });
  };

  useEffect(() => {
    engineMap.current = new Map();
    setEngineVersion((v) => v + 1);
    setTimeline([defaultFrame]);
    setActiveFrameIndex(0);
    setActiveEntryId(null);
    setValue('');
    setMaxSize('');
    setHistory([]);
    clearAlerts();
  }, [selectedKind]);

  const currentFrame = timeline[activeFrameIndex] ?? timeline.at(-1) ?? defaultFrame;
  // Pass `maxSize` as a number only when the user provided a value.
  // An empty input means "no limit" (null), so engines can treat it accordingly.
  const context = {
    maxSize: maxSize === '' ? null : (Number.isFinite(Number(maxSize)) ? Math.max(0, Number(maxSize)) : null),
  };
  const handleMaxSizeChange = (nextValue) => {
    if (nextValue === '') {
      setMaxSize('');
      return;
    }

    const parsed = Number(nextValue);
    if (!Number.isFinite(parsed)) {
      return;
    }

    setMaxSize(Math.max(0, parsed));
  };

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

    let isStatusOnly = !result.message
      || result.message.startsWith('Structure limit reached at')
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
      if (result.message?.startsWith('Structure limit reached at')) {
        setLimitAlert({
          open: true,
          message: result.message,
          suggestion: 'Recommended: increase the structure size to continue adding more values.',
        });
        setStatusAlert({ open: false, message: '' });
      } else {
        setStatusAlert({ open: true, message: result.message || 'Operation unavailable' });
        setLimitAlert({ open: false, message: '', suggestion: '' });
      }

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
        clearAlerts();
      }

      return rest;
    });
  };

  return (
    <div className="min-h-screen bg-mesh-gradient">
      {limitAlert.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-amber-400/40 bg-slate-900/95 p-6 shadow-[0_0_30px_rgba(251,191,36,0.18)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-2xl text-amber-200">⚠</div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-amber-100/90">Limit reached</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">Structure full</h3>
                </div>
              </div>
            </div>

            <p className="text-base leading-7 text-white">{limitAlert.message}</p>
            {limitAlert.suggestion && <p className="mt-3 text-sm leading-6 text-amber-100">{limitAlert.suggestion}</p>}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setLimitAlert({ open: false, message: '', suggestion: '' })}
                className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 font-medium text-slate-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {statusAlert.open && !limitAlert.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-sky-400/40 bg-slate-900/95 p-6 shadow-[0_0_30px_rgba(56,189,248,0.16)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/20 text-2xl text-sky-200">i</div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-sky-100/90">Notice</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">Status</h3>
                </div>
              </div>
            </div>

            <p className="text-base leading-7 text-white">{statusAlert.message}</p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setStatusAlert({ open: false, message: '' })}
                className="rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-500 px-5 py-2.5 font-medium text-slate-950 shadow-lg shadow-sky-500/20 transition hover:brightness-110"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <TopBar active={selectedKind} onChange={setSelectedKind} onReset={handleReset} />

      <main className="mx-auto grid max-w-[1600px] gap-5 px-4 py-6 lg:grid-cols-[1fr_350px] lg:px-8">
        <div className="space-y-5 min-w-0">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-amber-200/70">Overview</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">{selectedKind}</h2>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-slate-300">{structureDescriptions[selectedKind]}</p>
            </div>
          </section>

          <ControlPanel
            value={value}
            maxSize={maxSize}
            selectedKind={selectedKind}
            onValueChange={setValue}
            onMaxSizeChange={handleMaxSizeChange}
            onInsert={() => runOperation('insert')}
            onDelete={() => runOperation('delete')}
            onSearch={() => runOperation('search')}
            onReset={handleReset}
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