export type StructureKind = 'BST' | 'AVL' | 'RBT' | 'BTREE' | 'T23' | 'SKIPLIST';

export type NodeState = 'default' | 'visited' | 'found' | 'deleted' | 'emphasis';

export interface VisualNode {
  id: string;
  value: string;
  x: number;
  y: number;
  state?: NodeState;
  color?: string;
  keys?: string[];
  level?: number;
}

export interface VisualLink {
  from: string;
  to: string;
  color?: string;
  dashed?: boolean;
  label?: string;
}

export interface StructureFrame {
  message: string;
  nodes: VisualNode[];
  links: VisualLink[];
  meta?: Record<string, unknown>;
}

export interface OperationResult {
  frames: StructureFrame[];
  snapshot: StructureSnapshot;
  message: string;
}

export interface StructureSnapshot {
  kind: StructureKind;
  payload: unknown;
  values: number[];
}

export interface OperationHistoryEntry {
  id: string;
  kind: StructureKind;
  operation: 'insert' | 'delete' | 'search' | 'reset';
  value?: number;
  message: string;
  frames: StructureFrame[];
  snapshot: StructureSnapshot;
  timestamp: number;
}

export interface EngineContext {
  maxSize: number;
  skipListMaxLevel: number;
}
