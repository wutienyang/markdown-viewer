# Chapter 4: Idempotency Design Patterns

## Core Idea
Retries and backfills must produce identical results no matter how many times a pipeline runs: idempotency guarantees consistent output with no duplicates (or clearly identifiable duplicates), since a retried task may replay already-successful writes to the target store. Idempotency extends error management from the processing layer to the data layer.

## Frameworks Introduced
- **Fast Metadata Cleaner**: guarantee idempotency by removing old data via fast metadata operations (`TRUNCATE TABLE` / `DROP TABLE`) instead of physical `DELETE`, using partitioned or dedicated tables exposed through a single view.
  - When to use: large continuously-growing tables where `DELETE` degrades; databases with metadata operations (warehouses, lakehouses, relational DBs); full or incremental partitioned datasets.
  - How: partition the dataset into idempotency-granularity tables (e.g. weekly); orchestrate a router (e.g. `BranchPythonOperator`) that creates/truncates/drops the granularity table on the first run of the period; refresh the unifying view. Freeze old tables to bound partition/table quotas.
- **Data Overwrite**: guarantee idempotency by replacing existing data at the data layer when no metadata layer is available (e.g. object stores).
  - When to use: object stores without `TRUNCATE`/`DROP`; full datasets available for replacement each run.
  - How: use a native replacement command — Spark save mode `overwrite`, Flink write mode, Delta Lake `replaceWhere` for selective overwrite, SQL `INSERT OVERWRITE`, `DELETE FROM` + `INSERT INTO`, or `LOAD DATA OVERWRITE` (BigQuery `--replace=true`).
- **Merger**: combine incremental changes with the existing dataset via `MERGE` (UPSERT) using immutable match attributes.
  - When to use: incremental datasets (only changed rows available) where full replacement is impossible; static row identity.
  - How: define single or composite uniqueness attributes; define `WHEN MATCHED` (update, or delete when `is_deleted` flag set) and `WHEN NOT MATCHED` (insert only when `is_deleted = false`) branches.
- **Stateful Merger**: extend Merger with an extra state table to restore the dataset to the last valid version before backfilling.
  - When to use: versioned data stores (Delta Lake, Iceberg) where backfill consistency matters.
  - How: track (execution_time → table version) in a state table; at pipeline start detect backfill by comparing current vs previous version, restoring via time-travel/`restoreToVersion` or truncate; update state after merge.
- **Keyed Idempotency**: use immutable key generation with a key-based data store so a record is written exactly once regardless of retries.
  - When to use: key-value / NoSQL stores (Cassandra, ScyllaDB, HBase); streaming session/entity generation; files/partitions named with execution time.
  - How: generate keys from immutable attributes (user ID alone if unique; else user ID + append/ingestion time, not event time); use ingestion time ordering in window functions to survive late data.
- **Transactional Writer**: use database transactions for all-or-nothing semantics so uncommitted changes are never visible to consumers.
  - When to use: jobs where nodes/tasks get rescheduled mid-write and consumers must never see partial/duplicate data.
  - How: initialize transaction (explicit `START TRANSACTION`/`BEGIN` or implicit), write, then commit; rollback on failure. Distributed jobs: either task-local transactions or a whole-job transaction (e.g. Spark + Delta Lake commit log, Kafka + Flink exactly-once).
- **Proxy**: expose only the most recent version of an immutable dataset through an intermediate layer (view/alias/manifest).
  - When to use: legal/compliance requires keeping all past versions while serving only the latest; datasets must be write-once.
  - How: load each run into a timestamped/versioned internal table; enforce immutability (remove write permissions, WORM locks on object stores); create a passthrough view (or alias/manifest) pointing at the newest table.

## Key Concepts
- **Idempotency**: property that a job produces consistent output with no (or clearly identifiable) duplicates no matter how many times it runs.
- **Backfill**: replaying a pipeline for a past period to correct data; doubles as the idempotency/restore granularity in some patterns.
- **Reprocessing**: re-running a job after error/retry, which risks replaying already-written operations.
- **UPSERT / MERGE**: a single command combining insert and update (and optionally soft delete) based on match attributes.
- **State store / state table**: a table recording (execution_time → version) to detect backfill mode and drive restoration.
- **Atomic commit**: all-or-nothing write visibility — data becomes readable only after the commit log entry is written.
- **Soft delete**: expressing a delete as an update that sets an `is_deleted` flag, so merge logic can detect and apply it.
- **WORM (write once read many)**: immutability enforced via locks/policies on object stores (S3 Object Lock, Azure immutability policies, GCP holds/bucket locks).
- **Append time / ingestion time**: time a record was physically written to the broker/store; immutable, unlike event time, so safe for key generation.
- **Dirty read**: a reader seeing uncommitted records when isolation level is `READ UNCOMMITTED`.

## Mental Models
- Use Fast Metadata Cleaner when a table grows unbounded and physical `DELETE` becomes too slow.
- Use Data Overwrite when the storage has no metadata layer (object store) and you have the full dataset each run.
- Use Merger when input is incremental changes, not a full dataset, and row identity is static.
- Use Stateful Merger when backfill must restore the last valid version for consistency-sensitive consumers.
- Use Keyed Idempotency when writing to a key-based store and the key can be derived from immutable attributes.
- Use Transactional Writer when consumers must never see partial data from rescheduled tasks.
- Use Proxy when past versions must be retained but only the latest exposed.

## Anti-patterns
- **Using event time for idempotent keys**: late-arriving data changes the key between runs, breaking the idempotency guarantee — use append/ingestion time instead.
- **Relying on `DELETE` for large growing tables**: two-step scan-then-overwrite degrades over time; prefer metadata operations.
- **Ignoring `is_deleted` on `WHEN NOT MATCHED` in MERGE**: re-inserts removed records on the first run and never removes them.
- **Assuming overwrite physically removes data**: time-travel stores keep old blocks until retention expires or vacuum runs.
- **Backfilling a Merger pipeline without a restore step**: consumers see a mid-backfill inconsistent dataset.
- **Expecting transactional idempotency beyond the current transaction**: task-local transactions or backfills rewrite already-committed data.

## Code Examples
```python
def retrieve_path_for_table_creation(**context):
    ex_date = context['execution_date']
    should_create_table = ex_date.day_of_week == 1 or ex_date.day_of_year == 1
    return 'create_weekly_table' if should_create_table else "dummy_task"

check_if_monday_or_first_january_at_midnight = BranchPythonOperator(
    task_id='check_if_monday_or_first_january_at_midnight',
    provide_context=True,
    python_callable=retrieve_path_for_table_creation
)
```
- **What it demonstrates**: Fast Metadata Cleaner idempotency router deciding when to create a new granularity (weekly) table.

```sql
MERGE INTO dedp.devices_output AS target
USING dedp.devices_input AS input
ON target.type = input.type AND target.version = input.version
WHEN MATCHED AND input.is_deleted = true THEN DELETE
WHEN MATCHED AND input.is_deleted = false THEN UPDATE SET full_name = input.full_name
WHEN NOT MATCHED AND input.is_deleted = false
  THEN INSERT (full_name, version, type) VALUES (input.full_name, input.version, input.type)
```
- **What it demonstrates**: Merger pattern handling insert, update, and soft delete in one statement.

```python
version_to_restore = version_for_current_execution_time - 1
```
- **What it demonstrates**: Stateful Merger compensating for no-data operations (compaction) that advance version numbers between merges.

```python
if not maybe_previous_job_version:
    spark.sql('TRUNCATE TABLE default.devices')
else:
    previous_job_version = maybe_previous_job_version[0].delta_table_version
    if previous_job_version < last_merge_version:
        current_run_version = (spark_session.sql(f'''SELECT delta_table_version FROM versions WHERE execution_time = "{currently_processed_version}"''')
                               .collect()[0].delta_table_version)
        version_to_restore = current_run_version - 1
        DeltaTable.forName(spark, 'devices').restoreToVersion(previous_job_version)
```
- **What it demonstrates**: Stateful Merger backfill detection (truncate vs restore) driven by the state table.

```python
(input_data.selectExpr('CAST(value AS STRING)', 'timestamp')
    .select(F.from_json(F.col('value'), 'user_id LONG, page STRING, event_time TIMESTAMP').alias('visit'), F.col('timestamp'))
    .selectExpr('visit.*', 'UNIX_TIMESTAMP(timestamp) AS append_time')
    .withWatermark('event_time', '10 seconds')
    .groupBy(F.col('user_id')))
```
- **What it demonstrates**: Keyed Idempotency source grouping using the Kafka append time (`timestamp`) as the immutable key input.

```sql
SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END
FROM dedp.devices_history WHERE execution_time > '{{ ts }}'
```
- **What it demonstrates**: Backfill-mode detection for Stateful Merger on a store without native versioning.

```python
kafka_sink_valid_data = (KafkaSink.builder().set_bootstrap_servers("localhost:9094")
    .set_record_serializer(KafkaRecordSerializationSchema.builder()
        .set_topic('reduced_visits')
        .set_value_serialization_schema(SimpleStringSchema())
        .build())
    .set_delivery_guarantee(DeliveryGuarantee.EXACTLY_ONCE)
    .set_property('transaction.timeout.ms', str(1 * 60 * 1000))
    .build())
```
- **What it demonstrates**: Transactional Writer via Flink exactly-once Kafka sink with a transaction timeout aligned to checkpointing.

## Reference Tables

### Merger pattern incremental loading (Table 4-1) vs backfill (Table 4-2)
Normal run (U = update, D = delete):

| Ingestion time | New rows | Output table rows |
|----------------|----------|-------------------|
| 07:00          | A        | A                 |
| 08:00          | A-U, B   | A-U, B            |
| 09:00          | B-D, C   | A-U, C            |
| 10:00          | M, N, O  | A-U, C, M, N, O   |

Backfill replay from 08:00 (note inconsistency in "Output table rows" column):

| Ingestion time | New rows | Current rows      | Output table rows   |
|----------------|----------|-------------------|---------------------|
| 08:00          | A-U, B   | A-U, C, M, N, O   | A-U, B, C, M, N, O  |
| 09:00          | B-D, C   | A-U, B, C, M, N, O| A-U, C, M, N, O     |
| 10:00          | M, N, O  | A-U, C, M, N, O   | A-U, C, M, N, O     |

### Stateful Merger state table (Table 4-4)

| Execution time | Version |
|----------------|---------|
| 2024-10-05     | 1       |
| 2024-10-06     | 2       |
| 2024-10-07     | 3       |
| 2024-10-08     | 4       |

After backfilling 2024-10-07 (new version 5 written):

| Execution time | Version |
|----------------|---------|
| 2024-10-05     | 1       |
| 2024-10-06     | 2       |
| 2024-10-07     | 5       |
| 2024-10-08     | 4       |

### Idempotency approach comparison (category → pattern)
| Category        | Pattern                | Input shape          | Mechanism                                | Consistency during backfill |
|-----------------|------------------------|----------------------|------------------------------------------|-----------------------------|
| Overwriting     | Fast Metadata Cleaner  | full or partitioned  | `TRUNCATE`/`DROP` + view                 | bounded by granularity      |
| Overwriting     | Data Overwrite         | full                 | replace files / `INSERT OVERWRITE`       | full replace                |
| Updates         | Merger                 | incremental          | `MERGE` on immutable keys                | inconsistent mid-backfill   |
| Updates         | Stateful Merger        | incremental          | `MERGE` + state table restore            | restored to last valid      |
| Database        | Keyed Idempotency      | stream/batch         | immutable key into key-value store       | exact-once per key          |
| Database        | Transactional Writer   | any                  | transaction commit/rollback              | per-transaction only        |
| Immutable      | Proxy                  | full (keep history)  | versioned tables + view/alias/manifest   | immutable, always latest    |

## Worked Example
**Blog data analytics platform — weekly visits tables with Fast Metadata Cleaner.** A daily batch job processes 500 GB–1.5 TB of visit events. Guaranteeing idempotency by `DELETE` (all rows from the previous run) then `INSERT` worked for three weeks, then `DELETE` degraded as the table grew. Instead of treating the dataset as one monolithic unit, the engineer splits the yearly visits dataset into 52 physical weekly tables joined by a single `visits` view. Idempotency granularity becomes one week. An Airflow `BranchPythonOperator` checks the execution date: if it's Monday (or January 1), the pipeline follows the "create_weekly_table" branch (`PostgresOperator` running `create_weekly_table.sql`), otherwise it jumps straight to data insertion. A custom `PostgresViewManagerOperator` then refreshes the `visits` view (a `UNION` of weekly tables) with the new table. Replaying any run from the table-creation task yields the same result. Trade-offs: backfilling one bad day forces replaying the whole week; the approach can't do fine-grained (per-user/provider) backfills; and BigQuery's 4,000-partition / Redshift's 200,000-table limits require a freezing step that collapses old weekly tables into monthly/yearly immutable ones.

## Key Takeaways
1. Idempotency is the data-layer counterpart to error management: retries replay successful writes, so pipelines must be designed to neutralize duplicates.
2. Prefer metadata operations (`TRUNCATE`/`DROP`) over `DELETE` for removal — they skip the table scan but cap idempotency granularity to whole tables.
3. Match attributes must be immutable; the Merger's `WHEN NOT MATCHED` branch must guard on `is_deleted` or removed rows get resurrected.
4. Backfill consistency requires state: Stateful Merger tracks table versions to restore the last valid snapshot before merging.
5. Generate idempotent keys from immutable attributes (append/ingestion time, not event time) to survive late data and restarts.
6. Transactions guarantee visibility only after commit — but their idempotency is scoped to the current transaction, not replays.
7. For immutable, history-retaining datasets, the Proxy pattern adds an indirection layer (view/alias/manifest) over versioned tables.

## Connects To
- **Ch 3 (Error Management)**: idempotency completes the error-management cycle, which only protects the processing layer.
- **Ch 2 (Incremental Loader)**: soft deletes referenced by Merger originate from this pattern's CDC discussion.
- **Windowed Deduplicator**: used by Stateful Merger's no-versioning variant to rebuild the table from raw history.
- **Compactor**: compaction creates a new table version (no data change), which breaks naive Stateful Merger version math.
- **Storage / partitioning strategies**: later design-pattern family that mitigates Data Overwrite overhead on large datasets.
- **CDC (Change Data Capture)**: the stream of incremental changes that Merger consumes from Kafka topics.
