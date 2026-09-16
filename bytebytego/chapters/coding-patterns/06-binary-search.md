# 06: Binary Search

## Core Idea
Use binary search on **sorted data** — or any **search space whose outcomes form a monotonic true/false sequence** — to cut O(n) to O(log n). Recognize it for "find the first/last/insertion position," "search rotated/2D sorted," and optimization problems where you binary-search an answer value (woodcut height). Four steps: define the search space, define narrowing behavior, choose exit condition, return the right value.

## Technique / Template
- Default exit condition: `left < right` (pointers converge to one value).
- **Lower bound** (first ≥ target): `if a[mid] >= target: right = mid else left = mid + 1`.
- **Upper bound** (last ≤ target): bias midpoint right — `mid = (left+right)//2 + 1` — to avoid the `left = mid` infinite loop.
- **Answer search**: binary-search the candidate value, evaluating a feasibility predicate.

## Problems Covered
| Problem | Key Insight | Complexity |
|---|---|---|
| Find the Insertion Index | Lower bound = first value ≥ target | O(log n) time / O(1) space |
| First and Last Occurrences of a Number | Lower + upper bound; right-biased `mid` for upper | O(log n) time / O(1) space |
| Cutting Wood | Binary-search height H over [0, max]; predicate `cuts_enough_wood` | O(n log m) time / O(1) space |
| Find the Target in a Rotated Sorted Array | Use whichever half is sorted to decide the side | O(log n) time / O(1) space |
| Find the Median From Two Sorted Arrays | Binary-search slice on the smaller array; check `L1≤R2, L2≤R1` | O(log min(m,n)) time / O(1) space |
| Matrix Search | Treat matrix as flattened array: `r=mid//n, c=mid%n` | O(log(m·n)) time / O(1) space |
| Local Maxima in Array | Compare `a[mid]` vs `a[mid+1]`; follow the ascending slope | O(log n) time / O(1) space |
| Weighted Random Selection | Prefix sums as segment endpoints; lower-bound on random target | O(log n) select / O(n) space |

## Anti-patterns
- **Off-by-one in `mid` for upper bound**: without right-biasing, `left = mid` loops forever on a 2-element range.
- **Wrong include/exclude choice**: using `mid` vs `mid ± 1` decides whether the final value is the answer.
- **Assuming the array is the search space**: answer-space binary search (Cutting Wood) has a predicate, not sorted elements.

## Key Takeaways
1. Always split the problem into "search space" and "narrowing rule" explicitly.
2. Use `left < right` convergence; bias `mid` right for upper-bound searches.
3. Binary search works on any monotonic predicate, not just sorted arrays.

## Connects To
- **Two Pointers**: inward traversal mirrors narrowing a sorted search space.
- **Heaps (Median of Stream)**: the two-sorted-array median shares the "partition" idea with two-heap median.
- **Prefix Sums (Weighted Selection)**: prefix sums become the sorted search space here.
