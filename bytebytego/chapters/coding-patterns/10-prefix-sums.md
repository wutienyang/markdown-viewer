# 10: Prefix Sums

## Core Idea
Use prefix sums when you need **repeated range/interval queries** over an array. Recognize it for "sum/product of a subarray," "count subarrays summing to k," and any precompute-then-query pattern. A prefix array stores the running cumulative value up to each index, turning a subarray sum into an O(1) subtraction.

## Technique / Template
- **Build**: `prefix[i] = prefix[i-1] + nums[i]` (products: init with 1, multiply).
- **Range query**: `sum_range(i, j) = prefix[j] - prefix[i-1]` (or `prefix[j]` when `i == 0`).
- **Count subarrays summing to k**: track seen prefix sums in a hash map; for each `curr`, add count of `curr - k` (init map with `{0:1}`).
- **Prefix products left+right**: for "product except self," run products from both ends.

## Problems Covered
| Problem | Key Insight | Complexity |
|---|---|---|
| Sum Between Range | Precompute prefix sums; range = difference of two entries | O(1) query / O(n) space |
| K-Sum Subarrays | `prefix[j] - prefix[i-1] == k`; hash map of seen prefix sums | O(n) time / O(n) space |
| Product Array Without Current Element | `res[i] = left_product[i] * right_product[i]`, computed in place | O(n) time / O(1) space |

## Anti-patterns
- **Resumming each query**: without precomputation, every range query is O(n).
- **Off-by-one on `i-1`**: `i == 0` needs special handling (or prepend a 0 to the prefix array).
- **Forgetting duplicates**: a prefix sum can occur multiple times — store frequency, not just presence, for K-Sum.

## Key Takeaways
1. Precompute cumulative sums once, then answer range queries in O(1).
2. Subarray-sum-to-k becomes a complement lookup (`curr - k`) over a prefix-sum map.
3. Two-ended running products solve "except self" without division.

## Connects To
- **Hash Maps And Sets**: K-Sum Subarrays and Pair Sum - Unsorted both use the complement + hash map trick.
- **Sliding Windows**: alternative for subarray-sum problems when the window length is variable.
- **Binary Search (Weighted Random Selection)**: prefix sums become the sorted search space.
