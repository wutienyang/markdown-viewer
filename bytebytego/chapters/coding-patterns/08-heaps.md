# 08: Heaps

## Core Idea
Use a heap when you repeatedly need the **minimum/maximum (highest-priority) element** among a changing set. Recognize it for **top-k**, **k-way merge**, **running median**, and **nearly-sorted** data. Min-heap keeps the smallest on top; max-heap the largest. Operations: insert/delete O(log n), peek O(1), heapify O(n). A priority queue is a heap with custom ordering.

## Technique / Template
- **Top-k**: min-heap capped at size k, or max-heap + heapify then pop k times.
- **k-way merge**: push one node per list, pop min, push its successor.
- **Two-heap median**: max-heap for the smaller half, min-heap for the larger half; rebalance to keep sizes within one.
- **k-sorted sort**: heap of the first k+1 elements; repeatedly pop min into position.

## Problems Covered
| Problem | Key Insight | Complexity |
|---|---|---|
| K Most Frequent Strings | Count with map, then heap for top-k; min-heap variant caps space at O(k) | O(n log k) time / O(n) space |
| Combine Sorted Linked Lists | Min-heap of list heads; pop min and push its next | O(n log k) time / O(k) space |
| Median of an Integer Stream | Max-heap (left) + min-heap (right), rebalance after each add | O(log n) add / O(1) median |
| Sort a K-Sorted Array | Element at index i lives within [i-k, i+k]; heap of size k+1 | O(n log k) time / O(k) space |

## Anti-patterns
- **Sorting everything to get top-k**: sorting all n costs O(n log n); a heap gives O(n log k).
- **Neglecting rebalancing (median)**: both halves must stay equal-sized (max-heap may hold one extra) or the median is wrong.
- **Using a max-heap when you need to cap size**: you can't evict the *smallest* from a max-heap — use a min-heap for bounded top-k.

## Key Takeaways
1. "Repeated min/max of a dynamic set" is the heap signal.
2. Bounded top-k → min-heap of size k; unbounded top-k → max-heap + heapify.
3. Two heaps split a stream into halves for O(1) median queries.

## Connects To
- **Hash Maps And Sets**: frequency counting precedes heap ranking.
- **Binary Search (Median of Sorted Arrays)**: shares the "partition into halves" concept.
- **Linked Lists (Combine Sorted)**: merges k sorted lists via heap.
