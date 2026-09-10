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

  // Helper to compute subtree width (in leaf units)
  const getSubtreeWidth = (node) => {
    if (!node.children || node.children.length === 0) {
      return 1;
    }
    return node.children.reduce((acc, child) => acc + getSubtreeWidth(child), 0);
  };

  const nodeSpacing = 160;

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

    if (node.children && node.children.length > 0) {
      const totalWidth = getSubtreeWidth(node);
      let currentX = x - (totalWidth * nodeSpacing) / 2;

      node.children.forEach((child, index) => {
        const childWidth = getSubtreeWidth(child);
        const childX = currentX + (childWidth * nodeSpacing) / 2;
        const childPath = `${path}.${index}`;

        links.push({
          from: id,
          to: childPath,
          color: isT23 ? 'rgba(248,113,113,0.8)' : 'rgba(255,183,77,0.7)',
        });

        walk(child, depth + 1, childX, childPath);
        currentX += childWidth * nodeSpacing;
      });
    }
  };

  const rootWidth = getSubtreeWidth(root);
  const startX = Math.max(420, (rootWidth * nodeSpacing) / 2 + 60);
  walk(root, 0, startX, 'root');

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
    if (!values || !values.length) return null;
    const engine = new MultiwayTreeEngine(this.kind, this.order);
    for (const v of values) {
      engine.insert(v);
    }
    return engine.root;
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

    const M = this.order;

    const insertInNode = (node, v) => {
      // Leaf node
      if (!node.children || node.children.length === 0) {
        const keys = [...node.keys];
        let i = 0;
        while (i < keys.length && keys[i] < v) i += 1;
        keys.splice(i, 0, v);

        if (keys.length < M) {
          return { node: { keys, children: [] }, promoted: null };
        }

        // Overflow in leaf: split
        const mid = Math.floor(keys.length / 2);
        const promotedKey = keys[mid];
        const leftNode = { keys: keys.slice(0, mid), children: [] };
        const rightNode = { keys: keys.slice(mid + 1), children: [] };

        return { node: null, promoted: { key: promotedKey, left: leftNode, right: rightNode } };
      }

      // Internal node
      let idx = 0;
      while (idx < node.keys.length && v > node.keys[idx]) idx += 1;

      const res = insertInNode(node.children[idx], v);
      if (!res.promoted) {
        const newChildren = [...node.children];
        newChildren[idx] = res.node;
        return { node: { keys: [...node.keys], children: newChildren }, promoted: null };
      }

      // Incorporate promoted key and split children at idx
      const newKeys = [...node.keys];
      newKeys.splice(idx, 0, res.promoted.key);

      const newChildren = [...node.children];
      newChildren.splice(idx, 1, res.promoted.left, res.promoted.right);

      if (newKeys.length < M) {
        return { node: { keys: newKeys, children: newChildren }, promoted: null };
      }

      // Overflow in internal node: split
      const mid = Math.floor(newKeys.length / 2);
      const promotedKey = newKeys[mid];
      const leftNode = { keys: newKeys.slice(0, mid), children: newChildren.slice(0, mid + 1) };
      const rightNode = { keys: newKeys.slice(mid + 1), children: newChildren.slice(mid + 1) };

      return { node: null, promoted: { key: promotedKey, left: leftNode, right: rightNode } };
    };

    if (!this.root) {
      this.root = { keys: [value], children: [] };
    } else {
      const res = insertInNode(this.root, value);
      if (res.promoted) {
        this.root = { keys: [res.promoted.key], children: [res.promoted.left, res.promoted.right] };
      } else {
        this.root = res.node;
      }
    }

    // Update sorted values list
    let pos = 0;
    while (pos < this.values.length && this.values[pos] < value) pos += 1;
    this.values.splice(pos, 0, value);

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

    const remaining = this.values.filter((item) => item !== value);
    this.root = null;
    this.values = [];
    for (const v of remaining) {
      this.insert(v);
    }

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

export const createStructureEngine = (kind) => {
  switch (kind) {
    case 'AVL':
      return new AVLTreeEngine();
    case 'RBT':
      return new RedBlackTreeEngine();
    case 'BTREE':
      return new MultiwayTreeEngine('BTREE', 4);
    case 'T23':
      return new MultiwayTreeEngine('T23', 3);
    case 'BST':
    default:
      return new BinarySearchTreeEngine();
  }
};
