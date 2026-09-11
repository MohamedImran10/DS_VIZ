import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const nodeFill = {
  default: 'url(#nodeGlow)',
  visited: '#f59e0b',
  found: '#22c55e',
  deleted: '#ef4444',
  emphasis: '#38bdf8',
};

export default function VisualizerCanvas({ structure, frame, speed }) {
  const width = 1200;
  const height = 760;

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.round(entry.contentRect.width);
        setContainerWidth(w || 0);
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // On mobile, scale DOWN so the full tree fits; on larger screens keep 1x.
  const baseWidth = 900;
  let scale = 1;
  if (containerWidth > 0 && containerWidth < baseWidth) {
    scale = Math.max(0.55, containerWidth / baseWidth);
  }

  // Calculate dynamic vertical padding to avoid clipping tall towers
  const nodeYs = (frame?.nodes ?? []).map((n) => n.y);
  const minY = nodeYs.length ? Math.min(...nodeYs) : 0;
  const maxY = nodeYs.length ? Math.max(...nodeYs) : height;
  const desiredTopMargin = 60; // ensure topmost nodes sit below this
  const offset = Math.max(0, desiredTopMargin - minY);
  const paddingBottom = 80;
  const svgHeight = Math.max(height, maxY + paddingBottom + offset);

  // Horizontal sizing: ensure SVG is wide enough for all nodes and enable auto-scroll
  const baseNodes = (frame?.nodes ?? []).filter((n) => n.level === 0 && !String(n.id).startsWith('HEAD-'));
  const totalBase = baseNodes.length;
  // compute max X from nodes (exclude HEAD)
  const nodeXs = (frame?.nodes ?? []).filter((n) => !String(n.id).startsWith('HEAD-')).map((n) => n.x);
  const maxNodeX = nodeXs.length ? Math.max(...nodeXs) : 0;
  const marginX = 80;
  const rightPadding = 120;
  const svgWidth = Math.max(containerWidth, Math.ceil(maxNodeX + rightPadding + marginX));

  // Auto-scroll to right when a new base node is appended
  const prevBaseCountRef = useRef(totalBase);
  useEffect(() => {
    if (!scrollRef.current) return undefined;
    if (totalBase > prevBaseCountRef.current) {
      // small timeout to let layout update
      const t = setTimeout(() => {
        try {
          scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        } catch (e) {
          // ignore
        }
      }, 60);
      prevBaseCountRef.current = totalBase;
      return () => clearTimeout(t);
    }
    prevBaseCountRef.current = totalBase;
    return undefined;
  }, [totalBase, maxNodeX]);

  return (
    <div ref={containerRef} className="w-full max-w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-glow backdrop-blur-xl sm:rounded-3xl">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 sm:px-5 sm:py-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-violet-200/70 sm:text-sm sm:tracking-[0.24em]">Main Canvas</p>
          <h2 className="mt-0.5 text-base font-semibold text-white sm:mt-1 sm:text-xl">{structure} renderer</h2>
        </div>
        <p className="text-xs text-slate-400 sm:text-sm">Animated at {speed.toFixed(1)}x</p>
      </div>

      <div ref={scrollRef} className="relative h-64 sm:h-96 md:h-[560px] lg:h-[760px] w-full max-w-full overflow-x-auto overflow-y-auto block bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_28%),linear-gradient(180deg,rgba(7,10,18,0.95),rgba(8,11,22,1))]">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="xMidYMid meet" className="block" style={{ width: svgWidth, height: svgHeight }}>
          <g transform={`translate(0, ${offset})`}>
            <g transform={`scale(${scale})`} style={{ transformOrigin: '0 0' }}>
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
                  // If explicit levelY is provided, align both ends to that Y coordinate
                  let y1 = from?.y;
                  let y2 = to?.y;
                  if (typeof link.levelY === 'number') {
                    y1 = link.levelY;
                    y2 = link.levelY;
                  }

                  if (!from || !to) {
                    return null;
                  }

                  return (
                    <motion.line
                      key={`${link.from}-${link.to}`}
                      x1={from.x}
                      y1={y1}
                      x2={to.x}
                      y2={y2}
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
                {frame?.nodes.map((node) => {
                  const isT23Node = node.isT23;
                  const isBTreeNode = node.isBTree;
                  const values = node.keys ?? [node.value];

                  if (isT23Node) {
                    const t23Fill = node.state === 'visited' ? '#f59e0b' : node.state === 'found' ? '#22c55e' : node.state === 'deleted' ? '#ef4444' : '#38bdf8';
                    const t23Stroke = node.state === 'found' ? '#86efac' : node.state === 'visited' ? '#fbbf24' : node.state === 'deleted' ? '#fca5a5' : '#7dd3fc';
                    const textFill = node.state === 'visited' || node.state === 'found' ? '#ffffff' : '#0f172a';
                    return (
                      <motion.g
                        key={node.id}
                        initial={{ opacity: 0, scale: 0.5, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.45 / speed, type: 'spring', stiffness: 180, damping: 18 }}
                      >
                        <rect
                          x={node.x - 40}
                          y={node.y - 28}
                          width={Math.max(80, values.length * 42 + 18)}
                          height={56}
                          rx={8}
                          fill={t23Fill}
                          stroke={t23Stroke}
                          strokeWidth={2}
                          filter={node.state === 'visited' || node.state === 'emphasis' ? 'url(#glow)' : undefined}
                        />

                        {values.map((value, index) => (
                          <g key={`${node.id}-${value}-${index}`}>
                            <rect
                              x={node.x - 32 + index * 42}
                              y={node.y - 18}
                              width={34}
                              height={36}
                              rx={4}
                              fill="rgba(255,255,255,0.25)"
                              stroke="rgba(255,255,255,0.55)"
                              strokeWidth={2}
                            />
                            <text
                              x={node.x - 15 + index * 42}
                              y={node.y + 7}
                              textAnchor="middle"
                              fill={textFill}
                              fontSize={16}
                              fontWeight={700}
                            >
                              {value}
                            </text>
                          </g>
                        ))}
                      </motion.g>
                    );
                  }

                  if (isBTreeNode) {
                    const bTreeFill = node.state === 'visited' ? '#f59e0b' : node.state === 'found' ? '#22c55e' : '#38bdf8';
                    const bTreeStroke = node.state === 'found' ? '#86efac' : node.state === 'visited' ? '#fbbf24' : '#7dd3fc';
                    return (
                      <motion.g
                        key={node.id}
                        initial={{ opacity: 0, scale: 0.5, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.45 / speed, type: 'spring', stiffness: 180, damping: 18 }}
                      >
                        <ellipse
                          cx={node.x}
                          cy={node.y}
                          rx={Math.max(52, node.width / 2)}
                          ry={34}
                          fill={bTreeFill}
                          stroke={bTreeStroke}
                          strokeWidth={2}
                          filter={node.state === 'visited' || node.state === 'emphasis' ? 'url(#glow)' : undefined}
                        />
                        <text
                          x={node.x}
                          y={node.y + 6}
                          textAnchor="middle"
                          fill="#0f172a"
                          fontSize={16}
                          fontWeight={700}
                        >
                          {values.join(', ')}
                        </text>
                      </motion.g>
                    );
                  }

                  return (
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
                        fill={node.state === 'found' ? nodeFill.found : node.state === 'visited' ? nodeFill.visited : node.state === 'emphasis' ? nodeFill.emphasis : node.color === 'red' ? '#ef4444' : node.color === 'black' ? '#111827' : nodeFill.default}
                        stroke={node.state === 'found' ? '#86efac' : 'rgba(255,255,255,0.28)'}
                        strokeWidth={2}
                        filter={node.state === 'visited' || node.state === 'emphasis' ? 'url(#glow)' : undefined}
                      />
                      <text
                        x={node.x}
                        y={node.y + 5}
                        textAnchor="middle"
                        fill={node.state === 'found' || node.state === 'visited' ? '#f8fafc' : node.color === 'black' ? '#f8fafc' : '#0f172a'}
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
                  );
                })}
              </AnimatePresence>

              {!frame ? (
                <g>
                  <text x="50%" y="45%" textAnchor="middle" fill="rgba(226,232,240,0.72)" fontSize={18}>
                    Run an operation to animate the structure.
                  </text>
                  <text x="50%" y="50%" textAnchor="middle" fill="rgba(148,163,184,0.72)" fontSize={13}>
                    BST, AVL, Red-Black Tree, B-Tree, and 2-3 Tree are supported.
                  </text>
                </g>
              ) : null}
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}

// component already exported above