# Chapter 9: Data Quality Design Patterns

## Core Idea
Detect, prevent, and fix data quality issues (incompleteness, inaccuracy, inconsistency) before they reach downstream consumers, so producers and consumers can both trust the dataset exchange. Patterns are organized into three categories: quality enforcement, schema-level control, and quality observation.

## Frameworks Introduced
- **Audit-Write-Audit-Publish (AWAP)**: evolution of Netflix's Write-Audit-Publish (WAP) that adds a lightweight input-data validation *before* the transform plus a full output-data audit *after* it.
  - When to use: when a pipeline must verify that both input and output datasets meet business/technical requirements (e.g., a 50% drop in daily visit volume that went unnoticed).
  - How: the first audit job runs fast checks on the source (file format, file/table size, schema); the second audit job validates transformed data (e.g., NULL checks) before it is published. Audit outcomes are not just pass/fail — you can dispatch invalid records (dead-letter), or nonblockingly annotate imperfect data with a quality summary. In streaming, use processing-time windows or a staging layer (the staging approach drops the input audit, since records flow continuously).

- **Constraints Enforcer**: delegate quality controls to the database/storage format using a declarative approach instead of writing pipeline validation code.
  - When to use: when a complex pipeline writes NULLs into required fields and you want the load to fail without adding validation complexity to the job.
  - How: identify attributes needing rules (business- or legislation-driven), then assign constraints: type, nullability, value (comparison operators/expressions), and integrity (references to other tables). Implemented in relational databases, Delta Lake (`CHECK`, `NOT NULL`), and serialization formats like Avro/Protobuf (+ protovalidate). Informative for consumers, interactive (blocking) for producers.

- **Schema Compatibility Enforcer**: validate schema changes against a configured compatibility mode so producers cannot introduce breaking changes.
  - When to use: when an upstream team silently removed fields your job depends on, causing repeated failures.
  - How: three enforcement modes — external service/library (Kafka Schema Registry, Avro `SchemaValidator`), implicit-with-inserts (table formats/relational DBs), and event-driven for DDL (Postgres/SQL Server event triggers, or revoking `ALTER TABLE`). Set a compatibility mode: backward, forward, or full, each either transitive or nontransitive.

- **Schema Migrator**: enable breaking schema evolution (rename, type change, removal) safely via a grace period, when compatibility enforcement alone would forbid the change.
  - When to use: when a message has grown to ~60 scattered attributes and consumers want related fields (login, email, age) grouped into a single `user` entity without breaking compatibility.
  - How: for rename/type change, create the new field, agree on a transition period during which both old and new attributes are produced, then (after the deadline) emit a schema version with only the new attribute. For removal, agree on a removal period, then drop the field. Requires *nontransitive* compatibility.

- **Offline Observer**: a detached observability job that monitors dataset properties (value distribution, NULL counts, new unprocessed fields) without blocking the main pipeline.
  - When to use: when the dataset is currently healthy but you know it will evolve, and you want monitoring that must not block processing.
  - How: run an independent job (often on a different schedule, e.g., nightly) that records observation state (first/last row IDs for idempotency) and aggregates metrics into a monitoring layer, optionally generating HTML data-profile reports.

- **Online Observer**: make observation an intrinsic part of the data-generation pipeline so insight is available immediately after generation.
  - When to use: when the Offline Observer's weekly cadence let consumers discover a data regression (bad zip-code format) before you did, and you need near-real-time detection.
  - How: place the observation job after the Transform stage using the Parallel Split or Local Sequencer pattern. In streaming, integrate observation into the job itself (no separate pipeline), using Spark accumulators and partition/offset tracking for lag detection.

## Key Concepts
- **Data quality**: completeness, accuracy, and consistency of a dataset — the basis of trust between producer and consumer.
- **Audit step**: a blocking validation in a pipeline that fails, dispatches, or annotates data based on defined business/technical rules.
- **Write-Audit-Publish (WAP)**: precursor pattern (Michelle Ufford, Netflix, 2017) that validates only output before publishing.
- **Schema registry**: an external versioned service (e.g., Kafka Schema Registry) that validates schema changes against compatibility rules.
- **Schema compatibility**: rules governing whether a new schema version can be read by consumers of older/newer versions (backward, forward, full).
- **Transitive compatibility**: consistency guaranteed across *all* versions (past and future), not just consecutive ones.
- **Schema evolution**: controlled changes to schema — rename, type change, removal — coordinated with consumers over a grace period.
- **Constraint**: a declarative rule (type, nullability, value, integrity) enforced by the database or storage format.
- **Observability vs auditing**: observability monitors nonblockingly; auditing validates and blocks. Observability keeps enforcement rules up to date.
- **Data profiling**: generating a statistical summary report (e.g., ydata-profiling HTML) to characterize a dataset and inform rule changes.
- **Lag detection**: comparing the producer's last committed offset against the latest input-topic offset to measure processing delay.

## Mental Models
- Use Audit-Write-Audit-Publish when a pipeline must prove both input and output meet expectations before publishing.
- Use Constraints Enforcer when you want the storage layer, not your code, to reject bad records declaratively.
- Use Schema Compatibility Enforcer when schema changes must be governed centrally to avoid breaking consumers.
- Use Schema Migrator when you must make a breaking change but need to give consumers time to adapt.
- Use Offline Observer when monitoring must not touch production resources and staleness is acceptable.
- Use Online Observer when detection latency matters more than the extra cost of embedding observation in the pipeline.

## Anti-patterns
- **Validating the full input dataset in the first audit step**: risks reading the dataset twice (once in audit, once in transform) — keep input checks fast and push exhaustive validation to the output audit.
- **Assuming audit failures are always real issues**: data is dynamic; an unexpected volume spike can be legitimate (e.g., a viral mention). Treat some failures as alerts, not blocking errors.
- **Relying on constraints alone for 100% coverage**: file formats often lack integrity constraints, so you may still need pipeline-side validation to fill gaps.
- **Renaming a column directly (`ALTER TABLE ... RENAME COLUMN`)**: breaks consumers' queries immediately; instead add the new column first and let consumers migrate.
- **Trusting transitive compatibility for evolution**: it forbids field removal/renaming; use nontransitive mode if you need to evolve.
- **Running Offline Observer on a heavily deferred schedule**: insight arrives too late, and batching 24h of data costs more compute than frequent incremental runs.
- **Using Parallel Split to observe an exposed dataset**: you may observe a partially valid dataset (e.g., missed datetime casting during load); prefer Local Sequencer observing the consumer-facing data.

## Code Examples
```python
audit_file_to_load = PythonOperator(
    task_id='audit_file_to_load',
    python_callable=local_validate_the_file_before_processing)
transform_file = PythonOperator(
    task_id='transform_file',
    python_callable=flatten_input_visits_to_csv)
def local_validate_flatten_visits():
    validate_flatten_visits(get_current_context())
audit_transformed_file = PythonOperator(
    task_id='audit_transformed_file',
    python_callable=local_validate_flatten_visits)
load_flattened_visits_to_final_table = PostgresOperator(
    task_id='load_flattened_visits_to_final_table',
    sql='/sql/load_file_to_visits_table.sql')
(next_partition_sensor >> audit_file_to_load >> transform_file
 >> audit_transformed_file >> load_flattened_visits_to_final_table)
```
- **What it demonstrates**: AWAP in an Airflow batch pipeline — input audit → transform → output audit → load.

```sql
CREATE TABLE default.visits (
  visit_id STRING NOT NULL,
  event_time TIMESTAMP NOT NULL
) USING delta;

ALTER TABLE default.visits ADD CONSTRAINT event_time_not_in_the_future
  CHECK (event_time < NOW() + INTERVAL "1 SECOND");
```
- **What it demonstrates**: Constraints Enforcer — Delta Lake type + nullability constraints plus a value constraint; violations raise `DELTA_VIOLATE_CONSTRAINT_WITH_VALUES` / `DELTA_NOT_NULL_CONSTRAINT_VIOLATED`.

```python
required_columns = ['visit_id', 'event_time', 'user_id', 'page', 'ip', 'login',
                    'browser', 'browser_version', 'network_type', 'device_type',
                    'device_version']
cols_w_nulls = []
visits = pandas.read_csv(partition_file(context, 'csv'), sep=';', header=0)
for validated_column in required_columns:
    if visits[validated_column].isnull().any():
        cols_w_nulls.append(validated_column)
if columns_with_nulls:
    raise Exception('Found nulls in not nullable columns:' + ','.join(cols_w_nulls))
```
- **What it demonstrates**: output audit logic using pandas to detect NULLs in required columns (needed because CSV is constraintless).

## Reference Tables
Schema compatibility modes (Table 9-1):

| Compatibility mode | Allowed actions | Semantics |
|---|---|---|
| Backward (transitive / nontransitive) | Delete field, Add optional field | Consumers with a newer version can read data produced with an older version |
| Forward (transitive / nontransitive) | Add field, Delete optional field | Consumers with an older version can read data produced with a newer version |
| Full (transitive / nontransitive) | Add optional field, Delete optional field | Consumers with a newer version can read older data, and consumers with an older version can read newer data |

Offline vs Online Observer:

| Aspect | Offline Observer | Online Observer |
|---|---|---|
| Location in pipeline | Detached, independent component | Intrinsic part of data-generation pipeline |
| Schedule | Any, often less frequent (e.g., nightly) | Immediately after generation |
| Time accuracy | May be late (consumers may see issues first) | Near-real-time |
| Impact on pipeline | None (nonblocking, no production-resource impact) | Adds latency / risk; failure can fail the job (mitigate via `all_done` trigger, sampling) |
| Compute | May batch many hours at once; sampling possible | Runs continuously; accumulators avoid double reads |

## Worked Example
In the blog data-analytics platform, the daily batch ETL job computes visit statistics, and the unique-visitors number unexpectedly dropped 50%, triggering a costly marketing campaign before the aggregation bug was found. Applying AWAP: the pipeline first audits the input file (`local_validate_the_file_before_processing`) checking that the JSON-lines file is at least `min_size` bytes, has at least `min_lines` lines, and contains no invalid JSON — any violation raises an exception that blocks the job. If it passes, the job transforms and flattens visits to CSV, then a second audit (`validate_flatten_visits`) reads the CSV with pandas and confirms none of the 11 required columns (visit_id, event_time, user_id, page, ip, login, browser, browser_version, network_type, device_type, device_version) contain NULLs; a NULL in a non-nullable column raises an error before loading into PostgreSQL. Only after both audits pass does the pipeline load the data into the final `visits` table — preventing the next silent volume-drop regression from reaching the product team.

## Key Takeaways
1. Quality enforcement happens in layers: pipeline-level (AWAP), storage-level (Constraints Enforcer), and schema-level (Schema Compatibility Enforcer).
2. AWAP extends unit tests onto real data — unit tests are static snapshots, while audit steps validate the live dataset.
3. Audit outcomes are richer than pass/fail: fail, dispatch (dead-letter valid-but-invalid records), or nonblocking annotation with a data-quality summary.
4. Constraints Enforcer is informative (describes shape/values to consumers) and interactive (blocks producers), but has all-or-nothing semantics and stops at the first error.
5. Compatibility modes tell consumers what evolution to expect; transitive modes forbid removal/rename, so nontransitive is required for Schema Migrator.
6. Observability is nonblocking monitoring, not auditing — it keeps enforcement rules current but never prevents the pipeline from proceeding.
7. The Offline-vs-Online Observer choice is a trade of time for accuracy; offline is cheap but stale, online is fresh but adds cost/risk.

## Connects To
- **Ch 10 (Fine-Grained Tracker)**: use data lineage to detect whether a field is actually consumed before removing it in Schema Migrator.
- **Ch 1 (Figure 1-1 visits dataset)**: the recurring blog-visits case study underlying all examples in this chapter.
- **Dead-Letter pattern**: AWAP's data-dispatching outcome resembles dead-lettering, but driven by explicit control logic rather than runtime errors.
- **Stateful Sessionizer / Normalizer / Parallel Split / Local Sequencer**: referenced as the pipeline context for Schema Compatibility Enforcer and Online Observer placement.
- **Kafka Schema Registry / Delta Lake / Protobuf+protovalidate / ydata-profiling**: concrete technologies implementing these patterns.
