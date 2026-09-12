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

// ---------------------------------------------------------------------------
// Classic Red-Black insertion (CLRS chapter 13). Null children are black.
// A new node is inserted red, then the ancestry is repaired on the way up with
// the textbook fix-up cases:
//   * CASE 1 – red uncle: recolor (parent + uncle → black, grandparent → red).
//   * CASE 2 – black uncle, zig-zag red child: one rotation at the parent to
//              align the inner grandchild (misaligned child is impossible).
//   * CASE 3 – black uncle, aligned red child: one rotation at the grandparent,
//              then recolor the new pivot black and the old grandparent red.
// Rotations swap positions but never change colors; all recoloring happens
// explicitly here. Guarantees: BST order, black root, no red node with a red
// child, and identical black-node counts on every root-to-leaf path.
const rbRotateLeft = (x) => {
  const y = x.right;
  x.right = y.left;
  if (y.left) y.left.parent = x;
  y.parent = x.parent;
  if (x.parent) {
    if (x.parent.left === x) x.parent.left = y;
    else x.parent.right = y;
  }
  y.left = x;
  x.parent = y;
  return y;
};

const rbRotateRight = (x) => {
  const y = x.left;
  x.left = y.right;
  if (y.right) y.right.parent = x;
  y.parent = x.parent;
  if (x.parent) {
    if (x.parent.left === x) x.parent.left = y;
    else x.parent.right = y;
  }
  y.right = x;
  x.parent = y;
  return y;
};

const stripParentLinks = (node) => {
  if (!node) return;
  delete node.parent;
  stripParentLinks(node.left);
  stripParentLinks(node.right);
};

const insertRBNode = (root, value) => {
  if (!root) {
    return { value, color: 'black', left: null, right: null };
  }

  // --- BST insert while recording the ancestor path for the fix-up ---
  let z = { value, color: 'red', left: null, right: null, parent: null };
  const path = [];
  let x = root;
  while (x) {
    path.push(x);
    if (value < x.value) {
      x = x.left;
    } else if (value > x.value) {
      x = x.right;
    } else {
      return root;
    }
  }
  for (let i = 0; i < path.length - 1; i += 1) {
    path[i + 1].parent = path[i];
  }
  const parent = path[path.length - 1];
  if (value < parent.value) parent.left = z;
  else parent.right = z;
  z.parent = parent;

  // --- RB-INSERT-FIXUP: recoloring (case 1) and rotations (cases 2/3) ---
  while (z.parent && z.parent.color === 'red') {
    const p = z.parent;
    const g = p.parent;

    if (g.left === p) {
      const u = g.right;
      if (u && u.color === 'red') {
        p.color = 'black';
        u.color = 'black';
        g.color = 'red';
        z = g;
      } else if (z === p.right) {
        z = p;
        rbRotateLeft(z);
        z.parent.color = 'black';
        g.color = 'red';
        rbRotateRight(g);
      } else {
        p.color = 'black';
        g.color = 'red';
        rbRotateRight(g);
      }
    } else {
      const u = g.left;
      if (u && u.color === 'red') {
        p.color = 'black';
        u.color = 'black';
        g.color = 'red';
        z = g;
      } else if (z === p.left) {
        z = p;
        rbRotateRight(z);
        z.parent.color = 'black';
        g.color = 'red';
        rbRotateLeft(g);
      } else {
        p.color = 'black';
        g.color = 'red';
        rbRotateLeft(g);
      }
    }
  }

  let r = z;
  while (r.parent) r = r.parent;
  r.color = 'black';
  stripParentLinks(r);
  return r;
};

const buildRedBlackTreeFromValues = (values) => {
  let root = null;

  for (const value of values) {
    root = insertRBNode(root, value);
    if (root) root.color = 'black';
  }

  if (root) {
    root.color = 'black';
  }

  return root;
};

// ---------------------------------------------------------------------------
// Topology-preserving Red-Black recolor enforcement.
//
// Recomputes a valid red/black assignment for the EXISTING tree shape only —
// values, links and positions are never touched. Guarantees: root black, no
// red parent with a red child, and identical black-node counts on every
// root-to-null path (null links count as black leaves).
//
// Method: bottom-up dynamic program. For each node, compute the set of
// achievable subtree black-heights for both parent contexts (a red parent
// forces this node black; a black parent allows either color). A color choice
// is feasible only when both children's achievable sets share that height.
// Top-down reconstruction then paints each node, preferring red where feasible
// so rebalancing stays visible in the metallic red/black styling.
//
// Returns true when the shape admits a valid coloring (applied in place).
// Some shapes (e.g. a bare 3-node chain) admit no valid coloring at all —
// then it returns false and the caller falls back to a full LLRB rebuild.
// ---------------------------------------------------------------------------
const intersectSets = (a, b) => {
  const out = new Set();
  for (const v of a) {
    if (b.has(v)) out.add(v);
  }
  return out;
};

const recolorForUniformBlackHeight = (root) => {
  if (!root) return true;

  const NULL_BH = new Set([1]);
  const sets = new Map();

  const compute = (node) => {
    if (!node) return { red: NULL_BH, black: NULL_BH };
    const left = compute(node.left);
    const right = compute(node.right);
    const blackSet = new Set();
    for (const h of intersectSets(left.black, right.black)) blackSet.add(h + 1);
    const redSet = new Set();
    for (const h of intersectSets(left.red, right.red)) redSet.add(h);
    const entry = { red: redSet, black: blackSet };
    sets.set(node, entry);
    return entry;
  };

  const rootEntry = compute(root);
  const options = [...rootEntry.black].sort((a, b) => a - b);
  if (!options.length) return false;
  const target = options[0];

  const paint = (node, parentIsRed, bh) => {
    if (!node) return true;
    const entry = sets.get(node);
    let color = 'black';
    if (!parentIsRed && entry.red.has(bh)) color = 'red';
    if (color === 'black' && !entry.black.has(bh)) {
      if (parentIsRed || !entry.red.has(bh)) return false;
      color = 'red';
    }
    node.color = color;
    const childBH = bh - (color === 'black' ? 1 : 0);
    const childIsRedParent = color === 'red';
    return paint(node.left, childIsRedParent, childBH)
      && paint(node.right, childIsRedParent, childBH);
  };

  return paint(root, false, target);
};

// Recolor the live tree in place when its shape allows it; otherwise rebuild
// a canonically valid tree from values. The input is cloned first so stored
// snapshots sharing the object are never mutated.
const ensureValidRBTColors = (root, values) => {
  if (!root) return root;
  const clone = JSON.parse(JSON.stringify(root));
  if (recolorForUniformBlackHeight(clone)) return clone;
  return buildRedBlackTreeFromValues(Array.isArray(values) ? values : []);
};

// ---------------------------------------------------------------------------
// Standard hierarchical tree layout.
//
// Phase 1 (bottom–up): count the leaves under every subtree. This gives each
// subtree a width budget, expressed in "leaf slots".
//
// Phase 2 (top–down): place the root at the horizontal centre of the tree and
// recursively resolve child positions from the parent:
//   * A node with two children splits its width budget proportionally – the
//     left child is offset left by half of the RIGHT subtree's span and the
//     right child offset right by half of the LEFT subtree's span. Every
//     adjacent node at the same level is therefore at least `spacing` apart,
//     so no two nodes can ever overlap.
//   * A node with a single child is offset by a fixed half-slot so the edge
//     always branches diagonally outward – horizontal stacking is impossible.
//   * Left children always land to the left, right children to the right, and
//     every level shares the same y baseline (clean level alignment).
// ---------------------------------------------------------------------------
const binaryLayout = (root) => {
  if (!root) {
    return { nodes: [], links: [] };
  }

  const nodes = [];
  const links = [];

  const spacing = 132;
  const halfSpacing = spacing / 2;
  const verticalSpacing = 110;

  const leafCount = new Map();
  const countLeaves = (node) => {
    if (!node.left && !node.right) {
      leafCount.set(node, 1);
      return 1;
    }
    const left = node.left ? countLeaves(node.left) : 0;
    const right = node.right ? countLeaves(node.right) : 0;
    leafCount.set(node, left + right);
    return left + right;
  };

  countLeaves(root);

  const walk = (node, depth, x, path) => {
    const id = path;
    const y = depth * verticalSpacing + 90;

    nodes.push({
      id,
      value: String(node.value),
      x,
      y,
      state: 'default',
      color: node.color,
    });

    const lc = node.left ? leafCount.get(node.left) : 0;
    const rc = node.right ? leafCount.get(node.right) : 0;

    if (node.left && node.right) {
      const leftX = x - (rc * spacing) / 2;
      const rightX = x + (lc * spacing) / 2;

      links.push({ from: id, to: `${path}L`, color: 'rgba(99,102,241,0.85)' });
      walk(node.left, depth + 1, leftX, `${path}L`);

      links.push({ from: id, to: `${path}R`, color: 'rgba(34,197,94,0.75)' });
      walk(node.right, depth + 1, rightX, `${path}R`);
    } else if (node.left) {
      links.push({ from: id, to: `${path}L`, color: 'rgba(99,102,241,0.85)' });
      walk(node.left, depth + 1, x - halfSpacing, `${path}L`);
    } else if (node.right) {
      links.push({ from: id, to: `${path}R`, color: 'rgba(34,197,94,0.75)' });
      walk(node.right, depth + 1, x + halfSpacing, `${path}R`);
    }
  };

  const totalLeaves = leafCount.get(root) || 1;
  const startX = ((totalLeaves - 1) * spacing) / 2 + 80;
  walk(root, 0, startX, 'root');

  return { nodes, links };
};

const multiwayLinkPalette = [
  'rgba(251,191,36,0.85)',
  'rgba(96,165,250,0.85)',
  'rgba(167,139,250,0.85)',
  'rgba(52,211,153,0.85)',
];

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

  const nodeSpacing = 240;
  const minBranchOffset = nodeSpacing * 0.35;

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
      state: 'default',
      isT23,
      isBTree,
      width: contentWidth,
    });

    if (node.children && node.children.length === 1) {
      // A single child is offset horizontally so the connector stays diagonal.
      const childPath = `${path}.0`;
      links.push({
        from: id,
        to: childPath,
        color: multiwayLinkPalette[0],
      });
      walk(node.children[0], depth + 1, x + nodeSpacing * 0.4, childPath);
    } else if (node.children && node.children.length > 1) {
      const totalWidth = getSubtreeWidth(node);
      let currentX = x - (totalWidth * nodeSpacing) / 2;

      node.children.forEach((child, index) => {
        let childWidth = getSubtreeWidth(child);
        let childX = currentX + (childWidth * nodeSpacing) / 2;

        // Overall children of an odd-sized node would sit directly under the
        // parent; push them outward so every connector stays diagonal.
        const delta = childX - x;
        if (Math.abs(delta) < minBranchOffset) {
          childX = x + (index % 2 === 0 ? -1 : 1) * minBranchOffset;
        }

        const childPath = `${path}.${index}`;

        links.push({
          from: id,
          to: childPath,
          color: multiwayLinkPalette[index % multiwayLinkPalette.length],
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

  traverse(order) {
    const orderLabel = order === 'preorder' ? 'Preorder' : order === 'postorder' ? 'Postorder' : 'Inorder';
    const seq = [];

    if (this.kind === 'BTREE' || this.kind === 'T23') {
      const walk = (node) => {
        if (!node) return;
        const keys = node.keys || [];
        const children = node.children || [];
        if (order === 'preorder') {
          keys.forEach((k) => seq.push(k));
          children.forEach((child) => walk(child));
        } else if (order === 'postorder') {
          children.forEach((child) => walk(child));
          keys.forEach((k) => seq.push(k));
        } else {
          keys.forEach((key, index) => {
            if (children[index]) walk(children[index]);
            seq.push(key);
          });
          if (children[keys.length]) walk(children[keys.length]);
        }
      };
      walk(this.root);
    } else {
      const root = this.root
        ?? (this.kind === 'AVL'
          ? buildAVLFromValues(this.values)
          : this.kind === 'RBT'
            ? buildRedBlackTreeFromValues(this.values)
            : buildBSTFromValues(this.values));
      const walk = (node) => {
        if (!node) return;
        if (order === 'preorder') seq.push(node.value);
        walk(node.left);
        if (order === 'inorder') seq.push(node.value);
        walk(node.right);
        if (order === 'postorder') seq.push(node.value);
      };
      walk(root);
    }

    const result = seq.join(', ');
    const message = seq.length ? `${orderLabel}: ${result}` : `${orderLabel}: (tree is empty)`;
    return { order, orderLabel, result, values: seq, message };
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

    const found = steps.some((s) => s.type === 'FOUND');
    if (!found) {
      const message = `${value} not found`;
      return { frames: [this.frameForStatus(message)], snapshot: { kind: this.kind, payload: tree, values: [...this.values] }, message };
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

      if (step.type === 'COMPARE' || step.type === 'FOUND') {
        for (let i = 0; i < decorated.length; i += 1) {
          if (String(decorated[i].value) === String(step.value)) {
            decorated[i] = { ...decorated[i], state: step.type === 'FOUND' ? 'found' : 'emphasis' };
            break;
          }
        }
      }

      frames.push(makeFrame('', decorated, links));
    }

    if (frames.length > 0) {
      const lastFrame = frames[frames.length - 1];
      const finalNodes = lastFrame.nodes.map((n) => ({ ...n, state: 'default' }));
      frames.push(makeFrame('', finalNodes, lastFrame.links));
    }

    return {
      frames,
      snapshot: { kind: this.kind, payload: tree, values: [...this.values] },
      message: `Found ${value}`,
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

    const foundFlag = steps.some((s) => s.type === 'FOUND');
    if (!foundFlag) {
      const message = `${value} not found`;
      return { frames: [this.frameForStatus(message)], snapshot: { kind: this.kind, payload: root, values: [...this.values] }, message };
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
      frames.push(makeFrame('', decorated, links));
    }

    if (frames.length > 0) {
      const lastFrame = frames[frames.length - 1];
      const finalNodes = lastFrame.nodes.map((n) => ({ ...n, state: 'default' }));
      frames.push(makeFrame('', finalNodes, lastFrame.links));
    }

    const message = `Found ${value}`;
    return { frames, snapshot: { kind: this.kind, payload: root, values: [...this.values] }, message };
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

    const foundFlag = steps.some((s) => s.type === 'FOUND');
    if (!foundFlag) {
      const message = `${value} not found`;
      return { frames: [this.frameForStatus(message)], snapshot: { kind: this.kind, payload: root, values: [...this.values] }, message };
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
      frames.push(makeFrame('', decorated, links));
    }

    if (frames.length > 0) {
      const lastFrame = frames[frames.length - 1];
      const finalNodes = lastFrame.nodes.map((n) => ({ ...n, state: 'default' }));
      frames.push(makeFrame('', finalNodes, lastFrame.links));
    }

    const message = `Found ${value}`;
    return { frames, snapshot: { kind: this.kind, payload: root, values: [...this.values] }, message };
  }

  snapshot() {
    return { kind: this.kind, payload: this.root, values: [...this.values] };
  }

  restore(snapshot) {
    this.values = Array.isArray(snapshot?.values) ? [...snapshot.values] : [];
    const base = snapshot?.payload ?? buildRedBlackTreeFromValues(this.values);
    this.root = ensureValidRBTColors(base, this.values);
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

    const foundFlag = steps.some((s) => s.type === 'FOUND');
    if (!foundFlag) {
      const message = `${value} not found`;
      return { frames: [this.frameForStatus(message)], snapshot: { kind: this.kind, payload: tree, values: [...this.values] }, message };
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

      frames.push(makeFrame('', decorated, links));
    }

    if (frames.length > 0) {
      const lastFrame = frames[frames.length - 1];
      const finalNodes = lastFrame.nodes.map((n) => ({ ...n, state: 'default' }));
      frames.push(makeFrame('', finalNodes, lastFrame.links));
    }

    const message = `Found ${value}`;
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

export { recolorForUniformBlackHeight };
