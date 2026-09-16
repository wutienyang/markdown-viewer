# 03: Linked Lists

## Core Idea
Use linked-list techniques when nodes are linked by pointers and you only have direct access to the head (no random access). Recognize this pattern for problems involving **traversal, reversal, node removal, merging, or restructuring** of singly/doubly linked lists. Pointer manipulation — visualizing links as arrows and reorienting them — is the core skill.

## Technique / Template
- **Iterative reversal**: save `next`, point `curr.next = prev`, then advance `prev`, `curr`.
- **Dummy node**: prepend a sentinel to simplify removing the head.
- **Two-pointer offset**: advance `leader` by k, then move both to position a trailer.
- **Combine data structures**: pair a doubly linked list with a hash map (LRU) or use fast/slow pointers (midpoint).

## Problems Covered
| Problem | Key Insight | Complexity |
|---|---|---|
| Linked List Reversal | Flip pointers with `next`/`prev`/`curr`; recursive: reverse tail then `head.next.next = head` | O(n) time / O(1) space (recursive O(n) space) |
| Remove the Kth Last Node From a Linked List | Dummy + leader k steps ahead, move both until leader hits end | O(n) time / O(1) space |
| Linked List Intersection | Traverse A→B and B→A; equal length makes pointers meet at intersection | O(n+m) time / O(1) space |
| LRU Cache | Doubly linked list + hash map for O(1) get/put | O(1) per op / O(n) space |
| Palindromic Linked List | Find middle, reverse second half, compare halves | O(n) time / O(1) space |
| Flatten a Multi-Level Linked List | Append each child list to the tail pointer, nullify child links | O(n) time / O(1) space |

## Anti-patterns
- **Losing a node reference**: reverse `curr.next` before saving `next_node` and you orphan the rest of the list.
- **Using a singly linked list for tail removal**: O(n) to reach the node before tail; use a doubly linked list (LRU) or a dummy.
- **Mutating input without asking**: reversing the second half changes the structure — confirm it's allowed.

## Key Takeaways
1. Draw arrows to plan pointer reorientation and identify which references you must save first.
2. A dummy/sentinel node eliminates head-deletion special cases.
3. Compose known subroutines (find middle + reverse + compare) for harder problems.

## Connects To
- **Fast and Slow Pointers**: finding the middle and cycle detection both live there.
- **Hash Maps And Sets**: LRU Cache combines a hash map with a doubly linked list.
- **Stacks (Implement a Queue)**: different linear structures trade access patterns (LIFO vs FIFO).
