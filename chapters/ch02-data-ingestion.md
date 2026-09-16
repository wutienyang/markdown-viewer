# Chapter 2: Data Ingestion Design Patterns

## Core Idea
Data engineering systems are rarely data generators; their first stage is acquiring data from producers with distinct technical and business constraints. This chapter gives reusable templates for loading (full/incremental), replicating (as-is or transformed), and triggering ingestion (readiness markers and external events) so downstream analytics and data science workloads never receive incomplete, broken, or inefficiently organized data.

## Frameworks Introduced

- **Full Loader**: works on a complete dataset each time (extract-then-load, EL; add a thin transform layer only for heterogeneous stores).
  - When to use: the source defines no attribute to detect changed rows, the entity is small/slowly evolving (e.g. a reference dataset under ~1M rows), or you need a database bootstrap.
  - How: export from one store and import to another; for homogeneous stores use native commands (e.g. `aws s3 sync`), otherwise a processing framework. Manage consistency via transactions, time travel (Delta Lake/Iceberg/BigQuery), or a single data exposition abstraction (view over a versioned table).

- **Incremental Loader**: ingests only the new parts of a physically or logically divided dataset, often at higher frequency.
  - When to use: a continuously growing, mostly immutable dataset where full loads would be cost-prohibitive.
  - How: two implementations — (1) a **delta column** (e.g. ingestion time) filters rows added since the last run and remembers the last value; (2) **time-partitioned datasets** resolve the new partition implicitly from the execution date, often guarded by a Readiness Marker.

- **Change Data Capture (CDC)**: continuously ingests all modified rows directly from the database commit log.
  - When to use: you need low ingestion latency (sub-minute) and/or built-in support for physical (hard) deletes that the Incremental Loader cannot provide.
  - How: subscribe to the append-only commit log and stream changes (insert/update/delete + metadata) to a broker such as Kafka. Implement via a commit-log reader (e.g. Debezium + Kafka Connect) or a lake-native change data feed (Delta Lake CDF with `readChangeFeed`).

- **Passthrough Replicator**: copies data as-is from one location to another with no transformation.
  - When to use: a non-idempotent data provider means you must replicate the exact production dataset into other environments (dev/staging) for consistency.
  - How: keep the job as simple as possible — a native copy command, or a raw text API (not JSON I/O) to avoid silent interpretation; use push (source-owned) replication for isolation; preserve metadata (file count/names, Kafka headers and partition ordering).

- **Transformation Replicator**: adds a transformation layer between read and write to alter data during replication.
  - When to use: the dataset contains PII or attributes that cannot leave production, yet you must replicate real (not synthetic) data for testing.
  - How: a custom mapping function (Spark/Flink), a `SELECT`/`EXCEPT`/`drop` reduction, column-level access grants, or a column/row-level transform (e.g. Anonymizer). Keep transformations minimal (treat datetimes as strings) and automate PII tagging via a data catalog/contract to avoid desynchronization.

- **Compactor**: combines many small files into bigger ones to reduce metadata overhead and read I/O.
  - When to use: batch jobs spend most of their time listing files rather than processing data (the "small files" problem).
  - How: Delta Lake `OPTIMIZE` (or `executeCompaction()`), Iceberg `rewrite data file`, Hudi merge-on-read compaction, Kafka log compaction (keep latest value per key), or `VACUUM` for dead tuples. Pair with a cleaning step (`VACUUM`) to reclaim space; prefer ACID table formats so readers/writers stay consistent.

- **Readiness Marker**: signals to consumers when a dataset is complete and safe to consume.
  - When to use: downstream teams (ML models, BI dashboards) complain about incomplete datasets from logically dependent but physically isolated pipelines you cannot directly trigger.
  - How: flag-file (`_SUCCESS` from Spark, a new Delta commit log, or a manually created `COMPLETED` file written as the last pipeline step) or a partition convention (consume partition N only once the producer has started partition N+1). Pull-based; requires communicating the convention and its risks to consumers.

- **External Trigger**: event-driven ingestion using push semantics — the producer notifies consumers when new data exists.
  - When to use: data generation frequency is unpredictable (e.g. feature releases at most once a week), so scheduled runs waste compute; you want to run the pipeline only when something new exists.
  - How: three actions — subscribe to a notification channel, react to events in a handler (filter relevant events), and trigger the ingestion pipeline (orchestration API or a direct job). Prefer push over pull; enrich the trigger call with metadata; design for failure (Dead-Letter pattern).

## Key Concepts
- **Passthrough job (EL)**: an extract-and-load job where data simply passes through the pipeline from source to destination without transformation.
- **Delta column**: a column (e.g. ingestion time) used to identify rows added since the last ingestion run.
- **Time-partitioned dataset**: a dataset logically organized by time partitions so the loader can target a whole new batch of records at once.
- **Commit log**: an append-only database structure recording every operation on rows at the end of the logfile, read by CDC consumers.
- **Data replication**: moving data between the same type of storage while ideally preserving all metadata (primary keys, event positions); more constrained than flexible "loading".
- **Soft delete**: marking a row removed via `UPDATE` instead of physically deleting it, so incremental loaders can still detect the change.
- **Append-only (insert-only) table**: a table accepting only `INSERT`, shifting reconstruction of deletes/updates onto consumers.
- **Late data**: events that arrive for an event-time window already processed, which a delta-column loader may miss.
- **Time travel**: ability to restore a previous version of a dataset (Delta Lake, Iceberg, BigQuery).
- **Medallion architecture**: Bronze (raw) / Silver (cleaned, enriched) / Gold (business) layering used throughout the case study.
- **Pull vs push semantics**: pull = consumer polls for new data; push = producer notifies consumers of availability.

## Mental Models
- Use the Full Loader when the source offers no change-detection attribute and the dataset is small or slowly evolving.
- Use the Incremental Loader when data is continuously growing and mostly immutable, and choose a delta column for event data versus time partitions for already-organized storage.
- Use CDC when sub-minute latency or hard-delete support is required, and the Incremental Loader's scheduling/query overhead would break the SLA.
- Use the Passthrough Replicator when you need the exact same data as production, and switch to the Transformation Replicator the moment PII or non-propagatable attributes are involved.
- Use the Readiness Marker (pull) for scheduled completeness, and the External Trigger (push) for unpredictable, event-driven arrival.

## Anti-patterns
- **drop-and-insert full replacement without transactions**: consumers may read partial or empty data if the insert doesn't complete; use transactions or a view-switch abstraction.
- **Using event time as the delta column without late-data handling**: late-arriving records for an already-processed window get silently missed.
- **Assuming deleted rows are captured by a delta-column loader**: a deleted row leaves no delta value, so it stays in your dataset — require soft deletes or move to CDC.
- **Replicating a Delta/Kafka dataset while ignoring metadata**: copying only Parquet files (not the transaction log) or dropping Kafka headers/ordering makes the replica unusable.
- **Over-transforming text formats (JSON/CSV) during replication**: silent type/date conversions corrupt the replica; keep fields as raw strings.
- **Running compaction rarely without a cleaning job**: small files linger and continue hurting metadata operations; pair compaction with `VACUUM`.
- **Treating CDC-consumed rows as static data**: streamed rows are data in motion — a missing `JOIN` match may mean "not yet", not "no match".

## Code Examples

```python
input_data = spark.read.schema(input_data_schema).json("s3://devices/list")
input_data.write.format("delta").save("s3://master/devices")
```
- **What it demonstrates**: the Full Loader as a two-line EL job — Spark reads JSON and writes a Delta Lake table, gaining transactional/versioning consistency for free.

```python
in_data = (spark_session.read.text(input_path)
    .select('value', functions.from_json(functions.col('value'), 'ingestion_time TIMESTAMP')))
input_to_write = in_data.filter(
    f'ingestion_time BETWEEN "{date_from}" AND "{date_to}"'
)
input_to_write.mode('append').select('value').write.text(output_path)
```
- **What it demonstrates**: Incremental Loader via a delta column, bounding ingestion by time range so re-runs never pull extra rows (guarantees consistent volume and enables backfill windows).

```json
{
  "name": "visits-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "postgres",
    "database.port": "5432",
    "database.user": "postgres",
    "database.password": "postgres",
    "database.dbname": "postgres",
    "database.server.name": "dbserver1",
    "schema.include.list": "dedp_schema",
    "topic.prefix": "dedp"
  }
}
```
- **What it demonstrates**: CDC via Debezium + Kafka Connect — a config-only connector streams `dedp_schema` changes to Kafka topics prefixed `dedp.`.

```python
events_to_replicate = (input_data_stream
    .selectExpr('key', 'value', 'partition', 'headers', 'offset'))

def write_sorted_events(events, batch_number):
    (events.sortWithinPartitions('offset', ascending=True).drop('offset').write
        .format('kafka').option('kafka.bootstrap.servers', 'localhost:9094')
        .option('topic', 'events-replicated').option('includeHeaders', 'true').save())

write_data_stream = (events_to_replicate.writeStream
    .option('checkpointLocation', f'{get_base_dir()}/checkpoint-kafka-replicator')
    .foreachBatch(write_sorted_events))
```
- **What it demonstrates**: Passthrough Replicator for Kafka preserving both headers and per-partition ordering (`sortWithinPartitions('offset')`).

```python
input_delta_dataset = spark_session.read.format('delta').load(users_table_path)
users_no_pii = input_delta_dataset.drop('ip', 'latitude', 'longitude')
```
- **What it demonstrates**: Transformation Replicator via PySpark `drop`, removing PII columns before cross-environment replication.

## Reference Tables

### Full Loader vs Incremental Loader
| Dimension | Full Loader | Incremental Loader |
|---|---|---|
| Scope | Complete dataset each run | Only new rows/partitions |
| Best for | Small, slowly evolving, no change-detection column | Continuously growing, mostly immutable data |
| Change detection | None needed | Delta column or time partitions |
| Deletes | Handled implicitly (full overwrite) | Missed unless soft deletes used |
| Cost | Grows with dataset size | Scales with new data only |
| Consistency risk | Concurrency/loss of prior version | Backfill overruns, late data |

### Replication: Passthrough vs Transformation
| Dimension | Passthrough Replicator | Transformation Replicator |
|---|---|---|
| Transform step | None (read + write only) | Mapping/SQL between read and write |
| Data fidelity | Byte-for-byte as-is | Altered (reduced, anonymized, mapped) |
| Use case | Non-idempotent provider, exact copy needed | PII must not leave production |
| Risk | Silent type conversion if wrong API | Breaking dataset via bad schema/transform |

### Data Loading vs Data Replication
| Aspect | Data Loading | Data Replication |
|---|---|---|
| Storage type | Flexible (heterogeneous OK) | Same type, preserve metadata (PKs, offsets) |
| Goal | Move/adapt data | Copy data as-is |
| Metadata | Not required | Critical (transaction log, headers, order) |

## Worked Example
**The blog analytics platform** (Medallion architecture) faces a legacy producer problem: some visit events are still written to a transactional database instead of the real-time broker.

- **Incremental Loader** brings these immutable legacy visits into the Bronze layer. The partition-based implementation runs hourly: an Airflow `FileSensor` waits for the next partition (`date={{ data_interval_end | ds }}`), then a `SparkKubernetesOperator` triggers the `EventsLoader` Spark job, which reads `input/date={{ ds }}` and writes `output/date={{ ds }}`. The immutable `{{ ds }}` macro keeps backfills deterministic.
- When latency complaints arrive, the team switches to **CDC**: a Debezium connector watches `dedp_schema.events` and pushes every change to the `dedp.dedp_schema.events` Kafka topic within ~30 seconds, capturing hard deletes natively.
- **Readiness Marker** is used downstream: Spark writes a `_SUCCESS` file after each Parquet batch, and consumers gate their pipelines on it via an Airflow `FileSensor` (with `mode='reschedule'` so the worker slot isn't blocked).

## Key Takeaways
1. Data ingestion is not a trivial "move data" step — even a simple copy raises consistency, volume, and latency challenges.
2. Full, incremental, and CDC form a latency/cost spectrum: full = simple but expensive, incremental = cheap but deletes/late-data fragile, CDC = low latency + hard deletes but more complex to set up.
3. When in doubt, replicate as-is: any unnecessary transformation during replication is a source of silent data-quality bugs.
4. PII is the single biggest reason to switch from Passthrough to Transformation Replicator, and you should tag sensitive fields in a catalog/contract to avoid desynchronization.
5. The small-files problem can turn a "virtually unlimited" lakehouse into a metadata bottleneck — compact, then clean (`VACUUM`).
6. Readiness and triggers are about semantics: pull (marker) for scheduled datasets, push (external trigger) for unpredictable arrivals.
7. All these patterns are reusable as the extract step in ETL/ELT pipelines, not just at the system's front door.

## Connects To
- **Ch 3**: Error management patterns (e.g. Dead-Letter) govern how External Trigger handlers and CDC consumers should fail without losing events.
- **Ch 4**: the Proxy pattern and single data exposition abstraction used for safe Full Loader table switches.
- **Ch 7**: data security patterns (Secret/credential management) to replace hardcoded credentials shown in trigger examples.
- **Late Data**: a streaming concept that determines delta-column and partition-readiness reliability.
- **Anonymizer / Fine-Grained Accessor**: transformation primitives the Transformation Replicator composes.
