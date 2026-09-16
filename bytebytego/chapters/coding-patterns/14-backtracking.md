# 14: Backtracking

## Core Idea
Use backtracking when you must **enumerate all possible solutions** — all permutations, subsets, combinations, or board placements. Recognize this pattern with words like "all", "every", "distinct configurations". It is a brute-force search over a **state space tree** (decision tree): explore a decision, recurse, then **undo** the decision to try the next branch. Time complexity is roughly O(branching^depth) — often factorial/exponential.

## Technique / Template
- Traverse the state space tree with recursive DFS:
  1. **Termination condition**: when a complete or invalid solution is reached, record it (or stop) and return.
  2. **Iterate decisions**: for each valid decision, make it (update state), recurse, then **backtrack** (undo) the state.
- Track "used" elements with a hash set, or an index (`start_index`) to enforce order and avoid duplicates.
- Keep a running candidate list; copy it (`candidate[:]`) when recording a solution.
- Manage complexity by a **branching factor** and **depth**; pruning (e.g. stopping when a sum exceeds target) shrinks the tree.

## Problems Covered
| Problem | Key Insight | Complexity |
|---|---|---|
| Find All Permutations | Track used numbers in a set; record when candidate length = n | O(n·n!) time / O(n) space |
| Find All Subsets | For each element, branch on include vs exclude (index-driven) | O(n·2^n) / O(n) |
| N Queens | Place one queen per row; guard columns/diagonals with hash sets (`r-c`, `r+c`) | O(n!) / O(n) |
| Combinations of a Sum | `start_index` enforces ordering to dedupe; prune when sum ≥ target | O(n^(target/m)) / O(target/m) |
| Phone Keypad Combinations | At each digit branch over its mapped letters; use a keypad hash map | O(n·4^n) / O(n) |

## Anti-patterns
- **Forgetting to undo state**: without backtracking, earlier choices leak into later branches and corrupt results.
- **Returning a mutable candidate directly**: always store a copy, or all recorded answers point to the same list.
- **Duplicates from unordered builds**: without `start_index`/used-tracking, you generate the same combination in different orders.
- **No pruning**: exploring branches that can never reach a valid solution (negative target) wastes time — add termination checks.

## Key Takeaways
1. Draw the state space tree first — the tree traversal *is* the algorithm.
2. Every backtracking step has three parts: make decision → recurse → undo.
3. Use an index (`start_index`) to enforce canonical ordering and eliminate duplicates in combinations.
4. Prune aggressively with early termination conditions (sum bounds, constraint checks).

## Connects To
- **Dynamic Programming**: backtracking explores all paths (exponential); memoizing overlapping states converts it to DP.
- **Graphs**: the state space tree is a DAG; DFS over it is identical to graph DFS.
- **Tries**: board word-search pairs backtracking with trie traversal.
- **Trees**: recursive DFS on a tree is the same traversal skeleton.
