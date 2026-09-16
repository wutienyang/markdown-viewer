# 08: Design A Unique ID Generator In Distributed Systems

## Core Idea
Generate unique, 64-bit, time-sortable IDs at high throughput without a single database — the Twitter snowflake layout (timestamp + datacenter + machine + sequence) is the canonical solution.

## Design Framework / Approach
1. Clarify requirements: unique + sortable by time, numeric, 64-bit, ≥10k IDs/sec.
2. Evaluate candidate schemes:
   - **Multi-master replication** — `auto_increment` by k (server count).
   - **UUID** — 128-bit, generated independently per server.
   - **Ticket server** — centralized `auto_increment`.
   - **Snowflake** — bit-packed 64-bit ID.
3. Adopt snowflake: **sign bit (1) + timestamp (41) + datacenter ID (5) + machine ID (5) + sequence (12)**.
4. Deep dive: timestamp overflow horizon, sequence reset per millisecond, clock sync, high availability.

## Key Concepts & Components
- **Snowflake 64-bit layout**: 1 sign bit (0) · 41-bit timestamp (ms since custom epoch) · 5-bit datacenter ID (32) · 5-bit machine ID (32) · 12-bit sequence (4096/ms).
- **Custom epoch**: choosing an epoch near today (e.g. Twitter's `1288834974657`) delays overflow; 41 bits ≈ 69 years.
- **Sequence number**: increments per ID, resets to 0 each millisecond; supports up to 4096 IDs/ms per machine.
- **Datacenter/machine IDs**: fixed at startup; accidental change risks ID collisions.
- **UUID**: 128-bit, no coordination, but too long and non-sortable by time for our requirements.
- **Ticket server**: numeric and simple, but a single point of failure.

## Trade-offs & Anti-patterns
- **`auto_increment` in distributed systems**: a single DB can't scale and cross-DB uniqueness is hard.
- **Multi-master replication**: IDs don't grow with time; poor scaling across data centers and on server add/remove.
- **UUID**: violates the 64-bit, time-sortable, numeric constraints.
- **Clock synchronization**: assumes synchronized clocks; NTP is the common mitigation.

## Key Takeaways
1. Prefer snowflake-style bit-packed IDs when you need numeric, time-sortable, 64-bit IDs at scale.
2. Tune section lengths to the workload (more timestamp bits for low-concurrency/long-term; more sequence bits for bursty).
3. Treat the ID generator as mission-critical — make it highly available and protect datacenter/machine IDs.

## Connects To
- **07-design-a-key-value-store**: IDs serve as keys.
- **09-design-a-url-shortener**: base-62 conversion of these IDs produces short URLs.
- **13-design-a-chat-system**: snowflake or local IDs order chat messages.
