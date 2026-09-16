# 06: Design Consistent Hashing

## Core Idea
Consistent hashing maps servers and keys onto a hash ring so that adding/removing a server remaps only ~k/n keys instead of nearly all — the standard fix for horizontal scaling's rehashing problem.

## Design Framework / Approach
1. Identify the **rehashing problem**: `hash(key) % N` remaps almost every key when N changes.
2. Map servers (by IP/name) and keys onto a **hash ring** (e.g. SHA-1 space, 0 to 2¹⁶⁰ − 1).
3. **Lookup**: go clockwise from a key's position to the first server encountered.
4. **Add/remove server**: only keys in the arc between the changed node and its predecessor move.
5. Fix uneven partitions with **virtual nodes / replicas**.
6. Find affected keys: walk anticlockwise from the added/removed node to the previous server.

## Key Concepts & Components
- **Hash ring**: circular hash space; both servers and keys are hashed onto it (no modulo).
- **Server lookup**: clockwise from key position to first server/virtual node.
- **Virtual nodes (replicas)**: each server represented by many points on the ring, smoothing partition sizes and key distribution.
- **Standard deviation**: with ~100–200 virtual nodes, distribution spread drops to 5–10% of the mean; more nodes = better balance but more memory.
- **Affected range**: the ring segment between a new/removed node and the previous server going anticlockwise.

## Trade-offs & Anti-patterns
- **Naive `hash % N`**: works only with a fixed pool; any change storms cache misses.
- **Basic ring without virtual nodes**: partitions become uneven and keys cluster on few servers.
- **More virtual nodes**: better balance, but costs storage for node metadata — tune per requirement.

## Key Takeaways
1. Prefer consistent hashing over `hash % N` whenever servers can be added or removed.
2. Add virtual nodes to balance load and mitigate the hotspot key problem.
3. Real-world users: Amazon Dynamo, Apache Cassandra, Discord, Akamai CDN, Google Maglev.

## Connects To
- **02-scale-from-zero-to-millions-of-users**: replaces `user_id % N` sharding to ease resharding.
- **07-design-a-key-value-store**: primary data-partitioning technique.
- **10-design-a-web-crawler**: distributes load across downloader servers.
- **12-design-a-news-feed-system**: mitigates the hotkey problem in fanout.
