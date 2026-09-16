# 02: Scale From Zero To Millions Of Users

## Core Idea
Scale a system by iterating from a single server outward, adding layers (LB, replication, cache, CDN, queue, sharding) only as each bottleneck appears — never architect for scale prematurely.

## Design Framework / Approach
Evolve in order, one layer at a time:

1. **Single server** — web app + DB + cache on one box; understand DNS/IP/HTTP request flow and JSON API responses.
2. **Split web tier from data tier** — so each scales independently.
3. **Add a load balancer** — distribute traffic across web servers via private IPs; solves failover and availability of the web tier.
4. **Add database replication** — master handles writes, slaves handle reads (reads >> writes, so more slaves than masters). Improves performance, reliability, and availability.
5. **Add a cache layer** (read-through cache) — serve frequent reads from memory, offload DB.
6. **Add a CDN** — cache static assets (images, CSS, JS) at edge servers close to users.
7. **Make the web tier stateless** — move session/state data out of servers into a shared store (NoSQL/Redis) to enable autoscaling.
8. **Add multiple data centers** — geoDNS routing for locality and disaster failover.
9. **Decouple with a message queue** — producers publish, consumers process asynchronously, scaled independently.
10. **Add logging, metrics, automation** — monitor host/aggregate/business metrics; CI/CD.
11. **Scale the data tier** — vertical first, then horizontal (sharding).

## Key Concepts & Components
- **Load balancer**: evenly distributes requests across a server pool behind a public IP; enables graceful scaling and failover.
- **Database replication (master/slave)**: master takes writes; slaves take reads; a slave is promoted if the master fails.
- **Cache (read-through)**: web server checks cache first, else queries DB and populates cache; use LRU eviction and expiration.
- **CDN**: geographically dispersed edge servers caching static content; origin is web server or S3; controlled by TTL.
- **Stateless web tier**: no per-request state on servers; state lives in a shared store so any server can serve any request (vs. sticky sessions).
- **Message queue**: durable in-memory buffer for asynchronous, decoupled producer/consumer communication.
- **Sharding**: split a DB into shards sharing one schema with unique data per shard; route by sharding key (e.g. `user_id % N`).
- **Sharding key / partition key**: column(s) determining data distribution; must distribute data evenly.
- **geoDNS**: resolves a domain to IPs based on user location for routing to nearest data center.

## Trade-offs & Anti-patterns
- **Vertical scaling**: simple but has hard limits, no failover/redundancy, and high cost for powerful machines.
- **Sticky sessions / stateful servers**: every request must hit the same server — hard to add/remove servers and to handle failures.
- **Cache consistency**: cache and DB are not in a single transaction; stale reads occur. Keep TTL balanced (too short = DB thrash; too long = staleness).
- **Single cache/DB server**: a single point of failure (SPOF) — replicate across data centers.
- **Sharding pitfalls**: resharding is painful when a shard exhausts; the **celebrity/hotspot key problem** overloads one shard; cross-shard joins are hard, so de-normalize.

## Key Takeaways
1. Keep the web tier stateless and build redundancy at every tier before adding new tiers.
2. Cache as much as you can; shift static assets to a CDN to cut latency and DB load.
3. Decouple components with message queues and shard the data tier only after other layers stop helping.

## Connects To
- **03-back-of-the-envelope-estimation**: estimate capacity before choosing a scaling path.
- **05-design-a-rate-limiter**: caching/Redis and middleware patterns recur here.
- **06-design-consistent-hashing**: fixes resharding pain from naive `hash % N` sharding.
- **07-design-a-key-value-store**: the shared state store for a stateless tier.
