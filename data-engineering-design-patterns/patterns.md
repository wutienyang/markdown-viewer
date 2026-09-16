# Patterns — Data Engineering Design Patterns

All 68 patterns from the book, grouped by chapter. Format: **When to use** / **How** / **Trade-offs**.

## Data Ingestion (Ch 2)
- **Full Loader** — When: small/slowly-evolving dataset, no change-detection column, or bootstrap. How: extract whole set then load (EL). Trade-offs: cost grows with volume; consistency during load needs transactions/time-travel/view-switch.
- **Incremental Loader** — When: growing, mostly immutable dataset. How: filter by delta column or resolve next time-partition. Trade-offs: misses hard deletes and late data; backfill volume.
- **Change Data Capture** — When: sub-minute latency or hard deletes needed. How: subscribe to commit log (Debezium/Delta CDF) and stream changes. Trade-offs: database-layer setup complexity; change scope.
- **Passthrough Replicator** — When: replicate a dataset byte-for-byte with no transformation. How: native copy or raw text API; preserve metadata (headers, offsets, order). Trade-offs: serialization side effects; PII; production isolation; latency.
- **Transformation Replicator** — When: PII or non-propagatable fields must not leave production. How: mapping/drop/SELECT between read and write; automate PII tagging. Trade-offs: schema-based transform can misformat; PII definition drift.
- **Compactor** — When: small-files problem dominates metadata ops. How: `OPTIMIZE`/`rewrite data file`/log compaction, then `VACUUM`. Trade-offs: compaction frequency vs resources; housekeeping job.
- **Readiness Marker** — When: consumers read incomplete datasets from isolated pipelines. How: `_SUCCESS` file, new commit log, or partition convention (pull). Trade-offs: convention lacks enforcement; readiness definition reliability.
- **External Trigger** — When: data arrives unpredictably; scheduled runs waste compute. How: subscribe → react → trigger (push). Trade-offs: continuous pulling cost; missing context; needs replayable error handling.

## Error Management (Ch 3)
- **Dead-Letter** — When: malformed records would crash the job. How: wrap risky transform in try/catch; write bad records to a side destination. Trade-offs: snowball backfilling; ordering/consistency; hidden errors.
- **Windowed Deduplicator** — When: duplicates in the processed dataset. How: dedupe by key within a time window (watermark). Trade-offs: space vs time; not enough for exactly-once.
- **Late Data Detector** — When: need to identify late-arriving records. How: compare event vs processing time against watermark/lateness threshold. Trade-offs: depends on API native support.
- **Static Late Data Integrator** — When: late data arrives within a fixed lookback window. How: backfill a bounded past window. Trade-offs: limited backfill; storage footprint (small files); scheduling complexity.
- **Dynamic Late Data Integrator** — When: late data window varies per record. How: recompute affected aggregates on each late arrival. Trade-offs: waste of resources; incremental dataset + backfill overhead.
- **Filter Interceptor** — When: need to know which condition filtered out a record. How: instrument filters to emit per-condition counters/records. Trade-offs: runtime impact; hard in declarative languages (SQL).
- **Checkpointer** — When: save job progress to resume without full reprocessing. How: persist offsets/state periodically. Trade-offs: delivery-guarantee vs execution-time trade-off; not exactly-once.

## Idempotency (Ch 4)
- **Fast Metadata Cleaner** — When: remove a dataset at the metadata layer (cheap, fast). How: delete/overwrite table metadata only. Trade-offs: backfill granularity; metadata limits; more complex exposition.
- **Data Overwrite** — When: rewrite physical files wholesale. How: replace the whole dataset files. Trade-offs: I/O overhead; needs cleaning to reclaim space.
- **Merger** — When: insert/update/delete individual rows idempotently. How: upsert (MERGE) on a unique key. Trade-offs: unique key required; I/O overhead; deletes and backfill consistency.
- **Stateful Merger** — When: merging across streams with prior state. How: keep prior rows in state store and merge on arrival. Trade-offs: state scaling; at-least-once on checkpointing.
- **Keyed Idempotency** — When: write a record for a key exactly once. How: rely on database key properties / generate deterministic keys. Trade-offs: database-dependent; key generation complexity.
- **Transactional Writer** — When: changes must become visible only after explicit commit. How: wrap writes in a transaction. Trade-offs: not natively supported everywhere; distributed commits; idempotency scoped to the transaction.
- **Proxy** — When: expose an immutable dataset via an intermediary layer. How: view/abstraction over the real table. Trade-offs: implementation ease is conventional; needs security to keep dataset unaltered.

## Data Value (Ch 5)
- **Static Joiner** — When: join a moving dataset against a static reference. How: broadcast/lookup join against a slowly changing dimension. Trade-offs: late-data consistency; idempotency needs SCD handling.
- **Dynamic Joiner** — When: join two dynamic datasets. How: stream-stream join with state. Trade-offs: space vs exactness; late-data integration.
- **Wrapper** — When: add an envelope around input records. How: nest the payload under a metadata envelope. Trade-offs: attributes split across two places; larger payload.
- **Metadata Decorator** — When: add info without altering the record body. How: attach metadata via the storage metadata layer. Trade-offs: depends on storage metadata support; scope limited to metadata.
- **Distributed Aggregator** — When: aggregate records across nodes. How: shuffle/groupBy then reduce. Trade-offs: network exchange cost; data skew; scaling to reclaim capacity.
- **Local Aggregator** — When: reduce data before the shuffle. How: pre-aggregate per partition. Trade-offs: frozen scaling; grouping keys not shared by all consumers.
- **Incremental Sessionizer** — When: build sessions on an incremental dataset. How: sequential session join per partition. Trade-offs: inactivity-period resource impact; freshness; late data + backfill overhead.
- **Stateful Sessionizer** — When: build sessions continuously with a state store. How: track session state across micro-batches. Trade-offs: at-least-once via checkpointing; compute+state scaling.
- **Bin Pack Orderer** — When: ordering guarantee for partial-commit stores. How: group records into ordered bins before commit. Trade-offs: task retries; bin-creation complexity; bulk vs single delivery.
- **FIFO Orderer** — When: write records in input order. How: serialize writes in arrival order. Trade-offs: I/O overhead and per-request latency; not exactly-once.

## Data Flow (Ch 6)
- **Local Sequencer** — When: run tasks in sequence within one execution unit. How: chain tasks in a single job. Trade-offs: boundary identification; no one-size-fits-all.
- **Isolated Sequencer** — When: sequence tasks across different execution units. How: schedule sequential dependencies (orchestrator). Trade-offs: scheduling/dataset dependency; desynchronization.
- **Aligned Fan-In** — When: start a task only after all parents succeed. How: gate the task on all upstream success. Trade-offs: idle infra resources; scheduling skew; complexity with many branches.
- **Unaligned Fan-In** — When: start independently of parent success status. How: proceed with whatever parents finished; annotate partial results. Trade-offs: must visually mark the unaligned dependency; partial-result annotation.
- **Parallel Split** — When: run multiple concurrent branches from one branch. How: fork into independent tasks. Trade-offs: task-based dependency still serializes; orchestration-layer needs.
- **Exclusive Choice** — When: follow only selected branches. How: route based on a condition. Trade-offs: complexity; hidden logic; heavy data-based conditions.
- **Single Runner** — When: process data sequentially. How: one instance/run at a time. Trade-offs: backfill performance; latency.
- **Concurrent Runner** — When: process with concurrent runs. How: multiple parallel instances. Trade-offs: resource starvation; shared state.

## Data Security (Ch 7)
- **Vertical Partitioner** — When: easier removal of sensitive columns. How: split sensitive columns into a separate dataset. Trade-offs: query performance; polyglot complexity; not for raw data.
- **In-Place Overwriter** — When: remove attributes or rows from stored data. How: overwrite the dataset minus sensitive data. Trade-offs: I/O overhead; cost of interacting with data.
- **Fine-Grained Accessor for Tables** — When: row/column-level access control. How: grants, row/column masking policies. Trade-offs: attributes for row-level policies; complex column-level policies.
- **Fine-Grained Accessor for Resources** — When: control access to cloud resources. How: IAM/policy-based access. Trade-offs: ease of maintenance vs strict security.
- **Encryptor** — When: protect data from unauthorized use (reversible). How: encrypt at rest/in transit with managed keys. Trade-offs: encryption overhead; data loss risk.
- **Anonymizer** — When: remove protected info irreversibly. How: drop/blank PII fields. Trade-offs: information loss.
- **Pseudo-Anonymizer** — When: replace protected info reversibly. How: tokenize/encrypt with a mapping. Trade-offs: information loss; combined re-identification risk.
- **Secrets Pointer** — When: use credentials without storing them in code. How: reference a secret store (e.g. env/parameter path). Trade-offs: log leakage; refresh for streaming jobs; setup phase.
- **Secretless Connector** — When: connect to databases without credentials. How: workload identity/IAM roles. Trade-offs: rotation and maintenance.

## Data Storage (Ch 8)
- **Horizontal Partitioner** — When: store rows together by a partition column. How: partition by a low-cardinality column. Trade-offs: partition granularity; storage skew; partition-key change.
- **Vertical Partitioner** — When: split a row into partitions with different columns. How: separate columns into different datasets. Trade-offs: domain split; joins to reassemble rows.
- **Bucket** — When: colocate high-cardinality records. How: hash records into fixed buckets. Trade-offs: costly to evolve; no direct per-key access.
- **Sorter** — When: store blocks sorted on disk. How: sort by a key (optionally Z-order). Trade-offs: sorting overhead at write; composite sort keys.
- **Metadata Enhancer** — When: leverage metadata to speed processing. How: write stats/indexes into the metadata layer. Trade-offs: metadata creation overhead as an extra write step.
- **Dataset Materializer** — When: simplify a complex layout. How: materialize a query as a table/view. Trade-offs: refresh cost; retention/access policy management.
- **Manifest** — When: avoid expensive list operations. How: maintain a manifest of files. Trade-offs: manifest can grow too big.
- **Normalizer** — When: isolate data storage into related tables. How: decompose into normalized tables. Trade-offs: query cost across multiple tables.
- **Denormalizer** — When: reduce joins between tables. How: combine tables into wider ones. Trade-offs: row consistency after updates; storage footprint.

## Data Quality (Ch 9)
- **Audit-Write-Audit-Publish** — When: ensure a complete dataset and no poor-quality exposure. How: validate, write, re-validate, then publish. Trade-offs: compute cost; not bulletproof; extra latency.
- **Constraints Enforcer** — When: stop producers from introducing quality issues. How: enforce constraints at write. Trade-offs: all-or-nothing semantics cause loops; differing consumer expectations.
- **Schema Compatibility Enforcer** — When: ensure schema changes stay compatible. How: registry checks backward/forward compatibility. Trade-offs: communication overhead; slower evolution.
- **Schema Migrator** — When: migrate a schema without breaking downstream. How: staged migration with compatible versions. Trade-offs: record size growth; fields sometimes cannot be removed.
- **Offline Observer** — When: run validation as a separate pipeline. How: separate quality pipeline over snapshots. Trade-offs: insight is late; compute may not scale.
- **Online Observer** — When: validate within the observed pipeline. How: side-output validation alongside processing. Trade-offs: extra processing delay; parallel split is faster but scope differs.

## Data Observability (Ch 10)
- **Flow Interruption Detector** — When: detect an interrupted data flow. How: monitor flow continuity rules/thresholds. Trade-offs: rule definition; alarm fatigue.
- **Skew Detector** — When: detect storage skew. How: compare partition sizes/distributions. Trade-offs: seasonality in rules; cross-team communication.
- **Lag Detector** — When: detect consumer latency. How: measure producer-vs-consumer lag. Trade-offs: data skew impacts the consumer.
- **SLA Misses Detector** — When: detect missed latency expectations. How: alert when dataset freshness exceeds SLA. Trade-offs: late data vs event-time SLA.
- **Dataset Tracker** — When: track dataset-level dependencies. How: capture lineage at the dataset granularity. Trade-offs: vendor lock; implementation effort for custom solutions.
- **Fine-Grained Tracker** — When: track column/row-level dependencies. How: instrument transformations for field-level lineage. Trade-offs: custom-code support; row-level visualization; evolution.
