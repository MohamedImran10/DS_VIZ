import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const fillFor = (node) => {
  if (node.state === 'found') return 'url(#nodeGreen)';
  if (node.state === 'visited') return 'url(#nodeGold)';
  if (node.state === 'deleted') return 'url(#nodeRed)';
  if (node.state === 'emphasis') return 'url(#nodeSky)';
  if (node.color === 'red') return 'url(#nodeRed)';
  if (node.color === 'black') return 'url(#nodeBlack)';
  return 'url(#nodeMetal)';
};

const X_PAD = 50;
const TOP_PAD = 46;
const BOT_PAD = 60;
const MIN_SCALE = 0.55;
const TOP_MARGIN = 10;

const halfWidthOf = (node) => {
  if (node?.isT23) {
    return Math.max(40, Math.max(80, (node.keys?.length ?? 1) * 42 + 18) / 2);
  }
  if (node?.isBTree) {
    return Math.max(52, (node.width ?? 90) / 2);
  }
  return 26;
};

export default function VisualizerCanvas({ structure, frame, speed }) {
  const scrollRef = useRef(null);
  const [viewport, setViewport] = useState({ w: 1200, h: 560 });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.round(entry.contentRect.width);
        const height = Math.round(entry.contentRect.height);
        setViewport((prev) => (
          prev.w === width && prev.h === height
            ? prev
            : { w: width || prev.w, h: height || prev.h }
        ));
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w: viewW, h: viewH } = viewport;
  const contentNodes = (frame?.nodes ?? []).filter((node) => !String(node.id).startsWith('HEAD-'));

  // Compute the tree's bounding box in world coordinates.
  let contentLeft = 0;
  let contentRight = 0;
  let contentTop = 0;
  let contentBottom = 0;
  let nodeMinY = 0;

  if (contentNodes.length > 0) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const node of contentNodes) {
      const half = halfWidthOf(node);
      minX = Math.min(minX, node.x - half);
      maxX = Math.max(maxX, node.x + half);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y);
    }

    nodeMinY = minY;
    contentLeft = minX - X_PAD;
    contentRight = maxX + X_PAD;
    contentTop = minY - TOP_PAD;
    contentBottom = maxY + BOT_PAD;
  }

  const hasContent = contentNodes.length > 0;
  const contentW = contentRight - contentLeft;
  const contentH = contentBottom - contentTop;

  // Fit the tree to the viewport (top-center). Scrollbars appear only when the
  // tree grows so deep/wide that even the smallest allowed scale still overflows.
  let scale = 1;
  let translateX = 0;
  let translateY = 0;

  if (hasContent) {
    const fit = Math.min(viewW / contentW, viewH / contentH, 1);
    scale = Math.max(MIN_SCALE, Number.isFinite(fit) ? fit : 1);
    const scaledW = contentW * scale;
    const scaledH = contentH * scale;

    const svgW = Math.max(viewW, Math.ceil(scaledW));
    const svgH = Math.max(viewH, Math.ceil(scaledH));

    const left = (svgW - scaledW) / 2;
    const top = TOP_MARGIN;

    translateX = left - contentLeft * scale;
    translateY = top - contentTop * scale;
  }

  const svgWidth = Math.max(viewW, Math.ceil(contentW * scale));
  const svgHeight = Math.max(viewH, Math.ceil(contentH * scale));

  const horizontalOverflow = svgWidth > viewW;
  const nodeCount = contentNodes.length;

  // Auto-scroll to the right when a new node pushes the tree past the viewport.
  const prevCountRef = useRef(0);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;

    if (nodeCount > prevCountRef.current) {
      prevCountRef.current = nodeCount;
      if (horizontalOverflow) {
        const timer = setTimeout(() => {
          el.scrollLeft = el.scrollWidth;
        }, 60);
        return () => clearTimeout(timer);
      }
      return undefined;
    }

    prevCountRef.current = nodeCount;
    return undefined;
  }, [nodeCount, horizontalOverflow]);

  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-glow backdrop-blur-xl sm:rounded-3xl">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 sm:px-5 sm:py-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-violet-200/70 sm:text-sm sm:tracking-[0.24em]">Main Canvas</p>
          <h2 className="mt-0.5 text-base font-semibold text-white sm:mt-1 sm:text-xl">{structure} renderer</h2>
        </div>
        <p className="text-xs text-slate-400 sm:text-sm">Animated at {speed.toFixed(1)}x</p>
      </div>

      <div ref={scrollRef} className="relative h-64 sm:h-96 md:h-[560px] lg:h-[760px] w-full max-w-full overflow-x-auto overflow-y-auto block bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_28%),linear-gradient(180deg,rgba(7,10,18,0.95),rgba(8,11,22,1))]">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="block"
          style={{
            width: svgWidth,
            height: svgHeight,
            backgroundImage:
              'linear-gradient(rgba(96,165,250,0.06) 1px, transparent 1px),' +
              'linear-gradient(90deg, rgba(96,165,250,0.06) 1px, transparent 1px),' +
              'linear-gradient(rgba(96,165,250,0.12) 1px, transparent 1px),' +
              'linear-gradient(90deg, rgba(96,165,250,0.12) 1px, transparent 1px)',
            backgroundSize: '36px 36px, 36px 36px, 144px 144px, 144px 144px',
          }}
        >
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="nodeMetal" cx="50%" cy="32%" r="90%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#cbd5e1" />
              <stop offset="75%" stopColor="#7c8a9d" />
              <stop offset="100%" stopColor="#3c4856" />
            </radialGradient>
            <radialGradient id="nodeGold" cx="50%" cy="32%" r="90%">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="45%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#92400e" />
            </radialGradient>
            <radialGradient id="nodeGreen" cx="50%" cy="32%" r="90%">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="45%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#065f46" />
            </radialGradient>
            <radialGradient id="nodeRed" cx="50%" cy="32%" r="90%">
              <stop offset="0%" stopColor="#fecaca" />
              <stop offset="45%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#991b1b" />
            </radialGradient>
            <radialGradient id="nodeSky" cx="50%" cy="32%" r="90%">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="45%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#075985" />
            </radialGradient>
            <radialGradient id="nodeBlack" cx="50%" cy="32%" r="90%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
          </defs>

          {!hasContent ? (
            <g>
              <text x="50%" y="45%" textAnchor="middle" fill="rgba(226,232,240,0.72)" fontSize={18}>
                Run an operation to animate the structure.
              </text>
              <text x="50%" y="50%" textAnchor="middle" fill="rgba(148,163,184,0.72)" fontSize={13}>
                BST, AVL, Red-Black Tree, B-Tree, and 2-3 Tree are supported.
              </text>
            </g>
          ) : (
            <g transform={`translate(${translateX} ${translateY}) scale(${scale})`}>
              <line
                x1={contentLeft + 10}
                y1={nodeMinY - 34}
                x2={contentRight - 10}
                y2={nodeMinY - 34}
                stroke="rgba(255,255,255,0.06)"
              />

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
                    const t23Fill = fillFor(node);
                    const t23Stroke = node.state === 'found' ? '#a7f3d0' : node.state === 'visited' ? '#fde68a' : node.state === 'deleted' ? '#fca5a5' : '#7dd3fc';
                    const textFill = node.state === 'visited' || node.state === 'found' || node.state === 'emphasis' ? '#ffffff' : '#0f172a';
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

                        <ellipse cx={node.x - 8} cy={node.y - 14} rx={14} ry={6} fill="rgba(255,255,255,0.28)" />

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
                    const bTreeFill = fillFor(node);
                    const bTreeStroke = node.state === 'found' ? '#a7f3d0' : node.state === 'visited' ? '#fde68a' : '#7dd3fc';
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
                        <ellipse cx={node.x - 10} cy={node.y - 14} rx={14} ry={6} fill="rgba(255,255,255,0.28)" />
                        <text
                          x={node.x}
                          y={node.y + 6}
                          textAnchor="middle"
                          fill={bTreeFill === 'url(#nodeMetal)' ? '#0f172a' : '#ffffff'}
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
                        fill={fillFor(node)}
                        stroke={node.state === 'found' ? '#a7f3d0' : node.state === 'visited' ? '#fde68a' : 'rgba(255,255,255,0.35)'}
                        strokeWidth={2}
                        filter={node.state === 'visited' || node.state === 'emphasis' ? 'url(#glow)' : undefined}
                      />
                      <ellipse cx={node.x - 7} cy={node.y - 11} rx={10} ry={5} fill="rgba(255,255,255,0.45)" />
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
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}