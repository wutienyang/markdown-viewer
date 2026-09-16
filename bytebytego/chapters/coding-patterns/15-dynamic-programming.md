# 15: Dynamic Programming

## Core Idea
Use DP when a problem has **optimal substructure** (optimal answer built from optimal subproblem answers) and **overlapping subproblems** (the same subproblem is solved repeatedly). Recognize it via keywords "minimum/maximum", "number of ways", "longest", or when naive recursion recomputes the same states. DP stores each subproblem's answer (memoization top-down, or a DP table bottom-up) so each is solved **at most once**. Group problems as 1D-DP or 2D-DP.

## Technique / Template
1. Identify the **subproblem** (what does `dp[...]` store?).
2. Write a **recurrence relation** expressing `dp` in terms of smaller states.
3. Set **base cases** (smallest inputs where the answer is known).
4. Populate bottom-up in dependency order (or memoize top-down), then return the requested cell.
5. Optimize: if each cell only needs the previous 1–2 rows/values, collapse space to O(1) or O(row).

## Problems Covered
| Problem | Key Insight | Complexity |
|---|---|---|
| Climbing Stairs | `dp[i] = dp[i-1] + dp[i-2]` (ways to reach step i) | O(n) / O(n) → O(1) |
| Minimum Coin Combination | `dp[t] = min(1 + dp[t-coin])` over coins | O(target·n) / O(target) |
| Matrix Pathways | `dp[r][c] = dp[r-1][c] + dp[r][c-1]`, row/col 0 = 1 | O(m·n) / O(m·n) → O(n) |
| Neighborhood Burglary | `dp[i] = max(dp[i-1], houses[i] + dp[i-2])` | O(n) / O(n) → O(1) |
| Longest Common Subsequence | match: `1+dp[i+1][j+1]`, else `max(dp[i+1][j], dp[i][j+1])` | O(m·n) / O(m·n) → O(n) |
| Longest Palindrome in a String | `dp[i][j]` palindrome if `s[i]==s[j]` and inner palindrome; or expand from centers | O(n²) / O(n²) → O(1) |
| Maximum Subarray Sum | Kadane's: `cur = max(cur+num, num)` | O(n) / O(1) |
| 0/1 Knapsack | include vs exclude: `max(v[i]+dp[i+1][c-w[i]], dp[i+1][c])` | O(n·cap) / O(n·cap) → O(cap) |
| Largest Square in a Matrix | `dp[i][j] = 1 + min(left, top, top-left)` | O(m·n) / O(m·n) → O(m) |

## Anti-patterns
- **Missing the optimal substructure**: a greedy local choice that ignores future impact fails — DP must consider all subproblem combinations.
- **Wrong base-case dimensioning**: e.g. forgetting `dp[i][0]`/row-0 in matrix or `c=0` in knapsack causes out-of-bounds or wrong fills.
- **Storing the full table unnecessarily**: when only the previous row/1–2 values are needed, reduce space.
- **Confusing subsequence with substring**: subsequence allows gaps (delete elements); substring is contiguous — different recurrences.

## Key Takeaways
1. Two preconditions: optimal substructure + overlapping subproblems — verify both before committing to DP.
2. Derive the recurrence first; base cases and fill order follow from it.
3. Prefer bottom-up after a working top-down memoized solution; then space-optimize by dropping unused table dimensions.
4. Many greedy problems are solvable with DP, but not vice versa — DP is the more general tool.

## Connects To
- **Greedy**: DP's exhaustive "consider all choices" vs greedy's single local choice.
- **Backtracking**: memoizing overlapping backtracking states yields DP.
- **Sort And Search**: Kadane's and interval DP overlap with sliding/scanning ideas; quickselect finds kth in O(n) avg.
- **Bit Manipulation**: Hamming-weight DP (`dp[x] = dp[x>>1] + (x&1)`) is a tiny 1D-DP.
