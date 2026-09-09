const makeFrame = (message, nodes = [], links = []) => ({ message, nodes, links });

const buildBSTFromValues = (values) => {
  if (!values.length) {
    return null;
  }

  const root = {
    value: values[0],
    color: 'default',
    left: null,
    right: null,
  };

  const insertNode = (node, value) => {
    if (value < node.value) {
      if (!node.left) {
        node.left = { value, color: 'default', left: null, right: null };
        return;
      }
      insertNode(node.left, value);
      return;
    }

    if (!node.right) {
      node.right = { value, color: 'default', left: null, right: null };
      return;
    }

    insertNode(node.right, value);
  };

  for (const value of values.slice(1)) {
    insertNode(root, value);
  }

  return root;
};

const getAVLHeight = (node) => {
  if (!node) {
    return 0;
  }

  return 1 + Math.max(getAVLHeight(node.left), getAVLHeight(node.right));
};

const getAVLBalanceFactor = (node) => {
  if (!node) {
    return 0;
  }

  return getAVLHeight(node.left) - getAVLHeight(node.right);
};

const rotateAVLLeft = (node) => {
  const pivot = node.right;
  node.right = pivot.left;
  pivot.left = node;
  return pivot;
};

const rotateAVLRright = (node) => {
  const pivot = node.left;
  node.left = pivot.right;
  pivot.right = node;
  return pivot;
};

const insertAVLNode = (node, value) => {
  if (!node) {
    return { value, color: 'default', left: null, right: null };
  }

  if (value < node.value) {
    node.left = insertAVLNode(node.left, value);
  } else if (value > node.value) {
    node.right = insertAVLNode(node.right, value);
  } else {
    return node;
  }

  const balance = getAVLBalanceFactor(node);

  if (balance > 1 && value < node.left.value) {
    return rotateAVLRright(node);
  }

  if (balance < -1 && value > node.right.value) {
    return rotateAVLLeft(node);
  }

  if (balance > 1 && value > node.left.value) {
    node.left = rotateAVLLeft(node.left);
    return rotateAVLRright(node);
  }

  if (balance < -1 && value < node.right.value) {
    node.right = rotateAVLRright(node.right);
    return rotateAVLLeft(node);
  }

  return node;
};

const deleteAVLNode = (node, value) => {
  if (!node) {
    return null;
  }

  if (value < node.value) {
    node.left = deleteAVLNode(node.left, value);
  } else if (value > node.value) {
    node.right = deleteAVLNode(node.right, value);
  } else if (!node.left && !node.right) {
    return null;
  } else if (!node.left) {
    return node.right;
  } else if (!node.right) {
    return node.left;
  } else {
    const successor = node.right;
    while (successor.left) {
      successor.left ? null : null;
      break;
    }

    const minNode = (() => {
      let current = node.right;
      while (current && current.left) {
        current = current.left;
      }
      return current;
    })();

    node.value = minNode.value;
    node.right = deleteAVLNode(node.right, minNode.value);
  }

  const balance = getAVLBalanceFactor(node);

  if (balance > 1) {
    if (getAVLBalanceFactor(node.left) < 0) {
      node.left = rotateAVLLeft(node.left);
    }
    return rotateAVLRright(node);
  }

  if (balance < -1) {
    if (getAVLBalanceFactor(node.right) > 0) {
      node.right = rotateAVLRright(node.right);
    }
    return rotateAVLLeft(node);
  }

  return node;
};

const buildAVLFromValues = (values) => {
  let root = null;
  values.forEach((value) => {
    root = insertAVLNode(root, value);
  });
  return root;
};

const rotateRBLeft = (node) => {
  const pivot = node.right;
  node.right = pivot.left;
  pivot.left = node;
  return pivot;
};

const rotateRBRight = (node) => {
  const pivot = node.left;
  node.left = pivot.right;
  pivot.right = node;
  return pivot;
};

const insertRBNode = (node, value) => {
  if (!node) {
    return { value, color: 'red', left: null, right: null };
  }

  if (value < node.value) {
    node.left = insertRBNode(node.left, value);
  } else if (value > node.value) {
    node.right = insertRBNode(node.right, value);
  } else {
    return node;
  }

  if (node.left && node.left.color === 'red' && node.right && node.right.color === 'red') {
    node.color = 'red';
    node.left.color = 'black';
    node.right.color = 'black';
  }

  if (node.left && node.left.color === 'red' && node.left.left && node.left.left.color === 'red') {
    node = rotateRBRight(node);
    node.color = 'black';
    node.right.color = 'red';
  }

  if (node.left && node.left.color === 'red' && node.left.right && node.left.right.color === 'red') {
    node.left = rotateRBLeft(node.left);
    node = rotateRBRight(node);
    node.color = 'black';
    node.right.color = 'red';
  }

  if (node.right && node.right.color === 'red' && node.right.right && node.right.right.color === 'red') {
    node = rotateRBLeft(node);
    node.color = 'black';
    node.left.color = 'red';
  }

  if (node.right && node.right.color === 'red' && node.right.left && node.right.left.color === 'red') {
    node.right = rotateRBRight(node.right);
    node = rotateRBLeft(node);
    node.color = 'black';
    node.left.color = 'red';
  }

  return node;
};

const buildRedBlackTreeFromValues = (values) => {
  let root = null;

  values.forEach((value) => {
    root = insertRBNode(root, value);
  });

  if (root) {
    root.color = 'black';
  }

  return root;
};

const binaryLayout = (root) => {
  if (!root) {
    return { nodes: [], links: [] };
  }

  const nodes = [];
  const links = [];
  let index = 0;

  const walk = (node, depth, path) => {
    const id = path;
    const x = 120 + index * 132;
    const y = depth * 110 + 90;
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

const layoutMultiway = (root, kind = 'BTREE') => {
  if (!root) {
    return { nodes: [], links: [] };
  }

  const nodes = [];
  const links = [];
  const isT23 = kind === 'T23';
  const isBTree = kind === 'BTREE';

  const walk = (node, depth, x, path) => {
    const id = path;
    const keyCount = node.keys.length;
    const contentWidth = isT23 ? Math.max(92, keyCount * 52) : Math.max(90, keyCount * 46 + 28);

    nodes.push({
      id,
      value: node.keys.join(', '),
      x,
      y: depth * 120 + 90,
      keys: node.keys.map(String),
      state: depth === 0 ? 'emphasis' : 'default',
      isT23,
      isBTree,
      width: contentWidth,
    });

    node.children.forEach((child, index) => {
      const childX = x - ((node.children.length - 1) * 180) / 2 + index * 180;
      const childPath = `${path}.${index}`;
      links.push({ from: id, to: childPath, color: isT23 ? 'rgba(248,113,113,0.8)' : 'rgba(255,183,77,0.7)' });
      walk(child, depth + 1, childX, childPath);
    });
  };

  walk(root, 0, 420, 'root');
  return { nodes, links };
};

const layoutSkipList = (snapshot) => {
  const nodes = [];
  const links = [];
  const marginX = 80; // left margin so first node remains in view
  const horizontalSpacing = 140; // distance between node columns
  const spacingY = 78;
  const maxLevel = snapshot.maxLevel || 6;

  // Create grid nodes and vertical tower links
  snapshot.nodes.forEach((entry, index) => {
    for (let level = 0; level < entry.height; level += 1) {
      const id = `${entry.value}-${level}`;
      // Dynamic X positioning using sorted index and left margin
      const x = marginX + index * horizontalSpacing;
      nodes.push({ id, value: String(entry.value), x, y: 90 + (maxLevel - 1 - level) * spacingY, level, state: level === entry.height - 1 ? 'emphasis' : 'default' });

      if (level > 0) {
        links.push({ from: `${entry.value}-${level}`, to: `${entry.value}-${level - 1}`, color: 'rgba(56,189,248,0.8)' });
      }
    }
  });

  // Optional HEAD / sentinel column on the far left spanning all levels
  const headX = marginX - horizontalSpacing;
  for (let level = 0; level < maxLevel; level += 1) {
    const headId = `HEAD-${level}`;
    nodes.push({ id: headId, value: 'HEAD', x: headX, y: 90 + (maxLevel - 1 - level) * spacingY, level, state: 'head' });
    if (level > 0) {
      links.push({ from: `HEAD-${level}`, to: `HEAD-${level - 1}`, color: 'rgba(250,204,21,0.9)' });
    }
  }

  // Horizontal links (express lanes) on each level:
  // Build a quick lookup from id -> rendered node
  const idToNode = new Map(nodes.map((n) => [n.id, n]));

  // For each level, connect adjacent nodes according to snapshot order.
  // Level 0 (base) MUST connect every adjacent node.
  for (let level = 0; level < maxLevel; level += 1) {
    // Filter snapshot nodes in sequential order that reach > level (height > level)
    const active = snapshot.nodes
      .map((e) => ({ value: e.value, height: Number(e.height) || 1 }))
      .filter((e) => e.height > level)
      .sort((a, b) => Number(a.value) - Number(b.value));

    if (active.length === 0) continue;

    // Do not create HEAD -> first links here; renderer will draw only between real nodes.

    // Connect each adjacent pair sequentially (no skipping)
    for (let i = 0; i < active.length - 1; i += 1) {
      const fromId = `${active[i].value}-${level}`;
      const toId = `${active[i + 1].value}-${level}`;
      const fromNode = idToNode.get(fromId);
      const toNode = idToNode.get(toId);
      if (!fromNode || !toNode) continue;
      links.push({ from: fromId, to: toId, color: '#38bdf8', levelY: fromNode.y });
    }
  }

  return { nodes, links };
};

class BaseEngine {
  constructor(kind) {
    this.kind = kind;
    this.values = [];
  }

  getValues() {
    return [...this.values];
  }

  renderCurrentState() {
    if (this.kind === 'SKIPLIST') {
      const snapshot = this.snapshotState ?? this.rebuildSnapshot?.(6) ?? { maxLevel: 6, level: 1, nodes: [] };
      return layoutSkipList(snapshot);
    }

    if (this.kind === 'BTREE' || this.kind === 'T23') {
      return layoutMultiway(this.root ?? null, this.kind);
    }

    return binaryLayout(buildBSTFromValues(this.values));
  }

  frameForStatus(message) {
    const { nodes, links } = this.renderCurrentState();
    return makeFrame(message, nodes, links);
  }

  clampInsert(value, context) {
    if (!Number.isFinite(value)) {
      return 'Enter a valid numeric value';
    }

    // Only enforce a limit if `context.maxSize` is explicitly a positive number.
    const maxRaw = context?.maxSize;
    const max = typeof maxRaw === 'number' && Number.isFinite(maxRaw) ? maxRaw : null;
    if (max && this.values.length >= max) {
      return `Structure limit reached at ${max}`;
    }

    return null;
  }

  snapshot() {
    return { kind: this.kind, payload: [...this.values], values: [...this.values] };
  }

  restore(snapshot) {
    this.values = Array.isArray(snapshot?.values) ? [...snapshot.values] : [];
    this.root = snapshot?.payload ?? null;
  }
}

class BinarySearchTreeEngine extends BaseEngine {
  constructor() {
    super('BST');
    this.root = null;
  }

  insert(value, context) {
    if (this.values.includes(value)) {
      return {
        frames: [this.frameForStatus(`Value ${value} already in list`)],
        snapshot: this.snapshot(),
        message: `Value ${value} already in list`,
      };
    }

    const validation = this.clampInsert(value, context);
    if (validation) {
      return { frames: [this.frameForStatus(validation)], snapshot: this.snapshot(), message: validation };
    }

    this.values.push(value);
    this.root = buildBSTFromValues(this.values);

    const { nodes, links } = binaryLayout(this.root);
    return {
      frames: [makeFrame(`Inserted ${value}`, nodes, links)],
      snapshot: { kind: this.kind, payload: this.root, values: [...this.values] },
      message: `Inserted ${value}`,
    };
  }

  delete(value) {
    if (!this.values.includes(value)) {
      return { frames: [this.frameForStatus(`Value ${value} not found`)], snapshot: this.snapshot(), message: `Value ${value} not found` };
    }

    this.values = this.values.filter((item) => item !== value);
    this.root = buildBSTFromValues(this.values);

    const { nodes, links } = binaryLayout(this.root);
    return {
      frames: [makeFrame(`Deleted ${value}`, nodes, links)],
      snapshot: { kind: this.kind, payload: this.root, values: [...this.values] },
      message: `Deleted ${value}`,
    };
  }

  search(value) {
    if (!this.values.length) {
      return { frames: [this.frameForStatus('Tree is empty')], snapshot: this.snapshot(), message: 'Tree is empty' };
    }

    // Build the tree structure to traverse
    const tree = this.root ?? buildBSTFromValues(this.values);

    // Traverse and record steps
    const steps = [];
    let curr = tree;
    while (curr) {
      steps.push({ type: 'COMPARE', value: curr.value });
      if (value === curr.value) {
        steps.push({ type: 'FOUND', value: curr.value });
        break;
      }
      if (value < curr.value) {
        steps.push({ type: 'TRAVERSE_LEFT', from: curr.value, to: curr.left ? curr.left.value : null });
        curr = curr.left;
      } else {
        steps.push({ type: 'TRAVERSE_RIGHT', from: curr.value, to: curr.right ? curr.right.value : null });
        curr = curr.right;
      }
    }

    if (!curr || (curr && curr.value !== value)) {
      steps.push({ type: 'NOT_FOUND', last: steps.length ? steps[steps.length - 1].value : null });
    }

    // Build animated frames from steps
    this.root = tree;
    this.snapshotState = this.rebuildSnapshot ? this.rebuildSnapshot() : { maxLevel: 1, level: 1, nodes: [] };
    const frames = [];
    const visited = new Set();
    for (const step of steps) {
      if (step.type === 'COMPARE' || step.type === 'TRAVERSE_LEFT' || step.type === 'TRAVERSE_RIGHT') {
        if (step.value != null) visited.add(String(step.value));
      }

      const { nodes, links } = binaryLayout(tree);
      const decorated = nodes.map((n) => {
        if (visited.has(String(n.value))) return { ...n, state: 'visited' };
        return n;
      });

      // Highlight current compare/found node
      if (step.type === 'COMPARE' || step.type === 'FOUND') {
        for (let i = 0; i < decorated.length; i += 1) {
          if (String(decorated[i].value) === String(step.value)) {
            decorated[i] = { ...decorated[i], state: step.type === 'FOUND' ? 'found' : 'emphasis' };
            break;
          }
        }
      }

      if (step.type === 'NOT_FOUND') {
        const lastVal = step.last;
        if (lastVal != null) {
          for (let i = 0; i < decorated.length; i += 1) {
            if (String(decorated[i].value) === String(lastVal)) {
              decorated[i] = { ...decorated[i], state: 'deleted' };
              break;
            }
          }
        }
      }

      frames.push(makeFrame('', decorated, links));
    }

    const found = steps.some((s) => s.type === 'FOUND');
    const message = found ? `Found ${value}` : `${value} not found`;

    return {
      frames: frames.length ? frames : [this.frameForStatus(message)],
      snapshot: { kind: this.kind, payload: tree, values: [...this.values] },
      message,
    };
  }
}

class AVLTreeEngine extends BinarySearchTreeEngine {
  constructor() {
    super();
    this.kind = 'AVL';
  }

  renderCurrentState() {
    return binaryLayout(this.root ?? buildAVLFromValues(this.values));
  }

  insert(value, context) {
    if (this.values.includes(value)) {
      return {
        frames: [this.frameForStatus(`Value ${value} already in list`)],
        snapshot: this.snapshot(),
        message: `Value ${value} already in list`,
      };
    }

    const validation = this.clampInsert(value, context);
    if (validation) {
      return { frames: [this.frameForStatus(validation)], snapshot: this.snapshot(), message: validation };
    }

    this.values.push(value);
    this.root = buildAVLFromValues(this.values);

    const { nodes, links } = binaryLayout(this.root);
    return {
      frames: [makeFrame(`Inserted ${value}`, nodes, links)],
      snapshot: { kind: this.kind, payload: this.root, values: [...this.values] },
      message: `Inserted ${value}`,
    };
  }

  delete(value) {
    if (!this.values.length) {
      return { frames: [this.frameForStatus('Tree is empty')], snapshot: this.snapshot(), message: 'Tree is empty' };
    }

    if (!this.values.includes(value)) {
      return { frames: [this.frameForStatus(`Value ${value} not found`)], snapshot: this.snapshot(), message: `Value ${value} not found` };
    }

    this.values = this.values.filter((item) => item !== value);
    this.root = deleteAVLNode(this.root, value);

    const { nodes, links } = binaryLayout(this.root);
    return {
      frames: [makeFrame(`Deleted ${value}`, nodes, links)],
      snapshot: { kind: this.kind, payload: this.root, values: [...this.values] },
      message: `Deleted ${value}`,
    };
  }

  search(value) {
    if (!this.values.length) {
      return { frames: [this.frameForStatus('Tree is empty')], snapshot: this.snapshot(), message: 'Tree is empty' };
    }

    const root = this.root ?? buildAVLFromValues(this.values);

    // Traverse with steps similar to BST
    const steps = [];
    let curr = root;
    while (curr) {
      steps.push({ type: 'COMPARE', value: curr.value });
      if (value === curr.value) {
        steps.push({ type: 'FOUND', value: curr.value });
        break;
      }
      if (value < curr.value) {
        steps.push({ type: 'TRAVERSE_LEFT', from: curr.value, to: curr.left ? curr.left.value : null });
        curr = curr.left;
      } else {
        steps.push({ type: 'TRAVERSE_RIGHT', from: curr.value, to: curr.right ? curr.right.value : null });
        curr = curr.right;
      }
    }

    if (!curr || (curr && curr.value !== value)) {
      steps.push({ type: 'NOT_FOUND', last: steps.length ? steps[steps.length - 1].value : null });
    }

    const frames = [];
    const visited = new Set();
    for (const step of steps) {
      if (step.type === 'COMPARE' || step.type === 'TRAVERSE_LEFT' || step.type === 'TRAVERSE_RIGHT') {
        if (step.value != null) visited.add(String(step.value));
      }
      const { nodes, links } = binaryLayout(root);
      const decorated = nodes.map((n) => (visited.has(String(n.value)) ? { ...n, state: 'visited' } : n));
      if (step.type === 'COMPARE' || step.type === 'FOUND') {
        for (let i = 0; i < decorated.length; i += 1) {
          if (String(decorated[i].value) === String(step.value)) {
            decorated[i] = { ...decorated[i], state: step.type === 'FOUND' ? 'found' : 'emphasis' };
            break;
          }
        }
      }
      if (step.type === 'NOT_FOUND') {
        const lastVal = step.last;
        if (lastVal != null) {
          for (let i = 0; i < decorated.length; i += 1) {
            if (String(decorated[i].value) === String(lastVal)) {
              decorated[i] = { ...decorated[i], state: 'deleted' };
              break;
            }
          }
        }
      }
      frames.push(makeFrame('', decorated, links));
    }

    const foundFlag = steps.some((s) => s.type === 'FOUND');
    const message = foundFlag ? `Found ${value}` : `${value} not found`;
    return { frames: frames.length ? frames : [this.frameForStatus(message)], snapshot: { kind: this.kind, payload: root, values: [...this.values] }, message };
  }

  snapshot() {
    return { kind: this.kind, payload: this.root, values: [...this.values] };
  }

  restore(snapshot) {
    this.values = Array.isArray(snapshot?.values) ? [...snapshot.values] : [];
    this.root = snapshot?.payload ?? buildAVLFromValues(this.values);
  }
}

class RedBlackTreeEngine extends BinarySearchTreeEngine {
  constructor() {
    super();
    this.kind = 'RBT';
  }

  renderCurrentState() {
    return binaryLayout(this.root ?? buildRedBlackTreeFromValues(this.values));
  }

  insert(value, context) {
    if (this.values.includes(value)) {
      return {
        frames: [this.frameForStatus(`Value ${value} already in list`)],
        snapshot: this.snapshot(),
        message: `Value ${value} already in list`,
      };
    }

    const validation = this.clampInsert(value, context);
    if (validation) {
      return { frames: [this.frameForStatus(validation)], snapshot: this.snapshot(), message: validation };
    }

    this.values.push(value);
    this.root = buildRedBlackTreeFromValues(this.values);

    const { nodes, links } = binaryLayout(this.root);
    return {
      frames: [makeFrame(`Inserted ${value}`, nodes, links)],
      snapshot: { kind: this.kind, payload: this.root, values: [...this.values] },
      message: `Inserted ${value}`,
    };
  }

  delete(value) {
    if (!this.values.length) {
      return { frames: [this.frameForStatus('Tree is empty')], snapshot: this.snapshot(), message: 'Tree is empty' };
    }

    if (!this.values.includes(value)) {
      return { frames: [this.frameForStatus(`Value ${value} not found`)], snapshot: this.snapshot(), message: `Value ${value} not found` };
    }

    this.values = this.values.filter((item) => item !== value);
    this.root = buildRedBlackTreeFromValues(this.values);

    const { nodes, links } = binaryLayout(this.root);
    return {
      frames: [makeFrame(`Deleted ${value}`, nodes, links)],
      snapshot: { kind: this.kind, payload: this.root, values: [...this.values] },
      message: `Deleted ${value}`,
    };
  }

  search(value) {
    if (!this.values.length) {
      return { frames: [this.frameForStatus('Tree is empty')], snapshot: this.snapshot(), message: 'Tree is empty' };
    }

    const root = this.root ?? buildRedBlackTreeFromValues(this.values);

    // Use same traversal approach as BST
    const steps = [];
    let curr = root;
    while (curr) {
      steps.push({ type: 'COMPARE', value: curr.value });
      if (value === curr.value) {
        steps.push({ type: 'FOUND', value: curr.value });
        break;
      }
      if (value < curr.value) {
        steps.push({ type: 'TRAVERSE_LEFT', from: curr.value, to: curr.left ? curr.left.value : null });
        curr = curr.left;
      } else {
        steps.push({ type: 'TRAVERSE_RIGHT', from: curr.value, to: curr.right ? curr.right.value : null });
        curr = curr.right;
      }
    }

    if (!curr || (curr && curr.value !== value)) {
      steps.push({ type: 'NOT_FOUND', last: steps.length ? steps[steps.length - 1].value : null });
    }

    const frames = [];
    const visited = new Set();
    for (const step of steps) {
      if (step.type === 'COMPARE' || step.type === 'TRAVERSE_LEFT' || step.type === 'TRAVERSE_RIGHT') {
        if (step.value != null) visited.add(String(step.value));
      }
      const { nodes, links } = binaryLayout(root);
      const decorated = nodes.map((n) => (visited.has(String(n.value)) ? { ...n, state: 'visited' } : n));
      if (step.type === 'COMPARE' || step.type === 'FOUND') {
        for (let i = 0; i < decorated.length; i += 1) {
          if (String(decorated[i].value) === String(step.value)) {
            decorated[i] = { ...decorated[i], state: step.type === 'FOUND' ? 'found' : 'emphasis' };
            break;
          }
        }
      }
      if (step.type === 'NOT_FOUND') {
        const lastVal = step.last;
        if (lastVal != null) {
          for (let i = 0; i < decorated.length; i += 1) {
            if (String(decorated[i].value) === String(lastVal)) {
              decorated[i] = { ...decorated[i], state: 'deleted' };
              break;
            }
          }
        }
      }
      frames.push(makeFrame('', decorated, links));
    }

    const foundFlag = steps.some((s) => s.type === 'FOUND');
    const message = foundFlag ? `Found ${value}` : `${value} not found`;
    return { frames: frames.length ? frames : [this.frameForStatus(message)], snapshot: { kind: this.kind, payload: root, values: [...this.values] }, message };
  }

  snapshot() {
    return { kind: this.kind, payload: this.root, values: [...this.values] };
  }

  restore(snapshot) {
    this.values = Array.isArray(snapshot?.values) ? [...snapshot.values] : [];
    this.root = snapshot?.payload ?? buildRedBlackTreeFromValues(this.values);
  }
}

class MultiwayTreeEngine extends BaseEngine {
  constructor(kind, order) {
    super(kind);
    this.order = order;
    this.root = null;
  }

  build(values) {
    if (!values.length) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const maxKeys = Math.max(1, this.order - 1);

    const splitValues = (items) => {
      if (!items.length) {
        return null;
      }

      if (items.length <= maxKeys) {
        return { keys: items, children: [] };
      }

      const middleIndex = Math.floor(items.length / 2);
      const middleValue = items[middleIndex];
      const leftValues = items.slice(0, middleIndex);
      const rightValues = items.slice(middleIndex + 1);

      return {
        keys: [middleValue],
        children: [
          leftValues.length ? splitValues(leftValues) : null,
          rightValues.length ? splitValues(rightValues) : null,
        ].filter(Boolean),
      };
    };

    return splitValues(sorted);
  }

  insert(value, context) {
    if (this.values.includes(value)) {
      return {
        frames: [this.frameForStatus(`Value ${value} already in list`)],
        snapshot: this.snapshot(),
        message: `Value ${value} already in list`,
      };
    }

    const validation = this.clampInsert(value, context);
    if (validation) {
      return { frames: [this.frameForStatus(validation)], snapshot: this.snapshot(), message: validation };
    }

    // Insert value into sorted values list for snapshot/history
    const insertIntoValues = (arr, v) => {
      const copy = [...arr];
      let i = 0;
      while (i < copy.length && copy[i] < v) i += 1;
      copy.splice(i, 0, v);
      return copy;
    };

    // If this is a 2-3 tree (order === 3), perform proper leaf insertion with splits
    if (this.order === 3) {
      // ensure root exists
      if (!this.root) {
        this.root = { keys: [value], children: [] };
        this.values = insertIntoValues(this.values, value);
        const { nodes, links } = layoutMultiway(this.root, this.kind);
        return { frames: [makeFrame(`Inserted ${value}`, nodes, links)], snapshot: { kind: this.kind, payload: this.root, values: [...this.values] }, message: `Inserted ${value}` };
      }

      const insertRecursive = (node, v) => {
        // leaf
        if (!node.children || node.children.length === 0) {
          // insert into keys sorted
          const keys = [...node.keys];
          let i = 0;
          while (i < keys.length && keys[i] < v) i += 1;
          keys.splice(i, 0, v);
          if (keys.length <= 2) {
            return { node: { keys, children: [] }, promoted: null };
          }
          // overflow: split into two nodes and promote middle
          const [a, b, c] = keys;
          const left = { keys: [a], children: [] };
          const right = { keys: [c], children: [] };
          return { node: null, promoted: { key: b, left, right } };
        }

        // internal node
        // find child index to descend
        let idx = 0;
        while (idx < node.keys.length && v > node.keys[idx]) idx += 1;
        const child = node.children[idx];
        const res = insertRecursive(child, v);
        if (!res.promoted) {
          // replace child
          const newChildren = [...node.children];
          newChildren[idx] = res.node;
          return { node: { keys: [...node.keys], children: newChildren }, promoted: null };
        }

        // incorporate promoted into this node
        const promotedKey = res.promoted.key;
        const newKeys = [...node.keys];
        let insertPos = 0;
        while (insertPos < newKeys.length && newKeys[insertPos] < promotedKey) insertPos += 1;
        newKeys.splice(insertPos, 0, promotedKey);

        // replace child at idx with promoted.left and insert promoted.right after it
        const newChildren = [...node.children];
        newChildren.splice(idx, 1, res.promoted.left, res.promoted.right);

        if (newKeys.length <= 2) {
          return { node: { keys: newKeys, children: newChildren }, promoted: null };
        }

        // overflow at internal node: split
        const [k0, k1, k2] = newKeys;
        // children are c0..c3
        const [c0, c1, c2, c3] = newChildren;
        const leftNode = { keys: [k0], children: [c0, c1].filter(Boolean) };
        const rightNode = { keys: [k2], children: [c2, c3].filter(Boolean) };
        return { node: null, promoted: { key: k1, left: leftNode, right: rightNode } };
      };

      const res = insertRecursive(this.root, value);
      if (res.promoted) {
        // root split
        this.root = { keys: [res.promoted.key], children: [res.promoted.left, res.promoted.right] };
      } else {
        this.root = res.node;
      }

      this.values = insertIntoValues(this.values, value);
      const { nodes, links } = layoutMultiway(this.root, this.kind);
      return { frames: [makeFrame(`Inserted ${value}`, nodes, links)], snapshot: { kind: this.kind, payload: this.root, values: [...this.values] }, message: `Inserted ${value}` };
    }

    // Fallback for other orders: rebuild tree from values (existing behavior)
    this.values.push(value);
    this.root = this.build(this.values);

    const { nodes, links } = layoutMultiway(this.root, this.kind);
    return {
      frames: [makeFrame(`Inserted ${value}`, nodes, links)],
      snapshot: { kind: this.kind, payload: this.root, values: [...this.values] },
      message: `Inserted ${value}`,
    };
  }

  delete(value) {
    if (!this.values.length) {
      return { frames: [this.frameForStatus('Tree is empty')], snapshot: this.snapshot(), message: 'Tree is empty' };
    }

    if (!this.values.includes(value)) {
      return { frames: [this.frameForStatus(`Value ${value} not found`)], snapshot: this.snapshot(), message: `Value ${value} not found` };
    }

    this.values = this.values.filter((item) => item !== value);
    this.root = this.build(this.values);

    const { nodes, links } = layoutMultiway(this.root, this.kind);
    return {
      frames: [makeFrame(`Deleted ${value}`, nodes, links)],
      snapshot: { kind: this.kind, payload: this.root, values: [...this.values] },
      message: `Deleted ${value}`,
    };
  }

  search(value) {
    if (!this.values.length) return { frames: [this.frameForStatus('Tree is empty')], snapshot: this.snapshot(), message: 'Tree is empty' };

    const tree = this.root ?? this.build(this.values);
    let curr = tree;
    const steps = [];

    while (curr) {
      const nodeKeys = curr.keys || [];
      const display = nodeKeys.join(', ');
      steps.push({ type: 'COMPARE_NODE', keys: display });
      // check if any key matches
      const foundKey = nodeKeys.find((k) => Number(k) === Number(value));
      if (foundKey != null) {
        steps.push({ type: 'FOUND', keys: display, value: Number(foundKey) });
        break;
      }

      // choose child index
      let childIndex = nodeKeys.findIndex((k) => Number(value) < Number(k));
      if (childIndex === -1) childIndex = (curr.children && curr.children.length) ? curr.children.length - 1 : null;
      // record traversal attempt
      const nextChild = (curr.children && childIndex != null) ? (curr.children[childIndex] ? curr.children[childIndex].keys?.join(', ') : null) : null;
      steps.push({ type: 'TRAVERSE_CHILD', from: display, to: nextChild, childIndex });
      curr = (curr.children && childIndex != null) ? curr.children[childIndex] : null;
    }

    if (!curr || (curr && !curr.keys?.includes(String(value)))) {
      steps.push({ type: 'NOT_FOUND', last: steps.length ? steps[steps.length - 1].from ?? steps[steps.length - 1].keys : null });
    }

    // Build frames
    const frames = [];
    const visited = new Set();
    for (const step of steps) {
      if (step.type === 'COMPARE_NODE' || step.type === 'TRAVERSE_CHILD') {
        if (step.keys) visited.add(String(step.keys));
        if (step.from) visited.add(String(step.from));
      }
      const { nodes, links } = layoutMultiway(tree, this.kind);
      const decorated = nodes.map((n) => {
        if (visited.has(String(n.value))) return { ...n, state: 'visited' };
        return n;
      });

      if (step.type === 'COMPARE_NODE' || step.type === 'FOUND') {
        const targetDisplay = step.keys || step.from;
        for (let i = 0; i < decorated.length; i += 1) {
          if (String(decorated[i].value) === String(targetDisplay)) {
            decorated[i] = { ...decorated[i], state: step.type === 'FOUND' ? 'found' : 'emphasis' };
            break;
          }
        }
      }

      if (step.type === 'NOT_FOUND') {
        const last = step.last;
        if (last) {
          for (let i = 0; i < decorated.length; i += 1) {
            if (String(decorated[i].value) === String(last)) {
              decorated[i] = { ...decorated[i], state: 'deleted' };
              break;
            }
          }
        }
      }

      frames.push(makeFrame('', decorated, links));
    }

    const foundFlag = steps.some((s) => s.type === 'FOUND');
    const message = foundFlag ? `Found ${value}` : `${value} not found`;
    return { frames: frames.length ? frames : [this.frameForStatus(message)], snapshot: { kind: this.kind, payload: tree, values: [...this.values] }, message };
  }

  snapshot() {
    return { kind: this.kind, payload: this.root, values: [...this.values] };
  }

  restore(snapshot) {
    this.values = Array.isArray(snapshot?.values) ? [...snapshot.values] : [];
    this.root = snapshot?.payload ?? null;
  }
}

class SkipListEngine extends BaseEngine {
  constructor(maxLevel = 6, p = 0.5) {
    super('SKIPLIST');
    this.MAXLVL = maxLevel;
    this.P = p;
    this.level = 0; // current highest level (0-based)
    // header sentinel node with forward pointers
    this.header = { key: -Infinity, forward: Array(this.MAXLVL).fill(null) };
    this.values = [];
    this.snapshotState = { maxLevel: this.MAXLVL, level: 1, nodes: [] };
  }

  randomLevel() {
    // Return a 1-based height using coin-flip (p) up to MAXLVL
    let level = 1;
    while (Math.random() < this.P && level < this.MAXLVL) {
      level += 1;
    }
    return level;
  }

  rebuildValuesFromList() {
    const vals = [];
    let cur = this.header.forward[0];
    while (cur) {
      vals.push(cur.key);
      cur = cur.forward[0];
    }
    this.values = vals;
  }

  rebuildSnapshot() {
    // Traverse level 0 to obtain sorted nodes and their heights
    const nodes = [];
    let cur = this.header.forward[0];
    while (cur) {
      const height = cur.forward.length; // stored height = forward array length
      nodes.push({ value: cur.key, height });
      cur = cur.forward[0];
    }

    return {
      maxLevel: this.MAXLVL,
      level: Math.max(1, this.level + 1, 1),
      nodes,
    };
  }

  insert(value, context) {
    const validation = this.clampInsert(value, context);
    if (validation) return { frames: [this.frameForStatus(validation)], snapshot: this.snapshot(), message: validation };

    // build update array
    const update = Array(this.MAXLVL).fill(null);
    let current = this.header;
    for (let i = this.level; i >= 0; i -= 1) {
      while (current.forward[i] && current.forward[i].key < value) {
        current = current.forward[i];
      }
      update[i] = current;
    }

    current = current.forward[0];
    if (current && current.key === value) {
      return { frames: [this.frameForStatus(`Value ${value} already in list`)], snapshot: this.snapshot(), message: `Value ${value} already in list` };
    }

    // rlevel is the generated height (1..MAXLVL). Convert to 0-based max index.
    const rlevel = this.randomLevel();
    const rIdx = rlevel - 1;
    if (rIdx > this.level) {
      for (let i = this.level + 1; i <= rIdx; i += 1) update[i] = this.header;
      this.level = rIdx;
    }

    // Persist node height and create forward array of exact length = rlevel
    const newNode = { key: value, forward: Array(rlevel).fill(null), height: rlevel };
    for (let i = 0; i <= rIdx; i += 1) {
      newNode.forward[i] = update[i].forward[i] ?? null;
      update[i].forward[i] = newNode;
    }

    this.rebuildValuesFromList();
    this.snapshotState = this.rebuildSnapshot();
    const { nodes, links } = layoutSkipList(this.snapshotState);

    return {
      frames: [makeFrame(`Inserted ${value}`, nodes, links)],
      snapshot: { kind: this.kind, payload: this.snapshotState, values: [...this.values] },
      message: `Inserted ${value}`,
    };
  }

  delete(value, context) {
    if (!this.values.length) return { frames: [this.frameForStatus('List is empty')], snapshot: this.snapshot(), message: 'List is empty' };

    // build update array
    const update = Array(this.MAXLVL).fill(null);
    let current = this.header;
    for (let i = this.level; i >= 0; i -= 1) {
      while (current.forward[i] && current.forward[i].key < value) current = current.forward[i];
      update[i] = current;
    }

    current = current.forward[0];
    if (!current || current.key !== value) {
      return { frames: [this.frameForStatus(`Value ${value} not found`)], snapshot: this.snapshot(), message: `Value ${value} not found` };
    }

    for (let i = 0; i <= this.level; i += 1) {
      if (update[i].forward[i] !== current) break;
      update[i].forward[i] = current.forward[i] ?? null;
    }

    while (this.level > 0 && this.header.forward[this.level] == null) this.level -= 1;

    this.rebuildValuesFromList();
    this.snapshotState = this.rebuildSnapshot();

    const { nodes, links } = layoutSkipList(this.snapshotState);
    return {
      frames: [makeFrame(`Deleted ${value}`, nodes, links)],
      snapshot: { kind: this.kind, payload: this.snapshotState, values: [...this.values] },
      message: `Deleted ${value}`,
    };
  }

  search(value, context) {
    if (!this.values.length) {
      return { frames: [this.frameForStatus('List is empty')], snapshot: this.snapshot(), message: 'List is empty' };
    }

    // Traverse like a typical skip list search, recording visited nodes per step
    const steps = [];
    let current = this.header;
    // iterate from top level down
    for (let i = this.level; i >= 0; i -= 1) {
      // record starting position at this level (header)
      steps.push({ id: `HEAD-${i}`, level: i, type: 'position' });
      while (current.forward[i] && current.forward[i].key < value) {
        current = current.forward[i];
        // record visit to this node at level i
        steps.push({ id: `${current.key}-${i}`, level: i, type: 'visit' });
      }
      // record the node we ended at for this level (could be header or a node)
      if (current === this.header) {
        steps.push({ id: `HEAD-${i}`, level: i, type: 'position' });
      } else {
        steps.push({ id: `${current.key}-${i}`, level: i, type: 'position' });
      }
    }

    // move to potential target at level 0
    const target = current.forward[0];
    const found = !!(target && target.key === value);
    if (target) {
      steps.push({ id: `${target.key}-0`, level: 0, type: found ? 'found' : 'visit' });
    }

    // Build frames that progressively highlight the visited nodes
    const frames = [];
    const visited = new Set();
    // ensure snapshot is up to date
    this.snapshotState = this.rebuildSnapshot();

    for (const step of steps) {
      // accumulate visited ids (for persistent path highlighting)
      if (step.id && !String(step.id).startsWith('HEAD-')) visited.add(step.id);

      const { nodes, links } = layoutSkipList(this.snapshotState);
      const decoratedNodes = nodes.map((n) => {
        if (visited.has(n.id)) {
          // if this step marks found and matches id, mark found
          if (step.type === 'found' && n.id === step.id) return { ...n, state: 'found' };
          return { ...n, state: 'visited' };
        }
        return n;
      });

      frames.push(makeFrame('', decoratedNodes, links));
    }

    const message = found ? `Found ${value}` : `${value} not found`;

    return {
      frames: frames.length ? frames : [this.frameForStatus(message)],
      snapshot: { kind: this.kind, payload: this.snapshotState, values: [...this.values] },
      message,
    };
  }

  snapshot() {
    return { kind: this.kind, payload: this.snapshotState, values: [...this.values] };
  }

  restore(snapshot) {
    // If payload contains explicit nodes with heights, rebuild deterministically
    const payload = snapshot?.payload;
    const vals = Array.isArray(snapshot?.values) ? [...snapshot.values] : [];

    // reset
    this.header = { key: -Infinity, forward: Array(this.MAXLVL).fill(null) };
    this.level = 0;
    this.values = [];

    if (payload && Array.isArray(payload.nodes) && payload.nodes.length) {
      // last pointer per level (start at header)
      const lastAtLevel = Array(this.MAXLVL).fill(this.header);
      for (const entry of payload.nodes) {
        const value = Number(entry.value);
        const height = Number(entry.height) || 1;
        const node = { key: value, forward: Array(height).fill(null), height };
        // link into each level up to height
        for (let i = 0; i < height; i += 1) {
          lastAtLevel[i].forward[i] = node;
          lastAtLevel[i] = node;
        }
        this.level = Math.max(this.level, height - 1);
        this.values.push(value);
      }

      this.snapshotState = { maxLevel: this.MAXLVL, level: Math.max(1, this.level + 1), nodes: payload.nodes.map((n) => ({ value: n.value, height: n.height })) };
      return undefined;
    }

    // Fallback: rebuild by inserting values (non-deterministic heights)
    for (const v of vals) {
      this.insert(Number(v), { maxSize: null, skipListMaxLevel: this.MAXLVL });
    }
    this.snapshotState = this.rebuildSnapshot();
  }
}

export const createStructureEngine = (kind, opt) => {
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
      // opt may be numeric maxLevel or an options object
      const maxLevel = typeof opt === 'number' ? opt : (opt?.maxLevel ?? 6);
      const p = opt?.p ?? 0.5;
      return new SkipListEngine(maxLevel, p);
    case 'BST':
    default:
      return new BinarySearchTreeEngine();
  }
};
