# 14: Design A Search Autocomplete System

## Core Idea
Return the top-k most frequent queries for a prefix using a trie that caches top-k results at every node, fed by an offline (weekly) aggregation pipeline rather than real-time updates.

## Design Framework / Approach
1. Clarify: prefix-only matching, 5 suggestions, ranked by historical frequency, no spell check, lowercase English, 10M DAU.
2. Back-of-envelope: ~24k QPS (48k peak); 0.4 GB new data/day; response within ~100 ms.
3. Split into **data gathering service** (aggregate queries) and **query service** (return top-5 for a prefix).
4. Move from a naive SQL `SELECT ... WHERE query LIKE 'prefix%' ORDER BY frequency LIMIT 5` to a **trie**.
5. Optimize the trie: limit prefix length (→ O(1) find) and **cache top-k at each node** (→ O(1) retrieval).
6. Deep dive: aggregation pipeline, query service caching, trie create/update/delete, and storage sharding.

## Key Concepts & Components
- **Trie (prefix tree)**: compact string tree; root = empty string; each node a character with 26 children; nodes hold frequency.
- **Top-k caching**: store top-5 queries at every node (trade space for time).
- **Data gathering pipeline**: Analytics Logs (append-only) → Aggregators → Workers (rebuild trie weekly) → Trie Cache (in-memory snapshot) + Trie DB (persistent).
- **Trie DB options**: document store (serialized snapshot, e.g. MongoDB) or key-value store (prefix→node mapping).
- **Query service optimizations**: AJAX (no page refresh), browser caching (`max-age=3600`), data sampling (log 1 of N requests).
- **Shard map manager**: smarter sharding by historical distribution (not just first letter) to avoid imbalance.

## Trade-offs & Anti-patterns
- **Real-time trie updates**: slow the query service and are unnecessary since top results change slowly — rebuild periodically.
- **Naive first-letter sharding**: letters are unevenly distributed ('c' vs 'x'); analyze history and use a shard map.
- **Traversing the whole subtree per query**: O(c log c) is too slow; cache top-k per node.

## Key Takeaways
1. Prefer an offline aggregation + weekly trie rebuild over real-time updates for autocomplete.
2. Cache top-k queries at each trie node to hit O(1) retrieval; the space cost is worth the speed.
3. Shard by historical distribution, not alphabetically; filter unwanted terms via a filter layer before the cache.

## Connects To
- **07-design-a-key-value-store**: trie-as-hash-table persistence.
- **03-back-of-the-envelope-estimation**: QPS/storage sizing.
- **10-design-a-web-crawler**: search ecosystem sibling.
