---
name: data-engineering-design-patterns
description: "Knowledge base from \"Data Engineering Design Patterns\" by Bartosz Konieczny. Use when designing resilient data pipelines: ingestion, error management, idempotency, data flow, security, storage, data quality, and observability. Covers 68 named patterns for building reliable, reusable data architecture."
---

<!-- argument-hint: [topic, pattern name, or chapter number] -->

# Data Engineering Design Patterns
**Author**: Bartosz Konieczny | **Pages**: ~479 | **Chapters**: 10 | **Generated**: 2026-09-16

## How to Use This Skill

- **Without arguments** — load core frameworks for reference
- **With a topic** — ask about `idempotency`, `late data`, `CDC`, `sessionization`, or another indexed topic; I find and read the relevant chapter
- **With chapter** — ask for `ch05`; I load that specific chapter
- **Browse** — ask "what chapters do you have?" to see the full index

When you ask about a topic not covered in Core Frameworks below, I will read
the relevant chapter file before answering.

---

## Core Frameworks & Mental Models

**A design pattern is a predefined, customizable template for solving a recurring problem.** Five properties define it: it is a *template* (customizable recipe), it responds to a specific *contextualization* (a concrete problem), it is *reusable* (apply the same logic in a new context), it has *consequences* (never follow blindly), and it builds a *common language* (faster team communication). Prefer a named pattern over an ad-hoc fix so the next engineer recognizes the intent.

**The data lifecycle is the book's backbone.** Patterns follow data from ingestion to exposition: ingestion (Ch 2) → error management (Ch 3) → idempotency (Ch 4) → value (Ch 5) → flow (Ch 6) → security (Ch 7) → storage (Ch 8) → quality (Ch 9) → observability (Ch 10). Locate any problem by its stage in this chain.

**Errors are intrinsic to data engineering, not exceptional.** Data providers break their contracts, schemas drift, records arrive late or malformed. Design for failure: capture bad records via the **Dead-Letter** pattern (write them to a side destination for analysis instead of crashing the job) rather than assuming clean inputs.

**Idempotency is a first-class concern, not an afterthought.** Retries and backfills are guaranteed; a pipeline must produce identical results however many times it runs. Choose by dataset maturity: **Fast Metadata Cleaner** (delete at the metadata layer) or **Data Overwrite** (rewrite physical files) for replaceable data; **Merger** (upsert by unique key) for row-level updates; **Keyed Idempotency** (write a record for a key exactly once) for compactable stores; **Transactional Writer** (explicit commit) to make changes visible atomically; **Proxy** (immutable intermediary view) to expose a clean dataset without touching raw data.

**Loading is a latency/cost/consistency spectrum.** **Full Loader** = simple but expensive (whole dataset each run). **Incremental Loader** = cheap but fragile (delta column or time-partition; misses hard deletes and late data). **Change Data Capture (CDC)** = low latency + native hard deletes (read the commit log via Debezium/Delta CDF) but higher setup complexity. Pick the lightest option that meets the SLA.

**Late data needs a detector AND an integrator.** Use the **Late Data Detector** to flag records that arrive after their window, then a **Static/Dynamic Late Data Integrator** to fold them back into the already-published dataset — never silently drop or silently keep late data.

**Value comes from joining, enriching, aggregating, and ordering.** **Static Joiner** (join against a slowly-changing reference) vs **Dynamic Joiner** (join two moving datasets); **Distributed Aggregator** (across nodes) vs **Local Aggregator** (before the shuffle) to trade network cost against scaling flexibility; **Incremental/Stateful Sessionizer** to build sessions; **Bin Pack Orderer** vs **FIFO Orderer** to guarantee output order.

**Data flow is orchestration patterns, not just code.** **Local/Isolated Sequencer** to serialize tasks; **Aligned/Unaligned Fan-In** to join branches with or without waiting on parents; **Parallel Split** vs **Exclusive Choice** to fan out; **Single Runner** vs **Concurrent Runner** to control concurrency. Prefer Aligned Fan-In for correctness, Unaligned for latency when partial results are acceptable.

**Security is defense in depth across storage, access, and credentials.** **Vertical Partitioner** (separate sensitive columns for easier removal), **Fine-Grained Accessor** (row/column-level grants), **Encryptor**/**Anonymizer**/**Pseudo-Anonymizer** (protect vs remove vs replace PII), **Secrets Pointer**/**Secretless Connector** (never hardcode credentials). Prefer encryption over anonymization when the information must be recoverable; prefer pseudo-anonymization over anonymization when re-identification must stay possible.

**Storage layout is a latency lever.** **Horizontal Partitioner** (group rows by a column) vs **Vertical Partitioner** (split columns), **Bucket** (colocate high-cardinality records), **Sorter**/**Z-order** (co-locate similar keys on disk), **Normalizer** vs **Denormalizer** (isolate data vs reduce joins), **Dataset Materializer** (precompute a complex query as a view/table), **Manifest** (avoid listing many files).

**Quality and observability make data trustworthy.** **Audit-Write-Audit-Publish** (validate before publishing), **Constraints Enforcer** (block bad producers), **Schema Compatibility/Migrator** (evolve schemas safely). Then watch it: **Flow Interruption/Skew/Lag/SLA Misses Detectors** (four failure signals) plus **Dataset/Fine-Grained Tracker** (lineage). A pipeline without these produces data nobody trusts.

---

## Chapter Index

| # | Title | Key Patterns |
|---|-------|--------------|
| [ch01](chapters/ch01-introducing-design-patterns.md) | Introducing Data Engineering Design Patterns | design pattern definition, Medallion architecture (Bronze/Silver/Gold) |
| [ch02](chapters/ch02-data-ingestion.md) | Data Ingestion Design Patterns | Full Loader, Incremental Loader, CDC, Passthrough/Transformation Replicator, Compactor, Readiness Marker, External Trigger |
| [ch03](chapters/ch03-error-management.md) | Error Management Design Patterns | Dead-Letter, Windowed Deduplicator, Late Data Detector, Static/Dynamic Late Data Integrator, Filter Interceptor, Checkpointer |
| [ch04](chapters/ch04-idempotency.md) | Idempotency Design Patterns | Fast Metadata Cleaner, Data Overwrite, Merger, Stateful Merger, Keyed Idempotency, Transactional Writer, Proxy |
| [ch05](chapters/ch05-data-value.md) | Data Value Design Patterns | Static/Dynamic Joiner, Wrapper, Metadata Decorator, Distributed/Local Aggregator, Incremental/Stateful Sessionizer, Bin Pack/FIFO Orderer |
| [ch06](chapters/ch06-data-flow.md) | Data Flow Design Patterns | Local/Isolated Sequencer, Aligned/Unaligned Fan-In, Parallel Split, Exclusive Choice, Single/Concurrent Runner |
| [ch07](chapters/ch07-data-security.md) | Data Security Design Patterns | Vertical Partitioner, In-Place Overwriter, Fine-Grained Accessor, Encryptor, Anonymizer, Pseudo-Anonymizer, Secrets Pointer, Secretless Connector |
| [ch08](chapters/ch08-data-storage.md) | Data Storage Design Patterns | Horizontal/Vertical Partitioner, Bucket, Sorter, Metadata Enhancer, Dataset Materializer, Manifest, Normalizer, Denormalizer |
| [ch09](chapters/ch09-data-quality.md) | Data Quality Design Patterns | Audit-Write-Audit-Publish, Constraints Enforcer, Schema Compatibility Enforcer, Schema Migrator, Offline/Online Observer |
| [ch10](chapters/ch10-data-observability.md) | Data Observability Design Patterns | Flow Interruption Detector, Skew Detector, Lag Detector, SLA Misses Detector, Dataset/Fine-Grained Tracker |

## Topic Index

- **Aggregation** → ch05
- **Anonymization / Pseudo-anonymization** → ch07
- **Backfilling / reprocessing** → ch01, ch04
- **Bucketing / Z-order / sorting** → ch08
- **Change Data Capture (CDC)** → ch02
- **Checkpointing** → ch03
- **Compaction / small files** → ch02
- **Dead-letter queue** → ch03
- **Deduplication** → ch03
- **Encryption** → ch07
- **Fan-in / fan-out** → ch06
- **Fine-grained access control** → ch07
- **Idempotency** → ch04
- **Joining (static/dynamic)** → ch05
- **Late data** → ch03
- **Lineage / data tracking** → ch10
- **Load (full/incremental)** → ch02
- **Medallion architecture** → ch01
- **Normalization / denormalization** → ch08
- **Observability (skew, lag, SLA)** → ch10
- **Ordering guarantees** → ch05
- **Partitioning (horizontal/vertical)** → ch07, ch08
- **Readiness marker / external trigger** → ch02
- **Replication (passthrough/transformation)** → ch02
- **Schema compatibility / migration** → ch09
- **Secrets management** → ch07
- **Sequencing / orchestration** → ch06
- **Sessionization** → ch05
- **SLA detection** → ch10
- **Streaming vs batch** → ch01, ch02

## Supporting Files

- [glossary.md](glossary.md) — all key terms with definitions
- [patterns.md](patterns.md) — all 68 techniques and design patterns
- [cheatsheet.md](cheatsheet.md) — quick reference decision rules and trade-off tables

---

## Scope & Limits

This skill covers the book content only. For hands-on implementation in your codebase,
combine with project-specific tools (Spark, Airflow, Kafka, Delta Lake). For topics beyond
this book, check related skills or ask the agent directly.
