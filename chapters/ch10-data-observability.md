# Chapter 10: Data Observability Design Patterns

## Core Idea
Data quality patterns (Ch 9) protect the *data itself*, but you can still ship broken or missing data when a job silently stops, falls behind, or becomes unbalanced — so observability patterns add two pillars, **detection** (spot data and time problems) and **tracking** (reconstruct relationships among datasets, columns, and rows), to alert on and trace data health before consumers complain.

## Frameworks Introduced
- **Flow Interruption Detector**: raise an alert whenever data stops arriving — dataset unavailability detection.
  - When to use: a streaming job synchronizes data to an object store and silently stops writing (without failing), or a batch table's last-modification time stops advancing; you want to catch it before consumers report stale data.
  - How: for **continuous delivery** expect ≥1 record per unit of time (e.g. per minute) and alert when the count hits zero; for **irregular delivery** compare time windows and alert when the no-data period exceeds the accepted window. In batch/at-rest stores, detect via the **metadata layer** (last modification time threshold), the **data layer** (a modification-time column, or row-count that hasn't changed across two consecutive periods), or the **storage layer** (time of last file written).

- **Skew Detector**: detect when a pipeline processes a different data volume than expected — an unbalanced or incomplete dataset.
  - When to use: a batch job processed a half-empty dataset because the upstream provider had data-generation issues, and you want to always process a *complete* dataset.
  - How: three steps — (1) identify the **comparison window** (compare today's daily run to yesterday's), (2) set a **tolerance threshold** (e.g. tolerate 50% more or less), (3) implement the **skew calculation** as either a window-to-window percentage difference or the ratio `STDDEV(x)/AVG(x)` for partitioned stores (Kafka topic, PostgreSQL table). Good fit for the first Audit stage of the AWAP pattern as a guard against partial datasets.

- **Lag Detector**: measure how far a data *consumer* is behind the *producer* — the lead indicator for freshness and unavailability problems.
  - When to use: a streaming job started processing 30% more data and downstream consumers complain about slower delivery; you need to monitor consumer processing pace before deciding to scale.
  - How: (1) define the **lag unit** per store — record position or append time (Kafka), commit number (Delta Lake), partition timestamp (time-partitioned store); (2) compute `lag = last_available_unit - last_processed_unit`; (3) aggregate partitioned results with `MAX` (worst case) and/or a percentile such as P90/P95 (typical behavior) — combine both to track overall latency plus the worst partition.

- **SLA Misses Detector**: assert that a workflow completes within a maximum allowed execution time.
  - When to use: a 6:00 a.m. batch job must finish in 40 minutes so downstream pipelines can produce business stats by 8:00 a.m., and you want to notify yourself and consumers the moment the SLA is about to break.
  - How: measure processing time and compare to the SLA threshold. For a **batch job** subtract start time from end time; for a **microbatch/windowed streaming** job subtract per-iteration start/end times; for **non-windowed** streaming measure per-record read-to-write time and aggregate via MAX or percentile (using Online/Offline Observer patterns). Separate **processing-time SLA** (read→write) from **event-time SLA** (generation→write), since late data breaks the latter through no fault of yours.

- **Dataset Tracker**: build a dependency tree among data containers (tables, folders, topics, queues) to map providers and consumers.
  - When to use: you consume a dataset with an inconsistent schema and must find which *upstream team* introduced the type change — you need the family tree of datasets across the organization.
  - How: either delegate to a **managed service** (Databricks Unity Catalog, GCP Dataplex) that analyzes job/table/dashboard dependencies out of the box (limited to specific job/store types), or build it **manually** by extracting inputs/outputs at the orchestration layer (Airflow/OpenLineage auto-detect) or the database layer (parse executed queries like `SELECT ... FROM orders o JOIN users u ...` into a reference-tree), then feed a lineage service that visualizes the graph.

- **Fine-Grained Tracker**: provide low-level (column- or row-level) detail about data origin on top of dataset lineage.
  - When to use: you implemented the Denormalizer and now a 30+ column table's per-column upstream sources are unclear to new team members — you must answer "which input columns compose each output column?"
  - How: at the **column level**, analyze the query execution plan to track downstream dependencies (e.g. `CONCAT(u.first_name, d.delivery_address) AS user_with_address` depends on `users.first_name` and `addresses.delivery_address`); some platforms provide it natively (Databricks Unity Catalog `system.access.column_lineage`, Azure Purview, OpenLineage for Spark). At the **row level**, attach producer metadata (job name/version, batch, parent lineage) as a record header/column via data decoration patterns.

## Key Concepts
- **Data observability**: monitoring + alerting on data and pipeline health, complementing data-quality checks with detection (data/time) and tracking (lineage) pillars.
- **Detection vs. tracking**: detection patterns spot data/time problems (flow interruption, skew, lag, SLA); tracking patterns reconstruct dataset/column/row relationships.
- **Data skew**: either unbalanced load across partitions/tasks *or* a pipeline processing a materially different volume than in a prior window.
- **Lag**: the distance between the last available unit and the last processed unit (offset, commit version, or timestamp).
- **SLA**: a maximum allowed execution time asserted per task/pipeline, measured in processing time and/or event time.
- **Processing time vs. event time**: processing time follows the wall clock (never late); event time is when the record was generated and can lag behind due to producer/network delays (late data).
- **Freshness**: how recently a dataset was updated — the signal Flow Interruption Detector checks across metadata/data/storage layers.
- **Data lineage**: the family tree of datasets, columns, and rows describing who produced what from which inputs.
- **Alarm fatigue**: desensitization caused by excessive false-positive alerts, which degrades responsiveness to real issues.
- **Comparison window**: the two time periods (e.g. consecutive daily runs) a Skew Detector compares to judge volume differences.

## Mental Models
- Use Flow Interruption Detector when a job can silently stop without failing and you need an alert, not consumer complaints.
- Use Skew Detector when you must guarantee a batch pipeline processes a *complete* dataset, not a partial one.
- Use Lag Detector when you need the *lead* indicator that predicts upcoming freshness and availability problems.
- Use Dataset Tracker when the fault is upstream and you need to know *which team to ask*; use Fine-Grained Tracker when the fault is inside a transformation and you need to know *which column or row*.

## Anti-patterns
- **Treating irregular data as continuous**: applying a per-minute "≥1 record" rule to bursty delivery floods you with false positives and alarm fatigue — use window-based detection instead.
- **Setting thresholds from past volume alone**: marketing campaigns or seasonal spikes exceed historical averages and generate false positives; combine business knowledge and explicit exceptions.
- **Averaging lag**: a mean of 8s across partitions can hide a P90 of 18s — percentiles reveal the real consumer experience.
- **Window-to-window fatality loop**: comparing to the immediately-previous run makes the *next* valid dataset look skewed (3× the failed day); compare against the last *successful* run.
- **Trusting metadata or storage signals blindly**: schema-evolution updates the modification time without adding records, and compaction writes new files without new data — both fake flow continuity.
- **Relying on managed lineage beyond its scope**: Dataplex won't capture BigQuery Data Transfer loads, leaving a partial lineage view (vendor lock / cross-cloud gaps).
- **Expecting column lineage through custom code**: programmatic mapping functions are opaque boxes the lineage framework can't interpret — only native SQL/operators trace cleanly.

## Code Examples
```python
next_partition_sensor = FileSensor(...)
def compare_volumes():
    context = get_current_context()
    previous_dag_run = DagRun.get_previous_dagrun(context['dag_run'])
    if previous_dag_run:
        previous_execution_date = previous_dag_run.execution_date
        current_file_path = get_full_path(context['logical_date'], 'json')
        current_file_size = os.path.getsize(current_file_path)
        previous_file_path = get_full_path(previous_execution_date, 'json')
        previous_file_size = os.path.getsize(previous_file_path)
        size_ratio = current_file_size / previous_file_size
        if size_ratio > 1.5 or size_ratio < 0.5:
            raise Exception(f'Unexpected file size detected for the...')
volume_comparator = PythonOperator(task_id='compare_volumes', python_callable=compare_volumes)
(next_partition_sensor >> volume_comparator >> transform_file >> load_flattened_visits_to_final_table)
```
- **What it demonstrates**: Skew Detector window-to-window mode — an Airflow pipeline gate rejects the run when the current partition's file size differs from the previous run by more than 50%.

```python
# visits_reducer_job — row-level lineage via Kafka record headers
(visits_to_save.withColumn('headers', F.array(
    # job_version, job_name, batch_version as for visits_decorator_job, plus:
    F.struct(F.lit('parent_lineage').alias('key'),
             F.to_json(F.col('headers')).cast('binary').alias('value'))
)))
```
- **What it demonstrates**: Fine-Grained Tracker at row level — each downstream job re-emits the upstream job's lineage as a `parent_lineage` header, so any row can be traced to its producer.

## Reference Tables
**Dataset Tracker vs. Fine-Grained Tracker**

| | Dataset Tracker | Fine-Grained Tracker |
|---|---|---|
| Granularity | dataset (table, topic, folder, queue) | column or row |
| Question answered | which dataset/team produced this dataset? | which input columns/rows produced this column/row? |
| Implementation | managed services (Unity Catalog, Dataplex) or I/O extraction at orchestration/database layer | execution-plan analysis (column) or header decoration (row) |
| Visualization | standard lineage UI (e.g. Marquez) | column lineage in lineage tools; row lineage needs a separate query layer |
| Main gotcha | vendor lock, custom-task I/O resolution | custom code is opaque; row lineage won't integrate with lineage tools |

**Flow Interruption Detector layers (batch/at-rest)**

| Layer | Signal | Gotcha |
|---|---|---|
| Metadata | last modification time | may be absent; schema evolution fakes freshness |
| Data | modification column / row-count change | needs column enrichment or stored counts |
| Storage | last file write time | compaction writes files without new data |

**Average vs. percentile for lag** (partitions: 10, 5, 30, 2, 3, 5, 3s)

| Metric | Value | Interpretation |
|---|---|---|
| Average | 8s | misleading — suggests a healthy job |
| P90 | 18s | 90% of partitions processed within 18s at worst — the real picture |

## Worked Example
In the blog data-analytics platform, the `visits` streaming job synchronizes Apache Kafka's `visits` topic into a Delta Lake table consumed by multiple teams. To catch a silent ingestion stop without waiting for consumers, apply the **Flow Interruption Detector** at the producer: the Delta Lake writer (`visits_to_write.write.format('delta').insertInto(get_valid_visits_table())`) pushes a `visits_last_update_time` Gauge to the Prometheus Pushgateway after each sync. In Prometheus, an expression like `sum without(instance)(rate(kafka_server_brokertopicmetrics_messagesin_total{topic="visits"}[1m]))` tracks incoming records per minute, and Grafana raises a data-interruption alert whenever the last N values are zero (continuous-delivery mode). The same idea is extended to batch data via PostgreSQL's `track_commit_timestamp`, querying the elapsed time since the last commit:

```sql
SELECT CAST(EXTRACT(EPOCH FROM NOW()) AS INT) AS "time",
       CAST(EXTRACT(EPOCH FROM NOW() - MAX(pg_xact_commit_timestamp(xmin))) AS INT) AS value
FROM dedp.visits_flattened
```

The alert layer triggers whenever the difference exceeds the accepted flow-interruption threshold, catching unavailability in both the streaming (metric) and batch (commit-time) paths before a consumer notices.

## Key Takeaways
1. Data quality alone is not enough — an AWAP job that never runs still passes every data check; observability's detection patterns close that gap.
2. Detectors come in two families: **data** (Flow Interruption, Skew) and **time** (Lag, SLA) — both target problems before they surface downstream.
3. Flow Interruption detection must match the delivery mode: per-record counts for continuous streams, window-based checks for irregular delivery, and freshness analysis across metadata/data/storage layers for batch.
4. Skew Detector's comparison window and tolerance threshold are business decisions, not technical ones — seasonality and cross-team communication determine false-positive rates.
5. Lag and SLA are complementary but not interchangeable: a throughput-limited consumer can respect SLA while lag grows, and a batch job with zero lag can still miss SLA.
6. Percentiles beat averages for lag: they expose the worst-case partitions that a mean hides.
7. Tracking builds the dataset family tree (Dataset Tracker) and drills into columns/rows (Fine-Grained Tracker), turning "whose fault is this?" into an answerable query.

## Connects To
- **Ch 9 (Data Quality)**: Skew Detector plugs into the Audit stage of the AWAP pattern as a guard against partial datasets; observability fills the gaps quality checks leave.
- **Ch 3 (Error Management)**: Online/Offline Observer patterns are the metric-gathering mechanism used by the non-windowed SLA Misses Detector.
- **Ch 6 (Data Flow)**: Readiness Marker (sensor) unlocks the Skew Detector's Airflow pipeline; Data Decoration patterns add row-level lineage headers.
- **Ch 8 (Data Storage)**: Denormalizer's wide tables motivate Fine-Grained column lineage; skew detection targets partitioned stores (Kafka, PostgreSQL) laid out by the storage patterns.
- **Data lineage / OpenLineage**: the open-source lineage standard (with Marquez UI) that implements Dataset and column-level tracking across Airflow and Spark.
