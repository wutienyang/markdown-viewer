# 18: Bit Manipulation

## Core Idea
Use bit manipulation to operate directly on a number's binary representation for speed and O(1) space, or to pack up to 32 boolean states into one integer. Recognize this pattern when a problem involves pairs/duplicates, parity, subsets represented as bitmasks, or asks for bit-level tasks (set/clear/toggle/count bits). The XOR operator is the workhorse for duplicate detection (`a^a=0`, `a^0=a`, commutative/associative).

## Technique / Template
- **Get LSB**: `x & 1`; **shift out a bit**: `x >>= 1`.
- **Set i-th bit**: `x |= (1 << i)`; **clear**: `x &= ~(1 << i)`; **toggle**: `x ^= (1 << i)`; **check**: `x & (1 << i) != 0`.
- **Even/odd**: `x & 1 == 0` → even. **Power of two**: `x > 0 and x & (x-1) == 0`.
- **Isolate a bit/lane with a mask**: AND with a constant bitmask (e.g. `0x55555555` even bits, `0xAAAAAAAA` odd bits), then shift and OR to merge.
- **Count set bits via DP**: `dp[x] = dp[x >> 1] + (x & 1)`.

## Problems Covered
| Problem | Key Insight | Complexity |
|---|---|---|
| Hamming Weights of Integers | Count LSB + right-shift per number; or DP `dp[x]=dp[x>>1]+(x&1)` | O(n log n) / O(n) DP; O(1) space |
| Lonely Integer | XOR all elements; duplicate pairs cancel to 0, leaving the unique value | O(n) / O(1) |
| Swap Odd and Even Bits | Mask even/odd bits (`0x5...` / `0xA...`), shift each, OR them | O(1) / O(1) |

## Anti-patterns
- **Reaching for a hash map for duplicates**: when elements appear exactly twice (or an even count), XOR is O(n)/O(1) vs O(n)/O(n).
- **Ignoring operator precedence**: `x & 1 == 0` binds as `x & (1==0)` — parenthesize: `(x & 1) == 0`.
- **Forgetting masks cover 32 bits**: use the right-width mask for the integer size (signed/unsigned).
- **Right-shift on signed ints**: logical vs arithmetic shift differs across languages — know your platform's behavior.

## Key Takeaways
1. XOR is the go-to for pairs/duplicates/cancellation problems.
2. Masks + shifts let you extract, move, and merge bit fields in O(1).
3. A single integer can encode up to 32 flags — use bitmasks for compact state (subset/DP state compression).
4. Bit-counting and parity recurrences often hide a tiny 1D-DP.

## Connects To
- **Dynamic Programming**: subset-state DP uses bitmasks; Hamming-weight is a DP recurrence.
- **Math And Geometry**: bit tricks overlap modular arithmetic and parity reasoning.
- **Hash Maps And Sets**: bitmask integer keys are a space-efficient alternative to sets of small elements.
- **Greedy**: bit counting via `x & (x-1)` (dropping lowest set bit) is an iterative optimization trick.
