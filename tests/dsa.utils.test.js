/**
 * StudyOS - DSA Utilities Unit Tests
 */

const { PriorityQueue, TopologicalSort, FisherYates, Deque, PrefixSum } = require('../src/shared/utils/dsa.utils');

describe('DSA Utility Suite', () => {
  describe('PriorityQueue (MaxHeap behavior)', () => {
    test('extracts top elements in descending order of score', () => {
      const pq = new PriorityQueue((a, b) => b.score - a.score);
      pq.push({ id: 'task1', score: 10 });
      pq.push({ id: 'task2', score: 95 });
      pq.push({ id: 'task3', score: 45 });
      pq.push({ id: 'task4', score: 70 });

      expect(pq.size).toBe(4);
      expect(pq.pop().id).toBe('task2');
      expect(pq.pop().id).toBe('task4');
      expect(pq.pop().id).toBe('task3');
      expect(pq.pop().id).toBe('task1');
      expect(pq.pop()).toBeNull();
    });

    test('popK returns top K items efficiently', () => {
      const pq = new PriorityQueue((a, b) => b.score - a.score);
      pq.push({ name: 'A', score: 5 });
      pq.push({ name: 'B', score: 50 });
      pq.push({ name: 'C', score: 25 });

      const top2 = pq.popK(2);
      expect(top2.length).toBe(2);
      expect(top2[0].name).toBe('B');
      expect(top2[1].name).toBe('C');
      expect(pq.size).toBe(1);
    });
  });

  describe('TopologicalSort (Kahn Algorithm)', () => {
    test('sorts prerequisite DAG correctly', () => {
      const chapters = [
        { id: 'laws_of_motion', name: 'Laws of Motion', prerequisiteIds: ['kinematics'] },
        { id: 'kinematics', name: 'Kinematics', prerequisiteIds: ['vectors'] },
        { id: 'vectors', name: 'Vectors & Calculus', prerequisiteIds: [] },
        { id: 'work_power', name: 'Work & Energy', prerequisiteIds: ['laws_of_motion'] },
      ];

      const { sorted, hasCycle } = TopologicalSort.sort(chapters);
      expect(hasCycle).toBe(false);
      expect(sorted.map((c) => c.id)).toEqual(['vectors', 'kinematics', 'laws_of_motion', 'work_power']);
    });

    test('handles graphs without explicit dependencies cleanly', () => {
      const chapters = [
        { id: 'ch1', name: 'Chapter 1' },
        { id: 'ch2', name: 'Chapter 2' },
      ];
      const { sorted, hasCycle } = TopologicalSort.sort(chapters);
      expect(hasCycle).toBe(false);
      expect(sorted.length).toBe(2);
    });
  });

  describe('FisherYates Shuffle', () => {
    test('preserves element count and set membership', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const shuffled = FisherYates.shuffle(arr);

      expect(shuffled.length).toBe(arr.length);
      expect(new Set(shuffled)).toEqual(new Set(arr));
    });
  });

  describe('Deque (Sliding Window)', () => {
    test('maintains fixed window size and calculates moving metrics', () => {
      const deque = new Deque(7);
      for (let i = 1; i <= 10; i++) {
        deque.pushBack(i);
      }
      expect(deque.size).toBe(7);
      expect(deque.toArray()).toEqual([4, 5, 6, 7, 8, 9, 10]);
      expect(deque.sumBy()).toBe(49);
      expect(deque.averageBy()).toBe(7);
    });
  });

  describe('PrefixSum (O(1) Range Queries)', () => {
    test('computes range sums in O(1) time', () => {
      const hours = [2, 4, 1, 5, 3]; // index 0..4
      const ps = new PrefixSum(hours);

      expect(ps.total).toBe(15);
      expect(ps.queryRange(0, 2)).toBe(7); // 2 + 4 + 1
      expect(ps.queryRange(1, 3)).toBe(10); // 4 + 1 + 5
      expect(ps.queryRange(3, 4)).toBe(8); // 5 + 3
    });
  });
});
