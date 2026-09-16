# Chapter 3: Error Management Design Patterns

## Core Idea
Errors are inevitable—they come from buggy code, poor upstream data quality, or temporary hardware failures. These patterns handle unprocessable records, duplicates, late data, and streaming job failures so pipelines keep running instead of dying on fatal errors.

## Frameworks Introduced
- **Dead-Letter**: Routes unprocessable records (poison-pill messages) to a side output/separate store so the job keeps processing valid records.
  - When to use: A job must keep running even when individual records fail; you want to investigate errors later rather than lose them.
  - How: Identify likely failure points (mapping functions, transformations); wrap them in `try-catch` (programmatic) or validate output-vs-input for error-safe functions; write failures to a separate resilient store (object store / broker) with failure metadata (Metadata Decorator); add monitoring and optionally a replay pipeline.

- **Windowed Deduplicator**: Ensures each distinct record is processed exactly once by treating data as bounded—time windows for streaming, the current dataset for batch.
  - When to use: Delivery is at-least-once (producer retries) but business logic must process each occurrence only once.
  - How: Identify deduplication attributes; scope the dedup to the current dataset (batch) or a time-based window backed by a state store (streaming); use `dropDuplicates`/`DISTINCT`/`ROW_NUMBER()` in batch, watermark + state store in streaming.

- **Late Data Detector**: Detects records that arrived after the watermark, based on event time.
  - When to use: Upstream producers may deliver events out of order or after network/buffering delays; you need to classify records as on-time or late.
  - How: Track a time-based attribute (event time); compute per-partition `MAX(event time)` (monotonic) then a global aggregate (`MIN`/`MAX`); subtract an allowed-lateness value to produce the watermark; records older than the watermark are late.

- **Static Late Data Integrator**: Reintegrates late data over a fixed lookback window.
  - When to use: You have a known, fixed maximum delay (e.g. stats approximate for 15 days) and want to fold late data into the daily pipeline without running N separate jobs.
  - How: Define a static lookback window (never changes); each run reprocesses past partitions within the window plus the current day; place late-data ingestion before/alongside/after current processing based on statefulness.

- **Dynamic Late Data Integrator**: Reintegrates only the partitions that actually contain late data, using a state table.
  - When to use: Requirements change so a fixed window is insufficient; you must capture all late data (even beyond the old window) without blindly replaying fixed periods.
  - How: Maintain a state table (`partition`, `last_processed_time`, `last_update_time`, `is_processed`); query for partitions where `last_update > last_processed`; add concurrency guards (`is_processed` flag, `depends_on_past`); optionally backfill only impacted entities rather than whole partitions.

- **Filter Interceptor**: Instruments each filter condition so you can see which one removed how many rows.
  - When to use: Filtered data volume spikes unexpectedly and you can't tell from the execution plan (optimizer collapses filters) whether it's a data change or a software regression.
  - How: Wrap each filter with a counter/accumulator incremented on false evaluation (programmatic API); in SQL, expose conditions as flag columns in a subquery/temp table, then `GROUP BY` the flag; gather counters at job end.

- **Checkpointer**: Persists the consumed source position and computed state so a streaming job resumes where it stopped instead of reprocessing from the start.
  - When to use: A long-running streaming job counts/stores state and a fatal failure would force full reprocessing from the beginning.
  - How: Record progress to persistent storage—framework-managed (Spark Structured Streaming `checkpointLocation`, Flink) or data-store-based (Kafka `__consumer_offsets`, KCL DynamoDB); configure frequency or commit manually after processing.

## Key Concepts
- **Dead-letter queue / storage**: A separate resilient store for records the main pipeline can't process, kept for later investigation or replay.
- **Poison-pill message**: A nontransient, unrecoverable record that fatally stops a job if not handled.
- **Transient vs. nontransient errors**: Temporary errors (e.g. DB unavailability) that recover on retry, vs. permanent errors (unprocessable records) requiring intervention.
- **Error-safe function**: A function that returns `NULL` instead of throwing (e.g. `CONCAT` with a null input), hiding errors and complicating Dead-Letter detection.
- **Event time vs. processing time**: When an event happened vs. when the pipeline interacted with it; only event time can be late.
- **Watermark**: `MAX(event time) − allowed lateness`; the minimum event time still considered on-time; also controls state-store retention in dedup.
- **State store**: Storage (local / fault-tolerant local / remote) that retains already-seen keys or accumulated state for streaming jobs.
- **Snowball backfilling effect**: Replaying/reprocessing data triggers the same backfill in all downstream consumers, cascading compute cost.
- **Exactly-once delivery**: Producer delivers each record once; distinct from exactly-once processing (which dedup/checkpointing can approach).
- **Side output**: A framework feature (Flink/Spark) to send records to an alternative destination (used for dead-letter and late-data capture).

## Mental Models
- Use Dead-Letter when you must keep a job alive despite occasional bad records but still want to investigate them later.
- Use Windowed Deduplicator when delivery is at-least-once but your logic needs each occurrence processed once.
- Use Late Data Detector when you must know whether a record arrived late (to drop, capture, or re-route it).
- Use Static Late Data Integrator when the delay is a fixed, known bound; use Dynamic when the delay varies and only impacted partitions should be replayed.

## Anti-patterns
- **Fail-fast on unprocessable records in long-running streaming jobs**: A single bad record stops the whole pipeline, forcing manual offset fixes and relaunches.
- **`MIN` for partition event-time tracking**: Causes stuck-in-the-past / open-close-open loops—the watermark can move backward, reopening emitted state and never progressing.
- **Processing-time partitions as a "fix" for late data**: It only moves the problem downstream—consumers that partition by event time still receive late data.
- **Triggering separate backfill pipelines with a static lookback window**: Produces overlapping executions; backfilling must be part of the main pipeline and account for the lookback window.
- **Checkpointing alone for exactly-once**: It only gives a "feeling" of exactly-once; distributed async tasks still reprocess on failure—you need idempotency (Ch 4).

## Code Examples
```python
def map_rows(self, json_payload: str) -> str:
    try:
        evt = json.loads(json_payload)
        evt_time = int(datetime.datetime.fromisoformat(evt['event_time']).timestamp())
        yield json.dumps({'visit_id': evt['visit_id'], 'event_time': evt_time, 'page': evt['page']})
    except Exception as e:
        yield self.invalid_data_output, _wrap_input_with_error(json_payload, e)

visits.get_side_output(invalid_data_output).sink_to(kafka_sink_invalid_data)
visits.sink_to(kafka_sink_valid_data)
```
- **What it demonstrates**: Dead-Letter via Apache Flink side outputs—`try-catch` in a map function writes failures to a separate output, later sunk to a dedicated Kafka topic.

```python
.withWatermark("visit_time", "10 minutes")
.dropDuplicates(["visit_id", "visit_time"])
.drop("visit_time", "visit_id")
```
- **What it demonstrates**: Streaming dedup with `dropDuplicates`—the watermark both defines the late-data boundary and bounds state-store retention so keys are remembered only 10 minutes.

```python
env.enable_checkpointing(30000, mode=EXACTLY_ONCE)
env.get_checkpoint_config().enable_externalized_checkpoints(RETAIN_ON_CANCELLATION)
```
- **What it demonstrates**: Flink time-based checkpointing—30s interval with `EXACTLY_ONCE` state semantics and `RETAIN_ON_CANCELLATION` to keep checkpoint files across restarts.

## Reference Tables

**State store types (Windowed Deduplicator)**

| Type | Description |
|------|-------------|
| Local | In-memory only; fastest but loses state on failure. |
| Local + fault-tolerance | In-memory with persistence to remote storage; faster access but a time/consistency cost per checkpoint. |
| Remote | State only in a remote store; natively fault-tolerant but higher latency/cost. |

**Delivery modes affected by checkpointing**

| Mode | Behavior |
|------|----------|
| Exactly once | Producer delivers each record once; achieved with idempotency patterns (Ch 4), not checkpointing alone. |
| At least once | Checkpoint after processing/writing; can duplicate on retry. |
| At most once | Checkpoint before processing; can lose data. |

**Static vs. Dynamic Late Data Integrator**

| Aspect | Static | Dynamic |
|--------|--------|---------|
| Lookback window | Fixed, never changes | Computed from state table; only partitions with late data |
| Extra structure | None | State table (`partition`, `last_processed_time`, `last_update_time`) |
| Resource use | May reprocess partitions with no new data | Backfills only impacted partitions |
| Concurrency | Simpler | Needs `is_processed` flag + `depends_on_past` to avoid duplicate runs |
| Fit | Known, bounded delay | Varying/unbounded delay, "capture all late data" |

## Worked Example
The book's recurring case study is a blog analytics platform producing `visit` events. In the Late Data Detector scenario, visitors normally generate events that reach the system within 15 seconds, but users who lose connectivity buffer visits locally and flush them once reconnected. A Structured Streaming job detects these late events with `withWatermark('event_time', '1 hour')` over 10-minute session windows. Table 3-2 shows the effect: events arriving with event time 03:15, 03:00, 01:50, 03:11, 04:31 buffer windows `[03:00–03:10]` and `[03:10–03:20]`; the 01:50 event is ignored because it predates the current watermark (02:15), and both 3 o'clock windows are emitted only after the 04:31 record advances the watermark to 03:31. For the Static Late Data Integrator, a daily job computes referral statistics from the same blog, keeping results approximate for 15 days; an Airflow `generate_backfilling_runs` task computes the lookback dates and `expand(...)` creates one `integrate_late_data` task per backfilled date, so late data is folded into the daily run instead of 15 separate jobs.

## Key Takeaways
1. Error management is a distinct layer—handle unprocessable records (Dead-Letter), duplicates (Windowed Deduplicator), and late data (Detector + Integrators) separately from idempotency.
2. The watermark is the central mechanism: it both detects late data and bounds streaming state-store growth, and it must be monotonically increasing.
3. Use `MAX` at the partition level to avoid stuck-in-the-past loops; use `MIN`/`MAX` at the global level to trade off buffering vs. skipping slow partitions.
4. Dead-lettering and late-data replay both trigger the snowball backfilling effect—downstream consumers must reprocess too, so notify them and plan for it.
5. Exactly-once processing is not exactly-once delivery; checkpointing and dedup reduce duplication but idempotency (Ch 4) is the real guarantee.
6. Favor the programmatic API for Filter Interceptor and Dead-Letter; declarative SQL makes both verbose and hard to maintain.

## Connects To
- **Ch 2 (Data Ingestion Patterns)**: Error handling is the next step after the ingestion cycle; these patterns build on how data was ingested.
- **Ch 4 (Idempotency Patterns)**: Checkpointing and dedup give only a "feeling" of exactly-once; idempotent consumers/writers provide the real delivery guarantee.
- **Metadata Decorator**: Used by Dead-Letter to annotate failed records with failure context for post-analysis.
- **Incremental Sessionizer / Stateful Sessionizer**: Stateful downstream patterns that Dead-Letter and late-data replay can leave partial or inconsistent.
- **Event time vs. processing time**: Foundational time concepts from stream processing (Flink/Spark Structured Streaming) underpinning all late-data patterns.
