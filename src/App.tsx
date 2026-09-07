import { useEffect, useMemo, useRef, useState } from 'react';
import ControlPanel from './components/ControlPanel';
import HistoryLog from './components/HistoryLog';
import TopBar from './components/TopBar';
import VisualizerCanvas from './components/VisualizerCanvas';
import { createStructureEngine } from './engine/dataStructures';
import type { OperationHistoryEntry, StructureFrame, StructureKind } from './types';

const sampleValues = [44, 17, 63, 9, 28, 52, 71, 3, 12, 24, 31, 48, 56, 68, 79];

const structureDescriptions: Record<StructureKind, string> = {
  BST: 'Classic binary search tree with path highlighting.',
  AVL: 'Self-balancing binary tree with rotation-aware animations.',
  RBT: 'Color-coded tree emphasizing recoloring and property fixes.',
  BTREE: 'Multi-key, multi-way tree with split and migration cues.',
  T23: 'Compact order-3 tree with node split and merge storytelling.',
  SKIPLIST: 'Tiered linked structure with automatic layer calculation.',
};

const defaultFrame: StructureFrame = { message: 'Ready', nodes: [], links: [] };

export default function App() {
  const engineMap = useRef(new Map<StructureKind, ReturnType<typeof createStructureEngine>>());
  const [selectedKind, setSelectedKind] = useState<StructureKind>('BST');
  const [value, setValue] = useState('45');
  const [speed, setSpeed] = useState(1);
  const [maxSize, setMaxSize] = useState(45);
  const [skipListMaxLevel, setSkipListMaxLevel] = useState(6);
  const [history, setHistory] = useState<OperationHistoryEntry[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [timeline, setTimeline] = useState<StructureFrame[]>([]);

  const engine = useMemo(() => {
    if (!engineMap.current.has(selectedKind)) {
      engineMap.current.set(selectedKind, createStructureEngine(selectedKind));
    }

    return engineMap.current.get(selectedKind)!;
  }, [selectedKind]);

  const currentFrame = timeline[activeFrameIndex] ?? timeline.at(-1) ?? defaultFrame;
  const context = { maxSize, skipListMaxLevel };

  useEffect(() => {
    if (timeline.length <= 1) {
      setActiveFrameIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setActiveFrameIndex((index) => Math.min(index + 1, timeline.length - 1));
    }, Math.max(180, 700 / speed));

    return () => window.clearInterval(interval);
  }, [speed, timeline]);

  const runOperation = (operation: 'insert' | 'delete' | 'search') => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      setTimeline([{ message: 'Enter a valid numeric value', nodes: [], links: [] }]);
      setActiveFrameIndex(0);
      return;
    }

    const result = engine[operation](parsed, context);
    setTimeline(result.frames.length ? result.frames : [defaultFrame]);
    setActiveFrameIndex(0);

    const entry: OperationHistoryEntry = {
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
    engineMap.current.set(selectedKind, createStructureEngine(selectedKind));
    setHistory((current) => current.filter((entry) => entry.kind !== selectedKind));
    setTimeline([{ message: `${selectedKind} reset`, nodes: [], links: [] }]);
    setActiveEntryId(null);
    setActiveFrameIndex(0);
  };

  const handleReplay = (entry: OperationHistoryEntry) => {
    const restoredEngine = createStructureEngine(entry.kind);
    restoredEngine.restore(entry.snapshot);
    engineMap.current.set(entry.kind, restoredEngine);

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
      }
      engineMap.current.set(latest.kind, engineForKind);

      if (latest.kind === selectedKind) {
        setTimeline(previous?.frames.length ? previous.frames : [defaultFrame]);
        setActiveEntryId(previous?.id ?? null);
        setActiveFrameIndex(0);
      }

      return rest;
    });
  };

  const seedSample = () => {
    sampleValues.forEach((sample) => {
      const result = engine.insert(sample, context);
      const entry: OperationHistoryEntry = {
        id: `${Date.now()}-${sample}-${Math.random().toString(36).slice(2, 8)}`,
        kind: selectedKind,
        operation: 'insert',
        value: sample,
        message: result.message,
        frames: result.frames,
        snapshot: result.snapshot,
        timestamp: Date.now(),
      };
      setHistory((current) => [entry, ...current].slice(0, 20));
    });

    setTimeline([{ message: 'Sample set applied', nodes: [], links: [] }]);
    setActiveEntryId(null);
    setActiveFrameIndex(0);
  };

  return (
    <div className="min-h-screen bg-mesh-gradient">
      <TopBar active={selectedKind} onChange={setSelectedKind} onReset={handleReset} />

      <main className="mx-auto grid max-w-[1600px] gap-5 px-4 py-6 lg:grid-cols-[1fr_350px] lg:px-8">
        <div className="space-y-5">
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
            speed={speed}
            maxSize={maxSize}
            skipListMaxLevel={skipListMaxLevel}
            selectedKind={selectedKind}
            onValueChange={setValue}
            onSpeedChange={setSpeed}
            onMaxSizeChange={setMaxSize}
            onSkipLevelChange={setSkipListMaxLevel}
            onInsert={() => runOperation('insert')}
            onDelete={() => runOperation('delete')}
            onSearch={() => runOperation('search')}
            onReset={handleReset}
            onSeedSample={seedSample}
          />

          <VisualizerCanvas structure={selectedKind} frame={currentFrame} speed={speed} />
        </div>

        <div className="h-[calc(100vh-8rem)] lg:sticky lg:top-24">
          <HistoryLog entries={history} activeEntryId={activeEntryId} onReplay={handleReplay} onUndo={handleUndo} />
        </div>
      </main>
    </div>
  );
}