# 18: Nearby Friends

## Core Idea
Broadcast each user's location update to all online nearby friends using WebSocket connections plus a Redis pub/sub routing layer — the difference from Proximity Service is that locations are *dynamic*, so the index is replaced by a real-time message-passing fan-out.

## Design Framework / Approach
Start peer-to-peer (impractical for mobile), move to a shared backend: clients push location via persistent WebSocket; the server stores the latest location in Redis with TTL and publishes to the user's pub/sub channel; each friend's connection handler subscribes, recomputes distance, and forwards only if within radius. Then scale the Redis pub/sub cluster via consistent hashing + service discovery.

## Key Concepts & Components
- **WebSocket servers**: stateful, hold one persistent connection per client; drain connections before removing nodes.
- **Redis location cache**: `user_id → {lat, lng, ts}` with TTL = inactivity timeout (10 min); auto-purges offline users.
- **Redis pub/sub**: routing layer; one channel per user; cheap to create millions of channels; CPU (not memory) is the bottleneck (~14M forwards/sec).
- **Consistent hashing / hash ring**: shard pub/sub channels across ~100+ Redis servers by publisher's user ID.
- **Service discovery (etcd/Zookeeper)**: stores the hash ring of pub/sub servers; WebSocket servers subscribe to ring updates.
- **Client initialization**: load friends, batch-fetch their locations from cache, subscribe to each friend's channel.
- **Nearby random person (bonus)**: pool of channels keyed by geohash; subscribe to the user's grid + 8 neighbors.

## Trade-offs & Anti-patterns
- **P2P connections**: too many sockets and too much power for mobile — use a shared backend fan-out.
- **Subscribe only when friends come online**: adds subscribe/unsubscribe complexity; subscribe to all friends upfront, trade memory for simplicity.
- **Treat pub/sub cluster as stateless**: it has state (subscriber lists); resize carefully during low-traffic hours to avoid mass-resubscription storms.
- **Erlang/BEAM** is a strong alternative (one process per user) if you can hire for it.

## Key Takeaways
1. For moving locations, replace spatial indexes with pub/sub fan-out + per-connection distance checks.
2. Redis pub/sub is CPU-bound, not memory-bound — scale channels via consistent hashing.
3. TTL on the location cache is the trick that removes inactive users with no bookkeeping.

## Connects To
- **Proximity Service**: same geohash primitive, but for static businesses.
- **Design Consistent Hashing**: the hash ring used to shard pub/sub channels.
- **Metrics Monitoring**: another fan-in of high-volume updates to a time-series store.
