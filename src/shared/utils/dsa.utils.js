/**
 * StudyOS - Data Structures & Algorithms (DSA) Engine Utility Suite
 *
 * Highly optimized, reusable data structures and algorithmic helpers:
 *   1. MaxHeap / PriorityQueue - O(log N) insertion/extraction for adaptive recommendations
 *   2. TopologicalSort (Kahn's Algorithm) - O(V + E) prerequisite DAG ordering & cycle detection
 *   3. FisherYates - O(N) unbiased array shuffling for quiz questions/options
 *   4. Deque - O(1) double-ended queue for sliding-window analytics & burnout tracking
 *   5. PrefixSum - O(1) cumulative range queries for study velocity metrics
 */

// ── 1. MaxHeap / PriorityQueue ────────────────────────────────────────────────
class PriorityQueue {
  constructor(compareFn = (a, b) => b.score - a.score) {
    this.heap = [];
    this.compare = compareFn;
  }

  get size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  peek() {
    return this.heap[0] || null;
  }

  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.isEmpty()) return null;
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this._sinkDown(0);
    }
    return top;
  }

  popK(k) {
    const result = [];
    const count = Math.min(k, this.size);
    for (let i = 0; i < count; i++) {
      result.push(this.pop());
    }
    return result;
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parentIdx]) < 0) {
        [this.heap[index], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[index]];
        index = parentIdx;
      } else {
        break;
      }
    }
  }

  _sinkDown(index) {
    const length = this.heap.length;
    while (true) {
      const leftIdx = 2 * index + 1;
      const rightIdx = 2 * index + 2;
      let smallest = index;

      if (leftIdx < length && this.compare(this.heap[leftIdx], this.heap[smallest]) < 0) {
        smallest = leftIdx;
      }
      if (rightIdx < length && this.compare(this.heap[rightIdx], this.heap[smallest]) < 0) {
        smallest = rightIdx;
      }

      if (smallest !== index) {
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
        index = smallest;
      } else {
        break;
      }
    }
  }
}

// ── 2. TopologicalSort (Kahn's Algorithm for DAGs) ───────────────────────────
class TopologicalSort {
  /**
   * Sort items by Directed Acyclic Graph (DAG) dependencies.
   *
   * @param {Array} items - Array of objects with `id` and optional `prerequisiteIds` array
   * @returns {{ sorted: Array, hasCycle: boolean }}
   */
  static sort(items) {
    const itemMap = new Map();
    const inDegree = new Map();
    const adjList = new Map();

    for (const item of items) {
      const id = item.id || item._id?.toString() || String(item);
      itemMap.set(id, item);
      inDegree.set(id, 0);
      adjList.set(id, []);
    }

    // Build graph edges
    for (const item of items) {
      const id = item.id || item._id?.toString() || String(item);
      const prereqs = item.prerequisiteIds || item.prerequisites || [];

      for (const pId of prereqs) {
        const prereqStr = pId.toString();
        if (adjList.has(prereqStr)) {
          adjList.get(prereqStr).push(id);
          inDegree.set(id, (inDegree.get(id) || 0) + 1);
        }
      }
    }

    // Queue nodes with 0 in-degree (no prerequisites)
    const queue = [];
    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) queue.push(id);
    }

    const sorted = [];
    while (queue.length > 0) {
      const u = queue.shift();
      sorted.push(itemMap.get(u));

      const neighbors = adjList.get(u) || [];
      for (const v of neighbors) {
        inDegree.set(v, inDegree.get(v) - 1);
        if (inDegree.get(v) === 0) {
          queue.push(v);
        }
      }
    }

    const hasCycle = sorted.length !== items.length;
    // If cycle detected, fallback to original order for unvisited items
    if (hasCycle) {
      const visitedIds = new Set(sorted.map((i) => (i.id || i._id?.toString())));
      for (const item of items) {
        const id = item.id || item._id?.toString();
        if (!visitedIds.has(id)) sorted.push(item);
      }
    }

    return { sorted, hasCycle };
  }
}

// ── 3. Fisher-Yates Unbiased Array Shuffling ──────────────────────────────────
class FisherYates {
  /**
   * Return a new array shuffled using in-place Fisher-Yates algorithm.
   *
   * @param {Array} array
   * @returns {Array} Shuffled copy
   */
  static shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// ── 4. Deque (Double-Ended Queue) for Sliding-Window ──────────────────────────
class Deque {
  constructor(maxSize = Infinity) {
    this.items = [];
    this.maxSize = maxSize;
  }

  get size() {
    return this.items.length;
  }

  pushBack(item) {
    this.items.push(item);
    if (this.items.length > this.maxSize) {
      this.items.shift();
    }
  }

  popFront() {
    return this.items.shift() || null;
  }

  popBack() {
    return this.items.pop() || null;
  }

  toArray() {
    return [...this.items];
  }

  sumBy(fn = (x) => Number(x) || 0) {
    return this.items.reduce((acc, curr) => acc + fn(curr), 0);
  }

  averageBy(fn = (x) => Number(x) || 0) {
    if (this.items.length === 0) return 0;
    return this.sumBy(fn) / this.items.length;
  }
}

// ── 5. PrefixSum for O(1) Cumulative Range Queries ─────────────────────────────
class PrefixSum {
  /**
   * Pre-calculate cumulative sum array.
   *
   * @param {number[]} numbers
   */
  constructor(numbers = []) {
    this.prefix = [0];
    for (let i = 0; i < numbers.length; i++) {
      this.prefix.push(this.prefix[i] + (numbers[i] || 0));
    }
  }

  /**
   * Query sum in index range [left, right] inclusive in O(1) time.
   *
   * @param {number} left  0-based start index
   * @param {number} right 0-based end index
   * @returns {number} Sum of items between left and right
   */
  queryRange(left, right) {
    if (left < 0) left = 0;
    if (right >= this.prefix.length - 1) right = this.prefix.length - 2;
    if (left > right) return 0;
    return this.prefix[right + 1] - this.prefix[left];
  }

  get total() {
    return this.prefix[this.prefix.length - 1] || 0;
  }
}

module.exports = {
  PriorityQueue,
  TopologicalSort,
  FisherYates,
  Deque,
  PrefixSum,
};
