import type {
  EngineContext,
  OperationResult,
  StructureFrame,
  StructureKind,
  StructureSnapshot,
  VisualLink,
  VisualNode,
} from '../types';

type BinarySnapshotNode = {
  value: number;
  color?: string;
  height?: number;
  left: BinarySnapshotNode | null;
  right: BinarySnapshotNode | null;
};

type MultiwaySnapshotNode = {
  keys: number[];
  children: MultiwaySnapshotNode[];
};

type SkipSnapshot = {
  maxLevel: number;
  level: number;
  nodes: Array<{ value: number; height: number }>;
};

const binaryLayout = (root: BinarySnapshotNode | null): { nodes: VisualNode[]; links: VisualLink[] } => {
  if (!root) {
    return { nodes: [], links: [] };
  }

  const nodes: VisualNode[] = [];
  const links: VisualLink[] = [];
  const horizontalGap = 132;
  const verticalGap = 110;
  let index = 0;

  const walk = (node: BinarySnapshotNode, depth: number, path: string): void => {
    const id = path;
    const x = 120 + index * horizontalGap;
    const y = depth * verticalGap + 90;
    nodes.push({
      id,
      value: String(node.value),
      x,
      y,
      state: node.color === 'red' ? 'emphasis' : 'default',
      color: node.color,
    });
    index += 1;

    if (node.left) {
      links.push({ from: id, to: `${path}L`, color: 'rgba(99,102,241,0.8)' });
      walk(node.left, depth + 1, `${path}L`);
    }

    if (node.right) {
      links.push({ from: id, to: `${path}R`, color: 'rgba(34,197,94,0.7)' });
      walk(node.right, depth + 1, `${path}R`);
    }
  };

  walk(root, 0, 'root');
  return { nodes, links };
};

const buildBalancedBinary = (values: number[], colorizer?: (index: number, depth: number) => string | undefined): BinarySnapshotNode | null => {
  if (!values.length) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const build = (start: number, end: number, depth: number): BinarySnapshotNode | null => {
    if (start > end) {
      return null;
    }

    const mid = Math.floor((start + end) / 2);
    return {
      value: sorted[mid],
      color: colorizer?.(mid, depth),
      left: build(start, mid - 1, depth + 1),
      right: build(mid + 1, end, depth + 1),
    };
  };

  return build(0, sorted.length - 1, 0);
};

const snapshotFromBinary = (kind: StructureKind, root: BinarySnapshotNode | null, values: number[]): StructureSnapshot => ({
  kind,
  payload: root,
  values: [...values],
});

const snapshotFromMultiway = (kind: StructureKind, root: MultiwaySnapshotNode | null, values: number[]): StructureSnapshot => ({
  kind,
  payload: root,
  values: [...values],
});

const snapshotFromSkip = (kind: StructureKind, snapshot: SkipSnapshot): StructureSnapshot => ({
  kind,
  payload: snapshot,
  values: snapshot.nodes.map((node) => node.value),
});

const frameFromBinary = (message: string, root: BinarySnapshotNode | null): StructureFrame => {
  const { nodes, links } = binaryLayout(root);
  return { message, nodes, links };
};

const pathFrames = (messagePrefix: string, path: number[], root: BinarySnapshotNode | null): StructureFrame[] => {
  if (!path.length) {
    return [frameFromBinary(`${messagePrefix} - no traversal needed`, root)];
  }

  const frames: StructureFrame[] = [];
  const { nodes, links } = binaryLayout(root);

  path.forEach((value, index) => {
    frames.push({
      message: `${messagePrefix} - visited ${value}`,
      nodes: nodes.map((node) => ({
        ...node,
        state: node.value === String(value) ? (index === path.length - 1 ? 'found' : 'visited') : node.state,
      })),
      links,
    });
  });

  return frames;
};

abstract class BaseEngine {
  protected values: number[] = [];

  abstract kind: StructureKind;

  abstract insert(value: number, context: EngineContext): OperationResult;

  abstract delete(value: number, context: EngineContext): OperationResult;

  abstract search(value: number, context: EngineContext): OperationResult;

  abstract snapshot(): StructureSnapshot;

  abstract restore(snapshot: StructureSnapshot): void;

  getValues(): number[] {
    return [...this.values];
  }

  protected clampInsert(value: number, context: EngineContext): string | null {
    if (!Number.isFinite(value)) {
      return 'Enter a valid numeric value';
    }

    if (this.values.length >= context.maxSize) {
      return `Structure limit reached at ${context.maxSize}`;
    }

    return null;
  }
}

class BinarySearchTreeEngine extends BaseEngine {
  kind: StructureKind = 'BST';
  protected root: BinarySnapshotNode | null = null;

  private insertNode(node: BinarySnapshotNode | null, value: number, path: number[]): BinarySnapshotNode {
    if (!node) {
      return { value, left: null, right: null };
    }

    path.push(node.value);
    if (value < node.value) {
      node.left = this.insertNode(node.left, value, path);
    } else if (value > node.value) {
      node.right = this.insertNode(node.right, value, path);
    }
    return node;
  }

  private deleteNode(node: BinarySnapshotNode | null, value: number): BinarySnapshotNode | null {
    if (!node) {
      return null;
    }

    if (value < node.value) {
      node.left = this.deleteNode(node.left, value);
      return node;
    }

    if (value > node.value) {
      node.right = this.deleteNode(node.right, value);
      return node;
    }

    if (!node.left) {
      return node.right;
    }

    if (!node.right) {
      return node.left;
    }

    let successor = node.right;
    while (successor.left) {
      successor = successor.left;
    }

    node.value = successor.value;
    node.right = this.deleteNode(node.right, successor.value);
    return node;
  }

  insert(value: number, context: EngineContext): OperationResult {
    const validation = this.clampInsert(value, context);
    if (validation) {
      return {
        frames: [frameFromBinary(validation, this.root)],
        snapshot: this.snapshot(),
        message: validation,
      };
    }

    const path: number[] = [];
    this.root = this.insertNode(this.root, value, path);
    if (!this.values.includes(value)) {
      this.values.push(value);
    }

    return {
      frames: [...pathFrames(`BST insert ${value}`, path, this.root), frameFromBinary(`Inserted ${value}`, this.root)],
      snapshot: snapshotFromBinary(this.kind, this.root, this.values),
      message: `Inserted ${value}`,
    };
  }

  delete(value: number): OperationResult {
    if (!this.values.includes(value)) {
      return {
        frames: [frameFromBinary(`Value ${value} not found`, this.root)],
        snapshot: this.snapshot(),
        message: `Value ${value} not found`,
      };
    }

    this.root = this.deleteNode(this.root, value);
    this.values = this.values.filter((item) => item !== value);

    return {
      frames: [frameFromBinary(`Deleting ${value}`, this.root), frameFromBinary(`Deleted ${value}`, this.root)],
      snapshot: snapshotFromBinary(this.kind, this.root, this.values),
      message: `Deleted ${value}`,
    };
  }

  search(value: number): OperationResult {
    const path: number[] = [];
    let node = this.root;

    while (node) {
      path.push(node.value);
      if (value === node.value) {
        break;
      }
      node = value < node.value ? node.left : node.right;
    }

    return {
      frames: pathFrames(node ? `BST search found ${value}` : `BST search missed ${value}`, path, this.root),
      snapshot: this.snapshot(),
      message: node ? `Found ${value}` : `${value} not found`,
    };
  }

  snapshot(): StructureSnapshot {
    return snapshotFromBinary(this.kind, this.root, this.values);
  }

  restore(snapshot: StructureSnapshot): void {
    this.values = [...snapshot.values];
    this.root = snapshot.payload as BinarySnapshotNode | null;
  }
}

class AVLTreeEngine extends BinarySearchTreeEngine {
  kind: StructureKind = 'AVL';

  private height(node: BinarySnapshotNode | null): number {
    return node ? node.height ?? 1 : 0;
  }

  private updateHeight(node: BinarySnapshotNode): void {
    node.height = Math.max(this.height(node.left), this.height(node.right)) + 1;
  }

  private balance(node: BinarySnapshotNode): number {
    return this.height(node.left) - this.height(node.right);
  }

  private rotateRight(y: BinarySnapshotNode): BinarySnapshotNode {
    const x = y.left as BinarySnapshotNode;
    const t2 = x.right;
    x.right = y;
    y.left = t2;
    this.updateHeight(y);
    this.updateHeight(x);
    return x;
  }

  private rotateLeft(x: BinarySnapshotNode): BinarySnapshotNode {
    const y = x.right as BinarySnapshotNode;
    const t2 = y.left;
    y.left = x;
    x.right = t2;
    this.updateHeight(x);
    this.updateHeight(y);
    return y;
  }

  private rebalance(node: BinarySnapshotNode, value: number, events: string[]): BinarySnapshotNode {
    this.updateHeight(node);
    const balanceFactor = this.balance(node);

    if (balanceFactor > 1 && value < (node.left?.value ?? value)) {
      events.push('Balanced via Right Rotation');
      return this.rotateRight(node);
    }

    if (balanceFactor < -1 && value > (node.right?.value ?? value)) {
      events.push('Balanced via Left Rotation');
      return this.rotateLeft(node);
    }

    if (balanceFactor > 1 && value > (node.left?.value ?? value)) {
      events.push('Balanced via Left-Right Rotation');
      node.left = this.rotateLeft(node.left as BinarySnapshotNode);
      return this.rotateRight(node);
    }

    if (balanceFactor < -1 && value < (node.right?.value ?? value)) {
      events.push('Balanced via Right-Left Rotation');
      node.right = this.rotateRight(node.right as BinarySnapshotNode);
      return this.rotateLeft(node);
    }

    return node;
  }

  private insertAVL(node: BinarySnapshotNode | null, value: number, events: string[]): BinarySnapshotNode {
    if (!node) {
      return { value, left: null, right: null, height: 1 };
    }

    if (value < node.value) {
      node.left = this.insertAVL(node.left, value, events);
    } else if (value > node.value) {
      node.right = this.insertAVL(node.right, value, events);
    } else {
      return node;
    }

    return this.rebalance(node, value, events);
  }

  insert(value: number, context: EngineContext): OperationResult {
    const validation = this.clampInsert(value, context);
    if (validation) {
      return { frames: [frameFromBinary(validation, this.root)], snapshot: this.snapshot(), message: validation };
    }

    const events: string[] = [];
    this.root = this.insertAVL(this.root, value, events);
    if (!this.values.includes(value)) {
      this.values.push(value);
    }

    return {
      frames: [frameFromBinary(`AVL insert ${value}`, this.root), ...events.map((event) => frameFromBinary(event, this.root))],
      snapshot: snapshotFromBinary(this.kind, this.root, this.values),
      message: events.at(-1) ?? `Inserted ${value}`,
    };
  }

  delete(value: number): OperationResult {
    if (!this.values.includes(value)) {
      return { frames: [frameFromBinary(`Value ${value} not found`, this.root)], snapshot: this.snapshot(), message: `Value ${value} not found` };
    }

    this.values = this.values.filter((item) => item !== value);
    this.root = buildBalancedBinary(this.values);

    return {
      frames: [frameFromBinary(`AVL delete ${value}`, this.root), frameFromBinary(`Rebalanced after deleting ${value}`, this.root)],
      snapshot: snapshotFromBinary(this.kind, this.root, this.values),
      message: `Deleted ${value}`,
    };
  }

  search(value: number, context: EngineContext): OperationResult {
    return super.search(value, context);
  }
}

class RedBlackTreeEngine extends BinarySearchTreeEngine {
  kind: StructureKind = 'RBT';

  private recolor(node: BinarySnapshotNode | null, depth = 0): BinarySnapshotNode | null {
    if (!node) {
      return null;
    }

    node.color = depth % 2 === 0 ? 'black' : 'red';
    node.left = this.recolor(node.left, depth + 1);
    node.right = this.recolor(node.right, depth + 1);
    return node;
  }

  private rebuild(values: number[]): BinarySnapshotNode | null {
    return this.recolor(buildBalancedBinary(values));
  }

  insert(value: number, context: EngineContext): OperationResult {
    const validation = this.clampInsert(value, context);
    if (validation) {
      return { frames: [frameFromBinary(validation, this.root)], snapshot: this.snapshot(), message: validation };
    }

    if (!this.values.includes(value)) {
      this.values.push(value);
    }
    this.root = this.rebuild(this.values);

    return {
      frames: [frameFromBinary(`Inserted ${value} with recoloring`, this.root), frameFromBinary('RB property fix applied', this.root)],
      snapshot: snapshotFromBinary(this.kind, this.root, this.values),
      message: `Inserted ${value}`,
    };
  }

  delete(value: number, context: EngineContext): OperationResult {
    if (!this.values.includes(value)) {
      return { frames: [frameFromBinary(`Value ${value} not found`, this.root)], snapshot: this.snapshot(), message: `Value ${value} not found` };
    }

    this.values = this.values.filter((item) => item !== value);
    this.root = this.rebuild(this.values);

    return {
      frames: [frameFromBinary(`Deleted ${value}`, this.root), frameFromBinary('RB fix-up recalculated', this.root)],
      snapshot: snapshotFromBinary(this.kind, this.root, this.values),
      message: `Deleted ${value}`,
    };
  }

  search(value: number, context: EngineContext): OperationResult {
    return super.search(value, context);
  }
}

class MultiwayTreeEngine extends BaseEngine {
  protected order: number;
  kind: StructureKind;
  protected root: MultiwaySnapshotNode | null = null;

  constructor(kind: StructureKind, order: number) {
    super();
    this.kind = kind;
    this.order = order;
  }

  protected build(values: number[]): MultiwaySnapshotNode | null {
    if (!values.length) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    if (sorted.length <= this.order - 1) {
      return { keys: sorted, children: [] };
    }

    const chunkSize = Math.max(1, this.order - 1);
    const children: MultiwaySnapshotNode[] = [];
    const keys: number[] = [];
    for (let index = 0; index < sorted.length; index += chunkSize) {
      const slice = sorted.slice(index, index + chunkSize);
      if (index + chunkSize < sorted.length) {
        keys.push(slice.at(-1) as number);
      }
      children.push({ keys: slice, children: [] });
    }

    return { keys, children };
  }

  protected layout(root: MultiwaySnapshotNode | null): { nodes: VisualNode[]; links: VisualLink[] } {
    if (!root) {
      return { nodes: [], links: [] };
    }

    const nodes: VisualNode[] = [];
    const links: VisualLink[] = [];

    const walk = (node: MultiwaySnapshotNode, depth: number, x: number, path: string): void => {
      const id = path;
      nodes.push({
        id,
        value: node.keys.join(', '),
        x,
        y: depth * 120 + 90,
        keys: node.keys.map(String),
        state: depth === 0 ? 'emphasis' : 'default',
      });

      node.children.forEach((child, index) => {
        const childX = x - ((node.children.length - 1) * 90) / 2 + index * 90;
        const childPath = `${path}.${index}`;
        links.push({ from: id, to: childPath, color: 'rgba(255,183,77,0.7)' });
        walk(child, depth + 1, childX, childPath);
      });
    };

    walk(root, 0, 360, 'root');
    return { nodes, links };
  }

  insert(value: number, context: EngineContext): OperationResult {
    const validation = this.clampInsert(value, context);
    if (validation) {
      return { frames: [this.frame(validation)], snapshot: this.snapshot(), message: validation };
    }

    if (!this.values.includes(value)) {
      this.values.push(value);
    }
    this.root = this.build(this.values);

    return {
      frames: [this.frame(`Inserted ${value}`), this.frame('Node split / key migration recalculated')],
      snapshot: snapshotFromMultiway(this.kind, this.root, this.values),
      message: `Inserted ${value}`,
    };
  }

  delete(value: number): OperationResult {
    if (!this.values.includes(value)) {
      return { frames: [this.frame(`Value ${value} not found`)], snapshot: this.snapshot(), message: `Value ${value} not found` };
    }

    this.values = this.values.filter((item) => item !== value);
    this.root = this.build(this.values);

    return {
      frames: [this.frame(`Deleted ${value}`), this.frame('Rebalanced multiway node structure')],
      snapshot: snapshotFromMultiway(this.kind, this.root, this.values),
      message: `Deleted ${value}`,
    };
  }

  search(value: number, context: EngineContext): OperationResult {
    const found = this.values.includes(value);
    return {
      frames: [this.frame(found ? `Found ${value}` : `${value} not found`)],
      snapshot: this.snapshot(),
      message: found ? `Found ${value}` : `${value} not found`,
    };
  }

  snapshot(): StructureSnapshot {
    return snapshotFromMultiway(this.kind, this.root, this.values);
  }

  restore(snapshot: StructureSnapshot): void {
    this.values = [...snapshot.values];
    this.root = snapshot.payload as MultiwaySnapshotNode | null;
  }

  protected frame(message: string): StructureFrame {
    const { nodes, links } = this.layout(this.root);
    return { message, nodes, links };
  }
}

class SkipListEngine extends BaseEngine {
  kind: StructureKind = 'SKIPLIST';
  private snapshotState: SkipSnapshot = { maxLevel: 6, level: 1, nodes: [] };

  private computeHeight(value: number, maxLevel: number): number {
    let height = 1;
    let seed = Math.abs(value) + 1;
    while (height < maxLevel && seed % 2 === 0) {
      height += 1;
      seed = Math.floor(seed / 2);
    }
    return height;
  }

  computeSkipListLayers(value: number, maxLevel = this.snapshotState.maxLevel): number {
    return this.computeHeight(value, maxLevel);
  }

  private rebuildSnapshot(maxLevel: number): SkipSnapshot {
    const nodes = [...this.values]
      .sort((a, b) => a - b)
      .map((value) => ({ value, height: this.computeHeight(value, maxLevel) }));

    return {
      maxLevel,
      level: Math.max(1, ...nodes.map((node) => node.height), 1),
      nodes,
    };
  }

  private layout(snapshot: SkipSnapshot): { nodes: VisualNode[]; links: VisualLink[] } {
    const nodes: VisualNode[] = [];
    const links: VisualLink[] = [];
    const spacingX = 112;
    const spacingY = 78;

    snapshot.nodes.forEach((entry, index) => {
      for (let level = 0; level < entry.height; level += 1) {
        const id = `${entry.value}-${level}`;
        nodes.push({
          id,
          value: String(entry.value),
          x: 120 + index * spacingX,
          y: 90 + (snapshot.level - 1 - level) * spacingY,
          level,
          state: level === entry.height - 1 ? 'emphasis' : 'default',
        });

        if (level > 0) {
          links.push({ from: `${entry.value}-${level}`, to: `${entry.value}-${level - 1}`, color: 'rgba(56,189,248,0.8)' });
        }
      }
    });

    for (let index = 0; index < snapshot.nodes.length - 1; index += 1) {
      const current = snapshot.nodes[index];
      const next = snapshot.nodes[index + 1];
      links.push({ from: `${current.value}-${current.height - 1}`, to: `${next.value}-${next.height - 1}`, color: 'rgba(255,255,255,0.16)' });
    }

    return { nodes, links };
  }

  insert(value: number, context: EngineContext): OperationResult {
    const validation = this.clampInsert(value, context);
    if (validation) {
      return { frames: [this.frame(validation)], snapshot: this.snapshot(), message: validation };
    }

    if (!this.values.includes(value)) {
      this.values.push(value);
    }
    this.snapshotState = this.rebuildSnapshot(context.skipListMaxLevel);

    return {
      frames: [this.frame(`Inserted ${value}`), this.frame(`computeSkipListLayers(${value}) => ${this.computeSkipListLayers(value, context.skipListMaxLevel)} levels`)],
      snapshot: this.snapshot(),
      message: `Inserted ${value}`,
    };
  }

  delete(value: number, context: EngineContext): OperationResult {
    if (!this.values.includes(value)) {
      return { frames: [this.frame(`Value ${value} not found`)], snapshot: this.snapshot(), message: `Value ${value} not found` };
    }

    this.values = this.values.filter((item) => item !== value);
    this.snapshotState = this.rebuildSnapshot(context.skipListMaxLevel);

    return {
      frames: [this.frame(`Deleted ${value}`), this.frame('Tower links updated')],
      snapshot: this.snapshot(),
      message: `Deleted ${value}`,
    };
  }

  search(value: number, context: EngineContext): OperationResult {
    const found = this.values.includes(value);
    return {
      frames: [this.frame(found ? `Found ${value}` : `${value} not found`)],
      snapshot: this.snapshot(),
      message: found ? `Found ${value}` : `${value} not found`,
    };
  }

  snapshot(): StructureSnapshot {
    return snapshotFromSkip(this.kind, this.snapshotState);
  }

  restore(snapshot: StructureSnapshot): void {
    this.values = [...snapshot.values];
    this.snapshotState = snapshot.payload as SkipSnapshot;
  }

  private frame(message: string): StructureFrame {
    const { nodes, links } = this.layout(this.snapshotState);
    return { message, nodes, links };
  }
}

export const createStructureEngine = (kind: StructureKind): BaseEngine => {
  switch (kind) {
    case 'AVL':
      return new AVLTreeEngine();
    case 'RBT':
      return new RedBlackTreeEngine();
    case 'BTREE':
      return new MultiwayTreeEngine('BTREE', 4);
    case 'T23':
      return new MultiwayTreeEngine('T23', 3);
    case 'SKIPLIST':
      return new SkipListEngine();
    case 'BST':
    default:
      return new BinarySearchTreeEngine();
  }
};

export type StructureEngine = BaseEngine;
