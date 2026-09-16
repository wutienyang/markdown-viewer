# 17: Sort And Search

## Core Idea
Use this chapter when the problem involves ordering elements or finding the kth order statistic. Recognize it with "sort", "kth smallest/largest", "top k", or "arrange/partition". Know the trade-off: comparison sorts are Ω(n log n); non-comparison sorts (counting/bucket/radix) hit O(n+k) when the value range is bounded. For **search/selection** you often don't need a full sort — quickselect (partition) or a heap of size k suffice. Quicksort is in-place but unstable; merge sort is stable but O(n) space (O(log n) for linked lists).

## Technique / Template
- **Merge sort**: split (fast/slow pointer for lists), recursively sort halves, merge two sorted lists with a dummy node.
- **Quicksort**: `partition(nums, left, right)` places a pivot; move smaller elements left with a `lo` pointer; recurse on both sides; randomize pivot to avoid worst case.
- **Quickselect**: same partition, recurse on **only one** side toward the target index → O(n) average.
- **Counting sort**: count occurrences into a `counts` array sized by max value, then expand.
- **kth largest**: min-heap of size k (O(n log k)), or quickselect on the `(n-k)`th smallest (O(n) avg).
- **Dutch National Flag**: three-way partition with `i`, `left`, `right` pointers.

## Problems Covered
| Problem | Key Insight | Complexity |
|---|---|---|
| Sort Linked List | Merge sort (no random access); split via fast/slow, merge with dummy head | O(n log n) / O(log n) |
| Sort Array | Quicksort partition; random pivot avoids O(n²); counting sort when range ≤ 10³ | O(n log n) avg / O(log n) (worst O(n²)/O(n)) |
| Kth Largest Integer | Min-heap of k, or quickselect to the `(n-k)`th smallest | O(n log k) or O(n) avg / O(k) or O(log n) |
| Dutch National Flag | Three-way partition of 0/1/2 in one pass, in place | O(n) / O(1) |

## Anti-patterns
- **Sorting everything for a single kth value**: a full O(n log n) sort is wasteful when a heap or quickselect finds it faster.
- **Using quicksort on a linked list**: no random access — use merge sort instead.
- **Choosing an extreme pivot**: always picking first/last causes O(n²) on sorted input; randomize.
- **Counting sort with an unbounded range**: a huge `counts` array is impractical without knowing the max is small.
- **Ignoring stability**: when relative order of equal keys matters (e.g. secondary attributes), prefer a stable sort.

## Key Takeaways
1. For "kth"/"top k", use quickselect (O(n) avg) or a k-sized heap (O(n log k)) rather than full sort.
2. Match the algorithm to the structure: merge sort for linked lists, quicksort for in-place arrays, counting sort for small ranges.
3. Dutch National Flag / partitioning is the core primitive reused across quicksort and quickselect.
4. Stability vs space: merge sort stable but O(n); quicksort in-place but unstable.

## Connects To
- **Heaps**: a min-heap of size k is the standard "top k" tool; heapsort is O(n log n) with O(1) space.
- **Linked Lists**: fast/slow midpoint + merge underlies linked-list merge sort.
- **Greedy**: sort-then-pick is a common greedy pattern (e.g. Kruskal edges).
- **Bit Manipulation** / **Math**: counting/radix sort exploit number properties, bridging to numeric patterns.
