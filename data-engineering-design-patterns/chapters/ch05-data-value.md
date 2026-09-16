# Chapter 5: Data Value Design Patterns

## Core Idea
Raw ingested data is rarely a real asset; data value patterns augment a dataset to make it more useful for end users — either by adding context (enrichment/decoration) or by reducing it into a more understandable form (aggregation/sessionization/ordering).

## Frameworks Introduced
- **Static Joiner**: enrich an at-rest or streaming dataset by joining it to a static (slowly changing) reference dataset on a keyed condition, optionally with time constraints via SCD.
  - When to use: your reference/enrichment dataset is static or slow-moving, and you need to combine it with a more dynamic dataset (e.g. users profile onto visits).
  - How: identify the join key(s); add a time condition (`NOW() BETWEEN start_date AND end_date`) when the reference implements SCD type 2 or 4; materialize API-exposed data as a table when idempotency matters.

- **Dynamic Joiner**: join two in-motion (streaming) datasets by adding time boundaries and a time-bounded buffer with a GC watermark.
  - When to use: both datasets are streams (e.g. users via CDC and visits), and the two sides can arrive with different latencies.
  - How: define keys and join method, then add a time condition; buffer unmatched records on the faster stream until the slower one catches up; GC watermark evicts records older than the oldest event time to bound buffer size.

- **Wrapper**: add an extra envelope at the record level that separates original (raw) values from computed/technical attributes.
  - When to use: you must keep the original record untouched for debugging while exposing computed values (business or execution-context) to downstream consumers.
  - How: wrap input in a struct with `raw` and `computed` sections; in structured data, implement as nested columns, flat columns, or a separate joinable table.

- **Metadata Decorator**: hide technical/execution context (job version, processing time) in the metadata layer of the data store rather than in the record itself.
  - When to use: you need operational visibility (e.g. which job version produced a row) but the information is irrelevant/confusing to end users.
  - How: use native metadata (Kafka headers, object-store tags); for tables, use a dedicated column exposed via a view/permissions or a separate technical table joined by a context id.

- **Distributed Aggregator**: aggregate records spread across a cluster by grouping and reducing, accepting a shuffle (network exchange) to collocate related rows.
  - When to use: the dataset is too large for one machine and related rows may live on different nodes.
  - How: group by key, then reduce; a shuffle exchanges records across the network (visible as `Exchange hashpartitioning`); mitigate skew with salting and reduce shuffling via partial/local aggregation.

- **Local Aggregator**: aggregate without a shuffle by relying on fixed input partitioning so all rows for a grouping key already reside in the same partition.
  - When to use: data source partitioning is static, the partition count is immutable, and related records are colocated — or the dataset fits in a single machine.
  - How: guarantee the producer writes a key to one physical partition; consume with `groupByKey` (Kafka Streams), `mapPartitions`/`foreachPartition` (Spark), or bucketed/clustered/distributed storage (Redshift DISTKEY).

- **Incremental Sessionizer**: build sessions in batch by carrying pending (in-flight) sessions forward across executions using three storage spaces.
  - When to use: events are stored in time partitions and a single session can span multiple consecutive partitions (batch, hourly latency acceptable).
  - How: keep input storage, completed-sessions storage, and private pending-sessions storage; each run merges prior pending sessions with new data, then classifies into init/accumulate/finalize states; write finished sessions publicly and pending sessions back.

- **Stateful Sessionizer**: build sessions in near-real-time streams using a state store that persists in-flight sessions.
  - When to use: stakeholders need sessions at sub-hour (near real time) latency; stateless streaming won't work.
  - How: state store plays the pending-sessions role; use session windows (gap duration) or arbitrary stateful processing (`applyInPandasWithState`, `mapWithState`); checkpoint state to fault-tolerant storage; expire state on event time.

- **Bin Pack Orderer**: guarantee ordered delivery through bulk APIs by grouping each entity's sorted events into isolated bins so retries/partial commits stay local to one key.
  - When to use: you must deliver records in order per entity to a data store with partial commit semantics (Kinesis `PutRecords`, DynamoDB `BatchWriteItem`, Elasticsearch bulk).
  - How: sort by grouping key then event time; pack rows into bins containing a single grouping key; emit bins sequentially, holding the next bin until the current one is fully written.

- **FIFO Orderer**: deliver records first-in, first-out with a simple send-and-acknowledge loop, using single-record writes or bulk APIs with concurrency limited to one.
  - When to use: you need per-record ordering as soon as possible but can tolerate low throughput / high I/O overhead (low latency and volume, or relaxed constraints).
  - How: issue one delivery request per record and await acknowledgment before the next; with Kafka use `flush()` per record or set `max.in.flight.requests.per.connection=1` / idempotent producer (up to 5); use Kinesis `PutRecord` with `SequenceNumberForOrdering` or Pub/Sub `ordering_key`.

## Key Concepts
- **Slowly changing dimensions (SCD)**: data modeling strategy for slowly evolving reference datasets that tracks an entity's evolution over time (type 2 = validity dates; type 4 = current + history tables).
- **Sessionization**: combining events related to the same activity (a start, session events, and an end) into a single session record.
- **Aggregation**: reducing many records into summary statistics (count, average) across grouping axes.
- **Envelope**: the abstraction added by the Wrapper pattern that holds original values alongside computed attributes.
- **Watermark**: the mechanism bounding how late events may arrive and driving buffer/state garbage collection.
- **GC watermark**: the component that evicts too-old buffered records from a dynamic join or state store.
- **Shuffle**: the network exchange that moves records between nodes so a reduce can operate on collocated rows; a primary latency/scaling cost in distributed aggregation.
- **Data skew**: unbalanced key distribution where one key has far more occurrences, making its network move and single-node processing the bottleneck.
- **Partial commits**: bulk-write semantics with a third outcome (partially successful) that can break ordering because which records failed is unknown.
- **Ordering guarantee**: ensuring records are delivered chronologically per entity, required for use cases like fleet tracking or session streams.

## Mental Models
- Use Static Joiner when your enrichment dataset is static or slow-moving and you need keyed context (with SCD for time sensitivity).
- Use Dynamic Joiner when both datasets are in motion and you accept a space-vs-exactness trade-off for join completeness.
- Use Distributed Aggregator when data spans many nodes; use Local Aggregator when partitioning already colocates each key.
- Use Bin Pack Orderer when the target store has partial commit semantics; use FIFO Orderer when simplicity beats throughput.

## Anti-patterns
- **Relying on real time as a session key or expiration basis**: real time differs across restarts, breaking idempotency (and processing-time expiration can expire sessions too early under latency).
- **Putting business attributes in the metadata layer**: they stay hidden from consumers who only query the data part.
- **Treating partial sessions as final**: downstream consumers may act on a "not at risk" state that a later partition flips to "risky".
- **Expecting FIFO to deliver exactly-once**: send-then-ack can lose the ack after a successful send, causing duplicates on retry.
- **Skipping SCD/materialization for time-sensitive API joins**: non-idempotent enrichment yields different results on replay.

## Code Examples
```python
grouped_visits = (visits_from_kafka.withWatermark('event_time', '1 minute')
    .groupBy(F.col('visit_id')))
visited_pages_type = ArrayType(StructType([
    StructField("page", StringType()),
    StructField("event_time_as_ms", LongType())]))
sessions = grouped_visits.applyInPandasWithState(
    func=map_visits_to_session,
    outputStructType=StructType([...]),
    stateStructType=StructType([
        StructField("visits", visited_pages_type),
        StructField("user_id", StringType())]),
    outputMode="update",
    timeoutConf="EventTimeTimeout"
)
```
- **What it demonstrates**: the declarative Stateful Sessionizer in PySpark — watermark, grouping key, output/state schemas, and event-time state expiration.

```sql
SELECT v.visit_id, v.event_time, v.page, u.id, u.login, u.email
FROM dedp.visits v
JOIN dedp.users u
  ON u.id = v.user_id
 AND NOW() BETWEEN start_date AND end_date;
```
- **What it demonstrates**: Static Joiner with SCD type 2 — the validity-date join condition for a slowly changing reference.

```python
dataset.withColumn('salt', (rand()*3).cast("int"))
    .groupBy('group_key', 'salt').agg(...)
    .groupBy('group_key').agg(...)
```
- **What it demonstrates**: salting a skewed grouping key to spread hot keys across nodes before re-aggregating.

```python
def write_records_to_kinesis(output_stream, visits_rows):
    producer = boto3.client('kinesis')
    delivery_groups = []
    groups_index = 0
    last_visit_id = None
    for visit in visits_rows:
        if visit.visit_id != last_visit_id:
            last_visit_id = visit.visit_id
            groups_index = 0
        if len(delivery_groups) <= groups_index:
            delivery_groups.append([])
        delivery_groups[groups_index].append(visit)
        groups_index += 1
```
- **What it demonstrates**: Bin Pack Orderer — resetting the bin position each time the grouping key changes so each bin holds a single `visit_id`.

## Reference Tables

### Static Joiner vs Dynamic Joiner
| | Static Joiner | Dynamic Joiner |
|---|---|---|
| Data motion | at-rest (batch) or static ref | both in motion (streams) |
| Key join condition | key only (plus optional SCD time) | key + time boundaries |
| Latency handling | orchestration waits (Readiness Marker) | time-bounded buffer + GC watermark |
| Extra cost | idempotency/SCD effort | buffer space (space vs exactness) |
| Missed joins | late ref data | GC eviction of late records |

### Distributed vs Local Aggregator
| | Distributed Aggregator | Local Aggregator |
|---|---|---|
| Network exchanges | input read + shuffle | input read only |
| Requirement | none (works for split data) | fixed partitioning + immutable partition count |
| Scaling | easier (framework handles) | requires stop-the-world reorg |
| Grouping key | per-consumer | one key logic for all consumers |
| Tools | Spark groupBy, MapReduce | Kafka Streams groupByKey, mapPartitions, Redshift DISTKEY |

### Incremental vs Stateful Sessionizer
| | Incremental Sessionizer | Stateful Sessionizer |
|---|---|---|
| Processing mode | batch (orchestrated) | streaming |
| Latency | hourly (partition-bound) | near real time |
| In-flight storage | private pending-sessions storage | state store (memory + checkpoint) |
| Expiration | expiration_batch_id (data field) | event-time / watermark timeout |
| Backfill | cascades to all later partitions | state rebalancing on scaling |

### Bin Pack Orderer vs FIFO Orderer
| | Bin Pack Orderer | FIFO Orderer |
|---|---|---|
| Delivery | bulk requests, per-entity bins | one record per request (or concurrency=1 bulk) |
| Partial commits | tolerated (bins isolate retries) | must avoid (needs full-commit store) |
| Throughput | high | low (I/O overhead) |
| Complexity | custom sort + bin logic | simple send + ack |
| Guarantee | ordering within one execution | FIFO (not exactly-once) |

## Worked Example
A blog analytics platform ingests visit events into a streaming broker and exposes embedded-page visits to partners via an external API backed by Kinesis (partial commit semantics). The sync job builds 10-minute processing windows with per-minute aggregates and must deliver events per partner in event-time order. To avoid out-of-order writes from retries: (1) `sortWithinPartitions(['visit_id', 'event_time'])` orders rows locally without a shuffle; (2) `write_records_to_kinesis` iterates rows, incrementing a `groups_index` per record but resetting it to 0 whenever `visit_id` changes, packing events into delivery bins that each contain only one `visit_id`; (3) bins are emitted sequentially to Kinesis, holding the next bin until the current one is fully written — so a retry stays local to one visit and never interleaves with another entity's records.

## Key Takeaways
1. Adding value means either adding context (enrichment/decoration) or reducing data (aggregation/sessionization) — both serve understandability.
2. Static vs Dynamic Joiner is fundamentally a data-motion decision: at-rest references need SCD for time sensitivity; streaming joins need watermarks and time-bounded buffers.
3. The shuffle is the core cost of Distributed Aggregator; Local Aggregator removes it but demands immutable partitioning and sacrifices scaling flexibility.
4. Sessionization is forward-dependent: one session impacts the next, so backfills cascade and partial sessions must be flagged (`is_completed=false`).
5. Metadata is "data about data" and should stay hidden from business users; the Wrapper is for values consumers should see.
6. Ordering is hardest under partial commit semantics — Bin Pack Orderer isolates retries per entity; FIFO Orderer trades I/O overhead for simplicity and never guarantees exactly-once.
7. Idempotency and event-time reasoning (not real time) are the recurring guardrails across enrichment, sessionization, and ordering.

## Connects To
- **Ch 2 (Readiness Marker)**: batch Static Joiner waits for the enrichment dataset via readiness markers instead of watermarks.
- **Ch 3 (Late Data Detector / late data)**: dynamic joins and sessionizers rely on watermarks and late-data handling learned there.
- **Ch 4 (idempotency patterns)**: FIFO ordering's exactly-once gap is closed by Chapter 4's idempotency patterns.
- **Ch 8 (Bucket pattern)**: Spark bucketing avoids shuffle and underpins the Local Aggregator's static partitioning.
- **Ch 9 (schema consistency / Fine-Grained Accessor for Tables)**: Wrapper schema management and Metadata Decorator column access control.
- **MapReduce**: Distributed Aggregator is a textbook MapReduce model (Hadoop disk-based → Spark memory-first).
