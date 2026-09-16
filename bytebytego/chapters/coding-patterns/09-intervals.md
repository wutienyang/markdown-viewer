# 09: Intervals

## Core Idea
Use interval techniques when the input is **start/end ranges** (times, segments) and the task involves **overlap, merging, or concurrency**. Recognize it for scheduling, merging, and "maximum overlap" problems. Sort intervals by start point to process chronologically; separate start/end points for sweep-line counting.

## Technique / Template
- **Overlap test** (A starts before B): overlap iff `A.end >= B.start`.
- **Merge**: sort by start; if `A.end >= B.start` merge into `[A.start, max(A.end, B.end)]`, else start a new interval.
- **Intersection of two sorted lists**: overlap = `[B.start, min(A.end, B.end)]`; advance whichever interval ends first.
- **Sweep line**: flatten to (point, 'S'/'E'), sort (end before start on ties), increment on S / decrement on E.

## Problems Covered
| Problem | Key Insight | Complexity |
|---|---|---|
| Merge Overlapping Intervals | Sort by start; merge while `A.end >= B.start` | O(n log n) time / O(n) space |
| Identify All Interval Overlaps | Two pointers; overlap is `[B.start, min(A.end, B.end)]`; advance the one ending first | O(n+m) time / O(1) space |
| Largest Overlap of Intervals | Sweep line over start/end points; process end before start on ties | O(n log n) time / O(n) space |

## Anti-patterns
- **Forgetting to sort**: overlap conditions assume a known "earlier" interval; sort by start first.
- **Tie-handling in sweep line**: processing a start before a concurrent end over-counts active intervals.
- **Clarifying open/closed/half-open**: whether endpoints are inclusive changes overlap results — confirm with the interviewer.

## Key Takeaways
1. Sort by start point to make overlap checks deterministic.
2. Overlap of two intervals is the overlap of `[max starts, min ends]`.
3. Sweep-line flattens intervals into ordered start/end events for counting concurrency.

## Connects To
- **Two Pointers**: "Identify All Interval Overlaps" is a two-pointer merge over two sorted lists.
- **Heaps**: an alternative for finding the max-overlap point is a min-heap of active end times.
- **Stacks**: interval problems share "process in order" discipline with monotonic-stack problems.
