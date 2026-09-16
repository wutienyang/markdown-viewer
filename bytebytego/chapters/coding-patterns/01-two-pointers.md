# 01: Two Pointers

## Core Idea
Use two pointers when the input is a linear structure (array, string, linked list) with **predictable dynamics** — most commonly a **sorted array** or a **palindromic/symmetric structure** — and the problem asks for a **pair of values** or a result derivable from two positions. A second pointer lets you make comparisons that replace a nested O(n²) loop with a single O(n) pass.

## Technique / Template
Three traversal strategies:
1. **Inward**: pointers start at opposite ends and move toward each other (pair sum, palindrome, container).
2. **Unidirectional**: both pointers start at the left; one finds, the other tracks (shift zeros).
3. **Staged**: first pointer locates a condition, second gathers related info (next lexicographical sequence).

General inward template: initialize `left=0, right=n-1`; while `left < right`, compare `a[left]` and `a[right]`, then move the pointer whose side is "wrong" inward. Predictable ordering is what tells you which pointer to move.

## Problems Covered
| Problem | Key Insight | Complexity |
|---|---|---|
| Pair Sum - Sorted | Sum too small → move left; too large → move right | O(n) time / O(1) space |
| Triplet Sum | Fix `a`, reduce to Pair Sum on `b+c=-a`; skip duplicate `a` and `b` | O(n²) time / O(n) space |
| Is Palindrome Valid | Skip non-alphanumerics, compare inward | O(n) time / O(1) space |
| Largest Container | Always move the shorter line inward | O(n) time / O(1) space |
| Shift Zeros to the End | Swap non-zeros to the left; zeros fall to the right | O(n) time / O(1) space |
| Next Lexicographical Sequence | Find pivot, swap rightmost successor, reverse suffix | O(n) time / O(n) space |

## Anti-patterns
- **Using nested loops on sorted input**: ignore the sort order and you forfeit the O(n²)→O(n) win that predictability buys.
- **Moving the wrong pointer**: in inward traversal, moving the pointer on the larger side when the sum is too small only shrinks the sum further.
- **Forgetting duplicates in Triplet Sum**: without skipping repeated `a`/`b` values you emit duplicate triplets.

## Key Takeaways
1. Recognize sorted arrays and symmetry (palindromes) as the strongest two-pointer signals.
2. Decide pointer movement from the *comparison result*, not a fixed rule.
3. Split multi-element targets (triplets) into a fixed pivot plus a two-pointer subproblem.

## Connects To
- **Fast and Slow Pointers**: specialized variant with unequal speeds.
- **Sliding Windows**: two pointers defining a window's bounds.
- **Binary Search**: narrowing a sorted search space, similar "move toward the target" logic.
