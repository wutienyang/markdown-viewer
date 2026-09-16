# 16: Greedy

## Core Idea
Use a greedy algorithm when the **locally optimal choice at each step leads to the global optimum** (the *greedy choice property*). Recognize this pattern in optimization problems (minimize/maximize) where you can safely commit to the best immediate decision without revisiting it. Greedy problems have an optimal substructure like DP, but instead of considering all choices, they make one decision. Not every DP problem has a greedy solution — validate the greedy choice (or demonstrate correctness on examples) before committing.

## Technique / Template
- There is no single reusable template (each greedy is bespoke). Instead:
  1. Identify the local-optimal decision.
  2. Argue (or test on examples) that this local choice can't be worse than alternatives.
  3. Iterate, never revisiting past decisions.
- Common shapes: reverse scan (work backward from a goal), two-pass (satisfy left then right constraints), reset-on-deficit (restart a segment when a running value goes negative), and sort-then-pick.

## Problems Covered
| Problem | Key Insight | Complexity |
|---|---|---|
| Jump to the End | Scan backward; any index reaching the destination becomes the new destination; greedy because the first valid index covers all earlier reachable ones | O(n) / O(1) |
| Gas Stations | If `sum(gas) < sum(cost)` return -1; else reset tank/start when tank goes negative | O(n) / O(1) |
| Candies | Two passes: left→right for increasing ratings, right→left for decreasing; `candies[i] = max(...)` | O(n) / O(n) |

## Anti-patterns
- **Assuming greedy without proof**: a local optimum is not always global (e.g. knapsack "most valuable first" fails) — verify the greedy choice property.
- **Reconsidering earlier decisions**: a greedy algorithm never backtracks; if you find yourself needing to, it's not greedy (likely DP/backtracking).
- **Missing the feasibility pre-check**: in Gas Stations, skipping the total-gas check leads to incorrect start points.
- **Ignoring both neighbor constraints**: in Candies, a single pass only satisfies one direction.

## Key Takeaways
1. Confirm the greedy choice property — test on diverse counterexamples before coding.
2. Common patterns: reverse scan (Jump), reset-on-deficit (Gas), two-pass left/right (Candies), sort-then-greedy (interval/MST style).
3. All greedy problems are DP-solvable; when in doubt, fall back to DP for correctness.

## Connects To
- **Dynamic Programming**: the decision boundary — greedy commits to one local choice; DP explores all choices.
- **Graphs**: Dijkstra, Prim, and Kruskal are greedy graph algorithms.
- **Sort And Search**: many greedy algorithms sort first (e.g. MST edges); Dutch National Flag is a greedy pointer sweep.
- **Heaps**: greedy "pick the min/max next" frequently uses a heap.
