# 05: Sliding Windows

## Core Idea
Use a sliding window when scanning **subarrays/substrings** for a subcomponent meeting a condition — a two-pointer subset where `left`/`right` define a window that slides unidirectionally. Recognize it for problems that would otherwise need nested loops over all subcomponents (O(n²) or worse). Two flavors: **fixed** (given length) and **dynamic** (find longest/shortest satisfying a condition).

## Technique / Template
- **Fixed window**: when `right - left + 1 == k`, process window, then `left++` and `right++`.
- **Dynamic window (longest)**: expand while valid; when violated, shrink (or slide) by moving `left`.
- Maintain O(1) window state (frequency array/map, count) rather than recomputing.

## Problems Covered
| Problem | Key Insight | Complexity |
|---|---|---|
| Substring Anagrams | Fixed window of `len(t)`; compare 26-slot freq arrays | O(n) time / O(1) space |
| Longest Substring With Unique Characters | Expand; on duplicate shrink past previous occurrence (hash map of last index) | O(n) time / O(m) space |
| Longest Uniform Substring After Replacements | Replace all but the max-frequency char; slide (not shrink) when `len - maxFreq > k` | O(n) time / O(m) space |

## Anti-patterns
- **Recomputing window contents**: rescanning each window for the condition returns you to O(n²).
- **Shrinking when you only need the longest**: once a valid length is found, no shorter window helps — slide instead.
- **Stale counts**: forgetting to decrement the char leaving the window corrupts `highest_freq`/comparisons.

## Key Takeaways
1. Fixed window = "subcomponent of known length"; dynamic = "longest/shortest satisfying a predicate."
2. Track window state incrementally (add right, remove left) for O(1) per step.
3. For "longest," slide rather than shrink to keep the best-known length.

## Connects To
- **Two Pointers**: sliding window is its subcomponent-scanning variant.
- **Stacks (Maximums of Sliding Window)**: window max uses a monotonic deque, not a simple window.
- **Prefix Sums**: alternative for subarray-sum queries (fixed-point sums).
