# 26: Real-time Gaming Leaderboard

## Core Idea
Use Redis **sorted sets** (hash table + skip list) for O(log n) score updates and rank lookups — the single data structure that makes a real-time leaderboard trivially fast at millions of DAU.

## Design Framework / Approach
Reject the relational-DB approach (rank = O(n) sort, tens of seconds). Keep one Redis sorted set per monthly tournament; `ZINCRBY` on win, `ZREVRANGE` for top-10, `ZREVRANK` for a user's rank. Keep supporting user/point tables in MySQL for history and leaderboard rebuild. Scale to 500M DAU by sharding Redis (fixed-partition preferred).

## Key Concepts & Components
- **Sorted set**: hash table (user→score) + skip list (score→user); O(log n) add/update/rank.
- **Redis commands**: `ZADD`, `ZINCRBY`, `ZRANGE/ZREVRANGE` (top-N), `ZRANK/ZREVRANK` (rank).
- **Server-side scoring**: only the game service calls the score API; never trust client scores (man-in-the-middle).
- **Fixed partition**: shard by score range; top-10 lives in the top shard; rank = local rank + counts from higher shards.
- **Hash partition (Redis cluster)**: 16384 hash slots via `CRC16(key)%16384`; scatter-gather top-K — higher latency, no easy rank.
- **NoSQL (DynamoDB) alternative**: partition key `game_name#{year-month}#p{partition}` with score sort key + write sharding to avoid hot partitions.
- **Failure recovery**: rebuild leaderboard by replaying MySQL point history through `ZINCRBY`.

## Trade-offs & Anti-patterns
- **Relational DB rank**: O(n) sort per query; doesn't scale to millions of rows.
- **Client-set scores**: forgeable — enforce server-authoritative scoring.
- **Hash partition**: top-K needs scatter-gather and can't give exact rank — prefer fixed partition.
- **DynamoDB single-month partition**: hot partition; needs write sharding.

## Key Takeaways
1. A sorted set is the canonical leaderboard primitive; don't sort a relational table.
2. Score on the server, not the client.
3. When you must shard, prefer fixed score-range partitions so top-K and rank stay cheap.

## Connects To
- **Proximity Service**: both rely on in-memory indexed structures (geohash vs sorted set).
- **Digital Wallet / Stock Exchange**: event sourcing rebuilds state; MySQL point history does the same here.
- **Metrics Monitoring**: high-write in-memory stores with TTL/rollup parallels.
