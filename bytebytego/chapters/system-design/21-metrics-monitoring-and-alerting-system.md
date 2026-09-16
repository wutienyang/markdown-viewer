# 21: Metrics Monitoring and Alerting System

## Core Idea
A time-series pipeline — collect, transmit (Kafka), store (time-series DB), alert, visualize — where the key decisions are pull vs push collection, a dedicated time-series database, and downsampling for retention.

## Design Framework / Approach
Model metrics as time series (name + labels + timestamped values). Collect from 1000 pools × 100 machines ≈ 10M metrics; ingest through Kafka to decouple collectors from the DB; store in a time-series DB (InfluxDB/Prometheus) with index-on-labels; serve dashboards/alerts through a query service; downsample raw→1-min→1-hour to hit 1-year retention.

## Key Concepts & Components
- **Pull vs push**: pull (Prometheus) — easy debugging, health check, authentic; push (CloudWatch/Graphite) — short-lived jobs, firewalls, UDP; a large org often supports both.
- **Service discovery (etcd/Zookeeper)**: tells pull collectors which endpoints to scrape; consistent hashing assigns each server to one collector to avoid duplicate pulls.
- **Collection agent**: local aggregation of counters before push; buffers on collector backpressure.
- **Kafka**: decouples collection from processing, prevents loss when the DB is down; partition by metric name/tags.
- **Time-series DB**: specialized (InfluxDB/Prometheus) with label indexes, custom query language (Flux), built-in compression; 85% of queries hit data <26h old.
- **Downsampling / rollup**: 10s→1m→1h resolution tiers; delta-encoding + cold storage cut storage cost.
- **Alert manager**: evaluates rules (YAML), dedupes/merges alerts, retries via a KV alert store, pushes through Kafka to channels.
- **Aggregation points**: agent (simple), ingestion pipeline (stream processing, loses raw), query side (no loss, slower).

## Trade-offs & Anti-patterns
- **General-purpose DB for time-series**: SQL moving averages are unwieldy and heavy-write workloads don't perform — use a purpose-built TSDB.
- **Building your own query service / alerting / visualization**: Grafana + off-the-shelf alerting are usually better; justify buy-vs-build.
- **Kafka is optional**: Gorilla (Facebook) stays write-available without a queue; be ready to defend adding Kafka.
- **Aggregating at ingestion**: cuts write volume but loses raw data and precision — weigh against query-time aggregation.

## Key Takeaways
1. Pick a time-series DB with label indexing; don't hand-roll storage.
2. Downsample aggressively (resolution tiers + cold storage) — that's how you afford 1-year retention.
3. Kafka is the safety net that prevents data loss when storage is unavailable.

## Connects To
- **Distributed Message Queue**: Kafka is the transmission backbone.
- **Ad Click Event Aggregation**: another Kafka + streaming + aggregation pipeline.
- **Google Maps**: location data follows the same collect→Kafka→consumer pattern.
