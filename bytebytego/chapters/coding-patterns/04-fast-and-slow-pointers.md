# 04: Fast And Slow Pointers

## Core Idea
Use fast and slow pointers when you need information derived from **relative positions** rather than indexing — especially in linked lists. Recognize this pattern for **cycle detection**, **finding the middle**, or any sequence that can be traversed with a "next" step. Slow moves one step; fast moves two; the distance between them closes by one each iteration.

## Technique / Template
- **Cycle detection (Floyd's)**: `while fast and fast.next: slow=slow.next; fast=fast.next.next; if slow==fast: return True`.
- **Midpoint**: stop when fast reaches the end/null; slow lands on the (second) middle.
- **Abstract "next"**: for numeric sequences, define a `get_next` function and run Floyd's on it (Happy Number).

## Problems Covered
| Problem | Key Insight | Complexity |
|---|---|---|
| Linked List Loop | Fast gains 1 node/iteration, so it must meet slow in a cycle | O(n) time / O(1) space |
| Linked List Midpoint | When fast hits the end, slow is at the middle | O(n) time / O(1) space |
| Happy Number | Model digit-square-sum as a linked list; cycle ⇒ not happy | O(log n) time / O(1) space |

## Anti-patterns
- **Null-dereferencing fast**: check both `fast` and `fast.next` before `fast.next.next`.
- **Wrong midpoint for even lengths**: stopping too late/early returns the first vs second middle — clarify which is required.
- **Using a hash set when space matters**: a visited set works but costs O(n) space; Floyd's gives O(1).

## Key Takeaways
1. Two speeds create a "catch-up" dynamic that detects cycles without extra space.
2. Half-speed traversal positions the slow pointer at the midpoint automatically.
3. Any process with a deterministic `next` step (not just linked lists) can be treated as a list for Floyd's.

## Connects To
- **Two Pointers**: fast/slow is the specialized unequal-speed variant.
- **Linked Lists**: midpoint and reversal compose into Palindromic Linked List.
- **Hash Maps And Sets**: set-based cycle detection is the space-heavy alternative.
