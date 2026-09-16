# 22: Ad Click Event Aggregation

## Core Idea
Aggregate 1B clicks/day into per-minute counts and top-N using a stream-processing Map/Aggregate/Reduce DAG over Kafka, with **event time + watermark**, **exactly-once** semantics, and end-of-day reconciliation because the numbers drive billing.

## Design Framework / Approach
Decouple log-watcher → aggregation → DB with two Kafka queues. Model aggregation as a MapReduce DAG: Map nodes partition/normalize by ad_id, Aggregate nodes count in-memory per minute, Reduce nodes merge top-N. Store both raw (backup) and aggregated (query) data. Handle lateness with watermarks and duplicates with exactly-once distributed transactions.

## Key Concepts & Components
- **Map/Aggregate/Reduce DAG**: small computing units; Aggregate = in-memory per-minute counter; Reduce = final top-N.
- **Event time vs processing time**: event time is more accurate; handle slight delay with a **watermark** (extended window); long delays are reconciled end-of-day.
- **Tumbling window** (fixed, non-overlapping — per-minute counts) vs **sliding window** (top-N in last M minutes).
- **Exactly-once**: at-least-once via retry + at-most-once via dedup; wrap offset-commit + downstream-send in a distributed transaction.
- **Star schema**: pre-aggregate by dimensions (country, ip) for filtering; more buckets, fast reads.
- **Kappa vs Lambda**: reprocess historical data through the same streaming path (Kappa) to avoid two codebases.
- **Hotspot mitigation**: popular ads overload nodes; resource manager allocates extra aggregators.
- **Snapshot + replay**: persist offset + top-N to a snapshot for fast failover.

## Trade-offs & Anti-patterns
- **Synchronous pipeline**: producers outpace consumers and cascade failures — insert Kafka to decouple.
- **Processing time**: reliable server clock but inaccurate on late events; prefer event time for billing accuracy.
- **Storing only raw or only aggregated**: raw is huge/slow, aggregated loses detail — keep both.
- **Dedup via offset saved before send**: loses events on crash; save offset only after downstream ACK.

## Key Takeaways
1. Two queues + a MapReduce DAG is the canonical real-time aggregation shape.
2. Use event time + watermarks for near-real-time, and end-of-day reconciliation to correct the residual error.
3. Exactly-once = retry (at-least-once) + idempotency/dedup (at-most-once), enforced transactionally.

## Connects To
- **Distributed Message Queue**: Kafka topics, partitions, delivery semantics reused here.
- **Metrics Monitoring**: shared stream-processing + time-series ideas.
- **Payment System**: same exactly-once/idempotency rigor, different data scale.
