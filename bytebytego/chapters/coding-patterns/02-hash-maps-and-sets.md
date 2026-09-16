# 02: Hash Maps And Sets

## Core Idea
Use hash maps/sets when you need **constant-time lookup, insertion, or deletion** to avoid rescanning data. Recognize this pattern when the problem mentions **frequency, uniqueness, duplicates, "fast lookup," or mapping keys to values**. Hash maps store key→value pairs; hash sets store keys only (membership/visited checks).

## Technique / Template
- **Hash map**: `{value: index}` for complement lookups, `{value: frequency}` for counting.
- **Hash set**: track "seen" elements for duplicate detection or "start-of-chain" checks.
- **Complement trick**: for `x + y = target`, compute `y = target - x` and look it up in one pass.
- **Sentinel/offset**: prepend a `0` (prefix) or use `defaultdict` so missing keys read as 0/empty.

## Problems Covered
| Problem | Key Insight | Complexity |
|---|---|---|
| Pair Sum - Unsorted | Store value→index; check `target - x` in one pass | O(n) time / O(n) space |
| Verify Sudoku Board | One set per row/col/subgrid; subgrid index = `r//3, c//3` | O(n²) time / O(n²) space |
| Zero Striping | Record zero rows/cols in sets; (or use first row/col as in-place markers) | O(m·n) time / O(m+n) space (O(1) in-place) |
| Longest Chain of Consecutive Numbers | Only expand chains whose start has no `num-1` | O(n) time / O(n) space |
| Geometric Sequence Triplets | `x` as middle; count = `left[x/r] * right[x*r]` | O(n) time / O(n) space |

## Anti-patterns
- **Linear search for membership**: `if num in nums` inside a loop is O(n) each; put the array in a set first.
- **Ignoring frequency for duplicates**: counts matter when multiples of the same value form distinct answers (geometric triplets).
- **Re-searching a whole chain per element**: checking every number's successor chain blows up to O(n²)+; only start at chain heads.

## Key Takeaways
1. Default to a hash map when you need "have I seen the complement/frequency before?" in O(1).
2. Map "needs": frequency → map, uniqueness/visited → set.
3. Combine the structure with a positional trick (subgrid indexing, prefix 0, two-sided maps) to make one pass suffice.

## Connects To
- **Prefix Sums**: K-Sum Subarrays reuses the complement/hash-map idea over prefix sums.
- **Linked Lists (LRU Cache)**: pairs a hash map with a doubly linked list for O(1) eviction.
- **Heaps (K Most Frequent Strings)**: counts frequencies with a map, then ranks them.
