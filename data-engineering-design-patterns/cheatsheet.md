# Cheatsheet — Data Engineering Design Patterns

Decision rules for acting like the author. Companion to `patterns.md` (definitions) and `glossary.md` (terms).

## Pick a loading strategy (Ch 2)

| Situation | Pattern |
|---|---|
| Small / slowly evolving / no change-detection column / bootstrap | **Full Loader** |
| Growing, mostly immutable; full loads too costly | **Incremental Loader** (delta column or time-partition) |
| Sub-minute latency OR hard deletes required | **Change Data Capture** |

Rule: choose the *lightest* option that meets the SLA. Full load needs transactions/time-travel/view-switch to stay consistent.

## Replicate as-is, transform only when forced (Ch 2)

- Replicating for dev/staging consistency → **Passthrough Replicator** (preserve metadata: headers, offsets, order).
- Any PII or non-propagatable field → **Transformation Replicator** (tag PII in a catalog to avoid drift).
- Never over-transform JSON/CSV: keep fields as raw strings — silent date/type conversion corrupts replicas.

## Idempotency: pick by data shape (Ch 4)

| Data shape | Pattern |
|---|---|
| Replaceable whole dataset | **Fast Metadata Cleaner** (metadata) or **Data Overwrite** (files) |
| Row-level insert/update/delete | **Merger** (needs unique key) |
| Compactable store, one value per key | **Keyed Idempotency** |
| Changes must be atomic/visible at once | **Transactional Writer** |
| Expose clean data without touching raw | **Proxy** |

Rule: a pipeline MUST produce identical output however many times it reruns (retries + backfills are guaranteed). Never treat idempotency as optional.

## Late data: detect then integrate (Ch 3)

- Always **Detect** first (watermark vs event time); never silently drop OR silently keep late data.
- Fixed lookback window → **Static Late Data Integrator**; per-record window → **Dynamic Late Data Integrator**.

## Value: combine, then order (Ch 5)

| Choice | Use |
|---|---|
| Join vs static reference | **Static Joiner** (SCD-aware) |
| Join two moving datasets | **Dynamic Joiner** |
| Aggregate, want less shuffle cost | **Local Aggregator** (pre-reduce per partition) |
| Aggregate, need cross-partition + scaling | **Distributed Aggregator** |
| Sessions on batch/incremental data | **Incremental Sessionizer** |
| Sessions on continuous streams | **Stateful Sessionizer** |
| Ordering for partial-commit stores | **Bin Pack Orderer** |
| Strict arrival-order writes | **FIFO Orderer** |

## Flow: sequence, join, fan out (Ch 6)

- Same execution unit → **Local Sequencer**; across units → **Isolated Sequencer**.
- Correctness (wait for all parents) → **Aligned Fan-In**; latency (partial results OK) → **Unaligned Fan-In**.
- Independent branches → **Parallel Split**; conditional routing → **Exclusive Choice**.
- Backfills/latency-sensitive, avoid races → **Single Runner**; throughput, tolerate shared state → **Concurrent Runner**.

## Security: pick the protection primitive (Ch 7)

| Need | Pattern |
|---|---|
| Recoverable protection | **Encryptor** |
| Irreversible removal | **Anonymizer** |
| Reversible replacement (re-identification possible) | **Pseudo-Anonymizer** |
| Easier column removal / minimize blast radius | **Vertical Partitioner** / **In-Place Overwriter** |
| Row/column access | **Fine-Grained Accessor for Tables** |
| Credentials in code | **Secrets Pointer** → **Secretless Connector** |

Rule: encrypt when the info must be recoverable; pseudo-anonymize over anonymize when re-identification must stay possible.

## Storage: optimize for the read pattern (Ch 8)

- Filter by a low-cardinality column → **Horizontal Partitioner**; isolate sensitive/hot columns → **Vertical Partitioner**.
- High-cardinality lookups → **Bucket**; range/multi-key scans → **Sorter / Z-order**.
- Many joins at read → **Denormalizer**; clean isolated storage → **Normalizer**.
- Complex query repeated often → **Dataset Materializer**; many small files listed often → **Manifest**.

## Quality & observability (Ch 9–10)

- Gate publication on quality → **Audit-Write-Audit-Publish**; block bad producers → **Constraints Enforcer**; safe schema change → **Schema Compatibility Enforcer** + **Schema Migrator**.
- Validation in a separate pipeline → **Offline Observer**; inline → **Online Observer**.
- Four failure signals to monitor: **flow interruption, skew, lag, SLA misses**.
- Need dependencies → **Dataset Tracker** (dataset) or **Fine-Grained Tracker** (column/row).

## Tells & smells

- "Jobs spend more time listing than reading" → small-files problem → **Compactor** + `VACUUM`.
- "Deleted rows still show up" → delta-column loader can't see hard deletes → soft deletes or **CDC**.
- "Downstream reads half-written data" → no transaction/view-switch on **Full Loader**.
- "Rerun produced duplicates" → missing idempotency → **Merger** / **Keyed Idempotency**.
- "Late data silently dropped or double-counted" → no **Late Data Detector + Integrator**.
- "One partition is 10× slower" → skew → **Skew Detector**; fix with **Bucket** or a better partition key.
