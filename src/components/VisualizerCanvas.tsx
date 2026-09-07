import { AnimatePresence, motion } from 'framer-motion';
import type { StructureFrame, StructureKind } from '../types';

interface VisualizerCanvasProps {
  structure: StructureKind;
  frame: StructureFrame | null;
  speed: number;
}

const nodeFill: Record<string, string> = {
  default: 'url(#nodeGlow)',
  visited: '#f59e0b',
  found: '#22c55e',
  deleted: '#ef4444',
  emphasis: '#38bdf8',
};

export default function VisualizerCanvas({ structure, frame, speed }: VisualizerCanvasProps) {
  const width = 1200;
  const height = 760;

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 shadow-glow backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-violet-200/70">Main Canvas</p>
          <h2 className="mt-1 text-xl font-semibold text-white">{structure} renderer</h2>
        </div>
        <p className="text-sm text-slate-400">Animated at {speed.toFixed(1)}x</p>
      </div>

      <div className="relative h-[760px] overflow-auto bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_28%),linear-gradient(180deg,rgba(7,10,18,0.95),rgba(8,11,22,1))]">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block min-h-full min-w-full">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="nodeGlow" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#1f2937" />
            </radialGradient>
          </defs>

          <line x1={0} y1={60} x2={width} y2={60} stroke="rgba(255,255,255,0.06)" />

          <AnimatePresence>
            {frame?.links.map((link) => {
              const from = frame.nodes.find((node) => node.id === link.from);
              const to = frame.nodes.find((node) => node.id === link.to);
              if (!from || !to) {
                return null;
              }

              return (
                <motion.line
                  key={`${link.from}-${link.to}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={link.color ?? 'rgba(255,255,255,0.2)'}
                  strokeWidth={3}
                  strokeDasharray={link.dashed ? '8 8' : undefined}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 / speed }}
                />
              );
            })}
          </AnimatePresence>

          <AnimatePresence>
            {frame?.nodes.map((node) => (
              <motion.g
                key={node.id}
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.45 / speed, type: 'spring', stiffness: 180, damping: 18 }}
              >
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={26}
                  fill={node.color === 'red' ? '#ef4444' : node.color === 'black' ? '#111827' : nodeFill[node.state ?? 'default']}
                  stroke={node.state === 'found' ? '#86efac' : 'rgba(255,255,255,0.28)'}
                  strokeWidth={2}
                  filter={node.state === 'visited' || node.state === 'emphasis' ? 'url(#glow)' : undefined}
                />
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fill={node.color === 'black' ? '#f8fafc' : '#0f172a'}
                  fontSize={14}
                  fontWeight={700}
                >
                  {node.value}
                </text>
                {node.keys ? (
                  <text x={node.x} y={node.y + 42} textAnchor="middle" fill="rgba(226,232,240,0.72)" fontSize={11}>
                    {node.keys.join(' | ')}
                  </text>
                ) : null}
              </motion.g>
            ))}
          </AnimatePresence>

          {!frame ? (
            <g>
              <text x="50%" y="45%" textAnchor="middle" fill="rgba(226,232,240,0.72)" fontSize={18}>
                Run an operation to animate the structure.
              </text>
              <text x="50%" y="50%" textAnchor="middle" fill="rgba(148,163,184,0.72)" fontSize={13}>
                BST, AVL, Red-Black Tree, B-Tree, 2-3 Tree, and Skip List are supported.
              </text>
            </g>
          ) : null}
        </svg>
      </div>
    </div>
  );
}