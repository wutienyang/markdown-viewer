# Chapter 8: Data Storage Design Patterns

## Core Idea
Organize the physical layout of data to reduce processing latency and cost, both by shrinking the volume of data read (partitioning, bucketing, sorting, metadata skipping) and by choosing a representation that trades consistency for query speed (normalization vs. denormalization).

## Frameworks Introduced
- **Horizontal Partitioner**: divide a dataset into physically isolated storage spaces, one per value of a *distribution key*, so queries read only the relevant partition.
  - When to use: incremental processing that touches only a portion of the data (e.g. rolling last-four-days aggregates), or attributes with low cardinality such as event time rounded to hour/day or business keys (customer ID, region).
  - How: pick a partitioning attribute; time can come from the *job execution context* (same value for every record in the run) or the *dataset's event time* (may hold late data across partitions). Declare partitions declaratively (`CREATE TABLE ... PARTITIONED BY`) or from the producer (Spark `partitionBy`, Kafka custom partitioner). Combine into nested schemas (e.g. `event_time/country`). Low-cardinality keys only — high cardinality produces millions of tiny partitions and slow listing.

- **Vertical Partitioner**: split each row and write its parts to different locations (tables/files), instead of moving the whole row.
  - When to use: a dataset with mutable attributes (visit time, page) alongside immutable ones (IP address) that should be stored once per entity, or when different retention/access policies must apply to different column groups.
  - How: classify attributes into groups, identify a join key (e.g. `visit_id`) to recombine them, then write each group to a dedicated location. Enables distinct retention/security policies per column group; requires producers to implement row-splitting and multiple writes.

- **Bucket**: colocate groups of rows with different values in the same storage area using modular hashing `hash(key) % number_of_buckets`.
  - When to use: a high-cardinality attribute is frequently used in query predicates (80% of operations) and cannot be a partition key without blowing up metadata.
  - How: choose bucket column(s) (secondary grouping keys under a partition), set bucket count based on key cardinality, then declare it (Spark `bucketBy`, Hive `CLUSTERED BY ... INTO N BUCKETS`). Enables bucket pruning for predicates and shuffle elimination on identical-bucket JOINs.

- **Sorter**: presort records on disk so the query engine can skip irrelevant data blocks via per-block metadata.
  - When to use: you know the columns users filter or sort by (e.g. `event_time`) and want faster reads without changing your idempotency/partitioning strategy.
  - How: identify the sorting column(s), declare them at table creation (`CLUSTER BY` in BigQuery), or use curved sorts (Delta Lake `OPTIMIZE ... ZORDER BY`, Iceberg Z-order, Redshift interleaved sort keys) to colocate multi-column x-dimensional space.

- **Metadata Enhancer**: collect and persist statistics about stored records so the engine filters out irrelevant files/rows before loading them.
  - When to use: queries filter a small subset of rows from large partitions, and you want to apply filtering *before* loading data into the query engine.
  - How: store per-file statistics in columnar format footers (Parquet min/max, null counts), or table/column stats in a separate table the planner reads; keep stats fresh (`ANALYZE TABLE`) to avoid stale execution plans.

- **Dataset Materializer**: materialize a costly query/combination of datasets into a physical table or materialized view.
  - When to use: the same expensive query (shuffle/CPU-heavy, or a view over many partitioned tables) is run repeatedly and latency hurts consumers.
  - How: identify datasets to materialize, write the SELECT/UNION/JOIN, and store it as a materialized view (manual or auto-refresh, e.g. BigQuery/Redshift) or a table (you control refresh, gain access to partitioning/bucketing/sorting). Prefer incremental refresh (MERGE with a watermark column) for insert-only workloads.

- **Manifest**: pre-record the list of files so readers skip costly object-store listing.
  - When to use: many files in an object store make listing slow (many API calls), or many readers share a dataset (Fan-Out), or you need idempotent loads.
  - How: table formats (Delta Lake, Iceberg, Hudi) write file lists to a commit log automatically; otherwise generate a manifest file (`generate('symlink_format_manifest')`) or hand-build one (Redshift `COPY ... MANIFEST`). Watch manifest size with many small files or streaming producers.

- **Normalizer**: represent each piece of information exactly once to favor consistency.
  - When to use: transactional/write-heavy workloads, or when duplicated immutable attributes cause storage bloat and slow updates.
  - How: use normal forms (1NF: atomic values + primary key; 2NF: non-key columns depend on the whole PK; 3NF: no transitive dependencies between non-key columns) or the snowflake schema (fact table + nested dimensions). Design process: define entities → describe attributes → define relationships.

- **Denormalizer**: flatten joined tables into a single row (or nested STRUCT) to eliminate joins.
  - When to use: analytical/read-heavy workloads where joins over many tables dominate query time (e.g. joining 8 tables in 80% of queries).
  - How: flatten values as regular top-level columns (One Big Table) or as nested structures (STRUCT), or use the star schema (fact + single-level dimensions). Often built on top of a Normalizer model, synced via Chapter 6 sequence patterns.

## Key Concepts
- **Partitioning (horizontal)**: storing rows with the same partition key value in one physically isolated location.
- **Bucketing**: modular-hash (`hash(key) % N`) grouping of records into fixed buckets, enabling pruning and shuffle-free joins.
- **Sorting / Z-order**: ordering records on disk (lexicographic or space-filling curved) so irrelevant data blocks can be skipped via metadata.
- **Distribution key**: the attribute used to decide a record's physical location.
- **Data skew**: uneven distribution across partitions; a skewed partition blocks the whole microbatch until drained (mitigate with a backpressure buffer).
- **Metadata footer**: per-file column statistics (min/max/null count) in columnar formats like Parquet used for data skipping.
- **Materialized view**: a persisted query result, refreshed manually or automatically (auto-refresh is workload-dependent, not immediate).
- **Manifest**: a file listing the data files of a dataset, produced once to avoid repeated listing.
- **Normal forms (1NF/2NF/3NF)**: rules eliminating repeating groups, partial, and transitive dependencies respectively.
- **One Big Table**: a fully denormalized table flattening referential data into single rows.

## Mental Models
- Use Horizontal Partitioner when filtering on a low-cardinality attribute like event time rounded to the hour/day.
- Use Bucket when the hot query attribute has high cardinality (user ID) and can't be a partition key.
- Use Sorter when you know which columns users sort/filter by and want to skip data blocks.
- Use Denormalizer when joins dominate query cost and consistency can be traded for read speed.

## Anti-patterns
- **Partitioning on high-cardinality keys (user ID, IoT device ID)**: creates millions of tiny partitions and small files, slowing listing and reads — use Bucket instead.
- **Static partition keys changed in place**: repartitioning requires moving already-written data; prefer a store that supports partition evolution at the metadata layer (Iceberg).
- **Composite lexicographical sort keys queried out of order**: filtering only on a later sort column forces the engine to scan most blocks — reference preceding sort columns, or use Z-order.
- **Stale statistics**: out-of-date column stats drive suboptimal execution plans; refresh manually (`ANALYZE TABLE`) when thresholds aren't met.
- **One Big Table without domain logic**: flattening unrelated attributes (favorite color + past orders + current visit) turns it into an opaque "trash bag" — if you can't name the table without conjunctions, it's too broad.

## Code Examples
```python
partitioned_users = (input_users
    .withColumn('year', functions.year('change_date'))
    .withColumn('month', functions.month('change_date'))
    .withColumn('day', functions.day('change_date'))
    .withColumn('hour', functions.hour('change_date')))

(partitioned_users.write.mode('overwrite').format('delta')
    .partitionBy('year', 'month', 'day', 'hour').save(output_dir))
```
- **What it demonstrates**: Horizontal Partitioner via Spark — derive granular time columns, then `partitionBy` writes year/month/day/hour directory layout.

```sql
MERGE INTO dedp.visits_counter AS target
USING (
  SELECT user_id, COUNT(*) AS visits
  FROM dedp.visits
  WHERE insertion_time > '2024-11-09T03:27:32'
  GROUP BY user_id
) AS input
ON target.user_id = input.user_id
WHEN MATCHED THEN UPDATE SET count = count + input.visits
WHEN NOT MATCHED THEN INSERT (user_id, count) VALUES (input.user_id, input.visits)
```
- **What it demonstrates**: incremental Dataset Materializer — a watermark on `insertion_time` merges only new rows (Incremental Loader + Merger combined).

## Reference Tables
**Horizontal vs. Vertical Partitioner**

| | Horizontal Partitioner | Vertical Partitioner |
|---|---|---|
| Unit of split | whole rows | individual attributes of a row |
| Heuristic | low-cardinality key value | mutable vs. immutable attribute groups |
| Result | row moved fully to one location | row split across locations, recombined by join key |
| Typical key | event time, business key | `visit_id` |

**Normalizer vs. Denormalizer**

| | Normalizer | Denormalizer |
|---|---|---|
| Goal | data consistency, no duplication | read speed, fewer/no joins |
| Update cost | low (one place to change) | high (many duplicated rows) |
| Query cost | high (many JOINs, network shuffle) | low (flattened single table) |
| Implementations | 1NF/2NF/3NF, snowflake schema | One Big Table, star schema |
| Storage | minimal duplication | repeated values (mitigate with dictionary encoding) |

## Worked Example
In the blog data-analytics case study, the `visits` dataset carries both mutable attributes (visit time, visited page) and immutable ones (device name, OS, version). Applying the **Vertical Partitioner** pattern, the row is classified into two groups and the `visit_id` is chosen as the join key. The job then writes the mutable visit context to one table and extracts the user/technical context into two dedicated tables, using `persist()` to avoid a double read and `dropFields`/`selectExpr` to shape the columns:

```python
visits = spark_session.read.schema(visit_schema).json(input_location)
visits.persist()
visits_without_user_technical_context = (visits.drop('user_id')
    .withColumn('context', F.col('context').dropFields('user'))
    .withColumn('context', F.col('context').dropFields('technical')))
visits_without_user_technical_context.write.format('delta').save(output_dir)
(visits.selectExpr('visit_id', 'context.user.*', 'user_id').dropDuplicates()
    .write.format('delta').save(get_delta_users_table_dir()))
(visits.selectExpr('visit_id', 'context.technical.*').dropDuplicates()
    .write.format('delta').save(get_delta_technical_table_dir()))
visits.unpersist()
```
This stores immutable user/technical attributes once per visit, cutting duplication, while the mutable visit table remains lean — at the cost of producers implementing row-splitting logic and consumers joining via `visit_id` (optionally exposed through a Dataset Materializer view).

## Key Takeaways
1. Partitioning is the first optimization, but only for low-cardinality keys; high cardinality breaks it via many small files and slow listing.
2. Bucketing is partitioning's high-cardinality counterpart, and identical bucketing on both sides eliminates network shuffle in JOINs.
3. Sorting (including Z-order curved sorts) lets the engine skip data blocks using per-block metadata rather than scanning everything.
4. Metadata footers and commit-log stats reverse the load-then-filter order — filter first, load only what's relevant.
5. Materializing costly queries trades storage and refresh cost for fast, repeated reads; incremental refresh fits insert-only workloads.
6. Manifests move file listing from every read to a single write-time (or format-managed) step, critical for object stores and idempotent loads.
7. Normalizer favors consistency (fewer updates, more joins) and Denormalizer favors speed (fewer joins, costly updates and duplication); they compose — build a denormalized One Big Table on top of a normalized snowflake.

## Connects To
- **Ch 4 (Idempotency)**: partitioning enables the Fast Metadata Cleaner pattern; Redshift manifests make `COPY` idempotent.
- **Ch 5 (Static Joiner)**: SCD techniques mitigate time-sensitive dimensions that arise in normalized models.
- **Ch 6 (Sequence patterns)**: keep Normalizer and Denormalizer models in sync; manifests help Fan-Out readers.
- **Ch 7 (Access Design)**: Vertical Partitioner here is the storage specialization of the security-oriented Vertical Partitioner.
- **Distributed Aggregator**: bucketing's shuffle elimination directly addresses the network exchange cost of distributed joins.
- **Compactor (small files problem)**: too many horizontal partitions create the small-files problem the Compactor resolves.
