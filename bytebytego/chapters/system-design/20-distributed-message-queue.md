# 20: Distributed Message Queue

## Core Idea
A Kafka-style broker built on three choices: a **WAL** append-only log for sequential disk I/O, a fixed message structure that avoids copying, and pervasive **batching** — plus topics/partitions/consumer groups for ordering and scale.

## Design Framework / Approach
Model both point-to-point (via **consumer group**) and publish-subscribe (via **topics**). Split a topic into partitions distributed across brokers; each partition is a FIFO log with monotonic offsets. Deep-dive: WAL storage with segments, producer buffering/routing, pull-based consumers, coordinator-driven rebalancing, Zookeeper for metadata/state, and leader-follower replication with in-sync replicas (ISR).

## Key Concepts & Components
- **Topic / partition / offset**: messages keyed by `hash(key) % numPartitions`; order guaranteed only within a partition.
- **Consumer group**: set of consumers sharing a topic; one partition consumed by at most one consumer per group; group coordinator handles rebalancing.
- **WAL + segments**: append to active segment, rotate at size cap, truncate old segments after retention (2 weeks).
- **Batching**: amortize network round-trips and make sequential writes large; trade latency vs throughput via batch size.
- **Push vs pull**: pull wins — consumers control rate, better for batch; long polling avoids idle pulls.
- **ISR + ACK settings**: `ack=all` (durable), `ack=1` (leader only), `ack=0` (fire-and-forget) trade durability for latency.
- **Delivery semantics**: at-most-once (ack=0, commit before process), at-least-once (ack=1/all, commit after process), exactly-once (retry + idempotency).
- **Advanced**: tag-based broker-side filtering, delayed/scheduled messages (delay levels or hierarchical time wheel).

## Trade-offs & Anti-patterns
- **Database for messages**: can't serve both write-heavy and read-heavy at scale — use a WAL.
- **Push model**: overwhelms slow consumers; brokers can't know consumer capacity.
- **Multiple consumers reading one partition**: breaks ordering; enforce one-per-partition-per-group.
- **Decreasing partitions**: can't reclaim space until retention expires — plan capacity ahead.

## Key Takeaways
1. Sequential WAL disk I/O + OS page cache beats any general-purpose DB for a message log.
2. Ordering is a per-partition guarantee — scale ordering by keying messages to the right partition.
3. Replication (ISR + configurable ACK) is how you trade durability against latency.

## Connects To
- **Metrics Monitoring / Ad Click Aggregation / Google Maps**: all use Kafka as the backbone.
- **Design a Key-value Store**: similar WAL + segment persistence pattern.
- **Digital Wallet / Stock Exchange**: event-sourcing logs mirror the append-only WAL idea.
