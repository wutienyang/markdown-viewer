# 05: Design A Rate Limiter

## Core Idea
A rate limiter throttles API requests per client/rule using an in-memory counter store (Redis) and a chosen algorithm, returning HTTP 429 when the limit is exceeded.

## Design Framework / Approach
1. Clarify scope: server-side vs client, throttle by IP/user/rule, scale, distributed or not, whether to inform throttled users.
2. Pick placement: server-side middleware or API gateway (vs. unreliable client-side).
3. Choose the algorithm to match burst behavior.
4. Store counters in an in-memory cache (Redis) using **INCR** + **EXPIRE**, not a database.
5. Deep dive: rules storage, 429 handling + headers, distributed concerns (race conditions, sync), performance, monitoring.

## Key Concepts & Components
- **Token bucket**: fixed capacity; tokens refill at a rate; each request consumes a token; allows short bursts. Params: bucket size, refill rate.
- **Leaking bucket**: FIFO queue drained at a fixed outflow rate; requests over capacity are dropped; smooth but bursty traffic fills the queue with old requests.
- **Fixed window counter**: counter per fixed time window; simple but lets twice the quota through at window edges.
- **Sliding window log**: store timestamps (Redis sorted sets), evict outdated ones; accurate but memory-heavy.
- **Sliding window counter**: hybrid — current window count + weighted previous window count; smooths spikes, approximate but ~0.003% error.
- **HTTP 429** + headers: `X-Ratelimit-Remaining`, `X-Ratelimit-Limit`, `X-Ratelimit-Retry-After`.
- **Distributed challenges**: race conditions (solve with Lua script or Redis sorted sets, not locks) and synchronization (use a centralized store like Redis, not sticky sessions).

## Trade-offs & Anti-patterns
- **Client-side rate limiting**: easily forged, no control over client — never rely on it for enforcement.
- **Database for counters**: disk access too slow; use in-memory store with time-based expiration.
- **Sticky sessions for sync**: not scalable/flexible; prefer a centralized data store.
- **Locks for race conditions**: significantly slow the system.
- **Hard vs soft limiting**: hard = never exceed threshold; soft = allow brief exceedance.

## Key Takeaways
1. Use the token bucket for burst-tolerant APIs; prefer sliding window counter when you need accuracy with low memory.
2. Centralize counters in Redis and handle race conditions with Lua scripts/sorted sets.
3. Return 429 with rate-limit headers so clients can back off gracefully.

## Connects To
- **02-scale-from-zero-to-millions-of-users**: Redis cache + middleware patterns.
- **07-design-a-key-value-store**: eventual consistency of replicated counters.
- **09-design-a-url-shortener**: URL shortener wraps rate limiting to block abuse.
- **11-design-a-notification-system**: rate limiting caps notifications per user.
