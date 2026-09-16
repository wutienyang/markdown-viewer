# 07: Design A Key-value Store

## Core Idea
Build a distributed key-value store supporting `get(key)`/`put(key, value)` by combining consistent hashing for partitioning, replication with quorum consensus for consistency, and vector clocks + Merkle trees for conflict and failure handling.

## Design Framework / Approach
1. Start with a single-server hash table; note memory limits → go distributed.
2. **Partition** data with consistent hashing (add/remove servers automatically; virtual nodes proportional to capacity).
3. **Replicate** each key to the first N distinct servers clockwise; place replicas in distinct data centers.
4. **Tune consistency** via quorum: N = replicas, W = write quorum, R = read quorum. `W + R > N` ⇒ strong consistency; `W = 1, R = N` = fast write; `R = 1, W = N` = fast read.
5. **Resolve conflicts** with versioning + vector clocks.
6. **Handle failures**: gossip protocol for detection, sloppy quorum + hinted handoff for temporary, Merkle tree anti-entropy for permanent, cross-DC replication for outages.
7. Implement Cassandra-style **write path** (commit log → memtable → SSTable) and **read path** (memtable → bloom filter → SSTables).

## Key Concepts & Components
- **CAP theorem**: a system can provide at most two of Consistency, Availability, Partition tolerance; CA systems can't exist in practice.
- **CP vs AP**: CP (e.g. banks) blocks writes during partition; AP (Dynamo/Cassandra) keeps serving with eventual consistency.
- **Quorum consensus**: write succeeds after W acks, read after R responses; coordinator proxies client↔nodes.
- **Consistency models**: strong → weak → eventual (Dynamo/Cassandra's choice).
- **Vector clock**: `[server, version]` pairs detecting ancestor/sibling (conflict) relationships; clients resolve conflicts.
- **Gossip protocol**: decentralized failure detection via heartbeat counters and membership lists.
- **Sloppy quorum + hinted handoff**: use first W/R healthy nodes; hand data back when the down node returns.
- **Merkle tree**: hash tree comparing replicas to sync only differing buckets.
- **SSTable**: sorted `<key,value>` on-disk table; **bloom filter** quickly tests key membership.

## Trade-offs & Anti-patterns
- **All-to-all multicasting for failure detection**: inefficient at scale — use gossip.
- **Strong consistency everywhere**: forces blocking; prefer eventual consistency for highly available stores.
- **Vector clock growth**: `[server:version]` pairs can balloon; cap length (Dynamo has never hit it in production).
- **Replicas in one data center**: fail together — replicate across DCs.

## Key Takeaways
1. Choose CP or AP explicitly and configure W/R/N to hit your latency/consistency target.
2. Resolve concurrent writes with vector clocks (client-side), not last-write-wins.
3. Use gossip + hinted handoff + Merkle trees to keep replicas available and in sync.

## Connects To
- **06-design-consistent-hashing**: the partitioning backbone.
- **02-scale-from-zero-to-millions-of-users**: the shared state store for a stateless web tier.
- **05-design-a-rate-limiter**: Redis (a KV store) as counter backend; eventual consistency tradeoff.
- **08-design-a-unique-id-generator-in-distributed-systems**: Snowflake IDs used as KV keys.
