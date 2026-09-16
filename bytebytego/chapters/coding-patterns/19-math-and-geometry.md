# 19: Math And Geometry

## Core Idea
Use this chapter for problems rooted in numeric or geometric reasoning: GCD, modular arithmetic, floating-point precision, integer overflow/underflow, and pattern recognition. Recognize it when the core difficulty is a mathematical identity or a geometric property (slopes, coordinates, rotations, symmetry) rather than a data structure. Often the "aha" is simplifying the problem (parity, symmetry, recurrence) down to a closed-form or constant-time rule.

## Technique / Template
- **Digit extraction/reversal**: `digit = n % 10`, `n //= 10`, build `rev = rev*10 + digit`; guard overflow by checking `rev > INT_MAX//10` **before** appending.
- **Slope for collinearity**: represent slope as a reduced `(rise, run)` tuple (divide by GCD) to avoid float precision issues; use a sentinel `(1, 0)` for vertical lines.
- **GCD (Euclidean)**: `while b: a, b = b, a % b`.
- **Modular recurrence**: Josephus `J(n,k) = (J(n-1,k)+k) % n`, base `J(1,k)=0`; convert to O(1) space with a rolling variable.
- **Boundary traversal**: shrink `top/bottom/left/right` to visit a matrix in spiral order without extra space.
- **Look for repeated patterns / parity** to collapse a construction problem into O(1) case analysis.

## Problems Covered
| Problem | Key Insight | Complexity |
|---|---|---|
| Spiral Traversal | Walk right/down/left/up, shrinking four boundaries after each pass | O(m·n) / O(1) |
| Reverse 32-Bit Integer | Build reversal digit-by-digit; detect overflow before appending (use fmod/`/` for negatives) | O(log n) / O(1) |
| Maximum Collinear Points | For each focal point, bucket other points by reduced `(rise,run)` slope; count max +1 | O(n² log m) / O(n) |
| The Josephus Problem | Recurrence `J(n,k)=(J(n-1,k)+k)%n`; iterative rolling variable | O(n) / O(n) → O(1) |
| Triangle Numbers | Parity + symmetry: first even at pos 2 (odd), 3 (n%4==0), else 4 | O(1) / O(1) |

## Anti-patterns
- **Storing slopes as floats**: precision loss misidentifies distinct slopes as equal — use reduced integer `(rise, run)` pairs.
- **Checking overflow after the fact**: reversing can overflow mid-build — check `rev > INT_MAX//10` before multiplying.
- **Reconstructing an entire triangle/board**: pattern problems often collapse to a cyclic rule; building is wasteful.
- **Python `%` and `//` with negatives**: `%` returns positive and `//` floors — use `math.fmod` and truncating division for digit reversal.

## Key Takeaways
1. Guard integer overflow/underflow *before* the operation that could trigger it.
2. Reduce fractions (divide by GCD) for canonical, precision-safe comparisons of ratios/slopes.
3. Prefer closed-form and pattern/parity reasoning over brute-force simulation.
4. Use boundary pointers instead of visited-sets for ordered matrix traversal (constant space).

## Connects To
- **Bit Manipulation**: parity and power-of-two checks share numeric reasoning.
- **Dynamic Programming**: Josephus and many combinatorics problems have DP recurrences with O(1) optimizations.
- **Graphs**: collinear-points grouping mirrors "group nodes by a shared attribute" (hash map counts).
- **Sort And Search**: bounding-order traversal and case-analysis complement ordered iteration.
